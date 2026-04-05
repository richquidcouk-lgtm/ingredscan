export type Market = 'uk' | 'us' | 'nl' | 'de' | 'fr' | 'it' | 'es' | 'se' | 'pl' | 'be' | 'au' | 'ca' | 'other'

export interface MarketConfig {
  code: Market
  name: string
  flag: string
  currency: string
  currencySymbol: string
  language: string
  regulatoryBody: string
  regulatoryRef: string
  retailers: string[]
  supported: boolean
  comingSoon: boolean
}

export const MARKETS: Record<Market, MarketConfig> = {
  uk: {
    code: 'uk',
    name: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    currency: 'GBP',
    currencySymbol: '\u00A3',
    language: 'en-GB',
    regulatoryBody: 'UK FSA',
    regulatoryRef: 'EU Reg 1333/2008 and UK FSA guidelines',
    retailers: ['Tesco', 'Sainsbury\'s', 'Asda', 'Waitrose', 'Morrisons', 'Aldi', 'Lidl', 'M&S'],
    supported: true,
    comingSoon: false,
  },
  us: {
    code: 'us',
    name: 'United States',
    flag: '\u{1F1FA}\u{1F1F8}',
    currency: 'USD',
    currencySymbol: '$',
    language: 'en-US',
    regulatoryBody: 'FDA',
    regulatoryRef: 'FDA 21 CFR and GRAS guidelines',
    retailers: ['Walmart', 'Kroger', 'Whole Foods', 'Target', 'Trader Joe\'s', 'Costco'],
    supported: true,
    comingSoon: false,
  },
  nl: {
    code: 'nl',
    name: 'Netherlands',
    flag: '\u{1F1F3}\u{1F1F1}',
    currency: 'EUR',
    currencySymbol: '\u20AC',
    language: 'nl',
    regulatoryBody: 'NVWA',
    regulatoryRef: 'EU Reg 1333/2008 and NVWA guidelines',
    retailers: ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Plus'],
    supported: false,
    comingSoon: true,
  },
  de: {
    code: 'de',
    name: 'Germany',
    flag: '\u{1F1E9}\u{1F1EA}',
    currency: 'EUR',
    currencySymbol: '\u20AC',
    language: 'de',
    regulatoryBody: 'BVL',
    regulatoryRef: 'EU Reg 1333/2008 and BVL guidelines',
    retailers: ['Edeka', 'Rewe', 'Aldi', 'Lidl', 'Kaufland', 'Netto'],
    supported: false,
    comingSoon: true,
  },
  fr: {
    code: 'fr',
    name: 'France',
    flag: '\u{1F1EB}\u{1F1F7}',
    currency: 'EUR',
    currencySymbol: '\u20AC',
    language: 'fr',
    regulatoryBody: 'ANSES',
    regulatoryRef: 'EU Reg 1333/2008 and ANSES guidelines',
    retailers: ['Carrefour', 'Leclerc', 'Auchan', 'Monoprix', 'Lidl'],
    supported: false,
    comingSoon: true,
  },
  it: {
    code: 'it',
    name: 'Italy',
    flag: '\u{1F1EE}\u{1F1F9}',
    currency: 'EUR',
    currencySymbol: '\u20AC',
    language: 'it',
    regulatoryBody: 'Ministero della Salute',
    regulatoryRef: 'EU Reg 1333/2008 and Italian Ministry of Health guidelines',
    retailers: ['Esselunga', 'Conad', 'Coop', 'Lidl', 'Eurospin'],
    supported: false,
    comingSoon: true,
  },
  es: {
    code: 'es',
    name: 'Spain',
    flag: '\u{1F1EA}\u{1F1F8}',
    currency: 'EUR',
    currencySymbol: '\u20AC',
    language: 'es',
    regulatoryBody: 'AESAN',
    regulatoryRef: 'EU Reg 1333/2008 and AESAN guidelines',
    retailers: ['Mercadona', 'Carrefour', 'Lidl', 'Dia', 'El Corte Ingl\u00E9s'],
    supported: false,
    comingSoon: true,
  },
  se: {
    code: 'se',
    name: 'Sweden',
    flag: '\u{1F1F8}\u{1F1EA}',
    currency: 'SEK',
    currencySymbol: 'kr',
    language: 'sv',
    regulatoryBody: 'Livsmedelsverket',
    regulatoryRef: 'EU Reg 1333/2008 and Livsmedelsverket guidelines',
    retailers: ['ICA', 'Coop', 'Hemk\u00F6p', 'Lidl', 'Willys'],
    supported: false,
    comingSoon: true,
  },
  pl: {
    code: 'pl',
    name: 'Poland',
    flag: '\u{1F1F5}\u{1F1F1}',
    currency: 'PLN',
    currencySymbol: 'z\u0142',
    language: 'pl',
    regulatoryBody: 'GIS',
    regulatoryRef: 'EU Reg 1333/2008 and GIS guidelines',
    retailers: ['Biedronka', 'Lidl', 'Kaufland', '\u017Babka', 'Carrefour'],
    supported: false,
    comingSoon: true,
  },
  be: {
    code: 'be',
    name: 'Belgium',
    flag: '\u{1F1E7}\u{1F1EA}',
    currency: 'EUR',
    currencySymbol: '\u20AC',
    language: 'nl-BE',
    regulatoryBody: 'AFSCA',
    regulatoryRef: 'EU Reg 1333/2008 and AFSCA guidelines',
    retailers: ['Colruyt', 'Delhaize', 'Carrefour', 'Lidl', 'Aldi'],
    supported: false,
    comingSoon: true,
  },
  au: {
    code: 'au',
    name: 'Australia',
    flag: '\u{1F1E6}\u{1F1FA}',
    currency: 'AUD',
    currencySymbol: 'A$',
    language: 'en-AU',
    regulatoryBody: 'FSANZ',
    regulatoryRef: 'FSANZ Food Standards Code guidelines',
    retailers: ['Woolworths', 'Coles', 'Aldi', 'IGA', 'Harris Farm'],
    supported: false,
    comingSoon: true,
  },
  ca: {
    code: 'ca',
    name: 'Canada',
    flag: '\u{1F1E8}\u{1F1E6}',
    currency: 'CAD',
    currencySymbol: 'C$',
    language: 'en-CA',
    regulatoryBody: 'CFIA',
    regulatoryRef: 'CFIA and Health Canada guidelines',
    retailers: ['Loblaws', 'Sobeys', 'Metro', 'Costco', 'Walmart Canada'],
    supported: false,
    comingSoon: true,
  },
  other: {
    code: 'other',
    name: 'Other',
    flag: '\u{1F30D}',
    currency: 'USD',
    currencySymbol: '$',
    language: 'en',
    regulatoryBody: 'Local authorities',
    regulatoryRef: 'international food safety guidelines',
    retailers: [],
    supported: false,
    comingSoon: false,
  },
}

