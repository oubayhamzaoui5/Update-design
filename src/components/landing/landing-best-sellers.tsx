"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"
import type { ProductListItem } from "@/lib/services/product.service"
import ShopProductCard from "@/app/shop/_components/shop-product-card"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

export default function LandingBestSellers({ products }: { products: ProductListItem[] }) {
  if (!products.length) return null

  const displayed = products.slice(0, 8)

  return (
    <section id="best-sellers" style={{ background: "#FDFAF5" }} className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={11} fill={GOLD} color={GOLD} />
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, fontWeight: 700, margin: 0 }}>
                Les Plus Populaires
              </p>
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, margin: 0, letterSpacing: "-0.01em" }}>
              Meilleures ventes
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden md:inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all hover:gap-3"
            style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY }}
          >
            Voir tout <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-4">
          {displayed.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <ShopProductCard
                product={product}
                productHref={`/product/${product.slug}`}
                prioritizeImage={i < 2}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile see all */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em]"
            style={{ color: DARK, fontFamily: BODY }}
          >
            Voir tous les produits <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
