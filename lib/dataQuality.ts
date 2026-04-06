export interface DataQualityResult {
  isValid: boolean
  warnings: string[]
  flags: DataQualityFlag[]
}

export type DataQualityFlag =
  | 'missing_ingredients'
  | 'truncated_ingredients'
  | 'encoding_errors'
  | 'implausible_nutrients'
  | 'duplicate_ingredients'
  | 'unrecognised_tokens'
  | 'missing_nutrients'

const ENCODING_PATTERNS = /Ã©|Ã¨|Ã´|Ã¢|â€™|â€"|â€œ|â€|Ã§|Ã¼|Ã¶|Ã¤/

const TRUNCATION_PATTERNS = /\.\.\.$|…$|[a-z]$/

export function validateProductData(product: {
  ingredients_text?: string
  nutriments?: Record<string, number>
  product_name?: string
}): DataQualityResult {
  const warnings: string[] = []
  const flags: DataQualityFlag[] = []

  const ingredients = product.ingredients_text || ''
  const nutriments = product.nutriments || {}

  // Missing ingredients
  if (!ingredients || ingredients.trim().length < 5) {
    flags.push('missing_ingredients')
    warnings.push('Ingredient list is missing or incomplete')
  }

  // Truncated ingredients
  if (ingredients.length > 10 && TRUNCATION_PATTERNS.test(ingredients.trim())) {
    flags.push('truncated_ingredients')
    warnings.push('Ingredient list appears truncated')
  }

  // Encoding errors
  if (ENCODING_PATTERNS.test(ingredients) || ENCODING_PATTERNS.test(product.product_name || '')) {
    flags.push('encoding_errors')
    warnings.push('Text encoding issues detected')
  }

  // Implausible nutrient values
  const energy = nutriments['energy-kcal_100g'] || 0
  if (energy > 900) {
    flags.push('implausible_nutrients')
    warnings.push('Energy value exceeds 900kcal/100g — may be incorrect')
  }
  const fat = nutriments['fat_100g'] || 0
  const protein = nutriments['proteins_100g'] || 0
  const carbs = nutriments['carbohydrates_100g'] || 0
  if (fat + protein + carbs > 105) {
    flags.push('implausible_nutrients')
    warnings.push('Macronutrient values exceed 100g/100g — may be incorrect')
  }

  // Missing nutrients
  if (!nutriments['energy-kcal_100g'] && !nutriments['sugars_100g'] && !nutriments['fat_100g']) {
    flags.push('missing_nutrients')
    warnings.push('Nutritional data is missing')
  }

  // Duplicate ingredients
  if (ingredients) {
    const parts = ingredients.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const unique = new Set(parts)
    if (parts.length > 3 && unique.size < parts.length * 0.85) {
      flags.push('duplicate_ingredients')
      warnings.push('Duplicate ingredients detected')
    }
  }

  const isValid = flags.length === 0

  return { isValid, warnings, flags }
}

export function shouldShowScoreWithCaveat(flags: DataQualityFlag[]): boolean {
  const critical = ['missing_ingredients', 'implausible_nutrients']
  return flags.some(f => critical.includes(f))
}

export function getDataQualityMessage(flags: DataQualityFlag[]): string | null {
  if (flags.includes('missing_ingredients')) {
    return 'Data may be incomplete — ingredient list not available for this product.'
  }
  if (flags.includes('implausible_nutrients')) {
    return 'Data may be incomplete — some nutritional values appear implausible.'
  }
  if (flags.includes('truncated_ingredients')) {
    return 'Data may be incomplete — ingredient list appears truncated.'
  }
  if (flags.includes('encoding_errors')) {
    return 'Data may be incomplete — text encoding issues detected.'
  }
  if (flags.includes('missing_nutrients')) {
    return 'Nutritional data is not available for this product. Score is based on limited data.'
  }
  return null
}
