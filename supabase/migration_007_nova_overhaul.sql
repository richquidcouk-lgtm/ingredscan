-- Migration 007: NOVA display overhaul and special categories

-- Track whether NOVA score came from OFF directly or was inferred
ALTER TABLE products
ADD COLUMN IF NOT EXISTS nova_source text DEFAULT 'inferred';
-- values: 'off_direct' | 'inferred'

-- Track special product categories
ALTER TABLE products
ADD COLUMN IF NOT EXISTS special_category text;
-- values: 'infant_formula' | 'medicine' | 'supplement' | null

-- Supplement scanning waitlist
CREATE TABLE IF NOT EXISTS supplement_waitlist (
  id uuid default gen_random_uuid() primary key,
  email text,
  product_name text,
  barcode text,
  created_at timestamptz default now()
);
