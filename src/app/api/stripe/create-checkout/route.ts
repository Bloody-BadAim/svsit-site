import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: member } = await supabase
      .from('members')
      .select('id, stripe_customer_id')
      .eq('email', email)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 404 })
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

    const session = await stripe.checkout.sessions.create({
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

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
