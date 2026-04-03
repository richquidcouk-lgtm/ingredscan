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
import SkeletonResult from '@/components/SkeletonResult'
import { supabase, type Product, type NutritionData } from '@/lib/supabase'
import { getCategoryEmoji, incrementAnonScanCount } from '@/lib/utils'
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

  useEffect(() => {
    if (!barcode) return
    fetchProduct()
  }, [barcode])

  async function fetchProduct() {
    setLoading(true)
    setError(null)

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

  if (loading) {
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
        <SkeletonResult />
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: '#0b0b0f' }}>
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-clash), system-ui', color: '#f0f0f4' }}>Product not found</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.45)' }}>
          We couldn&apos;t find this product in our database. It may not be listed yet.
        </p>
        <Link href="/scan" className="px-6 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: '#22c77e', color: '#0b0b0f' }}>
          Scan Another Product
        </Link>
      </div>
    )
  }

  if (error === 'api_error' || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: '#0b0b0f' }}>
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-clash), system-ui', color: '#f0f0f4' }}>Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.45)' }}>
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
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#0b0b0f' }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <ShareButton product={product} />
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {/* Product header */}
        <div className="rounded-2xl p-4 animate-fadeUp" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start gap-4">
            {product.image_url ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: '#1c1c26' }}>
                <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: '#1c1c26' }}>
                {getCategoryEmoji(product.category || '')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-clash), system-ui', color: '#f0f0f4' }}>
                {product.name}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(240,240,244,0.45)' }}>{product.brand}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {detectFlagsFromProduct(product).map((flag) => (
                  <span key={flag} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#ff5a5a15', color: '#ff5a5a' }}>
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
          className="rounded-xl px-4 py-3 text-center animate-fadeUp"
          style={{ backgroundColor: '#7c6fff10', border: '1px solid #7c6fff20', animationDelay: '100ms' }}
        >
          <p className="text-xs" style={{ color: '#7c6fff' }}>
            🔍 {product.data_source} · {product.confidence}% verified
          </p>
        </div>

        {/* Nutri-Score */}
        <div className="animate-fadeUp" style={{ animationDelay: '150ms' }}>
          <NutriScoreBar grade={product.nutriscore_grade || ''} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl animate-fadeUp" style={{ backgroundColor: '#13131a', animationDelay: '200ms' }}>
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
                backgroundColor: activeTab === tab.id ? '#1c1c26' : 'transparent',
                color: activeTab === tab.id ? '#f0f0f4' : 'rgba(240,240,244,0.45)',
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
                <div className="rounded-xl p-4" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.45)' }}>
                    Ingredients
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,244,0.7)' }}>
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* Nutrition table */}
              <div className="rounded-xl p-4" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.45)' }}>
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
                      style={{ borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                    >
                      <span className="text-sm" style={{ color: 'rgba(240,240,244,0.6)' }}>{row.label}</span>
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
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#22c77e10', border: '1px solid #22c77e20' }}>
                  <p className="text-sm font-medium" style={{ color: '#22c77e' }}>
                    No concerning additives found ✓
                  </p>
                </div>
              ) : (
                <>
                  {additives.map((additive, i) => (
                    <AdditiveCard key={additive.code} additive={additive} index={i} />
                  ))}
                  <p className="text-xs text-center pt-2" style={{ color: 'rgba(240,240,244,0.3)' }}>
                    Risk levels based on EU Reg 1333/2008 and UK FSA guidelines
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === 'swaps' && (
            <div className="space-y-2">
              {matchedSwaps.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-sm" style={{ color: 'rgba(240,240,244,0.45)' }}>
                    No swaps available for this product category yet.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium mb-2" style={{ color: 'rgba(240,240,244,0.45)' }}>
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
