'use client'

import { useState } from 'react'

const CATEGORY_EMOJI_MAP: [string[], string][] = [
  [['beverage', 'drink', 'water', 'soda', 'cola'], '\uD83E\uDD64'],
  [['dairy', 'milk', 'cheese'], '\uD83E\uDD5B'],
  [['bread', 'baker', 'baguette', 'roll'], '\uD83C\uDF5E'],
  [['chocolate', 'confectionery', 'candy', 'sweet'], '\uD83C\uDF6B'],
  [['crisp', 'snack', 'chip', 'popcorn'], '\uD83C\uDF5F'],
  [['cereal', 'breakfast', 'oat', 'muesli'], '\uD83E\uDD63'],
  [['sauce', 'ketchup', 'condiment', 'dressing'], '\uD83E\uDED4'],
  [['meat', 'sausage', 'ham', 'beef', 'pork', 'chicken'], '\uD83E\uDD69'],
  [['fish', 'seafood', 'tuna', 'salmon', 'cod'], '\uD83D\uDC1F'],
  [['fruit', 'apple', 'banana', 'orange'], '\uD83C\uDF4E'],
  [['vegetable', 'salad', 'carrot', 'broccoli'], '\uD83E\uDD66'],
  [['ready meal', 'prepared', 'frozen meal'], '\uD83C\uDF71'],
  [['baby food', 'infant'], '\uD83D\uDC76'],
  [['yoghurt', 'yogurt'], '\uD83C\uDF66'],
  [['juice', 'smoothie'], '\uD83E\uDDC3'],
  [['tinned', 'canned'], '\uD83E\uDED9'],
]

function getCategoryFallbackEmoji(category: string): string {
  const lower = category.toLowerCase()
  for (const [keywords, emoji] of CATEGORY_EMOJI_MAP) {
    if (keywords.some(kw => lower.includes(kw))) return emoji
  }
  return '\uD83D\uDCE6'
}

export default function ProductImage({
  imageUrl,
  category,
  name,
  size = 80,
}: {
  imageUrl: string
  category: string
  name: string
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const emoji = getCategoryFallbackEmoji(category)

  if (!imageUrl || failed) {
    return (
      <div
        className="rounded-2xl flex items-center justify-center shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: 'rgba(28,28,38,0.8)',
          fontSize: size * 0.4,
        }}
      >
        {emoji}
      </div>
    )
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Skeleton placeholder */}
      {!loaded && (
        <div
          className="absolute inset-0 animate-shimmer rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, #1c1c26 25%, #252533 50%, #1c1c26 75%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{
          opacity: loaded ? 1 : 0,
          borderRadius: 16,
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
