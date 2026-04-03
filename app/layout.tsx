import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import PWARegister from '@/components/PWARegister'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-satoshi',
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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
        <PWARegister />
        {children}
        <footer className="py-6 px-4 text-center">
          <p className="text-xs" style={{ color: 'rgba(240,240,244,0.25)' }}>
            IngredScan provides informational content only and is not a substitute for professional dietary or medical advice.
          </p>
        </footer>
      </body>
    </html>
  )
}
