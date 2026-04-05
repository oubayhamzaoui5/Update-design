"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Check, MapPin } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import type { AboutContent } from "@/types/site-content"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const fadeLeft = {
  hidden:  { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const fadeRight = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ─── Static category cards (not editable — driven by actual product categories) ──
const categories = [
  {
    label: "Décoration d'Intérieur",
    desc: "Panneaux muraux effet marbre, profiles décoratifs, moulures et accessoires pour transformer vos espaces de vie.",
    img: "/about/about-interior.jpg",
    href: "/shop/decoration-interieur",
  },
  {
    label: "Décoration d'Extérieur",
    desc: "Gazon artificiel, parasols, stores à bras invisibles — tout pour sublimer terrasses, jardins et espaces extérieurs.",
    img: "/about/about-exterior.jpg",
    href: "/shop/decoration-exterieur",
  },
  {
    label: "Éclairage & Électricité",
    desc: "Tubes néon LED T8 haute performance pour un éclairage moderne, économique et élégant.",
    img: "/about/about-lighting.jpg",
    href: "/shop/articles-electricite",
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function GoldLine({ className = "w-14" }: { className?: string }) {
  return (
    <div
      className={`h-px ${className}`}
      style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
    />
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 14 }}>
      {children}
    </p>
  )
}

export default function AboutPageContent({ content }: { content: AboutContent }) {
  const { hero, stats, story, vision, values, team, cta } = content
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#FAFAFA" }}>
      <Navbar reserveSpace />

      <main>

        {/* ════════════════════════════════════════════════════════
            1. HERO — full-bleed image with editorial overlay
        ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={hero.image}
              alt="Un espace de vie sublimé par Update Design"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(28,26,20,0.72) 0%, rgba(28,26,20,0.30) 55%, rgba(28,26,20,0.08) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,26,20,0.55) 0%, transparent 50%)" }} />
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto flex h-full min-h-[88vh] max-w-[1400px] flex-col justify-center px-6 py-24 md:px-10 md:py-32">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-2xl"
            >
              <motion.p
                variants={fadeUp}
                style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 20 }}
              >
                {hero.eyebrow}
              </motion.p>

              <motion.h1
                variants={fadeUp}
                style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 400, color: "#FFFFFF", lineHeight: 1.02, letterSpacing: "-0.02em", marginBottom: 24 }}
              >
                {hero.headline}<br />
                <span style={{ color: GOLD }}>{hero.headlineAccent}</span><br />
                {hero.headlineSuffix}
              </motion.h1>

              <motion.div variants={fadeUp} style={{ borderLeft: `2px solid ${GOLD}60`, paddingLeft: 20, marginBottom: 36 }}>
                <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.85, maxWidth: 480 }}>
                  {hero.body}
                </p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  href={hero.ctaHref}
                  className="inline-flex items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:gap-5"
                  style={{ background: GOLD, color: "#fff", fontFamily: BODY }}
                >
                  {hero.ctaLabel} <ArrowRight size={13} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Bottom-right location tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute bottom-8 right-8 hidden md:flex items-center gap-2.5 px-5 py-3"
              style={{ background: "rgba(253,250,245,0.90)", backdropFilter: "blur(10px)", border: `1px solid rgba(196,162,62,0.3)` }}
            >
              <MapPin size={13} style={{ color: GOLD }} />
              <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: DARK }}>
                {hero.locationLabel}
              </span>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            2. STATS BAR
        ════════════════════════════════════════════════════════ */}
        <section style={{ background: "#F5EDD8", borderBottom: "1px solid rgba(196,162,62,0.15)", borderTop: "1px solid rgba(196,162,62,0.15)" }}>
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-2 md:grid-cols-4"
            >
              {stats.map(({ value, suffix, label }, i) => (
                <motion.div
                  key={label}
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                  className="flex flex-col items-center justify-center py-10 md:py-12 gap-2"
                  style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(196,162,62,0.2)" : "none" }}
                >
                  <div className="flex items-baseline gap-0.5">
                    <span style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.4rem)", fontWeight: 500, color: GOLD, lineHeight: 1 }}>
                      {value}
                    </span>
                    {suffix && (
                      <span style={{ fontFamily: DISPLAY, fontSize: "clamp(0.9rem, 2vw, 1.3rem)", fontWeight: 400, color: `${GOLD}80` }}>
                        {suffix}
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: BODY, fontSize: "0.65rem", fontWeight: 600, color: "rgba(28,26,20,0.45)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            3. BRAND STORY — two-column
        ════════════════════════════════════════════════════════ */}
        <section style={{ background: "#FFFFFF" }} className="py-20 md:py-32">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[560px]">

              {/* Image */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeLeft}
                className="relative overflow-hidden"
                style={{ minHeight: 480, background: "linear-gradient(160deg, #D0C5B5 0%, #BDB0A0 100%)" }}
              >
                <Image
                  src={story.image}
                  alt="Showroom Update Design — Tunis"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 60%)" }} />

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                  className="absolute bottom-8 left-8 flex items-center gap-3 px-5 py-3"
                  style={{ background: "rgba(253,250,245,0.92)", backdropFilter: "blur(12px)", border: `1px solid rgba(196,162,62,0.3)` }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                  <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: DARK }}>
                    Showroom · Tunis
                  </span>
                </motion.div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeRight}
                className="flex flex-col justify-center px-6 py-12 md:px-16 md:py-20"
                style={{ background: "#FDFAF5" }}
              >
                <Eyebrow>{story.eyebrow}</Eyebrow>

                <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: DARK, lineHeight: 1.08, letterSpacing: "-0.01em", marginBottom: 10 }}>
                  {story.headline}<br />
                  <span style={{ color: GOLD }}>{story.headlineAccent}</span>
                </h2>
                <GoldLine className="w-16 mb-8" />

                <div style={{ borderLeft: `2px solid ${GOLD}30`, paddingLeft: 20, marginBottom: 36 }}>
                  <p style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(28,26,20,0.6)", lineHeight: 1.9, marginBottom: 16 }}>
                    {story.paragraph1}
                  </p>
                  <p style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(28,26,20,0.6)", lineHeight: 1.9 }}>
                    {story.paragraph2}
                  </p>
                </div>

                {/* Mini checklist */}
                <ul className="space-y-3 mb-10">
                  {story.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(28,26,20,0.7)", fontFamily: BODY }}>
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 self-start text-[11px] font-bold uppercase tracking-[0.18em] transition-all hover:gap-3"
                  style={{ color: DARK, fontFamily: BODY }}
                >
                  Voir nos produits <ArrowRight size={13} />
                </Link>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            4. VISION — full-width centered quote
        ════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden py-20 md:py-28"
          style={{ background: DARK }}
        >
          {/* Decorative texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />
          {/* Gold line top */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)` }} />

          <div className="relative mx-auto max-w-[1000px] px-6 py-4 text-center md:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 28 }}>
                Notre Vision
              </p>

              <blockquote style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 4.5vw, 3.4rem)", fontWeight: 400, color: "#FFFFFF", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                &ldquo;{vision.quote}{" "}
                <span style={{ color: GOLD }}>{vision.quoteAccent}</span> {vision.quoteSuffix}&rdquo;
              </blockquote>

              <div className="mx-auto mt-10 h-px w-16" style={{ background: `${GOLD}50` }} />
              <p className="mt-6 text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: BODY, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
                {vision.attribution}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            5. PRODUCT CATEGORIES — editorial 3-column
        ════════════════════════════════════════════════════════ */}
        <section style={{ background: "#FFFFFF" }} className="py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-14 flex items-end justify-between"
            >
              <div>
                <Eyebrow>Nos Collections</Eyebrow>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, margin: 0 }}>
                  Tout pour votre espace
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all hover:gap-3"
                style={{ color: "rgba(28,26,20,0.4)", fontFamily: BODY }}
              >
                Voir tout <ArrowRight size={13} />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.label}
                  variants={fadeUp}
                  className="group flex flex-col"
                  style={{ border: "1px solid rgba(196,162,62,0.15)" }}
                >
                  {/* Image */}
                  <Link href={cat.href} className="relative block overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
                      <Image
                        src={cat.img}
                        alt={cat.label}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                      />
                    </div>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.06) 55%, transparent 100%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", fontWeight: 400, color: "white", margin: 0, lineHeight: 1.15 }}>
                        {cat.label}
                      </h3>
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="flex flex-1 flex-col justify-between p-5 gap-4" style={{ background: "#FDFAF5" }}>
                    <p style={{ fontFamily: BODY, fontSize: "0.82rem", color: "rgba(28,26,20,0.55)", lineHeight: 1.7, margin: 0 }}>
                      {cat.desc}
                    </p>
                    <Link
                      href={cat.href}
                      className="inline-flex items-center gap-1.5 self-start text-[10px] font-bold uppercase tracking-[0.18em] transition-all hover:gap-2.5"
                      style={{ color: GOLD, fontFamily: BODY }}
                    >
                      Découvrir <ArrowRight size={11} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            6. VALUES — image left + values right
        ════════════════════════════════════════════════════════ */}
        <section style={{ background: "#FDFAF5" }} className="py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] items-center">

              {/* Image */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeLeft}
                className="relative overflow-hidden"
                style={{ aspectRatio: "3/4", maxHeight: 600, border: `1px solid rgba(196,162,62,0.18)` }}
              >
                <Image
                  src={values.image}
                  alt="Savoir-faire Update Design — détail matériaux"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
                {/* Gold corner accents */}
                <div className="absolute top-5 left-5 w-8 h-8" style={{ borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
                <div className="absolute bottom-5 right-5 w-8 h-8" style={{ borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />
              </motion.div>

              {/* Values list */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeRight}
              >
                <Eyebrow>{values.eyebrow}</Eyebrow>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: DARK, lineHeight: 1.08, marginBottom: 10 }}>
                  {values.headline}<br />
                  <span style={{ color: GOLD }}>{values.headlineAccent}</span>
                </h2>
                <GoldLine className="w-14 mb-10" />

                <div className="space-y-8">
                  {values.items.map((val) => (
                    <div key={val.num} className="flex gap-6">
                      <span style={{ fontFamily: DISPLAY, fontSize: "2.2rem", fontWeight: 400, color: `${GOLD}30`, lineHeight: 1, flexShrink: 0, minWidth: 40 }}>
                        {val.num}
                      </span>
                      <div>
                        <h3 style={{ fontFamily: BODY, fontSize: "0.85rem", fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                          {val.title}
                        </h3>
                        <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: "rgba(28,26,20,0.58)", lineHeight: 1.8 }}>
                          {val.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            7. TEAM — editorial image + message
        ════════════════════════════════════════════════════════ */}
        <section style={{ background: "#FFFFFF" }} className="py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">

              {/* Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeLeft}
                className="lg:order-2"
              >
                <Eyebrow>{team.eyebrow}</Eyebrow>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: DARK, lineHeight: 1.08, marginBottom: 10 }}>
                  {team.headline}<br />
                  <span style={{ color: GOLD }}>{team.headlineAccent}</span>
                </h2>
                <GoldLine className="w-14 mb-8" />

                <div style={{ borderLeft: `2px solid ${GOLD}30`, paddingLeft: 20, marginBottom: 36 }}>
                  <p style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(28,26,20,0.6)", lineHeight: 1.9, marginBottom: 16 }}>
                    {team.paragraph1}
                  </p>
                  <p style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(28,26,20,0.6)", lineHeight: 1.9 }}>
                    {team.paragraph2}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8" style={{ borderTop: `1px solid rgba(196,162,62,0.15)` }}>
                  {team.stats.map(({ v, l }) => (
                    <div key={l}>
                      <span style={{ fontFamily: DISPLAY, fontSize: "2.2rem", fontWeight: 500, color: DARK, lineHeight: 1, display: "block" }}>
                        {v}
                      </span>
                      <span style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginTop: 6, display: "block", fontWeight: 600 }}>
                        {l}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Team image */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeRight}
                className="relative overflow-hidden lg:order-1"
                style={{ aspectRatio: "4/3", border: `1px solid rgba(196,162,62,0.18)` }}
              >
                <Image
                  src={team.image}
                  alt="L'équipe Update Design"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
              </motion.div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            8. CTA — final call to action
        ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "#FDFAF5", borderTop: "1px solid rgba(196,162,62,0.12)" }}>
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${GOLD}40 0%, transparent 70%)` }} />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GOLD}40 0%, transparent 70%)` }} />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative mx-auto max-w-3xl px-6 text-center md:px-10"
          >
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 20 }}>
              {cta.eyebrow}
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 400, color: DARK, lineHeight: 1.08, marginBottom: 16 }}>
              {cta.headline}<br />
              <span style={{ color: GOLD }}>{cta.headlineAccent}</span>
            </h2>
            <p className="mb-10 text-sm" style={{ color: "rgba(28,26,20,0.55)", fontFamily: BODY, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 40px" }}>
              {cta.body}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
              <Link
                href={cta.primaryHref}
                className="inline-flex items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:gap-5"
                style={{ background: GOLD, color: "#fff", fontFamily: BODY }}
              >
                {cta.primaryLabel} <ArrowRight size={13} />
              </Link>
              <Link
                href={cta.secondaryHref}
                className="inline-flex items-center gap-2 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:gap-3"
                style={{ background: "transparent", color: DARK, border: `1px solid rgba(28,26,20,0.2)`, fontFamily: BODY }}
              >
                {cta.secondaryLabel} <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
