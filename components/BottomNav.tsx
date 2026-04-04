'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    label: 'History',
    href: '/history',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f0f0f4' : 'rgba(240,240,244,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
  {
    label: 'Search',
    href: '/search',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f0f0f4' : 'rgba(240,240,244,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    label: 'Scan',
    href: '/scan',
    isScan: true,
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
    label: 'Favourites',
    href: '/favourites',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#f0f0f4' : 'none'} stroke={active ? '#f0f0f4' : 'rgba(240,240,244,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: 'Me',
    href: '/account',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f0f0f4' : 'rgba(240,240,244,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on result pages (they have their own bottom bar)
  if (pathname.startsWith('/result/')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-end justify-around px-2 pt-1 pb-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))

          if (tab.isScan) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center -mt-5"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{
                    background: 'linear-gradient(135deg, #00e5a0, #1ab06e)',
                    boxShadow: '0 4px 20px rgba(0,229,160,0.35), 0 0 0 3px rgba(0,229,160,0.1)',
                  }}
                >
                  {tab.icon(true)}
                </div>
                <span
                  className="text-[10px] font-medium mt-1"
                  style={{ color: isActive ? '#00e5a0' : 'rgba(240,240,244,0.35)' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center py-2 px-3 relative"
            >
              {tab.icon(isActive)}
              <span
                className="text-[10px] font-medium mt-0.5"
                style={{ color: isActive ? '#f0f0f4' : 'rgba(240,240,244,0.35)' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: '#00e5a0' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
