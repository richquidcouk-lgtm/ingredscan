-- Migration 010: User purchase reports
-- Users can report where they bought a product and at what price

CREATE TABLE IF NOT EXISTS purchase_reports (
  id uuid default gen_random_uuid() primary key,
  barcode text not null,
  retailer text not null,
  price numeric(8,2),
  currency text default 'GBP',
  location text,
  user_id uuid references profiles(id),
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_reports_barcode ON purchase_reports(barcode);

-- Add retailers field to products cache
ALTER TABLE products ADD COLUMN IF NOT EXISTS retailers text[];
