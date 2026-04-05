import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import MemberEmail from '@/emails/memberEmail'

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailFilter = 'all' | 'active' | 'bestuur' | 'commissie'

interface EmailRequestBody {
  subject: string
  body: string
  filter: EmailFilter
}

interface MemberRow {
  id: string
  email: string
  name?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is niet geconfigureerd')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

/** Derive first name from full name or email address */
function getVoornaam(email: string, name?: string | null): string {
  if (name) {
    return name.split(' ')[0]
  }
  // fall back to the part before the dot (e.g. matin.khajehfard@hva.nl → matin)
  const local = email.split('@')[0]
  const firstPart = local.split('.')[0]
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
}

async function fetchMembers(filter: EmailFilter): Promise<MemberRow[]> {
  const supabase = createServiceClient()

  if (filter === 'all') {
    const { data, error } = await supabase
      .from('members')
      .select('id, email, name')
      .eq('membership_active', true)

    if (error) throw error
    return data ?? []
  }

  if (filter === 'active') {
    // Members who have a scan in the last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('member_id')
      .gte('created_at', since)

    if (scansError) throw scansError

    const memberIds = [...new Set((scans ?? []).map((s: { member_id: string }) => s.member_id))]
    if (memberIds.length === 0) return []

    const { data, error } = await supabase
      .from('members')
      .select('id, email, name')
      .in('id', memberIds)
      .eq('membership_active', true)

    if (error) throw error
    return data ?? []
  }

  if (filter === 'bestuur') {
    const { data, error } = await supabase
      .from('members')
      .select('id, email, name')
      .eq('role', 'bestuur')

    if (error) throw error
    return data ?? []
  }

  if (filter === 'commissie') {
    // Members who appear in member_commissies join table
    const { data: joins, error: joinsError } = await supabase
      .from('member_commissies')
      .select('member_id')

    if (joinsError) throw joinsError

    const memberIds = [...new Set((joins ?? []).map((j: { member_id: string }) => j.member_id))]
    if (memberIds.length === 0) return []

    const { data, error } = await supabase
      .from('members')
      .select('id, email, name')
      .in('id', memberIds)

    if (error) throw error
    return data ?? []
  }

  return []
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }
    const supabase = createServiceClient()
    const { data: adminCheck } = await supabase
      .from('members')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()
    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    // Parse body
    const body = await req.json() as EmailRequestBody
    const { subject, body: emailBody, filter } = body

    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Onderwerp is verplicht' }, { status: 400 })
    }
    if (!emailBody?.trim()) {
      return NextResponse.json({ error: 'Berichttekst is verplicht' }, { status: 400 })
    }
    const validFilters: EmailFilter[] = ['all', 'active', 'bestuur', 'commissie']
    if (!validFilters.includes(filter)) {
      return NextResponse.json({ error: 'Ongeldig filter' }, { status: 400 })
    }

    // Fetch recipients
    const members = await fetchMembers(filter)
    if (members.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, message: 'Geen ontvangers gevonden' })
    }

    // Send emails via Resend (batch of up to 100 at a time)
    const resend = getResend()
    let sent = 0
    let failed = 0

    const BATCH_SIZE = 100
    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE)

      const results = await Promise.allSettled(
        batch.map((member) => {
          const voornaam = getVoornaam(member.email, member.name)
          return resend.emails.send({
            from: 'SIT <bestuur@svsit.nl>',
            to: member.email,
            subject,
            react: MemberEmail({ voornaam, subject, body: emailBody }),
          })
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled' && !result.value.error) {
          sent++
        } else {
          failed++
        }
      }
    }

    return NextResponse.json({ sent, failed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET — member count preview ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }
    const supabase = createServiceClient()
    const { data: adminCheck } = await supabase
      .from('members')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()
    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const filter = (searchParams.get('filter') ?? 'all') as EmailFilter

    const members = await fetchMembers(filter)
    return NextResponse.json({ count: members.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
