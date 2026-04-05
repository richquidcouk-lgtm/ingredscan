export type SpecialCategory =
  | 'infant_formula'
  | 'medicine'
  | 'supplement'
  | null

export function detectSpecialCategory(product: any): SpecialCategory {
  const categories: string[] = product.categories_tags || product.category?.split(', ') || []
  const name = (
    product.product_name_en || product.product_name || product.name || ''
  ).toLowerCase()

  // --- INFANT FORMULA ---
  const infantFormulaCategories = [
    'en:baby-milks', 'en:infant-formula', 'en:follow-on-milks',
    'en:baby-formula', 'en:toddler-milks', 'en:first-infant-milks',
    'en:growing-up-milks', 'en:baby-foods',
  ]
  const infantFormulaKeywords = [
    'infant formula', 'baby milk', 'follow-on milk', 'follow on milk',
    'toddler milk', 'first milk', 'from birth',
    'aptamil', 'cow & gate', 'hipp organic', 'hipp combiotic',
    'kendamil', 'sma gold', 'sma pro', 'nutrilon',
    'neocate', 'nutramigen', 'similac', 'enfamil',
    'novalac', 'kabrita',
  ]

  if (
    infantFormulaCategories.some(c => categories.includes(c)) ||
    infantFormulaKeywords.some(k => name.includes(k))
  ) {
    return 'infant_formula'
  }

  // --- MEDICINES ---
  const medicineCategories = [
    'en:medications', 'en:medicines', 'en:prescription-drugs',
    'en:pharmaceuticals', 'en:foods-for-special-medical-purposes',
    'en:medical-devices',
  ]
  const medicineKeywords = [
    'prescription only', 'pharmacy only', 'p medicine', 'gsl medicine',
    'only available from', 'ask your pharmacist',
    'fortisip', 'ensure plus', 'fresubin', 'complan hospital',
    'elemental 028', 'modulen', 'neocate advance',
    'paracetamol', 'ibuprofen', 'aspirin', 'antihistamine',
    'calpol', 'nurofen', 'piriton', 'gaviscon',
    'rennie', 'pepto bismol', 'dioralyte',
  ]

  if (
    medicineCategories.some(c => categories.includes(c)) ||
    medicineKeywords.some(k => name.includes(k))
  ) {
    return 'medicine'
  }

  // --- SUPPLEMENTS ---
  const supplementCategories = [
    'en:dietary-supplements', 'en:food-supplements',
    'en:vitamins', 'en:minerals',
    'en:protein-supplements', 'en:sports-nutrition',
    'en:weight-management',
  ]
  const supplementKeywords = [
    'whey protein', 'creatine', 'bcaa', 'pre-workout',
    'multivitamin', 'fish oil', 'omega 3',
    'vitamin d', 'vitamin c supplement', 'zinc supplement',
    'collagen supplement', 'probiotic capsule',
    'protein powder', 'mass gainer', 'fat burner',
  ]

  if (
    supplementCategories.some(c => categories.includes(c)) ||
    supplementKeywords.some(k => name.includes(k))
  ) {
    return 'supplement'
  }

  return null
}
