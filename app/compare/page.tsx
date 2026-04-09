'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getScoreColor, getNovaColor, getNovaEmoji, getNovaLabel } from '@/lib/scoring'
import { searchProducts } from '@/lib/openFoodFacts'
import Logo from '@/components/Logo'
import type { Product, NutritionData } from '@/lib/supabase'

export default function ComparePage() {
  const router = useRouter()
  const [productA, setProductA] = useState<Product | null>(null)
  const [productB, setProductB] = useState<Product | null>(null)
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [resultsA, setResultsA] = useState<any[]>([])
  const [resultsB, setResultsB] = useState<any[]>([])
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)

  async function handleSearch(query: string, side: 'a' | 'b') {
    if (query.length < 2) {
      if (side === 'a') setResultsA([]); else setResultsB([])
      return
    }
    if (side === 'a') setLoadingA(true); else setLoadingB(true)
    const results = await searchProducts(query)
    if (side === 'a') setResultsA(results.products || []); else setResultsB(results.products || [])
    if (side === 'a') setLoadingA(false); else setLoadingB(false)
  }

  async function selectProduct(code: string, side: 'a' | 'b') {
    if (side === 'a') setLoadingA(true); else setLoadingB(true)
    try {
      const res = await fetch(`/api/scan?barcode=${code}`)
      if (res.ok) {
        const data = await res.json()
        if (side === 'a') setProductA(data); else setProductB(data)
      }
    } catch {}
    if (side === 'a') setResultsA([]); else setResultsB([])
    if (side === 'a') setSearchA(''); else setSearchB('')
    if (side === 'a') setLoadingA(false); else setLoadingB(false)
  }

  function CompareBar({ label, valueA, valueB, maxVal, higherIsBetter = true }: {
    label: string; valueA: number | null; valueB: number | null; maxVal: number; higherIsBetter?: boolean
  }) {
    const a = valueA ?? 0
    const b = valueB ?? 0
    const aWins = higherIsBetter ? a > b : a < b
    const bWins = higherIsBetter ? b > a : b < a

    return (
      <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs font-medium text-center mb-2" style={{ color: 'rgba(240,240,244,0.5)' }}>{label}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold w-12 text-right" style={{ color: aWins ? '#22c77e' : bWins ? '#ff5a5a' : '#f0f0f4' }}>
            {valueA != null ? valueA.toFixed(1) : '—'}
          </span>
          <div className="flex-1 flex gap-1 h-2">
            <div className="flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (a / maxVal) * 100)}%`, backgroundColor: aWins ? '#22c77e' : 'rgba(240,240,244,0.2)', float: 'right' }} />
            </div>
            <div className="flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (b / maxVal) * 100)}%`, backgroundColor: bWins ? '#22c77e' : 'rgba(240,240,244,0.2)' }} />
            </div>
          </div>
          <span className="text-sm font-bold w-12" style={{ color: bWins ? '#22c77e' : aWins ? '#ff5a5a' : '#f0f0f4' }}>
            {valueB != null ? valueB.toFixed(1) : '—'}
          </span>
        </div>
      </div>
    )
  }

  function ProductPicker({ side, product, search, setSearch, results, loading, onSelect }: {
    side: string; product: Product | null; search: string; setSearch: (v: string) => void;
    results: any[]; loading: boolean; onSelect: (code: string) => void
  }) {
    if (product) {
      return (
        <div className="flex-1 rounded-2xl p-4 glass-card text-center">
          {product.image_url ? (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden mx-auto mb-2" style={{ backgroundColor: '#1c1c26' }}>
              <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>🛒</div>
          )}
          <p className="text-xs font-semibold truncate" style={{ color: '#f0f0f4' }}>{product.name}</p>
          <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.4)' }}>{product.brand}</p>
          <p className="text-xl font-bold mt-2" style={{ color: getScoreColor(product.quality_score) }}>{product.quality_score.toFixed(1)}</p>
          <p className="text-xs" style={{ color: getNovaColor(product.nova_score) }}>{getNovaEmoji(product.nova_score)} {getNovaLabel(product.nova_score)}</p>
          <button onClick={() => side === 'Product A' ? setProductA(null) : setProductB(null)} className="text-xs mt-2" style={{ color: 'rgba(240,240,244,0.35)' }}>Change</button>
        </div>
      )
    }

    return (
      <div className="flex-1">
        <p className="text-xs font-medium mb-2 text-center" style={{ color: 'rgba(240,240,244,0.45)' }}>{side}</p>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); handleSearch(e.target.value, side === 'Product A' ? 'a' : 'b') }}
          className="w-full px-3 py-2.5 rounded-xl text-xs outline-none glass-input"
          style={{ color: '#f0f0f4' }}
        />
        {loading && <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mx-auto mt-3" style={{ borderColor: '#22c77e', borderTopColor: 'transparent' }} />}
        {results.length > 0 && (
          <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto rounded-xl glass-card p-1">
            {results.slice(0, 5).map((p: any) => (
              <button key={p.code} onClick={() => onSelect(p.code)} className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/5" style={{ color: '#f0f0f4' }}>
                {p.product_name || 'Unknown'}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="legacy-page min-h-screen pb-20 relative">
      <header className="flex items-center justify-between px-5 pt-6 pb-2 max-w-lg mx-auto relative z-10">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5" /><polyline points="12,19 5,12 12,5" /></svg>
        </button>
        <Logo size="small" />
        <div className="w-10" />
      </header>

      <div className="px-5 max-w-lg mx-auto relative z-10 mt-4">
        <h1 className="text-lg font-bold heading-display text-center mb-6" style={{ color: '#f0f0f4' }}>Compare Products</h1>

        {/* Product pickers */}
        <div className="flex gap-3 mb-6">
          <ProductPicker side="Product A" product={productA} search={searchA} setSearch={setSearchA} results={resultsA} loading={loadingA} onSelect={(c) => selectProduct(c, 'a')} />
          <div className="flex items-center shrink-0"><span className="text-sm font-bold" style={{ color: 'rgba(240,240,244,0.3)' }}>vs</span></div>
          <ProductPicker side="Product B" product={productB} search={searchB} setSearch={setSearchB} results={resultsB} loading={loadingB} onSelect={(c) => selectProduct(c, 'b')} />
        </div>

        {/* Comparison */}
        {productA && productB && (
          <div className="rounded-2xl p-4 glass-card animate-fadeUp">
            <CompareBar label="Quality Score" valueA={productA.quality_score} valueB={productB.quality_score} maxVal={10} />
            <CompareBar label="Sugars (g/100g)" valueA={(productA.nutrition as NutritionData)?.sugars} valueB={(productB.nutrition as NutritionData)?.sugars} maxVal={30} higherIsBetter={false} />
            <CompareBar label="Saturated Fat (g/100g)" valueA={(productA.nutrition as NutritionData)?.saturated_fat} valueB={(productB.nutrition as NutritionData)?.saturated_fat} maxVal={15} higherIsBetter={false} />
            <CompareBar label="Salt (g/100g)" valueA={(productA.nutrition as NutritionData)?.salt} valueB={(productB.nutrition as NutritionData)?.salt} maxVal={3} higherIsBetter={false} />
            <CompareBar label="Protein (g/100g)" valueA={(productA.nutrition as NutritionData)?.protein} valueB={(productB.nutrition as NutritionData)?.protein} maxVal={20} />
            <CompareBar label="Fibre (g/100g)" valueA={(productA.nutrition as NutritionData)?.fibre} valueB={(productB.nutrition as NutritionData)?.fibre} maxVal={10} />
            <CompareBar label="Additives" valueA={(productA.additives || []).length} valueB={(productB.additives || []).length} maxVal={10} higherIsBetter={false} />

            <div className="flex items-center justify-center gap-2 pt-4">
              {productA.quality_score > productB.quality_score ? (
                <p className="text-xs font-medium" style={{ color: '#22c77e' }}>
                  {productA.name} scores higher on our criteria
                </p>
              ) : productB.quality_score > productA.quality_score ? (
                <p className="text-xs font-medium" style={{ color: '#22c77e' }}>
                  {productB.name} scores higher on our criteria
                </p>
              ) : (
                <p className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.5)' }}>Both products score equally</p>
              )}
            </div>

            <p className="text-xs text-center mt-3" style={{ color: 'rgba(240,240,244,0.3)' }}>
              Scores are for informational purposes only. Not medical advice. Sourced from community databases.
            </p>
          </div>
        )}

        {!productA && !productB && (
          <p className="text-sm text-center py-8" style={{ color: 'rgba(240,240,244,0.35)' }}>
            Search for two products to compare them side by side
          </p>
        )}
      </div>
    </div>
  )
}
