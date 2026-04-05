'use client'

import { useState, useEffect } from 'react'
import { useMarket } from '@/components/MarketProvider'

type TopMarket = {
  market: string
  count: number
  flag: string
  name: string
}

export default function ComingSoonSwaps() {
  const { config } = useMarket()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)
  const [topMarkets, setTopMarkets] = useState<TopMarket[]>([])

  useEffect(() => {
    // Fetch current count for this market on mount
    fetchWaitlistInfo()
  }, [config.code])

  async function fetchWaitlistInfo() {
    try {
      const res = await fetch('/api/market/waitlist?market=' + config.code)
      if (res.ok) {
        const data = await res.json()
        setWaitlistCount(data.count ?? null)
        setTopMarkets(data.topMarkets ?? [])
      }
    } catch {
      // Non-critical, ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/market/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, market: config.code }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(true)
        setWaitlistCount(data.count ?? null)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3 animate-fadeUp">
      <div className="rounded-2xl p-6 text-center glass-card">
        <div className="text-5xl mb-4">{config.flag}</div>
        <h3
          className="text-lg font-bold heading-display mb-2"
          style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}
        >
          Swaps coming to {config.flag} {config.name}
        </h3>
        <p className="text-sm mb-5 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(240,240,244,0.45)' }}>
          Scanning works everywhere, but supermarket swaps are built market-by-market. We are working on {config.name} next.
        </p>

        {success ? (
          <div className="py-4">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,229,160,0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#00e5a0' }}>
              You are on the list!
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(240,240,244,0.4)' }}>
              We will email you when {config.name} swaps go live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 max-w-xs mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none glass-input"
              style={{ color: '#f0f0f4' }}
            />
            {error && <p className="text-xs" style={{ color: '#ff5a5a' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold btn-glow disabled:opacity-50 transition-all"
              style={{ color: '#0b0b0f' }}
            >
              {loading ? 'Joining...' : 'Notify Me'}
            </button>
          </form>
        )}

        {waitlistCount != null && waitlistCount > 0 && (
          <p className="text-xs mt-4" style={{ color: 'rgba(240,240,244,0.45)' }}>
            {waitlistCount} {waitlistCount === 1 ? 'person' : 'people'} waiting for {config.name}
          </p>
        )}
      </div>

      {/* Mini leaderboard */}
      {topMarkets.length > 0 && (
        <div className="rounded-2xl p-5 glass-card">
          <h4 className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
            Most requested markets
          </h4>
          <div className="space-y-2">
            {topMarkets.map((tm, i) => (
              <div
                key={tm.market}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: i < topMarkets.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium" style={{ color: 'rgba(240,240,244,0.45)', minWidth: '16px' }}>
                    {i + 1}.
                  </span>
                  <span className="text-base">{tm.flag}</span>
                  <span className="text-sm" style={{ color: '#f0f0f4' }}>{tm.name}</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(124,111,255,0.1)', color: '#7c6fff' }}>
                  {tm.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
