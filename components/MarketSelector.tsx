'use client'

import { useMarket } from '@/components/MarketProvider'
import { MARKETS, type Market } from '@/lib/market'

export function MarketSelectorTrigger({ onClick }: { onClick: () => void }) {
  const { config } = useMarket()

  return (
    <button
      onClick={onClick}
      className="p-2.5 rounded-xl glass-card"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      aria-label={`Current market: ${config.name}. Click to change.`}
    >
      <span className="text-base leading-none">{config.flag}</span>
    </button>
  )
}

export default function MarketSelector({ onClose }: { onClose: () => void }) {
  const { market: currentMarket, setMarket } = useMarket()

  const supportedMarkets = Object.values(MARKETS).filter(m => m.supported)
  const comingSoonMarkets = Object.values(MARKETS).filter(m => m.comingSoon)

  function handleSelect(market: Market) {
    setMarket(market)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Select your market"
        className="relative rounded-2xl p-6 animate-fadeUp glass-card mx-4"
        style={{
          width: 'calc(100% - 32px)',
          maxWidth: '400px',
          backgroundColor: '#13131a',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg"
          style={{ color: 'rgba(240,240,244,0.4)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-lg font-bold heading-display mb-1" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
          Choose your market
        </h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(240,240,244,0.4)' }}>
          This affects swap suggestions and regulatory info.
        </p>

        {/* Available now */}
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#00e5a0' }}>
          Available now
        </p>
        <div className="space-y-1 mb-5">
          {supportedMarkets.map((m) => (
            <button
              key={m.code}
              onClick={() => handleSelect(m.code)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-150 hover:bg-white/5"
              style={{
                backgroundColor: currentMarket === m.code ? 'rgba(0,229,160,0.08)' : 'transparent',
                border: currentMarket === m.code ? '1px solid rgba(0,229,160,0.15)' : '1px solid transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{m.flag}</span>
                <span className="text-sm font-medium" style={{ color: '#f0f0f4' }}>{m.name}</span>
              </div>
              {currentMarket === m.code && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Coming soon */}
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(240,240,244,0.5)' }}>
          Coming soon
        </p>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {comingSoonMarkets.map((m) => (
            <button
              key={m.code}
              onClick={() => handleSelect(m.code)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-150 hover:bg-white/5"
              style={{
                backgroundColor: currentMarket === m.code ? 'rgba(124,111,255,0.08)' : 'transparent',
                border: currentMarket === m.code ? '1px solid rgba(124,111,255,0.15)' : '1px solid transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{m.flag}</span>
                <span className="text-sm font-medium" style={{ color: '#f0f0f4' }}>{m.name}</span>
              </div>
              {currentMarket === m.code && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
