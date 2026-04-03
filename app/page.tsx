'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getScoreColor, getNovaColor, getNovaEmoji } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'

type RecentScan = {
  barcode: string
  name: string
  quality_score: number
  nova_score: number
  category: string
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        loadRecentScans(data.user.id)
      }
    })
  }, [])

  async function loadRecentScans(userId: string) {
    const { data } = await supabase
      .from('scans')
      .select('barcode, products(name, quality_score, nova_score, category)')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false })
      .limit(5)

    if (data) {
      setRecentScans(
        data.map((s: any) => ({
          barcode: s.barcode,
          name: s.products?.name || 'Unknown',
          quality_score: s.products?.quality_score || 0,
          nova_score: s.products?.nova_score || 0,
          category: s.products?.category || '',
        }))
      )
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
          <span style={{ color: '#f0f0f4' }}>Ingred</span>
          <span style={{ color: '#22c77e' }}>Scan</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/history" className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </Link>
          {user ? (
            <Link href="/account" className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          ) : (
            <button onClick={() => setShowAuth(true)} className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-12 pb-8 max-w-lg mx-auto text-center animate-fadeUp">
        <h2
          className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-4"
          style={{
            fontFamily: 'var(--font-clash), system-ui',
            color: '#f0f0f4',
            letterSpacing: '-2px',
          }}
        >
          Know what&apos;s really in your food
        </h2>
        <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: 'rgba(240,240,244,0.45)' }}>
          Scan any UK supermarket product. Get an instant honest verdict — dual scoring, transparent data, and supermarket-specific swaps.
        </p>

        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#22c77e',
            color: '#0b0b0f',
            boxShadow: '0 0 40px rgba(34,199,126,0.25)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
          Scan a Product
        </Link>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {['3.2M+ Products', '650+ Additives Explained', 'UK Supermarkets Covered'].map((stat) => (
            <span
              key={stat}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#13131a', color: 'rgba(240,240,244,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {stat}
            </span>
          ))}
        </div>
      </section>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <section className="px-4 py-6 max-w-lg mx-auto animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: 'rgba(240,240,244,0.45)' }}>
            Recent Scans
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {recentScans.map((scan) => (
              <Link
                key={scan.barcode}
                href={`/result/${scan.barcode}`}
                className="shrink-0 w-36 rounded-xl p-3 transition-colors hover:brightness-110"
                style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-2xl mb-2">{getCategoryEmoji(scan.category)}</div>
                <p className="text-xs font-medium truncate" style={{ color: '#f0f0f4' }}>{scan.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold" style={{ color: getScoreColor(scan.quality_score) }}>
                    {scan.quality_score.toFixed(1)}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${getNovaColor(scan.nova_score)}20`, color: getNovaColor(scan.nova_score) }}
                  >
                    {getNovaEmoji(scan.nova_score)} {scan.nova_score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why IngredScan */}
      <section className="px-4 py-8 max-w-lg mx-auto">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-clash), system-ui', color: '#f0f0f4' }}>
          Why IngredScan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: 'Dual Scoring', desc: 'NOVA processing level + quality score together for the full picture' },
            { icon: '🛒', title: 'UK Supermarket Swaps', desc: 'Specific alternatives from Tesco, Sainsbury\'s, Asda & Waitrose' },
            { icon: '🔍', title: 'Transparent Data', desc: 'Source shown on every scan — know where the data comes from' },
            { icon: '💬', title: 'Plain English', desc: 'No chemistry degree needed — every additive explained simply' },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-2xl p-4 animate-fadeUp"
              style={{
                backgroundColor: '#13131a',
                border: '1px solid rgba(255,255,255,0.08)',
                animationDelay: `${200 + i * 50}ms`,
              }}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>{feature.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.45)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
