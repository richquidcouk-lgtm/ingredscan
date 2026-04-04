'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getScoreColor, getNovaColor, getNovaEmoji } from '@/lib/scoring'
import { getCategoryEmoji, formatDate } from '@/lib/utils'
import AuthModal from '@/components/AuthModal'

type Favourite = {
  id: string
  barcode: string
  saved_at: string
  name: string
  brand: string
  quality_score: number
  nova_score: number
  category: string
  image_url: string
}

export default function FavouritesPage() {
  const [user, setUser] = useState<any>(null)
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [swipingId, setSwipingId] = useState<string | null>(null)
  const touchStartX = useRef(0)
  const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        loadFavourites(data.user.id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function loadFavourites(userId: string) {
    const { data } = await supabase
      .from('favourites')
      .select('id, barcode, saved_at, products(name, brand, quality_score, nova_score, category, image_url)')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })

    if (data) {
      setFavourites(
        data.map((f: any) => ({
          id: f.id,
          barcode: f.barcode,
          saved_at: f.saved_at,
          name: f.products?.name || 'Unknown',
          brand: f.products?.brand || '',
          quality_score: f.products?.quality_score || 0,
          nova_score: f.products?.nova_score || 0,
          category: f.products?.category || '',
          image_url: f.products?.image_url || '',
        }))
      )
    }
    setLoading(false)
  }

  async function removeFavourite(id: string) {
    setFavourites(prev => prev.filter(f => f.id !== id))
    await supabase.from('favourites').delete().eq('id', id)
  }

  function handleTouchStart(id: string, e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].screenX
    setSwipingId(id)
  }

  function handleTouchMove(id: string, e: React.TouchEvent) {
    if (swipingId !== id) return
    const diff = touchStartX.current - e.changedTouches[0].screenX
    if (diff > 0) {
      setSwipeOffset(prev => ({ ...prev, [id]: Math.min(diff, 80) }))
    }
  }

  function handleTouchEnd(id: string) {
    const offset = swipeOffset[id] || 0
    if (offset > 60) {
      removeFavourite(id)
    } else {
      setSwipeOffset(prev => ({ ...prev, [id]: 0 }))
    }
    setSwipingId(null)
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 relative">
        <div className="text-5xl mb-5">\uD83D\uDD12</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
          Sign in to view favourites
        </h2>
        <p className="text-sm mb-6 text-center" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Create an account to save your favourite products.
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
          My Favourites
        </h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Your saved products &middot; tap to re-scan
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(19,19,26,0.6)' }} />
            ))}
          </div>
        ) : favourites.length === 0 ? (
          <div className="text-center py-16 animate-fadeUp">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.15)" strokeWidth="1.5" className="mx-auto mb-4">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3 className="text-lg font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
              No favourites yet
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Tap &#9825; on any scan result to save it here
            </p>
            <Link href="/scan" className="btn-glow inline-block px-6 py-3 rounded-xl text-sm font-medium" style={{ color: '#0b0b0f' }}>
              Start Scanning &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {favourites.map((fav) => (
              <div key={fav.id} className="relative overflow-hidden rounded-xl">
                {/* Delete background */}
                <div
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-4"
                  style={{ backgroundColor: 'rgba(255,90,90,0.15)', width: 80 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5a5a" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <Link
                  href={`/result/${fav.barcode}`}
                  className="relative flex items-center gap-3 px-4 py-3.5 glass-card transition-transform"
                  style={{
                    transform: `translateX(-${swipeOffset[fav.id] || 0}px)`,
                    transition: swipingId === fav.id ? 'none' : 'transform 0.2s ease',
                  }}
                  onTouchStart={(e) => handleTouchStart(fav.id, e)}
                  onTouchMove={(e) => handleTouchMove(fav.id, e)}
                  onTouchEnd={() => handleTouchEnd(fav.id)}
                >
                  {fav.image_url ? (
                    <img src={fav.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                      {getCategoryEmoji(fav.category)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>{fav.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>{fav.brand}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold" style={{ color: getScoreColor(fav.quality_score) }}>
                      {fav.quality_score.toFixed(1)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${getNovaColor(fav.nova_score)}20`, color: getNovaColor(fav.nova_score) }}>
                      {getNovaEmoji(fav.nova_score)}
                    </span>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'rgba(240,240,244,0.25)' }}>
                    {formatDate(fav.saved_at)}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
