'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getScoreColor } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'
import Logo from '@/components/Logo'

type ScanHistory = {
  barcode: string
  scanned_at: string
  name: string
  brand: string
  quality_score: number
  nova_score: number
  category: string
  image_url?: string
}

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [scans, setScans] = useState<ScanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

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
      .select('barcode, scanned_at, products(name, brand, quality_score, nova_score, category, image_url)')
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
          image_url: s.products?.image_url || '',
        }))
      )
    }
    setLoading(false)
  }

  async function handleClearAll() {
    if (!user) return
    if (!confirm('Clear all scan history? This cannot be undone.')) return
    await supabase.from('scans').delete().eq('user_id', user.id)
    setScans([])
  }

  function getScoreBg(score: number): string {
    if (score < 4.5) return 'rgba(255,90,90,0.15)'
    if (score <= 7) return 'rgba(245,166,35,0.15)'
    return 'rgba(0,229,160,0.15)'
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative pb-20">
        <div className="text-5xl mb-5">🔐</div>
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
    <div className="min-h-screen pb-20 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2 max-w-lg mx-auto relative z-10">
        <Logo size="small" />
        <h1 className="text-lg font-bold heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
          Recents
        </h1>
        {scans.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-medium"
            style={{ color: 'rgba(240,240,244,0.4)' }}
          >
            Clear all
          </button>
        )}
      </header>

      <div className="px-5 max-w-lg mx-auto relative z-10 mt-4">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(19,19,26,0.6)' }} />
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-5">📋</div>
            <h3 className="text-lg font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
              No scans yet
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Scan your first product to get started
            </p>
            <Link href="/scan" className="btn-glow inline-block px-6 py-3 rounded-xl text-sm font-medium" style={{ color: '#0b0b0f' }}>
              Scan a Product
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {scans.map((scan) => (
              <Link
                key={`${scan.barcode}-${scan.scanned_at}`}
                href={`/result/${scan.barcode}`}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl glass-card transition-all duration-200"
              >
                {scan.image_url ? (
                  <img src={scan.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <span className="text-xl w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                    {getCategoryEmoji(scan.category)}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>{scan.name}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.4)' }}>{scan.brand}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
