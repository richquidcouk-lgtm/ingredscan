import axios from 'axios'
import * as cheerio from 'cheerio'
import { createLogger } from '../utils/logger'
import { ImportLogger } from '../utils/progress'
import { processProduct } from '../utils/scoring'
import { batchUpsert } from '../utils/batchInsert'
import { RateLimiter } from '../utils/rateLimiter'
import type { RawProduct, ProcessedProduct, ImportOptions } from '../types/product'

const logger = createLogger('sainsburys')
const BASE_URL = 'https://www.sainsburys.co.uk'

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

const SEARCH_TERMS = [
  'by sainsburys', 'taste the difference',
  'sainsburys organic', 'sainsburys free from',
  'sainsburys basics', 'so organic',
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
      } catch {
        return null
      }
    }
    logger.error({ url, error: error.message }, 'Fetch failed')
    return null
  }
}

function parseSearchPage(html: string): Array<{ name: string; price: number | null; url: string }> {
  const $ = cheerio.load(html)
  const results: Array<{ name: string; price: number | null; url: string }> = []

  $('.product-grid .pt-grid-item, [data-test-id="product-tile"]').each((_, el) => {
    const $el = $(el)
    const name = $el.find('.pt__info__description, h2, h3').text().trim()
    const priceText = $el.find('.pt__cost__retail-price, .price').text().trim()
    const link = $el.find('a').first().attr('href')

    if (name && link) {
      results.push({
        name,
        price: parseFloat(priceText.replace('£', '').replace(',', '')) || null,
        url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
      })
    }
  })

  return results
}

function parseProductPage(html: string, name: string, price: number | null): RawProduct | null {
  const $ = cheerio.load(html)

  let barcode: string | null = null
  let ingredients = ''

  // JSON-LD
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

  const ingredientsEl = $('.productIngredients, .ingredients, [data-test-id="ingredients"]')
  if (ingredientsEl.length) {
    ingredients = ingredientsEl.text().replace(/ingredients:?/i, '').trim()
  }

  const nutrition: RawProduct['nutrition'] = {
    energy_100g: null, fat_100g: null, saturated_fat_100g: null,
    carbohydrates_100g: null, sugars_100g: null, fiber_100g: null,
    proteins_100g: null, salt_100g: null,
  }

  $('.nutritionTable tr, .nutrition-row').each((_, row) => {
    const label = $(row).find('th, td:first-child').text().toLowerCase().trim()
    const value = parseFloat($(row).find('td').eq(1).text().replace(/[^0-9.]/g, '')) || null

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
    barcode, name, brand: "Sainsbury's", ingredients,
    additives_tags: [], nova_group: null, nutriscore_grade: null,
    nutrition, image_url: $('img.product-image, img[data-test-id="product-image"]').attr('src') || null,
    categories_tags: [], labels_tags: [],
    countries_tags: ['en:united-kingdom'],
    is_organic: name.toLowerCase().includes('organic'),
    import_source: 'sainsburys', retailer_availability: ["Sainsbury's"],
    avg_price: price, country: 'UK',
  }
}

export async function importSainsburys(options: ImportOptions): Promise<void> {
  logger.info('Starting Sainsbury\'s scraper')
  const importLog = new ImportLogger('sainsburys')
  await importLog.start()
  const rateLimiter = new RateLimiter(0.5)

  let processed = 0, imported = 0, failed = 0

  try {
    for (const term of SEARCH_TERMS) {
      if (options.limit > 0 && imported >= options.limit) break

      logger.info({ term }, 'Searching')
      const searchUrl = `${BASE_URL}/gol-ui/SearchDisplayView?searchTerm=${encodeURIComponent(term)}&pageSize=36`
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
    logger.info({ processed, imported, failed }, 'Sainsbury\'s import completed')
  } catch (error: any) {
    logger.error({ error: error.message }, 'Sainsbury\'s import failed')
    await importLog.finish('failed')
    throw error
  }
}
