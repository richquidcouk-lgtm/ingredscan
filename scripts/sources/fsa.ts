import axios from 'axios'
import { createLogger } from '../utils/logger'
import { supabaseAdmin } from '../utils/supabaseAdmin'
import { ImportLogger } from '../utils/progress'
import { RateLimiter } from '../utils/rateLimiter'
import type { ImportOptions } from '../types/product'

const logger = createLogger('fsa')
const FSA_BASE = 'https://api.ratings.food.gov.uk'

interface FSAEstablishment {
  FHRSID: number
  BusinessName: string
  BusinessType: string
  RatingValue: string
  RatingDate: string
}

export async function importFSA(options: ImportOptions): Promise<void> {
  logger.info('Starting FSA enrichment')

  const importLog = new ImportLogger('fsa')
  await importLog.start()
  const rateLimiter = new RateLimiter(2) // 2 requests per second

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    // Get unique brands from our products table
    const { data: brands } = await supabaseAdmin
      .from('products')
      .select('brand')
      .not('brand', 'eq', '')
      .limit(options.limit > 0 ? options.limit : 10000)

    const uniqueBrands = [...new Set((brands || []).map((b: any) => b.brand))]
    logger.info({ count: uniqueBrands.length }, 'Unique brands to check against FSA')

    for (const brand of uniqueBrands) {
      if (!brand || brand.length < 3) continue

      await rateLimiter.throttle()
      processed++

      try {
        const response = await axios.get(`${FSA_BASE}/Establishments`, {
          params: {
            name: brand,
            pageSize: 5,
          },
          headers: {
            'x-api-version': '2',
            Accept: 'application/json',
          },
          timeout: 10000,
        })

        const establishments: FSAEstablishment[] = response.data?.establishments || []

        if (establishments.length > 0) {
          // Brand found in FSA database — mark products as FSA verified
          const bestRating = establishments.reduce((best, est) => {
            const rating = parseInt(est.RatingValue) || 0
            return rating > best ? rating : best
          }, 0)

          // Update data_source to include FSA verification
          const { error } = await supabaseAdmin
            .from('products')
            .update({
              data_source: 'Open Food Facts + UK FSA',
              confidence: bestRating >= 4 ? 98 : 95,
            })
            .ilike('brand', `%${brand}%`)

          if (error) {
            logger.warn({ brand, error: error.message }, 'Failed to update brand')
            failed++
          } else {
            enriched++
            logger.info({ brand, rating: bestRating, matches: establishments.length }, 'Brand verified')
          }
        }
      } catch (error: any) {
        logger.warn({ brand, error: error.message }, 'FSA lookup failed')
        failed++
      }

      if (processed % 100 === 0) {
        await importLog.update(processed, enriched, failed)
        logger.info({ processed, enriched, failed }, 'Progress')
      }
    }

    await importLog.finish('completed')
    logger.info({ processed, enriched, failed }, 'FSA enrichment completed')
  } catch (error: any) {
    logger.error({ error: error.message }, 'FSA enrichment failed')
    await importLog.finish('failed')
    throw error
  }
}
