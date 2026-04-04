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
      } else if (data.error?.includes('not configured') || data.error?.includes('Stripe')) {
        alert('Payments are being set up. Please try again soon!')
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch {
      alert('Payments are being set up. Please try again soon!')
    }

    setLoading(null)
  }

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Accent glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,229,160,0.06) 0%, rgba(124,111,255,0.04) 50%, transparent 70%)',
        }}
      />

      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto relative z-10">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <div className="w-10" />
      </header>

      <div className="px-5 max-w-lg mx-auto pb-12 relative z-10">
        <div className="text-center mb-10 animate-fadeUp">
          <h1 className="text-3xl heading-display mb-3" style={{ color: '#f0f0f4' }}>
            Scan smarter with Pro
          </h1>
          <p className="text-sm" style={{ color: 'rgba(240,240,244,0.4)' }}>
            Unlock the full power of IngredScan
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-3 mb-8 animate-fadeUp" style={{ animationDelay: '100ms' }}>
          {/* Monthly */}
          <div className="rounded-2xl p-5 glass-card card-hover-glow">
            <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(240,240,244,0.4)' }}>Monthly</p>
            <p className="text-2xl font-bold heading-display mb-1" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>£3.99</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(240,240,244,0.3)' }}>per month</p>
            <p className="text-xs mb-5" style={{ color: 'rgba(240,240,244,0.4)' }}>Cancel anytime</p>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-50 glass-input"
              style={{ color: '#f0f0f4' }}
            >
              {loading === 'monthly' ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>

          {/* Annual */}
          <div className="rounded-2xl p-5 relative gradient-border glass-card" style={{ borderColor: 'transparent' }}>
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#00e5a0', color: '#0b0b0f' }}>
              Most popular
            </span>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(240,240,244,0.4)' }}>Annual</p>
            <p className="text-2xl font-bold heading-display mb-1" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>£29.99</p>
            <p className="text-xs mb-1" style={{ color: 'rgba(240,240,244,0.3)' }}>per year</p>
            <p className="text-xs mb-5 font-medium" style={{ color: '#00e5a0' }}>Save 37%</p>
            <button
              onClick={() => handleSubscribe('annual')}
              disabled={loading === 'annual'}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-50 btn-glow"
              style={{ color: '#0b0b0f' }}
            >
              {loading === 'annual' ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-2xl p-6 mb-5 animate-fadeUp glass-card" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-semibold mb-5" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>Everything in Pro</h3>
          <div className="space-y-3.5">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,229,160,0.1)' }}>
                  <span className="text-xs" style={{ color: '#00e5a0' }}>✓</span>
                </div>
                <span className="text-sm" style={{ color: 'rgba(240,240,244,0.65)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center" style={{ color: 'rgba(240,240,244,0.25)' }}>
          No credit card required for trial · Cancel anytime · Instant access
        </p>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
