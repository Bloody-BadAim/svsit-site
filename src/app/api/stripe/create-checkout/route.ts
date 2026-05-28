import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    // Use the authenticated user's email, ignore any email from request body
    const email = session.user.email!.toLowerCase().trim()

    const supabase = createServiceClient()
    const { data: member, error: dbError } = await supabase
      .from('members')
      .select('id, stripe_customer_id')
      .eq('email', email)
      .maybeSingle()

    if (dbError) {
      console.error('[checkout] DB lookup failed:', dbError.message)
      return NextResponse.json({ error: 'Database fout bij opzoeken lid' }, { status: 500 })
    }

    if (!member) {
      console.error('[checkout] Member not found for email:', email)
      return NextResponse.json({ error: 'Lid niet gevonden. Registreer eerst via /lid-worden' }, { status: 404 })
    }

    // Hergebruik bestaande Stripe customer of maak nieuwe aan
    let customerId = member.stripe_customer_id as string | null

    if (!customerId) {
      const customer = await stripe.customers.create({ email })
      customerId = customer.id

      await supabase
        .from('members')
        .update({ stripe_customer_id: customerId })
        .eq('id', member.id as string)
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'ideal'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?welcome=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/lid-worden`,
      metadata: {
        member_id: member.id as string,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
