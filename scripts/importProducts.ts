import { Command } from 'commander'
import { importOpenFoodFacts } from './sources/openFoodFacts'
import { importOpenBeautyFacts } from './sources/openBeautyFacts'
import { importFSA } from './sources/fsa'
import { importUSDA } from './sources/usda'
import { importTesco } from './sources/tesco'
import { importSainsburys } from './sources/sainsburys'
import { importAsda } from './sources/asda'
import { importWaitrose } from './sources/waitrose'
import type { ImportOptions } from './types/product'

const program = new Command()

program
  .name('importProducts')
  .description('IngredScan product data ingestion system')
  .option('--source <source>', 'Source to import from (openfoodfacts|fsa|usda|tesco|sainsburys|asda|waitrose|all)', 'all')
  .option('--limit <number>', 'Max records to import (0 = unlimited)', '0')
  .option('--resume', 'Resume from last checkpoint', false)
  .option('--dry-run', 'Parse without inserting to database', false)
  .parse()

const opts = program.opts()

const options: ImportOptions = {
  source: opts.source,
  limit: parseInt(opts.limit) || 0,
  resume: opts.resume,
  dryRun: opts.dryRun,
}

const sources: Record<string, (options: ImportOptions) => Promise<void>> = {
  openfoodfacts: importOpenFoodFacts,
  openbeautyfacts: importOpenBeautyFacts,
  fsa: importFSA,
  usda: importUSDA,
  tesco: importTesco,
  sainsburys: importSainsburys,
  asda: importAsda,
  waitrose: importWaitrose,
}

async function main() {
  console.log(`\n🔄 IngredScan Product Importer`)
  console.log(`   Source: ${options.source}`)
  console.log(`   Limit: ${options.limit || 'unlimited'}`)
  console.log(`   Resume: ${options.resume}`)
  console.log(`   Dry run: ${options.dryRun}\n`)

  const startTime = Date.now()

  if (options.source === 'all') {
    for (const [name, fn] of Object.entries(sources)) {
      console.log(`\n--- Starting: ${name} ---`)
      try {
        await fn(options)
        console.log(`✓ ${name} completed`)
      } catch (error: any) {
        console.error(`✗ ${name} failed: ${error.message}`)
      }
    }
  } else if (sources[options.source]) {
    try {
      await sources[options.source](options)
      console.log(`\n✓ ${options.source} completed`)
    } catch (error: any) {
      console.error(`\n✗ ${options.source} failed: ${error.message}`)
      process.exit(1)
    }
  } else {
    console.error(`Unknown source: ${options.source}`)
    console.error(`Available: ${Object.keys(sources).join(', ')}, all`)
    process.exit(1)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n⏱ Total time: ${elapsed}s\n`)
}

main()
