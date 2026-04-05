export function detectProductCategory(
  offResponse: any,
  obfResponse: any
): 'food' | 'cosmetic' {
  const offFound = !!offResponse?.product?.product_name
  const obfFound = !!obfResponse?.product?.product_name

  // If found in BOTH databases, prefer Open Food Facts (larger, better curated)
  // Only classify as cosmetic if it's ONLY in OBF, or if OFF categories say cosmetic
  if (offFound && obfFound) {
    // Check if OFF categories indicate cosmetic
    const categories = offResponse?.product?.categories_tags || []
    if (categories.some((c: string) => COSMETIC_CATEGORIES.includes(c))) {
      return 'cosmetic'
    }
    // Found in both but OFF doesn't say cosmetic → trust OFF, it's food
    return 'food'
  }

  // Found only in Open Beauty Facts → cosmetic
  if (obfFound && !offFound) {
    return 'cosmetic'
  }

  // Found only in OFF — check if categories indicate cosmetic
  if (offFound) {
    const categories = offResponse?.product?.categories_tags || []
    if (categories.some((c: string) => COSMETIC_CATEGORIES.includes(c))) {
      return 'cosmetic'
    }
  }

  // Default to food
  return 'food'
}

const COSMETIC_CATEGORIES = [
  'en:cosmetics',
  'en:beauty',
  'en:skin-care',
  'en:hair-care',
  'en:makeup',
  'en:perfumes',
  'en:shampoos',
  'en:shower-gels',
  'en:face-creams',
  'en:body-lotions',
  'en:sunscreens',
  'en:deodorants',
  'en:toothpastes',
  'en:lip-care',
  'en:nail-polish',
]
