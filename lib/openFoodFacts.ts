export type OFFProduct = {
  code: string
  product_name: string
  brands: string
  nova_group: number
  nutriscore_grade: string
  ingredients_text: string
  ingredients_tags: string[]
  additives_tags: string[]
  categories_tags: string[]
  labels_tags: string[]
  nutriments: Record<string, number>
  image_front_url: string
  image_front_small_url: string
  countries_tags: string[]
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
    image_front_small_url: string
  }>
  count: number
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
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`,
      {
        headers: { 'User-Agent': 'IngredScan/1.0 (https://ingredscan.com)' },
      }
    )

    if (!response.ok) return { products: [], count: 0 }

    return await response.json()
  } catch {
    return { products: [], count: 0 }
  }
}

export function isUKProduct(product: OFFProduct): boolean {
  const countries = product.countries_tags || []
  return countries.some(c =>
    c.includes('united-kingdom') || c.includes('en:united-kingdom') || c.includes('uk')
  )
}
