import type { CosmeticIngredientMatch } from './supabase'

export interface CosmeticProduct {
  is_vegan?: boolean
  is_cruelty_free?: boolean
  fragrance_free?: boolean
  paraben_free?: boolean
  alcohol_free?: boolean
  sulphate_free?: boolean
  silicone_free?: boolean
  is_natural?: boolean
}

export interface CosmeticScore {
  overallScore: number
  safetyScore: number
  transparencyScore: number
  label: string
  concerns: string[]
  highlights: string[]
  flags: string[]
}

const FORMALDEHYDE_RELEASERS = [
  'DMDM HYDANTOIN',
  'QUATERNIUM-15',
  'IMIDAZOLIDINYL UREA',
  'DIAZOLIDINYL UREA',
  'BRONOPOL',
]

export function calculateCosmeticScore(
  product: CosmeticProduct,
  ingredients: CosmeticIngredientMatch[]
): CosmeticScore {
  let score = 10
  const concerns: string[] = []
  const highlights: string[] = []
  const flags: string[] = []

  // 1. HIGH RISK INGREDIENTS — major deductions
  const highRiskFound = ingredients.filter(i => i.risk_level === 'high')
  score -= highRiskFound.length * 2
  highRiskFound.forEach(i => {
    concerns.push(i.common_name || i.inci_name)
    flags.push(`Contains ${i.common_name || i.inci_name}`)
  })

  // 2. MEDIUM RISK INGREDIENTS — moderate deductions
  const mediumRiskFound = ingredients.filter(i => i.risk_level === 'medium')
  score -= mediumRiskFound.length * 0.5

  // 3. FRAGRANCE — deduct if present
  const hasFragrance = ingredients.some(
    i => i.inci_name === 'PARFUM' || i.inci_name === 'FRAGRANCE'
  )
  if (hasFragrance) {
    score -= 0.5
    flags.push('Contains fragrance (undisclosed chemicals)')
  }

  // 4. FORMALDEHYDE RELEASERS
  const hasReleaser = ingredients.some(i =>
    FORMALDEHYDE_RELEASERS.includes(i.inci_name)
  )
  if (hasReleaser) {
    score -= 2
    flags.push('Contains formaldehyde-releasing preservative')
  }

  // 5. PARABENS
  const parabens = ingredients.filter(i => i.inci_name.includes('PARABEN'))
  if (parabens.length > 0) {
    score -= parabens.length * 0.5
    flags.push('Contains parabens')
  }

  // 6. POSITIVE SIGNALS — add back points
  if (product.is_vegan) {
    highlights.push('Vegan certified')
    score += 0.3
  }
  if (product.is_cruelty_free) {
    highlights.push('Cruelty-free')
    score += 0.3
  }
  if (product.fragrance_free) {
    highlights.push('Fragrance-free')
    score += 0.3
  }
  if (product.paraben_free) {
    highlights.push('Paraben-free')
    score += 0.2
  }

  // 7. INGREDIENT TRANSPARENCY
  const ingredientCount = ingredients.length
  if (ingredientCount > 10) score += 0.2
  if (ingredientCount === 0) score -= 1

  // 8. Floor and ceiling
  score = Math.max(0, Math.min(10, score))
  score = Math.round(score * 10) / 10

  // 9. Labels
  const label =
    score >= 8 ? 'Clean' :
    score >= 6 ? 'Generally Safe' :
    score >= 4 ? 'Use with Caution' :
    'High Concern'

  return {
    overallScore: score,
    safetyScore: score,
    transparencyScore: ingredientCount > 5 ? 8 : 5,
    label,
    concerns,
    highlights,
    flags,
  }
}

export function getCosmeticScoreColor(score: number): string {
  if (score >= 8) return '#22c77e'   // green — Clean
  if (score >= 6) return '#f5a623'   // amber — Generally Safe
  if (score >= 4) return '#ff8c42'   // orange — Use with Caution
  return '#ff5a5a'                    // red — High Concern
}

export function getCosmeticScoreLabel(score: number): string {
  if (score >= 8) return 'Clean'
  if (score >= 6) return 'Generally Safe'
  if (score >= 4) return 'Use with Caution'
  return 'High Concern'
}

export function getConcernLevel(ingredients: CosmeticIngredientMatch[]): {
  level: 'low' | 'medium' | 'high'
  color: string
  emoji: string
  text: string
} {
  const highCount = ingredients.filter(i => i.risk_level === 'high').length
  const mediumCount = ingredients.filter(i => i.risk_level === 'medium').length

  if (highCount >= 2 || (highCount >= 1 && mediumCount >= 3)) {
    return { level: 'high', color: '#ff5a5a', emoji: '🔴', text: 'High Concern' }
  }
  if (highCount >= 1 || mediumCount >= 2) {
    return { level: 'medium', color: '#f5a623', emoji: '🟡', text: 'Some Concerns' }
  }
  return { level: 'low', color: '#22c77e', emoji: '🟢', text: 'Minimal Concerns' }
}
