'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Cream-theme cookie consent banner. Sits above the bottom nav and is
// dismissed once the user accepts.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ingredscan_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function handleAccept() {
    localStorage.setItem('ingredscan_cookie_consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4"
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        pointerEvents: 'none',
      }}
    >
      <div
        className="max-w-[480px] mx-auto rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
        style={{
          pointerEvents: 'auto',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 6px 24px rgba(28, 27, 24, 0.12)',
        }}
      >
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
          We use essential cookies only. No ad tracking. Ever.{' '}
          <Link
            href="/cookies"
            className="underline underline-offset-2"
            style={{ color: 'var(--green)' }}
          >
            Learn more
          </Link>
        </p>
        <button
          onClick={handleAccept}
          type="button"
          className="shrink-0"
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            background: 'var(--dark)',
            color: '#fff',
            border: 'none',
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
