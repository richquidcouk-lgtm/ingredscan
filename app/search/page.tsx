'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getScoreColor, getScoreLabel } from '@/lib/scoring'
import Logo from '@/components/Logo'

type SearchResult = {
  code: string
  product_name: string
  brands: string
  nova_group: number
  nutriscore_grade: string
  quality_score: number | null
  image_front_small_url: string
}

// Curated high-level categories shown on the search landing page. Each tag
// must be a valid OFF `categories_tags` entry — we filter via
// `.contains('categories_tags', [tag])` on the server.
const FOOD_CATEGORIES: Array<{ emoji: string; label: string; tag: string }> = [
  { emoji: '🍞', label: 'Bread & Bakery', tag: 'en:breads' },
  { emoji: '🥣', label: 'Breakfast Cereals', tag: 'en:breakfast-cereals' },
  { emoji: '🥛', label: 'Dairy & Yogurt', tag: 'en:dairies' },
  { emoji: '🧀', label: 'Cheese', tag: 'en:cheeses' },
  { emoji: '🍫', label: 'Chocolate', tag: 'en:chocolates' },
  { emoji: '🍪', label: 'Biscuits & Sweets', tag: 'en:biscuits-and-cakes' },
  { emoji: '🥤', label: 'Beverages', tag: 'en:beverages' },
  { emoji: '💧', label: 'Waters', tag: 'en:waters' },
  { emoji: '🍺', label: 'Alcoholic Drinks', tag: 'en:alcoholic-beverages' },
  { emoji: '🍝', label: 'Pasta & Rice', tag: 'en:pastas' },
  { emoji: '🥫', label: 'Canned & Jarred', tag: 'en:canned-foods' },
  { emoji: '🍲', label: 'Ready Meals', tag: 'en:meals' },
  { emoji: '🥓', label: 'Meat', tag: 'en:meats' },
  { emoji: '🐟', label: 'Fish & Seafood', tag: 'en:seafood' },
  { emoji: '🥬', label: 'Fresh Produce', tag: 'en:fresh-foods' },
  { emoji: '🧊', label: 'Frozen Foods', tag: 'en:frozen-foods' },
  { emoji: '🍿', label: 'Snacks', tag: 'en:snacks' },
  { emoji: '🧂', label: 'Condiments & Sauces', tag: 'en:condiments' },
  { emoji: '🍯', label: 'Spreads', tag: 'en:spreads' },
  { emoji: '🍼', label: 'Baby Food', tag: 'en:baby-foods' },
]

const BEAUTY_CATEGORIES: Array<{ emoji: string; label: string; tag: string }> = [
  { emoji: '🧴', label: 'Moisturisers', tag: 'en:moisturizers' },
  { emoji: '🧼', label: 'Cleansers', tag: 'en:face-cleansing' },
  { emoji: '✨', label: 'Serums', tag: 'en:serums' },
  { emoji: '☀️', label: 'Sunscreen', tag: 'en:sun-protection' },
  { emoji: '💇', label: 'Shampoo', tag: 'en:shampoos' },
  { emoji: '🧖', label: 'Conditioner', tag: 'en:conditioners' },
  { emoji: '🛁', label: 'Body Wash', tag: 'en:shower-gels' },
  { emoji: '🫧', label: 'Soap', tag: 'en:soaps' },
  { emoji: '💄', label: 'Makeup', tag: 'en:makeup' },
  { emoji: '💋', label: 'Lip Care', tag: 'en:lip-care' },
  { emoji: '🪒', label: 'Shaving', tag: 'en:shaving' },
  { emoji: '🦷', label: 'Oral Care', tag: 'en:oral-hygiene' },
  { emoji: '👃', label: 'Deodorants', tag: 'en:deodorants' },
  { emoji: '👶', label: 'Baby Care', tag: 'en:baby-care' },
]

