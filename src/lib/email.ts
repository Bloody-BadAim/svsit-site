import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import { render } from '@react-email/components'
import TicketEmail from '@/emails/ticketEmail'
import PasswordResetEmail from '@/emails/passwordResetEmail'

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

  const html = await render(
    PasswordResetEmail({ firstName, resetUrl })
  )

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
