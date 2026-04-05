import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import NewsletterSignup from './NewsletterSignup'
import InstallBanner from '@/components/InstallBanner'

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: 'IngredScan Team' }],
    alternates: {
      canonical: `https://www.ingredscan.com/blog/${params.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `https://www.ingredscan.com/blog/${params.slug}`,
      publishedTime: post.date,
      authors: ['IngredScan Team'],
      tags: post.tags,
      images: [{
        url: `/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [`/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`],
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(params.slug, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: `https://www.ingredscan.com/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'IngredScan',
      url: 'https://www.ingredscan.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'IngredScan',
      url: 'https://www.ingredscan.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.ingredscan.com/icons/icon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.ingredscan.com/blog/${post.slug}`,
    },
    keywords: post.tags?.join(', '),
    articleSection: post.category,
    inLanguage: 'en-GB',
  }

  return (
    <div className="min-h-screen px-5 py-10 max-w-2xl mx-auto relative z-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Install Banner — top of post */}
      <div className="mb-6">
        <InstallBanner variant="blog" />
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-8 flex-wrap" style={{ color: 'rgba(240,240,244,0.5)' }}>
        <Link href="/" className="hover:underline" style={{ color: 'rgba(240,240,244,0.5)' }}>Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:underline" style={{ color: 'rgba(240,240,244,0.5)' }}>Blog</Link>
        <span>/</span>
        <span style={{ color: 'rgba(240,240,244,0.6)' }} className="truncate max-w-[200px] sm:max-w-none">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-10 animate-fadeUp">
        <span
          className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-4"
          style={{ backgroundColor: 'rgba(0,229,160,0.12)', color: '#00e5a0' }}
        >
          {post.category}
        </span>
        <h1 className="text-2xl sm:text-3xl heading-display mb-4" style={{ color: '#f0f0f4' }}>
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>
          <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>{post.readTime}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>
      </div>

      {/* Article Body */}
      <article
        className="blog-prose mb-12 animate-fadeUp"
        style={{ animationDelay: '100ms' }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Install App Banner */}
      <InstallBanner variant="blog" />

      {/* CTA Box */}
      <div
        className="rounded-2xl p-6 text-center mb-12 animate-fadeUp"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,160,0.08), rgba(124,111,255,0.08))',
          border: '1px solid rgba(255,255,255,0.08)',
          animationDelay: '150ms',
        }}
      >
        <h3 className="text-lg font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
          Scan this product instantly
        </h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(240,240,244,0.5)' }}>
          Curious about a product mentioned in this article? Scan it now and get a full breakdown.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold btn-glow"
          style={{ color: '#0b0b0f' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
          Scan Now
        </Link>
      </div>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* Tags */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-xs"
              style={{ backgroundColor: 'rgba(19,19,26,0.8)', color: 'rgba(240,240,244,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <div>
          <div className="gradient-divider mb-8" />
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(240,240,244,0.5)' }}>
            Related Articles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="rounded-xl p-4 glass-card card-hover-glow"
              >
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2"
                  style={{ backgroundColor: 'rgba(124,111,255,0.12)', color: '#7c6fff', fontSize: '0.65rem' }}
                >
                  {rp.category}
                </span>
                <h4 className="text-sm font-semibold mb-1.5 line-clamp-2" style={{ color: '#f0f0f4', letterSpacing: '-0.01em' }}>
                  {rp.title}
                </h4>
                <span className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>{rp.readTime}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
