import { scoreProduct } from './scoring'

export type OFFProduct = {
  code: string
  product_name: string
  product_name_en: string
  brands: string
  nova_group: number
  nutriscore_grade: string
  ingredients_text: string
  ingredients_text_en: string
  ingredients_text_with_allergens_en: string
  ingredients_tags: string[]
  additives_tags: string[]
  categories_tags: string[]
  labels_tags: string[]
  nutriments: Record<string, number>
  image_front_url: string
  image_front_small_url: string
  countries_tags: string[]
  // Retailer & purchase data
  stores: string
  stores_tags: string[]
  purchase_places: string
  purchase_places_tags: string[]
  origins: string
  origins_tags: string[]
  manufacturing_places: string
  manufacturing_places_tags: string[]
}

export type OFFResponse = {
  status: number
  product: OFFProduct
}

export type OFFSearchResult = {
  products: Array<{
    code: string
    product_name: string
    brands: string
    nova_group: number
    nutriscore_grade: string
    quality_score?: number | null
    image_front_small_url: string
  }>
  count: number
}

export type ValidatedProduct = {
  product: OFFProduct
  nova_score: number
  quality_score: number
  quality_breakdown: import('@/lib/scoring').QualityScoreBreakdown
  confidence: number
  warning: string | null
  overrides_applied: string[]
}

const FRESH_PRODUCE_WORDS = [
  'orange', 'oranges', 'apple', 'apples', 'banana', 'bananas',
  'carrot', 'carrots', 'broccoli', 'spinach', 'tomato', 'tomatoes',
  'potato', 'potatoes', 'onion', 'onions', 'pepper', 'peppers',
  'cucumber', 'lettuce', 'celery', 'avocado', 'mango', 'mangoes',
  'pear', 'pears', 'grape', 'grapes', 'strawberry', 'strawberries',
  'blueberry', 'blueberries', 'raspberry', 'raspberries',
  'lemon', 'lemons', 'lime', 'limes', 'melon', 'watermelon',
  'pineapple', 'kiwi', 'peach', 'peaches', 'plum', 'plums',
  'cherry', 'cherries', 'mushroom', 'mushrooms', 'garlic',
  'ginger', 'beetroot', 'courgette', 'aubergine', 'asparagus',
  'sweetcorn', 'cabbage', 'cauliflower', 'peas', 'beans',
  'chicken breast', 'salmon fillet', 'cod fillet', 'whole milk',
  'free range eggs', 'plain yoghurt', 'brown rice', 'porridge oats',
]

const FRESH_PRODUCE_CATEGORIES = [
  'en:fresh-fruits', 'en:fruits', 'en:fresh-vegetables', 'en:vegetables',
  'en:fresh-produce', 'en:whole-foods', 'en:eggs', 'en:fresh-meat',
  'en:fish', 'en:fresh-fish', 'en:dairy', 'en:plain-yogurts',
  'en:butters', 'en:fresh-bread', 'en:nuts', 'en:seeds',
  'en:dried-fruits', 'en:legumes', 'en:cereals', 'en:rice', 'en:pasta',
]

function isFreshProduceByName(name: string): boolean {
  const lower = name.toLowerCase()
  return FRESH_PRODUCE_WORDS.some(word => {
    // Match whole word or at start of name
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lower)
  })
}

function isFreshProduceByCategory(categories: string[]): boolean {
  return categories.some(cat =>
    FRESH_PRODUCE_CATEGORIES.some(fresh => cat.toLowerCase() === fresh.toLowerCase())
  )
}

