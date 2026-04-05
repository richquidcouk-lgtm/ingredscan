'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

const INSTALL_DONE_KEY = 'ingredscan_installed'

interface Props {
  variant?: 'default' | 'compact' | 'blog'
}

export default function InstallBanner({ variant = 'default' }: Props) {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      if (localStorage.getItem(INSTALL_DONE_KEY) === 'true') {
        setIsInstalled(true)
        return
      }
    }

    // Detect iOS
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setIsIOS(true)
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setCanInstall(false)
      localStorage.setItem(INSTALL_DONE_KEY, 'true')
    })

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  async function handleInstall() {
    const prompt = deferredPromptRef.current
    if (!prompt) return
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') {
      localStorage.setItem(INSTALL_DONE_KEY, 'true')
      setIsInstalled(true)
    }
    deferredPromptRef.current = null
    setCanInstall(false)
  }

  // Don't show if already installed
  if (isInstalled) return null

  if (variant === 'blog') {
    return (
      <div
        className="rounded-2xl p-5 my-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,160,0.08) 0%, rgba(124,111,255,0.08) 100%)',
          border: '1px solid rgba(0,229,160,0.15)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #00e5a0, #1ab06e)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold mb-0.5" style={{ color: '#f0f0f4' }}>
              Scan products instantly with IngredScan
            </h4>
            <p className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>
              Free app — works like any native app. No app store needed.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {canInstall ? (
            <button
              onClick={handleInstall}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00e5a0, #1ab06e)', color: '#0b0b0f' }}
            >
              Install App
            </button>
          ) : (
            <Link
              href="/scan"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00e5a0, #1ab06e)', color: '#0b0b0f' }}
            >
              Try It Now
            </Link>
          )}
        </div>
        {isIOS && !canInstall && (
          <p className="text-[11px] mt-3 text-center leading-relaxed" style={{ color: 'rgba(240,240,244,0.5)' }}>
            On iPhone: tap <span style={{ color: '#007AFF' }}>Share</span> ↗ then <strong>&quot;Add to Home Screen&quot;</strong>
          </p>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(0,229,160,0.06)',
          border: '1px solid rgba(0,229,160,0.1)',
        }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #00e5a0, #1ab06e)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
        </div>
        <p className="flex-1 text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>
          <strong style={{ color: '#f0f0f4' }}>Get IngredScan</strong> — install the free app
        </p>
        {canInstall ? (
          <button onClick={handleInstall} className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0" style={{ backgroundColor: 'rgba(0,229,160,0.15)', color: '#00e5a0' }}>
            Install
          </button>
        ) : (
          <Link href="/scan" className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0" style={{ backgroundColor: 'rgba(0,229,160,0.15)', color: '#00e5a0' }}>
            Open
          </Link>
        )}
      </div>
    )
  }

  // Default — full-width homepage banner
  return (
    <div
      className="rounded-2xl p-6 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,229,160,0.06) 0%, rgba(124,111,255,0.06) 100%)',
        border: '1px solid rgba(0,229,160,0.12)',
      }}
    >
      <div className="text-4xl mb-3">📱</div>
      <h3 className="text-lg font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
        Get the app
      </h3>
      <p className="text-sm mb-4 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(240,240,244,0.5)' }}>
        Install IngredScan on your phone. Works just like any other app — instant access from your home screen, no app store download needed.
      </p>
      <div className="flex flex-col items-center gap-3">
        {canInstall ? (
          <button
            onClick={handleInstall}
            className="px-8 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00e5a0, #1ab06e)', color: '#0b0b0f', boxShadow: '0 2px 15px rgba(0,229,160,0.3)' }}
          >
            Install IngredScan
          </button>
        ) : (
          <Link
            href="/scan"
            className="px-8 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00e5a0, #1ab06e)', color: '#0b0b0f', boxShadow: '0 2px 15px rgba(0,229,160,0.3)' }}
          >
            Try IngredScan Free
          </Link>
        )}
        <div className="flex items-center gap-4">
          <span className="text-[10px]" style={{ color: 'rgba(240,240,244,0.45)' }}>✓ No download</span>
          <span className="text-[10px]" style={{ color: 'rgba(240,240,244,0.45)' }}>✓ No sign-up required</span>
          <span className="text-[10px]" style={{ color: 'rgba(240,240,244,0.45)' }}>✓ 100% free</span>
        </div>
        {isIOS && !canInstall && (
          <p className="text-xs mt-3 leading-relaxed" style={{ color: 'rgba(240,240,244,0.5)' }}>
            On iPhone: tap <span style={{ color: '#007AFF' }}>Share</span> ↗ then <strong>&quot;Add to Home Screen&quot;</strong>
          </p>
        )}
      </div>
    </div>
  )
}
