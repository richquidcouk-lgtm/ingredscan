import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title')
  const category = searchParams.get('category')

  // Blog post OG image
  if (title) {
    return new ImageResponse(
      (
        <div style={{
          width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 80px',
          background: 'linear-gradient(135deg, #0b0b0f 0%, #13131a 100%)',
          fontFamily: 'sans-serif',
        }}>
          {category && (
            <div style={{ display: 'flex', marginBottom: '20px' }}>
              <span style={{
                background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.3)',
                borderRadius: '100px', padding: '6px 16px', color: '#22c77e', fontSize: '16px',
              }}>
                {category}
              </span>
            </div>
          )}
          <div style={{ fontSize: '44px', fontWeight: 'bold', color: '#f0f0f4', lineHeight: 1.2, marginBottom: '24px' }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0f0f4', display: 'flex' }}>
              Ingred<span style={{ color: '#22c77e' }}>Scan</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>ingredscan.com</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  // Default homepage OG image
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0b0f 0%, #13131a 100%)',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ fontSize: '52px', fontWeight: 'bold', color: '#f0f0f4', marginBottom: '16px', display: 'flex' }}>
          Ingred<span style={{ color: '#22c77e' }}>Scan</span>
        </div>
        <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px', textAlign: 'center' }}>
          Know what&apos;s really in your products
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['🎯 Dual Scoring', '🏪 Supermarket Swaps', '🔍 Transparent Data', '💄 Food & Cosmetics'].map(f => (
            <div key={f} style={{
              background: 'rgba(34,199,126,0.12)', border: '1px solid rgba(34,199,126,0.25)',
              borderRadius: '100px', padding: '10px 20px', color: '#22c77e', fontSize: '18px',
            }}>
              {f}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '48px', fontSize: '20px', color: 'rgba(255,255,255,0.35)' }}>
          Free · No paywall · ingredscan.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
