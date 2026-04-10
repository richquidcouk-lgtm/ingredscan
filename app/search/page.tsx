'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getDisplayScore, getScoreClass } from '@/lib/scoring'

type SearchResult = {
  code: string
  product_name: string
  brands: string
  nova_group: number
  nutriscore_grade: string
  quality_score: number | null
  image_front_small_url: string
}

// Category lists built from actual product data. Each term is ILIKE'd against
// name + brand + category via the /api/search endpoint. Ordered roughly by
// how shoppers browse. All confirmed to return real results on 1.6M+ rows.
const FOOD_CATEGORIES: Array<{ emoji: string; label: string; term: string }> = [
  { emoji: '🥛', label: 'Milk & Cream', term: 'milk' },
  { emoji: '🧀', label: 'Cheese', term: 'cheese' },
  { emoji: '🥣', label: 'Yogurt', term: 'yogurt' },
  { emoji: '🧈', label: 'Butter & Spreads', term: 'butter' },
  { emoji: '🥚', label: 'Eggs', term: 'egg' },
  { emoji: '🍞', label: 'Bread & Bakery', term: 'bread' },
  { emoji: '🥣', label: 'Cereals', term: 'cereal' },
  { emoji: '🍪', label: 'Cookies & Biscuits', term: 'cookie' },
  { emoji: '🧁', label: 'Flour & Baking', term: 'flour' },
  { emoji: '🥩', label: 'Meat', term: 'meat' },
  { emoji: '🍗', label: 'Chicken & Poultry', term: 'chicken' },
  { emoji: '🥓', label: 'Beef', term: 'beef' },
  { emoji: '🐷', label: 'Pork', term: 'pork' },
  { emoji: '🐟', label: 'Fish & Seafood', term: 'seafood' },
  { emoji: '🥬', label: 'Vegetables', term: 'vegetable' },
  { emoji: '🍎', label: 'Fruits', term: 'fruit' },
  { emoji: '🥗', label: 'Salads', term: 'salad' },
  { emoji: '🍝', label: 'Pasta & Noodles', term: 'pasta' },
  { emoji: '🍚', label: 'Rice', term: 'rice' },
  { emoji: '🍕', label: 'Pizza', term: 'pizza' },
  { emoji: '🍜', label: 'Soup', term: 'soup' },
  { emoji: '🧃', label: 'Juice', term: 'juice' },
  { emoji: '☕', label: 'Coffee', term: 'coffee' },
  { emoji: '🍵', label: 'Tea', term: 'tea' },
  { emoji: '💧', label: 'Water', term: 'water' },
  { emoji: '🥤', label: 'Soda & Soft Drinks', term: 'soda' },
  { emoji: '🍺', label: 'Beer & Cider', term: 'beer' },
  { emoji: '🍷', label: 'Wine', term: 'wine' },
  { emoji: '🍫', label: 'Chocolate', term: 'chocolate' },
  { emoji: '🍬', label: 'Candy & Sweets', term: 'candy' },
  { emoji: '🍿', label: 'Snacks & Crisps', term: 'crisp' },
  { emoji: '🍦', label: 'Ice Cream', term: 'ice cream' },
  { emoji: '🧂', label: 'Sauces & Condiments', term: 'sauce' },
  { emoji: '🍯', label: 'Honey & Syrup', term: 'honey' },
  { emoji: '🫒', label: 'Oils & Vinegar', term: 'oil' },
  { emoji: '🌶️', label: 'Spices & Herbs', term: 'spice' },
  { emoji: '🥜', label: 'Nuts & Seeds', term: 'nuts' },
  { emoji: '🧊', label: 'Frozen Foods', term: 'frozen' },
  { emoji: '🍼', label: 'Baby Food', term: 'baby' },
  { emoji: '🐾', label: 'Pet Food', term: 'pet food' },
]

