'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getScoreColor } from '@/lib/scoring'
import { getCategoryEmoji, formatDate } from '@/lib/utils'
import { getFavouriteBarcodes } from '@/components/FavouriteButton'
import AuthModal from '@/components/AuthModal'
import Logo from '@/components/Logo'
import WeeklySummary from '@/components/WeeklySummary'

type ScanHistory = {
  barcode: string
  scanned_at: string
  name: string
  brand: string
  quality_score: number
  nova_score: number
  category: string
  image_url?: string
  product_type?: string
}

type Tab = 'recent' | 'favourites'

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [scans, setScans] = useState<ScanHistory[]>([])
  const [favourites, setFavourites] = useState<ScanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('recent')
  const [search, setSearch] = useState('')
  const [scoreFilter, setScoreFilter] = useState<'all' | 'good' | 'fair' | 'poor'>('all')
  const [deletingBarcode, setDeletingBarcode] = useState<string | null>(null)
  const touchStartX = useRef(0)
  const [swipedBarcode, setSwipedBarcode] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        loadHistory(data.user.id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function loadHistory(userId: string) {
    const { data: scansData } = await supabase
      .from('scans')
      .select('barcode, scanned_at')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false })

    if (!scansData || scansData.length === 0) {
      setLoading(false)
      loadFavourites()
      return
    }

    const barcodes = Array.from(new Set(scansData.map((s: any) => s.barcode)))
    const { data: productsData } = await supabase
      .from('products')
      .select('barcode, name, brand, quality_score, nova_score, category, image_url, product_type')
      .in('barcode', barcodes)

    const productMap = new Map(
      (productsData || []).map((p: any) => [p.barcode, p])
    )

    setScans(
      scansData.map((s: any) => {
        const p = productMap.get(s.barcode)
        return {
          barcode: s.barcode,
          scanned_at: s.scanned_at,
          name: p?.name || 'Unknown',
          brand: p?.brand || '',
          quality_score: p?.quality_score || 0,
          nova_score: p?.nova_score || 0,
          category: p?.category || '',
          image_url: p?.image_url || '',
          product_type: p?.product_type || 'food',
        }
      })
    )
    setLoading(false)
    loadFavourites()
  }

  async function loadFavourites() {
    const favBarcodes = getFavouriteBarcodes()
    if (favBarcodes.length === 0) return

    const { data } = await supabase
      .from('products')
      .select('barcode, name, brand, quality_score, nova_score, category, image_url, product_type')
      .in('barcode', favBarcodes)

    if (data) {
      setFavourites(data.map((p: any) => ({
        barcode: p.barcode,
        scanned_at: '',
        name: p.name || 'Unknown',
        brand: p.brand || '',
        quality_score: p.quality_score || 0,
        nova_score: p.nova_score || 0,
        category: p.category || '',
        image_url: p.image_url || '',
        product_type: p.product_type || 'food',
      })))
    }
  }

  async function handleDelete(barcode: string) {
    if (!user) return
    setDeletingBarcode(barcode)
    await supabase.from('scans').delete().eq('user_id', user.id).eq('barcode', barcode)
    setScans(prev => prev.filter(s => s.barcode !== barcode))
    setDeletingBarcode(null)
    setSwipedBarcode(null)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent, barcode: string) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 80) {
      setSwipedBarcode(barcode)
    } else if (diff < -80) {
      setSwipedBarcode(null)
    }
  }

  function getScoreBg(score: number): string {
    if (score < 4.5) return 'rgba(255,90,90,0.15)'
    if (score <= 7) return 'rgba(245,166,35,0.15)'
    return 'rgba(0,229,160,0.15)'
  }

  // Filter and search
  const currentList = activeTab === 'favourites' ? favourites : scans
  const filtered = currentList.filter(scan => {
    if (search) {
      const q = search.toLowerCase()
      if (!scan.name.toLowerCase().includes(q) && !scan.brand.toLowerCase().includes(q)) return false
    }
    if (scoreFilter === 'good' && scan.quality_score < 7) return false
    if (scoreFilter === 'fair' && (scan.quality_score < 4.5 || scan.quality_score >= 7)) return false
    if (scoreFilter === 'poor' && scan.quality_score >= 4.5) return false
    return true
  })

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative pb-20">
        <div className="text-5xl mb-5">🔐</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
          Sign in to view history
        </h2>
        <p className="text-sm mb-6 text-center" style={{ color: 'rgba(240,240,244,0.45)' }}>
          Create an account to save and view your past scans.
        </p>
        <button
          onClick={() => setShowAuth(true)}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: '#7c6fff', color: '#fff', boxShadow: '0 0 20px rgba(124,111,255,0.2)' }}
        >
          Sign In
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <header className="flex items-center justify-between px-5 pt-6 pb-2 max-w-lg mx-auto relative z-10">
        <Logo size="small" />
        <h1 className="text-lg font-bold heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
          History
        </h1>
        <div className="w-10" />
      </header>

      <div className="px-5 max-w-lg mx-auto relative z-10 mt-2">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 glass-card mb-4">
          <button
            onClick={() => setActiveTab('recent')}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'recent' ? 'rgba(34,199,126,0.15)' : 'transparent',
              color: activeTab === 'recent' ? '#22c77e' : 'rgba(240,240,244,0.4)',
            }}
          >
            Recent ({scans.length})
          </button>
          <button
            onClick={() => setActiveTab('favourites')}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'favourites' ? 'rgba(245,166,35,0.15)' : 'transparent',
              color: activeTab === 'favourites' ? '#f5a623' : 'rgba(240,240,244,0.4)',
            }}
          >
            Favourites ({favourites.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none glass-input"
            style={{ color: '#f0f0f4' }}
          />
        </div>

        {/* Score filter chips */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all' as const, label: 'All' },
            { key: 'good' as const, label: 'Good (7+)', color: '#22c77e' },
            { key: 'fair' as const, label: 'Fair (4.5-7)', color: '#f5a623' },
            { key: 'poor' as const, label: 'Poor (<4.5)', color: '#ff5a5a' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setScoreFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: scoreFilter === f.key ? (f.color ? `${f.color}15` : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.03)',
                color: scoreFilter === f.key ? (f.color || '#f0f0f4') : 'rgba(240,240,244,0.4)',
                border: `1px solid ${scoreFilter === f.key ? (f.color ? `${f.color}25` : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(19,19,26,0.6)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">
              {search ? '🔍' : activeTab === 'favourites' ? '⭐' : '📋'}
            </div>
            <h3 className="text-base font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
              {search ? 'No products match your search' : activeTab === 'favourites' ? 'No favourites yet' : 'No scans yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.45)' }}>
              {search ? 'Try a different search term' : activeTab === 'favourites' ? 'Tap the star on any product to save it here' : 'Scan your first product to get started'}
            </p>
            {!search && activeTab === 'recent' && (
              <Link href="/scan" className="btn-glow inline-block px-6 py-3 rounded-xl text-sm font-medium" style={{ color: '#0b0b0f' }}>
                Scan a Product
              </Link>
            )}
          </div>
        ) : (
          <>
          {activeTab === 'recent' && <WeeklySummary scans={scans} />}
          <div className="space-y-1.5">
            {filtered.map((scan) => (
              <div
                key={`${scan.barcode}-${scan.scanned_at}`}
                className="relative overflow-hidden rounded-xl"
                onTouchStart={e => handleTouchStart(e)}
                onTouchEnd={e => handleTouchEnd(e, scan.barcode)}
              >
                {/* Delete button (revealed on swipe) */}
                {swipedBarcode === scan.barcode && activeTab === 'recent' && (
                  <button
                    onClick={() => handleDelete(scan.barcode)}
                    className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center z-10"
                    style={{ backgroundColor: '#ff5a5a' }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {deletingBarcode === scan.barcode ? '...' : 'Delete'}
                    </span>
                  </button>
                )}

                <Link
                  href={`/result/${scan.barcode}`}
                  className="flex items-center gap-3 px-4 py-3.5 glass-card transition-all duration-200 relative z-0"
                  style={{
                    transform: swipedBarcode === scan.barcode ? 'translateX(-80px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {scan.image_url ? (
                    <img src={scan.image_url} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="text-xl w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                      {scan.product_type === 'cosmetic' ? '💄' : getCategoryEmoji(scan.category)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>{scan.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.45)' }}>{scan.brand}</p>
                      {scan.scanned_at && (
                        <>
                          <span className="text-xs" style={{ color: 'rgba(240,240,244,0.2)' }}>·</span>
                          <p className="text-xs shrink-0" style={{ color: 'rgba(240,240,244,0.35)' }}>{formatDate(scan.scanned_at)}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <span
                    className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: getScoreBg(scan.quality_score),
                      color: getScoreColor(scan.quality_score),
                    }}
                  >
                    {scan.quality_score.toFixed(1)}
                  </span>
                </Link>
              </div>
            ))}

            {/* Swipe hint */}
            {activeTab === 'recent' && filtered.length > 0 && (
              <p className="text-xs text-center pt-2" style={{ color: 'rgba(240,240,244,0.25)' }}>
                Swipe left on any item to delete
              </p>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  )
}
