'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getScoreColor } from '@/lib/scoring'
import { calculateQualityScore } from '@/lib/scoring'

type SearchProduct = {
  code: string
  product_name: string
  brands: string
  image_front_small_url: string
  nutriscore_grade: string
  nova_group: number
  nutriments: Record<string, number>
  additives_tags: string[]
  categories_tags: string[]
  labels_tags: string[]
  ingredients_text: string
}

const CATEGORY_CHIPS = [
  { emoji: '\uD83C\uDF5E', label: 'Bread' },
  { emoji: '\uD83E\uDD5B', label: 'Dairy' },
  { emoji: '\uD83C\uDF6B', label: 'Chocolate' },
  { emoji: '\uD83E\uDD64', label: 'Drinks' },
  { emoji: '\uD83C\uDF6A', label: 'Snacks' },
  { emoji: '\uD83E\uDD63', label: 'Cereal' },
  { emoji: '\uD83C\uDF55', label: 'Ready Meals' },
  { emoji: '\uD83E\uDED4', label: 'Sauces' },
  { emoji: '\uD83E\uDD69', label: 'Meat' },
  { emoji: '\uD83E\uDED9', label: 'Tinned Food' },
  { emoji: '\uD83E\uDDC3', label: 'Juice' },
  { emoji: '\uD83C\uDF66', label: 'Yoghurt' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const doSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setSearching(true)
    setSearched(true)
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&tagtype_0=countries&tag_0=united-kingdom&json=1&page_size=20`,
        { headers: { 'User-Agent': 'IngredScan/1.0 (https://ingredscan.com)' } }
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data.products || [])
      }
    } catch {
      // silently fail
    }
    setSearching(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  function handleChipClick(label: string) {
    setQuery(label)
  }

  function getQuickScore(product: SearchProduct): number | null {
    try {
      return calculateQualityScore({
        nutriscore_grade: product.nutriscore_grade,
        additives_tags: product.additives_tags || [],
        categories_tags: product.categories_tags || [],
        labels_tags: product.labels_tags || [],
        nutriments: product.nutriments || {},
        ingredients_text: product.ingredients_text || '',
      })
    } catch {
      return null
    }
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <div className="px-5 pt-6 max-w-lg mx-auto relative z-10">
        {/* Search input */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.35)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search food and drink..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-4 rounded-2xl text-sm outline-none glass-input"
            style={{ color: '#f0f0f4', fontSize: 16 }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.5)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Empty state - category chips */}
        {!query && !searched && (
          <div className="animate-fadeUp">
            <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'rgba(240,240,244,0.35)' }}>
              Try searching for...
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleChipClick(chip.label)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 glass-card"
                  style={{ color: 'rgba(240,240,244,0.7)' }}
                >
                  <span>{chip.emoji}</span>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {searching && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00e5a0', borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Results */}
        {!searching && results.length > 0 && (
          <div className="space-y-1 animate-fadeUp">
            {results.map((product) => {
              const score = getQuickScore(product)
              return (
                <Link
                  key={product.code}
                  href={`/result/${product.code}`}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl glass-card transition-all duration-200"
                >
                  {product.image_front_small_url ? (
                    <img
                      src={product.image_front_small_url}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                    />
                  ) : null}
                  {!product.image_front_small_url && (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                      \uD83D\uDCE6
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>
                      {product.product_name || 'Unknown Product'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.4)' }}>
                      {product.brands || 'Unknown Brand'}
                    </p>
                  </div>
                  {score !== null && (
                    <span
                      className="text-sm font-bold px-2 py-1 rounded-lg"
                      style={{
                        color: getScoreColor(score),
                        backgroundColor: `${getScoreColor(score)}15`,
                      }}
                    >
                      {score.toFixed(1)}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* No results */}
        {!searching && searched && results.length === 0 && query.length >= 2 && (
          <div className="text-center py-16 animate-fadeUp">
            <div className="text-4xl mb-4">\uD83D\uDD0D</div>
            <h3 className="text-base font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
              No results found
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Can&apos;t find it? Scan the barcode instead
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium btn-glow"
              style={{ color: '#0b0b0f' }}
            >
              Open Scanner &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