const MARKET_STORAGE_KEY = 'ingredscan_market'

const LANGUAGE_TO_MARKET: Record<string, Market> = {
  'en-gb': 'uk',
  'en-us': 'us',
  'en-au': 'au',
  'en-ca': 'ca',
  'nl': 'nl',
  'nl-nl': 'nl',
  'nl-be': 'be',
  'de': 'de',
  'de-de': 'de',
  'de-at': 'de',
  'fr': 'fr',
  'fr-fr': 'fr',
  'fr-be': 'be',
  'fr-ca': 'ca',
  'it': 'it',
  'it-it': 'it',
  'es': 'es',
  'es-es': 'es',
  'sv': 'se',
  'sv-se': 'se',
  'pl': 'pl',
  'pl-pl': 'pl',
}

const COUNTRY_TO_MARKET: Record<string, Market> = {
  GB: 'uk',
  US: 'us',
  NL: 'nl',
  DE: 'de',
  FR: 'fr',
  IT: 'it',
  ES: 'es',
  SE: 'se',
  PL: 'pl',
  BE: 'be',
  AU: 'au',
  CA: 'ca',
}

export async function detectMarket(): Promise<Market> {
  // 1. Check localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(MARKET_STORAGE_KEY)
    if (stored && stored in MARKETS) {
      return stored as Market
    }
  }

  // 2. Check navigator.language
  if (typeof navigator !== 'undefined' && navigator.language) {
    const lang = navigator.language.toLowerCase()
    if (LANGUAGE_TO_MARKET[lang]) {
      return LANGUAGE_TO_MARKET[lang]
    }
    // Try just the base language
    const baseLang = lang.split('-')[0]
    if (LANGUAGE_TO_MARKET[baseLang]) {
      return LANGUAGE_TO_MARKET[baseLang]
    }
  }

  // 3. Try IP geolocation with timeout
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      const countryCode = data.country_code?.toUpperCase()
      if (countryCode && COUNTRY_TO_MARKET[countryCode]) {
        return COUNTRY_TO_MARKET[countryCode]
      }
    }
  } catch {
    // Timeout or network error — fall through
  }

  // 4. Default to UK
  return 'uk'
}

export function setMarketPreference(market: Market): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MARKET_STORAGE_KEY, market)
  }
}

export function getMarketConfig(market: Market): MarketConfig {
  return MARKETS[market] || MARKETS.uk
}
