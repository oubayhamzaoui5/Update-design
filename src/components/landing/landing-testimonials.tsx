"use client"

import { motion } from "framer-motion"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

const TESTIMONIALS = [
  {
    name: "Sarra B.",
    role: "Architecte d'Intérieur, Tunis",
    rating: 5,
    quote: "J'utilise Update Design pour tous mes projets clients. Les panneaux muraux effet marbre sont d'une qualité exceptionnelle et la livraison est toujours ponctuelle.",
    initials: "SB",
  },
  {
    name: "Mohamed K.",
    role: "Propriétaire, Sfax",
    rating: 5,
    quote: "J'ai transformé mon salon grâce aux profiles muraux bois d'Update Design. Le rendu est absolument incroyable et le service était très professionnel.",
    initials: "MK",
  },
  {
    name: "Amira H.",
    role: "Décoratrice, Sousse",
    rating: 5,
    quote: "La sélection de produits est impressionnante. Le gazon artificiel pour ma terrasse est parfait — texture naturelle et durabilité top.",
    initials: "AH",
  },
]

export default function LandingTestimonials() {
  return (
    <section style={{ background: "#FDFAF5" }} className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 14 }}>
              Témoignages
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, margin: 0 }}>
              Ce que disent<br />nos clients
            </h2>
          </div>

          {/* Rating badge */}
          <div className="inline-flex items-center gap-5 self-start md:self-auto px-6 py-4"
            style={{ border: `1px solid rgba(196,162,62,0.25)`, background: "white" }}
          >
            <div>
              <span style={{ fontFamily: DISPLAY, fontSize: "2.4rem", fontWeight: 500, color: DARK, lineHeight: 1 }}>4.8</span>
              <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 400, color: `${GOLD}80` }}>/5</span>
            </div>
            <div style={{ width: 1, height: 36, background: `rgba(196,162,62,0.2)` }} />
            <div>
              <div style={{ color: GOLD, letterSpacing: 3, fontSize: 13 }}>★★★★★</div>
              <div style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(28,26,20,0.4)", marginTop: 4, fontWeight: 600 }}>100+ Avis</div>
            </div>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col gap-6 p-7"
              style={{ background: "white", border: `1px solid rgba(196,162,62,0.15)` }}
            >
              {/* Stars */}
              <div style={{ color: GOLD, letterSpacing: 3, fontSize: 12 }}>
                {"★".repeat(t.rating)}
              </div>

              {/* Quote */}
              <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)", fontWeight: 400, color: DARK, lineHeight: 1.6, margin: 0, flex: 1 }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid rgba(196,162,62,0.15)` }}>
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: `rgba(196,162,62,0.1)`, border: `1px solid rgba(196,162,62,0.25)` }}
                >
                  <span style={{ fontFamily: DISPLAY, fontSize: "0.95rem", fontWeight: 500, color: GOLD }}>{t.initials}</span>
                </div>
                <div>
                  <div style={{ fontFamily: BODY, fontSize: "0.83rem", fontWeight: 700, color: DARK, lineHeight: 1.3 }}>{t.name}</div>
                  <div style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(28,26,20,0.4)", marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
