'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getDisplayScore, getScoreClass } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'
import { getFavouriteBarcodes } from '@/components/FavouriteButton'
import AuthModal from '@/components/AuthModal'

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
  additives_count?: number
}

type Filter = 'all' | 'food' | 'cosmetics' | 'poor' | 'good' | 'additives'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'food', label: 'Food' },
  { key: 'cosmetics', label: 'Cosmetics' },
  { key: 'poor', label: 'Poor (< 50)' },
  { key: 'good', label: 'Good (> 70)' },
  { key: 'additives', label: 'Has additives' },
]

function dayLabel(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86400000)
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function timeLabel(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function HistoryPage() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [scans, setScans] = useState<ScanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
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
      return
    }

    const barcodes = Array.from(new Set(scansData.map((s: { barcode: string }) => s.barcode)))
    const { data: productsData } = await supabase
      .from('products')
      .select('barcode, name, brand, quality_score, nova_score, category, image_url, product_type, additives')
      .in('barcode', barcodes)

    const productMap = new Map(
      (productsData || []).map((p: { barcode: string; [k: string]: unknown }) => [p.barcode, p])
    )

    setScans(
      scansData.map((s: { barcode: string; scanned_at: string }) => {
        const p = productMap.get(s.barcode) as Record<string, unknown> | undefined
        const additives = Array.isArray(p?.additives) ? p?.additives : []
        return {
          barcode: s.barcode,
          scanned_at: s.scanned_at,
          name: (p?.name as string) || 'Unknown',
          brand: (p?.brand as string) || '',
          quality_score: (p?.quality_score as number) || 0,
          nova_score: (p?.nova_score as number) || 0,
          category: (p?.category as string) || '',
          image_url: (p?.image_url as string) || '',
          product_type: (p?.product_type as string) || 'food',
          additives_count: additives.length,
        }
      })
    )
    setLoading(false)
  }

  async function handleDelete(barcode: string) {
    if (!user) return
    await supabase.from('scans').delete().eq('user_id', user.id).eq('barcode', barcode)
    setScans((prev) => prev.filter((s) => s.barcode !== barcode))
    setSwipedBarcode(null)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent, barcode: string) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 80) setSwipedBarcode(barcode)
    else if (diff < -80) setSwipedBarcode(null)
  }

  // Apply search + filter
  const filtered = scans.filter((scan) => {
    if (search) {
      const q = search.toLowerCase()
      if (!scan.name.toLowerCase().includes(q) && !scan.brand.toLowerCase().includes(q)) return false
    }
    if (filter === 'food' && scan.product_type === 'cosmetic') return false
    if (filter === 'cosmetics' && scan.product_type !== 'cosmetic') return false
    if (filter === 'poor' && getDisplayScore(scan.quality_score) >= 50) return false
    if (filter === 'good' && getDisplayScore(scan.quality_score) <= 70) return false
    if (filter === 'additives' && (scan.additives_count || 0) === 0) return false
    return true
  })

  // Group by day label
  const groups = new Map<string, ScanHistory[]>()
  for (const s of filtered) {
    const k = dayLabel(s.scanned_at)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(s)
  }

  if (!user && !loading) {
    return (
      <div className="max-w-[480px] mx-auto pt-20 pb-24 px-6 text-center animate-fadeIn">
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🔐</div>
        <h2 className="heading-display" style={{ fontSize: 22, marginBottom: 8 }}>
          Sign in to view history
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
          Create an account to save and view your past scans.
        </p>
        <button
          onClick={() => setShowAuth(true)}
          type="button"
          className="btn-primary"
          style={{ maxWidth: 240 }}
        >
          Sign in
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto pt-16 pb-24 animate-fadeIn">
      <div className="px-5 pt-5">
        <h1 className="heading-display" style={{ fontSize: 22, marginBottom: 16 }}>
          Scan history
        </h1>
      </div>

      {/* Search */}
      <div className="px-5 mb-4 relative">
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
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
          style={{
            padding: '12px 16px 12px 42px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 14,
            color: 'var(--dark)',
          }}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            type="button"
            className="flex-shrink-0 whitespace-nowrap"
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              border: '1px solid var(--border)',
              background: filter === f.key ? 'var(--dark)' : 'var(--card)',
              color: filter === f.key ? '#fff' : 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="px-5 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--card)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-10 py-16 text-center" style={{ color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>
            {search ? '🔍' : '📋'}
          </div>
          <h3 className="heading-display" style={{ fontSize: 20, color: 'var(--dark)', marginBottom: 8 }}>
            {search ? 'No products match' : 'No scans yet'}
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
            {search ? 'Try a different search term' : 'Scan your first product to get started'}
          </p>
          {!search && (
            <Link href="/scan" className="inline-block">
              <span
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'var(--dark)',
                  color: '#fff',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Scan a product
              </span>
            </Link>
          )}
        </div>
      ) : (
        Array.from(groups.entries()).map(([dayKey, items]) => (
          <div key={dayKey}>
            <div
              className="px-5 pb-2 pt-1"
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {dayKey}
            </div>
            {items.map((scan) => (
              <div
                key={`${scan.barcode}-${scan.scanned_at}`}
                className="relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, scan.barcode)}
              >
                {swipedBarcode === scan.barcode && (
                  <button
                    onClick={() => handleDelete(scan.barcode)}
                    className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center z-10"
                    style={{ background: 'var(--red)', color: '#fff', fontSize: 12, fontWeight: 600 }}
                    type="button"
                  >
                    Delete
                  </button>
                )}
                <Link
                  href={`/result/${scan.barcode}`}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'transparent',
                    transform: swipedBarcode === scan.barcode ? 'translateX(-80px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      background: 'var(--cream)',
                      border: '1px solid var(--border)',
                      fontSize: 18,
                    }}
                  >
                    {scan.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={scan.image_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 9, objectFit: 'cover' }} />
                    ) : (
                      <span>{scan.product_type === 'cosmetic' ? '💄' : getCategoryEmoji(scan.category)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--dark)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {scan.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                      {[
                        scan.brand,
                        scan.category?.split(',')[0],
                        scan.additives_count != null
                          ? `${scan.additives_count} additive${scan.additives_count === 1 ? '' : 's'}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <div
                      className="heading-display"
                      style={{
                        fontSize: 18,
                        color:
                          getScoreClass(scan.quality_score) === 'score-good'
                            ? 'var(--green)'
                            : getScoreClass(scan.quality_score) === 'score-fair'
                            ? 'var(--amber)'
                            : 'var(--red)',
                      }}
                    >
                      {getDisplayScore(scan.quality_score)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                      {timeLabel(scan.scanned_at)}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ))
      )}

      {filtered.length > 0 && (
        <p className="text-center pt-4" style={{ fontSize: 11, color: 'var(--muted)' }}>
          Swipe left on any item to delete
        </p>
      )}
    </div>
  )
}
