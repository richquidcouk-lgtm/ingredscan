import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data & Scoring Disclaimer — IngredScan',
  description: 'How IngredScan calculates NOVA scores, quality scores, and additive risk ratings. Full methodology explained.',
}

export default function DisclaimerPage() {
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
        Data &amp; Scoring Disclaimer
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(240,240,244,0.35)' }}>
        Last updated: 1 April 2026
      </p>

      <div className="space-y-8" style={{ color: 'rgba(240,240,244,0.7)', lineHeight: '1.8' }}>
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Data Sources</h2>
          <p className="text-sm mb-3">IngredScan aggregates product data from multiple sources:</p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>Open Food Facts</strong> — a free, open, collaborative database of food products</li>
            <li><strong>UK Food Standards Agency (FSA)</strong> — food safety and additive regulations</li>
            <li><strong>USDA FoodData Central</strong> — nutritional reference data</li>
            <li><strong>Supermarket product pages</strong> — supplementary product information</li>
          </ul>
          <div className="rounded-xl p-4 mt-4 text-sm" style={{ backgroundColor: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
            <p style={{ color: '#f5a623' }}>
              <strong>Important:</strong> Data from these sources may be incomplete, outdated, or incorrect. Product formulations change frequently. Always verify information by reading the actual product label.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>How the NOVA Score Is Calculated</h2>
          <p className="text-sm mb-3">
            The NOVA classification system was developed by researchers at the University of Sao Paulo, Brazil. It groups foods into four categories based on their level of processing:
          </p>
          <div className="space-y-3">
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.1)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#00e5a0' }}>NOVA 1 — Unprocessed or Minimally Processed</p>
              <p className="text-sm">Fresh or minimally altered foods. Examples: fresh fruit, vegetables, eggs, plain rice, fresh meat, milk, plain nuts.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.08)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#7c6fff' }}>NOVA 2 — Processed Culinary Ingredients</p>
              <p className="text-sm">Substances extracted from NOVA 1 foods, used in cooking. Examples: olive oil, butter, sugar, salt, flour, vinegar.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#f5a623' }}>NOVA 3 — Processed Foods</p>
              <p className="text-sm">NOVA 1 foods modified by adding NOVA 2 ingredients. Usually 2-3 ingredients. Examples: tinned vegetables, cheese, freshly baked bread, cured meats, tinned fish.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,90,90,0.06)', border: '1px solid rgba(255,90,90,0.1)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#ff5a5a' }}>NOVA 4 — Ultra-Processed Foods (UPF)</p>
              <p className="text-sm">Industrial formulations with 5+ ingredients, typically including substances not used in home cooking (e.g. high-fructose corn syrup, hydrogenated oils, emulsifiers, flavour enhancers). Examples: soft drinks, packaged biscuits, crisps, instant noodles, chicken nuggets, most breakfast cereals.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>How the Quality Score Is Calculated</h2>
          <p className="text-sm mb-3">
            The IngredScan Quality Score is a proprietary rating from 0 to 10, calculated using the following formula:
          </p>
          <div className="rounded-xl p-4 font-mono text-sm space-y-2" style={{ backgroundColor: 'rgba(19,19,26,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p><span style={{ color: '#7c6fff' }}>Base score:</span> 10.0</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.5</span> per NOVA 4 additive (max penalty: -4.0)</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.0</span> if Nutri-Score is D or E</p>
            <p><span style={{ color: '#ff5a5a' }}>-0.5</span> if Nutri-Score is C</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.0</span> if saturated fat &gt; 5g per 100g</p>
            <p><span style={{ color: '#ff5a5a' }}>-0.5</span> if sugar &gt; 10g per 100g</p>
            <p><span style={{ color: '#ff5a5a' }}>-1.0</span> if salt &gt; 0.6g per 100g (UK FSA threshold)</p>
            <p><span style={{ color: '#00e5a0' }}>+0.5</span> if product is certified organic</p>
          </div>
          <p className="text-sm mt-3">
            The final score is clamped between 0.0 and 10.0. A higher score indicates a product with fewer ultra-processed additives, better nutritional profile, and less concerning ingredients.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Additive Risk Ratings</h2>
          <p className="text-sm mb-3">
            Each additive in our database is classified as low, medium, or high risk. These classifications are based on:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
            <li><strong>EU Regulation 1333/2008</strong> — the European regulation on food additives</li>
            <li><strong>UK Food Standards Agency</strong> guidance and assessments</li>
            <li><strong>Peer-reviewed scientific literature</strong> — published studies on additive safety</li>
          </ul>
          <p className="text-sm mt-3">
            Risk ratings are <strong>relative classifications</strong> — &quot;high risk&quot; means an additive has more published concerns relative to others, not that it is necessarily dangerous at levels found in food. All additives permitted in UK/EU food have passed regulatory safety assessments and are considered safe within established limits.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Fresh Produce</h2>
          <p className="text-sm">
            Fresh, whole produce (fruits, vegetables, raw meat, eggs, etc.) is always classified as NOVA 1 — unprocessed or minimally processed. If you scan a fresh product and it shows a different NOVA classification, this is an error. Please use the Report feature to let us know.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Reporting Errors</h2>
          <p className="text-sm">
            If you find incorrect product data, inaccurate scores, or missing information:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-2 mt-2">
            <li>Tap the <strong>Report</strong> button on any product result page</li>
            <li>Describe what appears to be incorrect</li>
            <li>Reports are reviewed within 7 days</li>
            <li>Verified corrections are applied to our database and submitted back to Open Food Facts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#f0f0f4' }}>Contact</h2>
          <p className="text-sm">
            For questions about our data or scoring methodology, contact us at{' '}
            <a href="mailto:richquidcouk@gmail.com" style={{ color: '#00e5a0' }}>richquidcouk@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
