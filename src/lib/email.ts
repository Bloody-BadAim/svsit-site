import { Resend } from 'resend'
import QRCode from 'qrcode'
import TicketEmail from '@/emails/ticketEmail'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is niet geconfigureerd')
  }
  return new Resend(process.env.RESEND_API_KEY)
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

  // Send via Resend
  const { data, error } = await getResend().emails.send({
    from: 'SIT <noreply@svsit.nl>',
    to: params.to,
    subject: `Je ticket voor ${params.eventTitle} — {SIT}`,
    react: TicketEmail({
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
    }),
  })

  if (error) throw new Error(`Email failed: ${error.message}`)
  return data
}

// Generate ticket number: #SIT-2026-XXXX
export function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')
  return `#SIT-${year}-${rand}`
}
