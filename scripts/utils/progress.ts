import { supabaseAdmin } from './supabaseAdmin'

export class ProgressTracker {
  private source: string

  constructor(source: string) {
    this.source = source
  }

  async save(barcode: string, offset: number): Promise<void> {
    await supabaseAdmin.from('import_progress').upsert(
      {
        source: this.source,
        last_barcode: barcode,
        last_offset: offset,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'source' }
    )
  }

  async load(): Promise<{ barcode: string; offset: number } | null> {
    const { data } = await supabaseAdmin
      .from('import_progress')
      .select('last_barcode, last_offset')
      .eq('source', this.source)
      .single()

    if (!data) return null
    return { barcode: data.last_barcode, offset: data.last_offset }
  }

  async complete(): Promise<void> {
    await supabaseAdmin.from('import_progress').delete().eq('source', this.source)
  }
}

export class ImportLogger {
  private logId: string | null = null
  private source: string
  private processed = 0
  private imported = 0
  private failed = 0

  constructor(source: string) {
    this.source = source
  }

  async start(): Promise<void> {
    const { data } = await supabaseAdmin
      .from('import_log')
      .insert({
        source: this.source,
        status: 'running',
      })
      .select('id')
      .single()

    this.logId = data?.id ?? null
  }

  async update(processed: number, imported: number, failed: number): Promise<void> {
    this.processed = processed
    this.imported = imported
    this.failed = failed

    if (!this.logId) return
    await supabaseAdmin
      .from('import_log')
      .update({
        records_processed: processed,
        records_imported: imported,
        records_failed: failed,
      })
      .eq('id', this.logId)
  }

  async finish(status: 'completed' | 'failed'): Promise<void> {
    if (!this.logId) return
    await supabaseAdmin
      .from('import_log')
      .update({
        completed_at: new Date().toISOString(),
        records_processed: this.processed,
        records_imported: this.imported,
        records_failed: this.failed,
        status,
      })
      .eq('id', this.logId)
  }
}