export default function SearchPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'food' | 'cosmetic'>('food')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<{ label: string; tag: string } | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const categories = mode === 'food' ? FOOD_CATEGORIES : BEAUTY_CATEGORIES

  const runSearch = useCallback(
    async (q: string, category: string | null) => {
      if (q.length < 2 && !category) {
        setResults([])
        setHasSearched(false)
        return
      }
      setLoading(true)
      setHasSearched(true)
      const params = new URLSearchParams({ type: mode, limit: '50' })
      if (q.length >= 2) params.set('q', q)
      if (category) params.set('category', category)
      try {
        const res = await fetch(`/api/search?${params.toString()}`)
        const json = await res.json()
        setResults(json.products || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [mode]
  )

  // Debounced free-text search
  useEffect(() => {
    const t = setTimeout(() => runSearch(query, selectedCategory?.tag ?? null), 400)
    return () => clearTimeout(t)
  }, [query, selectedCategory, runSearch])

  // Reset category when mode switches (food categories don't apply to cosmetics)
  useEffect(() => {
    setSelectedCategory(null)
    setResults([])
    setHasSearched(false)
  }, [mode])

  function handleCategoryTap(cat: { label: string; tag: string }) {
    setSelectedCategory(cat)
    setQuery('')
  }

  function clearFilters() {
    setSelectedCategory(null)
    setQuery('')
    setResults([])
    setHasSearched(false)
  }

  const showCategoryList = !hasSearched && !loading
  const showResults = hasSearched

  const headerTitle = useMemo(() => {
    if (selectedCategory) return selectedCategory.label
    if (query.length >= 2) return `“${query}”`
    return mode === 'food' ? 'Browse Food' : 'Browse Beauty'
  }, [selectedCategory, query, mode])

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl" style={{ background: 'rgba(11,11,15,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl glass-card"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5" />
              <polyline points="12,19 5,12 12,5" />
            </svg>
          </button>
          <Logo size="small" />
          <div className="w-10" />
        </div>

        {/* Search bar */}
        <div className="px-5 pb-3 max-w-lg mx-auto">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.45)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={mode === 'food' ? 'Search food products…' : 'Search beauty products…'}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (e.target.value.length >= 2) setSelectedCategory(null)
              }}
              className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm outline-none glass-input"
              style={{ color: '#f0f0f4' }}
            />
            {(query || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full"
                aria-label="Clear"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.5)" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Food / Beauty toggle */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setMode('food')}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background:
                  mode === 'food'
                    ? 'linear-gradient(135deg, rgba(0,229,160,0.18), rgba(26,176,110,0.12))'
                    : 'rgba(255,255,255,0.03)',
                color: mode === 'food' ? '#00e5a0' : 'rgba(240,240,244,0.5)',
                border: `1px solid ${mode === 'food' ? 'rgba(0,229,160,0.35)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              🥫 Food
            </button>
            <button
              onClick={() => setMode('cosmetic')}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background:
                  mode === 'cosmetic'
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(124,111,255,0.12))'
                    : 'rgba(255,255,255,0.03)',
                color: mode === 'cosmetic' ? '#a855f7' : 'rgba(240,240,244,0.5)',
                border: `1px solid ${mode === 'cosmetic' ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              💄 Beauty
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 pt-4 max-w-lg mx-auto relative z-10">
        {/* Landing: vertical category list */}
        {showCategoryList && (
          <section>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'rgba(240,240,244,0.55)' }}>
              {mode === 'food' ? 'Food categories' : 'Beauty categories'}
            </h2>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.tag}
                  onClick={() => handleCategoryTap(cat)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl glass-card text-left transition-all active:scale-[0.99] hover:bg-white/5"
                >
                  <span className="text-2xl shrink-0">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium" style={{ color: '#f0f0f4' }}>
                    {cat.label}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.35)" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Results section */}
        {showResults && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold truncate" style={{ color: '#f0f0f4' }}>
                {headerTitle}
              </h2>
              {!loading && (
                <span className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loading && (
              <div className="py-10 text-center">
                <div
                  className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                  style={{ borderColor: '#00e5a0', borderTopColor: 'transparent' }}
                />
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: 'rgba(240,240,244,0.5)' }}>
                  No products found
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-3 text-xs font-medium underline"
                  style={{ color: '#00e5a0' }}
                >
                  Clear and browse categories
                </button>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1.5">
                {results.map((p) => (
                  <Link
                    key={p.code}
                    href={`/result/${p.code}?source=search`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card transition-all hover:bg-white/5"
                  >
                    {p.image_front_small_url ? (
                      <img
                        src={p.image_front_small_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}
                      >
                        {mode === 'cosmetic' ? '💄' : '🛒'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>
                        {p.product_name || 'Unknown Product'}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.45)' }}>
                        {p.brands || 'Unknown Brand'}
                      </p>
                    </div>
                    {typeof p.quality_score === 'number' ? (
                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap"
                          style={{
                            backgroundColor: `${getScoreColor(p.quality_score)}22`,
                            color: getScoreColor(p.quality_score),
                            border: `1px solid ${getScoreColor(p.quality_score)}55`,
                          }}
                        >
                          {p.quality_score.toFixed(1)}
                        </span>
                        <span className="text-[10px] mt-0.5" style={{ color: 'rgba(240,240,244,0.4)' }}>
                          {getScoreLabel(p.quality_score)}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(240,240,244,0.4)' }}
                      >
                        no score
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
