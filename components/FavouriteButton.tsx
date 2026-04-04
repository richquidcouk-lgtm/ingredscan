'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function FavouriteButton({ barcode }: { barcode: string }) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    checkFavourite()
  }, [barcode])

  async function checkFavourite() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('favourites')
      .select('id')
      .eq('user_id', user.id)
      .eq('barcode', barcode)
      .maybeSingle()

    setIsFav(!!data)
    setLoading(false)
  }

  async function toggleFavourite() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Will be handled by auth redirect in parent
      return
    }

    setAnimating(true)
    const newState = !isFav
    setIsFav(newState) // Immediate visual feedback

    try {
      if (newState) {
        await supabase.from('favourites').insert({
          user_id: user.id,
          barcode,
          saved_at: new Date().toISOString(),
        })
      } else {
        await supabase.from('favourites')
          .delete()
          .eq('user_id', user.id)
          .eq('barcode', barcode)
      }
    } catch {
      setIsFav(!newState) // Revert on error
    }

    setTimeout(() => setAnimating(false), 300)
  }

  if (loading) return null

  return (
    <button
      onClick={toggleFavourite}
      className="p-2 rounded-xl transition-all duration-200 active:scale-90"
      style={{ backgroundColor: '#1c1c26' }}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isFav ? '#ff5a5a' : 'none'}
        stroke={isFav ? '#ff5a5a' : '#f0f0f4'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300"
        style={{
          transform: animating ? 'scale(1.3)' : 'scale(1)',
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
