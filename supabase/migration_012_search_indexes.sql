-- Migration 012: Trigram indexes for fast product name/brand/category search.
--
-- Problem: /api/search runs `name ILIKE '%term%' OR brand ILIKE '%term%' OR
-- category ILIKE '%term%'` against the products table (~1.6M rows). Without
-- a trigram index Postgres has to seq-scan the entire table for every query,
-- which exceeds Supabase's 8-second statement timeout. The /search and
-- /swaps pages return zero results because the query never completes.
--
-- pg_trgm is bundled with Supabase and just needs to be enabled. The GIN
-- indexes below make `ILIKE '%foo%'` (substring search, not just prefix)
-- complete in milliseconds even on the full table.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS products_name_trgm_idx
  ON products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS products_brand_trgm_idx
  ON products USING gin (brand gin_trgm_ops);

CREATE INDEX IF NOT EXISTS products_category_trgm_idx
  ON products USING gin (category gin_trgm_ops);

-- A regular B-tree on import_source so the equality filter that runs in
-- combination with the trigram match is also fast.
CREATE INDEX IF NOT EXISTS products_import_source_idx
  ON products (import_source);

-- And on quality_score so the ORDER BY is index-assisted.
CREATE INDEX IF NOT EXISTS products_quality_score_idx
  ON products (quality_score DESC NULLS LAST);
