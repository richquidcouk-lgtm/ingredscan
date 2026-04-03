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
    <div className="min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <h1 className="text-base font-semibold" style={{ color: '#f0f0f4' }}>Scan</h1>
        <div className="w-9" />
      </header>

      {/* Scanner */}
      <div className="px-4 max-w-lg mx-auto animate-fadeUp">
        <Scanner />
      </div>

      {/* Manual search */}
      <div className="px-4 mt-6 max-w-lg mx-auto animate-fadeUp" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.35)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: '#1c1c26',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f0f0f4',
            }}
          />
        </div>

        {/* Search Results */}
        {searching && (
          <div className="mt-3 text-center">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#22c77e', borderTopColor: 'transparent' }} />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-1 max-h-64 overflow-y-auto rounded-xl" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
            {searchResults.map((product) => (
              <Link
                key={product.code}
                href={`/result/${product.code}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
              >
                {product.image_front_small_url ? (
                  <img src={product.image_front_small_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#1c1c26' }}>🛒</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>
                    {product.product_name || 'Unknown Product'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.45)' }}>
                    {product.brands || 'Unknown Brand'}
                  </p>
                </div>
                {product.nutriscore_grade && (
                  <span className="text-xs font-bold uppercase" style={{ color: 'rgba(240,240,244,0.6)' }}>
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
