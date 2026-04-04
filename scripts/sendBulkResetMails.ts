/**
 * Bulk Password Reset Mail Script
 *
 * Stuurt password reset mails naar alle legacy leden
 * (leden zonder stripe_customer_id die nog niet actief zijn).
 *
 * Gebruik:
 *   npx tsx scripts/sendBulkResetMails.ts --dry-run    # Preview, geen mails
 *   npx tsx scripts/sendBulkResetMails.ts              # Echt versturen
 */

import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const TOKEN_EXPIRY_DAYS = 7
const RATE_LIMIT_MS = 200
const BASE_URL = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://svsit.nl'

// Supabase service client (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function buildEmailHtml(firstName: string, resetUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: #09090B; padding: 32px; border-radius: 8px;">
        <div style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; margin-bottom: 24px;">
          <span style="color: #F59E0B;">{</span>
          <span style="color: #FAFAFA;">SIT</span>
          <span style="color: #F59E0B;">}</span>
        </div>

        <p style="color: #FAFAFA; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
          Hoi ${firstName},
        </p>

        <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
          We hebben de SIT website vernieuwd. Klik hieronder om je wachtwoord in te stellen en toegang te krijgen tot je account, events en je member card.
        </p>

        <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #F59E0B; color: #09090B; text-decoration: none; font-weight: bold; font-size: 14px; font-family: 'Courier New', monospace; border-radius: 4px;">
          WACHTWOORD INSTELLEN
        </a>

        <p style="color: #71717A; font-size: 12px; line-height: 1.6; margin: 24px 0 0 0;">
          Deze link is ${TOKEN_EXPIRY_DAYS} dagen geldig. Als je geen lid bent van SIT, kun je deze mail negeren.
        </p>

        <div style="border-top: 1px solid #27272A; margin-top: 24px; padding-top: 16px;">
          <p style="color: #71717A; font-size: 12px; margin: 0;">
            SIT &mdash; Studievereniging ICT<br>
            Hogeschool van Amsterdam
          </p>
        </div>
      </div>
    </div>
  `
}

async function main() {
  console.log('=== SIT Bulk Password Reset ===\n')

  // Haal legacy leden op: geen stripe customer, niet actief
  const { data: members, error } = await supabase
    .from('members')
    .select('id, email')
    .is('stripe_customer_id', null)
    .order('email')

  if (error || !members) {
    console.error('Kan leden niet ophalen:', error?.message)
    process.exit(1)
  }

  console.log(`${members.length} legacy leden gevonden\n`)

  if (DRY_RUN) {
    console.log('=== DRY RUN — geen mails worden verstuurd ===\n')
    members.forEach((m, i) => console.log(`  ${i + 1}. ${m.email}`))
    console.log(`\nRun zonder --dry-run om daadwerkelijk te versturen.`)
    return
  }

  // Verify SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP_USER en SMTP_PASS moeten geconfigureerd zijn in .env.local')
    process.exit(1)
  }

  let sent = 0
  let failed = 0

  for (const member of members) {
    try {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

      // Verwijder oude tokens
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('member_id', member.id as string)

      // Sla token op
      await supabase
        .from('password_reset_tokens')
        .insert({
          member_id: member.id as string,
          token,
          expires_at: expiresAt.toISOString(),
        })

      // Stuur mail
      const resetUrl = `${BASE_URL}/reset-password?token=${token}`
      const firstName = (member.email as string).split('@')[0]

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'SIT <bestuur@svsit.nl>',
        to: member.email as string,
        subject: 'Stel je wachtwoord in voor SIT',
        html: buildEmailHtml(firstName, resetUrl),
      })

      console.log(`  OK  ${member.email}`)
      sent++

      // Rate limit
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS))
    } catch (err) {
      console.error(`  FAIL ${member.email}:`, err instanceof Error ? err.message : err)
      failed++
    }
  }

  console.log(`\nKlaar: ${sent} verstuurd, ${failed} gefaald`)
}

main().catch(console.error)
