'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getScoreColor } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'
import Logo from '@/components/Logo'
import { useMarket } from '@/components/MarketProvider'
import MarketSelector, { MarketSelectorTrigger } from '@/components/MarketSelector'
import InstallBanner from '@/components/InstallBanner'

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
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'IngredScan',
              url: 'https://www.ingredscan.com',
              description: 'Free food and cosmetic barcode scanner. Instant NOVA processing score, ingredient quality score, additive breakdown, and supermarket swap suggestions for UK and US shoppers.',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web, Android, iOS',
              browserRequirements: 'Requires JavaScript. Camera access for barcode scanning.',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
              featureList: ['Barcode scanning', 'NOVA processing score', 'Ingredient quality score', 'Additive breakdown with scientific sources', 'UK and US supermarket swap suggestions', 'Cosmetic ingredient safety scoring'],
              screenshot: 'https://www.ingredscan.com/api/og',
              creator: { '@type': 'Organization', name: 'IngredScan', url: 'https://www.ingredscan.com' },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'IngredScan',
              url: 'https://www.ingredscan.com',
              logo: 'https://www.ingredscan.com/icons/icon-512.png',
              description: 'Free food and cosmetic barcode scanner.',
              foundingDate: '2026',
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'What is IngredScan?', acceptedAnswer: { '@type': 'Answer', text: 'IngredScan is a free food and cosmetic barcode scanner. Scan any product to see its NOVA processing score, ingredient quality score, additive breakdown, and products that score higher on our criteria from UK and US supermarkets.' } },
                { '@type': 'Question', name: 'Is IngredScan free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, IngredScan is completely free. No subscription, no paywall, no credit card required. All features are available to everyone.' } },
                { '@type': 'Question', name: 'What is a NOVA score?', acceptedAnswer: { '@type': 'Answer', text: 'The NOVA score classifies food by how industrially processed it is, on a scale of 1 to 4. NOVA 1 is whole unprocessed food. NOVA 4 is industrially processed. It was developed by researchers at the University of São Paulo.' } },
                { '@type': 'Question', name: 'Which supermarkets does IngredScan cover?', acceptedAnswer: { '@type': 'Answer', text: 'IngredScan provides swap suggestions from Tesco, Sainsbury\'s, Asda, Waitrose, M&S, Aldi, Lidl (UK) and Whole Foods, Trader Joe\'s, Kroger, Target, Walmart, Costco (US).' } },
                { '@type': 'Question', name: 'Does IngredScan work for cosmetics?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. IngredScan scans food and cosmetic products. For cosmetics it analyses INCI ingredients against known safety data and flags concerning ingredients.' } },
              ],
            },
          ]),
        }}
      />

      {/* Install App Banner — top of page */}
      <section className="px-5 pt-2 max-w-lg mx-auto relative z-10">
        <InstallBanner variant="blog" />
      </section>

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
        <Logo />
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
          in your products
        </h2>
        <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Scan any food or cosmetic product for an instant, honest ingredient breakdown — powered by open data and independent research.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/scan"
            className="btn-glow inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold"
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
          <Link
            href="/search"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold glass-card"
            style={{
              color: '#f4f1f8',
              border: '1px solid rgba(124,111,255,0.25)',
              background: 'linear-gradient(135deg, rgba(124,111,255,0.12), rgba(0,229,160,0.06))',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search Products
          </Link>
        </div>

        {/* Free badge */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(0,229,160,0.1)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.15)' }}>
            100% Free
          </span>
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(124,111,255,0.1)', color: '#7c6fff', border: '1px solid rgba(124,111,255,0.15)' }}>
            No Paywall
          </span>
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(245,166,35,0.1)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.15)' }}>
            Open to All
          </span>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {['3.2M+ Food Products', '1M+ Cosmetics', '650+ Additives', `${config.supported ? config.name : 'Global'} Coverage`].map((stat) => (
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

      {/* Mission banner — big, bold, catchy */}
      <section className="px-5 py-8 max-w-lg mx-auto relative z-10">
        <div
          className="rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,160,0.06) 0%, rgba(124,111,255,0.06) 100%)',
            border: '1px solid rgba(0,229,160,0.1)',
          }}
        >
          <h3
            className="text-xl sm:text-2xl font-bold heading-display mb-3"
            style={{
              background: 'linear-gradient(135deg, #00e5a0 0%, #7c6fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            You deserve to know
            <br />
            what&apos;s in your products.
          </h3>
          <p className="text-sm leading-relaxed max-w-xs mx-auto mb-4" style={{ color: 'rgba(240,240,244,0.55)' }}>
            We&apos;re building the world&apos;s most transparent product scanner — and every scan you make helps improve it for everyone. Be part of something bigger.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🌍</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.5)' }}>Open source data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🤝</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.5)' }}>Community powered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔬</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.5)' }}>Science backed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why IngredScan */}
      <section className="px-5 py-6 max-w-lg mx-auto relative z-10">
        <h3 className="text-lg font-bold heading-display mb-1" style={{ color: '#f0f0f4' }}>
          Built for transparency
        </h3>
        <p className="text-xs mb-4" style={{ color: 'rgba(240,240,244,0.5)' }}>Powered by you and open data</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: 'Dual Scoring', desc: 'Processing level + quality score — two perspectives on every product for the full picture' },
            { icon: '🛒', title: 'Smarter Swaps', desc: 'Products that score higher on our criteria from supermarkets in your area — based on available data. Not affiliated with any retailer' },
            { icon: '🔍', title: 'Transparent Data', desc: 'Every score has a source. Every rating is explained. No black boxes.' },
            { icon: '💬', title: 'Plain English', desc: 'No chemistry degree needed — join thousands of people who finally understand food labels' },
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

      {/* What you can scan */}
      <section className="px-5 py-6 max-w-lg mx-auto relative z-10">
        <h3 className="text-base font-semibold heading-display mb-4" style={{ color: '#f0f0f4' }}>
          What you can scan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '🥫', title: 'Food', desc: '3.2M+ products worldwide', active: true },
            { emoji: '💄', title: 'Cosmetics', desc: '1M+ beauty products', active: true },
            { emoji: '🐾', title: 'Pet Food', desc: 'Coming soon', active: false },
            { emoji: '🧹', title: 'Cleaning', desc: 'Coming soon', active: false },
          ].map((cat, i) => (
            <div
              key={cat.title}
              className="rounded-2xl p-4 glass-card animate-fadeUp"
              style={{
                animationDelay: `${400 + i * 50}ms`,
                opacity: cat.active ? 1 : 0.5,
              }}
            >
              <div className="text-2xl mb-2">{cat.emoji}</div>
              <h4 className="text-sm font-semibold mb-0.5" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>{cat.title}</h4>
              <p className="text-xs" style={{ color: cat.active ? 'rgba(240,240,244,0.4)' : 'rgba(240,240,244,0.4)' }}>{cat.desc}</p>
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
            <p className="text-sm" style={{ color: 'rgba(240,240,244,0.45)' }}>
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
