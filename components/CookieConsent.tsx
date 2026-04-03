'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ingredscan_cookie_consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem('ingredscan_cookie_consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="max-w-lg mx-auto rounded-2xl px-5 py-4 flex items-center justify-between gap-4 glass-card"
        style={{
          pointerEvents: 'auto',
          backgroundColor: 'rgba(19, 19, 26, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-xs" style={{ color: 'rgba(240,240,244,0.6)' }}>
          We use essential cookies only. No ad tracking. Ever.{' '}
          <Link href="/cookies" style={{ color: '#7c6fff' }} className="underline underline-offset-2">
            Learn more
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            backgroundColor: '#00e5a0',
            color: '#0b0b0f',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
