import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(key, { apiVersion: '2023-10-16' as any })
}

export const stripe = typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY
  ? getStripe()
  : (null as unknown as Stripe)

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',
    price: '£3.99',
    interval: 'month',
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID || '',
    price: '£29.99',
    interval: 'year',
  },
}
