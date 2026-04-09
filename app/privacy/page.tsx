import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — IngredScan',
  description: 'How IngredScan collects, uses, and protects your personal data. GDPR compliant.',
}

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(240,240,244,0.5)' }}>
        Last updated: 1 April 2026
      </p>

      <div className="space-y-8" style={{ color: 'rgba(240,240,244,0.7)', lineHeight: '1.8' }}>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>1. Who We Are</h2>
          <p className="text-sm">
            IngredScan is operated from London, United Kingdom. If you have any questions about this privacy policy or how we handle your data, you can contact us at{' '}
            <a href="mailto:support@ingredscan.com" style={{ color: '#00e5a0' }}>support@ingredscan.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>2. What Data We Collect</h2>
          <p className="text-sm mb-3">We collect the following data when you use IngredScan:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Email address</strong> — when you create an account</li>
            <li><strong>Scan history</strong> — products you have scanned</li>
            <li><strong>Market preference</strong> — your selected country/region</li>
            <li><strong>Device information</strong> — browser type, operating system</li>
            <li><strong>Usage data</strong> — feature usage patterns, scan counts</li>
          </ul>
          <p className="text-sm mt-3">We do <strong>not</strong> collect:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li>Payment card details (handled entirely by Stripe)</li>
            <li>Precise location data</li>
            <li>Contacts or address books</li>
            <li>Photos or camera data (camera is used locally for scanning only)</li>
            <li>Data from children under 13</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>3. How We Use Your Data</h2>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li>To process and display your product scans</li>
            <li>To manage your account and subscription</li>
            <li>To improve our product database and scoring accuracy</li>
            <li>To send important service updates (not marketing, unless you opt in)</li>
          </ul>
          <p className="text-sm mt-3">
            We <strong>never</strong> sell your data or share it with advertisers. Your scan data is never used for targeted advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>4. Legal Basis (GDPR)</h2>
          <p className="text-sm mb-3">We process your data under the following legal bases:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Contract</strong> — to provide the IngredScan service you signed up for</li>
            <li><strong>Legitimate interest</strong> — to improve our product and fix bugs</li>
            <li><strong>Consent</strong> — for optional communications like newsletters</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>5. Data Storage &amp; Security</h2>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Supabase</strong> — our primary database, hosted in the EU</li>
            <li><strong>Stripe</strong> — handles all payment processing and is PCI DSS compliant. We never see or store your card details.</li>
          </ul>
          <p className="text-sm mt-3">
            All data is transmitted over HTTPS. We use industry-standard security practices to protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>6. Your Rights</h2>
          <p className="text-sm mb-3">Under GDPR and UK data protection law, you have the right to:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Access</strong> your personal data</li>
            <li><strong>Correct</strong> inaccurate data</li>
            <li><strong>Delete</strong> your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Export</strong> your data in a portable format</li>
            <li><strong>Object</strong> to processing based on legitimate interest</li>
            <li><strong>Withdraw consent</strong> at any time</li>
          </ul>
          <p className="text-sm mt-3">
            To exercise any of these rights, email us at{' '}
            <a href="mailto:support@ingredscan.com" style={{ color: '#00e5a0' }}>support@ingredscan.com</a>{' '}
            or use Settings &gt; Delete Account within the app to delete your account and all associated data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>7. Cookies</h2>
          <p className="text-sm mb-3">We use a minimal number of cookies, none of which are used for advertising:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>sb-auth-token</strong> — essential session cookie for authentication</li>
            <li><strong>ingredscan_market</strong> — stores your preferred market/region</li>
            <li><strong>ingredscan_scans</strong> — functional cookie for scan count tracking</li>
          </ul>
          <p className="text-sm mt-3">
            We do <strong>not</strong> use advertising cookies, Google Analytics, Facebook Pixel, or any third-party tracking cookies. See our{' '}
            <Link href="/cookies" style={{ color: '#00e5a0' }}>Cookie Policy</Link> for full details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>8. Third-Party Services</h2>
          <p className="text-sm mb-3">We use the following third-party services:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Supabase</strong> — database and authentication (EU hosted)</li>
            <li><strong>Stripe</strong> — payment processing (PCI DSS compliant)</li>
            <li><strong>Vercel</strong> — application hosting and deployment</li>
            <li><strong>Open Food Facts</strong> — open-source product data</li>
            <li><strong>ipapi.co</strong> — IP-based country detection for market defaults</li>
          </ul>
          <p className="text-sm mt-3">
            Each of these services has their own privacy policy. We only share the minimum data necessary for each service to function.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>9. Children&apos;s Privacy</h2>
          <p className="text-sm">
            IngredScan is not intended for children under 13 years of age. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal data, please contact us at{' '}
            <a href="mailto:support@ingredscan.com" style={{ color: '#00e5a0' }}>support@ingredscan.com</a>{' '}
            and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>10. Changes to This Policy</h2>
          <p className="text-sm">
            We may update this privacy policy from time to time. If we make significant changes, we will notify you via email or through the app. Continued use of IngredScan after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>11. Contact</h2>
          <p className="text-sm">
            For any privacy-related questions or requests, contact us at{' '}
            <a href="mailto:support@ingredscan.com" style={{ color: '#00e5a0' }}>support@ingredscan.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
