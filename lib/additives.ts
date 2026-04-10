/**
 * Additive Tier Registry — maps OFF additive tags to risk tiers.
 *
 * Tier 0 — No concern (natural origin, extensively proven safe)
 * Tier 1 — Low concern (minor penalty for synthetic origin)
 * Tier 2 — Moderate concern (emerging research, data gaps)
 * Tier 3 — High risk (regulatory warnings, IARC classifications)
 */
export const ADDITIVE_TIERS: Record<string, 0 | 1 | 2 | 3> = {

  // ── TIER 3 — High risk ─────────────────────────────────────

  // Southampton colours — hyperactivity in children (EFSA 2008)
  // EU mandatory warning label required
  'en:e102':  3,  // Tartrazine
  'en:e104':  3,  // Quinoline yellow
  'en:e110':  3,  // Sunset yellow FCF
  'en:e122':  3,  // Carmoisine
  'en:e124':  3,  // Ponceau 4R
  'en:e129':  3,  // Allura red AC

  // Titanium dioxide — genotoxicity concerns
  // Banned EU 2022; banned EU organic; FSA reviewing GB status
  'en:e171':  3,

  // Benzoates — hyperactivity; benzene formation with Vit C
  'en:e210':  3,  // Benzoic acid
  'en:e211':  3,  // Sodium benzoate
  'en:e212':  3,  // Potassium benzoate
  'en:e213':  3,  // Calcium benzoate

  // Sulphites — respiratory/asthma trigger
  // Mandatory EU labelling above 10mg/kg
  'en:e220':  3,  // Sulphur dioxide
  'en:e221':  3,  // Sodium sulphite
  'en:e222':  3,  // Sodium bisulphite
  'en:e223':  3,  // Sodium metabisulphite
  'en:e224':  3,  // Potassium metabisulphite
  'en:e226':  3,  // Calcium sulphite
  'en:e227':  3,  // Calcium bisulphite
  'en:e228':  3,  // Potassium bisulphite

  // Nitrites & nitrates — IARC Group 2A (probably carcinogenic)
  // IARC Monograph Vol.114; nitrosamine formation
  'en:e249':  3,  // Potassium nitrite
  'en:e250':  3,  // Sodium nitrite
  'en:e251':  3,  // Sodium nitrate
  'en:e252':  3,  // Potassium nitrate

  // BHA & BHT — IARC Group 2B; endocrine disruption
  'en:e320':  3,  // Butylated hydroxyanisole (BHA)
  'en:e321':  3,  // Butylated hydroxytoluene (BHT)
  'en:e310':  3,  // Propyl gallate

  // Carrageenan — gut inflammation; IARC Group 2B degraded form
  // Banned in EU certified organic products
  'en:e407':  3,
  'en:e407a': 3,  // Processed eucheuma seaweed

  // Artificial sweeteners — significant concern
  'en:e951':  3,  // Aspartame — IARC Group 2B (2023); EU warning label
  'en:e952':  3,  // Cyclamate — banned by FDA
  'en:e954':  3,  // Saccharin — historical animal carcinogen data

  // Other high-risk
  'en:e924':  3,  // Potassium bromate — banned EU; IARC 2B
  'en:e443':  3,  // Brominated vegetable oil — banned EU
  'en:e927a': 3,  // Azodicarbonamide — banned EU; WHO respiratory concerns

  // ── TIER 2 — Moderate concern ──────────────────────────────

  // Phosphates — kidney burden at high cumulative intake (EFSA 2019)
  'en:e338':  2,  // Phosphoric acid
  'en:e339':  2,  // Sodium phosphates
  'en:e340':  2,  // Potassium phosphates
  'en:e341':  2,  // Calcium phosphates
  'en:e450':  2,  // Diphosphates
  'en:e451':  2,  // Triphosphates
  'en:e452':  2,  // Polyphosphates

  // Mono/diglycerides — EFSA 2017 data gaps; trace trans fats
  'en:e471':  2,
  'en:e472a': 2,
  'en:e472b': 2,
  'en:e472c': 2,
  'en:e472e': 2,  // DATEM
  'en:e472f': 2,
  'en:e476':  2,  // PGPR — limited human data
  'en:e477':  2,  // Propylene glycol esters

  // Polysorbates — gut microbiome disruption (animal studies)
  'en:e432':  2,
  'en:e433':  2,  // Polysorbate 80
  'en:e434':  2,
  'en:e435':  2,
  'en:e436':  2,

  // CMC — gut microbiome disruption (Chassaing et al. Nature 2015)
  'en:e466':  2,

  // Flavour enhancers
  'en:e621':  2,  // MSG — sensitivity in subset of population
  'en:e622':  2,
  'en:e623':  2,
  'en:e627':  2,  // Disodium guanylate — gout risk
  'en:e631':  2,  // Disodium inosinate
  'en:e635':  2,  // Disodium 5-ribonucleotides

  // Sweeteners with emerging concern
  'en:e950':  2,  // Acesulfame K — limited long-term human data
  'en:e955':  2,  // Sucralose — gut microbiome disruption research
  'en:e961':  2,  // Neotame — very limited human safety data
  'en:e960':  2,  // Steviol glycosides

  // Colours (non-Southampton) with hyperactivity links
  'en:e133':  2,  // Brilliant blue
  'en:e151':  2,  // Brilliant black
  'en:e155':  2,  // Brown HT

  // Other moderate
  'en:e150b': 2,  // Caustic sulphite caramel
  'en:e150c': 2,  // Ammonia caramel
  'en:e150d': 2,  // Sulphite ammonia caramel
  'en:e905':  2,  // Mineral hydrocarbons — EFSA 2012 accumulation concern
  'en:e903':  2,  // Carnauba wax — contact sensitiser

  // ── TIER 1 — Low concern ───────────────────────────────────
  // EFSA/FSA no significant concern; minor penalty for synthetic origin

  'en:e270':  1,  // Lactic acid
  'en:e296':  1,  // Malic acid
  'en:e297':  1,  // Fumaric acid
  'en:e322':  1,  // Lecithin (allergen risk for some)
  'en:e400':  1,  // Alginic acid
  'en:e401':  1,  // Sodium alginate
  'en:e402':  1,  // Potassium alginate
  'en:e404':  1,  // Calcium alginate
  'en:e405':  1,  // Propylene glycol alginate
  'en:e406':  1,  // Agar
  'en:e410':  1,  // Locust bean gum
  'en:e412':  1,  // Guar gum
  'en:e413':  1,  // Tragacanth
  'en:e414':  1,  // Acacia / gum arabic
  'en:e415':  1,  // Xanthan gum
  'en:e416':  1,  // Karaya gum
  'en:e417':  1,  // Tara gum
  'en:e418':  1,  // Gellan gum
  'en:e422':  1,  // Glycerol
  'en:e425':  1,  // Konjac
  'en:e440':  1,  // Pectin
  'en:e460':  1,  // Cellulose
  'en:e461':  1,  // Methyl cellulose
  'en:e463':  1,  // Hydroxypropyl cellulose
  'en:e464':  1,  // Hydroxypropyl methyl cellulose
  'en:e465':  1,  // Ethyl methyl cellulose
  'en:e500':  1,  // Sodium carbonates
  'en:e501':  1,  // Potassium carbonates
  'en:e503':  1,  // Ammonium carbonates
  'en:e504':  1,  // Magnesium carbonates
  'en:e509':  1,  // Calcium chloride
  'en:e516':  1,  // Calcium sulphate
  'en:e551':  1,  // Silicon dioxide
  'en:e570':  1,  // Fatty acids
  'en:e575':  1,  // Glucono delta-lactone
  'en:e620':  1,  // Glutamic acid
  'en:e900':  1,  // Dimethyl polysiloxane
  'en:e901':  1,  // Beeswax
  'en:e920':  1,  // L-Cysteine
  'en:e953':  1,  // Isomalt
  'en:e965':  1,  // Maltitol
  'en:e966':  1,  // Lactitol
  'en:e967':  1,  // Xylitol
  'en:e968':  1,  // Erythritol

  // ── TIER 0 — No concern ────────────────────────────────────
  // Natural origin or extensively proven safe. Zero penalty.

  'en:e100':  0,  // Curcumin (turmeric)
  'en:e101':  0,  // Riboflavin (Vit B2)
  'en:e140':  0,  // Chlorophylls
  'en:e160a': 0,  // Beta-carotene
  'en:e160b': 0,  // Annatto
  'en:e160c': 0,  // Paprika extract
  'en:e160d': 0,  // Lycopene
  'en:e161b': 0,  // Lutein
  'en:e162':  0,  // Beetroot red
  'en:e163':  0,  // Anthocyanins
  'en:e170':  0,  // Calcium carbonates
  'en:e172':  0,  // Iron oxides
  'en:e260':  0,  // Acetic acid (vinegar)
  'en:e261':  0,  // Potassium acetate
  'en:e262':  0,  // Sodium acetates
  'en:e263':  0,  // Calcium acetate
  'en:e290':  0,  // Carbon dioxide
  'en:e300':  0,  // Ascorbic acid (Vit C)
  'en:e301':  0,  // Sodium ascorbate
  'en:e302':  0,  // Calcium ascorbate
  'en:e304':  0,  // Fatty acid esters of ascorbic acid
  'en:e306':  0,  // Natural Vit E (tocopherol-rich extract)
  'en:e307':  0,  // Alpha-tocopherol
  'en:e308':  0,  // Gamma-tocopherol
  'en:e309':  0,  // Delta-tocopherol
  'en:e315':  0,  // Erythorbic acid
  'en:e316':  0,  // Sodium erythorbate
  'en:e330':  0,  // Citric acid
  'en:e331':  0,  // Sodium citrates
  'en:e332':  0,  // Potassium citrates
  'en:e333':  0,  // Calcium citrates
  'en:e334':  0,  // Tartaric acid
  'en:e335':  0,  // Sodium tartrates
  'en:e336':  0,  // Potassium tartrates
  'en:e337':  0,  // Sodium potassium tartrate
  'en:e938':  0,  // Argon
  'en:e939':  0,  // Helium
  'en:e941':  0,  // Nitrogen
  'en:e948':  0,  // Oxygen
  'en:e150a': 0,  // Plain caramel
}

/**
 * Look up the tier for an additive tag.
 * Falls back to tier 0 for vitamins/minerals, tier 1 for unknowns.
 */
export function getTier(tag: string): 0 | 1 | 2 | 3 {
  const normalised = tag.toLowerCase()
  if (normalised in ADDITIVE_TIERS) return ADDITIVE_TIERS[normalised]
  // Vitamins and minerals are always tier 0
  if (/vitamin|mineral|calcium|iron|zinc|magnesium|selenium|iodine/i.test(tag)) return 0
  // Unknown additives get precautionary tier 1
  return 1
}
