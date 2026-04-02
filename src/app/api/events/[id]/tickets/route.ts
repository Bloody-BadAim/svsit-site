import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'
import { sendTicketEmail, generateTicketNumber } from '@/lib/email'

// GET — Lijst van tickets voor een event (admin only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { id: eventId } = await params
    const supabase = createServiceClient()

    const { data, error, count } = await supabase
      .from('tickets')
      .select(
        'id, event_id, member_id, email, name, status, stripe_session_id, paid_amount, created_at, checked_in_at, members(id, email, student_number, role)',
        { count: 'exact' }
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: { count } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}

// POST — Ticket kopen / RSVP
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await req.json()
    const { email, name, member_id } = body as {
      email: string
      name?: string
      member_id?: string
    }

    if (!email) {
      return NextResponse.json({ data: null, error: 'Email is verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Haal event op
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      if (eventError?.code === 'PGRST116') {
        return NextResponse.json({ data: null, error: 'Event niet gevonden', meta: null }, { status: 404 })
      }
      throw eventError
    }

    // 2. Capaciteitscheck (als ingesteld)
    if (event.capacity !== null) {
      const { count, error: countError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .in('status', ['paid', 'checked_in'])

      if (countError) throw countError

      if ((count ?? 0) >= event.capacity) {
        return NextResponse.json({ data: null, error: 'Event is vol', meta: null }, { status: 409 })
      }
    }

    // 3. Gratis event: ticket direct aanmaken met status 'paid'
    if (!event.is_paid) {
      const ticketNumber = generateTicketNumber()

      const { data: ticket, error: insertError } = await supabase
        .from('tickets')
        .insert({
          event_id: eventId,
          member_id: member_id ?? null,
          email,
          name: name ?? null,
          status: 'paid',
          paid_amount: 0,
          ticket_number: ticketNumber,
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      // Stuur bevestigingsmail (niet-blokkerend: fout stopt de response niet)
      try {
        await sendTicketEmail({
          to: email,
          buyerName: name ?? email.split('@')[0],
          buyerEmail: email,
          isMember: !!member_id,
          eventTitle: event.title as string,
          eventDate: new Date(event.date as string),
          eventEndDate: event.end_date ? new Date(event.end_date as string) : null,
          eventLocation: (event.location as string) ?? '',
          ticketId: ticket.id as string,
          ticketNumber,
          paidAmount: 0,
        })
      } catch (emailErr) {
        console.error('[email] Ticket mail mislukt:', emailErr)
      }

      return NextResponse.json({ data: ticket, error: null, meta: null }, { status: 201 })
    }

    // 4. Betaald event: Stripe checkout session aanmaken
    const price = member_id ? event.price_members : event.price_nonmembers
    const priceInCents = Math.round(price * 100)

    // Maak eerst een pending ticket aan zodat we het ID in de Stripe metadata kunnen zetten
    const { data: ticket, error: insertError } = await supabase
      .from('tickets')
      .insert({
        event_id: eventId,
        member_id: member_id ?? null,
        email,
        name: name ?? null,
        status: 'pending',
        paid_amount: priceInCents,
      })
      .select('*')
      .single()

    if (insertError) throw insertError

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'ideal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `Ticket: ${event.title}` },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        type: 'event_ticket',
        event_id: eventId,
        ticket_id: ticket.id as string,
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?ticket=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?ticket=cancelled`,
    })

    // Sla Stripe session ID op bij het ticket
    await supabase
      .from('tickets')
      .update({ stripe_session_id: checkoutSession.id })
      .eq('id', ticket.id as string)

    return NextResponse.json(
      {
        data: { ticket: { ...ticket, stripe_session_id: checkoutSession.id }, checkout_url: checkoutSession.url },
        error: null,
        meta: null,
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
