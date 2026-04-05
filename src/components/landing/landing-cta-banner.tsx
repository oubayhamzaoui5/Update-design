"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const COLOR_ACCENT = "#C4A23E"
const COLOR_DARK = "#1C1A17"

export default function LandingCtaBanner() {
  return (
    <section style={{ background: COLOR_DARK, fontFamily: FONT }}>
      <div style={{ height: 3, background: COLOR_ACCENT, opacity: 0.65 }} />

      <div className="mx-auto max-w-[1400px] px-8 py-20 md:px-14 md:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-end">

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: COLOR_ACCENT, fontWeight: 500, marginBottom: 18 }}>
              Commencez dès maintenant
            </p>
            <h2 style={{ fontSize: "clamp(2.4rem, 5.5vw, 5rem)", fontWeight: 400, color: "white", lineHeight: 1.05, margin: 0 }}>
              Transformez votre maison{" "}
              <span style={{ color: COLOR_ACCENT }}>aujourd&apos;hui.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="flex flex-col gap-7"
          >
            <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 400, fontWeight: 300 }}>
              Parcourez notre collection complète — décoration intérieure, extérieure
              et éclairage. Livraison partout en Tunisie.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: COLOR_ACCENT, color: COLOR_DARK, padding: "13px 30px", letterSpacing: "0.05em", fontWeight: 500 }}
              >
                Voir les produits <ArrowRight size={13} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:-translate-y-0.5"
                style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.65)", padding: "13px 30px", letterSpacing: "0.05em", fontWeight: 300 }}
              >
                À propos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
