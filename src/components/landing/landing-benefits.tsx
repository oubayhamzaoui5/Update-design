"use client"

import { motion } from "framer-motion"

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const COLOR_ACCENT = "#C4A23E"
const COLOR_DARK = "#1C1A17"

const items = [
  {
    num: "01",
    title: "Qualité Garantie",
    desc: "Chaque produit est soigneusement sélectionné et contrôlé avant d'être mis en ligne. Vous recevez exactement ce que vous avez choisi.",
  },
  {
    num: "02",
    title: "Gamme Complète",
    desc: "Décoration intérieure, extérieure et articles d'électricité — tout ce qu'il faut pour transformer chaque espace de votre maison.",
  },
  {
    num: "03",
    title: "Livraison 48h",
    desc: "Livraison partout en Tunisie en 2 à 4 jours ouvrables, avec suivi de commande en temps réel.",
  },
]

export default function LandingBenefits() {
  return (
    <section style={{ background: "#FFFFFF", fontFamily: FONT }}>
      <div className="mx-auto max-w-[1400px] px-8 md:px-14">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3 border-b py-14 md:flex-row md:items-end md:justify-between"
          style={{ borderColor: `${COLOR_DARK}0C` }}
        >
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: COLOR_ACCENT, fontWeight: 500, marginBottom: 12 }}>
              Pourquoi Nous Choisir
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 400, color: COLOR_DARK, lineHeight: 1.1, margin: 0 }}>
              La différence Update Design
            </h2>
          </div>
        </motion.div>

        {/* Rows */}
        <div>
          {items.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              className="grid grid-cols-1 gap-4 border-b py-10 md:grid-cols-[64px_1fr_2fr]"
              style={{ borderColor: `${COLOR_DARK}0C` }}
            >
              <div style={{ fontSize: "0.75rem", color: `${COLOR_DARK}30`, fontWeight: 500, letterSpacing: "0.06em", paddingTop: 2 }}>
                {item.num}
              </div>
              <h3 style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)", fontWeight: 500, color: COLOR_DARK, lineHeight: 1.15, margin: 0 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#6B5E52", lineHeight: 1.8, margin: 0, fontWeight: 300, maxWidth: 440 }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div style={{ height: 56 }} />
      </div>
    </section>
  )
}
