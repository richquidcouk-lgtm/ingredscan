const CACHE_KEY = 'ingredscan_offline_products'
const MAX_CACHED = 200

export function cacheProductOffline(product: any) {
  if (typeof window === 'undefined') return
  try {
    const cached = getOfflineProducts()
    // Remove existing entry for this barcode
    const filtered = cached.filter((p: any) => p.barcode !== product.barcode)
    // Add to front
    filtered.unshift({ ...product, cached_at: Date.now() })
    // Trim to max
    const trimmed = filtered.slice(0, MAX_CACHED)
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed))
  } catch {}
}

export function getOfflineProduct(barcode: string): any | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = getOfflineProducts()
    return cached.find((p: any) => p.barcode === barcode) || null
  } catch {
    return null
  }
}

export function getOfflineProducts(): any[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
  } catch {
    return []
  }
}
