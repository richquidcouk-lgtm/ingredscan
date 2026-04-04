'use client'

import { useEffect, useState } from 'react'
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

function EmptyHistorySVG() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-32 mx-auto mb-5">
      {/* Barcode */}
      <g className="history-float">
        <rect x="50" y="30" width="100" height="70" rx="8" fill="#13131a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {[60, 68, 74, 82, 90, 96, 104, 112, 120, 128, 136].map((x, i) => (
          <rect key={i} x={x} y={45} width={i % 3 === 0 ? 3 : 2} height={40} rx="0.5" fill="rgba(255,255,255,0.12)" />
        ))}
      </g>
      {/* Magnifying glass */}
      <g className="history-float" style={{ animationDelay: '0.5s' }}>
        <circle cx="130" cy="55" r="22" fill="none" stroke="#00e5a0" strokeWidth="2" opacity="0.6" />
        <line x1="146" y1="71" x2="160" y2="85" stroke="#00e5a0" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <circle cx="130" cy="55" r="22" fill="#00e5a0" opacity="0.04">
          <animate attributeName="opacity" values="0.02;0.08;0.02" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}

export default function HistoryPage() {
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 relative">
        <div className="text-5xl mb-5">{'\uD83D\uDD10'}</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
          Sign in to view history
        </h2>
        <p className="text-sm mb-6 text-center" style={{ color: 'rgba(240,240,244,0.4)' }}>
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
    <div className="min-h-screen pb-24 relative">
      <div className="px-5 pt-6 max-w-lg mx-auto relative z-10">
        <h1 className="text-2xl font-bold heading-display mb-1" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
          History
        </h1>
        <p className="text-sm mb-5" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Your past scans
        </p>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search past scans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none glass-input"
            style={{ color: '#f0f0f4' }}
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(19,19,26,0.6)' }} />
            ))}
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-12 animate-fadeUp">
            {search ? (
              <>
                <div className="text-4xl mb-4">{'\uD83D\uDD0D'}</div>
                <h3 className="text-lg font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
                  No matching scans
                </h3>
                <p className="text-sm" style={{ color: 'rgba(240,240,244,0.4)' }}>
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <EmptyHistorySVG />
                <h3 className="text-lg font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
                  Your scan history lives here
                </h3>
                <p className="text-sm mb-6 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>
                  Every product you scan gets saved automatically. Start scanning to build your food diary.
                </p>
                <Link
                  href="/scan"
                  className="btn-glow inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
                  style={{ color: '#0b0b0f' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                  </svg>
                  Scan Your First Product
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredScans.map((scan) => (
              <Link
                key={`${scan.barcode}-${scan.scanned_at}`}
                href={`/result/${scan.barcode}`}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl glass-card transition-all duration-200"
              >
                <span className="text-xl">{getCategoryEmoji(scan.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>{scan.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>{scan.brand}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold" style={{ color: getScoreColor(scan.quality_score) }}>
                    {scan.quality_score.toFixed(1)}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${getNovaColor(scan.nova_score)}20`, color: getNovaColor(scan.nova_score) }}>
                    {getNovaEmoji(scan.nova_score)}
                  </span>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'rgba(240,240,244,0.25)' }}>
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
