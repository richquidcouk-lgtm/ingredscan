'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const ONBOARDED_KEY = 'ingredscan_onboarded'

function OnboardingSVG1() {
  return (
    <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px] mx-auto">
      {/* Supermarket shelf */}
      <rect x="40" y="80" width="220" height="8" rx="3" fill="#1c1c26" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="40" y="140" width="220" height="8" rx="3" fill="#1c1c26" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Products on shelf */}
      <rect x="60" y="50" width="28" height="30" rx="4" fill="#00e5a0" opacity="0.2" stroke="#00e5a0" strokeWidth="1" />
      <rect x="95" y="45" width="24" height="35" rx="4" fill="#7c6fff" opacity="0.2" stroke="#7c6fff" strokeWidth="1" />
      <rect x="126" y="48" width="30" height="32" rx="4" fill="#f5a623" opacity="0.2" stroke="#f5a623" strokeWidth="1" />
      <rect x="165" y="50" width="26" height="30" rx="4" fill="#00e5a0" opacity="0.15" stroke="#00e5a0" strokeWidth="0.5" />
      <rect x="200" y="46" width="28" height="34" rx="4" fill="#ff5a5a" opacity="0.15" stroke="#ff5a5a" strokeWidth="0.5" />
      {/* Products on lower shelf */}
      <rect x="55" y="105" width="32" height="35" rx="4" fill="#7c6fff" opacity="0.15" stroke="#7c6fff" strokeWidth="0.5" />
      <rect x="95" y="108" width="26" height="32" rx="4" fill="#00e5a0" opacity="0.25" stroke="#00e5a0" strokeWidth="1" />
      <rect x="130" y="106" width="30" height="34" rx="4" fill="#f5a623" opacity="0.15" stroke="#f5a623" strokeWidth="0.5" />
      <rect x="168" y="108" width="28" height="32" rx="4" fill="#ff5a5a" opacity="0.2" stroke="#ff5a5a" strokeWidth="1" />
      <rect x="204" y="106" width="24" height="34" rx="4" fill="#7c6fff" opacity="0.15" stroke="#7c6fff" strokeWidth="0.5" />
      {/* Person - simplified woman with phone */}
      {/* Body */}
      <ellipse cx="150" cy="230" rx="22" ry="6" fill="#00e5a0" opacity="0.1" />
      <rect x="140" y="180" width="20" height="48" rx="8" fill="#1c1c26" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Head */}
      <circle cx="150" cy="170" r="14" fill="#1c1c26" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Hair */}
      <path d="M136 168c0-8 6-16 14-16s14 8 14 16" stroke="#00e5a0" strokeWidth="2" fill="none" opacity="0.6" />
      {/* Arm + Phone */}
      <line x1="160" y1="195" x2="185" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
      {/* Phone */}
      <rect x="180" y="168" width="16" height="26" rx="3" fill="#13131a" stroke="#00e5a0" strokeWidth="1.5" />
      {/* Scan lines from phone */}
      <line x1="188" y1="172" x2="126" y2="120" stroke="#00e5a0" strokeWidth="0.8" opacity="0.6" strokeDasharray="3 3">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="188" y1="172" x2="130" y2="115" stroke="#00e5a0" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 3">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </line>
      {/* Glow on scanned product */}
      <rect x="120" y="102" width="40" height="40" rx="6" fill="#00e5a0" opacity="0.08">
        <animate attributeName="opacity" values="0.04;0.12;0.04" dur="2s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

