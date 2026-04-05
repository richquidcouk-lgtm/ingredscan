-- Migration 006: Cosmetics support
-- Adds cosmetic product scanning with INCI ingredient analysis

-- 1. Add product_type to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'food';

-- 2. Create cosmetic ingredients reference table
CREATE TABLE IF NOT EXISTS cosmetic_ingredients (
  id uuid default gen_random_uuid() primary key,
  inci_name text not null unique,
  common_name text,
  function text[],
  risk_level text default 'low',
  risk_score integer default 1,
  description text,
  concerns text[],
  safe_for_pregnant boolean default true,
  safe_for_children boolean default true,
  vegan boolean default true,
  comedogenic_rating integer,
  ewg_score integer,
  regulation_ref text,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS
  idx_cosmetic_ingredients_inci
  ON cosmetic_ingredients(inci_name);

-- 3. Add cosmetic-specific columns to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS inci_ingredients jsonb,
ADD COLUMN IF NOT EXISTS cosmetic_concerns text[],
ADD COLUMN IF NOT EXISTS is_vegan boolean,
ADD COLUMN IF NOT EXISTS is_cruelty_free boolean,
ADD COLUMN IF NOT EXISTS is_natural boolean,
ADD COLUMN IF NOT EXISTS fragrance_free boolean,
ADD COLUMN IF NOT EXISTS alcohol_free boolean,
ADD COLUMN IF NOT EXISTS paraben_free boolean,
ADD COLUMN IF NOT EXISTS sulphate_free boolean,
ADD COLUMN IF NOT EXISTS silicone_free boolean,
ADD COLUMN IF NOT EXISTS ewg_score integer,
ADD COLUMN IF NOT EXISTS skin_type text[];

-- 4. Add product_type to scans table
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'food';
