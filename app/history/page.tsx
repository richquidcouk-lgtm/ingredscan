'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getScoreColor, getNovaColor, getNovaEmoji } from '@/lib/scoring'
import { getCategoryEmoji, formatDate } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'

type ScanHistory = {
  barcode: string
  scanned_at: string
  name: string
  brand: string
  quality_score: number
  nova_score: number
  category: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [scans, setScans] = useState<ScanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [search, setSearch] = useState('')

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
    const { data } = await supabase
      .from('scans')
      .select('barcode, scanned_at, products(name, brand, quality_score, nova_score, category)')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false })

    if (data) {
      setScans(
        data.map((s: any) => ({
          barcode: s.barcode,
          scanned_at: s.scanned_at,
          name: s.products?.name || 'Unknown',
          brand: s.products?.brand || '',
          quality_score: s.products?.quality_score || 0,
          nova_score: s.products?.nova_score || 0,
          category: s.products?.category || '',
        }))
      )
    }
    setLoading(false)
  }

  const filteredScans = search
    ? scans.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.brand.toLowerCase().includes(search.toLowerCase()))
    : scans

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#0b0b0f' }}>
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-clash), system-ui', color: '#f0f0f4' }}>
          Sign in to view history
        </h2>
        <p className="text-sm mb-6 text-center" style={{ color: 'rgba(240,240,244,0.45)' }}>
          Create an account to save and view your past scans.
        </p>
        <button
          onClick={() => setShowAuth(true)}
          className="px-6 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#7c6fff', color: '#fff' }}
        >
          Sign In
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
      <header className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <h1 className="text-base font-semibold" style={{ color: '#f0f0f4' }}>History</h1>
        <div className="w-9" />
      </header>

      <div className="px-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.35)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search past scans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ backgroundColor: '#1c1c26', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f4' }}
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: '#13131a' }} />
            ))}
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#f0f0f4' }}>
              {search ? 'No matching scans' : 'No scans yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.45)' }}>
              {search ? 'Try a different search term' : 'Scan your first product to get started'}
            </p>
            {!search && (
              <Link href="/scan" className="inline-block px-6 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: '#22c77e', color: '#0b0b0f' }}>
                Scan a Product
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredScans.map((scan) => (
              <Link
                key={`${scan.barcode}-${scan.scanned_at}`}
                href={`/result/${scan.barcode}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                style={{ backgroundColor: '#13131a' }}
              >
                <span className="text-xl">{getCategoryEmoji(scan.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>{scan.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>{scan.brand}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold" style={{ color: getScoreColor(scan.quality_score) }}>
                    {scan.quality_score.toFixed(1)}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${getNovaColor(scan.nova_score)}20`, color: getNovaColor(scan.nova_score) }}>
                    {getNovaEmoji(scan.nova_score)}
                  </span>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'rgba(240,240,244,0.3)' }}>
                  {formatDate(scan.scanned_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
