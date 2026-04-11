'use client'

import { useEffect, useRef, useState } from 'react'

const INSTALLED_KEY = 'ingredscan_installed'
const DISMISSED_KEY = 'ingredscan_install_popup_dismissed_at'
const POPUP_DELAY_MS = 6000
const REMIND_AFTER_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

type BrowserType = 'chrome' | 'edge' | 'firefox' | 'samsung' | 'opera' | 'safari' | 'other'

function detectBrowser(): { browser: BrowserType; isIOS: boolean; isStandalone: boolean } {
  if (typeof navigator === 'undefined') {
    return { browser: 'other', isIOS: false, isStandalone: false }
  }
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  let browser: BrowserType = 'other'
  if (/SamsungBrowser/.test(ua)) browser = 'samsung'
  else if (/Edg\//.test(ua)) browser = 'edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'opera'
  else if (/Firefox/.test(ua)) browser = 'firefox'
  else if (/Chrome/.test(ua) && !/Edg/.test(ua)) browser = 'chrome'
  else if (/Safari/.test(ua) && isIOS) browser = 'safari'
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  return { browser, isIOS, isStandalone }
}

function getIosInstructions() {
  return 'Tap the Share button, then "Add to Home Screen".'
}

export default function InstallPopup() {
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const { isIOS: ios, isStandalone } = detectBrowser()
    if (isStandalone) return
    if (localStorage.getItem(INSTALLED_KEY) === 'true') return

    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) || 0)
    if (dismissedAt && Date.now() - dismissedAt < REMIND_AFTER_MS) return

    setIsIOS(ios)

    const handlePrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(INSTALLED_KEY, 'true')
      setVisible(false)
    })

    // iOS never fires beforeinstallprompt, so show the instructions popup on a timer
    const iosTimer = ios
      ? window.setTimeout(() => setVisible(true), POPUP_DELAY_MS)
      : null

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      if (iosTimer) window.clearTimeout(iosTimer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
  }

  async function handleInstall() {
    const prompt = deferredPromptRef.current
    if (!prompt) {
      dismiss()
      return
    }
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true')
    } else {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    }
    deferredPromptRef.current = null
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-popup-title"
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{
          background: 'var(--card, #14141a)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted, #9a9aa8)' }}
        >
          ×
        </button>

        <div className="text-4xl mb-3">📱</div>
        <h3
          id="install-popup-title"
          className="heading-display text-lg font-bold mb-2"
          style={{ color: 'var(--text, #f0f0f4)' }}
        >
          Install IngredScan
        </h3>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--muted, rgba(240,240,244,0.6))' }}>
          Add IngredScan to your home screen for instant product scans. No app
          store, no download — works like any native app.
        </p>

        {isIOS ? (
          <div
            className="rounded-xl p-3 mb-4 text-xs leading-relaxed"
            style={{ background: 'rgba(0,229,160,0.08)', color: 'var(--muted, rgba(240,240,244,0.7))' }}
          >
            {getIosInstructions()}
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={dismiss}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted, #9a9aa8)' }}
          >
            Not now
          </button>
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #00e5a0, #1ab06e)',
                color: '#0b0b0f',
                boxShadow: '0 2px 15px rgba(0,229,160,0.3)',
              }}
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
