import cosmeticDatabase from '@/data/cosmeticIngredients.json'
import type { CosmeticIngredientMatch } from './supabase'

export type OBFProduct = {
  code: string
  product_name: string
  product_name_en: string
  brands: string
  categories_tags: string[]
  ingredients_text: string
  ingredients_text_en: string
  ingredients: Array<{ id: string; text: string }>
  image_front_url: string
  labels_tags: string[]
  countries_tags: string[]
}

export type OBFResponse = {
  status: number
  product: OBFProduct
}

export async function fetchFromOpenBeautyFacts(
  barcode: string
): Promise<OBFProduct | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(
      `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'IngredScan/1.0 (ingredscan.com)',
        },
        signal: controller.signal,
        next: { revalidate: 86400 },
      }
    )
    clearTimeout(timeout)

    const data: OBFResponse = await res.json()
    if (data.status === 0 || !data.product) return null
    return data.product
  } catch {
    return null
  }
}

export async function searchBeautyProducts(query: string) {
  // Searches local Supabase (cosmetics imported from Open Beauty Facts) via
  // /api/search. The OBF live search APIs are unreliable.
  try {
    const res = await fetch(`/api/search?type=cosmetic&q=${encodeURIComponent(query)}`)
    if (!res.ok) {
      console.error(`[OBF search] HTTP ${res.status} for query "${query}"`)
      return { products: [], count: 0 }
    }
    return await res.json()
  } catch (err) {
    console.error(`[OBF search] failed for query "${query}":`, err)
    return { products: [], count: 0 }
  }
}

export function parseInciIngredients(ingredientsText: string): string[] {
  if (!ingredientsText) return []
  return ingredientsText
    .split(',')
    .map(i => i.trim().toUpperCase())
    .map(i => i.replace(/\(.*?\)/g, '').trim())
    .map(i => i.replace(/\[.*?\]/g, '').trim())
    .map(i => i.replace(/\d+(\.\d+)?%/g, '').trim())
    .filter(i => i.length > 0)
}

export function matchCosmeticIngredients(
  inciNames: string[]
): CosmeticIngredientMatch[] {
  return inciNames.map(name => {
    const match = cosmeticDatabase.find(
      (db: any) => db.inci_name.toUpperCase() === name.toUpperCase()
    )
    if (match) {
      return {
        inci_name: match.inci_name,
        common_name: match.common_name,
        function: match.function,
        risk_level: match.risk_level as 'low' | 'medium' | 'high',
        risk_score: match.risk_score,
        description: match.description,
        concerns: match.concerns,
        safe_for_pregnant: match.safe_for_pregnant,
        safe_for_children: match.safe_for_children,
        ewg_score: match.ewg_score,
      }
    }
    // Unknown ingredient — assume low risk
    return {
      inci_name: name,
      risk_level: 'low' as const,
      risk_score: 1,
    }
  })
}

export function detectCosmeticFlags(product: OBFProduct): {
  is_vegan: boolean
  is_cruelty_free: boolean
  is_natural: boolean
  fragrance_free: boolean
  alcohol_free: boolean
  paraben_free: boolean
  sulphate_free: boolean
  silicone_free: boolean
} {
  const labels = (product.labels_tags || []).map(l => l.toLowerCase())
  const ingredientsText = (
    product.ingredients_text_en || product.ingredients_text || ''
  ).toUpperCase()

  return {
    is_vegan: labels.some(l => l.includes('vegan')),
    is_cruelty_free: labels.some(
      l => l.includes('cruelty-free') || l.includes('not tested on animals')
    ),
    is_natural: labels.some(
      l => l.includes('natural') || l.includes('organic')
    ),
    fragrance_free:
      !ingredientsText.includes('PARFUM') &&
      !ingredientsText.includes('FRAGRANCE'),
    alcohol_free:
      !ingredientsText.includes('ALCOHOL DENAT') &&
      !ingredientsText.includes('ETHANOL') &&
      !ingredientsText.includes('ISOPROPYL ALCOHOL'),
    paraben_free: !ingredientsText.includes('PARABEN'),
    sulphate_free:
      !ingredientsText.includes('SODIUM LAURYL SULFATE') &&
      !ingredientsText.includes('SODIUM LAURETH SULFATE'),
    silicone_free:
      !ingredientsText.includes('DIMETHICONE') &&
      !ingredientsText.includes('CYCLOPENTASILOXANE') &&
      !ingredientsText.includes('CYCLOMETHICONE'),
  }
}
