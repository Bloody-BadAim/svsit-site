import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import { render } from '@react-email/components'
import TicketEmail from '@/emails/ticketEmail'

// ── Gmail SMTP transport (all outbound email) ──

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

export async function sendPasswordResetEmail(
  to: string,
  name: string | null,
  resetUrl: string
) {
  const firstName = name?.split(' ')[0] || to.split('@')[0]

  const html = `
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
          Deze link is 7 dagen geldig. Als je geen lid bent van SIT, kun je deze mail negeren.
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

  const transporter = getSmtpTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'SIT <matin.khajehfard@svsit.nl>',
    to,
    subject: 'Stel je wachtwoord in voor SIT',
    html,
  })
}

interface SendTicketParams {
  to: string
  buyerName: string
  buyerEmail: string
  isMember: boolean
  eventTitle: string
  eventDate: Date
  eventEndDate?: Date | null
  eventLocation: string
  ticketId: string
  ticketNumber: string
  paidAmount: number // in cents, 0 = gratis
}

export async function sendTicketEmail(params: SendTicketParams) {
  // Generate QR code as data URL
  const qrData = JSON.stringify({ type: 'ticket', id: params.ticketId })
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    width: 200,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })

  // Format date
  const dateStr = params.eventDate
    .toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase()

  // Format time
  const startTime = params.eventDate.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endTime = params.eventEndDate
    ? params.eventEndDate.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null
  const timeStr = endTime ? `${startTime} — ${endTime}` : startTime

  // Format price
  const priceStr =
    params.paidAmount === 0 ? 'GRATIS' : `€${(params.paidAmount / 100).toFixed(0)}`

  // Render React Email template to HTML
  const html = await render(TicketEmail({
    eventTitle: params.eventTitle,
    eventDate: dateStr,
    eventTime: timeStr,
    eventLocation: params.eventLocation || 'TBA',
    buyerName: params.buyerName || params.buyerEmail.split('@')[0],
    buyerEmail: params.buyerEmail,
    isMember: params.isMember,
    ticketNumber: params.ticketNumber,
    price: priceStr,
    qrCodeDataUrl,
  }))

  // Send via Gmail SMTP
  const transporter = getSmtpTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'SIT <matin.khajehfard@svsit.nl>',
    to: params.to,
    subject: `Je ticket voor ${params.eventTitle} — {SIT}`,
    html,
  })
}

// Generate ticket number: #SIT-2026-XXXX
export function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')
  return `#SIT-${year}-${rand}`
}
