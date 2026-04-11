import { supabaseAdmin } from './utils/supabaseAdmin'

// Discover the most popular category keywords in the products table by
// scanning the `category` (joined text) and `name` columns. This gives us
// the ground truth for which search terms will actually return results.

async function countTerm(source: string, term: string): Promise<number> {
  const pattern = `%${term}%`
  const { count, error } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('import_source', source)
    .or(`name.ilike.${pattern},category.ilike.${pattern}`)
  if (error) return -1
  return count ?? 0
}

async function main() {
  const foodTerms = [
    'bread', 'cereal', 'yogurt', 'cheese', 'chocolate', 'biscuit', 'cookie',
    'drink', 'coffee', 'tea', 'water', 'beer', 'wine', 'juice', 'soda',
    'pasta', 'rice', 'noodle', 'canned', 'meal', 'meat', 'chicken', 'beef',
    'pork', 'fish', 'seafood', 'vegetable', 'fruit', 'frozen', 'snack',
    'chip', 'crisp', 'candy', 'sweet', 'sauce', 'ketchup', 'mustard',
    'jam', 'spread', 'butter', 'margarine', 'oil', 'vinegar',
    'nuts', 'seed', 'baby', 'infant', 'cereal', 'flour', 'sugar',
    'honey', 'syrup', 'egg', 'milk', 'cream', 'ice cream', 'pizza',
    'soup', 'salad', 'dressing', 'spice', 'herb',
  ]

  const beautyTerms = [
    'moisturiz', 'cream', 'lotion', 'serum', 'cleans', 'wash',
    'sun', 'spf', 'shampoo', 'conditioner', 'hair', 'shower',
    'soap', 'gel', 'makeup', 'foundation', 'mascara', 'lip',
    'perfume', 'fragrance', 'deodorant', 'toothpaste', 'mouth',
    'nail', 'hand', 'body', 'face', 'eye', 'baby', 'shav',
    'oil', 'mask', 'scrub', 'toner', 'mist',
  ]

  console.log('\n=== FOOD categories ===')
  for (const term of foodTerms) {
    const c = await countTerm('openfoodfacts', term)
    if (c > 0) console.log(`  ${term.padEnd(16)} ${c.toLocaleString()}`)
  }

  console.log('\n=== BEAUTY categories ===')
  for (const term of beautyTerms) {
    const c = await countTerm('openbeautyfacts', term)
    if (c > 0) console.log(`  ${term.padEnd(16)} ${c.toLocaleString()}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
