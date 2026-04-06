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
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Ongeldige signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  console.log(`[webhook] Received event: ${event.type} (${event.id})`)

  async function getSubscriptionExpiry(subscriptionId: string): Promise<Date> {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const periodEnd = (sub as unknown as Record<string, number>).current_period_end
      if (periodEnd && typeof periodEnd === 'number') {
        return new Date(periodEnd * 1000)
      }
    } catch (err) {
      console.error('[webhook] Failed to retrieve subscription:', err instanceof Error ? err.message : err)
    }
    // Fallback: 1 jaar vanaf nu
    const fallback = new Date()
    fallback.setFullYear(fallback.getFullYear() + 1)
    console.warn('[webhook] Using 1 year fallback expiry')
    return fallback
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object

      // ── Event ticket betaling ──
      if (session.metadata?.type === 'event_ticket') {
        const ticketId = session.metadata.ticket_id
        if (ticketId) {
          console.log(`[webhook] Processing event ticket: ${ticketId}`)
          const ticketNumber = generateTicketNumber()

          const { data: updatedTicket } = await supabase
            .from('tickets')
            .update({ status: 'paid', ticket_number: ticketNumber })
            .eq('id', ticketId)
            .select('id, email, name, member_id, paid_amount, event_id')
            .single()

          if (updatedTicket) {
            try {
              const { data: eventData } = await supabase
                .from('events')
                .select('title, date, end_date, location')
                .eq('id', updatedTicket.event_id)
                .single()

              if (eventData) {
                await sendTicketEmail({
                  to: updatedTicket.email as string,
                  buyerName: (updatedTicket.name as string) ?? (updatedTicket.email as string).split('@')[0],
                  buyerEmail: updatedTicket.email as string,
                  isMember: !!(updatedTicket.member_id),
                  eventTitle: eventData.title as string,
                  eventDate: new Date(eventData.date as string),
                  eventEndDate: eventData.end_date ? new Date(eventData.end_date as string) : null,
                  eventLocation: (eventData.location as string) ?? '',
                  ticketId: updatedTicket.id as string,
                  ticketNumber,
                  paidAmount: (updatedTicket.paid_amount as number) ?? 0,
                })
                console.log(`[webhook] Ticket email sent to ${updatedTicket.email}`)
              }
            } catch (emailErr) {
              console.error('[webhook] Ticket email failed:', emailErr)
            }
          }
        }
        break
      }

      // ── Membership betaling ──
      const memberId = session.metadata?.member_id
      if (!memberId) {
        console.warn('[webhook] checkout.session.completed without member_id in metadata')
        break
      }

      console.log(`[webhook] Processing membership checkout for member: ${memberId}`)

      // Haal subscription op van Stripe voor echte period_end
      let expiresAt: Date
      if (session.subscription) {
        expiresAt = await getSubscriptionExpiry(session.subscription as string)
        console.log(`[webhook] Subscription period_end: ${expiresAt.toISOString()}`)
      } else {
        // Fallback: 1 jaar vanaf nu (zou niet voorkomen bij subscription mode)
        expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        console.warn('[webhook] No subscription on session, using fallback expiry')
      }

      const { error: memberErr } = await supabase
        .from('members')
        .update({
          membership_active: true,
          membership_started_at: new Date().toISOString(),
          membership_expires_at: expiresAt.toISOString(),
          stripe_subscription_id: session.subscription as string,
        })
        .eq('id', memberId)

      if (memberErr) {
        console.error('[webhook] Member update failed:', memberErr.message)
      }

      // Registreer betaling (idempotent via stripe_session_id UNIQUE constraint)
      const { error: payErr } = await supabase
        .from('payments')
        .upsert(
          {
            member_id: memberId,
            stripe_session_id: session.id,
            stripe_subscription_id: session.subscription as string,
            amount: (session.amount_total || 1000) / 100,
            status: 'paid',
            paid_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_session_id' }
        )

      if (payErr) {
        console.error('[webhook] Payment upsert failed:', payErr.message)
      }

      console.log(`[webhook] Member ${memberId} activated, expires ${expiresAt.toISOString()}`)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      // Skip eerste invoice — die wordt al afgehandeld door checkout.session.completed
      if (invoice.billing_reason === 'subscription_create') {
        console.log(`[webhook] Skipping initial invoice for customer: ${customerId}`)
        break
      }

      console.log(`[webhook] Processing renewal invoice for customer: ${customerId}`)

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      if (member) {
        // Haal actuele subscription period_end op
        const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string
        let expiresAt: Date
        if (subscriptionId) {
          expiresAt = await getSubscriptionExpiry(subscriptionId)
        } else {
          expiresAt = new Date()
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        }

        await supabase
          .from('members')
          .update({
            membership_active: true,
            membership_expires_at: expiresAt.toISOString(),
          })
          .eq('id', member.id as string)

        // Payment record voor renewal (met invoice ID als session_id voor idempotency)
        await supabase
          .from('payments')
          .upsert(
            {
              member_id: member.id as string,
              stripe_session_id: invoice.id,
              stripe_subscription_id: subscriptionId,
              amount: (invoice.amount_paid || 0) / 100,
              status: 'paid',
              paid_at: new Date().toISOString(),
            },
            { onConflict: 'stripe_session_id' }
          )

        console.log(`[webhook] Renewal processed for member ${member.id}, expires ${expiresAt.toISOString()}`)
      } else {
        console.warn(`[webhook] No member found for customer: ${customerId}`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string
      console.warn(`[webhook] Payment failed for customer: ${customerId}`)

      await supabase
        .from('members')
        .update({ membership_active: false })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string
      console.log(`[webhook] Subscription deleted for customer: ${customerId}`)

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
