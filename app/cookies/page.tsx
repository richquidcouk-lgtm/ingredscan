import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy — IngredScan',
  description: 'Learn about the cookies IngredScan uses. Essential cookies only — no ad tracking.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen px-5 py-10 max-w-2xl mx-auto relative z-10">
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
        Cookie Policy
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(240,240,244,0.35)' }}>
        Last updated: 1 April 2026
      </p>

      <div className="space-y-8" style={{ color: 'rgba(240,240,244,0.7)', lineHeight: '1.8' }}>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>What Are Cookies</h2>
          <p className="text-sm">
            Cookies are small text files stored on your device by your web browser. They help websites remember information about your visit, such as your preferences and login status. Cookies can be &quot;session&quot; cookies (deleted when you close the browser) or &quot;persistent&quot; cookies (stored until they expire or you delete them).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 rounded-tl-xl" style={{ backgroundColor: 'rgba(19,19,26,0.8)', color: '#f0f0f4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Cookie Name</th>
                  <th className="text-left py-3 px-4" style={{ backgroundColor: 'rgba(19,19,26,0.8)', color: '#f0f0f4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Duration</th>
                  <th className="text-left py-3 px-4 rounded-tr-xl" style={{ backgroundColor: 'rgba(19,19,26,0.8)', color: '#f0f0f4', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: '#00e5a0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>sb-auth-token</td>
                  <td className="py-3 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Session</td>
                  <td className="py-3 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(0,229,160,0.15)', color: '#00e5a0' }}>Essential</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: '#00e5a0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ingredscan_market</td>
                  <td className="py-3 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>1 year</td>
                  <td className="py-3 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(124,111,255,0.15)', color: '#7c6fff' }}>Preference</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: '#00e5a0' }}>ingredscan_scans</td>
                  <td className="py-3 px-4">Session</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(245,166,35,0.15)', color: '#f5a623' }}>Functional</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>What We Don&apos;t Use</h2>
          <p className="text-sm mb-3">IngredScan does <strong>not</strong> use any of the following:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li>Google Analytics or any analytics tracking cookies</li>
            <li>Facebook Pixel or social media tracking</li>
            <li>Advertising or retargeting cookies</li>
            <li>Any third-party tracking cookies</li>
          </ul>
          <p className="text-sm mt-3">
            We believe in privacy-first design. We only use cookies that are necessary for the app to function properly or to remember your preferences.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Managing Cookies</h2>
          <p className="text-sm mb-3">You can manage or delete cookies through your browser settings:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
            <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
            <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
            <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>
          </ul>
          <p className="text-sm mt-3">
            Note: disabling essential cookies may prevent you from signing in or using certain features of IngredScan.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Contact</h2>
          <p className="text-sm">
            If you have questions about our use of cookies, contact us at{' '}
            <a href="mailto:richquidcouk@gmail.com" style={{ color: '#00e5a0' }}>richquidcouk@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
