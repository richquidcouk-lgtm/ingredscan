import axios from 'axios'
import * as cheerio from 'cheerio'
import { createLogger } from '../utils/logger'
import { ProgressTracker, ImportLogger } from '../utils/progress'
import { processProduct } from '../utils/scoring'
import { batchUpsert } from '../utils/batchInsert'
import { RateLimiter } from '../utils/rateLimiter'
import type { RawProduct, ProcessedProduct, ImportOptions } from '../types/product'

const logger = createLogger('tesco')
const BASE_URL = 'https://www.tesco.com/groceries/en-GB'

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

const CATEGORIES = [
  'fresh-food', 'bakery', 'dairy-eggs-chilled', 'drinks',
  'frozen-food', 'meat-fish', 'snacks-sweets-chocolates', 'world-foods',
]

const SEARCH_TERMS = [
  'tesco finest', 'tesco organic', 'tesco free from',
  'tesco everyday value', 'tesco own brand',
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
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
        const retry = await axios.get(url, {
          headers: { 'User-Agent': getRandomUA() },
          timeout: 15000,
        })
        return retry.data
      } catch {
        logger.error({ url }, 'Retry failed — skipping')
        return null
      }
    }
    logger.error({ url, error: error.message }, 'Fetch failed')
    return null
  }
}

function parseSearchResults(html: string): Array<{ name: string; price: number | null; url: string }> {
  const $ = cheerio.load(html)
  const results: Array<{ name: string; price: number | null; url: string }> = []

  $('[data-auto="product-tile"]').each((_, el) => {
    const $el = $(el)
    const name = $el.find('h3, [data-auto="product-tile--title"]').text().trim()
    const priceText = $el.find('[data-auto="price-value"], .price-per-sellable-unit').text().trim()
    const link = $el.find('a').first().attr('href')

    if (name && link) {
      const price = parseFloat(priceText.replace('£', '').replace(',', '')) || null
      results.push({
        name,
        price,
        url: link.startsWith('http') ? link : `https://www.tesco.com${link}`,
      })
    }
  })

  return results
}

function parseProductPage(html: string, name: string, price: number | null): RawProduct | null {
  const $ = cheerio.load(html)

  // Try JSON-LD first
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

  // Fallback barcode extraction
  if (!barcode) {
    const dataBarcode = $('[data-barcode]').attr('data-barcode')
    if (dataBarcode) barcode = dataBarcode

    // Try extracting from URL or page content
    const eanMatch = $.html().match(/\b(\d{13})\b/)
    if (!barcode && eanMatch) barcode = eanMatch[1]
  }

  if (!barcode) return null

  // Ingredients
  const ingredientsEl = $('.ingredients-list, [data-auto="ingredients"]')
  if (ingredientsEl.length) {
    ingredients = ingredientsEl.text().replace(/ingredients:?/i, '').trim()
  }

  // Nutrition
  const nutrition: RawProduct['nutrition'] = {
    energy_100g: null, fat_100g: null, saturated_fat_100g: null,
    carbohydrates_100g: null, sugars_100g: null, fiber_100g: null,
    proteins_100g: null, salt_100g: null,
  }

  $('table tr, .nutrition-row').each((_, row) => {
    const cells = $(row).find('td, .nutrition-value')
    const label = $(row).find('th, .nutrition-label').text().toLowerCase().trim()
    const value = parseFloat(cells.first().text().replace(/[^0-9.]/g, '')) || null

    if (label.includes('energy') && label.includes('kcal')) nutrition.energy_100g = value
    else if (label.includes('fat') && !label.includes('saturate')) nutrition.fat_100g = value
    else if (label.includes('saturate')) nutrition.saturated_fat_100g = value
    else if (label.includes('carbohydrate')) nutrition.carbohydrates_100g = value
    else if (label.includes('sugar')) nutrition.sugars_100g = value
    else if (label.includes('fibre') || label.includes('fiber')) nutrition.fiber_100g = value
    else if (label.includes('protein')) nutrition.proteins_100g = value
    else if (label.includes('salt')) nutrition.salt_100g = value
  })

  return {
    barcode,
    name,
    brand: 'Tesco',
    ingredients,
    additives_tags: [],
    nova_group: null,
    nutriscore_grade: null,
    nutrition,
    image_url: $('img[data-auto="product-image"]').attr('src') || null,
    categories_tags: [],
    labels_tags: [],
    countries_tags: ['en:united-kingdom'],
    is_organic: name.toLowerCase().includes('organic'),
    import_source: 'tesco',
    retailer_availability: ['Tesco'],
    avg_price: price,
    country: 'UK',
  }
}

export async function importTesco(options: ImportOptions): Promise<void> {
  logger.info('Starting Tesco scraper')

  const importLog = new ImportLogger('tesco')
  await importLog.start()
  const rateLimiter = new RateLimiter(0.5) // 1 request per 2 seconds

  let processed = 0
  let imported = 0
  let failed = 0

  try {
    for (const term of SEARCH_TERMS) {
      if (options.limit > 0 && imported >= options.limit) break

      logger.info({ term }, 'Searching')
      const searchUrl = `${BASE_URL}/search?query=${encodeURIComponent(term)}&count=48`
      const html = await fetchPage(searchUrl, rateLimiter)
      if (!html) continue

      const products = parseSearchResults(html)
      logger.info({ term, count: products.length }, 'Products found')

      const batch: ProcessedProduct[] = []

      for (const product of products) {
        if (options.limit > 0 && imported + batch.length >= options.limit) break

        processed++
        const detailHtml = await fetchPage(product.url, rateLimiter)
        if (!detailHtml) {
          failed++
          continue
        }

        const raw = parseProductPage(detailHtml, product.name, product.price)
        if (!raw) {
          logger.debug({ name: product.name }, 'No barcode found — skipping')
          continue
        }

        batch.push(processProduct(raw))

        if (batch.length >= 50) {
          const result = await batchUpsert(batch, { dryRun: options.dryRun }, logger)
          imported += result.success
          failed += result.failed
          batch.length = 0
        }
      }

      if (batch.length > 0) {
        const result = await batchUpsert(batch, { dryRun: options.dryRun }, logger)
        imported += result.success
        failed += result.failed
      }

      await importLog.update(processed, imported, failed)
    }

    await importLog.finish('completed')
    logger.info({ processed, imported, failed }, 'Tesco import completed')
  } catch (error: any) {
    logger.error({ error: error.message }, 'Tesco import failed')
    await importLog.finish('failed')
    throw error
  }
}
