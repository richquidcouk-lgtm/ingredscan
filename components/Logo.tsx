'use client'

import Link from 'next/link'

export default function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const iconSize = size === 'small' ? 20 : size === 'large' ? 32 : 24
  const textSize = size === 'small' ? 'text-base' : size === 'large' ? 'text-2xl' : 'text-lg'

  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      {/* Logo icon — scanner brackets with leaf */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none">
        {/* Scanner brackets */}
        <path d="M6 10V7a3 3 0 0 1 3-3h3" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 4h3a3 3 0 0 1 3 3v3" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 22v3a3 3 0 0 1-3 3h-3" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 28H9a3 3 0 0 1-3-3v-3" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" />
        {/* Leaf in center */}
        <path d="M16 11c-4 0-5 5-5 8 2-2 4-3 5-3 1 0 3 1 5 3 0-3-1-8-5-8z" fill="#00e5a0" opacity="0.9" />
        <path d="M16 11v8" stroke="#0b0b0f" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {/* App name */}
      <span className={`${textSize} font-extrabold heading-display`} style={{ letterSpacing: '-0.04em' }}>
        <span style={{ color: '#f0f0f4' }}>Ingred</span>
        <span style={{ color: '#00e5a0' }}>Scan</span>
      </span>
    </Link>
  )
}
