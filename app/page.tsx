'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDisplayScore, getScoreClass } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'

type RecentScan = {
  barcode: string
  name: string
  brand: string
  quality_score: number
  nova_score: number
  category: string
  image_url?: string
  scanned_at: string
}

const QUICK_CATEGORIES = [
  { emoji: '🥛', label: 'Dairy', term: 'yogurt' },
  { emoji: '🥖', label: 'Bread', term: 'bread' },
  { emoji: '🥤', label: 'Drinks', term: 'drink' },
  { emoji: '🍿', label: 'Snacks', term: 'snack' },
  { emoji: '💄', label: 'Beauty', term: 'cosmetic' },
  { emoji: '👶', label: 'Baby', term: 'baby' },
]

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (isNaN(then)) return ''
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string } } | null>(null)
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [stats, setStats] = useState({ total: 0, flagged: 0, avgScore: 0 })
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        loadUserData(data.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadUserData(session.user.id)
      } else {
        setUser(null)
        setRecentScans([])
        setStats({ total: 0, flagged: 0, avgScore: 0 })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(userId: string) {
    const { data } = await supabase
      .from('scans')
      .select('barcode, scanned_at, products(name, brand, quality_score, nova_score, category, image_url, additives)')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false })
      .limit(50)

    if (!data) return

    const mapped: RecentScan[] = data.map((s: any) => ({
      barcode: s.barcode,
      name: s.products?.name || 'Unknown',
      brand: s.products?.brand || '',
      quality_score: s.products?.quality_score || 0,
      nova_score: s.products?.nova_score || 0,
      category: s.products?.category || '',
      image_url: s.products?.image_url || '',
      scanned_at: s.scanned_at,
    }))

    setRecentScans(mapped.slice(0, 4))

    // Stats: total scans, flagged-additive scans, average display score.
    const total = mapped.length
    const flagged = data.filter((s: any) => Array.isArray(s.products?.additives) && s.products.additives.length > 0).length
    const avg = total > 0
      ? Math.round(mapped.reduce((sum, s) => sum + getDisplayScore(s.quality_score), 0) / total)
      : 0
    setStats({ total, flagged, avgScore: avg })
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-[480px] mx-auto pt-16 pb-24 animate-fadeIn">
      {/* Greeting */}
      <div className="px-5 pt-7 pb-5">
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
          {greeting()}{user ? `, ${userName}` : ''}
        </div>
        <h1 className="heading-display" style={{ fontSize: 28, letterSpacing: '-0.025em' }}>
          Know <em style={{ color: 'var(--green)' }}>what&apos;s</em> in your products
        </h1>
      </div>

      {/* Hero scan CTA */}
      <Link
        href="/scan"
        className="block mx-5 mb-6 relative overflow-hidden cursor-pointer animate-fadeUp"
        style={{
          background: 'var(--dark)',
          borderRadius: 24,
          padding: '28px 24px',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(61, 140, 94, 0.15)',
          }}
        />
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 10,
          }}
        >
          Quick action
        </div>
        <h2
          className="heading-display"
          style={{ fontSize: 26, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}
        >
          Scan a <em style={{ color: '#a8d5b5' }}>barcode</em>
          <br />in seconds
        </h2>
        <button
          className="inline-flex items-center gap-2"
          type="button"
          style={{
            background: '#fff',
            color: 'var(--dark)',
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <span>📷</span> Scan now
        </button>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: 24,
            bottom: 28,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          📦
        </div>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5 mx-5 mb-6">
        <StatCard num={stats.total} label="Products scanned" color="var(--green)" />
        <StatCard num={stats.flagged} label="Additives flagged" color="var(--amber)" />
        <StatCard num={stats.avgScore} label="Avg quality score" color="var(--dark)" />
      </div>

      {/* Recent scans */}
      <div className="flex items-center justify-between px-5 pb-3">
        <span className="heading-display" style={{ fontSize: 18 }}>Recent scans</span>
        <Link href="/history" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
          See all
        </Link>
      </div>
      <div className="card mx-5 mb-5 overflow-hidden">
        {recentScans.length > 0 ? (
          recentScans.map((scan, i) => (
            <Link
              key={scan.barcode + i}
              href={`/result/${scan.barcode}`}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
              style={{
                borderBottom: i < recentScans.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--cream)',
                  fontSize: 20,
                }}
              >
                {scan.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={scan.image_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} />
                ) : (
                  <span>{getCategoryEmoji(scan.category)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--dark)',
                    marginBottom: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {scan.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {scan.brand}{scan.category ? ` · ${scan.category.split(',')[0]}` : ''}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`score-pill ${getScoreClass(scan.quality_score)}`}>
                  {getDisplayScore(scan.quality_score)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {relativeTime(scan.scanned_at)}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 px-5">
            <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>📷</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
              {user ? 'No scans yet — try scanning your first product' : 'Sign in to see your scan history'}
            </div>
            {!user && (
              <button
                onClick={() => setShowAuth(true)}
                type="button"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--green)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tip card */}
      <div
        className="mx-5 mb-6 animate-fadeUp"
        style={{
          background: 'var(--green-bg)',
          borderRadius: 16,
          border: '1px solid rgba(61, 140, 94, 0.2)',
          padding: 18,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--green)',
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          Did you know
        </div>
        <div style={{ fontSize: 14, color: 'var(--green-deep)', lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 500 }}>E407 (Carrageenan)</strong> appears in 1 in 3 UK yogurts. It&apos;s linked to gut inflammation and is banned in EU organic products. Check your fridge today.
        </div>
      </div>

      {/* Browse by category */}
      <div className="flex items-center justify-between px-5 pb-3">
        <span className="heading-display" style={{ fontSize: 18 }}>Browse by category</span>
      </div>
      <div className="flex gap-2.5 px-5 pb-6 overflow-x-auto scrollbar-hide">
        {QUICK_CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={`/search?term=${encodeURIComponent(cat.term)}`}
            className="flex-shrink-0 text-center"
          >
            <div
              className="flex items-center justify-center mb-1.5"
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                fontSize: 24,
              }}
            >
              {cat.emoji}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{cat.label}</div>
          </Link>
        ))}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

function StatCard({ num, label, color }: { num: number; label: string; color: string }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="heading-display" style={{ fontSize: 24, color, letterSpacing: '-0.025em' }}>
        {num}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.3 }}>
        {label}
      </div>
    </div>
  )
}