function OnboardingSVG2() {
  return (
    <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px] mx-auto">
      {/* Quality Score Card */}
      <rect x="30" y="60" width="110" height="140" rx="16" fill="#13131a" stroke="rgba(0,229,160,0.3)" strokeWidth="1.5" />
      <text x="50" y="92" fill="rgba(240,240,244,0.4)" fontSize="9" fontWeight="500" letterSpacing="1">QUALITY</text>
      <text x="50" y="130" fill="#00e5a0" fontSize="36" fontWeight="800" fontFamily="var(--font-display)">8.2</text>
      <text x="96" y="130" fill="rgba(240,240,244,0.3)" fontSize="14">/10</text>
      <rect x="50" y="148" width="50" height="20" rx="10" fill="#00e5a020" stroke="#00e5a0" strokeWidth="0.5" />
      <text x="62" y="162" fill="#00e5a0" fontSize="9" fontWeight="500">Good</text>
      {/* Glow effect */}
      <ellipse cx="85" cy="130" rx="40" ry="30" fill="#00e5a0" opacity="0.05">
        <animate attributeName="opacity" values="0.03;0.08;0.03" dur="3s" repeatCount="indefinite" />
      </ellipse>

      {/* NOVA Score Card */}
      <rect x="160" y="60" width="110" height="140" rx="16" fill="#13131a" stroke="rgba(245,166,35,0.3)" strokeWidth="1.5" />
      <text x="180" y="92" fill="rgba(240,240,244,0.4)" fontSize="9" fontWeight="500" letterSpacing="1">NOVA</text>
      <text x="180" y="135" fontSize="28">🌾</text>
      <text x="210" y="130" fill="#f5a623" fontSize="22" fontWeight="800" fontFamily="var(--font-display)">2</text>
      <rect x="180" y="148" width="70" height="20" rx="10" fill="#f5a62320" stroke="#f5a623" strokeWidth="0.5" />
      <text x="186" y="162" fill="#f5a623" fontSize="8" fontWeight="500">Processed Ing.</text>
      {/* Glow effect */}
      <ellipse cx="215" cy="130" rx="40" ry="30" fill="#f5a623" opacity="0.05">
        <animate attributeName="opacity" values="0.03;0.08;0.03" dur="3s" repeatCount="indefinite" begin="1s" />
      </ellipse>

      {/* Connection line */}
      <line x1="145" y1="130" x2="155" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2 2" />

      {/* "Full Picture" label */}
      <rect x="90" y="220" width="120" height="24" rx="12" fill="#7c6fff15" stroke="#7c6fff" strokeWidth="0.5" />
      <text x="112" y="236" fill="#7c6fff" fontSize="9" fontWeight="500">Full Picture</text>
    </svg>
  )
}

function OnboardingSVG3() {
  return (
    <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px] mx-auto">
      {/* Shelf */}
      <rect x="30" y="100" width="240" height="6" rx="3" fill="#1c1c26" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Bad product */}
      <rect x="60" y="55" width="40" height="45" rx="6" fill="#13131a" stroke="rgba(255,90,90,0.4)" strokeWidth="1.5" />
      <text x="72" y="83" fill="#ff5a5a" fontSize="9" fontWeight="600">3.2</text>
      <circle cx="80" cy="68" r="6" fill="#ff5a5a15" stroke="#ff5a5a" strokeWidth="0.5" />
      <text x="76" y="72" fill="#ff5a5a" fontSize="8">!</text>
      {/* Arrow */}
      <path d="M120 77 L165 77" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowhead)">
        <animate attributeName="d" values="M120 77 L155 77;M120 77 L170 77;M120 77 L155 77" dur="1.5s" repeatCount="indefinite" />
      </path>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill="#00e5a0" />
        </marker>
      </defs>
      {/* Good product */}
      <rect x="180" y="55" width="40" height="45" rx="6" fill="#13131a" stroke="rgba(0,229,160,0.4)" strokeWidth="1.5" />
      <text x="192" y="83" fill="#00e5a0" fontSize="9" fontWeight="600">8.7</text>
      <circle cx="200" cy="68" r="6" fill="#00e5a015" stroke="#00e5a0" strokeWidth="0.5" />
      <text x="196" y="71" fill="#00e5a0" fontSize="7">&#10003;</text>
      {/* Glow on good product */}
      <rect x="175" y="50" width="50" height="55" rx="8" fill="#00e5a0" opacity="0.06">
        <animate attributeName="opacity" values="0.03;0.1;0.03" dur="2s" repeatCount="indefinite" />
      </rect>

      {/* Supermarket logos/badges */}
      <g transform="translate(50, 140)">
        {[
          { name: 'Tesco', x: 0 },
          { name: "Sainsbury's", x: 55 },
          { name: 'Asda', x: 130 },
          { name: 'Waitrose', x: 180 },
        ].map((store, i) => (
          <g key={store.name}>
            <rect x={store.x} y="0" width={i === 1 ? 65 : 45} height="22" rx="6" fill="#1c1c26" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <text x={store.x + (i === 1 ? 10 : 6)} y="15" fill="rgba(240,240,244,0.4)" fontSize="7" fontWeight="500">{store.name}</text>
          </g>
        ))}
      </g>

      {/* "Better Swap" badge */}
      <rect x="85" y="195" width="130" height="30" rx="15" fill="#00e5a015" stroke="#00e5a0" strokeWidth="0.8" />
      <text x="108" y="214" fill="#00e5a0" fontSize="10" fontWeight="600">Better Swap Found</text>
    </svg>
  )
}