const BEAUTY_CATEGORIES: Array<{ emoji: string; label: string; term: string }> = [
  { emoji: '🧴', label: 'Moisturisers', term: 'moisturiz' },
  { emoji: '✨', label: 'Serums', term: 'serum' },
  { emoji: '🧼', label: 'Face Cleansers', term: 'cleans' },
  { emoji: '🌿', label: 'Face Creams', term: 'cream' },
  { emoji: '🎭', label: 'Face Masks', term: 'mask' },
  { emoji: '💧', label: 'Toners & Mists', term: 'toner' },
  { emoji: '☀️', label: 'Sunscreen & SPF', term: 'spf' },
  { emoji: '👁️', label: 'Eye Care', term: 'eye' },
  { emoji: '💇', label: 'Shampoo', term: 'shampoo' },
  { emoji: '🧖', label: 'Conditioner', term: 'conditioner' },
  { emoji: '💆', label: 'Hair Care', term: 'hair' },
  { emoji: '🛁', label: 'Shower & Body Wash', term: 'shower' },
  { emoji: '🫧', label: 'Soap', term: 'soap' },
  { emoji: '🧴', label: 'Body Lotion', term: 'lotion' },
  { emoji: '🫒', label: 'Body Oils', term: 'oil' },
  { emoji: '🧽', label: 'Scrubs & Exfoliants', term: 'scrub' },
  { emoji: '🤲', label: 'Hand Care', term: 'hand' },
  { emoji: '👃', label: 'Deodorants', term: 'deodorant' },
  { emoji: '🦷', label: 'Toothpaste & Oral', term: 'toothpaste' },
  { emoji: '🪒', label: 'Shaving', term: 'shav' },
  { emoji: '💄', label: 'Makeup', term: 'makeup' },
  { emoji: '💋', label: 'Lip Care', term: 'lip' },
  { emoji: '💅', label: 'Nail Care', term: 'nail' },
  { emoji: '🌸', label: 'Perfume & Fragrance', term: 'perfume' },
  { emoji: '👶', label: 'Baby Care', term: 'baby' },
  { emoji: '🧴', label: 'Gels', term: 'gel' },
]

export default function SearchPage() {
  // useSearchParams() needs a Suspense boundary so the page can still be
  // statically prerendered at build time.
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageBody />
    </Suspense>
  )
}

