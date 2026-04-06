import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Scoring Methodology',
  description: 'How IngredScan calculates quality scores, processing levels, and additive risk ratings. Full methodology with data sources.',
  alternates: { canonical: 'https://www.ingredscan.com/methodology' },
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen px-5 py-10 max-w-2xl mx-auto relative z-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'rgba(240,240,244,0.5)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Home
      </Link>

      <h1 className="text-3xl sm:text-4xl heading-display mb-3" style={{ color: '#f0f0f4' }}>
        Scoring Methodology
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(240,240,244,0.5)' }}>
        How IngredScan calculates scores — fully transparent and consistently applied.
      </p>

      <div className="space-y-8" style={{ color: 'rgba(240,240,244,0.7)', lineHeight: '1.8' }}>
        {/* Important notice */}
        <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#3b82f6' }}>Important Notice</p>
          <p className="text-sm leading-relaxed">
            IngredScan is an informational tool only. We do not make health claims about specific foods, brands, or products. All additive risk information is sourced from official regulatory bodies including the <a href="https://www.food.gov.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>UK Food Standards Agency (FSA)</a>, <a href="https://www.efsa.europa.eu" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>European Food Safety Authority (EFSA)</a>, and <a href="https://www.fda.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>US Food and Drug Administration (FDA)</a>. Risk classifications reflect our interpretation of publicly available regulatory and scientific information. They are not medical advice.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Quality Score (0–10)</h2>
          <p className="text-sm mb-3">The quality score is calculated algorithmically from ingredient composition and nutritional data:</p>
          <div className="rounded-xl p-4 font-mono text-sm space-y-2" style={{ backgroundColor: 'rgba(19,19,26,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p><span style={{ color: '#7c6fff' }}>Starting score:</span> 10.0</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.5</span> per NOVA 4 additive detected (max penalty: -4.0)</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.0</span> if Nutri-Score is D or E</p>
            <p><span style={{ color: '#ff5a5a' }}>-0.5</span> if Nutri-Score is C</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.0</span> if saturated fat &gt; 5g per 100g</p>
            <p><span style={{ color: '#ff5a5a' }}>-0.5</span> if sugar &gt; 10g per 100g</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.0</span> if salt &gt; 0.6g per 100g (UK FSA threshold)</p>
            <p><span style={{ color: '#22c77e' }}>+0.5</span> if product is certified organic</p>
          </div>
          <p className="text-sm mt-3">NOVA ceiling: NOVA 4 products max 6.5, NOVA 3 max 8.0. Score is clamped between 0.0 and 10.0.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Processing Level (NOVA)</h2>
          <p className="text-sm mb-3">
            The processing level uses the NOVA classification system developed by Professor Carlos Monteiro at the University of São Paulo (<a href="https://doi.org/10.1017/S1368980016000677" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>original paper</a>). When available, the NOVA classification is taken directly from the <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>Open Food Facts</a> database. When not available, it is estimated from the ingredient list and clearly labelled as &quot;Estimated&quot;.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Additive Risk Levels</h2>
          <p className="text-sm mb-3">Risk levels are assigned based on the regulatory position of the <a href="https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>UK FSA</a> and available scientific literature:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Low</strong> — Approved by UK FSA with no significant concerns in published literature</li>
            <li><strong>Medium</strong> — Approved but with some published research raising questions, or subject to use restrictions</li>
            <li><strong>High</strong> — Approved but with mandatory warning labels, ongoing regulatory review, or banned in other markets</li>
          </ul>
          <p className="text-sm mt-3">All risk classifications link to their primary source. See individual additive pages for specific references.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Data Sources</h2>
          <ul className="list-disc list-inside text-sm space-y-2 ml-2">
            <li><strong>Product data:</strong> <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>Open Food Facts</a> (Open Database Licence)</li>
            <li><strong>UK regulatory data:</strong> <a href="https://www.food.gov.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>UK Food Standards Agency</a> (Open Government Licence)</li>
            <li><strong>EU regulatory data:</strong> <a href="https://www.efsa.europa.eu" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>European Food Safety Authority</a></li>
            <li><strong>US regulatory data:</strong> <a href="https://www.fda.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>US Food and Drug Administration</a> (public domain)</li>
            <li><strong>Cosmetics data:</strong> <a href="https://world.openbeautyfacts.org" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>Open Beauty Facts</a> and <a href="https://www.ewg.org/skindeep/" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>EWG Skin Deep</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Brand Neutrality</h2>
          <p className="text-sm">
            IngredScan scores products based on their ingredient composition and nutritional content using publicly available data. We do not target, endorse, or disparage any specific brand or manufacturer. Score calculations apply consistently to all products using the same methodology. No brand or manufacturer can influence scores or descriptions on IngredScan.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Challenging a Score</h2>
          <p className="text-sm mb-3">
            If you are a brand or manufacturer and believe a product has been incorrectly scored, you may submit a challenge by emailing <a href="mailto:hello@ingredscan.com" style={{ color: '#7c6fff' }}>hello@ingredscan.com</a> with:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li>The product name and barcode</li>
            <li>The specific score or information you believe is incorrect</li>
            <li>Evidence supporting your challenge (e.g. correct ingredient list)</li>
          </ul>
          <p className="text-sm mt-3">
            We review all challenges within 14 business days. If an error is confirmed we will correct it promptly. We welcome corrections to factual errors but do not change scores based on commercial considerations.
          </p>
        </section>
      </div>
    </div>
  )
}
