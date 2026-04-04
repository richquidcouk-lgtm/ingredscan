'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { searchProducts, type OFFSearchResult } from '@/lib/openFoodFacts'

const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false })

export default function ScanPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<OFFSearchResult['products']>([])
  const [searching, setSearching] = useState(false)

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    const results = await searchProducts(query)
    setSearchResults(results.products || [])
    setSearching(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery, doSearch])

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto relative z-10">
        <h1 className="text-xl font-extrabold heading-display" style={{ letterSpacing: '-0.04em' }}>
          <span style={{ color: '#f0f0f4' }}>Ingred</span>
          <span style={{ color: '#00e5a0' }}>Scan</span>
        </h1>
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
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2">
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
                href={`/result/${product.code}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
              >
                {product.image_front_small_url ? (
                  <img src={product.image_front_small_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>🛒</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>
                    {product.product_name || 'Unknown Product'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.4)' }}>
                    {product.brands || 'Unknown Brand'}
                  </p>
                </div>
                {product.nutriscore_grade && (
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,244,0.5)' }}>
                    {product.nutriscore_grade}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