function SearchFallback() {
  return (
    <div className="max-w-[480px] mx-auto pt-20 pb-24 px-6 text-center" style={{ color: 'var(--muted)' }}>
      <div
        className="mx-auto"
        style={{
          width: 28,
          height: 28,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--green)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function SearchPageBody() {
  const params = useSearchParams()
  const initialTerm = params.get('term') || ''
  const [mode, setMode] = useState<'food' | 'cosmetic'>('food')
  const [query, setQuery] = useState(initialTerm)
  const [selectedCategory, setSelectedCategory] = useState<{ label: string; term: string } | null>(null)
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
      const sp = new URLSearchParams({ type: mode, limit: '50' })
      if (q.length >= 2) sp.set('q', q)
      if (category) sp.set('category', category)
      try {
        const res = await fetch(`/api/search?${sp.toString()}`)
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

  useEffect(() => {
    const t = setTimeout(() => runSearch(query, selectedCategory?.term ?? null), 400)
    return () => clearTimeout(t)
  }, [query, selectedCategory, runSearch])

  // Reset ALL state when switching mode — including the text query, so the
  // search box doesn't keep showing the previous term from the other mode.
  useEffect(() => {
    setQuery('')
    setSelectedCategory(null)
    setResults([])
    setHasSearched(false)
  }, [mode])

  function handleCategoryTap(cat: { label: string; term: string }) {
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

  return (
    <div className="max-w-[480px] mx-auto pt-16 pb-24 animate-fadeIn">
      <div className="px-5 pt-5 pb-3">
        <h1 className="heading-display" style={{ fontSize: 22, marginBottom: 16 }}>
          {selectedCategory ? selectedCategory.label : `Browse ${mode === 'food' ? 'food' : 'beauty'}`}
        </h1>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-3 relative">
        <span
          style={{
            position: 'absolute',
            left: 34,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
            fontSize: 16,
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder={mode === 'food' ? 'Search food products…' : 'Search beauty products…'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.length >= 2) setSelectedCategory(null)
          }}
          className="w-full outline-none"
          style={{
            padding: '12px 40px 12px 42px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 14,
            color: 'var(--dark)',
          }}
        />
        {(query || selectedCategory) && (
          <button
            onClick={clearFilters}
            type="button"
            aria-label="Clear"
            style={{
              position: 'absolute',
              right: 30,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 px-5 pb-4">
        <button
          onClick={() => setMode('food')}
          type="button"
          className="flex-1"
          style={{
            padding: '10px 12px',
            borderRadius: 12,
            background: mode === 'food' ? 'var(--dark)' : 'var(--card)',
            color: mode === 'food' ? '#fff' : 'var(--muted)',
            border: `1px solid ${mode === 'food' ? 'var(--dark)' : 'var(--border)'}`,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          🥫 Food
        </button>
        <button
          onClick={() => setMode('cosmetic')}
          type="button"
          className="flex-1"
          style={{
            padding: '10px 12px',
            borderRadius: 12,
            background: mode === 'cosmetic' ? 'var(--dark)' : 'var(--card)',
            color: mode === 'cosmetic' ? '#fff' : 'var(--muted)',
            border: `1px solid ${mode === 'cosmetic' ? 'var(--dark)' : 'var(--border)'}`,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          💄 Beauty
        </button>
      </div>

      {/* Category list */}
      {showCategoryList && (
        <div className="px-5">
          <div
            className="pb-2 pl-1"
            style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)' }}
          >
            {mode === 'food' ? 'Food categories' : 'Beauty categories'}
          </div>
          <div className="card overflow-hidden">
            {categories.map((cat, i) => (
              <button
                key={cat.term + i}
                onClick={() => handleCategoryTap(cat)}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: i < categories.length - 1 ? '1px solid var(--border)' : 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--dark)' }}>
                  {cat.label}
                </span>
                <span style={{ fontSize: 14, color: '#ccc' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div>
          <div className="flex items-center justify-between px-5 pb-2 pt-1">
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {loading
                ? 'Searching…'
                : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </div>
          </div>

          {loading && (
            <div className="px-10 py-10 text-center" style={{ color: 'var(--muted)' }}>
              <div
                className="mx-auto"
                style={{
                  width: 28,
                  height: 28,
                  border: '2px solid var(--border)',
                  borderTopColor: 'var(--green)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-10 py-12 text-center" style={{ color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>🔎</div>
              <div style={{ fontSize: 14, marginBottom: 16 }}>No products found</div>
              <button
                onClick={clearFilters}
                type="button"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--green)',
                  background: 'transparent',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Clear and browse categories
              </button>
            </div>
          )}

          {!loading &&
            results.map((p) => {
              const cls = getScoreClass(p.quality_score ?? null)
              const color =
                cls === 'score-good'
                  ? 'var(--green)'
                  : cls === 'score-fair'
                  ? 'var(--amber)'
                  : 'var(--red)'
              return (
                <Link
                  key={p.code}
                  href={`/result/${p.code}?source=search`}
                  className="flex items-center gap-3 px-5 py-3.5"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--cream)',
                      border: '1px solid var(--border)',
                      fontSize: 20,
                    }}
                  >
                    {p.image_front_small_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_front_small_url}
                        alt=""
                        style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{mode === 'cosmetic' ? '💄' : '🛒'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--dark)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.product_name || 'Unknown product'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.brands || 'Unknown brand'}</div>
                  </div>
                  {/* Fixed-width score column so food and beauty rows align
                      identically — beauty products usually have null
                      quality_score and were rendering with a different
                      footprint than food rows. */}
                  <div
                    className="flex items-center justify-end flex-shrink-0"
                    style={{ width: 56 }}
                  >
                    {typeof p.quality_score === 'number' && p.quality_score > 0 ? (
                      <div className="heading-display" style={{ fontSize: 22, color }}>
                        {getDisplayScore(p.quality_score)}
                      </div>
                    ) : (
                      <span style={{ fontSize: 22, color: 'var(--muted)', fontFamily: 'var(--font-display), Fraunces, serif', fontWeight: 700 }}>
                        —
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
