import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google'
import PWARegister from '@/components/PWARegister'
import AuthListener from '@/components/AuthListener'
import FeedbackButton from '@/components/FeedbackButton'
import CookieConsent from '@/components/CookieConsent'
import { MarketProvider } from '@/components/MarketProvider'
import BottomNav from '@/components/BottomNav'
import Script from 'next/script'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0b0b0f',
}

export const metadata: Metadata = {
  title: 'IngredScan — Know What\'s Really In Your Food',
  description: 'Scan any UK supermarket product. Get an instant honest verdict — dual scoring, transparent data, and supermarket-specific swaps.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IngredScan',
  },
  openGraph: {
    title: 'IngredScan — Know what\'s really in your food',
    description: 'Scan any UK supermarket product. Get an instant honest verdict.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-15E8R2CQPT"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-15E8R2CQPT');
          `}
        </Script>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="alternate" hrefLang="en-gb" href="https://ingredscan.app" />
        <link rel="alternate" hrefLang="en-us" href="https://ingredscan.app" />
        <link rel="alternate" hrefLang="de" href="https://ingredscan.app" />
        <link rel="alternate" hrefLang="fr" href="https://ingredscan.app" />
        <link rel="alternate" hrefLang="nl" href="https://ingredscan.app" />
        <link rel="alternate" hrefLang="it" href="https://ingredscan.app" />
        <link rel="alternate" hrefLang="es" href="https://ingredscan.app" />
        <link rel="alternate" hrefLang="x-default" href="https://ingredscan.app" />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
        {/* Background layers */}
        <div className="bg-mesh" />
        <div className="bg-dots" />
        <div className="bg-noise" />

        <div className="relative z-10">
          <PWARegister />
          <AuthListener />
          <MarketProvider>
            {children}
            <BottomNav />
          </MarketProvider>
          <FeedbackButton />
          <CookieConsent />
          <footer className="py-8 px-4 text-center pb-24">
            <div className="gradient-divider max-w-xs mx-auto mb-6" />
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4">
              {[
                { label: 'Home', href: '/' },
                { label: 'Scan', href: '/scan' },
                { label: 'History', href: '/history' },
                { label: 'Pro', href: '/pro' },
                { label: 'Blog', href: '/blog' },
              ].map((link) => (
                <a key={link.href} href={link.href} className="footer-link text-xs font-medium transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>
            <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mb-4">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'Terms', href: '/terms' },
                { label: 'Disclaimer', href: '/disclaimer' },
              ].map((link) => (
                <a key={link.href} href={link.href} className="footer-link-muted text-[11px] transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>
            <p className="text-xs mb-3" style={{ color: 'rgba(240,240,244,0.25)' }}>
              &copy; 2026 IngredScan &middot; Made in London {'\uD83C\uDDEC\uD83C\uDDE7'}
            </p>
            <p className="text-xs tracking-wide" style={{ color: 'rgba(240,240,244,0.15)' }}>
              IngredScan provides informational content only and is not a substitute for professional dietary or medical advice.
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}
