import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { MARKETS, type Market } from '@/lib/market'

export async function POST(req: NextRequest) {
  try {
    const { email, market } = await req.json()

    if (!market || !(market in MARKETS)) {
      return NextResponse.json({ error: 'Invalid market' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Insert waitlist entry
    const { error: insertError } = await supabase
      .from('market_waitlist')
      .insert({ email: email || null, market })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    // Get count for this market
    const { count } = await supabase
      .from('market_waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('market', market)

    return NextResponse.json({ success: true, count: count || 0 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const market = req.nextUrl.searchParams.get('market')

    const supabase = getServiceSupabase()

    // Get count for the requested market
    let count = 0
    if (market && market in MARKETS) {
      const result = await supabase
        .from('market_waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('market', market)
      count = result.count || 0
    }

    // Get top 3 most requested markets
    const { data: allEntries } = await supabase
      .from('market_waitlist')
      .select('market')

    const marketCounts: Record<string, number> = {}
    if (allEntries) {
      for (const entry of allEntries) {
        marketCounts[entry.market] = (marketCounts[entry.market] || 0) + 1
      }
    }

    const topMarkets = Object.entries(marketCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([code, cnt]) => {
        const config = MARKETS[code as Market]
        return {
          market: code,
          count: cnt,
          flag: config?.flag || '',
          name: config?.name || code,
        }
      })

    return NextResponse.json({ count, topMarkets })
  } catch {
    return NextResponse.json({ count: 0, topMarkets: [] })
  }
}
