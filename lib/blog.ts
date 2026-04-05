export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  readTime: string
  featured: boolean
  content: string
}

const posts: BlogPost[] = [
  {
    slug: 'what-is-nova-score',
    title: 'What Is the NOVA Score? A Simple Guide to Food Processing Levels',
    description: 'Learn how the NOVA classification system works, what each level means, and why it matters for your health — with real UK product examples.',
    date: '2026-03-28',
    author: 'IngredScan Team',
    category: 'Education',
    tags: ['NOVA score', 'food processing', 'UPF', 'health'],
    readTime: '5 min read',
    featured: true,
    content: `
<p>If you've ever scanned a product with IngredScan, you'll have seen a NOVA score — a number from 1 to 4 that tells you how processed a food is. But what does it actually mean, and why should you care?</p>

<h2>The Origins of NOVA</h2>
<p>The NOVA classification system was developed by researchers at the University of Sao Paulo, Brazil, led by Professor Carlos Monteiro. First published in 2009 and refined over the following years, it has become the most widely used framework for categorising foods by their degree of processing.</p>
<p>Unlike traditional nutritional analysis that focuses on individual nutrients (fat, sugar, salt), NOVA looks at <strong>what has been done to the food</strong> before it reaches you. This is important because research increasingly suggests that the level of processing matters as much as — or even more than — the individual nutrient content.</p>

<h2>NOVA 1: Unprocessed or Minimally Processed Foods</h2>
<p>These are foods in their natural state, or altered only by removal of inedible parts, drying, crushing, grinding, pasteurisation, refrigeration, or freezing. No substances are added.</p>
<p><strong>UK examples:</strong> fresh apples from Tesco, free-range eggs, plain porridge oats, bagged spinach, fresh chicken breast, whole milk, frozen peas, plain rice.</p>
<p>These foods form the foundation of a healthy diet. They contain all their natural nutrients and fibre, with nothing added or removed beyond basic preparation.</p>

<h2>NOVA 2: Processed Culinary Ingredients</h2>
<p>These are substances extracted from NOVA 1 foods through processes like pressing, refining, grinding, or milling. They are rarely eaten on their own — they're used to prepare, season, and cook NOVA 1 foods.</p>
<p><strong>UK examples:</strong> extra virgin olive oil, unsalted butter, granulated sugar, table salt, plain flour, white vinegar, honey.</p>
<p>You won't often scan these with IngredScan, as they're typically ingredients rather than finished products. They're neutral in the NOVA system — it's what they're combined with that matters.</p>

<h2>NOVA 3: Processed Foods</h2>
<p>These are relatively simple products made by adding NOVA 2 ingredients (salt, oil, sugar) to NOVA 1 foods. They typically have 2-3 ingredients and are recognisable versions of the original food.</p>
<p><strong>UK examples:</strong> tinned baked beans (basic recipe), cheddar cheese, smoked salmon, freshly baked sourdough bread, tinned sardines in olive oil, salted nuts, pickled onions.</p>
<p>The key distinction from NOVA 4 is simplicity. Processed foods are modified versions of real foods, not industrial formulations.</p>

<h2>NOVA 4: Ultra-Processed Foods (UPF)</h2>
<p>This is the category that has attracted the most attention — and concern. Ultra-processed foods are industrial formulations typically made from five or more ingredients, many of which you wouldn't find in a home kitchen.</p>
<p>Look for ingredients like high-fructose corn syrup, hydrogenated oils, modified starches, protein isolates, emulsifiers (like polysorbate 80 or carboxymethylcellulose), flavour enhancers (like monosodium glutamate), artificial sweeteners, and colours.</p>
<p><strong>UK examples:</strong> most breakfast cereals (Coco Pops, Frosties), soft drinks (Coca-Cola, Fanta), packaged biscuits (Digestives, Hobnobs), crisps (Walkers, Pringles), instant noodles (Pot Noodle), chicken nuggets, most ready meals, sliced white bread (Hovis, Warburtons), flavoured yoghurts.</p>
<p>According to a 2024 study published in the BMJ, the UK has one of the highest rates of <a href="/blog/ultra-processed-food-uk-guide">ultra-processed food consumption</a> in Europe, with UPF making up approximately 57% of calories in the average British diet.</p>

<h2>Important Limitations of NOVA</h2>

<h3>Not all NOVA 4 foods are equal</h3>
<p>A plain wholemeal loaf with one emulsifier and a packet of Pringles are both NOVA 4 — but they are very different foods. NOVA tells you about processing method, not overall healthfulness.</p>
<p>This is why IngredScan shows the processing level alongside a <a href="/blog/how-ingredscan-scores-work">Quality Score</a> — because neither measure alone tells the full story.</p>

<h3>Some NOVA 4 foods are nutritionally necessary</h3>
<p>Infant formula is classified as NOVA 4 because it contains industrially produced vitamins, minerals, and emulsifiers. But it's a regulated, medically appropriate product for babies who cannot be breastfed.</p>
<p>IngredScan does not show processing level scores for infant formula or medical nutritional products for this reason.</p>

<h3>NOVA scores can be inferred, not verified</h3>
<p>Open Food Facts, the database IngredScan uses, assigns NOVA scores based on community review. Some products have verified NOVA scores; others have estimated scores based on ingredient analysis.</p>
<p>When a score is estimated rather than verified, IngredScan shows this clearly so you know the confidence level of the information you're seeing.</p>

<h2>Why NOVA Matters</h2>
<p>A growing body of peer-reviewed research has linked high consumption of ultra-processed foods to various health outcomes. A 2023 umbrella review in the BMJ examining 45 pooled analyses found associations between higher UPF consumption and adverse health outcomes including cardiovascular disease, type 2 diabetes, and poor mental health.</p>
<p>However, it's important to note that not all NOVA 4 foods are equal. A wholemeal bread with added emulsifiers is very different from a pack of crisps, even though both are technically NOVA 4. This is why IngredScan uses the NOVA score alongside our Quality Score — to give you a more complete picture.</p>

<h2>How IngredScan Uses NOVA</h2>
<p>When you <a href="/scan">scan a product</a>, IngredScan determines its NOVA classification by analysing the ingredient list. We look for marker ingredients — substances that are characteristic of ultra-processing, such as emulsifiers, flavour enhancers, and hydrogenated fats.</p>
<p>The NOVA score is displayed prominently on every scan result, alongside our Quality Score which factors in nutritional content, additive concerns, and other data points. Together, they give you a quick, honest assessment of what you're about to eat.</p>
<p>Remember: NOVA is a tool for awareness, not a rigid rulebook. The goal isn't to eliminate all processed food — it's to help you make more informed choices about what you eat regularly.</p>
`,
  },
  {
    slug: 'ultra-processed-food-uk-guide',
    title: 'Ultra-Processed Food in the UK: What You Need to Know in 2026',
    description: 'A comprehensive guide to ultra-processed food in the UK — what it is, how much we eat, where it hides, and practical steps to reduce your intake.',
    date: '2026-03-20',
    author: 'IngredScan Team',
    category: 'Health',
    tags: ['UPF', 'UK food', 'ultra-processed', 'healthy eating'],
    readTime: '6 min read',
    featured: false,
    content: `
<p>The UK has a complicated relationship with ultra-processed food. We consume more of it than almost any other European country, yet many people aren't sure what counts as "ultra-processed" or why it matters. Here's what you need to know.</p>

<h2>How Much UPF Do We Actually Eat?</h2>
<p>Research from the National Diet and Nutrition Survey suggests that ultra-processed foods make up around 57% of total calorie intake in the UK. For children and teenagers, that figure is even higher — approaching 65% in some age groups.</p>
<p>To put that in perspective, that's significantly more than countries like France (36%), Italy (28%), or Portugal (25%). The UK's UPF consumption is closer to that of the United States and Australia.</p>

<h2>Where UPF Hides in Your Shopping</h2>
<p>The most obvious ultra-processed foods are easy to spot — fizzy drinks, crisps, sweets, and ready meals. But UPF is also found in products that many people consider healthy or neutral:</p>

<h3>Breakfast</h3>
<p>Most branded breakfast cereals are <a href="/blog/what-is-nova-score">NOVA 4</a>, including many marketed as "healthy" options. Granola with added flavourings, protein bars, flavoured instant porridge sachets, and most breakfast biscuits fall into this category. Even some "multigrain" options contain emulsifiers, flavourings, and modified starches.</p>

<h3>Bread</h3>
<p>Most sliced bread from major UK brands (Hovis, Kingsmill, Warburtons) is NOVA 4 due to added emulsifiers (like E471, E472e), preservatives (calcium propionate), and processing aids. Freshly baked bread from bakeries with simple ingredients (flour, water, salt, yeast) is typically NOVA 3.</p>

<h3>Yoghurt</h3>
<p>Plain natural yoghurt is NOVA 1. But flavoured yoghurts, especially those marketed to children, typically contain modified starch, pectin, flavourings, and sweeteners — making them NOVA 4. The difference between the two can be stark.</p>

<h3>Sauces and Condiments</h3>
<p>Most commercial ketchups, mayonnaise, salad dressings, and cooking sauces are NOVA 4. They typically contain modified starches, flavour enhancers, and various <a href="/blog/worst-additives-uk-food">additives</a> beyond the basic recipe.</p>

<h3>Plant-Based Alternatives</h3>
<p>Many plant-based milks, meats, and cheeses are heavily processed. A typical plant-based burger might contain methylcellulose, maltodextrin, modified food starch, and numerous flavourings. Being plant-based doesn't automatically mean minimally processed.</p>

<h2>The UK Supermarket Landscape</h2>
<p>Different UK supermarkets offer varying levels of UPF in their own-brand ranges:</p>
<ul>
<li><strong>Waitrose</strong> generally has more own-brand products with simpler ingredient lists, though UPF is still present</li>
<li><strong>M&S</strong> Food ranges tend to use fewer additives in premium lines</li>
<li><strong>Tesco, Sainsbury's, Asda, Morrisons</strong> have wide ranges — their "Finest" or premium lines often have simpler ingredients than value ranges</li>
<li><strong>Aldi and Lidl</strong> offer competitive prices with ingredient lists comparable to the big four supermarkets</li>
</ul>

<h2>What the Science Says</h2>
<p>Research on ultra-processed food has grown rapidly. Key findings from recent peer-reviewed studies include:</p>
<ul>
<li>A 2024 study in The Lancet found that higher UPF consumption was associated with a 12% increased risk of type 2 diabetes per 10% increase in UPF calorie share</li>
<li>The EPIC study (European Prospective Investigation into Cancer and Nutrition) found associations between UPF intake and colorectal cancer risk</li>
<li>Research published in Nature Reviews found that UPF displaces more nutritious foods from the diet</li>
<li>A 2023 UK Biobank analysis found associations between UPF consumption and cardiovascular mortality</li>
</ul>
<p>It's worth noting that these are observational studies showing associations, not necessarily causation. Researchers are still working to understand the specific mechanisms by which ultra-processing may affect health.</p>

<h2>Practical Steps to Reduce UPF</h2>
<p>Eliminating all ultra-processed food is neither practical nor necessary for most people. Instead, focus on reducing it where you can:</p>

<h3>1. Read Ingredient Lists, Not Just Front Labels</h3>
<p>"High in protein," "contains whole grains," or "no added sugar" can all appear on NOVA 4 products. The ingredient list tells the real story. If it contains ingredients you wouldn't find in a home kitchen, it's likely ultra-processed.</p>

<h3>2. Swap Where It's Easy</h3>
<p>Replace sliced white bread with sourdough from the bakery section. Switch flavoured yoghurt for plain Greek yoghurt with fresh fruit. Use olive oil and vinegar instead of bottled dressings. These swaps don't require cooking skill or extra time.</p>

<h3>3. Cook Simple Meals</h3>
<p>You don't need to be a chef. A jacket potato with cheese and beans, pasta with tinned tomatoes and vegetables, or rice with stir-fried vegetables and eggs are all minimally processed meals that take 15-20 minutes.</p>

<h3>4. Be Strategic About Convenience</h3>
<p>When you need convenience food, choose products with shorter, simpler ingredient lists. Tinned fish, pre-washed salads, rotisserie chicken, frozen vegetables, and pre-cooked grains are all low-processing convenience options.</p>

<h3>5. Use IngredScan</h3>
<p><a href="/scan">Scan products</a> when you shop to see their NOVA classification and quality score. Over time, you'll naturally learn to spot ultra-processed products and find better alternatives. Our swap feature suggests specific products available at your supermarket.</p>

<h2>The Bottom Line</h2>
<p>Ultra-processed food is deeply embedded in the UK food system, but awareness is growing. You don't need to be perfect — even modest reductions in UPF intake, replaced with minimally processed alternatives, can make a meaningful difference to your diet quality. The first step is simply knowing what's in your food.</p>
`,
  },
  {
    slug: 'worst-additives-uk-food',
    title: '10 Common Food Additives in UK Products and What the Research Says',
    description: 'A fact-based look at 10 widely used food additives found in UK supermarket products, what they do, and what published research has found about them.',
    date: '2026-03-14',
    author: 'IngredScan Team',
    category: 'Additives',
    tags: ['additives', 'food safety', 'UK food', 'ingredients'],
    readTime: '5 min read',
    featured: false,
    content: `
<p>Food additives are substances added to products to preserve them, improve texture, enhance flavour, or change appearance. All additives permitted in UK food have been assessed for safety by regulatory bodies. Many are characteristic of <a href="/blog/what-is-nova-score">ultra-processed (NOVA 4) foods</a>. However, ongoing research continues to examine their effects, and some have attracted more scientific scrutiny than others.</p>
<p>Here are 10 commonly found additives in UK supermarket products, what they do, and what published research has found.</p>

<h2>1. Sodium Nitrite (E250)</h2>
<p><strong>Found in:</strong> bacon, ham, salami, hot dogs, other cured meats</p>
<p>Sodium nitrite prevents the growth of Clostridium botulinum (the bacterium that causes botulism) and gives cured meat its pink colour. The International Agency for Research on Cancer (IARC) has classified processed meat as a Group 1 carcinogen, and nitrites are considered a contributing factor. When heated at high temperatures, nitrites can form nitrosamines, which are known carcinogens in animal studies.</p>

<h2>2. Titanium Dioxide (E171)</h2>
<p><strong>Found in:</strong> some chewing gum, sweets, white sauces, icing</p>
<p>Used as a white colouring agent, titanium dioxide was banned as a food additive in the EU in 2022 following an EFSA assessment that found it could no longer be considered safe, due to concerns about genotoxicity from nanoparticles. As of 2026, the UK FSA has not followed the EU ban and it remains permitted in UK food, though many manufacturers have voluntarily removed it.</p>

<h2>3. Artificial Colours: Tartrazine (E102), Sunset Yellow (E110), Carmoisine (E122), Allura Red (E129)</h2>
<p><strong>Found in:</strong> sweets, soft drinks, some sauces, ice lollies</p>
<p>These synthetic azo dyes have been extensively studied. A 2007 study commissioned by the UK FSA (the "Southampton study") found that mixtures of these colours with sodium benzoate were associated with increased hyperactivity in children. Since 2010, EU law requires products containing these colours to carry a warning label stating they "may have an adverse effect on activity and attention in children." Many UK manufacturers have reformulated to remove them.</p>

<h2>4. Potassium Sorbate (E202)</h2>
<p><strong>Found in:</strong> margarine, soft drinks, cheese, dried fruit, wine</p>
<p>A widely used preservative that prevents mould and yeast growth. Generally considered one of the safer preservatives, with a long history of use. Some in-vitro studies have raised questions about genotoxicity at high concentrations, but regulatory assessments have consistently found it safe at levels used in food.</p>

<h2>5. Carrageenan (E407)</h2>
<p><strong>Found in:</strong> plant-based milks, cream, ice cream, processed meats, infant formula</p>
<p>Extracted from red seaweed, carrageenan is used as a thickener and stabiliser. It has been the subject of ongoing debate. Some animal studies have found that degraded carrageenan (poligeenan) can cause intestinal inflammation, though the food-grade form is different. A 2018 review in the journal <em>Frontiers in Pediatrics</em> raised concerns about its use in infant formula. The Joint FAO/WHO Expert Committee on Food Additives has maintained it as safe for general use but not recommended in infant formula.</p>

<h2>6. Monosodium Glutamate — MSG (E621)</h2>
<p><strong>Found in:</strong> crisps, instant noodles, stock cubes, ready meals, Chinese takeaway food</p>
<p>MSG enhances savoury (umami) flavour. Despite decades of public concern ("Chinese restaurant syndrome"), large-scale scientific reviews, including those by the FDA and EFSA, have found no consistent evidence of harm at normal dietary levels. EFSA established a safe daily intake of 30mg per kg of body weight in 2017. It is one of the most studied food additives and is generally considered safe by major regulatory bodies.</p>

<h2>7. Sodium Benzoate (E211)</h2>
<p><strong>Found in:</strong> soft drinks, salad dressings, pickles, fruit juices, sauces</p>
<p>A preservative that prevents bacterial and fungal growth. The main concern is that when combined with ascorbic acid (vitamin C), it can form benzene, a known carcinogen. This reaction is accelerated by heat and light. The UK FSA tested soft drinks in 2006 and found some exceeded WHO benzene limits, leading to product reformulations. On its own, sodium benzoate is generally considered safe within established limits.</p>

<h2>8. BHA and BHT (E320, E321)</h2>
<p><strong>Found in:</strong> chewing gum, butter, cereals, snack foods, dehydrated foods</p>
<p>Butylated hydroxyanisole (BHA) and butylated hydroxytoluene (BHT) are antioxidant preservatives that prevent fats from going rancid. IARC has classified BHA as "possibly carcinogenic to humans" (Group 2B) based on animal studies. BHT has shown both pro-oxidant and antioxidant properties in research. Both are permitted in the UK and EU at low levels, but many manufacturers have moved to alternative antioxidants like tocopherols (vitamin E).</p>

<h2>9. Polysorbate 80 (E433)</h2>
<p><strong>Found in:</strong> ice cream, sauces, bakery products, some medicines</p>
<p>An emulsifier that helps oil and water mix. A 2015 study published in <em>Nature</em> found that polysorbate 80 and carboxymethylcellulose altered gut microbiota composition and promoted intestinal inflammation in mice, potentially contributing to metabolic syndrome. However, the concentrations used in the study were higher than typical dietary exposure, and human studies have not confirmed these effects.</p>

<h2>10. Phosphoric Acid (E338)</h2>
<p><strong>Found in:</strong> cola drinks, processed cheese, processed meats</p>
<p>Phosphoric acid gives cola its tangy flavour and acts as a preservative. High phosphate intake has been associated with reduced calcium absorption and bone density concerns in some observational studies, particularly in adolescents who drink large amounts of cola. A 2006 study in the <em>American Journal of Clinical Nutrition</em> found an association between cola consumption and lower bone mineral density in women.</p>

<h2>The Bottom Line</h2>
<p>All of these additives are legally permitted in UK food and have been assessed by regulatory bodies. "Permitted" means they are considered safe at the levels typically found in food. However, science evolves, and ongoing research continues to refine our understanding of these substances.</p>
<p>IngredScan <a href="/blog/how-ingredscan-scores-work">rates additive risk</a> as low, medium, or high based on current regulatory guidance and published peer-reviewed research. These are relative classifications to help you make informed choices — not definitive safety judgments. When in doubt, <a href="/scan">scan your products</a> and choose those with shorter ingredient lists and fewer additives you don't recognise.</p>
`,
  },
  {
    slug: 'healthiest-ketchup-uk',
    title: 'We Scanned 8 UK Ketchups: Here Are the Results',
    description: 'We put 8 popular UK ketchups through IngredScan to compare NOVA scores, quality scores, sugar content, and additives. Some results may surprise you.',
    date: '2026-03-07',
    author: 'IngredScan Team',
    category: 'Product Reviews',
    tags: ['ketchup', 'product comparison', 'UK supermarket', 'sugar'],
    readTime: '4 min read',
    featured: false,
    content: `
<p>Ketchup is one of the most common condiments in UK households — found in over 90% of kitchens. But not all ketchups are created equal. We <a href="/scan">scanned</a> 8 popular UK ketchups to compare their ingredients, processing levels, and nutritional profiles.</p>

<h2>What We Compared</h2>
<p>For each ketchup, we looked at the <a href="/blog/what-is-nova-score">NOVA score</a>, IngredScan quality score, sugar content per 100g, number of <a href="/blog/worst-additives-uk-food">additives</a>, and overall ingredient simplicity. All products were scanned using their standard UK formulations as of early 2026.</p>

<h2>The Results</h2>

<h3>1. Heinz Tomato Ketchup</h3>
<p>The UK's best-selling ketchup. Ingredients: tomatoes (148g per 100g ketchup), spirit vinegar, sugar, salt, spice and herb extracts, spice. <strong>NOVA 3</strong>. Relatively simple ingredient list with no artificial additives. However, sugar content is notable at around 23g per 100g.</p>

<h3>2. Heinz No Added Sugar Ketchup</h3>
<p>Replaces sugar with sweetener (sucralose). While it has less sugar (under 3g per 100g), the addition of sucralose and modified corn starch pushes it to <strong>NOVA 4</strong>. This is a common trade-off — reducing sugar often means adding more processed ingredients.</p>

<h3>3. HP Tomato Ketchup</h3>
<p>Contains tomato puree, spirit vinegar, sugar, modified cornflour, salt, onion powder. The modified cornflour makes this <strong>NOVA 4</strong>. Sugar content is comparable to Heinz at around 22g per 100g.</p>

<h3>4. Tesco Tomato Ketchup (Own Brand)</h3>
<p>Tomatoes, sugar, spirit vinegar, modified maize starch, salt, onion powder, garlic powder. <strong>NOVA 4</strong> due to the modified starch. Similar sugar level to branded options. Often less than half the price of Heinz.</p>

<h3>5. Daddies Tomato Ketchup</h3>
<p>Tomatoes, sugar, spirit vinegar, modified maize starch, salt, spice extract. <strong>NOVA 4</strong>. Very similar formulation to HP (both owned by the same parent company). No significant nutritional advantage over competitors.</p>

<h3>6. Mr Organic Tomato Ketchup</h3>
<p>Organic tomatoes, raw cane sugar, apple cider vinegar, sea salt. <strong>NOVA 3</strong>. One of the simplest ingredient lists of any ketchup we tested. Organic certification. Sugar content around 18g per 100g — lower than most. Available at Waitrose, Ocado, and independent stores.</p>

<h3>7. Biona Organic Ketchup</h3>
<p>Organic tomatoes, unrefined cane sugar, cider vinegar, sea salt, mixed spice, garlic. <strong>NOVA 3</strong>. Similar to Mr Organic with a clean, simple recipe. Slightly lower sugar content at approximately 17g per 100g. Widely available in health food shops and some supermarkets.</p>

<h3>8. Stokes Real Tomato Ketchup</h3>
<p>Tomatoes, sugar, spirit vinegar, salt, cayenne pepper, clove, allspice. <strong>NOVA 3</strong>. Made in Suffolk with a traditional recipe. No modified starch or additives. Sugar content around 20g per 100g. Available at Waitrose, Ocado, and independent retailers.</p>

<h2>Key Takeaways</h2>
<ul>
<li><strong>NOVA 3 ketchups</strong> (Heinz Original, Mr Organic, Biona, Stokes) use simple, recognisable ingredients without modified starches or artificial sweeteners</li>
<li><strong>NOVA 4 ketchups</strong> (HP, Tesco own-brand, Daddies, Heinz No Added Sugar) typically contain modified starch, which is an industrially processed ingredient</li>
<li><strong>"No added sugar" doesn't mean healthier</strong> — the Heinz no-sugar variant scores NOVA 4 due to sucralose and modified starch, while the original scores NOVA 3</li>
<li><strong>Sugar content varies</strong> from 3g (no-sugar variants) to 23g per 100g — but all ketchup is a condiment used in small quantities, so the absolute amount consumed is typically low</li>
<li><strong>Price doesn't always correlate</strong> — Heinz Original (NOVA 3) is often cheaper than "healthier" alternatives but has a cleaner ingredient list than some own-brand NOVA 4 options</li>
</ul>

<h2>Our Pick</h2>
<p>If you want the simplest, least processed ketchup widely available in UK supermarkets, Heinz Original Tomato Ketchup is a solid choice — it's NOVA 3, uses real ingredients, and is available everywhere. For an even cleaner option with organic certification and lower sugar, look at Mr Organic or Biona, though they come at a premium price.</p>
<p>The most important thing? Ketchup is a condiment — you're using tablespoons, not cupfuls. Don't lose sleep over which ketchup you buy. Focus your ingredient awareness on the foods you eat in large quantities every day.</p>
`,
  },
  {
    slug: 'how-ingredscan-scores-work',
    title: 'How IngredScan Scores Work: Our Methodology Explained',
    description: 'A transparent look at how IngredScan calculates quality scores, assigns NOVA classifications, and rates additive risk — and the limitations of our approach.',
    date: '2026-02-28',
    author: 'IngredScan Team',
    category: 'Product Updates',
    tags: ['methodology', 'scoring', 'transparency', 'quality score'],
    readTime: '4 min read',
    featured: false,
    content: `
<p>We believe food information tools should be transparent. Here's exactly how IngredScan analyses products and generates scores — including our limitations.</p>

<h2>Data Sources</h2>
<p>When you scan a barcode, IngredScan retrieves product data from <strong>Open Food Facts</strong>, a free, open, collaborative food product database with over 3 million products worldwide (180,000+ UK products). This data is contributed by volunteers and manufacturers, which means:</p>
<ul>
<li>Coverage is extensive but not complete — some products may not be in the database</li>
<li>Data accuracy depends on contributors — ingredient lists, nutrition info, and images are user-submitted</li>
<li>Product formulations change — a product scanned today might have different ingredients than the database entry</li>
</ul>
<p>We supplement Open Food Facts with reference data from the UK Food Standards Agency (FSA) for additive regulations, USDA FoodData Central for nutritional benchmarks, and publicly available supermarket product pages.</p>

<h2>NOVA Classification</h2>
<p>We determine a product's <a href="/blog/what-is-nova-score">NOVA score</a> (1-4) by analysing its ingredient list for marker ingredients characteristic of each processing level. Specifically:</p>
<ul>
<li><strong>NOVA 4 markers:</strong> we check for ingredients like high-fructose corn syrup, hydrogenated oils, modified starches, protein isolates, maltodextrin, emulsifiers (e.g. E471, E433, E322 beyond natural lecithin), flavour enhancers (E621-E635), artificial sweeteners, and artificial colours</li>
<li><strong>NOVA 3:</strong> products with salt, sugar, or oil added to whole foods, without NOVA 4 markers</li>
<li><strong>NOVA 2:</strong> pure culinary ingredients (oils, sugar, flour, etc.)</li>
<li><strong>NOVA 1:</strong> unprocessed or minimally processed whole foods</li>
</ul>
<p>When Open Food Facts already includes a NOVA classification, we use it as a starting point and validate it against our own analysis. In cases of disagreement, we err on the side of the more conservative (higher processing) classification.</p>

<h2>Quality Score (0-10)</h2>
<p>Our proprietary Quality Score provides a more nuanced assessment than NOVA alone. It starts at 10.0 and applies the following adjustments:</p>
<ul>
<li><strong>-1.5 points</strong> per NOVA 4 additive detected (maximum penalty: -4.0 points). This captures the degree of ultra-processing — a product with one emulsifier is penalised less than one with three emulsifiers, flavour enhancers, and modified starch.</li>
<li><strong>-1.0 point</strong> if the Nutri-Score is D or E (poor overall nutritional profile)</li>
<li><strong>-0.5 points</strong> if the Nutri-Score is C</li>
<li><strong>-1.0 point</strong> if saturated fat exceeds 5g per 100g</li>
<li><strong>-0.5 points</strong> if sugar exceeds 10g per 100g</li>
<li><strong>-1.0 point</strong> if salt exceeds 0.6g per 100g (aligned with UK FSA traffic light thresholds)</li>
<li><strong>+0.5 points</strong> if the product has organic certification</li>
</ul>
<p>The final score is clamped between 0.0 and 10.0. A score of 7+ generally indicates a product with minimal processing and decent nutritional profile. A score below 4 indicates significant concerns.</p>

<h2>Additive Risk Ratings</h2>
<p>Each <a href="/blog/worst-additives-uk-food">additive</a> in our database is classified as low, medium, or high risk based on:</p>
<ul>
<li><strong>EU Regulation 1333/2008</strong> — the European framework for permitted food additives, including maximum levels</li>
<li><strong>UK FSA guidance</strong> — specific UK regulatory positions and advisory statements</li>
<li><strong>Published peer-reviewed research</strong> — we review meta-analyses, systematic reviews, and large-scale studies published in reputable journals</li>
</ul>
<p>These are <strong>relative classifications</strong>. "High risk" means an additive has accumulated more published concerns relative to others — it does not mean it is dangerous at the levels found in food. All permitted additives have passed regulatory safety assessments.</p>

<h2>Limitations</h2>
<p>We want to be upfront about what IngredScan cannot do:</p>
<ul>
<li><strong>We are not a medical device.</strong> Our scores are informational tools, not medical advice.</li>
<li><strong>We cannot account for individual allergies or intolerances.</strong> Always read the label if you have specific dietary needs.</li>
<li><strong>Our data may be outdated.</strong> Product formulations change, and database updates lag behind.</li>
<li><strong>NOVA has limitations.</strong> It was designed as a research classification system, not a consumer tool. Some classifications are debatable (e.g. is sourdough with a small amount of ascorbic acid NOVA 3 or NOVA 4?).</li>
<li><strong>Our Quality Score is opinionated.</strong> Any single-number summary of food quality involves trade-offs and simplifications. We've chosen weights that we believe are sensible, but reasonable people could disagree.</li>
</ul>

<h2>Continuous Improvement</h2>
<p>We regularly review and refine our scoring methodology based on new research, user feedback, and data quality improvements. When we make significant changes, we document them and notify users. If you spot an error in a product's data or score, use the Report button on the result page — we review every report and apply corrections within 7 days.</p>
<p>For full details, see our <a href="/disclaimer">disclaimer</a>. Questions about our methodology? Contact us at <a href="mailto:richquidcouk@gmail.com">richquidcouk@gmail.com</a>.</p>
`,
  },
  {
    slug: 'ingredients-to-avoid-skincare',
    title: '10 Skincare Ingredients to Watch Out For in UK Products (Evidence-Based)',
    description: 'A science-backed guide to 10 cosmetic ingredients found in UK skincare products that have attracted regulatory scrutiny or published safety concerns.',
    date: '2026-04-04',
    author: 'IngredScan Team',
    category: 'Cosmetics',
    tags: ['harmful skincare ingredients', 'parabens in skincare', 'fragrance in cosmetics UK', 'cosmetic safety'],
    readTime: '7 min read',
    featured: true,
    content: `
<p>The average person applies 10-15 cosmetic products to their skin every day — from moisturiser and sunscreen to shampoo and deodorant. Most ingredients in these products are safe. But some have attracted regulatory scrutiny, published safety concerns, or outright bans in certain markets.</p>
<p>Here are 10 ingredients commonly found in UK skincare and cosmetic products that are worth understanding. We&apos;ve focused on what the evidence actually says — not internet scare stories.</p>

<h2>1. Formaldehyde and Formaldehyde Releasers</h2>
<p><strong>Risk level: High</strong> · <strong>Found in:</strong> some nail polishes, hair straightening treatments, shampoos</p>
<p>Formaldehyde is classified as a known human carcinogen by the International Agency for Research on Cancer (IARC). While formaldehyde itself is rarely listed on ingredient labels today, several preservatives slowly release it over time: DMDM hydantoin, quaternium-15, imidazolidinyl urea, and diazolidinyl urea.</p>
<p>The EU restricts formaldehyde in cosmetics to 0.1% (except in nail hardeners at 5%), and products exceeding 0.05% must carry a warning label. If you see any of these formaldehyde-releasing preservatives on a label (learn <a href="/blog/how-to-read-cosmetic-labels">how to read cosmetic labels</a>), the product will release small amounts of formaldehyde throughout its shelf life.</p>

<h2>2. Oxybenzone (Benzophenone-3)</h2>
<p><strong>Risk level: High</strong> · <strong>Found in:</strong> chemical sunscreens, lip balms with SPF</p>
<p>Oxybenzone is a UV filter that absorbs into the bloodstream — an FDA study detected it in blood within 2 hours of application at concentrations exceeding the FDA&apos;s safety threshold. It has been detected in breast milk and amniotic fluid. Research has shown weak endocrine-disrupting activity, and it is harmful to coral reefs — Hawaii and Palau have banned sunscreens containing it.</p>
<p>Safer UV filter alternatives include zinc oxide and titanium dioxide (mineral sunscreens), which sit on the skin surface rather than being absorbed.</p>

<h2>3. Parabens (Methyl, Propyl, Butyl, Isobutylparaben)</h2>
<p><strong>Risk level: Medium</strong> · <strong>Found in:</strong> moisturisers, shampoos, makeup, deodorants</p>
<p>Parabens are preservatives that mimic oestrogen in laboratory studies. Butylparaben and propylparaben show stronger oestrogenic activity than methylparaben. The EU has restricted butyl and propylparaben concentrations and banned them entirely in products for children under 3 (nappy area). Many UK brands have voluntarily reformulated to be paraben-free as part of the <a href="/blog/clean-beauty-uk-guide">clean beauty</a> movement.</p>
<p>The scientific picture is nuanced: methylparaben at permitted concentrations is generally considered safe by European regulators. The concern increases with propyl and butylparaben, particularly during pregnancy.</p>

<h2>4. Fragrance / Parfum</h2>
<p><strong>Risk level: Medium</strong> · <strong>Found in:</strong> almost everything — moisturisers, body wash, deodorant, laundry products</p>
<p>The word "Parfum" or "Fragrance" on a label can represent a blend of dozens to hundreds of individual chemicals. Under EU and UK law, manufacturers only need to disclose 26 specific fragrance allergens if they exceed certain concentrations — everything else can be hidden under the umbrella term. Fragrance is one of the top five causes of contact dermatitis globally.</p>
<p>If you have sensitive skin, "fragrance-free" is different from "unscented" — unscented products may still contain masking fragrances.</p>

<h2>5. Sodium Lauryl Sulfate (SLS)</h2>
<p><strong>Risk level: Medium</strong> · <strong>Found in:</strong> shampoos, body wash, toothpaste, facial cleansers</p>
<p>SLS is a surfactant — it creates the foam and lather in cleansing products. It is <strong>not</strong> a carcinogen despite persistent online claims. However, it is a known skin and eye irritant that strips natural oils from the skin. For people with eczema, rosacea, or sensitive skin, SLS can worsen symptoms. Sodium laureth sulfate (SLES) is a milder alternative, though it can be contaminated with 1,4-dioxane during manufacturing.</p>

<h2>6. BHT (Butylated Hydroxytoluene)</h2>
<p><strong>Risk level: High</strong> · <strong>Found in:</strong> lip products, moisturisers, sunscreens, hair products</p>
<p>BHT is a synthetic antioxidant that prevents oils from going rancid. It is permitted in the EU at restricted concentrations but has been flagged as a possible endocrine disruptor. Some studies have found it can cause skin sensitisation at higher concentrations. Many brands have switched to tocopherol (vitamin E) as a natural alternative.</p>

<h2>7. Coal Tar</h2>
<p><strong>Risk level: High</strong> · <strong>Found in:</strong> anti-dandruff shampoos, psoriasis treatments</p>
<p>Coal tar is classified as a known human carcinogen by IARC. It is banned in EU cosmetics but still permitted in the UK in certain medicated products. If you use coal tar shampoo for dandruff, consider alternatives containing zinc pyrithione, ketoconazole, or salicylic acid — all of which are effective without the carcinogen classification.</p>

<h2>8. Phthalates (Dibutyl Phthalate / DBP)</h2>
<p><strong>Risk level: High</strong> · <strong>Found in:</strong> nail polishes, some fragrances</p>
<p>DBP is a plasticiser banned in EU cosmetics due to strong evidence of endocrine disruption and reproductive harm. It is still permitted in some non-EU markets. Check nail polishes for "3-free" or "5-free" labels — these indicate the product is free from the most concerning nail polish chemicals including DBP, toluene, and formaldehyde.</p>

<h2>9. Methylisothiazolinone (MIT) and CMIT</h2>
<p><strong>Risk level: High</strong> · <strong>Found in:</strong> wet wipes, shampoos, liquid soaps, makeup removers</p>
<p>MIT was widely adopted as a "safer" alternative to parabens — but it turned out to be one of the most potent skin sensitisers in cosmetics. The EU banned MIT in leave-on products in 2016 and restricted it in rinse-off products. If you developed a skin allergy to a product in the 2010s, there is a reasonable chance MIT was the culprit.</p>

<h2>10. Chemical UV Filters (Octinoxate, Homosalate, Octocrylene)</h2>
<p><strong>Risk level: Medium</strong> · <strong>Found in:</strong> sunscreens, moisturisers with SPF, foundations with SPF</p>
<p>Several chemical UV filters have come under scrutiny: octinoxate (ethylhexyl methoxycinnamate) penetrates skin and has shown weak hormonal activity; homosalate has been recommended for lower maximum concentrations by the EU Scientific Committee; octocrylene can degrade into benzophenone over time.</p>
<p>Mineral sunscreens using zinc oxide or titanium dioxide remain the gold standard for safety — they reflect UV rather than absorbing it, and do not penetrate the skin significantly.</p>

<h2>How to Use This Information</h2>
<p>Don&apos;t panic about your current products — the dose makes the poison, and all these ingredients are used at regulated concentrations. Instead:</p>
<ul>
<li><strong><a href="/scan">Scan products with IngredScan</a></strong> to see which ingredients are in your cosmetics and their risk ratings</li>
<li><strong>Prioritise changes</strong> for products that stay on your skin longest (moisturisers, sunscreens) over rinse-off products (shampoo, body wash)</li>
<li><strong>During pregnancy</strong>, pay particular attention to retinol, salicylic acid (at high concentrations), parabens, and chemical UV filters</li>
<li><strong>For sensitive skin</strong>, look for fragrance-free, SLS-free formulations</li>
</ul>
<p>Remember: "natural" does not automatically mean safe, and "synthetic" does not automatically mean harmful. The evidence for each ingredient should be assessed individually.</p>
`,
  },
  {
    slug: 'how-to-read-cosmetic-labels',
    title: 'How to Read a Cosmetic Ingredient List: A Plain English Guide',
    description: 'Demystify INCI names, understand ingredient order, and learn what to look for on cosmetic labels in the UK — no chemistry degree required.',
    date: '2026-04-01',
    author: 'IngredScan Team',
    category: 'Education',
    tags: ['INCI ingredients', 'cosmetic label guide', 'what ingredients mean skincare', 'cosmetic labels UK'],
    readTime: '6 min read',
    featured: false,
    content: `
<p>You&apos;ve probably turned over a moisturiser or shampoo bottle and been confronted with a wall of Latin-sounding names. "Aqua, Glycerin, Cetearyl Alcohol, Dimethicone..." — what does any of it mean? And why don&apos;t they just write it in English?</p>
<p>Here&apos;s your complete guide to understanding cosmetic ingredient lists in the UK.</p>

<h2>Why Are Cosmetic Ingredients Written in Latin?</h2>
<p>Cosmetic ingredients use the INCI system — International Nomenclature of Cosmetic Ingredients. This standardised naming system was created so that the same ingredient has the same name regardless of what country you buy the product in. "AQUA" means water whether you&apos;re in London, Tokyo, or Sao Paulo.</p>
<p>Under EU and UK law (EU Cosmetics Regulation 1223/2009, retained in UK law), all cosmetic products must list their ingredients using INCI names on the packaging.</p>

<h2>The Order Matters</h2>
<p>Ingredients are listed in descending order of concentration. The first ingredient is present in the highest amount, and the last ingredient in the smallest amount.</p>
<p>There&apos;s an important exception: ingredients present at less than 1% concentration can be listed in any order after the 1% line. Unfortunately, that line isn&apos;t marked on the label — but with experience you can estimate it.</p>
<p><strong>Rule of thumb:</strong> In most skincare products, the first 5-7 ingredients make up the vast majority of the formula. Everything after phenoxyethanol (a common preservative used at 1% or less) is likely below 1%.</p>

<h2>Common INCI Names Decoded</h2>

<h3>The Base (first few ingredients)</h3>
<ul>
<li><strong>AQUA</strong> = Water. Almost always first in water-based products.</li>
<li><strong>GLYCERIN</strong> = Glycerine. A humectant that draws moisture to skin. One of the safest, most effective skincare ingredients.</li>
<li><strong>DIMETHICONE</strong> = A silicone that creates a smooth, protective feel. Not absorbed by skin.</li>
<li><strong>CETEARYL ALCOHOL / CETYL ALCOHOL</strong> = Fatty alcohols (not drying alcohols). They condition and thicken formulas.</li>
</ul>

<h3>The Active Ingredients</h3>
<ul>
<li><strong>NIACINAMIDE</strong> = Vitamin B3. Brightens, reduces pores, strengthens barrier. Very well evidenced.</li>
<li><strong>RETINOL</strong> = Vitamin A. Anti-ageing gold standard. Avoid during pregnancy.</li>
<li><strong>ASCORBIC ACID</strong> = Vitamin C. Antioxidant and brightener.</li>
<li><strong>HYALURONIC ACID</strong> = A hydrating molecule that holds 1000x its weight in water.</li>
<li><strong>SALICYLIC ACID</strong> = BHA. Exfoliates inside pores. Great for acne.</li>
<li><strong>TOCOPHEROL</strong> = Vitamin E. Antioxidant and skin conditioner.</li>
</ul>

<h3>The Preservatives</h3>
<ul>
<li><strong>PHENOXYETHANOL</strong> = A widely used preservative. Generally well tolerated.</li>
<li><strong>SODIUM BENZOATE / POTASSIUM SORBATE</strong> = Mild preservatives common in "clean" beauty.</li>
<li><strong>METHYLPARABEN / PROPYLPARABEN</strong> = Paraben preservatives. Effective but controversial — many <a href="/blog/clean-beauty-uk-guide">clean beauty</a> brands avoid them.</li>
</ul>

<h3>The Texture and Feel</h3>
<ul>
<li><strong>CARBOMER</strong> = Creates gel texture.</li>
<li><strong>XANTHAN GUM</strong> = Natural thickener from bacterial fermentation.</li>
<li><strong>SODIUM HYDROXIDE</strong> = Lye. Used in tiny amounts to adjust pH. Safe in finished products.</li>
<li><strong>CITRIC ACID</strong> = pH adjuster from citrus. Completely safe.</li>
</ul>

<h2>Plant Ingredients: The Latin Names</h2>
<p>INCI requires plant ingredients to use their Latin botanical name followed by the plant part and preparation method:</p>
<ul>
<li><strong>ALOE BARBADENSIS LEAF JUICE</strong> = Aloe vera</li>
<li><strong>BUTYROSPERMUM PARKII BUTTER</strong> = Shea butter</li>
<li><strong>COCOS NUCIFERA OIL</strong> = Coconut oil</li>
<li><strong>HELIANTHUS ANNUUS SEED OIL</strong> = Sunflower oil</li>
<li><strong>ARGANIA SPINOSA KERNEL OIL</strong> = Argan oil</li>
<li><strong>CAMELLIA SINENSIS LEAF EXTRACT</strong> = Green tea extract</li>
<li><strong>ROSA CANINA SEED OIL</strong> = Rosehip oil</li>
</ul>
<p>This is why ingredient lists look so intimidating — perfectly ordinary plant oils get scientific names.</p>

<h2>Colour Index (CI) Numbers</h2>
<p>Colours in cosmetics use CI (Colour Index) numbers:</p>
<ul>
<li><strong>CI 77891</strong> = Titanium dioxide (white pigment)</li>
<li><strong>CI 77491</strong> = Iron oxide red</li>
<li><strong>CI 77492</strong> = Iron oxide yellow</li>
<li><strong>CI 77499</strong> = Iron oxide black</li>
</ul>
<p>These mineral pigments are safe. They&apos;re the coloured ingredients in foundations, eyeshadows, and blushes. "May contain" sections list all possible colours used across shade variants.</p>

<h2>Red Flags to Watch For</h2>
<p>When scanning an ingredient list, here are patterns that warrant closer inspection (see our full guide to <a href="/blog/ingredients-to-avoid-skincare">ingredients to avoid in skincare</a>):</p>
<ul>
<li><strong>PARFUM / FRAGRANCE</strong> early in the list = high fragrance concentration. Greater sensitisation risk.</li>
<li><strong>Multiple parabens</strong> = the product uses paraben cocktails. Consider paraben-free alternatives.</li>
<li><strong>DMDM HYDANTOIN, QUATERNIUM-15</strong> = formaldehyde releasers. Avoid if possible.</li>
<li><strong>ALCOHOL DENAT. in the first 5 ingredients</strong> = high alcohol content. Can be drying for skin.</li>
</ul>

<h2>The Easy Way: Use IngredScan</h2>
<p>Rather than memorising INCI names, <a href="/scan">scan any cosmetic product</a> with IngredScan. We automatically identify every ingredient, match it against our database of 100+ documented cosmetic ingredients, and flag anything of concern. Each ingredient gets a risk rating (low, medium, high) with an evidence-based explanation.</p>
<p>The goal isn&apos;t to make you afraid of your products — it&apos;s to give you the knowledge to make informed choices about what you put on your skin every day.</p>
`,
  },
  {
    slug: 'clean-beauty-uk-guide',
    title: 'Clean Beauty in the UK: What It Actually Means and What to Look For',
    description: 'The clean beauty movement is booming in the UK — but the term has no legal definition. Here is what it means in practice and how to shop smarter.',
    date: '2026-03-25',
    author: 'IngredScan Team',
    category: 'Cosmetics',
    tags: ['clean beauty UK', 'natural cosmetics', 'paraben free UK', 'cosmetic shopping guide'],
    readTime: '5 min read',
    featured: false,
    content: `
<p>Walk into any Boots, Superdrug, or Space NK and you&apos;ll see "clean beauty" sections, "clean" labels, and brands marketing themselves as "clean." But what does "clean" actually mean in the context of UK cosmetics? The short answer: whatever the brand wants it to mean.</p>

<h2>Clean Beauty Has No Legal Definition</h2>
<p>Unlike "organic" (which has EU/UK certification requirements) or the EU Cosmetics Regulation (which governs ingredient safety), "clean beauty" is not defined or regulated in UK or EU law. There is no standard, no certification, and no enforcement body.</p>
<p>This means brands set their own definitions. Some define "clean" as free from a specific list of ingredients (parabens, sulphates, silicones, fragrance). Others define it as "non-toxic" — but all legally sold cosmetics are by definition non-toxic at permitted concentrations. Some use it interchangeably with "natural" or "organic."</p>
<p>The result: two products both labelled "clean" can have vastly different ingredient standards.</p>

<h2>What Clean Beauty Usually Means in Practice</h2>
<p>While there is no single standard, most UK brands using "clean beauty" positioning tend to exclude some or all of the following:</p>
<ul>
<li><strong>Parabens</strong> — preservatives with weak oestrogenic activity (see our <a href="/blog/ingredients-to-avoid-skincare">ingredients to watch out for</a> guide)</li>
<li><strong>SLS/SLES</strong> — sulphate surfactants that can be irritating</li>
<li><strong>Silicones</strong> — synthetic polymers (dimethicone, cyclomethicone)</li>
<li><strong>Synthetic fragrance</strong> — undisclosed chemical blends labelled as "Parfum"</li>
<li><strong>Mineral oil</strong> — petroleum-derived occlusive</li>
<li><strong>PEGs</strong> — polyethylene glycol compounds</li>
<li><strong>Formaldehyde releasers</strong> — DMDM hydantoin, quaternium-15, etc.</li>
</ul>
<p>This list is reasonable but not universally applied. Some "clean" brands exclude all of the above; others exclude only some.</p>

<h2>Clean vs Natural vs Organic</h2>
<p>These terms are not interchangeable:</p>
<ul>
<li><strong>Clean</strong> = generally avoids certain controversial synthetic ingredients. No legal standard.</li>
<li><strong>Natural</strong> = uses plant-derived or mineral ingredients. No legal standard in UK cosmetics, though COSMOS and NATRUE offer certification.</li>
<li><strong>Organic</strong> = ingredients grown without synthetic pesticides or fertilisers. The Soil Association certifies organic cosmetics in the UK; COSMOS is the EU standard. This has legal backing.</li>
</ul>
<p>A product can be "clean" but synthetic (like a silicone-free, paraben-free moisturiser with synthetic humectants). A product can be "natural" but not "clean" (like a natural soap with essential oils that cause sensitisation). And a product can be organic but still contain irritating ingredients.</p>

<h2>The Problem With Ingredient Fear</h2>
<p>The clean beauty movement has done good things — it has pushed brands to disclose more, reformulate questionable products, and offer alternatives for sensitive skin. But it has also created unnecessary fear around ingredients that are perfectly safe:</p>
<ul>
<li><strong>Dimethicone</strong> is not absorbed by the skin and is one of the safest topical ingredients. It is excluded from many "clean" lists due to environmental persistence, not safety.</li>
<li><strong>Mineral oil</strong> (cosmetic grade) is highly refined and does not penetrate skin. Dermatologists regularly recommend it for eczema.</li>
<li><strong>Phenoxyethanol</strong> is a preservative that replaced parabens in many formulations — and without effective preservation, products grow mould and bacteria, which is far more dangerous than any preservative.</li>
</ul>
<p>The danger of ingredient blacklists is that they focus on removing things rather than evaluating the overall formula. A product with "clean" marketing but poor formulation is not better than a well-formulated product containing a trace of dimethicone.</p>

<h2>Where to Find Clean Beauty in the UK</h2>
<p>If you want to shop with ingredient awareness in the UK, here are some options:</p>
<ul>
<li><strong>Holland &amp; Barrett</strong> — extensive natural and organic skincare range, in-house "clean" standards</li>
<li><strong>Boots</strong> — now has a "Clean Beauty" edit. Look for brands like The Ordinary, CeraVe, and own-brand "Botanics"</li>
<li><strong>Superdrug</strong> — affordable options including own-brand "Naturally Radiant" range</li>
<li><strong>Space NK</strong> — premium "clean" brands like Drunk Elephant, Tata Harper, REN</li>
<li><strong>Content Beauty</strong> — London-based retailer specialising in genuinely clean and organic beauty</li>
<li><strong>Look Fantastic</strong> — online retailer with clean beauty filters</li>
</ul>

<h2>How to Actually Shop Smarter</h2>
<p>Instead of relying on "clean" labels, use these evidence-based approaches:</p>
<ol>
<li><strong><a href="/scan">Scan the product with IngredScan</a></strong> — our cosmetic scoring analyses every INCI ingredient against published evidence and EU regulatory status. No marketing claims, just data.</li>
<li><strong>Focus on your specific concerns</strong> — if you have sensitive skin, prioritise fragrance-free products. If you&apos;re pregnant, check for retinol and certain preservatives. Don&apos;t avoid everything on every list.</li>
<li><strong><a href="/blog/how-to-read-cosmetic-labels">Read the ingredient list</a></strong> — the first 5-7 ingredients make up most of the formula. Focus your attention there.</li>
<li><strong>Look for certifications with legal backing</strong> — COSMOS, Soil Association Organic, Leaping Bunny (cruelty-free), and The Vegan Society mark all have actual audit and certification processes behind them.</li>
<li><strong>Be sceptical of "free from" marketing</strong> — a product that is "free from 1,500 ingredients" sounds impressive but is meaningless if those ingredients were never going to be in that type of product anyway.</li>
</ol>
<p>The bottom line: "clean beauty" is a marketing category, not a safety standard. Use it as a starting point, but verify with actual ingredient data.</p>
`,
  },
]

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getPostBySlug(slug)
  if (!post) return []
  return posts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.category === post.category ? 1 : 0
      const bMatch = b.category === post.category ? 1 : 0
      if (bMatch !== aMatch) return bMatch - aMatch
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, limit)
}
