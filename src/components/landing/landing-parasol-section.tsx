"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Sun, Layers, Settings } from "lucide-react"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

const HIGHLIGHTS = [
  { icon: Sun,      label: "Toiles Sunbrella® anti-UV" },
  { icon: Layers,   label: "Structure aluminium thermolaqué" },
  { icon: Settings, label: "4 modèles déportés exclusifs" },
]

export default function LandingParasolSection() {
  return (
    <section
      aria-labelledby="parasol-home-heading"
      className="overflow-hidden"
      style={{ background: DARK }}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2">

        {/* ── Text panel (right on desktop) ── */}
        <motion.div
          className="flex flex-col justify-center px-8 py-16 md:px-14 md:py-20 lg:order-2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Brand */}
          <span
            style={{
              display: "inline-block",
              fontFamily: BODY,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            OutStore®
          </span>

          {/* Heading */}
          <h2
            id="parasol-home-heading"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(2.4rem, 4.5vw, 4rem)",
              fontWeight: 400,
              color: "#FDFAF5",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              marginBottom: 18,
            }}
          >
            Parasols<br />
            <em style={{ fontStyle: "italic", color: "rgba(253,250,245,0.5)" }}>
              Premium
            </em>
          </h2>

          {/* Description */}
          <p
            style={{
              fontFamily: BODY,
              fontSize: "0.92rem",
              color: "rgba(253,250,245,0.62)",
              lineHeight: 1.75,
              maxWidth: 420,
              marginBottom: 28,
            }}
          >
            Quatre modèles déportés exclusifs — Dallas, Havana, Ibiza et Mauris.
            Structure aluminium thermolaqué, toiles Sunbrella® en 35+ coloris,
            conçus pour les hôtels, résidences et espaces extérieurs haut de gamme.
          </p>

          {/* Highlights */}
          <ul
            className="mb-8 flex flex-col gap-3"
            style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0" }}
          >
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3"
                style={{
                  fontFamily: BODY,
                  fontSize: "0.84rem",
                  color: "rgba(253,250,245,0.7)",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    border: `1px solid rgba(196,162,62,0.4)`,
                    flexShrink: 0,
                    color: GOLD,
                  }}
                >
                  <Icon size={13} strokeWidth={1.5} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/parasols"
            aria-label="En savoir plus sur nos parasols professionnels"
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
            En savoir plus <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* ── Image panel (left on desktop) ── */}
        <motion.div
          className="group relative overflow-hidden lg:order-1"
          style={{ minHeight: 520 }}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/hero/parasols-landscape-new.png"
            alt="Parasols professionnels déportés autour d'une piscine d'hôtel"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {/* Right-to-left veil */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(28,26,20,0.08) 0%, rgba(28,26,20,0.45) 100%)",
            }}
          />
          {/* Gold corner marks */}
          <div
            className="absolute top-5 left-5 h-10 w-10 pointer-events-none"
            style={{ borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }}
          />
          <div
            className="absolute bottom-5 right-5 h-10 w-10 pointer-events-none"
            style={{ borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }}
          />
        </motion.div>
      </div>
    </section>
  )
}
