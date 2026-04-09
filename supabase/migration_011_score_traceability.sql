-- Migration 011: Preserve original OFF data + add IngredScan score traceability columns.
--
-- Problem: the importer overwrites nova_score with our computed value, so the
-- raw Open Food Facts NOVA classification is lost when we infer one. We also
-- never populated nova_source (added in 007) or the v2 score breakdown columns
-- (migration 009 was written but never applied).
--
-- After this migration the products table stores both the original OFF scores
-- AND our computed IngredScan scores side-by-side, with full traceability.

-- Raw Open Food Facts NOVA classification, null when OFF didn't provide one.
-- Distinct from nova_score, which is the IngredScan-displayed value (may be
-- inferred from ingredients/additives when OFF had no nova_group).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS off_nova_group int;

COMMENT ON COLUMN products.off_nova_group IS
  'Raw NOVA group from Open Food Facts CSV (1-4), null if OFF did not provide one. Preserved verbatim for traceability; do not overwrite with our inferred value.';

COMMENT ON COLUMN products.nova_score IS
  'IngredScan-displayed NOVA value (1-4). Equals off_nova_group when nova_source = off_direct, otherwise inferred by lib/scoring.inferNovaScore.';

COMMENT ON COLUMN products.nutriscore_grade IS
  'Raw Nutri-Score grade from Open Food Facts (a-e), preserved verbatim. IngredScan does not compute its own Nutri-Score; this feeds the nutritional component of quality_score.';

COMMENT ON COLUMN products.nova_source IS
  'Provenance of nova_score: off_direct (OFF supplied nova_group) or inferred (lib/scoring inferred it). Required to correctly re-score products without losing the inferred-softer-penalty nuance in lib/scoring.calcProcessingComponent.';

COMMENT ON COLUMN products.quality_score IS
  'IngredScan quality score 0.0-10.0. Computed by lib/scoring.scoreProduct from Nutri-Score, NOVA, additives, and certification labels. Not from OFF — OFF publishes no equivalent.';

-- The v2 breakdown columns from the never-applied migration 009.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quality_score_version int DEFAULT 2;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quality_score_breakdown jsonb;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quality_score_updated_at timestamptz;

COMMENT ON COLUMN products.quality_score_version IS
  'Version of the quality_score algorithm used to compute this row. Bump when lib/scoring.calculateQualityBreakdown changes shape.';

COMMENT ON COLUMN products.quality_score_breakdown IS
  'jsonb copy of the QualityScoreBreakdown from lib/scoring (nutritional, processing, additives, organic sub-scores + nutriscore grade + nova). Stored so we can audit individual rows without recomputing.';
