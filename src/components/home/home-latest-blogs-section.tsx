'use client'

import { useRef } from 'react'
import Link from 'next/link'

import type { BlogPostPreview } from '@/types/post.types'

type HomeLatestBlogsSectionProps = {
  posts: BlogPostPreview[]
}

export default function HomeLatestBlogsSection({ posts }: HomeLatestBlogsSectionProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null)

  const scrollByCard = (direction: 'left' | 'right') => {
    const slider = sliderRef.current
    if (!slider) return

    const firstCard = slider.querySelector<HTMLElement>('[data-blog-card]')
    if (!firstCard) return

    const sliderStyles = window.getComputedStyle(slider)
    const gap = parseFloat(sliderStyles.columnGap || sliderStyles.gap || '0')
    const cardWidth = firstCard.getBoundingClientRect().width
    const offset = cardWidth + gap
    const delta = direction === 'left' ? -offset : offset

    slider.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="bg-white px-2 py-10 md:py-14 xl:py-18">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 lg:mb-10 flex items-end justify-between gap-6">
          <div className="w-full">
            <p className="mb-1 lg:mb-3 text-xs lg:text-sm font-bold uppercase tracking-[0.18em] text-accent">
              Inspiration & Conseils
            </p>
            <h2 className="text-xl font-bold text-slate-900 md:text-4xl">
              Derniers articles de Blog
            </h2>
            <div className="mt-3 lg:mt-4 flex items-center gap-3">
              <Link
                href="/blog"
                className="inline-flex border-b border-accent/25 pb-1 text-sm font-bold uppercase tracking-[0.12em] text-accent transition hover:border-accent"
              >
                Voir tous les articles
              </Link>
              <div className="ml-auto hidden lg:flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => scrollByCard('left')}
                  aria-label="Article precedent"
                  className="inline-flex cursor-pointer items-center justify-center bg-transparent border-none p-0 text-5xl font-black leading-none text-slate-400 transition hover:text-slate-500"
                >
                  {'<'}
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard('right')}
                  aria-label="Article suivant"
                  className="inline-flex cursor-pointer items-center justify-center bg-transparent border-none p-0 text-5xl font-black leading-none text-accent transition hover:opacity-80"
                >
                  {'>'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-600">
            Aucun article publie pour le moment.
          </div>
        ) : (
          <div ref={sliderRef} className="blog-slider flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory">
              {posts.map((post) => (
                <div key={post.id} data-blog-card className="w-[74%] shrink-0 snap-start md:w-[48%] lg:w-[40%]">
                  <article className="overflow-hidden ">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-video w-full rounded-sm object-cover"
                      />
                    ) : (
                      <div className="aspect-video w-full bg-slate-100" />
                    )}

                    <div className="space-y-0 px-3 py-1.5 md:px-4 md:py-2">
                   
                      <h3 className="mb-2 line-clamp-1 text-lg font-bold text-slate-900 md:mb-3 md:text-xl">{post.title}</h3>
                      <p className="mb-2 line-clamp-4 text-xs leading-relaxed text-slate-600 md:text-sm">
                        {post.excerpt || 'Decouvrez cet article sur notre blog.'}
                      </p>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex border-b border-accent/25 pb-1 text-sm font-bold uppercase tracking-[0.12em] text-accent transition hover:border-accent"
                      >
                        LIRE LA SUITE
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .blog-slider {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .blog-slider::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
    </section>
  )
}
