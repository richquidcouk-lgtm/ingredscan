'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { QualityScoreCard } from '@/components/ScoreCard'
import ProcessingLevelCard from '@/components/ProcessingLevelCard'
import NutriScoreBar from '@/components/NutriScoreBar'
import RAGIndicator from '@/components/RAGIndicator'
import AdditiveDetail from '@/components/AdditiveDetail'
import NutritionBreakdown from '@/components/NutritionBreakdown'
import SwapCard from '@/components/SwapCard'
import ShareButton from '@/components/ShareCard'
import ProductReport from '@/components/ProductReport'
import SkeletonResult from '@/components/SkeletonResult'
import CosmeticResult from '@/components/CosmeticResult'
import FavouriteButton from '@/components/FavouriteButton'
import InfantFormulaResult from '@/components/InfantFormulaResult'
import MedicineResult from '@/components/MedicineResult'
import SupplementResult from '@/components/SupplementResult'
import { calculateCosmeticScore } from '@/lib/cosmeticScoring'
import { getNovaEmoji, getNovaLabel, resolveAdditives } from '@/lib/scoring'
import { getRegulatoryRef } from '@/lib/regulatoryRefs'
import { detectSpecialCategory } from '@/lib/specialCategories'
import { supabase, type Product, type NutritionData } from '@/lib/supabase'
import { getCategoryEmoji, incrementAnonScanCount } from '@/lib/utils'
import { useMarket } from '@/components/MarketProvider'
import ComingSoonSwaps from '@/components/ComingSoonSwaps'
import Logo from '@/components/Logo'
import swapsData from '@/data/swaps.json'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const barcode = params.barcode as string
  const isNewScan = searchParams.get('source') === 'scan'
  const hasRecorded = useRef(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [cosmeticScore, setCosmeticScore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchedSwaps, setMatchedSwaps] = useState<any[]>([])
  const { config } = useMarket()

  useEffect(() => {
    if (!barcode) return
    fetchProduct()
  }, [barcode])

  async function fetchProduct() {
    setLoading(true)
    setError(null)

    try {
      const { data: cached } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single()

      if (cached) {
        setProduct(cached as Product)
        // Compute cosmetic score for cached cosmetic products
        if (cached.product_type === 'cosmetic' && cached.inci_ingredients) {
          const score = calculateCosmeticScore(cached, cached.inci_ingredients)
          setCosmeticScore(score)
        }
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
      if (data.cosmetic_score) setCosmeticScore(data.cosmetic_score)
      findSwaps(data.category || '')
      recordScan()
    } catch {
      setError('api_error')
    }

    setLoading(false)
  }

  async function recordScan() {
    // Only record if this is a fresh scan (not from history/recents) and hasn't been recorded yet
    if (!isNewScan || hasRecorded.current) return
    hasRecorded.current = true

    incrementAnonScanCount()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
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
    const marketCode = config.code
    for (const group of swapsData) {
      if (group.keywords.some((kw: string) => categoryLower.includes(kw))) {
        const marketSwaps = group.swaps.filter((s: any) =>
          !s.market || s.market === marketCode
        )
        setMatchedSwaps(marketSwaps)
        return
      }
    }
    setMatchedSwaps([])
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  // Render cosmetic result if product is a cosmetic
  if (product.product_type === 'cosmetic') {
    return (
      <CosmeticResult
        product={product}
        cosmeticScore={cosmeticScore}
        onBack={() => router.back()}
      />
    )
  }

  // Special category detection
  const specialCategory = detectSpecialCategory(product)

  if (specialCategory === 'infant_formula') {
    return <InfantFormulaResult product={product} onBack={() => router.back()} />
  }
  if (specialCategory === 'medicine') {
    return <MedicineResult product={product} onBack={() => router.back()} />
  }
  if (specialCategory === 'supplement') {
    return <SupplementResult product={product} onBack={() => router.back()} />
  }

  const nutrition = (product.nutrition || {}) as NutritionData
  // Re-resolve additives from our local database to get full detail
  // (cached products may have older additive data without descriptions)
  const rawAdditives = product.additives || []
  const additives = rawAdditives.length > 0
    ? resolveAdditives(rawAdditives.map((a: any) => `en:${a.code || a}`))
    : []
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
        <div className="flex items-center gap-1.5">
          <FavouriteButton barcode={barcode} />
          <ShareButton product={product} />
        </div>
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
              {product.name && /[éèêëàâäùûüôöîïçñæœß]/.test(product.name) && (
                <p className="text-xs mt-1" style={{ color: 'rgba(240,240,244,0.45)' }}>
                  Name shown in original language — English not available for this product.
                </p>
              )}
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
          <ProcessingLevelCard
            novaScore={product.nova_score}
            novaSource={(product as any).nova_source}
          />
        </div>

        {/* 3. Quick flags — anchor links and NOVA chips */}
        <div className="flex flex-wrap gap-2 animate-fadeUp" style={{ animationDelay: '80ms' }}>
          {/* NOVA chip — green for 1-2, amber for 3-4 */}
          {product.nova_score <= 2 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ backgroundColor: 'rgba(34,199,126,0.08)', color: '#22c77e', border: '1px solid rgba(34,199,126,0.12)' }}>
              {getNovaEmoji(product.nova_score)} {getNovaLabel(product.nova_score)}
            </span>
          )}
          {product.nova_score >= 3 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ backgroundColor: 'rgba(245,166,35,0.08)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.12)' }}>
              {getNovaEmoji(product.nova_score)} {getNovaLabel(product.nova_score)}
            </span>
          )}
          {additives.length > 0 && (
            <button
              onClick={() => scrollToSection('section-additives')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{ backgroundColor: 'rgba(255,90,90,0.08)', color: '#ff5a5a', border: '1px solid rgba(255,90,90,0.12)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6,9 12,15 18,9" />
              </svg>
              Additives ({additives.length})
            </button>
          )}
        </div>

        {/* 4. Safer Alternatives (Swaps) — hidden for high-scoring products */}
        {product.quality_score < 9 && (
          <div className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
              Safer Alternatives
            </h3>
            {!config.supported ? (
              <ComingSoonSwaps />
            ) : matchedSwaps.length > 0 ? (
              <div className="space-y-2">
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
        )}

        {/* 5. Nutrition Breakdown — Negatives & Positives */}
        <div className="animate-fadeUp" style={{ animationDelay: '150ms' }}>
          <NutritionBreakdown nutrition={nutrition} additiveCount={additives.length} />
        </div>

        {/* 6. Additives section */}
        <div id="section-additives" className="animate-fadeUp" style={{ animationDelay: '180ms' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
            Additives
          </h3>
          {additives.length === 0 ? (
            <div className="rounded-2xl p-5 text-center glass-card" style={{ borderColor: 'rgba(0,229,160,0.15)' }}>
              <p className="text-sm font-medium" style={{ color: '#22c77e' }}>
                No additives detected
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {additives.map((additive, i) => (
                <AdditiveDetail key={additive.code} additive={additive} index={i} />
              ))}
              {(() => {
                const reg = getRegulatoryRef(config.code, 'food')
                return (
                  <a
                    href={reg.primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-center pt-3 transition-colors"
                    style={{ color: 'rgba(124,111,255,0.6)' }}
                  >
                    Risk levels based on {reg.primaryRef} →
                  </a>
                )
              })()}
            </div>
          )}
        </div>

        {/* 7. RAG Indicator */}
        <div className="animate-fadeUp" style={{ animationDelay: '210ms' }}>
          <RAGIndicator score={product.quality_score} />
        </div>

        {/* 8. Nutri-Score bar */}
        <div className="animate-fadeUp" style={{ animationDelay: '230ms' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
            Nutri-Score
          </h3>
          <NutriScoreBar grade={product.nutriscore_grade || ''} />
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
            {product.ingredients && /[éèêëàâäùûüôöîïçñæœß]/.test(product.ingredients) && (
              <p className="text-xs mt-2" style={{ color: 'rgba(240,240,244,0.45)' }}>
                Ingredients shown in original language — English not available for this product.
              </p>
            )}
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

        {/* 10. Share banner — every 10th scan */}
        {typeof window !== 'undefined' && (() => {
          try {
            const count = JSON.parse(localStorage.getItem('ingredscan_anon_scans') || '{}').count || 0
            if (count > 0 && count % 10 === 0) {
              return (
                <div className="rounded-2xl p-5 text-center glass-card animate-fadeUp" style={{ animationDelay: '380ms' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>Enjoying IngredScan?</p>
                  <p className="text-xs mb-3" style={{ color: 'rgba(240,240,244,0.4)' }}>Tell a friend — it helps us grow</p>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'IngredScan', text: 'Scan any food or cosmetic product to see what\u2019s really in it', url: 'https://www.ingredscan.com' })
                      } else {
                        navigator.clipboard.writeText('https://www.ingredscan.com')
                        alert('Link copied!')
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                    style={{ backgroundColor: 'rgba(0,229,160,0.1)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.15)' }}
                  >
                    Share the app
                  </button>
                </div>
              )
            }
          } catch {}
          return null
        })()}

        {/* 11. Report an issue */}
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
