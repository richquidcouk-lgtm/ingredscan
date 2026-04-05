import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google'
import PWARegister from '@/components/PWARegister'
import AuthListener from '@/components/AuthListener'
import FeedbackButton from '@/components/FeedbackButton'
import CookieConsent from '@/components/CookieConsent'
import { MarketProvider } from '@/components/MarketProvider'
import BottomNav from '@/components/BottomNav'
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
  maximumScale: 5,
  themeColor: '#0b0b0f',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ingredscan.com'),

  title: {
    default: 'IngredScan — Free Food & Cosmetic Barcode Scanner',
    template: '%s | IngredScan',
  },

  description: 'Scan any food or cosmetic barcode and instantly see what\'s really inside. Free scanner with NOVA processing score, ingredient quality score, additive breakdown, and supermarket swap suggestions for UK and US.',

  keywords: [
    'food scanner', 'ingredient scanner', 'barcode scanner food',
    'food scanner UK', 'food scanner app', 'NOVA score',
    'food additives checker', 'healthy food app', 'ingredient checker',
    'food label scanner', 'UK food scanner app', 'processed food checker',
    'food quality score', 'additive checker', 'cosmetic ingredient scanner',
    'ultra processed food', 'food scanner free', 'barcode food app',
  ],

  authors: [{ name: 'IngredScan', url: 'https://www.ingredscan.com' }],
  creator: 'IngredScan',
  publisher: 'IngredScan',
  category: 'Health & Fitness',

  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.ingredscan.com',
    siteName: 'IngredScan',
    title: 'IngredScan — Free Food & Cosmetic Barcode Scanner',
    description: 'Scan any food or cosmetic product for free. Instant dual scoring, additive breakdown, and supermarket swap suggestions.',
    images: [{
      url: '/api/og',
      width: 1200,
      height: 630,
      alt: 'IngredScan — Know What\'s Really In Your Products',
      type: 'image/png',
    }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'IngredScan — Free Food & Cosmetic Barcode Scanner',
    description: 'Scan any food or cosmetic product for free. Instant dual scoring, additive breakdown, and supermarket swap suggestions.',
    images: ['/api/og'],
    creator: '@ingredscan',
    site: '@ingredscan',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://www.ingredscan.com',
    languages: {
      'en-GB': 'https://www.ingredscan.com',
      'en-US': 'https://www.ingredscan.com',
    },
  },

  manifest: '/manifest.json',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IngredScan',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '180x180', type: 'image/png' }],
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="alternate" hrefLang="en-gb" href="https://www.ingredscan.com" />
        <link rel="alternate" hrefLang="en-us" href="https://www.ingredscan.com" />
        <link rel="alternate" hrefLang="de" href="https://www.ingredscan.com" />
        <link rel="alternate" hrefLang="fr" href="https://www.ingredscan.com" />
        <link rel="alternate" hrefLang="nl" href="https://www.ingredscan.com" />
        <link rel="alternate" hrefLang="it" href="https://www.ingredscan.com" />
        <link rel="alternate" hrefLang="es" href="https://www.ingredscan.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.ingredscan.com" />
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
          <footer className="pb-24 py-8 px-4 text-center">
            <div className="gradient-divider max-w-xs mx-auto mb-6" />
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4">
              {[
                { label: 'Home', href: '/' },
                { label: 'Scan', href: '/scan' },
                { label: 'History', href: '/history' },
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
            <p className="text-xs mb-3" style={{ color: 'rgba(240,240,244,0.5)' }}>
              &copy; 2026 IngredScan &middot; Made in London
            </p>
            <p className="text-xs tracking-wide max-w-sm mx-auto leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>
              IngredScan provides informational content only and is not a substitute for professional dietary or medical advice.
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}
