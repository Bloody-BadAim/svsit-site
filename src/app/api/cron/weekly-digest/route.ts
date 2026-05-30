import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { render } from '@react-email/components'
import { createServiceClient } from '@/lib/supabase'
import WeeklyDigestEmail from '@/emails/weeklyDigestEmail'

// ─── SMTP transport (same setup as lib/email.ts) ─────────────────────────────

function getSmtpTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// ─── Fun facts (rotated weekly) ──────────────────────────────────────────────

const FUN_FACTS = [
  'De eerste computer bug was een echte mot - gevonden in 1947 in een Harvard Mark II.',
  'Git is vernoemd naar Linus Torvalds zelf: "git" is Brits slang voor een onaardig persoon.',
  'Het eerste computerprogramma is geschreven door Ada Lovelace in 1843.',
  'De naam Wi-Fi betekent eigenlijk niks - het was bedacht als marketingterm.',
  'De gemiddelde developer schrijft ~100 regels productie-code per dag.',
  'Het @ symbool werd al in de 6e eeuw gebruikt door monniken als afkorting voor "ad".',
  'JavaScript is in 10 dagen geschreven door Brendan Eich in 1995.',
  'De eerste website staat nog online: info.cern.ch - gemaakt door Tim Berners-Lee.',
  'Stack Overflow krijgt 100+ miljoen unieke bezoekers per maand.',
  'De eerste 1GB harde schijf woog meer dan 250 kilo en kostte $40.000 in 1980.',
  'SIT is opgericht door studenten HBO-ICT aan de HvA - voor studenten, door studenten.',
  'Python is vernoemd naar Monty Python, niet naar de slang.',
  'De Ctrl+Alt+Delete combinatie was oorspronkelijk bedoeld als debug-tool, niet als reboot.',
  'Er zijn meer dan 700 programmeertalen in actief gebruik wereldwijd.',
  'De eerste e-mail ooit verstuurd was in 1971 - de inhoud was "QWERTYUIOP".',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getVoornaam(email: string): string {
  const local = email.split('@')[0]
  const firstPart = local.split('.')[0]
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
}

function formatEventDate(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr)
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

  const dayName = dayNames[d.getDay()]
  const day = d.getDate()
  const month = monthNames[d.getMonth()]

  const time = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

  return {
    date: `${dayName} ${day} ${month}`,
    time,
  }
}

// ─── GET handler (Vercel Cron) ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Verify cron secret - Vercel sends it as Authorization: Bearer <secret>
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[weekly-digest] Unauthorized cron request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const now = new Date()

    // Week boundaries: now → 7 days from now
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Week start for new member count: 7 days ago → now
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // ── Cleanup expired password reset tokens ─────────────────────────────

    await supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', now.toISOString())

    // ── Deactivate expired memberships ──────────────────────────────────

    const { count: deactivatedCount } = await supabase
      .from('members')
      .update({ membership_active: false })
      .eq('membership_active', true)
      .lt('membership_expires_at', now.toISOString())

    if (deactivatedCount && deactivatedCount > 0) {
      console.log(`[weekly-digest] Deactivated ${deactivatedCount} expired memberships`)
    }

    // ── Fetch all data in parallel ────────────────────────────────────────

    const [eventsResult, leaderboardResult, newMembersResult, membersResult] = await Promise.all([
      // Upcoming events this week
      supabase
        .from('events')
        .select('title, date, location')
        .in('status', ['upcoming', 'active'])
        .gte('date', now.toISOString())
        .lte('date', weekEnd.toISOString())
        .order('date', { ascending: true })
        .limit(10),

      // Top 5 leaderboard (exclude admins/bestuur)
      supabase
        .from('members')
        .select('email, display_name, total_xp')
        .eq('membership_active', true)
        .eq('is_admin', false)
        .neq('role', 'bestuur')
        .order('total_xp', { ascending: false })
        .limit(5),

      // New members this week (count)
      supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('membership_active', true)
        .gte('created_at', weekAgo.toISOString()),

      // All active members (recipients)
      supabase
        .from('members')
        .select('email')
        .eq('membership_active', true),
    ])

    if (eventsResult.error) throw new Error(`Events query failed: ${eventsResult.error.message}`)
    if (leaderboardResult.error) throw new Error(`Leaderboard query failed: ${leaderboardResult.error.message}`)
    if (newMembersResult.error) throw new Error(`New members query failed: ${newMembersResult.error.message}`)
    if (membersResult.error) throw new Error(`Members query failed: ${membersResult.error.message}`)

    // ── Transform data ────────────────────────────────────────────────────

    // Deduplicate events by title
    const seenTitles = new Set<string>()
    const events = (eventsResult.data ?? [])
      .filter((e) => {
        if (seenTitles.has(e.title)) return false
        seenTitles.add(e.title)
        return true
      })
      .map((e) => {
        const { date, time } = formatEventDate(e.date)
        return {
          title: e.title,
          date,
          time,
          location: e.location ?? '',
        }
      })

    const leaderboard = (leaderboardResult.data ?? []).map((m, i) => ({
      position: i + 1,
      name: (m.display_name as string) || (m.email as string).split('@')[0],
      xp: m.total_xp as number,
    }))

    const newMemberCount = newMembersResult.count ?? 0
    const members = membersResult.data ?? []

    if (members.length === 0) {
      console.log('[weekly-digest] No active members found, skipping')
      return NextResponse.json({ sent: 0, failed: 0, skipped: true })
    }

    // ── Pick a random fun fact ────────────────────────────────────────
    const funFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]

    console.log(`[weekly-digest] Sending to ${members.length} members - ${events.length} events, top ${leaderboard.length} leaderboard, ${newMemberCount} new members`)

    // ── Send emails in batches ────────────────────────────────────────────

    const transporter = getSmtpTransporter()
    const from = process.env.SMTP_FROM || 'SIT <matin.khajehfard@svsit.nl>'
    let sent = 0
    let failed = 0

    const BATCH_SIZE = 10
    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE)

      const results = await Promise.allSettled(
        batch.map(async (member) => {
          const voornaam = getVoornaam(member.email)

          const html = await render(
            WeeklyDigestEmail({
              voornaam,
              events,
              leaderboard,
              newMemberCount,
              funFact,
            })
          )

          return transporter.sendMail({
            from,
            to: member.email,
            subject: `Weekoverzicht SIT - ${events.length} event${events.length === 1 ? '' : 's'} deze week`,
            html,
          })
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          sent++
        } else {
          failed++
          console.error('[weekly-digest] Send failed:', result.reason)
        }
      }

      // Small delay between batches to respect Gmail rate limits
      if (i + BATCH_SIZE < members.length) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    console.log(`[weekly-digest] Done - sent: ${sent}, failed: ${failed}`)
    return NextResponse.json({ sent, failed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[weekly-digest] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
