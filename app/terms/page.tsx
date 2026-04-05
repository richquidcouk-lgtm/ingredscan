import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — IngredScan',
  description: 'Terms and conditions for using IngredScan. Read before using our food scanning service.',
}

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(240,240,244,0.5)' }}>
        Last updated: 1 April 2026
      </p>

      <div className="space-y-8" style={{ color: 'rgba(240,240,244,0.7)', lineHeight: '1.8' }}>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>1. Acceptance of Terms</h2>
          <p className="text-sm">
            By accessing or using IngredScan, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service. These terms constitute a legally binding agreement between you and IngredScan.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>2. What IngredScan Is</h2>
          <p className="text-sm">
            IngredScan is a food product scanning and information service. It provides <strong>informational content only</strong> and is <strong>not</strong> a substitute for professional medical or dietary advice. Product data is primarily sourced from Open Food Facts, an open-source collaborative database, supplemented by other public sources. Data may be incomplete, outdated, or inaccurate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>3. User Accounts</h2>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li>You must be at least 13 years old to create an account</li>
            <li>One account per person</li>
            <li>You are responsible for keeping your login credentials secure</li>
            <li>You must not share your account or use another person&apos;s account</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>4. Pricing</h2>
          <p className="text-sm">IngredScan is free to use with no subscription or paywall. All features — unlimited scans, additive analysis, supermarket swaps, scan history, and shareable cards — are available to all users at no cost. Optional one-time support payments may be made via Stripe. These are voluntary contributions and do not unlock additional features.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>5. Intellectual Property</h2>
          <p className="text-sm">
            The IngredScan brand, logo, design, and original content are owned by IngredScan. Product data sourced from Open Food Facts is available under the Open Database License (ODbL). You may not copy, modify, or redistribute our proprietary content without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>6. Disclaimer</h2>
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,90,90,0.08)', border: '1px solid rgba(255,90,90,0.15)' }}>
            <p className="font-semibold mb-2" style={{ color: '#ff5a5a' }}>IMPORTANT</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>IngredScan provides <strong>informational content only</strong></li>
              <li>Scores are <strong>algorithmically generated</strong> from third-party data sources</li>
              <li>Product data may be <strong>inaccurate, incomplete, or outdated</strong></li>
              <li>Do <strong>not</strong> rely on IngredScan for medical decisions, allergy management, or dietary requirements</li>
              <li><strong>Always read product labels</strong> before consuming</li>
              <li>Consult qualified healthcare professionals for medical or dietary advice</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>7. Limitation of Liability</h2>
          <p className="text-sm">
            To the fullest extent permitted by law, IngredScan shall not be liable for:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2 mt-2">
            <li>Inaccurate or incomplete product data</li>
            <li>Health outcomes resulting from reliance on our information</li>
            <li>Data loss or service interruptions</li>
            <li>Any indirect, incidental, or consequential damages</li>
          </ul>
          <p className="text-sm mt-3">
            Our maximum aggregate liability to you for any claims arising from your use of IngredScan shall not exceed the total amount you have paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>8. Governing Law</h2>
          <p className="text-sm">
            These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of London, England.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>9. Changes to These Terms</h2>
          <p className="text-sm">
            We may update these terms from time to time. Material changes will be communicated via email or through the app. Your continued use of IngredScan after changes are published constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>10. Contact</h2>
          <p className="text-sm">
            For questions about these terms, contact us at{' '}
            <a href="mailto:richquidcouk@gmail.com" style={{ color: '#00e5a0' }}>richquidcouk@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
