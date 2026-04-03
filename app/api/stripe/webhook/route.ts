import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServiceSupabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !stripe) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any
        const periodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end
        const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString()
        await supabase
          .from('profiles')
          .update({ pro: true, pro_expires_at: expiresAt })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const session = await stripe.checkout.sessions.list({
        subscription: subscription.id,
        limit: 1,
      })
      const userId = session.data[0]?.metadata?.userId
      if (userId) {
        await supabase
          .from('profiles')
          .update({ pro: false, pro_expires_at: null })
          .eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
