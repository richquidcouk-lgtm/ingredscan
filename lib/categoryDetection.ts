export function detectProductCategory(
  offResponse: any,
  obfResponse: any
): 'food' | 'cosmetic' {
  // If found in Open Beauty Facts → cosmetic
  if (obfResponse?.product?.product_name) {
    return 'cosmetic'
  }

  // If categories contain cosmetic terms → cosmetic
  const categories = offResponse?.product?.categories_tags || []
  const cosmeticCategories = [
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

  if (categories.some((c: string) => cosmeticCategories.includes(c))) {
    return 'cosmetic'
  }

  // Default to food
  return 'food'
}
