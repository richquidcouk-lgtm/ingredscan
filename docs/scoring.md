# How IngredScan scores products

This document describes how IngredScan turns a raw Open Food Facts (or Open Beauty Facts) record into the two numbers shown in the app: **NOVA** (1–4, how industrially processed) and **quality score** (0–10, overall health/quality).

All scoring lives in `lib/scoring.ts`. The bulk importer and the live scan path both call `scoreProduct()` — there is no second implementation.

## The two numbers

| Field                | Range      | Source                                                                 |
|----------------------|------------|------------------------------------------------------------------------|
| **NOVA score**       | 1–4        | Passed through from Open Food Facts when available; inferred otherwise |
| **Quality score**    | 0.0–10.0   | Computed by IngredScan from Nutri-Score + NOVA + additives + labels    |

Open Food Facts does **not** publish a "quality score". The 0–10 number is IngredScan's own composite. OFF's raw Nutri-Score (A–E) and NOVA (1–4) feed into it but are not the same thing.

## What we preserve from Open Food Facts

For traceability, we store the raw OFF data alongside our computed values:

| Column (products table)         | Meaning                                                                                           |
|---------------------------------|---------------------------------------------------------------------------------------------------|
| `off_nova_group`                | Raw OFF NOVA, verbatim. `null` if OFF did not provide one.                                        |
| `nutriscore_grade`              | Raw OFF Nutri-Score grade (a–e). Unchanged.                                                       |
| `nova_score`                    | **IngredScan-displayed** NOVA. Equals `off_nova_group` when present, otherwise inferred.          |
| `nova_source`                   | `'off_direct'` when passed through, `'inferred'` when IngredScan filled it in.                    |
| `quality_score`                 | IngredScan 0–10 composite.                                                                        |
| `quality_score_version`         | Version of the scoring algorithm. Current: `2`.                                                   |
| `quality_score_breakdown`       | jsonb with the four sub-components and inputs (see below).                                        |
| `quality_score_updated_at`      | When `quality_score` was last computed.                                                           |

The UI only shows `nova_score` and `quality_score`. Everything else is for audit, rescoring, and debugging.

## NOVA inference

`lib/scoring.inferNovaScore` in priority order:

1. **Fresh-produce override.** If categories include any of `en:fresh-fruits`, `en:fresh-vegetables`, `en:eggs`, `en:plain-yogurts`, `en:fresh-bread`, `en:nuts`, `en:rice`, `en:pasta`, etc., NOVA is forced to **1** regardless of what OFF said.
2. **OFF passthrough.** If OFF supplied `nova_group` in the 1–4 range, use it.
3. **No additives → NOVA 1.** Whole foods.
4. **Only natural additives (E300, E330, E270, E322, E160) → NOVA 2.**
5. **NOVA-4 markers in additives** (`en:flavouring`, `en:artificial-sweeteners`, `en:colours`, `en:emulsifiers`) **or ingredient text** (`hydrogenated`, `high-fructose`, `maltodextrin`, `modified starch`, `protein isolate`, `mechanically separated`) **→ NOVA 4.**
6. **NOVA-3 markers** (`en:preservative`, `en:stabiliser`, `en:thickener`) **→ NOVA 3.**
7. Additives present but uncategorised → NOVA 3.

## Quality score (0–10) — version 2

The total is a weighted sum of four components, clamped to `[0, 10]` and rounded to one decimal.

| Component         | Max  | Source |
|-------------------|------|--------|
| **Nutritional**   | 5.0  | Nutri-Score grade: A→5.0, B→4.0, C→3.0, D→2.0, E→1.0. Uses OFF's published grade when present, otherwise computed from `nutriments` using the official Nutri-Score thresholds (with the beverage variant for drinks). Returns 2.5 if no data. |
| **Processing**    | 2.5  | NOVA 1 or 2 → 2.5, NOVA 3 → 1.5, NOVA 4 → **0.5** (or **0.75** if NOVA was inferred rather than supplied by OFF — we are less confident in the penalty when we inferred it). |
| **Additives**     | 2.0  | Start at 2.0. For each additive resolved against `data/additives.json`: subtract **0.4** (high risk), **0.15** (medium risk). Extra penalties: **–0.3** for any Southampton Six colour (E102, E104, E110, E122, E124, E129), **–0.2** for E211 (formaldehyde releaser). Floor at 0. |
| **Organic / cert**| 0.5  | **+0.5** for organic/bio/EU-organic/USDA-organic/Soil Association labels. **+0.25** for a "no artificial colours/flavours" + "no preservatives" combo. Otherwise 0. |

