-- Migration 013: Add v3 scoring columns alongside the original quality_score.
--
-- The original quality_score (0-10, v2 formula) is PRESERVED as-is for
-- traceability and rollback safety. The new v3 columns store the Yuka-aligned
-- 3-pillar scores on a native 0-100 scale.
--
-- The app reads quality_score_v3 for display when populated, falling back to
-- quality_score (×10) for rows that haven't been rescored yet.

-- Composite 0-100 quality score (Nutrition 60% + Additives 30% + Organic 10%)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quality_score_v3 int;

-- Individual pillar scores (each 0-100)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS nutrition_score_v3 int;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS additive_score_v3 int;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS organic_bonus_v3 int;

COMMENT ON COLUMN products.quality_score IS
  'ORIGINAL v2 quality score 0.0-10.0. Preserved for traceability. Do not overwrite.';

COMMENT ON COLUMN products.quality_score_v3 IS
  'IngredScan v3 quality score 0-100. Yuka-aligned 3-pillar formula: nutrition(60%) + additives(30%) + organic(10%). NOVA has zero influence.';

COMMENT ON COLUMN products.nutrition_score_v3 IS
  'Nutrition pillar 0-100. Nutriscore base + protein/fibre bonuses - sugar/sat-fat/salt penalties. D/E capped at 49.';

COMMENT ON COLUMN products.additive_score_v3 IS
  'Additive pillar 0-100. Tier-based penalties (0/1/2/3). Hard caps: tier-3 present → max 49, tier-2 → max 75.';

COMMENT ON COLUMN products.organic_bonus_v3 IS
  'Organic pillar: 100 if certified organic, 0 otherwise.';
