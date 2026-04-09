import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'App Privacy — IngredScan',
  description: 'Apple App Store privacy details for IngredScan.',
  robots: { index: false, follow: false },
}

export default function AppPrivacyPage() {
  return (
    <div className="legacy-page min-h-screen px-5 py-10 max-w-2xl mx-auto relative z-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
        style={{ color: 'rgba(240,240,244,0.4)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Home
      </Link>

      <h1 className="text-3xl sm:text-4xl heading-display mb-3" style={{ color: '#f0f0f4' }}>
        App Privacy
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(240,240,244,0.5)' }}>
        Apple App Store Privacy Details
      </p>

      <div className="space-y-8" style={{ color: 'rgba(240,240,244,0.7)', lineHeight: '1.8' }}>
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#f0f0f4' }}>Data Collected</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 rounded-tl-xl" style={{ backgroundColor: 'rgba(19,19,26,0.8)', color: '#f0f0f4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Data Type</th>
                  <th className="text-left py-3 px-4 rounded-tr-xl" style={{ backgroundColor: 'rgba(19,19,26,0.8)', color: '#f0f0f4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Email address</td>
                  <td className="py-3 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Account creation and authentication</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Usage data</td>
                  <td className="py-3 px-4">App analytics (scan counts, feature usage)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#f0f0f4' }}>Data Usage</h2>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.1)' }}>
            <p className="text-sm">
              All collected data is used for <strong>app functionality only</strong>. We do not use your data for advertising, marketing to third parties, or any purpose beyond providing the IngredScan service.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#f0f0f4' }}>Data Not Linked to Identity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 rounded-tl-xl rounded-tr-xl" style={{ backgroundColor: 'rgba(19,19,26,0.8)', color: '#f0f0f4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Data Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4">Usage data (aggregated, not linked to your identity)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#f0f0f4' }}>Tracking</h2>
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.1)' }}>
            <p className="text-sm font-semibold" style={{ color: '#00e5a0' }}>
              IngredScan does NOT track you.
            </p>
            <p className="text-sm mt-2">
              We do not use any tracking frameworks, advertising identifiers, or cross-app tracking. Your data stays within IngredScan.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
