"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

type Post = {
  id: string
  slug: string
  title: string
  excerpt?: string
  coverImage?: string
  created?: string
}

export default function LandingBlog({ posts }: { posts: Post[] }) {
  const preview = posts.slice(0, 3)
  if (preview.length === 0) return null

  const [featured, ...rest] = preview

  return (
    <section style={{ background: "#FFFFFF" }} className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 14 }}>
              Blog & Inspirations
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, margin: 0 }}>
              Tendances &amp; inspirations déco
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all hover:gap-3"
            style={{ color: "rgba(28,26,20,0.4)", fontFamily: BODY }}
          >
            Tous les articles <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* Layout: featured left + 2 stacked right */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55 }}
          >
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative flex flex-col overflow-hidden h-full"
              style={{ border: `1px solid rgba(196,162,62,0.15)` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
                {featured.coverImage ? (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: `rgba(196,162,62,0.1)` }} />
                )}
                {/* Featured label */}
                <div className="absolute top-4 left-4 px-3 py-1.5" style={{ background: GOLD }}>
                  <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "white" }}>
                    À la une
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-7 gap-3" style={{ background: "#FDFAF5" }}>
                {featured.created && (
                  <p style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 600 }}>
                    {new Date(featured.created).toLocaleDateString("fr-TN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
                <h3 className="line-clamp-2" style={{ fontFamily: DISPLAY, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 400, color: DARK, lineHeight: 1.2, margin: 0 }}>
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="line-clamp-2" style={{ fontFamily: BODY, fontSize: "0.86rem", color: "rgba(28,26,20,0.5)", lineHeight: 1.7, fontWeight: 400 }}>
                    {featured.excerpt}
                  </p>
                )}
                <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all group-hover:gap-2.5"
                  style={{ color: GOLD, fontFamily: BODY }}>
                  Lire l&apos;article <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Side posts */}
          <div className="flex flex-col gap-5">
            {rest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full overflow-hidden"
                  style={{ border: `1px solid rgba(196,162,62,0.15)` }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "16/8" }}>
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 380px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full" style={{ background: `rgba(196,162,62,0.08)` }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 gap-2" style={{ background: "#FDFAF5" }}>
                    {post.created && (
                      <p style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 600 }}>
                        {new Date(post.created).toLocaleDateString("fr-TN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                    <h3 className="line-clamp-2" style={{ fontFamily: DISPLAY, fontSize: "1.15rem", fontWeight: 400, color: DARK, lineHeight: 1.25, margin: 0 }}>
                      {post.title}
                    </h3>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] pt-2 transition-all group-hover:gap-2.5"
                      style={{ color: GOLD, fontFamily: BODY }}>
                      Lire <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile see all */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: DARK, fontFamily: BODY }}>
            Tous les articles <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
  )
}