const screens = [
  {
    illustration: OnboardingSVG1,
    headline: "Know what's really in your food",
    subtext: "Scan any barcode and get an instant honest verdict on what you're eating",
  },
  {
    illustration: OnboardingSVG2,
    headline: 'Two scores. Full picture.',
    subtext: "See both how processed your food is AND how good the ingredients are. No other app shows you both.",
  },
  {
    illustration: OnboardingSVG3,
    headline: 'Better swaps at your supermarket',
    subtext: "We tell you exactly which better product to grab from Tesco, Sainsbury's, Asda or Waitrose \u2014 right now, in the aisle you're standing in",
  },
]

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDED_KEY)
    setNeedsOnboarding(!onboarded)
    setChecked(true)
  }, [])

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, 'true')
    setNeedsOnboarding(false)
  }, [])

  return { needsOnboarding, checked, completeOnboarding }
}

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const isLast = current === screens.length - 1

  function next() {
    if (isLast) {
      onComplete()
    } else {
      setCurrent(c => c + 1)
    }
  }

  function skip() {
    onComplete()
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].screenX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].screenX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < screens.length - 1) {
        setCurrent(c => c + 1)
      } else if (diff < 0 && current > 0) {
        setCurrent(c => c - 1)
      }
    }
  }

  const screen = screens[current]
  const Illustration = screen.illustration

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: '#0b0b0f' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background effects */}
      <div className="bg-mesh" />
      <div className="bg-dots" />

      {/* Skip button */}
      {!isLast && (
        <button
          onClick={skip}
          className="absolute top-6 right-6 z-10 px-4 py-2 text-sm font-medium rounded-lg"
          style={{ color: 'rgba(240,240,244,0.4)' }}
        >
          Skip
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <div
          className="mb-10 w-full animate-fadeUp"
          key={current}
        >
          <Illustration />
        </div>

        <h2
          className="text-2xl sm:text-3xl text-center heading-display mb-4 animate-fadeUp"
          style={{
            color: '#f0f0f4',
            letterSpacing: '-0.03em',
            animationDelay: '50ms',
          }}
        >
          {screen.headline}
        </h2>
        <p
          className="text-sm text-center max-w-xs leading-relaxed animate-fadeUp"
          style={{ color: 'rgba(240,240,244,0.45)', animationDelay: '100ms' }}
        >
          {screen.subtext}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-8 pb-10 pt-4">
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                backgroundColor: i === current ? '#00e5a0' : 'rgba(240,240,244,0.15)',
              }}
              aria-label={`Go to screen ${i + 1}`}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        {isLast ? (
          <button
            onClick={next}
            className="w-full py-4 rounded-2xl text-base font-semibold btn-glow transition-all"
            style={{ color: '#0b0b0f' }}
          >
            Get Started
          </button>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={next}
              className="px-8 py-3 rounded-xl text-sm font-semibold btn-glow transition-all"
              style={{ color: '#0b0b0f' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AuthBottomSheet({ onClose, onSignUp }: { onClose: () => void; onSignUp: () => void }) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 pb-10 animate-slideUp glass"
        style={{
          background: 'rgba(19,19,26,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <p className="text-base font-semibold text-center mb-1" style={{ color: '#f0f0f4' }}>
          Create a free account to save your scans
        </p>
        <p className="text-xs text-center mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Track your history and save favourites
        </p>
        <div className="flex gap-3">
          <button
            onClick={onSignUp}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold btn-glow"
            style={{ color: '#0b0b0f' }}
          >
            Sign up
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl text-sm font-medium glass-input"
            style={{ color: 'rgba(240,240,244,0.6)' }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
