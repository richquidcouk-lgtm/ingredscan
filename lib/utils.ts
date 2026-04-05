export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getCategoryEmoji(category: string): string {
  const c = category.toLowerCase()
  // Cosmetic categories
  if (c.includes('cosmetic') || c.includes('beauty') || c.includes('makeup')) return '💄'
  if (c.includes('skin-care') || c.includes('moisturis') || c.includes('face-cream') || c.includes('body-lotion')) return '🧴'
  if (c.includes('hair-care') || c.includes('shampoo') || c.includes('conditioner')) return '🧴'
  if (c.includes('sunscreen') || c.includes('sun-care')) return '☀️'
  if (c.includes('perfume') || c.includes('fragrance')) return '🌸'
  if (c.includes('nail') || c.includes('nail-polish')) return '💅'
  if (c.includes('deodorant')) return '🧼'
  if (c.includes('toothpaste') || c.includes('oral-care')) return '🪥'
  // Food categories
  if (c.includes('beverage') || c.includes('drink')) return '🥤'
  if (c.includes('dairy') || c.includes('milk') || c.includes('yoghurt')) return '🥛'
  if (c.includes('bread') || c.includes('baker')) return '🍞'
  if (c.includes('cereal') || c.includes('breakfast')) return '🥣'
  if (c.includes('chocolate') || c.includes('candy') || c.includes('sweet')) return '🍫'
  if (c.includes('crisp') || c.includes('snack') || c.includes('chip')) return '🥨'
  if (c.includes('meat') || c.includes('sausage') || c.includes('ham')) return '🥩'
  if (c.includes('fruit')) return '🍎'
  if (c.includes('vegetable') || c.includes('salad')) return '🥬'
  if (c.includes('sauce') || c.includes('ketchup') || c.includes('condiment')) return '🫙'
  if (c.includes('pasta') || c.includes('noodle')) return '🍝'
  if (c.includes('fish') || c.includes('seafood')) return '🐟'
  if (c.includes('frozen') || c.includes('ice cream')) return '🧊'
  if (c.includes('ready meal') || c.includes('prepared')) return '🍱'
  return '🛒'
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const SCAN_COUNT_KEY = 'ingredscan_anon_scans'

export function getAnonScanCount(): number {
  if (typeof window === 'undefined') return 0
  const data = localStorage.getItem(SCAN_COUNT_KEY)
  if (!data) return 0
  const parsed = JSON.parse(data)
  const today = new Date().toISOString().split('T')[0]
  if (parsed.date !== today) return 0
  return parsed.count
}

export function incrementAnonScanCount(): number {
  const today = new Date().toISOString().split('T')[0]
  const current = getAnonScanCount()
  const newCount = current + 1
  localStorage.setItem(SCAN_COUNT_KEY, JSON.stringify({ date: today, count: newCount }))
  return newCount
}

export function canScanAnon(): boolean {
  return getAnonScanCount() < 3
}
