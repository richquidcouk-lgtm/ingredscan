/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.ingredscan.com',
  generateRobotsTxt: false,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/account',
    '/history',
    '/api/*',
    '/admin/*',
    '/result/*',
    '/pro',
  ],
  additionalPaths: async () => {
    const paths = []

    const staticPages = [
      { loc: '/', priority: 1.0, changefreq: 'weekly' },
      { loc: '/scan', priority: 0.8, changefreq: 'monthly' },
      { loc: '/blog', priority: 0.9, changefreq: 'weekly' },
      { loc: '/privacy', priority: 0.3, changefreq: 'yearly' },
      { loc: '/cookies', priority: 0.3, changefreq: 'yearly' },
      { loc: '/terms', priority: 0.3, changefreq: 'yearly' },
      { loc: '/disclaimer', priority: 0.4, changefreq: 'monthly' },
    ]

    staticPages.forEach(page => {
      paths.push({
        loc: page.loc,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority,
      })
    })

    const blogPosts = [
      { slug: 'what-is-nova-score', lastmod: '2026-03-28', priority: 0.9 },
      { slug: 'ultra-processed-food-uk-guide', lastmod: '2026-03-20', priority: 0.9 },
      { slug: 'worst-additives-uk-food', lastmod: '2026-03-14', priority: 0.8 },
      { slug: 'healthiest-ketchup-uk', lastmod: '2026-03-07', priority: 0.8 },
      { slug: 'how-ingredscan-scores-work', lastmod: '2026-02-28', priority: 0.7 },
      { slug: 'ingredients-to-avoid-skincare', lastmod: '2026-04-04', priority: 0.9 },
      { slug: 'how-to-read-cosmetic-labels', lastmod: '2026-04-01', priority: 0.8 },
      { slug: 'clean-beauty-uk-guide', lastmod: '2026-03-25', priority: 0.8 },
    ]

    blogPosts.forEach(post => {
      paths.push({
        loc: `/blog/${post.slug}`,
        lastmod: post.lastmod,
        changefreq: 'monthly',
        priority: post.priority,
      })
    })

    return paths
  },
}
