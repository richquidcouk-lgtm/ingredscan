'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Sticky top navigation with serif logo + bell + profile icon.
// Hidden on full-screen flows that draw their own header (onboarding, scan).
const HIDDEN_PATHS = ['/onboarding', '/scan']

export default function TopNav() {
  const pathname = usePathname() || '/'
  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null
  if (pathname.startsWith('/result/')) return null

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(245, 241, 234, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-[480px] mx-auto flex items-center justify-between px-5 py-3.5">
        <Link href="/" className="heading-display" style={{ fontSize: 20, color: 'var(--dark)', letterSpacing: '-0.025em' }}>
          Ingred<span style={{ color: 'var(--green)' }}>Scan</span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Bell links to history — closest thing to "notifications" today.
              When a real notifications inbox lands, swap the href. */}
          <Link href="/history" className="icon-btn" aria-label="Notifications & history">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </Link>
          <Link href="/account" className="icon-btn" aria-label="Profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}
