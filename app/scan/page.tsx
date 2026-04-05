'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { searchProducts, type OFFSearchResult } from '@/lib/openFoodFacts'
import { searchBeautyProducts } from '@/lib/openBeautyFacts'
import Logo from '@/components/Logo'

const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false })

const categoryChips = [
  { emoji: '🍞', label: 'Bread', type: 'food' as const },
  { emoji: '🥣', label: 'Cereal', type: 'food' as const },
  { emoji: '🧴', label: 'Moisturiser', type: 'cosmetic' as const },
  { emoji: '🧴', label: 'Shampoo', type: 'cosmetic' as const },
  { emoji: '🫙', label: 'Ketchup', type: 'food' as const },
  { emoji: '🍫', label: 'Chocolate', type: 'food' as const },
  { emoji: '☀️', label: 'Sunscreen', type: 'cosmetic' as const },
  { emoji: '💄', label: 'Foundation', type: 'cosmetic' as const },
]

export default function ScanPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<OFFSearchResult['products']>([])
  const [searching, setSearching] = useState(false)
  const [searchCategory, setSearchCategory] = useState<'food' | 'cosmetic'>('food')

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)

    if (searchCategory === 'cosmetic') {
      const results = await searchBeautyProducts(query)
      setSearchResults(results.products || [])
    } else {
      const results = await searchProducts(query)
      setSearchResults(results.products || [])
    }

    setSearching(false)
  }, [searchCategory])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery, doSearch])

  function handleChipClick(label: string, type: 'food' | 'cosmetic') {
    setSearchCategory(type)
    setSearchQuery(label)
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto relative z-10">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <Logo size="small" />
        <div className="w-10" />
      </header>

      {/* Scanner */}
      <div className="px-5 max-w-lg mx-auto animate-fadeUp relative z-10">
        <div className="rounded-2xl overflow-hidden glass-card p-1">
          <Scanner />
        </div>
      </div>

      {/* Manual search */}
      <div className="px-5 mt-6 max-w-lg mx-auto animate-fadeUp relative z-10" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.45)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none glass-input"
            style={{ color: '#f0f0f4' }}
          />
        </div>

        {/* Category chips */}
        {searchResults.length === 0 && !searching && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categoryChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.label, chip.type)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all active:scale-95 glass-subtle"
                style={{
                  color: chip.type === 'cosmetic' ? 'rgba(168,85,247,0.7)' : 'rgba(240,240,244,0.6)',
                  borderColor: chip.type === 'cosmetic' ? 'rgba(168,85,247,0.15)' : undefined,
                }}
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search Results */}
        {searching && (
          <div className="mt-4 text-center">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#00e5a0', borderTopColor: 'transparent' }} />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-0.5 max-h-64 overflow-y-auto rounded-2xl glass-card p-1">
            {searchResults.map((product) => (
              <Link
                key={product.code}
                href={`/result/${product.code}?source=scan`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
              >
                {product.image_front_small_url ? (
                  <img src={product.image_front_small_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                    {searchCategory === 'cosmetic' ? '💄' : '🛒'}
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
                {searchCategory === 'cosmetic' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
                    💄
                  </span>
                ) : product.nutriscore_grade ? (
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,244,0.5)' }}>
                    {product.nutriscore_grade}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
