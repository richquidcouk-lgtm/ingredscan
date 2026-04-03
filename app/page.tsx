'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getScoreColor, getNovaColor, getNovaEmoji } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'
import { useMarket } from '@/components/MarketProvider'
import MarketSelector, { MarketSelectorTrigger } from '@/components/MarketSelector'

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
  const [showMarketSelector, setShowMarketSelector] = useState(false)
  const { market, config } = useMarket()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        loadRecentScans(data.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadRecentScans(session.user.id)
      } else {
        setUser(null)
        setRecentScans([])
      }
    })

    return () => subscription.unsubscribe()
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
    <div className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'IngredScan',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web, iOS, Android',
            description: 'Scan any supermarket product. Get an instant honest verdict — dual scoring, transparent data, and supermarket-specific swaps.',
            url: 'https://www.ingredscan.com',
            offers: [
              {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'GBP',
                name: 'Free',
                description: 'Up to 10 scans per day',
              },
              {
                '@type': 'Offer',
                price: '3.99',
                priceCurrency: 'GBP',
                name: 'Pro Monthly',
                description: 'Unlimited scans and all features',
              },
              {
                '@type': 'Offer',
                price: '29.99',
                priceCurrency: 'GBP',
                name: 'Pro Yearly',
                description: 'Unlimited scans and all features',
              },
            ],
            featureList: 'Barcode scanning, NOVA score, Quality score, Additive analysis, Supermarket swaps, Nutritional breakdown',
          }),
        }}
      />
      {/* Hero radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,229,160,0.07) 0%, rgba(124,111,255,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-5 max-w-lg mx-auto relative z-10">
        <h1 className="text-xl font-extrabold heading-display" style={{ letterSpacing: '-0.04em' }}>
          <span style={{ color: '#f0f0f4' }}>Ingred</span>
          <span style={{ color: '#00e5a0' }}>Scan</span>
        </h1>
        <div className="flex items-center gap-2.5">
          <MarketSelectorTrigger onClick={() => setShowMarketSelector(true)} />
          <Link href="/history" className="p-2.5 rounded-xl glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </Link>
          {user ? (
            <Link href="/account" className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#7c6fff', color: '#fff' }}>
                  {(user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium hidden sm:inline" style={{ color: 'rgba(240,240,244,0.7)' }}>
                {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
              </span>
            </Link>
          ) : (
            <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.5)' }}>Sign in</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-16 pb-10 max-w-lg mx-auto text-center relative z-10 animate-fadeUp">
        <h2
          className="text-4xl sm:text-5xl heading-display mb-5"
          style={{
            background: 'linear-gradient(135deg, #f0f0f4 0%, #00e5a0 50%, #7c6fff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Know what&apos;s really
          <br />
          in your food
        </h2>
        <p className="text-base mb-10 max-w-sm mx-auto leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)', letterSpacing: '-0.01em' }}>
          {market === 'uk'
            ? 'Scan any UK supermarket product. Get an instant honest verdict \u2014 dual scoring, transparent data, and supermarket-specific swaps.'
            : market === 'us'
            ? 'Scan any product from Walmart, Kroger, Whole Foods and more. Get an instant honest verdict \u2014 dual scoring, transparent data, and swaps.'
            : market === 'other'
            ? 'Scan any food product anywhere in the world. Get an instant honest verdict \u2014 dual scoring, transparent data, and more.'
            : `Scan any ${config.name} supermarket product. Get an instant honest verdict \u2014 dual scoring, transparent data, and supermarket-specific swaps.`
          }
        </p>

        <Link
          href="/scan"
          className="btn-glow inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold"
          style={{ color: '#0b0b0f' }}
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
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
          {(market === 'uk'
            ? ['180K+ UK Products', '650+ Additives Explained', 'UK Supermarkets Covered']
            : config.comingSoon
            ? ['3.2M+ Products Worldwide', '650+ Additives Explained', `${config.name} Swaps Coming Soon`]
            : ['3.2M+ Products Worldwide', '650+ Additives Explained', 'Scan Any Product']
          ).map((stat) => (
            <span
              key={stat}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium glass-subtle"
              style={{ color: 'rgba(240,240,244,0.5)' }}
            >
              {stat}
            </span>
          ))}
        </div>
      </section>

      {/* Gradient divider */}
      <div className="gradient-divider max-w-xs mx-auto my-2" />

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <section className="px-5 py-8 max-w-lg mx-auto relative z-10 animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(240,240,244,0.35)' }}>
            Recent Scans
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {recentScans.map((scan) => (
              <Link
                key={scan.barcode}
                href={`/result/${scan.barcode}`}
                className="shrink-0 w-36 rounded-2xl p-3.5 glass-card card-hover-glow"
              >
                <div className="text-2xl mb-2">{getCategoryEmoji(scan.category)}</div>
                <p className="text-xs font-medium truncate" style={{ color: '#f0f0f4' }}>{scan.name}</p>
                <div className="flex items-center gap-2 mt-2.5">
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
      <section className="px-5 py-10 max-w-lg mx-auto relative z-10">
        <h3 className="text-lg font-bold heading-display mb-5" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
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
              className="rounded-2xl p-4 glass-card card-hover-glow animate-fadeUp"
              style={{
                animationDelay: `${200 + i * 80}ms`,
              }}
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h4 className="text-sm font-semibold mb-1.5" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>{feature.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showMarketSelector && <MarketSelector onClose={() => setShowMarketSelector(false)} />}
    </div>
  )
}
