import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { MARKETS, type Market } from '@/lib/market'

export async function GET(req: NextRequest) {
  // Verify admin secret
  const authHeader = req.headers.get('Authorization')
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || authHeader !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getServiceSupabase()

    const { data: allEntries } = await supabase
      .from('market_waitlist')
      .select('market')

    const marketCounts: Record<string, number> = {}
    let totalSignups = 0

    if (allEntries) {
      totalSignups = allEntries.length
      for (const entry of allEntries) {
        marketCounts[entry.market] = (marketCounts[entry.market] || 0) + 1
      }
    }

    const markets = Object.entries(marketCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([code, count]) => {
        const config = MARKETS[code as Market]
        return {
          market: code,
          name: config?.name || code,
          flag: config?.flag || '',
          count,
        }
      })

    const topMarket = markets.length > 0 ? markets[0].market : null

    return NextResponse.json({ markets, total_signups: totalSignups, top_market: topMarket })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
