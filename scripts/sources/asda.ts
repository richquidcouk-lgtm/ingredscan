import axios from 'axios'
import * as cheerio from 'cheerio'
import { createLogger } from '../utils/logger'
import { ImportLogger } from '../utils/progress'
import { processProduct } from '../utils/scoring'
import { batchUpsert } from '../utils/batchInsert'
import { RateLimiter } from '../utils/rateLimiter'
import type { RawProduct, ProcessedProduct, ImportOptions } from '../types/product'

const logger = createLogger('asda')
const BASE_URL = 'https://groceries.asda.com'

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
]

const SEARCH_TERMS = [
  'asda extra special', 'asda smart price',
  'asda organic', 'asda free from',
  'asda own brand', 'just essentials',
]

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function fetchPage(url: string, rateLimiter: RateLimiter): Promise<string | null> {
  await rateLimiter.throttle()
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUA(),
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      timeout: 15000,
    })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 429) {
      logger.warn({ url, status: error.response?.status }, 'Rate limited — waiting 60s')
      await new Promise((r) => setTimeout(r, 60000))
      try {
        return (await axios.get(url, { headers: { 'User-Agent': getRandomUA() }, timeout: 15000 })).data
      } catch { return null }
    }
    logger.error({ url, error: error.message }, 'Fetch failed')
    return null
  }
}

function parseSearchPage(html: string): Array<{ name: string; price: number | null; url: string }> {
  const $ = cheerio.load(html)
  const results: Array<{ name: string; price: number | null; url: string }> = []

  // Try JSON-LD first
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '')
      if (data['@type'] === 'ItemList' && data.itemListElement) {
        for (const item of data.itemListElement) {
          if (item.item?.name && item.item?.url) {
            results.push({
              name: item.item.name,
              price: item.item.offers?.price ? parseFloat(item.item.offers.price) : null,
              url: item.item.url,
            })
          }
        }
      }
    } catch {}
  })

  // Fallback to HTML parsing
  if (results.length === 0) {
    $('[data-auto-id="productTile"], .co-product').each((_, el) => {
      const $el = $(el)
      const name = $el.find('h3, .co-product__title').text().trim()
      const priceText = $el.find('.co-product__price, [data-auto-id="productPrice"]').text().trim()
      const link = $el.find('a').first().attr('href')

      if (name && link) {
        results.push({
          name,
          price: parseFloat(priceText.replace('£', '')) || null,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
        })
      }
    })
  }

  return results
}

function parseProductPage(html: string, name: string, price: number | null): RawProduct | null {
  const $ = cheerio.load(html)
  let barcode: string | null = null
  let ingredients = ''

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '')
      if (data['@type'] === 'Product') {
        barcode = data.gtin13 || data.gtin || data.sku || null
      }
    } catch {}
  })

  if (!barcode) {
    const eanMatch = $.html().match(/\b(\d{13})\b/)
    if (eanMatch) barcode = eanMatch[1]
  }

  if (!barcode) return null

  const ingredientsEl = $('.pdp-description-reviews__ingredients, .ingredients')
  if (ingredientsEl.length) {
    ingredients = ingredientsEl.text().replace(/ingredients:?/i, '').trim()
  }

  const nutrition: RawProduct['nutrition'] = {
    energy_100g: null, fat_100g: null, saturated_fat_100g: null,
    carbohydrates_100g: null, sugars_100g: null, fiber_100g: null,
    proteins_100g: null, salt_100g: null,
  }

  return {
    barcode, name, brand: 'Asda', ingredients,
    additives_tags: [], nova_group: null, nutriscore_grade: null,
    nutrition, image_url: $('img.asda-image, .pdp-main-image img').attr('src') || null,
    categories_tags: [], labels_tags: [],
    countries_tags: ['en:united-kingdom'],
    is_organic: name.toLowerCase().includes('organic'),
    import_source: 'asda', retailer_availability: ['Asda'],
    avg_price: price, country: 'UK',
  }
}

export async function importAsda(options: ImportOptions): Promise<void> {
  logger.info('Starting Asda scraper')
  const importLog = new ImportLogger('asda')
  await importLog.start()
  const rateLimiter = new RateLimiter(0.5)

  let processed = 0, imported = 0, failed = 0

  try {
    for (const term of SEARCH_TERMS) {
      if (options.limit > 0 && imported >= options.limit) break

      logger.info({ term }, 'Searching')
      const searchUrl = `${BASE_URL}/search/${encodeURIComponent(term)}`
      const html = await fetchPage(searchUrl, rateLimiter)
      if (!html) continue

      const products = parseSearchPage(html)
      logger.info({ term, count: products.length }, 'Products found')

      const batch: ProcessedProduct[] = []

      for (const product of products) {
        if (options.limit > 0 && imported + batch.length >= options.limit) break
        processed++

        const detailHtml = await fetchPage(product.url, rateLimiter)
        if (!detailHtml) { failed++; continue }

        const raw = parseProductPage(detailHtml, product.name, product.price)
        if (!raw) continue

        batch.push(processProduct(raw))

        if (batch.length >= 50) {
          const result = await batchUpsert(batch, { dryRun: options.dryRun }, logger)
          imported += result.success; failed += result.failed
          batch.length = 0
        }
      }

      if (batch.length > 0) {
        const result = await batchUpsert(batch, { dryRun: options.dryRun }, logger)
        imported += result.success; failed += result.failed
      }

      await importLog.update(processed, imported, failed)
    }

    await importLog.finish('completed')
    logger.info({ processed, imported, failed }, 'Asda import completed')
  } catch (error: any) {
    logger.error({ error: error.message }, 'Asda import failed')
    await importLog.finish('failed')
    throw error
  }
}
