'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Market, type MarketConfig, detectMarket, setMarketPreference, getMarketConfig } from '@/lib/market'

interface MarketContextValue {
  market: Market
  config: MarketConfig
  setMarket: (market: Market) => void
  isLoading: boolean
}

const MarketContext = createContext<MarketContextValue | undefined>(undefined)

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarketState] = useState<Market>('uk')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    detectMarket().then((detected) => {
      setMarketState(detected)
      setIsLoading(false)
    })
  }, [])

  const setMarket = (newMarket: Market) => {
    setMarketState(newMarket)
    setMarketPreference(newMarket)
  }

  const config = getMarketConfig(market)

  return (
    <MarketContext.Provider value={{ market, config, setMarket, isLoading }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket(): MarketContextValue {
  const context = useContext(MarketContext)
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider')
  }
  return context
}
