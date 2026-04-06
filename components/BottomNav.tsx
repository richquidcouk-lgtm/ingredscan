'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    label: 'History',
    href: '/history',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00e5a0' : 'rgba(240,240,244,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
  {
    label: 'Search',
    href: '/scan',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00e5a0' : 'rgba(240,240,244,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    label: 'Scan',
    href: '/scan',
    isCenter: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    icon: (_active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Account',
    href: '/account',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00e5a0' : 'rgba(240,240,244,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on scan page when scanner is active (full screen)
  if (pathname === '/scan') return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="flex items-end justify-around px-2"
        style={{
          height: 64,
          background: 'rgba(11,11,15,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.isCenter
            ? false
            : pathname === tab.href || (tab.href === '/history' && pathname === '/history')

          if (tab.isCenter) {
            return (
              <Link
                key="scan-center"
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #00e5a0, #1ab06e)',
                    boxShadow: '0 4px 20px rgba(0,229,160,0.35)',
                  }}
                >
                  {tab.icon(true)}
                </div>
                <span
                  className="text-[11px] font-medium mt-1"
                  style={{ color: '#00e5a0' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href + tab.label}
              href={tab.href}
              className="flex flex-col items-center justify-center py-2 px-3 min-w-[56px]"
            >
              {tab.icon(isActive)}
              <span
                className="text-[11px] font-medium mt-1"
                style={{ color: isActive ? '#00e5a0' : 'rgba(240,240,244,0.4)' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
