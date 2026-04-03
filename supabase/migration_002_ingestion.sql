-- Migration: Add product ingestion support
-- Run in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS retailer_availability text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_imported_at timestamptz;
ALTER TABLE products ADD COLUMN IF NOT EXISTS import_source text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS categories_tags text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS labels_tags text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_organic boolean default false;

CREATE TABLE IF NOT EXISTS import_log (
  id uuid default gen_random_uuid() primary key,
  source text not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  records_processed integer default 0,
  records_imported integer default 0,
  records_failed integer default 0,
  status text default 'running'
);

CREATE TABLE IF NOT EXISTS import_progress (
  source text primary key,
  last_barcode text,
  last_offset integer default 0,
  updated_at timestamptz default now()
);

-- Allow service role to write to import tables
ALTER TABLE import_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage import_log" ON import_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage import_progress" ON import_progress FOR ALL USING (true) WITH CHECK (true);
