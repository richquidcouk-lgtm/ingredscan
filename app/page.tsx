'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getScoreColor } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'
import { useMarket } from '@/components/MarketProvider'
import MarketSelector, { MarketSelectorTrigger } from '@/components/MarketSelector'

type RecentScan = {
  barcode: string
  name: string
  brand: string
  quality_score: number
  nova_score: number
  category: string
  image_url?: string
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [showAuth, setShowAuth] = useState(false)
  const [showMarketSelector, setShowMarketSelector] = useState(false)
  const { config } = useMarket()

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
      .select('barcode, products(name, brand, quality_score, nova_score, category, image_url)')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false })
      .limit(10)

    if (data) {
      setRecentScans(
        data.map((s: any) => ({
          barcode: s.barcode,
          name: s.products?.name || 'Unknown',
          brand: s.products?.brand || '',
          quality_score: s.products?.quality_score || 0,
          nova_score: s.products?.nova_score || 0,
          category: s.products?.category || '',
          image_url: s.products?.image_url || '',
        }))
      )
    }
  }

  function getScoreBg(score: number): string {
    if (score < 4.5) return 'rgba(255,90,90,0.15)'
    if (score <= 7) return 'rgba(245,166,35,0.15)'
    return 'rgba(0,229,160,0.15)'
  }

  return (
    <div className="min-h-screen pb-20 relative">
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

      {/* Subtle radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,229,160,0.05) 0%, rgba(124,111,255,0.03) 40%, transparent 70%)',
        }}
      />

      {/* Header — logo centered, market selector subtle */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2 max-w-lg mx-auto relative z-10">
        <MarketSelectorTrigger onClick={() => setShowMarketSelector(true)} />
        <h1 className="text-xl font-extrabold heading-display" style={{ letterSpacing: '-0.04em' }}>
          <span style={{ color: '#f0f0f4' }}>Ingred</span>
          <span style={{ color: '#00e5a0' }}>Scan</span>
        </h1>
        {user ? (
          <Link href="/account" className="p-2.5 rounded-xl glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#7c6fff', color: '#fff' }}>
                {(user.email || '?')[0].toUpperCase()}
              </div>
            )}
          </Link>
        ) : (
          <button onClick={() => setShowAuth(true)} className="p-2.5 rounded-xl glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}
      </header>

      {/* Hero */}
      <section className="px-5 pt-10 pb-6 max-w-lg mx-auto text-center relative z-10 animate-fadeUp">
        <h2
          className="text-3xl sm:text-4xl heading-display mb-4"
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
        <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Scan any supermarket product worldwide. Get an instant honest verdict — dual scoring, transparent data, and smarter alternatives.
        </p>

        <Link
          href="/scan"
          className="btn-glow inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-base font-semibold"
          style={{ color: '#0b0b0f' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
          {['3.2M+ Products', '650+ Additives Explained', `${config.supported ? config.name : 'Global'} Coverage`].map((stat) => (
            <span
              key={stat}
              className="px-3 py-1.5 rounded-full text-xs font-medium glass-subtle"
              style={{ color: 'rgba(240,240,244,0.5)' }}
            >
              {stat}
            </span>
          ))}
        </div>
      </section>

      {/* Why IngredScan */}
      <section className="px-5 py-6 max-w-lg mx-auto relative z-10">
        <h3 className="text-base font-semibold heading-display mb-4" style={{ color: '#f0f0f4' }}>
          Why IngredScan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: 'Dual Scoring', desc: 'NOVA processing level + quality score together for the full picture' },
            { icon: '🛒', title: 'Smarter Swaps', desc: 'Healthier alternatives from supermarkets in your market' },
            { icon: '🔍', title: 'Transparent Data', desc: 'Source shown on every scan — know where the data comes from' },
            { icon: '💬', title: 'Plain English', desc: 'No chemistry degree needed — every additive explained simply' },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-2xl p-4 glass-card card-hover-glow animate-fadeUp"
              style={{ animationDelay: `${200 + i * 50}ms` }}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>{feature.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Scans or Empty State */}
      <section className="px-5 pt-4 max-w-lg mx-auto relative z-10 animate-fadeUp" style={{ animationDelay: '100ms' }}>
        {recentScans.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'rgba(240,240,244,0.5)' }}>
                Recent Scans
              </h3>
              <Link href="/history" className="text-xs font-medium" style={{ color: '#7c6fff' }}>
                View all
              </Link>
            </div>
            <div className="space-y-1.5">
              {recentScans.map((scan) => (
                <Link
                  key={scan.barcode}
                  href={`/result/${scan.barcode}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card transition-all duration-200"
                >
                  {scan.image_url ? (
                    <img src={scan.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="text-xl w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                      {getCategoryEmoji(scan.category)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>{scan.name}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.4)' }}>{scan.brand}</p>
                  </div>
                  <span
                    className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: getScoreBg(scan.quality_score),
                      color: getScoreColor(scan.quality_score),
                    }}
                  >
                    {scan.quality_score.toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.15)" strokeWidth="1.5" strokeLinecap="round" className="mx-auto">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="7" y1="12" x2="17" y2="12" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: 'rgba(240,240,244,0.3)' }}>
              Recent scans will appear here
            </p>
          </div>
        )}
      </section>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showMarketSelector && <MarketSelector onClose={() => setShowMarketSelector(false)} />}
    </div>
  )
}
