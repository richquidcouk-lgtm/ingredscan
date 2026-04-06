// UK FSA 14 major allergens
export const UK_ALLERGENS = [
  { id: 'celery', label: 'Celery', keywords: ['celery', 'celeriac'] },
  { id: 'cereals', label: 'Cereals containing gluten', keywords: ['wheat', 'rye', 'barley', 'oats', 'spelt', 'kamut', 'gluten'] },
  { id: 'crustaceans', label: 'Crustaceans', keywords: ['crab', 'lobster', 'prawn', 'shrimp', 'crayfish', 'crustacean'] },
  { id: 'eggs', label: 'Eggs', keywords: ['egg', 'eggs', 'albumin', 'globulin', 'lysozyme', 'mayonnaise'] },
  { id: 'fish', label: 'Fish', keywords: ['fish', 'cod', 'salmon', 'tuna', 'anchovy', 'anchovies', 'sardine', 'mackerel', 'haddock'] },
  { id: 'lupin', label: 'Lupin', keywords: ['lupin', 'lupine'] },
  { id: 'milk', label: 'Milk', keywords: ['milk', 'cream', 'butter', 'cheese', 'yoghurt', 'yogurt', 'whey', 'casein', 'lactose', 'ghee'] },
  { id: 'molluscs', label: 'Molluscs', keywords: ['mussel', 'oyster', 'squid', 'snail', 'octopus', 'clam', 'scallop', 'mollusc'] },
  { id: 'mustard', label: 'Mustard', keywords: ['mustard'] },
  { id: 'nuts', label: 'Tree nuts', keywords: ['almond', 'hazelnut', 'walnut', 'cashew', 'pecan', 'pistachio', 'macadamia', 'brazil nut', 'nut'] },
  { id: 'peanuts', label: 'Peanuts', keywords: ['peanut', 'groundnut', 'arachis'] },
  { id: 'sesame', label: 'Sesame', keywords: ['sesame', 'tahini'] },
  { id: 'soya', label: 'Soya', keywords: ['soya', 'soy', 'soybean', 'tofu', 'edamame', 'lecithin'] },
  { id: 'sulphites', label: 'Sulphur dioxide / sulphites', keywords: ['sulphite', 'sulfite', 'sulphur dioxide', 'sulfur dioxide', 'metabisulphite'] },
]

const ALLERGEN_STORAGE_KEY = 'ingredscan_allergens'

export function getUserAllergens(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(ALLERGEN_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function setUserAllergens(allergenIds: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ALLERGEN_STORAGE_KEY, JSON.stringify(allergenIds))
}

export function detectAllergens(ingredientsText: string, userAllergenIds: string[]): string[] {
  if (!ingredientsText || userAllergenIds.length === 0) return []
  const text = ingredientsText.toLowerCase()
  const detected: string[] = []

  for (const allergen of UK_ALLERGENS) {
    if (!userAllergenIds.includes(allergen.id)) continue
    if (allergen.keywords.some(kw => text.includes(kw))) {
      detected.push(allergen.label)
    }
  }

  return detected
}
