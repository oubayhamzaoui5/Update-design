import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getAllPublishedPosts } from '@/lib/services/posts.service'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

/* ─── SEO ──────────────────────────────────────────────────────── */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

export const metadata: Metadata = {
  title: 'Blog Décoration — Conseils & Tendances | Update Design Tunisie',
  description:
    'Conseils décoration, tendances intérieur et extérieur, guides matériaux — le blog Update Design pour hôteliers, promoteurs immobiliers et particuliers en Tunisie.',
  openGraph: {
    title: 'Blog Update Design — Décoration & Inspirations',
    description: 'Tendances, conseils et inspirations décoration pour vos projets hôteliers, immobiliers et résidentiels en Tunisie.',
    url: `${siteUrl}/blog`,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  alternates: { canonical: '/blog' },
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* ─── Tokens ───────────────────────────────────────────────────── */
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'
const SLATE   = '#1A2028'

/* ─── Page ─────────────────────────────────────────────────────── */
export default async function BlogPage() {
  const posts = await getAllPublishedPosts()
  const [featured, ...rest] = posts

  return (
    <div style={{ fontFamily: BODY, background: CREAM }}>
      <Navbar reserveSpace />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden py-24 md:py-32"
        style={{ background: SLATE }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #C4A23E 0, #C4A23E 1px, transparent 0, transparent 50%)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
          <p
            style={{
              fontFamily: BODY,
              fontSize: 10,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: GOLD,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            Le Blog
          </p>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 400,
              color: CREAM,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            Décoration,<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.55)' }}>Tendances & Conseils.</em>
          </h1>
          <p
            style={{
              fontFamily: BODY,
              fontSize: '1rem',
              color: 'rgba(253,250,245,0.55)',
              maxWidth: 480,
              lineHeight: 1.7,
            }}
          >
            Inspirations matériaux, conseils pose et tendances décoration pour vos projets
            hôteliers, immobiliers et résidentiels.
          </p>
        </div>
      </header>

      {/* ── POSTS ────────────────────────────────────────────── */}
      <main>
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
          {posts.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-28 text-center"
              style={{ border: `1px solid rgba(196,162,62,0.15)`, background: CREAM }}
            >
              <p
                style={{
                  fontFamily: DISPLAY,
                  fontSize: '2rem',
                  fontWeight: 400,
                  color: DARK,
                }}
              >
                Aucun article publié pour le moment.
              </p>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: '0.85rem',
                  color: 'rgba(28,26,20,0.4)',
                  marginTop: 8,
                }}
              >
                Revenez bientôt pour de nouvelles inspirations.
              </p>
            </div>
          ) : (
            <>
              {/* Featured article */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group mb-16 block">
                  <article
                    className="grid overflow-hidden transition-all duration-300 md:grid-cols-2"
                    style={{ border: `1px solid rgba(196,162,62,0.18)` }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
                      {featured.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featured.coverImage}
                          alt={featured.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="h-full min-h-[340px] w-full" style={{ background: SLATE }} />
                      )}
                    </div>

                    <div
                      className="flex flex-col justify-center p-8 md:p-12"
                      style={{ background: CREAM }}
                    >
                      <div className="mb-5 flex items-center gap-3">
                        <span
                          style={{
                            fontFamily: BODY,
                            fontSize: 9,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: GOLD,
                            fontWeight: 700,
                            border: `1px solid rgba(196,162,62,0.3)`,
                            padding: '3px 10px',
                          }}
                        >
                          À la une
                        </span>
                      </div>

                      <h2
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                          fontWeight: 400,
                          color: DARK,
                          lineHeight: 1.05,
                          letterSpacing: '-0.01em',
                          marginBottom: 14,
                        }}
                      >
                        {featured.title}
                      </h2>

                      {featured.excerpt && (
                        <p
                          style={{
                            fontFamily: BODY,
                            fontSize: '0.9rem',
                            color: 'rgba(28,26,20,0.55)',
                            lineHeight: 1.7,
                            marginBottom: 24,
                          }}
                          className="line-clamp-3"
                        >
                          {featured.excerpt}
                        </p>
                      )}

                      <span
                        className="inline-flex items-center gap-2 transition-all duration-200 group-hover:gap-3"
                        style={{
                          fontFamily: BODY,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: GOLD,
                        }}
                      >
                        Lire l&apos;article <ArrowRight size={12} />
                      </span>
                    </div>
                  </article>
                </Link>
              )}

              {/* Rest of articles */}
              {rest.length > 0 && (
                <>
                  <div
                    className="mb-10 flex items-center gap-5"
                  >
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 9,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'rgba(28,26,20,0.35)',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      Tous les articles
                    </p>
                    <div
                      className="flex-1"
                      style={{ height: 1, background: 'rgba(196,162,62,0.18)' }}
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg"
                        style={{ border: `1px solid rgba(196,162,62,0.15)` }}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          {post.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="h-full w-full" style={{ background: SLATE }} />
                          )}
                        </div>

                        <div
                          className="flex flex-1 flex-col p-6"
                          style={{ background: CREAM }}
                        >
                          <h3
                            style={{
                              fontFamily: DISPLAY,
                              fontSize: '1.3rem',
                              fontWeight: 400,
                              color: DARK,
                              lineHeight: 1.1,
                              letterSpacing: '-0.01em',
                              marginBottom: 10,
                            }}
                            className="line-clamp-2"
                          >
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p
                              style={{
                                fontFamily: BODY,
                                fontSize: '0.82rem',
                                color: 'rgba(28,26,20,0.5)',
                                lineHeight: 1.6,
                                marginBottom: 16,
                                flex: 1,
                              }}
                              className="line-clamp-2"
                            >
                              {post.excerpt}
                            </p>
                          )}

                          <span
                            className="mt-auto inline-flex items-center gap-2 transition-all duration-200 group-hover:gap-3"
                            style={{
                              fontFamily: BODY,
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '0.18em',
                              textTransform: 'uppercase',
                              color: GOLD,
                            }}
                          >
                            Lire <ArrowRight size={11} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
