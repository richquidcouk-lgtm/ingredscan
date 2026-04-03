'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'

const features = [
  'Unlimited daily scans',
  'Full additive detail with risk ratings',
  'UK supermarket swaps',
  'Scan history (unlimited)',
  'AI label photo parser',
  'Shareable scan cards',
  'Priority database updates',
]

export default function ProPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  async function handleSubscribe(plan: 'monthly' | 'annual') {
    setLoading(plan)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setShowAuth(true)
      setLoading(null)
      return
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch {
      alert('Could not connect to payment service')
    }

    setLoading(null)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
      <header className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <div className="w-9" />
      </header>

      <div className="px-4 max-w-lg mx-auto pb-12">
        <div className="text-center mb-8 animate-fadeUp">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-clash), system-ui', color: '#f0f0f4', letterSpacing: '-1px' }}>
            Scan smarter with Pro
          </h1>
          <p className="text-sm" style={{ color: 'rgba(240,240,244,0.45)' }}>
            Unlock the full power of IngredScan
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fadeUp" style={{ animationDelay: '100ms' }}>
          {/* Monthly */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(240,240,244,0.45)' }}>Monthly</p>
            <p className="text-2xl font-bold mb-1" style={{ color: '#f0f0f4', fontFamily: 'var(--font-clash), system-ui' }}>£3.99</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(240,240,244,0.35)' }}>per month</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(240,240,244,0.45)' }}>Cancel anytime</p>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#1c1c26', color: '#f0f0f4', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {loading === 'monthly' ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>

          {/* Annual */}
          <div className="rounded-2xl p-5 relative" style={{ backgroundColor: '#13131a', border: '2px solid #22c77e' }}>
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#22c77e', color: '#0b0b0f' }}>
              Most popular
            </span>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(240,240,244,0.45)' }}>Annual</p>
            <p className="text-2xl font-bold mb-1" style={{ color: '#f0f0f4', fontFamily: 'var(--font-clash), system-ui' }}>£29.99</p>
            <p className="text-xs mb-1" style={{ color: 'rgba(240,240,244,0.35)' }}>per year</p>
            <p className="text-xs mb-4 font-medium" style={{ color: '#22c77e' }}>Save 37%</p>
            <button
              onClick={() => handleSubscribe('annual')}
              disabled={loading === 'annual'}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#22c77e', color: '#0b0b0f' }}
            >
              {loading === 'annual' ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-2xl p-5 mb-4 animate-fadeUp" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)', animationDelay: '200ms' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f4' }}>Everything in Pro</h3>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <span style={{ color: '#22c77e' }}>✓</span>
                <span className="text-sm" style={{ color: 'rgba(240,240,244,0.7)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center" style={{ color: 'rgba(240,240,244,0.3)' }}>
          No credit card required for trial · Cancel anytime · Instant access
        </p>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
