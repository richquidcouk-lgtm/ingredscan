-- Migration 009: Quality Score v2 with breakdown storage
ALTER TABLE products
ADD COLUMN IF NOT EXISTS quality_score_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS quality_score_breakdown jsonb,
ADD COLUMN IF NOT EXISTS quality_score_updated_at timestamptz;
