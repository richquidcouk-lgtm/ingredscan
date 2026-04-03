'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { QualityScoreCard, NovaScoreCard } from '@/components/ScoreCard'
import NutriScoreBar from '@/components/NutriScoreBar'
import AdditiveCard from '@/components/AdditiveCard'
import SwapCard from '@/components/SwapCard'
import ShareButton from '@/components/ShareCard'
import ProductReport from '@/components/ProductReport'
import SkeletonResult from '@/components/SkeletonResult'
import UpgradeModal from '@/components/UpgradeModal'
import { supabase, type Product, type NutritionData } from '@/lib/supabase'
import { getCategoryEmoji, incrementAnonScanCount, getAnonScanCount } from '@/lib/utils'
import swapsData from '@/data/swaps.json'

type Tab = 'overview' | 'additives' | 'swaps'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const barcode = params.barcode as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [matchedSwaps, setMatchedSwaps] = useState<any[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    if (!barcode) return
    fetchProduct()
  }, [barcode])

  async function checkScanLimit(): Promise<boolean> {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if Pro user
      const { data: profile } = await supabase
        .from('profiles')
        .select('pro, scan_count_today, scan_date')
        .eq('id', user.id)
        .single()

      if (profile?.pro) return true // Pro = unlimited

      // Free logged-in user: 10 scans per day
      const today = new Date().toISOString().split('T')[0]
      const scanCount = profile?.scan_date === today ? (profile?.scan_count_today || 0) : 0

      if (scanCount >= 10) return false

      // Increment count
      await supabase
        .from('profiles')
        .update({
          scan_count_today: scanCount + 1,
          scan_date: today,
        })
        .eq('id', user.id)

      return true
    }

    // Anonymous: 3 scans per session
    if (getAnonScanCount() >= 3) return false
    return true
  }

  async function fetchProduct() {
    setLoading(true)
    setError(null)

    // Check scan limit first
    const canScan = await checkScanLimit()
    if (!canScan) {
      setLimitReached(true)
      setShowUpgrade(true)
      setLoading(false)
      return
    }

    try {
      // Check Supabase cache first
      const { data: cached } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single()

      if (cached) {
        setProduct(cached as Product)
        findSwaps(cached.category || '')
        setLoading(false)
        recordScan()
        return
      }
    } catch {
      // Not cached, proceed to API
    }

    try {
      const res = await fetch(`/api/scan?barcode=${barcode}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('not_found')
        } else {
          setError('api_error')
        }
        setLoading(false)
        return
      }

      const data = await res.json()
      setProduct(data as Product)
      findSwaps(data.category || '')
      recordScan()
    } catch {
      setError('api_error')
    }

    setLoading(false)
  }

  async function recordScan() {
    incrementAnonScanCount()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('scans').insert({
        user_id: user.id,
        barcode,
        scanned_at: new Date().toISOString(),
      })
    }
  }

  function findSwaps(category: string) {
    const categoryLower = category.toLowerCase()
    for (const group of swapsData) {
      if (group.keywords.some(kw => categoryLower.includes(kw))) {
        setMatchedSwaps(group.swaps)
        return
      }
    }
    setMatchedSwaps([])
  }

  if (limitReached) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
          Daily scan limit reached
        </h2>
        <p className="text-sm mb-6 max-w-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>
          Upgrade to Pro for unlimited scans, full additive detail, and UK supermarket swaps.
        </p>
        <Link
          href="/pro"
          className="px-6 py-3 rounded-xl text-sm font-medium btn-glow"
          style={{ color: '#0b0b0f' }}
        >
          View Pro Plans — from £3.99/mo
        </Link>
        <button
          onClick={() => router.back()}
          className="mt-3 text-sm"
          style={{ color: 'rgba(240,240,244,0.4)' }}
        >
          Go back
        </button>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto relative z-10">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl glass-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
            </svg>
          </button>
          <div className="w-10" />
        </header>
        <SkeletonResult />
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>Product not found</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
          We couldn&apos;t find this product in our database. It may not be listed yet.
        </p>
        <Link href="/scan" className="btn-glow px-6 py-3 rounded-xl text-sm font-medium" style={{ color: '#0b0b0f' }}>
          Scan Another Product
        </Link>
      </div>
    )
  }

  if (error === 'api_error' || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
          We couldn&apos;t fetch the product data. Please try again.
        </p>
        <button onClick={fetchProduct} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: '#7c6fff', color: '#fff' }}>
          Retry
        </button>
      </div>
    )
  }

  const nutrition = (product.nutrition || {}) as NutritionData
  const additives = product.additives || []

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto relative z-10">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <ShareButton product={product} />
      </header>

      <div className="px-5 max-w-lg mx-auto space-y-4 relative z-10">
        {/* Product header */}
        <div className="rounded-2xl p-5 animate-fadeUp glass-card">
          <div className="flex items-start gap-4">
            {product.image_url ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: '#1c1c26' }}>
                <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                {getCategoryEmoji(product.category || '')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold leading-tight heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
                {product.name}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(240,240,244,0.4)' }}>{product.brand}</p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {detectFlagsFromProduct(product).map((flag) => (
                  <span key={flag} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#ff5a5a15', color: '#ff5a5a', border: '1px solid rgba(255,90,90,0.1)' }}>
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dual score */}
        <div className="flex gap-3 animate-fadeUp" style={{ animationDelay: '50ms' }}>
          <QualityScoreCard score={product.quality_score} />
          <NovaScoreCard score={product.nova_score} />
        </div>

        {/* Data source */}
        <div
          className="rounded-xl px-4 py-3 text-center animate-fadeUp glass-subtle"
          style={{ borderColor: 'rgba(124,111,255,0.15)', animationDelay: '100ms' }}
        >
          <p className="text-xs font-medium" style={{ color: '#7c6fff' }}>
            🔍 {product.data_source} · {product.confidence}% verified
          </p>
        </div>

        {/* Low confidence warning */}
        {(product as any).warning && (
          <div
            className="rounded-xl px-4 py-3 animate-fadeUp flex items-center gap-2.5"
            style={{
              backgroundColor: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.15)',
              animationDelay: '110ms',
            }}
          >
            <span className="text-base">⚠️</span>
            <p className="text-xs" style={{ color: '#f5a623' }}>
              {(product as any).warning}
            </p>
          </div>
        )}

        {/* Report issue */}
        <ProductReport barcode={barcode} />

        {/* Nutri-Score */}
        <div className="animate-fadeUp" style={{ animationDelay: '150ms' }}>
          <NutriScoreBar grade={product.nutriscore_grade || ''} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl animate-fadeUp glass" style={{ animationDelay: '200ms' }}>
          {[
            { id: 'overview' as Tab, label: 'Overview' },
            { id: 'additives' as Tab, label: `Additives (${additives.length})` },
            { id: 'swaps' as Tab, label: `Swaps (${matchedSwaps.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab.id ? 'rgba(28,28,38,0.9)' : 'transparent',
                color: activeTab === tab.id ? '#f0f0f4' : 'rgba(240,240,244,0.4)',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fadeUp" style={{ animationDelay: '250ms' }}>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Ingredients */}
              {product.ingredients && (
                <div className="rounded-2xl p-5 glass-card">
                  <h3 className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
                    Ingredients
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,244,0.65)' }}>
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* Nutrition table */}
              <div className="rounded-2xl p-5 glass-card">
                <h3 className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
                  Nutrition per 100g
                </h3>
                <div className="space-y-0">
                  {[
                    { label: 'Energy', value: nutrition.energy, unit: 'kcal' },
                    { label: 'Fat', value: nutrition.fat, unit: 'g' },
                    { label: 'Saturated Fat', value: nutrition.saturated_fat, unit: 'g' },
                    { label: 'Carbohydrates', value: nutrition.carbs, unit: 'g' },
                    { label: 'Sugars', value: nutrition.sugars, unit: 'g' },
                    { label: 'Fibre', value: nutrition.fibre, unit: 'g' },
                    { label: 'Protein', value: nutrition.protein, unit: 'g' },
                    { label: 'Salt', value: nutrition.salt, unit: 'g' },
                  ].map((row, i) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-2.5"
                      style={{ borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <span className="text-sm" style={{ color: 'rgba(240,240,244,0.5)' }}>{row.label}</span>
                      <span className="text-sm font-medium" style={{ color: '#f0f0f4' }}>
                        {row.value != null ? `${Number(row.value).toFixed(1)}${row.unit}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'additives' && (
            <div className="space-y-2">
              {additives.length === 0 ? (
                <div className="rounded-2xl p-6 text-center glass-card" style={{ borderColor: 'rgba(0,229,160,0.15)' }}>
                  <p className="text-sm font-medium" style={{ color: '#00e5a0' }}>
                    No concerning additives found ✓
                  </p>
                </div>
              ) : (
                <>
                  {additives.map((additive, i) => (
                    <AdditiveCard key={additive.code} additive={additive} index={i} />
                  ))}
                  <p className="text-xs text-center pt-3" style={{ color: 'rgba(240,240,244,0.25)' }}>
                    Risk levels based on EU Reg 1333/2008 and UK FSA guidelines
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === 'swaps' && (
            <div className="space-y-2">
              {matchedSwaps.length === 0 ? (
                <div className="rounded-2xl p-6 text-center glass-card">
                  <p className="text-sm" style={{ color: 'rgba(240,240,244,0.4)' }}>
                    No swaps available for this product category yet.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium mb-3" style={{ color: 'rgba(240,240,244,0.4)' }}>
                    Better alternatives at UK supermarkets
                  </p>
                  {matchedSwaps.map((swap, i) => (
                    <SwapCard key={i} swap={swap} currentScore={product.quality_score} index={i} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 glass"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-lg mx-auto px-5 py-4">
          <Link
            href="/scan"
            className="block w-full text-center py-3.5 rounded-xl text-sm font-semibold btn-glow transition-all"
            style={{ color: '#0b0b0f' }}
          >
            Scan Another Product
          </Link>
        </div>
      </div>
    </div>
  )
}

function detectFlagsFromProduct(product: Product): string[] {
  const flags: string[] = []
  if (product.nova_score === 4) flags.push('Ultra-Processed')
  const n = product.nutrition as NutritionData
  if (n) {
    if ((n.sugars || 0) > 10) flags.push('High Sugar')
    if ((n.salt || 0) > 1.5) flags.push('High Salt')
    if ((n.saturated_fat || 0) > 5) flags.push('High Saturated Fat')
  }
  const additives = product.additives || []
  const colorCodes = ['e102', 'e104', 'e110', 'e122', 'e124', 'e129']
  if (additives.some(a => colorCodes.some(c => a.code.toLowerCase().includes(c)))) {
    flags.push('Artificial Colours')
  }
  return flags
}
