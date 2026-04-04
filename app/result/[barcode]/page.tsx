'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { QualityScoreCard, NovaScoreCard } from '@/components/ScoreCard'
import NutriScoreBar from '@/components/NutriScoreBar'
import RAGIndicator from '@/components/RAGIndicator'
import AdditiveCard from '@/components/AdditiveCard'
import SwapCard from '@/components/SwapCard'
import ShareButton from '@/components/ShareCard'
import ProductReport from '@/components/ProductReport'
import SkeletonResult from '@/components/SkeletonResult'
import UpgradeModal from '@/components/UpgradeModal'
import { supabase, type Product, type NutritionData } from '@/lib/supabase'
import { getCategoryEmoji, incrementAnonScanCount, getAnonScanCount } from '@/lib/utils'
import { useMarket } from '@/components/MarketProvider'
import ComingSoonSwaps from '@/components/ComingSoonSwaps'
import Logo from '@/components/Logo'
import swapsData from '@/data/swaps.json'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const barcode = params.barcode as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchedSwaps, setMatchedSwaps] = useState<any[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const { config } = useMarket()

  useEffect(() => {
    if (!barcode) return
    fetchProduct()
  }, [barcode])

  async function checkScanLimit(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('pro, scan_count_today, scan_date')
        .eq('id', user.id)
        .single()

      if (profile?.pro) return true

      const today = new Date().toISOString().split('T')[0]
      const scanCount = profile?.scan_date === today ? (profile?.scan_count_today || 0) : 0

      if (scanCount >= 10) return false

      await supabase
        .from('profiles')
        .update({
          scan_count_today: scanCount + 1,
          scan_date: today,
        })
        .eq('id', user.id)

      return true
    }

    if (getAnonScanCount() >= 3) return false
    return true
  }

  async function fetchProduct() {
    setLoading(true)
    setError(null)

    const canScan = await checkScanLimit()
    if (!canScan) {
      setLimitReached(true)
      setShowUpgrade(true)
      setLoading(false)
      return
    }

    try {
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Use API route to record scan with service role (avoids RLS issues)
        await fetch('/api/scan/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, barcode }),
        })
      }
    } catch {
      // Don't block the result page if recording fails
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

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (limitReached) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative pb-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
          Daily scan limit reached
        </h2>
        <p className="text-sm mb-6 max-w-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>
          Upgrade to Pro for unlimited scans, full additive detail, and supermarket swaps.
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
      <div className="min-h-screen relative pb-20">
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative pb-20">
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative pb-20">
        <div className="text-5xl mb-4">⚠</div>
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
  const flags = detectFlagsFromProduct(product)

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Sticky header bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 max-w-lg mx-auto"
        style={{
          background: 'rgba(11,11,15,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <button onClick={() => router.back()} className="p-2 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <Logo size="small" />
        <ShareButton product={product} />
      </header>

      <div className="px-5 max-w-lg mx-auto space-y-4 relative z-10">
        {/* 1. Product card */}
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
              <h2 className="text-lg font-bold leading-tight heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
                {product.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(240,240,244,0.4)' }}>{product.brand}</p>
              {flags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {flags.map((flag) => (
                    <span key={flag} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#ff5a5a15', color: '#ff5a5a', border: '1px solid rgba(255,90,90,0.1)' }}>
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Score section */}
        <div className="flex gap-3 animate-fadeUp" style={{ animationDelay: '50ms' }}>
          <QualityScoreCard score={product.quality_score} />
          <NovaScoreCard score={product.nova_score} />
        </div>

        {/* 3. Quick flags — anchor links */}
        {(additives.length > 0 || product.nova_score === 4) && (
          <div className="flex gap-2 animate-fadeUp" style={{ animationDelay: '80ms' }}>
            {additives.length > 0 && (
              <button
                onClick={() => scrollToSection('section-additives')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(255,90,90,0.08)',
                  color: '#ff5a5a',
                  border: '1px solid rgba(255,90,90,0.12)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6,9 12,15 18,9" />
                </svg>
                Additives ({additives.length})
              </button>
            )}
            {product.nova_score === 4 && (
              <button
                onClick={() => scrollToSection('section-additives')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(255,90,90,0.08)',
                  color: '#ff5a5a',
                  border: '1px solid rgba(255,90,90,0.12)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6,9 12,15 18,9" />
                </svg>
                Ultra Processed
              </button>
            )}
          </div>
        )}

        {/* 4. Safer Alternatives (Swaps) */}
        <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
            Safer Alternatives
          </h3>
          {!config.supported ? (
            <ComingSoonSwaps />
          ) : matchedSwaps.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {matchedSwaps.map((swap, i) => (
                <SwapCard key={i} swap={swap} currentScore={product.quality_score} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-5 glass-card">
              <p className="text-sm" style={{ color: 'rgba(240,240,244,0.4)' }}>
                No swaps available for this product category yet. We&apos;re adding more every week.
              </p>
            </div>
          )}
        </div>

        {/* 5. Additives section */}
        <div id="section-additives" className="animate-fadeUp" style={{ animationDelay: '150ms' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
            Additives
          </h3>
          {additives.length === 0 ? (
            <div className="rounded-2xl p-5 text-center glass-card" style={{ borderColor: 'rgba(0,229,160,0.15)' }}>
              <p className="text-sm font-medium" style={{ color: '#00e5a0' }}>
                No concerning additives found
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {additives.map((additive, i) => (
                <AdditiveCard key={additive.code} additive={additive} index={i} />
              ))}
              <p className="text-xs text-center pt-3" style={{ color: 'rgba(240,240,244,0.25)' }}>
                Risk levels based on {config.regulatoryRef}
              </p>
            </div>
          )}
        </div>

        {/* 6. RAG Indicator */}
        <div className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
          <RAGIndicator score={product.quality_score} />
        </div>

        {/* 7. Nutri-Score bar */}
        <div className="animate-fadeUp" style={{ animationDelay: '220ms' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
            Nutri-Score
          </h3>
          <NutriScoreBar grade={product.nutriscore_grade || ''} />
        </div>

        {/* 7. Nutrition table */}
        <div className="rounded-2xl p-5 glass-card animate-fadeUp" style={{ animationDelay: '250ms' }}>
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
                  {row.value != null ? `${Number(row.value).toFixed(1)}${row.unit}` : '\u2014'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Ingredients */}
        {product.ingredients && (
          <div className="rounded-2xl p-5 glass-card animate-fadeUp" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Ingredients
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,244,0.65)' }}>
              {product.ingredients}
            </p>
          </div>
        )}

        {/* 9. Data source + confidence */}
        <div
          className="rounded-xl px-4 py-3 text-center animate-fadeUp glass-subtle"
          style={{ borderColor: 'rgba(124,111,255,0.15)', animationDelay: '350ms' }}
        >
          <p className="text-xs font-medium" style={{ color: '#7c6fff' }}>
            {product.data_source} · {product.confidence}% verified
          </p>
        </div>

        {/* Low confidence warning */}
        {(product as any)?.warning && (
          <div
            className="rounded-xl px-4 py-3 animate-fadeUp flex items-center gap-2.5"
            style={{
              backgroundColor: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.15)',
              animationDelay: '360ms',
            }}
          >
            <span className="text-base">⚠</span>
            <p className="text-xs" style={{ color: '#f5a623' }}>
              {(product as any)?.warning}
            </p>
          </div>
        )}

        {/* 10. Report an issue */}
        <ProductReport barcode={barcode} />
      </div>

      {/* Sticky bottom: Scan Another Product */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(11,11,15,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="max-w-lg mx-auto px-5 py-3">
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
