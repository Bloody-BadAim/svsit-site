import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { generateTicketPdf } from '@/lib/pdfTicket'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { id: ticketId } = await params
    const supabase = createServiceClient()

    // Fetch ticket with event data
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*, events(title, date, end_date, location)')
      .eq('id', ticketId)
      .single()

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket niet gevonden' }, { status: 404 })
    }

    // Only the ticket owner or admins can download
    const isOwner = ticket.email === session.user.email
    const isAdmin = session.user.isAdmin
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    // Only paid or checked_in tickets get a PDF
    if (!['paid', 'checked_in'].includes(ticket.status as string)) {
      return NextResponse.json({ error: 'Ticket is niet geldig' }, { status: 400 })
    }

    const event = ticket.events as { title: string; date: string; end_date: string | null; location: string | null }

    // Format date
    const dateObj = new Date(event.date)
    const dateStr = dateObj
      .toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
      .toUpperCase()

    // Format time
    const startTime = dateObj.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    const endTime = event.end_date
      ? new Date(event.end_date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
      : null
    const timeStr = endTime ? `${startTime} - ${endTime}` : startTime

    // Format price
    const paidAmount = ticket.paid_amount as number
    const priceStr = paidAmount === 0 ? 'GRATIS' : `€${(paidAmount / 100).toFixed(0)}`

    const pdfBuffer = await generateTicketPdf({
      eventTitle: event.title,
      eventDate: dateStr,
      eventTime: timeStr,
      eventLocation: event.location ?? 'TBA',
      buyerName: (ticket.name as string) ?? (ticket.email as string).split('@')[0],
      ticketNumber: (ticket.ticket_number as string) ?? ticketId.slice(0, 8),
      ticketId,
      price: priceStr,
      isMember: !!(ticket.member_id),
    })

    const filename = `SIT-Ticket-${(ticket.ticket_number as string)?.replace('#', '') ?? ticketId.slice(0, 8)}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[pdf] Generation failed:', err)
    return NextResponse.json({ error: 'PDF genereren mislukt' }, { status: 500 })
  }
}
