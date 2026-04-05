"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import type { HomepageContent, StatItem } from "@/types/site-content"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

type AboutSection = HomepageContent["about"]

const DEFAULT: AboutSection = {
  eyebrow:        "Notre Histoire",
  headline:       "Le partenaire déco",
  headlineAccent: "des professionnels.",
  paragraph1:     "Update Design s'adresse avant tout aux professionnels : hôtels, promoteurs immobiliers, architectes d'intérieur, revendeurs et entrepreneurs qui achètent en volume.",
  paragraph2:     "Tarifs dégressifs, stock disponible, livraison nationale rapide — nous construisons des partenariats sur le long terme.",
  stats: [
    { value: "+200", suffix: "",   label: "Partenaires professionnels" },
    { value: "100%", suffix: "",   label: "Qualité certifiée" },
    { value: "4.8",  suffix: "/5", label: "Satisfaction client" },
  ],
  ctaLabel: "Notre histoire",
  image:    "/about/about-showroom.png",
}

export default function LandingAbout({ content = DEFAULT }: { content?: AboutSection }) {
  const stats: StatItem[] = content.stats
  return (
    <section id="story" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

          {/* ── Left: image ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden"
            style={{ minHeight: 480, background: "linear-gradient(160deg, #D0C5B5 0%, #BDB0A0 100%)" }}
          >
            <Image
              src={content.image}
              alt="Showroom Update Design"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
            />
            {/* Subtle dark vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.18) 0%, transparent 60%)" }} />

            {/* Floating gold tag */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute bottom-8 left-8 flex items-center gap-3 px-5 py-3"
              style={{ background: "rgba(253,250,245,0.92)", backdropFilter: "blur(12px)", border: `1px solid rgba(196,162,62,0.3)` }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
              <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: DARK }}>
                Tunis, Tunisie
              </span>
            </motion.div>
          </motion.div>

          {/* ── Right: content ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="flex flex-col justify-center px-6 py-12 md:px-16 md:py-28"
            style={{ background: "#FDFAF5" }}
          >
            {/* Eyebrow */}
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 20 }}>
              {content.eyebrow}
            </p>

            {/* Headline */}
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 24 }}>
              {content.headline}<br />
              <span style={{ color: GOLD }}>{content.headlineAccent}</span>
            </h2>

            {/* Body text */}
            <div style={{ borderLeft: `2px solid ${GOLD}40`, paddingLeft: 20, marginBottom: 40 }}>
              <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(28,26,20,0.6)", lineHeight: 1.85, fontWeight: 400, marginBottom: 14 }}>
                {content.paragraph1}
              </p>
              <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(28,26,20,0.6)", lineHeight: 1.85, fontWeight: 400 }}>
                {content.paragraph2}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10" style={{ borderTop: `1px solid rgba(196,162,62,0.2)`, paddingTop: 32 }}>
              {stats.map(({ value, suffix, label }) => (
                <div key={label}>
                  <div className="flex items-baseline gap-0.5">
                    <span style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 500, color: DARK, lineHeight: 1 }}>
                      {value}
                    </span>
                    {suffix && (
                      <span style={{ fontFamily: DISPLAY, fontSize: "1rem", fontWeight: 400, color: `${GOLD}90` }}>
                        {suffix}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginTop: 6, fontWeight: 600 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex w-fit items-center gap-3 transition-all duration-300 hover:gap-5"
              style={{
                fontFamily: BODY,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: GOLD,
                borderBottom: `1px solid rgba(196,162,62,0.4)`,
                paddingBottom: 6,
              }}
            >
              {content.ctaLabel} <ArrowRight size={13} />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
