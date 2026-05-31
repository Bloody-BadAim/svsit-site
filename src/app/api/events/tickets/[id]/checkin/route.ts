import { NextRequest, NextResponse } from 'next/server'
import { handleError, requireAdmin } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const { id } = await params

    // Optional: scanner stuurt het actieve event mee zodat we kunnen
    // controleren dat het ticket bij DAT event hoort.
    let expectedEventId: string | null = null
    try {
      const body = await req.json()
      if (body && typeof body.event_id === 'string') {
        expectedEventId = body.event_id
      }
    } catch {
      // Geen/lege body (handmatige check-in zonder actief event) - ok
    }

    const supabase = createServiceClient()

    // Get ticket with event info
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('id, status, email, name, event_id, events(title)')
      .eq('id', id)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json(
        { data: null, error: 'Ticket niet gevonden', meta: null },
        { status: 404 }
      )
    }

    // Event-mismatch: ticket hoort bij ander event dan het actieve scanner-event
    if (expectedEventId && ticket.event_id !== expectedEventId) {
      const ticketEvent = ticket.events as { title?: string } | null
      return NextResponse.json(
        {
          data: { event_title: ticketEvent?.title ?? 'ander event' },
          error: `Ticket hoort bij '${ticketEvent?.title ?? 'ander event'}', niet bij actief event`,
          meta: null,
        },
        { status: 409 }
      )
    }

    if (ticket.status === 'checked_in') {
      return NextResponse.json(
        { data: null, error: 'Al ingecheckt', meta: null },
        { status: 409 }
      )
    }

    if (ticket.status !== 'paid') {
      return NextResponse.json(
        {
          data: null,
          error: `Ticket status is '${ticket.status}', kan niet inchecken`,
          meta: null,
        },
        { status: 400 }
      )
    }

    // Update to checked_in. De extra .eq('status', 'paid') maakt de transitie
    // atomair: UPDATE ... WHERE id=? AND status='paid' raakt maar 1 rij. Bij
    // gelijktijdige scans wint er eentje; de andere matcht niets meer.
    const { data: updated, error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'paid')
      .select('id, email, name, status, checked_in_at, event_id')
      .maybeSingle()

    if (updateError) throw updateError

    // Geen rij geraakt: een gelijktijdige check-in was net iets eerder.
    if (!updated) {
      return NextResponse.json(
        { data: null, error: 'Al ingecheckt', meta: null },
        { status: 409 }
      )
    }

    // Get event title for scanner display
    const { data: event } = await supabase
      .from('events')
      .select('title')
      .eq('id', ticket.event_id)
      .single()

    return NextResponse.json({
      data: { ...updated, event_title: event?.title || 'Onbekend event' },
      error: null,
      meta: null,
    })
  } catch (err) {
    return handleError(err)
  }
}