Then:

- **Fresh-produce floor.** If the product is fresh produce (see category list in `lib/scoring.ts`), the total is raised to **8.5** if it would otherwise be lower. We don't want fresh carrots scoring 5 because OFF is missing a Nutri-Score.
- **Clamp** to `[0, 10]`.
- **Round** to one decimal.

### Maximum NOVA-4 quality score

Under v2, a NOVA-4 product cannot exceed:

- Nutri-Score A: 5.0
- Processing (NOVA 4 inferred): 0.75
- Additives (no flagged additives): 2.0
- Organic: 0.5
- **Total: 8.25**

Any NOVA-4 row with `quality_score ≥ 9.0` is a data integrity red flag — it was written by an older (v1) scoring implementation. `scripts/checkImportStatus.ts` uses exactly this query as a sanity check after bulk imports.

## Confidence

`scoreProduct` also returns a confidence number:

- **97** — OFF provided an ingredients list
- **78** — no ingredients text
- **60** — no `nova_group` AND product looks fresh produce (triggers a "score estimated" warning in the UI)

## Detected flags (UI warnings)

`lib/scoring.detectFlags` independently marks:

- **High Sugar** — `sugars_100g > 10`
- **High Salt** — `sodium_100g > 0.6` or `salt_100g > 1.5`
- **High Saturated Fat** — `saturated-fat_100g > 5`
- **Artificial Colours** — any of E102, E104, E110, E122, E124, E129, E131, E133
- **Artificial Sweeteners** — any of E951 (aspartame), E950 (ace-K), E955 (sucralose), E954 (saccharin)

## Related code

- `lib/scoring.ts` — canonical scoring (`scoreProduct`, `calculateQualityBreakdown`, `inferNovaScore`, `calcNutritionalComponent`, `calcProcessingComponent`, `calcAdditiveComponent`, `calcOrganicComponent`).
- `lib/scoring.ts:446` `resolveAdditives` — E-code normalisation and risk lookup against `data/additives.json`.
- `scripts/utils/scoring.ts` — adapter that maps the importer's nested `RawProduct.nutrition` to OFF-style `nutriments` flat keys and forwards to `scoreProduct`. **Must not reimplement scoring.**
- `scripts/utils/batchInsert.ts` — writes all traceability columns (`off_nova_group`, `nova_source`, `quality_score_version`, `quality_score_breakdown`, `quality_score_updated_at`) on upsert.
- `scripts/rescoreProducts.ts` — one-off in-place rescore. Reads `off_nova_group` so `isInferred` is reconstructed correctly (previously it couldn't, and produced a 0.25 swing on every NOVA-4-inferred row).
- `scripts/checkImportStatus.ts` — post-import sanity check, including the NOVA-4 / quality ≥ 9.0 fingerprint for v1 leftovers.
- `supabase/migration_011_score_traceability.sql` — adds `off_nova_group`, `quality_score_version`, `quality_score_breakdown`, `quality_score_updated_at` and the column comments.

## Changing the algorithm

1. Edit `lib/scoring.ts`. Bump `QualityScoreBreakdown.version` if the shape of the breakdown changes or if you want to distinguish old rows.
2. Re-run `npm run import:off` and `npm run import:obf` — they upsert, so existing rows get overwritten with new scores.
3. Run `scripts/checkImportStatus.ts` to verify.
4. Do **not** use `scripts/rescoreProducts.ts` as the primary fix path. It's a safety net — a fresh bulk import is always cleaner and faster for a whole-table rescore.
