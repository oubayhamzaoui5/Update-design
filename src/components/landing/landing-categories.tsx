import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import type { ShopCategory } from "@/lib/services/product.service"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

function extractFirstTag(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : ''
}

const FALLBACK_GRADIENTS = [
  "linear-gradient(145deg, #C8C0B4 0%, #A89888 100%)",
  "linear-gradient(145deg, #4A7858 0%, #2E5C3C 100%)",
  "linear-gradient(145deg, #3A5878 0%, #243C58 100%)",
  "linear-gradient(145deg, #786048 0%, #4A3828 100%)",
  "linear-gradient(145deg, #787848 0%, #585838 100%)",
]

export default function LandingCategories({ categories: allCategories = [] }: { categories?: ShopCategory[] }) {
  // Root categories (no parent), sorted by order
  const roots = allCategories
    .filter((c) => !c.parent || (Array.isArray(c.parent) ? c.parent.length === 0 : false))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
    .slice(0, 6)

  if (roots.length === 0) return null

  return (
    <section id="categories" style={{ background: "#FFFFFF" }} className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 10 }}>
              Nos Catégories
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, margin: 0, letterSpacing: "-0.01em" }}>
              Tout pour votre maison
            </h2>
          </div>
          <Link href="/shop" className="hidden md:inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all hover:gap-3" style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY }}>
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>

        {/* Cards */}
        <div className={`grid grid-cols-1 gap-6 ${roots.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-3'}`}>
          {roots.map((cat, i) => {
            const imageSrc = cat.menuImageUrl ?? cat.coverImageUrl ?? null
            const fallback = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]
            const children = allCategories
              .filter((c) => {
                if (!c.parent) return false
                const parents = Array.isArray(c.parent) ? c.parent : [c.parent]
                return parents.includes(cat.id)
              })
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

            return (
              <div
                key={cat.id}
                className="group flex flex-col"
                style={{ border: "1px solid rgba(196,162,62,0.15)" }}
              >
                {/* Image */}
                <Link href={`/shop/${cat.slug}`} className="block relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" style={{ background: fallback }} />
                    )}
                  </div>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 style={{ fontFamily: DISPLAY, fontSize: "1.45rem", fontWeight: 400, color: "white", margin: 0, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                      {cat.name}
                    </h3>
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 gap-4" style={{ background: "#FDFAF5" }}>
                  {cat.description && (() => {
                    const title = extractFirstTag(cat.description, 'h1')
                    const body  = extractFirstTag(cat.description, 'p')
                    return (
                      <div className="flex flex-col gap-1.5">
                        {title && (
                          <p style={{ fontFamily: DISPLAY, fontSize: "1rem", fontWeight: 600, color: DARK, margin: 0, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                            {title}
                          </p>
                        )}
                        {body && (
                          <p style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 400, color: "rgba(28,26,20,0.55)", lineHeight: 1.6, margin: 0 }}>
                            {body}
                          </p>
                        )}
                      </div>
                    )
                  })()}

                  {children.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/shop/${child.slug}`}
                            className="flex items-center gap-2.5 py-1 transition-colors duration-150 group/link"
                            style={{ fontFamily: BODY }}
                          >
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, flexShrink: 0, opacity: 0.7 }} />
                            <span
                              className="text-[0.82rem] font-medium transition-colors"
                              style={{ color: "rgba(28,26,20,0.65)" }}
                            >
                              {child.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={`/shop/${cat.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 self-start text-[10px] font-bold uppercase tracking-[0.18em] transition-all hover:gap-2.5"
                    style={{ color: GOLD, fontFamily: BODY }}
                  >
                    Découvrir <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile see all */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: DARK, fontFamily: BODY }}>
            Voir tous les produits <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
