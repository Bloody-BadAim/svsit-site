import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { sendTicketEmail, generateTicketNumber } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Geen signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Ongeldige signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object

      // Event ticket betaling — afhandelen vóór membership logica
      if (session.metadata?.type === 'event_ticket') {
        const ticketId = session.metadata.ticket_id
        if (ticketId) {
          const ticketNumber = generateTicketNumber()

          const { data: updatedTicket } = await supabase
            .from('tickets')
            .update({ status: 'paid', ticket_number: ticketNumber })
            .eq('id', ticketId)
            .select('id, email, name, member_id, paid_amount, event_id')
            .single()

          // Stuur bevestigingsmail na betaling
          if (updatedTicket) {
            try {
              const { data: event } = await supabase
                .from('events')
                .select('title, date, end_date, location')
                .eq('id', updatedTicket.event_id)
                .single()

              if (event) {
                await sendTicketEmail({
                  to: updatedTicket.email as string,
                  buyerName: (updatedTicket.name as string) ?? (updatedTicket.email as string).split('@')[0],
                  buyerEmail: updatedTicket.email as string,
                  isMember: !!(updatedTicket.member_id),
                  eventTitle: event.title as string,
                  eventDate: new Date(event.date as string),
                  eventEndDate: event.end_date ? new Date(event.end_date as string) : null,
                  eventLocation: (event.location as string) ?? '',
                  ticketId: updatedTicket.id as string,
                  ticketNumber,
                  paidAmount: (updatedTicket.paid_amount as number) ?? 0,
                })
              }
            } catch (emailErr) {
              console.error('[email] Ticket mail mislukt na Stripe betaling:', emailErr)
            }
          }
        }
        break
      }

      const memberId = session.metadata?.member_id
      if (!memberId) break

      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      await supabase
        .from('members')
        .update({
          membership_active: true,
          membership_started_at: now.toISOString(),
          membership_expires_at: expiresAt.toISOString(),
          stripe_subscription_id: session.subscription as string,
        })
        .eq('id', memberId)

      // Registreer betaling
      await supabase
        .from('payments')
        .insert({
          member_id: memberId,
          stripe_session_id: session.id,
          stripe_subscription_id: session.subscription as string,
          amount: (session.amount_total || 1000) / 100,
          status: 'paid',
          paid_at: now.toISOString(),
        })

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (member) {
        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)

        await supabase
          .from('members')
          .update({
            membership_active: true,
            membership_expires_at: expiresAt.toISOString(),
          })
          .eq('id', member.id as string)

        await supabase
          .from('payments')
          .insert({
            member_id: member.id as string,
            stripe_subscription_id: (invoice as unknown as Record<string, unknown>).subscription as string,
            amount: (invoice.amount_paid || 0) / 100,
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      await supabase
        .from('members')
        .update({ membership_active: false })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      await supabase
        .from('members')
        .update({
          membership_active: false,
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
