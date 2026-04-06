// Known UK retailer name mappings — normalise OFF store names to clean display names
const UK_RETAILER_MAP: Record<string, string> = {
  'tesco': 'Tesco',
  'tescos': 'Tesco',
  'tesco express': 'Tesco',
  'tesco extra': 'Tesco',
  'tesco metro': 'Tesco',
  'sainsburys': "Sainsbury's",
  "sainsbury's": "Sainsbury's",
  'sainsbury': "Sainsbury's",
  "sainsbury's local": "Sainsbury's",
  'asda': 'Asda',
  'waitrose': 'Waitrose',
  'waitrose & partners': 'Waitrose',
  'morrisons': 'Morrisons',
  'morrison': 'Morrisons',
  'aldi': 'Aldi',
  'lidl': 'Lidl',
  'co-op': 'Co-op',
  'coop': 'Co-op',
  'the co-operative': 'Co-op',
  'cooperative': 'Co-op',
  'm&s': 'M&S',
  'marks & spencer': 'M&S',
  'marks and spencer': 'M&S',
  'marks & spencers': 'M&S',
  'ocado': 'Ocado',
  'iceland': 'Iceland',
  'boots': 'Boots',
  'holland & barrett': 'Holland & Barrett',
  'holland and barrett': 'Holland & Barrett',
  'amazon': 'Amazon',
  'amazon fresh': 'Amazon',
  // US retailers
  'walmart': 'Walmart',
  'whole foods': 'Whole Foods',
  'whole foods market': 'Whole Foods',
  "trader joe's": "Trader Joe's",
  'trader joes': "Trader Joe's",
  'kroger': 'Kroger',
  'target': 'Target',
  'costco': 'Costco',
}

export interface RetailerInfo {
  retailers: string[]
  purchasePlaces: string[]
  origin: string | null
  manufacturer: string | null
}

export function extractRetailerInfo(product: {
  stores?: string
  stores_tags?: string[]
  purchase_places?: string
  purchase_places_tags?: string[]
  origins?: string
  origins_tags?: string[]
  manufacturing_places?: string
  manufacturing_places_tags?: string[]
  brands?: string
}): RetailerInfo {
  const retailers = new Set<string>()

  // Parse stores field (comma-separated)
  if (product.stores) {
    product.stores.split(',').forEach(s => {
      const clean = s.trim().toLowerCase()
      if (clean && UK_RETAILER_MAP[clean]) {
        retailers.add(UK_RETAILER_MAP[clean])
      }
    })
  }

  // Parse stores_tags
  if (product.stores_tags) {
    product.stores_tags.forEach(tag => {
      const clean = tag.replace('en:', '').replace(/-/g, ' ').trim().toLowerCase()
      if (UK_RETAILER_MAP[clean]) {
        retailers.add(UK_RETAILER_MAP[clean])
      }
    })
  }

  // Infer retailer from brand name for own-brand products
  const brand = (product.brands || '').toLowerCase()
  if (brand.includes('tesco')) retailers.add('Tesco')
  if (brand.includes("sainsbury")) retailers.add("Sainsbury's")
  if (brand.includes('asda')) retailers.add('Asda')
  if (brand.includes('waitrose')) retailers.add('Waitrose')
  if (brand.includes('morrisons')) retailers.add('Morrisons')
  if (brand.includes('aldi') || brand.includes('bramwells') || brand.includes('harvest morn')) retailers.add('Aldi')
  if (brand.includes('lidl') || brand.includes('crownfield') || brand.includes('milbona')) retailers.add('Lidl')
  if (brand.includes('co-op') || brand.includes('coop')) retailers.add('Co-op')
  if (brand.includes('m&s') || brand.includes('marks')) retailers.add('M&S')

  // Purchase places
  const purchasePlaces: string[] = []
  if (product.purchase_places) {
    product.purchase_places.split(',').forEach(p => {
      const clean = p.trim()
      if (clean) purchasePlaces.push(clean)
    })
  }

  // Origin
  const origin = product.origins?.trim() || product.origins_tags?.[0]?.replace('en:', '') || null

  // Manufacturer
  const manufacturer = product.manufacturing_places?.trim() || null

  return {
    retailers: Array.from(retailers),
    purchasePlaces,
    origin,
    manufacturer,
  }
}
