import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()

  // Get most frequently scanned barcodes
  const { data: topScanned } = await supabase
    .from('scans')
    .select('barcode')
    .order('scanned_at', { ascending: false })
    .limit(10000)

  // Deduplicate
  const uniqueBarcodes = Array.from(new Set((topScanned || []).map((s: any) => s.barcode)))

  let updated = 0

  for (const barcode of uniqueBarcodes) {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { headers: { 'User-Agent': 'IngredScan/1.0 (ingredscan.com)' } }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.status === 1 && data.product) {
          await supabase
            .from('products')
            .update({ updated_at: new Date().toISOString() })
            .eq('barcode', barcode)
          updated++
        }
      }

      // Rate limit: 200ms between requests
      await new Promise((r) => setTimeout(r, 200))
    } catch {
      // Skip failed refreshes silently
    }
  }

  return NextResponse.json({
    updated,
    total: uniqueBarcodes.length,
    timestamp: new Date().toISOString(),
  })
}
