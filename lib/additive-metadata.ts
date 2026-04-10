/**
 * Additive metadata for UI display — name, function, plain-English summary,
 * and official source links for each additive.
 */

export interface AdditiveSource {
  org: string
  title: string
  url: string
}

export interface AdditiveInfo {
  name: string
  function: string
  tier: 0 | 1 | 2 | 3
  riskLabel: string
  summary: string
  sources: AdditiveSource[]
}

export const ADDITIVE_METADATA: Record<string, AdditiveInfo> = {
  'en:e330': {
    name: 'Citric acid',
    function: 'Acidity regulator',
    tier: 0,
    riskLabel: 'No concern',
    summary: 'Naturally occurring acid found in citrus fruits. Considered safe at all normal dietary levels by EFSA, FSA and FDA. No restrictions in the UK or EU.',
    sources: [
      { org: 'EFSA', title: 'Re-evaluation of citric acid (E330) — 2020', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4985' },
      { org: 'FSA', title: 'Approved additives — E330', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
    ],
  },
  'en:e407': {
    name: 'Carrageenan',
    function: 'Thickener / stabiliser',
    tier: 3,
    riskLabel: 'High concern',
    summary: 'Seaweed-derived thickener. Animal studies link it to gut inflammation. Degraded carrageenan classified IARC Group 2B (possible carcinogen). Banned in EU certified organic products. Score capped at 49 when present.',
    sources: [
      { org: 'EFSA', title: 'Re-evaluation of carrageenan (E407) — 2018', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4876' },
      { org: 'FSA', title: 'E407 — UK approved additives', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
      { org: 'IARC', title: 'Monograph Vol.83 — degraded carrageenan', url: 'https://www.iarc.who.int/wp-content/uploads/2018/07/MonographVolume83.pdf' },
    ],
  },
  'en:e951': {
    name: 'Aspartame',
    function: 'Sweetener',
    tier: 3,
    riskLabel: 'High concern',
    summary: 'Artificial sweetener 200x sweeter than sugar. IARC classified it as "possibly carcinogenic to humans" (Group 2B) in July 2023. EU mandatory phenylalanine warning label required on all products containing it.',
    sources: [
      { org: 'EFSA', title: 'Aspartame safety review', url: 'https://www.efsa.europa.eu/en/topics/topic/aspartame' },
      { org: 'WHO', title: 'Aspartame hazard & risk assessment 2023', url: 'https://www.who.int/news/item/14-07-2023-aspartame-hazard-and-risk-assessment-results-released' },
      { org: 'FDA', title: 'Aspartame — FDA position', url: 'https://www.fda.gov/food/food-additives-petitions/aspartame-and-other-sweeteners-food' },
    ],
  },
  'en:e471': {
    name: 'Mono- and diglycerides of fatty acids',
    function: 'Emulsifier',
    tier: 2,
    riskLabel: 'Moderate concern',
    summary: 'Common emulsifier often from animal fat or palm oil. EFSA noted data gaps in 2017 and called for further genotoxicity studies. May contain trace trans fats.',
    sources: [
      { org: 'EFSA', title: 'Re-evaluation of E471 — 2017', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4786' },
      { org: 'FSA', title: 'E471 — UK approved additives', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
    ],
  },
  'en:e250': {
    name: 'Sodium nitrite',
    function: 'Preservative / colour fixative',
    tier: 3,
    riskLabel: 'High concern',
    summary: 'Used in cured meats. IARC classifies processed meats as Group 1 carcinogen. Nitrites form nitrosamines in the body — established carcinogens.',
    sources: [
      { org: 'IARC', title: 'IARC Monographs Vol.114 — processed meat', url: 'https://monographs.iarc.who.int/iarc-monographs-volume-114/' },
      { org: 'EFSA', title: 'Nitrites and nitrates in food — 2017', url: 'https://www.efsa.europa.eu/en/topics/topic/nitrates-and-nitrites' },
    ],
  },
  'en:e320': {
    name: 'BHA (Butylated hydroxyanisole)',
    function: 'Antioxidant / preservative',
    tier: 3,
    riskLabel: 'High concern',
    summary: 'Synthetic antioxidant. IARC Group 2B (possibly carcinogenic). Endocrine disruption concerns. Banned in Japan; restricted in several countries.',
    sources: [
      { org: 'EFSA', title: 'BHA (E320) re-evaluation', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4534' },
      { org: 'IARC', title: 'IARC Monograph — BHA Group 2B', url: 'https://monographs.iarc.who.int/' },
    ],
  },
  'en:e211': {
    name: 'Sodium benzoate',
    function: 'Preservative',
    tier: 3,
    riskLabel: 'High concern',
    summary: 'Reacts with Vitamin C to form benzene, a known carcinogen. Combined with certain food dyes, linked to hyperactivity in children (Southampton study). EU mandatory warning label required with Southampton colours.',
    sources: [
      { org: 'FSA', title: 'Southampton study — colours & sodium benzoate', url: 'https://www.food.gov.uk/research/food-additives/the-southampton-study' },
      { org: 'EFSA', title: 'Benzoic acid and sodium benzoate — EFSA', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/3978' },
    ],
  },
  'en:e171': {
    name: 'Titanium dioxide',
    function: 'Colour (white)',
    tier: 3,
    riskLabel: 'High concern',
    summary: 'White colouring agent. Banned as food additive across the EU since 2022 due to genotoxicity concerns. Status in Great Britain post-Brexit remains "permitted but under review" by the FSA.',
    sources: [
      { org: 'EFSA', title: 'Titanium dioxide — genotoxicity assessment', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/6585' },
      { org: 'FSA', title: 'E171 — FSA position', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
    ],
  },
  'en:e102': {
    name: 'Tartrazine',
    function: 'Colour (yellow)',
    tier: 3,
    riskLabel: 'High concern',
    summary: 'Yellow dye — one of the six Southampton colours. Linked to hyperactivity in children. EU mandatory warning: "may have an adverse effect on activity and attention in children."',
    sources: [
      { org: 'EFSA', title: 'Scientific opinion on Tartrazine (E102)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/2329' },
      { org: 'FSA', title: 'Southampton colours — FSA guidance', url: 'https://www.food.gov.uk/business-guidance/colours-in-food' },
    ],
  },
  'en:e466': {
    name: 'Carboxymethylcellulose (CMC)',
    function: 'Thickener / stabiliser',
    tier: 2,
    riskLabel: 'Moderate concern',
    summary: 'Synthetic cellulose derivative. Mouse studies (Chassaing et al. Nature 2015) showed gut microbiome disruption and low-grade intestinal inflammation at doses relevant to human consumption.',
    sources: [
      { org: 'EFSA', title: 'Re-evaluation of CMC (E466)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4843' },
      { org: 'FSA', title: 'E466 — UK approved additives', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
    ],
  },
  'en:e433': {
    name: 'Polysorbate 80',
    function: 'Emulsifier',
    tier: 2,
    riskLabel: 'Moderate concern',
    summary: 'Synthetic emulsifier. Animal studies show gut microbiome disruption and increased intestinal permeability. Limited human safety data at current dietary exposure levels.',
    sources: [
      { org: 'EFSA', title: 'Re-evaluation of Polysorbate 80 (E433)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4641' },
      { org: 'FSA', title: 'E433 — UK approved additives', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
    ],
  },
  'en:e621': {
    name: 'Monosodium glutamate (MSG)',
    function: 'Flavour enhancer',
    tier: 2,
    riskLabel: 'Moderate concern',
    summary: 'Widely used flavour enhancer. EFSA considers it safe at normal dietary levels, but a subset of individuals report sensitivity symptoms. Associated with UPF and highly palatable food engineering.',
    sources: [
      { org: 'EFSA', title: 'Glutamic acid and glutamates re-evaluation — 2017', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4910' },
      { org: 'FSA', title: 'E621 — UK approved additives', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
    ],
  },
  'en:e955': {
    name: 'Sucralose',
    function: 'Sweetener',
    tier: 2,
    riskLabel: 'Moderate concern',
    summary: 'Artificial sweetener 600x sweeter than sugar. Emerging research suggests potential gut microbiome disruption and altered glucose response. EFSA reviewed in 2017; new studies raising further questions.',
    sources: [
      { org: 'EFSA', title: 'Sucralose (E955) — EFSA safety assessment', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4704' },
      { org: 'FDA', title: 'Sucralose — FDA position', url: 'https://www.fda.gov/food/food-additives-petitions/additional-information-about-high-intensity-sweeteners-permitted-use-food-united-states' },
    ],
  },
}

/**
 * Get metadata for an additive tag. Returns the detailed entry if available,
 * or generates a generic entry for unknown additives.
 */
export function getAdditiveMetadata(tag: string, tier: 0 | 1 | 2 | 3): AdditiveInfo {
  const normalised = tag.toLowerCase()
  if (normalised in ADDITIVE_METADATA) return ADDITIVE_METADATA[normalised]

  const code = tag.replace('en:e', 'E').replace('en:', '').toUpperCase()
  const riskLabels = ['No concern', 'Low concern', 'Moderate concern', 'High concern'] as const
  return {
    name: code,
    function: 'Food additive',
    tier,
    riskLabel: riskLabels[tier],
    summary: `${code} is not yet in the IngredScan metadata registry. Tier ${tier} assigned. Check EFSA or FSA for the latest assessment.`,
    sources: [
      { org: 'EFSA', title: `Search EFSA for ${code}`, url: `https://www.efsa.europa.eu/en/search/site/${code.toLowerCase()}` },
      { org: 'FSA', title: 'UK approved additives register', url: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers' },
    ],
  }
}
