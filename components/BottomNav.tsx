'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Five-tab bottom nav with a centered dark scan button.
// Hidden on full-screen flows: onboarding, scan viewfinder, individual product result.
const HIDDEN_PATHS = ['/onboarding', '/scan']

type Tab = {
  label: string
  href: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'History',
    href: '/history',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Swaps',
    href: '/swaps',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/account',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname() || '/'

  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null
  // Result pages have their own sticky bottom CTA bar — hide here to avoid stacking.
  if (pathname.startsWith('/result/')) return null

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'var(--soft)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="max-w-[480px] mx-auto flex items-center">
        {/* Home */}
        <NavTab tab={TABS[0]} active={isActive(TABS[0].href)} />
        {/* History */}
        <NavTab tab={TABS[1]} active={isActive(TABS[1].href)} />

        {/* Center scan button */}
        <Link
          href="/scan"
          className="flex-1 flex flex-col items-center justify-center"
          aria-label="Scan barcode"
        >
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 52,
              height: 52,
              marginTop: -20,
              background: 'var(--dark)',
              border: '3px solid var(--cream)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9V6a1 1 0 011-1h3" />
              <path d="M3 15v3a1 1 0 001 1h3" />
              <path d="M21 9V6a1 1 0 00-1-1h-3" />
              <path d="M21 15v3a1 1 0 01-1 1h-3" />
              <path d="M8 12h8" />
            </svg>
          </div>
        </Link>

        {/* Swaps */}
        <NavTab tab={TABS[2]} active={isActive(TABS[2].href)} />
        {/* Profile */}
        <NavTab tab={TABS[3]} active={isActive(TABS[3].href)} />
      </div>
    </nav>
  )
}

function NavTab({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      className="flex-1 flex flex-col items-center justify-center gap-[3px] py-2.5 transition-colors"
      style={{
        color: active ? 'var(--green)' : 'var(--muted)',
        fontSize: 10,
      }}
    >
      <div style={{ width: 22, height: 22 }}>{tab.icon}</div>
      <span>{tab.label}</span>
    </Link>
  )
}
