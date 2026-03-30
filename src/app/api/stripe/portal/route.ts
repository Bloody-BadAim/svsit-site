import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data: member } = await supabase
      .from('members')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    if (!member?.stripe_customer_id) {
      return NextResponse.json({ error: 'Geen Stripe account gevonden' }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: member.stripe_customer_id as string,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/profiel`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
