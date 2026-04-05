"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

const ITEMS = [
  {
    id: "store-bras",
    label: "Protection Solaire",
    title: "Store à Bras\nInvisibles",
    tagline: "Mécanisme dissimulé. Élégance totale.",
    description:
      "Un store qui s'efface le soir et révèle une façade impeccable. Bras articulés escamotables, toiles haute résistance UV, motorisation sur mesure.",
    img: "/hero/stores-landscape-new.png",
    href: "/store-bras",
    accent: "#2C3E2D",
    tags: ["Motorisé", "Anti-UV", "Sur mesure"],
  },
  {
    id: "parasols",
    label: "Ombrage d'Exception",
    title: "Parasols\nProfessionnels",
    tagline: "De la piscine à la terrasse de palace.",
    description:
      "Structure aluminium thermolaqué, toiles Sunbrella® 35+ coloris. Conçus pour les hôtels, les promoteurs et les espaces extérieurs d'envergure.",
    img: "/hero/parasols-landscape-new.png",
    href: "/parasols",
    accent: "#3B2F1E",
    tags: ["Toile Sunbrella®", "35+ coloris", "Volume"],
  },
]

export default function LandingOutdoorHighlight() {
  return (
    <section
      aria-labelledby="outdoor-highlight-heading"
      className="py-20 md:py-28"
      style={{ background: DARK }}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p
            style={{
              fontFamily: BODY,
              fontSize: 10,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Extérieur Premium
          </p>
          <h2
            id="outdoor-highlight-heading"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
              fontWeight: 400,
              color: "#FDFAF5",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Maîtrisez la lumière,<br className="hidden sm:block" /> définissez l&apos;espace
          </h2>
        </motion.div>

        {/* Two-column cards */}
        <div className="grid grid-cols-1 gap-px md:grid-cols-2" style={{ border: `1px solid rgba(196,162,62,0.12)` }}>
          {ITEMS.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group relative flex flex-col overflow-hidden"
              style={{ minHeight: 580 }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <Image
                  src={item.img}
                  alt={item.title.replace("\n", " ")}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement
                    t.style.display = "none"
                    const p = t.parentElement
                    if (p) p.style.background = item.accent
                  }}
                />
                {/* Gradient veil */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(18,14,8,0.88) 0%, rgba(18,14,8,0.35) 55%, rgba(18,14,8,0.08) 100%)",
                  }}
                />
              </div>

              {/* Gold top border accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: GOLD }}
              />

              {/* Content */}
              <div className="relative flex flex-1 flex-col justify-end p-7 md:p-9">
                {/* Label */}
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: GOLD,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {item.label}
                </p>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                    fontWeight: 400,
                    color: "#FDFAF5",
                    lineHeight: 1.05,
                    letterSpacing: "-0.01em",
                    marginBottom: 10,
                    whiteSpace: "pre-line",
                  }}
                >
                  {item.title}
                </h3>

                {/* Tagline */}
                <p
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: "1rem",
                    fontStyle: "italic",
                    color: "rgba(253,250,245,0.6)",
                    marginBottom: 16,
                  }}
                >
                  {item.tagline}
                </p>

                {/* Description — slides in on hover */}
                <p
                  className="mb-6 max-w-sm text-sm leading-relaxed opacity-0 transition-all duration-500 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                  style={{ fontFamily: BODY, color: "rgba(253,250,245,0.65)" }}
                >
                  {item.description}
                </p>

                {/* Tags */}
                <div className="mb-7 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: BODY,
                        fontSize: 9,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        color: "rgba(253,250,245,0.55)",
                        border: "1px solid rgba(196,162,62,0.25)",
                        padding: "4px 10px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={item.href}
                  aria-label={`En savoir plus sur ${item.title.replace("\n", " ")}`}
                  className="inline-flex w-fit items-center gap-2.5 transition-all duration-300 hover:gap-4"
                  style={{
                    fontFamily: BODY,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: GOLD,
                  }}
                >
                  En savoir plus
                  <ArrowRight size={13} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
