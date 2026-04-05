'use client'

import { useState, useEffect } from 'react'

const FAVOURITES_KEY = 'ingredscan_favourites'

function getFavourites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(FAVOURITES_KEY) || '[]')
  } catch {
    return []
  }
}

function setFavourites(barcodes: string[]) {
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(barcodes))
}

export function isFavourite(barcode: string): boolean {
  return getFavourites().includes(barcode)
}

export function getFavouriteBarcodes(): string[] {
  return getFavourites()
}

export default function FavouriteButton({ barcode }: { barcode: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getFavourites().includes(barcode))
  }, [barcode])

  function toggle() {
    const favs = getFavourites()
    if (favs.includes(barcode)) {
      setFavourites(favs.filter(b => b !== barcode))
      setSaved(false)
    } else {
      setFavourites([barcode, ...favs].slice(0, 50))
      setSaved(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl glass-card transition-all active:scale-90"
      aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? '#f5a623' : 'none'}
        stroke={saved ? '#f5a623' : '#f0f0f4'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  )
}
