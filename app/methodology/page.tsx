import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How We Score Food & Cosmetics | IngredScan Methodology',
  description: 'A complete, transparent explanation of how IngredScan calculates quality scores, processing levels, and additive risk ratings — including all data sources, formulas, and limitations.',
  alternates: { canonical: 'https://www.ingredscan.com/methodology' },
}

export default function MethodologyPage() {
  return (
    <div className="legacy-page min-h-screen px-5 py-10 max-w-2xl mx-auto relative z-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How does IngredScan calculate its quality score?', acceptedAnswer: { '@type': 'Answer', text: 'The IngredScan quality score combines four factors: nutritional quality (50%, based on Nutri-Score algorithm), processing level (25%, based on NOVA classification), additive safety (20%, based on UK FSA and EFSA data), and organic certification (5%). The final score is out of 10.' } },
            { '@type': 'Question', name: 'Where does IngredScan get its data?', acceptedAnswer: { '@type': 'Answer', text: 'IngredScan uses Open Food Facts as its primary product database, enriched with data from the UK Food Standards Agency, EFSA, and the FDA. All sources are cited on individual product pages.' } },
            { '@type': 'Question', name: 'Can a brand challenge their product score?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Brands can email support@ingredscan.com with the product barcode and evidence of incorrect data. We review all challenges within 14 business days and correct factual errors promptly.' } },
          ],
        }) }}
      />

      <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'rgba(240,240,244,0.5)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
        Back to Home
      </Link>

      {/* Hero */}
      <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: '#22c77e' }}>Full Transparency</p>
      <h1 className="text-3xl sm:text-4xl heading-display mb-3" style={{ color: '#f0f0f4' }}>
        How IngredScan scores your products
      </h1>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(240,240,244,0.55)' }}>
        We believe you deserve to know exactly how we arrive at every score we show you. This page documents our complete methodology — every formula, every data source, every limitation. Nothing hidden.
      </p>
      <p className="text-xs mb-8" style={{ color: 'rgba(240,240,244,0.4)' }}>Last updated: April 2026 · Version 2.0</p>

      {/* Quick jump */}
      <div className="flex flex-wrap gap-2 mb-10">
        {[
          { label: 'Quality Score', id: 'quality-score' },
          { label: 'Processing Level', id: 'processing-level' },
          { label: 'Additives', id: 'additives' },
          { label: 'Data Sources', id: 'data-sources' },
          { label: 'Limitations', id: 'limitations' },
        ].map(item => (
          <a key={item.id} href={`#${item.id}`} className="px-3 py-1.5 rounded-full text-xs font-medium glass-subtle transition-colors" style={{ color: 'rgba(240,240,244,0.5)' }}>
            {item.label}
          </a>
        ))}
      </div>

      <div className="space-y-10" style={{ color: 'rgba(240,240,244,0.7)', lineHeight: '1.8' }}>
        {/* Important notice */}
        <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <p className="text-sm leading-relaxed">
            IngredScan is an informational tool only. We do not make health claims about specific foods, brands, or products. All information is sourced from official regulatory bodies. Risk classifications reflect our interpretation of publicly available data. They are not medical advice.
          </p>
        </div>

        {/* Quality Score */}
        <section id="quality-score">
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>Quality Score</h2>
          <p className="text-sm mb-4">The Quality Score is a number from 0 to 10 that combines four weighted components:</p>

          <div className="rounded-xl p-5 font-mono text-sm space-y-2 mb-6" style={{ backgroundColor: 'rgba(19,19,26,0.8)', border: '1px solid rgba(34,199,126,0.15)', borderLeft: '3px solid #22c77e' }}>
            <p style={{ color: '#22c77e' }}>Quality Score = A + B + C + D</p>
            <p>&nbsp;</p>
            <p>A = Nutritional Quality <span style={{ color: 'rgba(240,240,244,0.4)' }}>(max 5.0 — 50%)</span></p>
            <p>B = Processing Level <span style={{ color: 'rgba(240,240,244,0.4)' }}>(max 2.5 — 25%)</span></p>
            <p>C = Additive Safety <span style={{ color: 'rgba(240,240,244,0.4)' }}>(max 2.0 — 20%)</span></p>
            <p>D = Organic Certification <span style={{ color: 'rgba(240,240,244,0.4)' }}>(max 0.5 — 5%)</span></p>
            <p>&nbsp;</p>
            <p>Total possible: <span style={{ color: '#22c77e' }}>10.0</span></p>
          </div>

          <h3 className="text-base font-semibold mb-2 mt-6" style={{ color: '#f0f0f4' }}>A — Nutritional Quality (50%)</h3>
          <p className="text-sm mb-3">Based on the <a href="https://www.santepubliquefrance.fr/determinants-de-sante/nutrition-et-activite-physique/articles/nutri-score" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>Nutri-Score algorithm</a>, a science-based nutrition scoring system used by 7+ European countries and endorsed by WHO&apos;s IARC. Measures energy, saturated fat, sugars, sodium (negative) against fibre, protein, and fruit/vegetable content (positive) per 100g.</p>
          <div className="rounded-xl p-4 text-sm mb-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="grid grid-cols-5 gap-1 text-center mb-2">
              {['A', 'B', 'C', 'D', 'E'].map((g, i) => (
                <div key={g} className="py-1.5 rounded text-xs font-bold" style={{ backgroundColor: ['#22c77e', '#85bb2f', '#f5a623', '#ff8c42', '#ff5a5a'][i] + '20', color: ['#22c77e', '#85bb2f', '#f5a623', '#ff8c42', '#ff5a5a'][i] }}>
                  {g} → {[5.0, 4.0, 3.0, 2.0, 1.0][i]} pts
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>If nutritional data is unavailable, we contribute 2.5 points (neutral midpoint) and show a data warning.</p>
          </div>

          <h3 className="text-base font-semibold mb-2 mt-6" style={{ color: '#f0f0f4' }}>B — Processing Level (25%)</h3>
          <p className="text-sm mb-3">Based on the <a href="https://doi.org/10.1017/S1368980016000677" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>NOVA classification system</a> developed by Professor Carlos Monteiro at the University of São Paulo.</p>
          <div className="space-y-2 mb-4">
            {[
              { emoji: '🌿', label: 'NOVA 1 — Whole Food', pts: '2.5 pts' },
              { emoji: '🧂', label: 'NOVA 2 — Culinary Ingredient', pts: '2.5 pts' },
              { emoji: '⚙️', label: 'NOVA 3 — Processed', pts: '1.5 pts' },
              { emoji: '🏭', label: 'NOVA 4 — Industrially Processed', pts: '0.5 pts' },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <span className="text-sm">{n.emoji} {n.label}</span>
                <span className="text-xs font-mono" style={{ color: '#22c77e' }}>{n.pts}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 text-xs mb-4" style={{ backgroundColor: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)', color: 'rgba(240,240,244,0.5)' }}>
            NOVA 4 does not mean harmful — it means industrially processed. Many NOVA 4 products are nutritionally decent. This is why processing is 25% of the score, not 100%.
          </div>

          <h3 className="text-base font-semibold mb-2 mt-6" style={{ color: '#f0f0f4' }}>C — Additive Safety (20%)</h3>
          <p className="text-sm mb-3">Starts at 2.0 (full marks). Deductions: -0.4 per high-concern additive, -0.15 per medium-concern, -0.3 additional for UK mandatory warning label additives. Based on <a href="https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>UK FSA</a> and <a href="https://www.efsa.europa.eu/en/topics/topic/food-additives" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>EFSA</a> published positions. Every additive links to its official source.</p>

          <h3 className="text-base font-semibold mb-2 mt-6" style={{ color: '#f0f0f4' }}>D — Organic Certification (5%)</h3>
          <p className="text-sm mb-4">+0.5 for official organic certification (Soil Association, EU Organic, USDA Organic). +0.25 for products labelled no artificial colours/flavours/preservatives without full organic status.</p>

          {/* Score labels */}
          <h3 className="text-base font-semibold mb-2 mt-6" style={{ color: '#f0f0f4' }}>Score Labels</h3>
          <div className="space-y-1.5 mb-4">
            {[
              { range: '9.0 – 10.0', label: 'Excellent', color: '#00e5a0' },
              { range: '7.0 – 8.9', label: 'Good', color: '#22c77e' },
              { range: '5.5 – 6.9', label: 'Fair', color: '#f5a623' },
              { range: '4.0 – 5.4', label: 'Moderate', color: '#ff8c42' },
              { range: '0 – 3.9', label: 'Poor', color: '#ff5a5a' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ backgroundColor: `${s.color}08` }}>
                <span className="text-sm" style={{ color: s.color }}>{s.label}</span>
                <span className="text-xs font-mono" style={{ color: 'rgba(240,240,244,0.4)' }}>{s.range}</span>
              </div>
            ))}
          </div>

          {/* Worked examples */}
          <h3 className="text-base font-semibold mb-3 mt-6" style={{ color: '#f0f0f4' }}>Worked Examples</h3>
          <div className="space-y-3">
            {[
              { name: 'Fresh Apple', ns: 'A', nova: 1, add: 'None', org: 'No', scores: [5.0, 2.5, 2.0, 0], total: 9.5, label: 'Excellent' },
              { name: 'Organic Sourdough', ns: 'B', nova: 3, add: 'None', org: 'Yes', scores: [4.0, 1.5, 2.0, 0.5], total: 8.0, label: 'Good' },
              { name: 'Breakfast Cereal', ns: 'B', nova: 4, add: '1 medium', org: 'No', scores: [4.0, 0.5, 1.85, 0], total: 6.35, label: 'Fair' },
              { name: 'Fizzy Drink', ns: 'E', nova: 4, add: '3 medium', org: 'No', scores: [1.0, 0.5, 1.55, 0], total: 3.05, label: 'Poor' },
            ].map(ex => (
              <div key={ex.name} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>{ex.name}</p>
                <p className="text-xs mb-2" style={{ color: 'rgba(240,240,244,0.4)' }}>Nutri-Score {ex.ns} · NOVA {ex.nova} · Additives: {ex.add} · Organic: {ex.org}</p>
                <p className="text-xs font-mono" style={{ color: 'rgba(240,240,244,0.5)' }}>
                  {ex.scores[0]} + {ex.scores[1]} + {ex.scores[2]} + {ex.scores[3]} = <span style={{ color: '#22c77e' }}>{ex.total}</span> ({ex.label})
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Processing Level */}
        <section id="processing-level">
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>Processing Level (NOVA)</h2>
          <p className="text-sm mb-3">Shown separately from the Quality Score because processing and nutrition tell different stories. A product can be nutritionally decent but heavily processed, or minimally processed but high in sugar.</p>
          <p className="text-sm mb-3">NOVA scores from <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>Open Food Facts</a> are used where available. Otherwise estimated from ingredient lists and labelled &quot;Estimated&quot;.</p>
          <p className="text-sm">Some categories are excluded: infant formula, medical nutritional products, and supplements show official guidance instead of scores.</p>
        </section>

        {/* Additives */}
        <section id="additives">
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>Additive Risk Ratings</h2>
          <p className="text-sm mb-3">Every additive is shown individually with a risk level and source link. Levels are based on published positions of the <a href="https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>UK FSA</a> and <a href="https://www.efsa.europa.eu" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6fff' }}>EFSA</a>.</p>
          <ul className="list-disc list-inside text-sm space-y-2 ml-2 mb-3">
            <li><strong style={{ color: '#22c77e' }}>Low</strong> — Approved with no significant concerns in published literature</li>
            <li><strong style={{ color: '#f5a623' }}>Medium</strong> — Approved but with published research raising questions or use restrictions</li>
            <li><strong style={{ color: '#ff5a5a' }}>High</strong> — Mandatory warning labels, ongoing regulatory review, or banned in other markets</li>
          </ul>
          <p className="text-sm">Since Brexit, UK and EU additive regulations are independent. Where they differ (e.g. E171 Titanium Dioxide), we show both positions.</p>
        </section>

        {/* Data Sources */}
        <section id="data-sources">
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>Data Sources</h2>
          <div className="space-y-3">
            {[
              { name: 'Open Food Facts', desc: '3.2M+ products. Community-maintained open database.', url: 'https://world.openfoodfacts.org', licence: 'ODbL' },
              { name: 'UK Food Standards Agency', desc: 'UK food additive safety authority.', url: 'https://www.food.gov.uk', licence: 'OGL' },
              { name: 'EFSA', desc: 'EU food safety risk assessment.', url: 'https://www.efsa.europa.eu', licence: '' },
              { name: 'FDA', desc: 'US food and drug safety.', url: 'https://www.fda.gov', licence: 'Public domain' },
              { name: 'Open Beauty Facts', desc: 'Open cosmetic product database.', url: 'https://world.openbeautyfacts.org', licence: 'ODbL' },
            ].map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl p-4 transition-all" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-semibold" style={{ color: '#f0f0f4' }}>{s.name}</p>
                <p className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>{s.desc} {s.licence && `· ${s.licence}`}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section id="limitations">
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>What We Don&apos;t Do</h2>
          <div className="space-y-3">
            {[
              { title: 'Not medical advice', desc: 'Scores are informational. Consult a professional for health conditions or allergies.' },
              { title: 'Data can be incomplete', desc: 'Open Food Facts is community-maintained. We show a confidence percentage so you know data reliability.' },
              { title: 'NOVA has limitations', desc: 'NOVA classifies processing method, not health impact. Some NOVA 4 foods are nutritionally excellent.' },
              { title: 'Regulation evolves', desc: 'We review additive data regularly but may not reflect very recent decisions. Check food.gov.uk for the latest.' },
            ].map(l => (
              <div key={l.title} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(245,166,35,0.04)', borderLeft: '3px solid rgba(245,166,35,0.3)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>{l.title}</p>
                <p className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>{l.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Challenge */}
        <section id="challenge">
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>Challenging a Score</h2>
          <p className="text-sm mb-3">Brands and manufacturers can email <a href="mailto:support@ingredscan.com" style={{ color: '#7c6fff' }}>support@ingredscan.com</a> with the product barcode and evidence of incorrect data. We review all challenges within 14 business days. Scores are not changed based on commercial considerations — our methodology applies equally to all products.</p>
          <p className="text-sm">Consumers can use the &quot;Report an issue&quot; button on any scan result page.</p>
        </section>

        {/* Version history */}
        <section>
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>Version History</h2>
          <div className="space-y-3">
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold" style={{ color: '#22c77e' }}>Version 2.0 — April 2026</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(240,240,244,0.5)' }}>Four-component scoring: Nutritional quality (50% via Nutri-Score), Processing level (25% via NOVA), Additives (20%), Organic (5%). Beverage-specific sugar thresholds. Score breakdown UI.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold" style={{ color: 'rgba(240,240,244,0.5)' }}>Version 1.0 — March 2026</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(240,240,244,0.4)' }}>Initial launch. Score based primarily on additive presence with Nutri-Score and NOVA as modifiers.</p>
            </div>
          </div>
        </section>

        {/* Data Verification */}
        <section id="data-verification">
          <h2 className="text-xl font-bold heading-display mb-4" style={{ color: '#f0f0f4' }}>How Product Data is Verified</h2>
          <p className="text-sm mb-4">IngredScan sources product data from Open Food Facts and Open Beauty Facts, two open-source community databases. While we cannot guarantee the absolute reliability of all product data, we take the following steps:</p>
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>Automated data quality checks</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>Our system automatically flags incomplete or inconsistent entries — such as missing ingredient lists, implausible nutrient values, or unrecognised ingredient formats. Products with insufficient data are shown with a warning rather than a score.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>Ingredient parsing</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>Our ingredient parser identifies likely errors — including formatting inconsistencies, encoding issues, truncated text, and entries that do not match known ingredient patterns. Flagged products are marked as &quot;data may be incomplete&quot; until resolved.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>Community corrections</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>Since Open Food Facts and Open Beauty Facts are community-maintained, errors can be corrected directly at source by any contributor. IngredScan reflects the latest available data from these databases.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#f0f0f4' }}>User reporting</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>Users can report incorrect product data directly in the app. Reported issues are reviewed and, where possible, corrections are submitted back to the Open Food Facts / Open Beauty Facts community.</p>
            </div>
          </div>
          <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.5)' }}>
              IngredScan does not have a dedicated data verification team. Always check the physical product label for the most accurate and up-to-date information. Scores and ingredient analyses are estimates based on available community data.
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgba(34,199,126,0.04)', border: '1px solid rgba(34,199,126,0.1)' }}>
          <p className="text-sm mb-2" style={{ color: '#f0f0f4' }}>Have a question about our methodology?</p>
          <a href="mailto:support@ingredscan.com" className="text-sm font-medium" style={{ color: '#7c6fff' }}>support@ingredscan.com →</a>
        </div>
      </div>
    </div>
  )
}
