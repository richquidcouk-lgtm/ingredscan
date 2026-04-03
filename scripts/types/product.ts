export interface RawProduct {
  barcode: string
  name: string
  brand: string
  ingredients: string
  additives_tags: string[]
  nova_group: number | null
  nutriscore_grade: string | null
  nutrition: {
    energy_100g: number | null
    fat_100g: number | null
    saturated_fat_100g: number | null
    carbohydrates_100g: number | null
    sugars_100g: number | null
    fiber_100g: number | null
    proteins_100g: number | null
    salt_100g: number | null
  }
  image_url: string | null
  categories_tags: string[]
  labels_tags: string[]
  countries_tags: string[]
  is_organic: boolean
  import_source: string
  retailer_availability: string[]
  avg_price: number | null
  country: string
}

export interface ProcessedProduct extends RawProduct {
  quality_score: number
  data_source: string
  confidence: number
  last_imported_at: string
}

export interface ImportOptions {
  source: string
  limit: number
  resume: boolean
  dryRun: boolean
}

export interface ImportResult {
  success: number
  failed: number
  skipped: number
}

export interface Swap {
  product_name: string
  retailer: string
  quality_score: number
  nova_score: number
  score_improvement: number
  price_difference: string
}

// Source priority — higher number wins
export const SOURCE_PRIORITY: Record<string, number> = {
  tesco: 10,
  sainsburys: 10,
  asda: 10,
  waitrose: 10,
  openfoodfacts: 5,
  fsa: 4,
  usda: 3,
}
