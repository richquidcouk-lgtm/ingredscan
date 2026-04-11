import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Ensures every additive in data/additives.json carries a full baseline
// of government / regulator source links — EU Reg 1333/2008, EFSA,
// UK FSA, US FDA, and WHO/JECFA — in addition to any additive-specific
// peer-reviewed or re-evaluation sources already present.
//
// Existing sources are preserved (dedup by URL). Order: specific sources
// first (usually EFSA re-evals, FDA-specific pages, peer-reviewed studies),
// then the baseline regulators.

type Source = { title: string; url: string; year: number }
type Additive = {
  code: string
  name: string
  sources?: Source[]
  [key: string]: unknown
}

const BASELINE_SOURCES: Source[] = [
  {
    title: 'EU Regulation 1333/2008 on food additives',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R1333',
    year: 2008,
  },
  {
    title: 'EFSA — Food Additives topic',
    url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives',
    year: 2024,
  },
  {
    title: 'UK Food Standards Agency — Food additives',
    url: 'https://www.food.gov.uk/safety-hygiene/food-additives',
    year: 2024,
  },
  {
    title: 'US FDA — Food Additive Status List',
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list',
    year: 2024,
  },
  {
    title: 'WHO / FAO JECFA — Evaluations of food additives',
    url: 'https://apps.who.int/food-additives-contaminants-jecfa-database/search.aspx',
    year: 2024,
  },
]

// For high-risk additives we also surface the EFSA re-evaluation hub
// and the FSA additive warning label page so users can verify status.
const HIGH_RISK_EXTRA: Source[] = [
  {
    title: 'EFSA — Re-evaluation of food additives programme',
    url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives-re-evaluations',
    year: 2024,
  },
  {
    title: 'UK FSA — Food colours and hyperactivity',
    url: 'https://www.food.gov.uk/safety-hygiene/food-colours-and-hyperactivity',
    year: 2024,
  },
]

function dedupeByUrl(sources: Source[]): Source[] {
  const seen = new Set<string>()
  const out: Source[] = []
  for (const s of sources) {
    const key = s.url.trim().toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  return out
}

function enrich(additive: Additive): Additive {
  const existing = Array.isArray(additive.sources) ? additive.sources : []
  const baseline = [...BASELINE_SOURCES]
  if (additive.risk === 'high') baseline.push(...HIGH_RISK_EXTRA)
  const merged = dedupeByUrl([...existing, ...baseline])
  return { ...additive, sources: merged }
}

function main() {
  const path = join(process.cwd(), 'data', 'additives.json')
  const raw = readFileSync(path, 'utf-8')
  const data = JSON.parse(raw) as Additive[]

  let beforeMin = Infinity
  let beforeTotal = 0
  let afterMin = Infinity
  let afterTotal = 0

  const enriched = data.map((a) => {
    const before = (a.sources || []).length
    beforeMin = Math.min(beforeMin, before)
    beforeTotal += before
    const out = enrich(a)
    const after = (out.sources || []).length
    afterMin = Math.min(afterMin, after)
    afterTotal += after
    return out
  })

  writeFileSync(path, JSON.stringify(enriched, null, 2) + '\n')

  console.log(`Enriched ${data.length} additives.`)
  console.log(
    `Sources per additive: before min=${beforeMin} avg=${(beforeTotal / data.length).toFixed(2)}`,
  )
  console.log(
    `                      after  min=${afterMin} avg=${(afterTotal / data.length).toFixed(2)}`,
  )
}

main()
