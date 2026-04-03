import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google'
import PWARegister from '@/components/PWARegister'
import AuthListener from '@/components/AuthListener'
import FeedbackButton from '@/components/FeedbackButton'
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
        {/* Background layers */}
        <div className="bg-mesh" />
        <div className="bg-dots" />
        <div className="bg-noise" />

        <div className="relative z-10">
          <PWARegister />
          <AuthListener />
          {children}
          <FeedbackButton />
          <footer className="py-8 px-4 text-center">
            <div className="gradient-divider max-w-xs mx-auto mb-6" />
            <p className="text-xs tracking-wide" style={{ color: 'rgba(240,240,244,0.2)' }}>
              IngredScan provides informational content only and is not a substitute for professional dietary or medical advice.
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}
