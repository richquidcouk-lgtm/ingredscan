'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ONBOARDING_KEY = 'ingredscan_onboarded'

// First-visit landing screen. Sets a localStorage flag so subsequent visits
// skip straight to /. Anyone can re-visit /onboarding directly to see it.
export default function OnboardingPage() {
  const router = useRouter()
  const [, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  function complete() {
    try {
      localStorage.setItem(ONBOARDING_KEY, '1')
    } catch {
      // ignore
    }
    router.push('/')
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'var(--dark)', color: '#fff' }}
    >
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pt-16 pb-10 relative overflow-hidden">
        {/* Decorative orbs */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(61, 140, 94, 0.12)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(200, 118, 58, 0.1)',
          }}
        />

        <div
          className="flex items-center justify-center mx-auto mb-8"
          style={{
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 36,
          }}
        >
          🔍
        </div>

        <h1
          className="heading-display"
          style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 16 }}
        >
          Know what&apos;s <em style={{ color: '#a8d5b5' }}>really</em>
          <br />
          in your products
        </h1>

        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            maxWidth: 280,
          }}
        >
          Scan any food or cosmetic product and get an honest quality score — backed by EFSA, FSA &amp; WHO data.
        </p>

        <div className="flex gap-2 flex-wrap justify-center mt-7">
          {['No ads', 'Free to use', 'Science-backed', 'Open data'].map((t) => (
            <span
              key={t}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5 px-6 pb-10 pt-7" style={{ paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={complete}
          type="button"
          className="btn-primary"
          style={{ background: '#fff', color: 'var(--dark)' }}
        >
          Get started — it&apos;s free
        </button>
        <button
          onClick={complete}
          type="button"
          className="btn-outline"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
        >
          Sign in
        </button>
        <p
          className="text-center mt-2"
          style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}
        >
          By continuing you agree to our Terms &amp; Privacy Policy.<br />
          We never sell your data.
        </p>
      </div>
    </div>
  )
}
