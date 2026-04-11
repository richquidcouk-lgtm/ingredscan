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
  // Traceability: preserved OFF originals + provenance of our computed scores.
  // `off_nova_group` is the raw NOVA from OFF (null if OFF had none), kept
  // verbatim for audit. `nova_source` says whether `nova_group` (the
  // IngredScan-displayed NOVA, stored as `nova_score` in the DB) came from
  // OFF directly or was inferred by lib/scoring.
  off_nova_group: number | null
  nova_source: 'off_direct' | 'inferred'
  quality_score_version: number
  quality_score_breakdown: Record<string, unknown>
  // Product type — 'food' (default) or 'cosmetic'. Cosmetics are scored via
  // lib/cosmeticScoring rather than the food Yuka formula.
  product_type?: 'food' | 'cosmetic'
  // Cosmetic-only fields, populated when product_type === 'cosmetic'.
  inci_ingredients?: unknown[] | null
  cosmetic_concerns?: string[] | null
  is_vegan?: boolean | null
  is_cruelty_free?: boolean | null
  is_natural?: boolean | null
  fragrance_free?: boolean | null
  alcohol_free?: boolean | null
  paraben_free?: boolean | null
  sulphate_free?: boolean | null
  silicone_free?: boolean | null
  ewg_score?: number | null
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
