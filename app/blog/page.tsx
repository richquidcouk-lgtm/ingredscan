import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import InstallBanner from '@/components/InstallBanner'

export const metadata: Metadata = {
  title: 'Blog — IngredScan',
  description: 'Articles about food processing, additives, NOVA scores, and making healthier choices at UK supermarkets.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featured = posts.find((p) => p.featured)
  const remaining = posts.filter((p) => !p.featured)

  return (
    <div className="min-h-screen px-5 py-10 max-w-3xl mx-auto relative z-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
        style={{ color: 'rgba(240,240,244,0.4)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Home
      </Link>

      {/* Install Banner */}
      <div className="mb-8">
        <InstallBanner />
      </div>

      <div className="text-center mb-12 animate-fadeUp">
        <h1
          className="text-3xl sm:text-4xl heading-display mb-4"
          style={{
            background: 'linear-gradient(135deg, #f0f0f4 0%, #00e5a0 50%, #7c6fff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          The IngredScan Blog
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Evidence-based articles about food processing, additives, and making informed choices at the supermarket.
        </p>
      </div>

      {/* Featured Post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="block rounded-2xl p-6 sm:p-8 glass-card card-hover-glow mb-8 animate-fadeUp"
          style={{ animationDelay: '100ms' }}
        >
          <span
            className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-4"
            style={{ backgroundColor: 'rgba(0,229,160,0.12)', color: '#00e5a0' }}
          >
            {featured.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold heading-display mb-3" style={{ color: '#f0f0f4' }}>
            {featured.title}
          </h2>
          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'rgba(240,240,244,0.5)' }}>
            {featured.description}
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(240,240,244,0.3)' }}>
            <span>{featured.readTime}</span>
            <span>·</span>
            <span>{new Date(featured.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </Link>
      )}

      {/* Remaining Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {remaining.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl p-5 glass-card card-hover-glow animate-fadeUp"
            style={{ animationDelay: `${200 + i * 80}ms` }}
          >
            <span
              className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3"
              style={{ backgroundColor: 'rgba(124,111,255,0.12)', color: '#7c6fff' }}
            >
              {post.category}
            </span>
            <h3 className="text-base font-bold mb-2 line-clamp-2" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>
              {post.title}
            </h3>
            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'rgba(240,240,244,0.4)' }}>
              {post.description}
            </p>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(240,240,244,0.25)' }}>
              <span>{post.readTime}</span>
              <span>·</span>
              <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
