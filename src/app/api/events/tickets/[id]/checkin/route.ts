import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { data: null, error: 'Niet geautoriseerd', meta: null },
        { status: 403 }
      )
    }

    const { id } = await params
    const supabase = createServiceClient()

    // Get ticket with event info
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('id, status, email, name, event_id')
      .eq('id', id)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json(
        { data: null, error: 'Ticket niet gevonden', meta: null },
        { status: 404 }
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

    // Update to checked_in
    const { data: updated, error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, email, name, status, checked_in_at, event_id')
      .single()

    if (updateError) throw updateError

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
