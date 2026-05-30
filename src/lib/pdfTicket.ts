import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

interface TicketPdfParams {
  eventTitle: string
  eventDate: string       // e.g. "27 MAART 2026"
  eventTime: string       // e.g. "17:00 - 21:00"
  eventLocation: string
  buyerName: string
  ticketNumber: string    // e.g. "#SIT-2026-0042"
  ticketId: string
  price: string           // "GRATIS" or "€10"
  isMember: boolean
}

// SIT Brand colors (from Figma brand kit)
const COLORS = {
  bg: '#09090B',
  surface: '#111113',
  gold: '#F29E18',
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',
  text: '#FAFAFA',
  muted: '#71717A',
  white: '#FFFFFF',
  black: '#000000',
} as const

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export async function generateTicketPdf(params: TicketPdfParams): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 210], // Ticket-sized: 105mm x 210mm (like a DL envelope)
  })

  const W = 105
  const H = 210

  // ── Top accent bar (4 colors) ──
  const barH = 2
  const barW = W / 4
  const barColors = [COLORS.red, COLORS.gold, COLORS.green, COLORS.blue]
  barColors.forEach((color, i) => {
    doc.setFillColor(...hexToRgb(color))
    doc.rect(i * barW, 0, barW, barH, 'F')
  })

  // ── Dark header section ──
  const headerH = 70
  doc.setFillColor(...hexToRgb(COLORS.bg))
  doc.rect(0, barH, W, headerH, 'F')

  // {SIT} logo - centered using measured glyph widths (no overlap)
  let y = barH + 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  const gap = 1 // mm spacing between brace and text
  const wOpen = doc.getTextWidth('{')
  const wSit = doc.getTextWidth('SIT')
  const wClose = doc.getTextWidth('}')
  const logoW = wOpen + gap + wSit + gap + wClose
  let lx = (W - logoW) / 2
  doc.setTextColor(...hexToRgb(COLORS.gold))
  doc.text('{', lx, y)
  lx += wOpen + gap
  doc.setTextColor(...hexToRgb(COLORS.text))
  doc.text('SIT', lx, y)
  lx += wSit + gap
  doc.setTextColor(...hexToRgb(COLORS.gold))
  doc.text('}', lx, y)

  // Color marks: x x x
  y += 5
  doc.setFontSize(7)
  doc.setTextColor(...hexToRgb(COLORS.red))
  doc.text('x', W / 2 - 6, y, { align: 'center' })
  doc.setTextColor(...hexToRgb(COLORS.gold))
  doc.text('x', W / 2, y, { align: 'center' })
  doc.setTextColor(...hexToRgb(COLORS.green))
  doc.text('x', W / 2 + 6, y, { align: 'center' })

  // Separator line
  y += 5
  doc.setDrawColor(...hexToRgb(COLORS.gold))
  doc.setLineWidth(0.2)
  doc.line(15, y, W - 15, y)

  // "// event ticket" label
  y += 6
  doc.setFont('courier', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...hexToRgb(COLORS.muted))
  doc.text('// event ticket', W / 2, y, { align: 'center' })

  // Event title (uppercase, bold, big)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...hexToRgb(COLORS.text))
  const titleLines = doc.splitTextToSize(params.eventTitle.toUpperCase(), W - 24)
  doc.text(titleLines, W / 2, y, { align: 'center' })
  y += titleLines.length * 7

  // Date
  y += 2
  doc.setFontSize(9)
  doc.setTextColor(...hexToRgb(COLORS.text))
  doc.text(params.eventDate, W / 2, y, { align: 'center' })

  // Time
  y += 5
  doc.setTextColor(...hexToRgb(COLORS.gold))
  doc.text(params.eventTime, W / 2, y, { align: 'center' })

  // Location
  if (params.eventLocation && params.eventLocation !== 'TBA') {
    y += 5
    doc.setFontSize(8)
    doc.setTextColor(...hexToRgb(COLORS.muted))
    doc.text(params.eventLocation, W / 2, y, { align: 'center' })
  }

  // ── Dashed tear line ──
  const tearY = barH + headerH
  doc.setDrawColor(...hexToRgb(COLORS.muted))
  doc.setLineWidth(0.3)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(0, tearY, W, tearY)
  doc.setLineDashPattern([], 0)

  // Small circle cutouts at edges (tear line decoration)
  const cutR = 3
  doc.setFillColor(...hexToRgb(COLORS.white))
  doc.circle(-cutR / 2, tearY, cutR, 'F')
  doc.circle(W + cutR / 2, tearY, cutR, 'F')

  // ── White ticket body ──
  doc.setFillColor(...hexToRgb(COLORS.white))
  doc.rect(0, tearY, W, H - tearY, 'F')

  // QR Code
  const qrData = JSON.stringify({ type: 'ticket', id: params.ticketId })
  const qrDataUrl = await QRCode.toDataURL(qrData, {
    width: 400,
    margin: 1,
    color: { dark: '#09090B', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  })

  const qrSize = 38
  const qrX = (W - qrSize) / 2
  const qrY = tearY + 8
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

  // "Toon dit bij de ingang"
  let bodyY = qrY + qrSize + 5
  doc.setFont('courier', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...hexToRgb(COLORS.muted))
  doc.text('TOON DIT BIJ DE INGANG', W / 2, bodyY, { align: 'center' })

  // Separator
  bodyY += 6
  doc.setDrawColor(...hexToRgb('#E4E4E7'))
  doc.setLineWidth(0.15)
  doc.line(15, bodyY, W - 15, bodyY)

  // Ticket details table
  bodyY += 7
  doc.setFont('courier', 'normal')
  doc.setFontSize(7)

  const details = [
    ['NAAM', params.buyerName],
    ['TICKET', params.ticketNumber],
    ['TYPE', params.isMember ? 'SIT LID' : 'NIET-LID'],
    ['PRIJS', params.price],
  ]

  details.forEach(([label, value]) => {
    doc.setTextColor(...hexToRgb(COLORS.muted))
    doc.text(label, 15, bodyY)
    doc.setTextColor(...hexToRgb(COLORS.black))
    doc.text(value, W - 15, bodyY, { align: 'right' })
    bodyY += 5.5
  })

  // Bottom separator
  bodyY += 3
  doc.setDrawColor(...hexToRgb('#E4E4E7'))
  doc.line(15, bodyY, W - 15, bodyY)

  // Footer
  bodyY += 6
  doc.setFontSize(6)
  doc.setTextColor(...hexToRgb(COLORS.muted))
  doc.text('SIT - Studievereniging ICT HvA', W / 2, bodyY, { align: 'center' })
  bodyY += 3.5
  doc.text('svsit.nl  |  Bestuur XII', W / 2, bodyY, { align: 'center' })

  // ── Bottom accent bar ──
  const bottomBarH = 1.5
  const bottomBarColors = [COLORS.blue, COLORS.green, COLORS.gold, COLORS.red]
  bottomBarColors.forEach((color, i) => {
    doc.setFillColor(...hexToRgb(color))
    doc.rect(i * barW, H - bottomBarH, barW, bottomBarH, 'F')
  })

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
