export interface RegulatoryRef {
  primaryRef: string
  primaryUrl: string
  secondaryRef?: string
  secondaryUrl?: string
  authority: string
  authorityUrl: string
  note?: string
}

export const REGULATORY_REFS: Record<string, RegulatoryRef> = {
  uk_food: {
    primaryRef: 'UK FSA Approved Additives Register',
    primaryUrl: 'https://www.food.gov.uk/business-guidance/approved-additives-and-e-numbers',
    secondaryRef: 'Assimilated Regulation (EC) No. 1333/2008',
    secondaryUrl: 'https://www.legislation.gov.uk/eur/2008/1333/contents',
    authority: 'Food Standards Agency (FSA)',
    authorityUrl: 'https://www.food.gov.uk',
    note: 'UK food additive law is based on retained EU legislation, now published as UK assimilated law on legislation.gov.uk and administered by the FSA.',
  },

  ni_food: {
    primaryRef: 'Regulation (EC) No. 1333/2008',
    primaryUrl: 'https://www.legislation.gov.uk/eur/2008/1333/contents',
    authority: 'Food Standards Agency (FSA)',
    authorityUrl: 'https://www.food.gov.uk',
    note: 'Northern Ireland follows EU food additive regulations under the Windsor Framework.',
  },

  uk_cosmetic: {
    primaryRef: 'UK Cosmetics Regulation (assimilated from EU 1223/2009)',
    primaryUrl: 'https://www.legislation.gov.uk/eur/2009/1223/contents',
    authority: 'Office for Product Safety and Standards (OPSS)',
    authorityUrl: 'https://www.gov.uk/government/organisations/office-for-product-safety-and-standards',
    note: 'UK cosmetics safety is governed by the assimilated UK version of EU Cosmetics Regulation 1223/2009, administered by OPSS.',
  },

  us_food: {
    primaryRef: 'FDA 21 CFR (Code of Federal Regulations)',
    primaryUrl: 'https://www.ecfr.gov/current/title-21',
    secondaryRef: 'FDA GRAS (Generally Recognized as Safe)',
    secondaryUrl: 'https://www.fda.gov/food/food-ingredients-packaging/generally-recognized-safe-gras',
    authority: 'Food and Drug Administration (FDA)',
    authorityUrl: 'https://www.fda.gov',
  },

  us_cosmetic: {
    primaryRef: 'Modernization of Cosmetics Regulation Act 2022 (MoCRA)',
    primaryUrl: 'https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022',
    authority: 'Food and Drug Administration (FDA)',
    authorityUrl: 'https://www.fda.gov',
  },

  eu_food: {
    primaryRef: 'Regulation (EC) No. 1333/2008',
    primaryUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R1333',
    authority: 'European Food Safety Authority (EFSA)',
    authorityUrl: 'https://www.efsa.europa.eu',
  },

  eu_cosmetic: {
    primaryRef: 'Regulation (EC) No. 1223/2009',
    primaryUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223',
    authority: 'European Chemicals Agency (ECHA)',
    authorityUrl: 'https://www.echa.europa.eu',
  },

  au_food: {
    primaryRef: 'Australia New Zealand Food Standards Code',
    primaryUrl: 'https://www.foodstandards.gov.au/food-standards-code',
    authority: 'Food Standards Australia New Zealand (FSANZ)',
    authorityUrl: 'https://www.foodstandards.gov.au',
  },

  ca_food: {
    primaryRef: 'Food and Drug Regulations (FDR)',
    primaryUrl: 'https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/',
    authority: 'Health Canada',
    authorityUrl: 'https://www.canada.ca/en/health-canada.html',
  },

  global_food: {
    primaryRef: 'Codex Alimentarius (International Food Standards)',
    primaryUrl: 'https://www.fao.org/fao-who-codexalimentarius/en/',
    authority: 'Codex Alimentarius Commission (FAO/WHO)',
    authorityUrl: 'https://www.fao.org/fao-who-codexalimentarius',
    note: 'International food standards — specific national regulations may differ.',
  },
}

export function getRegulatoryRef(
  market: string,
  productType: 'food' | 'cosmetic'
): RegulatoryRef {
  const key = `${market}_${productType}`
  return REGULATORY_REFS[key] || REGULATORY_REFS['global_food']
}

export function getRegulatoryDisplayText(market: string, productType: 'food' | 'cosmetic'): string {
  const ref = getRegulatoryRef(market, productType)
  return `Risk levels based on ${ref.primaryRef}`
}
