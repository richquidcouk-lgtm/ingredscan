import { supabase } from './supabase'

export interface DynamicSwap {
  product_name: string
  retailer: string
  quality_score: number
  nova_score: number
  score_improvement: number
  price_difference: string
}

export async function getSwaps(
  barcode: string,
  qualityScore: number,
  categoryTags: string[],
  userRetailers: string[] = ['Tesco', "Sainsbury's", 'Asda', 'Waitrose']
): Promise<DynamicSwap[]> {
  const category = categoryTags?.[0]
  if (!category) return []

  const { data } = await supabase
    .from('products')
    .select('name, quality_score, nova_score, retailer_availability, avg_price, barcode')
    .contains('categories_tags', [category])
    .gt('quality_score', qualityScore)
    .overlaps('retailer_availability', userRetailers)
    .order('quality_score', { ascending: false })
    .limit(10)

  const alternatives = (data || []).filter((p: any) => p.barcode !== barcode)

  const swaps: DynamicSwap[] = []
  const usedRetailers = new Set<string>()

  for (const alt of alternatives) {
    const retailer = alt.retailer_availability?.[0]
    if (!retailer || usedRetailers.has(retailer)) continue

    swaps.push({
      product_name: alt.name,
      retailer,
      quality_score: alt.quality_score,
      nova_score: alt.nova_score,
      score_improvement: Math.round((alt.quality_score - qualityScore) * 10) / 10,
      price_difference: calculatePriceDiff(null, alt.avg_price),
    })
    usedRetailers.add(retailer)

    if (swaps.length >= 3) break
  }

  return swaps
}

function calculatePriceDiff(original: number | null, swap: number | null): string {
  if (!original || !swap) return 'Similar price'
  const diff = swap - original
  if (Math.abs(diff) < 0.05) return 'Same price'
  if (diff < 0) return `Save £${Math.abs(diff).toFixed(2)}`
  return `+£${diff.toFixed(2)}`
}