export function validateProduct(product: OFFProduct): ValidatedProduct {
  const overrides: string[] = []
  const name = product.product_name || ''
  const categories = product.categories_tags || []

  // Score the product using the improved scoring logic
  const scoring = scoreProduct({
    nova_group: product.nova_group,
    nutriscore_grade: product.nutriscore_grade,
    ingredients_tags: product.ingredients_tags,
    additives_tags: product.additives_tags,
    categories_tags: categories,
    labels_tags: product.labels_tags,
    nutriments: product.nutriments,
    ingredients_text: product.ingredients_text,
  })

  const { quality_breakdown } = scoring
  let { nova_score, quality_score, confidence, warning } = scoring

  // Override 1: Name suggests fresh produce but NOVA is 4
  if (isFreshProduceByName(name) && nova_score === 4) {
    const originalNova = nova_score
    // Recalculate from categories
    if (isFreshProduceByCategory(categories)) {
      nova_score = 1
      quality_score = Math.max(quality_score, 8.0)
      overrides.push(`NOVA override applied: "${name}" ${originalNova} → ${nova_score} (fresh produce by name+category)`)
    } else {
      // Name matches but category doesn't — flag for review, set to null-equivalent
      nova_score = 3 // Conservative fallback instead of 4
      confidence = Math.min(confidence, 65)
      warning = 'Score estimated — this product may be miscategorised'
      overrides.push(`NOVA override applied: "${name}" ${originalNova} → ${nova_score} (name suggests fresh, needs review)`)
    }
  }

  // Override 2: Quality score too low for fresh produce
  if (isFreshProduceByCategory(categories) && quality_score < 7.5) {
    const originalScore = quality_score
    quality_score = 7.5
    overrides.push(`Quality override applied: "${name}" ${originalScore} → ${quality_score} (fresh produce minimum)`)
  }

  // Log all overrides
  for (const override of overrides) {
    console.log(`[IngredScan] ${override}`)
  }

  return {
    product,
    nova_score,
    quality_score,
    quality_breakdown,
    confidence,
    warning,
    overrides_applied: overrides,
  }
}

export async function fetchProduct(barcode: string): Promise<OFFProduct | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        headers: { 'User-Agent': 'IngredScan/1.0 (https://ingredscan.com)' },
        next: { revalidate: 86400 },
      }
    )

    if (!response.ok) return null

    const data: OFFResponse = await response.json()

    if (data.status !== 1 || !data.product) return null

    return data.product
  } catch {
    return null
  }
}

export async function searchProducts(query: string): Promise<OFFSearchResult> {
  // Searches local Supabase (165k UK products from Open Food Facts dump)
  // via /api/search. The OFF live search APIs (cgi/search.pl, /api/v2/search)
  // are both frequently down so we don't depend on them anymore.
  try {
    const response = await fetch(`/api/search?type=food&q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      console.error(`[search] HTTP ${response.status} for query "${query}"`)
      return { products: [], count: 0 }
    }
    return await response.json()
  } catch (err) {
    console.error(`[search] failed for query "${query}":`, err)
    return { products: [], count: 0 }
  }
}

export function isUKProduct(product: OFFProduct): boolean {
  const countries = product.countries_tags || []
  return countries.some(c =>
    c.includes('united-kingdom') || c.includes('en:united-kingdom') || c.includes('uk')
  )
}

const UK_KNOWN_BRANDS = [
  'Aptamil', 'Cow & Gate', 'HiPP Organic', 'Kendamil', 'SMA',
  'Heinz', 'Tesco', 'Sainsburys', "Sainsbury's", 'Asda', 'Waitrose',
  'Warburtons', 'Hovis', "Kellogg's", 'Quaker', 'Cadbury',
  'Walkers', 'McVities', "McVitie's", 'Innocent', 'Alpro', 'Oatly',
  'Muller', 'Müller', 'Yeo Valley', 'Anchor', 'Cathedral City',
  'Lurpak', 'Flora', "Hellmann's", "Colman's", 'Bisto', 'Oxo',
  'Lea & Perrins', 'Hartleys', 'Robinsons', 'Ribena',
  'Lucozade', 'Tropicana', 'Copella', 'Pringles', 'Doritos',
  'Kettle', 'Tyrells', 'Popchips', 'Graze', 'Nature Valley',
  'Nakd', 'Eat Natural', 'Alpen', 'Weetabix', 'Shreddies',
  'Cheerios', 'Special K', 'Cornflakes', 'Batchelors', 'Pot Noodle',
  'Nissin', 'Dolmio', 'Loyd Grossman', 'Ragu', 'Philadelphia',
  'Laughing Cow', 'Dairylea', 'Babybel', 'Cravendale', 'Arla',
  'Yoplait', 'Danone', 'Activia', 'Actimel', 'Benecol',
  'Flora ProActiv', 'Nescafe', 'Kenco', 'Taylors',
  'PG Tips', 'Yorkshire Tea', 'Clipper', 'Pukka', 'Twinings',
  'Tetley', 'Horlicks', 'Ovaltine',
]

export function getBrand(product: any): string {
  if (product.brands) {
    return product.brands.split(',')[0].trim()
  }
  if (product.brand_owner) {
    return product.brand_owner
  }
  const name = product.product_name_en || product.product_name || ''
  for (const brand of UK_KNOWN_BRANDS) {
    if (name.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand
    }
  }
  if (product.manufacturing_places) {
    return product.manufacturing_places.split(',')[0].trim()
  }
  return 'Unknown Brand'
}
