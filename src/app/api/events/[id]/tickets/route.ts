import { NextRequest, NextResponse } from 'next/server'
import { handleError, requireAdmin } from '@/lib/apiAuth'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { sendTicketEmail, generateTicketNumber } from '@/lib/email'
import { parseFormFields, validateCustomData } from '@/lib/eventForm'
import { rateLimit } from '@/lib/rateLimit'
import type { Json } from '@/lib/database.types'

// GET - Lijst van tickets voor een event (admin/bestuur only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const { id: eventId } = await params
    const supabase = createServiceClient()

    const { data, error, count } = await supabase
      .from('tickets')
      .select(
        'id, event_id, member_id, email, name, status, stripe_session_id, paid_amount, custom_data, created_at, checked_in_at, members(id, email, student_number, role)',
        { count: 'exact' }
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: { count } })
  } catch (err) {
    return handleError(err)
  }
}

// POST - Ticket kopen / RSVP
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await req.json()
    const { email, name, custom_data } = body as {
      email: string
      name?: string
      custom_data?: unknown
    }

    // SECURITY: lidmaatschap + member_id NIET uit de body vertrouwen (anders kan
    // iedereen de leden-prijs pakken of een boeking op andermans account zetten).
    // Leid af uit de sessie: alleen een ingelogd lid met actief lidmaatschap
    // krijgt de ledenprijs.
    const session = await auth()
    const member_id = session?.user?.id ?? null
    const isMember = session?.user?.membershipActive ?? false

    if (!email) {
      return NextResponse.json({ data: null, error: 'Email is verplicht', meta: null }, { status: 400 })
    }

    // Rate limit: voorkom spam-aanmeldingen + bevestigingsmail-flooding
    if (!rateLimit(`ticket:${String(email).toLowerCase()}`).success) {
      return NextResponse.json({ data: null, error: 'Te veel aanmeldingen, probeer later opnieuw', meta: null }, { status: 429 })
    }

    const supabase = createServiceClient()

    // 1. Haal event op
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, date, end_date, location, is_paid, price_members, price_nonmembers, capacity, status, form_fields')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      if (eventError?.code === 'PGRST116') {
        return NextResponse.json({ data: null, error: 'Event niet gevonden', meta: null }, { status: 404 })
      }
      throw eventError
    }

    // Geen aanmelding op afgelaste of afgelopen events (UI verbergt de form al,
    // maar een directe API-call moet ook geweigerd worden)
    if (event.status === 'cancelled') {
      return NextResponse.json({ data: null, error: 'Dit event is afgelast', meta: null }, { status: 409 })
    }
    if (event.status === 'completed') {
      return NextResponse.json({ data: null, error: 'Dit event is al geweest', meta: null }, { status: 409 })
    }

    // Custom aanmeld-velden valideren tegen de definities op het event
    const formFields = parseFormFields(event.form_fields)
    const validation = validateCustomData(formFields, custom_data)
    if (!validation.ok) {
      return NextResponse.json({ data: null, error: validation.error, meta: null }, { status: 400 })
    }

    // Determine member status: explicit isMember flag takes priority, fallback to member_id presence
    const memberFlag = isMember ?? !!member_id

    // Prijs bepalen (cents). Gratis events: 0. Betaald: lid- vs niet-lid-prijs.
    const priceInCents = !event.is_paid
      ? 0
      : (memberFlag && event.price_members !== null ? event.price_members : event.price_nonmembers) ?? 0

    const ticketStatus = event.is_paid ? 'pending' : 'paid'
    const ticketNumber = generateTicketNumber()

    // 2. Atomic booking: capaciteitscheck + insert in 1 transactie (row-lock op
    //    de event-rij). Voorkomt overboeking bij gelijktijdige requests.
    const { data: bookedTicket, error: bookError } = await supabase
      .rpc('book_event_ticket', {
        p_event_id: eventId,
        // book_event_ticket accepteert null voor member_id/name; gegenereerde
        // Args-types modelleren de nullable functieparams niet, vandaar de cast.
        p_member_id: (member_id ?? null) as string,
        p_email: email,
        p_name: (name ?? null) as string,
        p_status: ticketStatus,
        p_paid_amount: priceInCents,
        p_ticket_number: ticketNumber,
        p_custom_data: validation.clean as unknown as Json,
      })
      .single()
    const ticket = bookedTicket as { id: string; [key: string]: unknown } | null

    if (bookError) {
      if (bookError.message?.includes('EVENT_FULL')) {
        return NextResponse.json({ data: null, error: 'Event is vol', meta: null }, { status: 409 })
      }
      if (bookError.message?.includes('EVENT_NOT_FOUND')) {
        return NextResponse.json({ data: null, error: 'Event niet gevonden', meta: null }, { status: 404 })
      }
      throw bookError
    }
    if (!ticket) {
      return NextResponse.json({ data: null, error: 'Ticket aanmaken mislukt', meta: null }, { status: 500 })
    }

    // 3. Gratis event: ticket is al 'paid', stuur bevestigingsmail
    if (!event.is_paid) {
      // Niet-blokkerend: een mislukte mail stopt de response niet
      try {
        await sendTicketEmail({
          to: email,
          buyerName: name ?? email.split('@')[0],
          buyerEmail: email,
          isMember: memberFlag,
          eventTitle: event.title as string,
          eventDate: new Date(event.date as string),
          eventEndDate: event.end_date ? new Date(event.end_date as string) : null,
          eventLocation: (event.location as string) ?? '',
          ticketId: ticket.id,
          ticketNumber,
          paidAmount: 0,
        })
      } catch (emailErr) {
        console.error('[email] Ticket mail mislukt:', emailErr)
      }

      return NextResponse.json({ data: ticket, error: null, meta: null }, { status: 201 })
    }

    // 4. Betaald event: Stripe checkout session op het pending ticket
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
        ticket_id: ticket.id,
        is_member: memberFlag ? 'true' : 'false',
      },
      success_url: `${process.env.NEXTAUTH_URL}/events/${eventId}?ticket=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${eventId}?ticket=cancelled`,
    })

    // Sla Stripe session ID op bij het ticket
    await supabase
      .from('tickets')
      .update({ stripe_session_id: checkoutSession.id })
      .eq('id', ticket.id)

    return NextResponse.json(
      {
        data: { ticket: { ...ticket, stripe_session_id: checkoutSession.id }, checkout_url: checkoutSession.url },
        error: null,
        meta: null,
      },
      { status: 201 }
    )
  } catch (err) {
    return handleError(err)
  }
}
