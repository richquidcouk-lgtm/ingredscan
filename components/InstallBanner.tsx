'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const MOTIVATIONAL_TAGS = [
  'Know what you eat',
  'Scan in seconds',
  'Free to use',
  '180K+ products',
  'Works offline',
  'No sign-up needed',
]

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [tagIndex, setTagIndex] = useState(0)

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if previously dismissed this session
    if (sessionStorage.getItem('ingredscan_banner_dismissed')) {
      setDismissed(true)
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Rotate motivational tags
  useEffect(() => {
    const interval = setInterval(() => {
      setTagIndex((i) => (i + 1) % MOTIVATIONAL_TAGS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem('ingredscan_banner_dismissed', 'true')
  }

  if (isInstalled || dismissed) return null

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 animate-fadeUp"
      style={{
        background: 'linear-gradient(135deg, rgba(0,229,160,0.1) 0%, rgba(124,111,255,0.08) 50%, rgba(0,229,160,0.06) 100%)',
        border: '1px solid rgba(0,229,160,0.15)',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
        style={{ color: 'rgba(240,240,244,0.3)' }}
        aria-label="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Decorative glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.15) 0%, transparent 70%)' }}
      />

      <div className="flex items-center gap-4">
        {/* App icon */}
        <div
          className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #00e5a0, #1ab06e)',
            boxShadow: '0 4px 16px rgba(0,229,160,0.25)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
            Get the IngredScan App
          </h3>
          {/* Rotating tag */}
          <p
            className="text-xs mt-0.5 transition-opacity duration-300"
            style={{ color: '#00e5a0' }}
            key={tagIndex}
          >
            {MOTIVATIONAL_TAGS[tagIndex]}
          </p>
        </div>

        {/* Install / Open button */}
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold btn-glow transition-all"
            style={{ color: '#0b0b0f' }}
          >
            Install
          </button>
        ) : (
          <Link
            href="/scan"
            className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold btn-glow transition-all"
            style={{ color: '#0b0b0f' }}
          >
            Open App
          </Link>
        )}
      </div>

      {/* Mini tag pills */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {['Scan barcodes', 'Instant scores', 'Find better swaps'].map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: 'rgba(0,229,160,0.08)',
              color: 'rgba(0,229,160,0.7)',
              border: '1px solid rgba(0,229,160,0.12)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
