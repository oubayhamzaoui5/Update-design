import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import ReadingProgress from './_components/reading-progress'
import { getPostBySlug, getAllPublishedPosts } from '@/lib/services/posts.service'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

/* ─── Tokens ─────────────────────────────────────────────────��─── */
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'
const SLATE   = '#1A2028'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

type BlogPostPageProps = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article introuvable | Update Design Blog',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${post.title} | Blog Update Design`,
    description: post.excerpt || post.title,
    openGraph: {
      title: `${post.title} | Blog Update Design`,
      description: post.excerpt || post.title,
      type: 'article',
      url: `${siteUrl}/blog/${slug}`,
      siteName: 'Update Design',
      locale: 'fr_TN',
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: { canonical: `/blog/${slug}` },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const allPosts   = await getAllPublishedPosts()
  const otherPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <div style={{ fontFamily: BODY, background: CREAM }}>
      <Navbar reserveSpace />
      <ReadingProgress />

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
        <div className="relative mx-auto max-w-4xl px-6 md:px-10">
          <Link
            href="/blog"
            className="mb-10 inline-flex items-center gap-2 transition-all duration-200 hover:gap-3"
            style={{
              fontFamily: BODY,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(253,250,245,0.5)',
              display: 'inline-flex',
            }}
          >
            <ArrowLeft size={11} /> Retour au Blog
          </Link>

          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 400,
              color: CREAM,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p
              style={{
                fontFamily: BODY,
                fontSize: '1rem',
                color: 'rgba(253,250,245,0.6)',
                maxWidth: 600,
                lineHeight: 1.7,
              }}
            >
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {/* ── COVER IMAGE ──────────────────────────────────────── */}
      {post.coverImage && (
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <div
            className="relative -mt-8 aspect-video overflow-hidden"
            style={{ border: `1px solid rgba(196,162,62,0.2)` }}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1600}
              height={900}
              unoptimized
              priority
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, 860px"
            />
          </div>
        </div>
      )}

      {/* ── ARTICLE CONTENT ──────────────────────────────────── */}
      <article className="mx-auto w-full max-w-4xl px-6 py-14 md:px-10 md:py-20">
        <div
          className="overflow-hidden p-8 md:p-12 lg:p-14"
          style={{ background: '#FFFFFF', border: `1px solid rgba(196,162,62,0.12)` }}
        >
          <style>{`
            .ud-prose h2 {
              font-family: ${DISPLAY};
              font-weight: 400;
              font-size: 2rem;
              letter-spacing: -0.01em;
              color: ${DARK};
              margin-top: 2.5rem;
              margin-bottom: 1rem;
              line-height: 1.05;
            }
            .ud-prose h3 {
              font-family: ${DISPLAY};
              font-weight: 400;
              font-size: 1.4rem;
              letter-spacing: -0.01em;
              color: ${DARK};
              margin-top: 2rem;
              margin-bottom: 0.75rem;
              line-height: 1.1;
            }
            .ud-prose p {
              font-family: ${BODY};
              font-size: 1rem;
              line-height: 1.85;
              color: rgba(28,26,20,0.72);
              margin-bottom: 1.25rem;
            }
            .ud-prose strong {
              font-weight: 600;
              color: ${DARK};
            }
            .ud-prose ul, .ud-prose ol {
              font-family: ${BODY};
              font-size: 1rem;
              line-height: 1.85;
              color: rgba(28,26,20,0.72);
              margin-bottom: 1.25rem;
              padding-left: 1.5rem;
            }
            .ud-prose li {
              margin-bottom: 0.5rem;
            }
            .ud-prose blockquote {
              border-left: 2px solid ${GOLD};
              padding: 1rem 1.5rem;
              margin: 1.5rem 0;
              background: rgba(196,162,62,0.04);
              font-style: italic;
              font-family: ${DISPLAY};
              font-size: 1.2rem;
              color: rgba(28,26,20,0.65);
            }
            .ud-prose img {
              border: 1px solid rgba(196,162,62,0.15);
              margin: 1.5rem 0;
              width: 100%;
            }
            .ud-prose a {
              color: ${GOLD};
              font-weight: 600;
              text-decoration: underline;
              text-decoration-color: rgba(196,162,62,0.4);
            }
            .ud-prose h2:first-child {
              margin-top: 0;
            }
          `}</style>
          <div
            className="ud-prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Footer nav */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/blog"
            className="flex flex-1 items-center justify-center gap-2 transition-all duration-200 hover:gap-3"
            style={{
              fontFamily: BODY,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: DARK,
              border: `1px solid rgba(28,26,20,0.2)`,
              padding: '14px 24px',
            }}
          >
            <ArrowLeft size={12} /> Tous les Articles
          </Link>
          <Link
            href="/contact"
            className="flex flex-1 items-center justify-center gap-2 transition-all duration-200 hover:brightness-110"
            style={{
              fontFamily: BODY,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: DARK,
              background: GOLD,
              padding: '14px 24px',
            }}
          >
            Demander un Devis <ArrowRight size={12} />
          </Link>
        </div>
      </article>

      {/* ── READ NEXT ────────────────────────────────────────── */}
      {otherPosts.length > 0 && (
        <section
          className="px-6 py-16 md:px-10 md:py-20"
          style={{ borderTop: `1px solid rgba(196,162,62,0.15)` }}
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex items-center gap-5">
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
                Lire aussi
              </p>
              <div
                className="flex-1"
                style={{ height: 1, background: 'rgba(196,162,62,0.18)' }}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {otherPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg"
                  style={{ border: `1px solid rgba(196,162,62,0.15)` }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="h-full w-full" style={{ background: SLATE }} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6" style={{ background: CREAM }}>
                    <h3
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: '1.3rem',
                        fontWeight: 400,
                        color: DARK,
                        lineHeight: 1.1,
                        letterSpacing: '-0.01em',
                        marginBottom: 12,
                      }}
                      className="line-clamp-2"
                    >
                      {p.title}
                    </h3>
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
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
