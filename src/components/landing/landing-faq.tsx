"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { HomepageContent, FaqItem } from "@/types/site-content"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

type FaqSection = HomepageContent["faq"]

const DEFAULT_FAQ: FaqSection = {
  introText: "Retrouvez les réponses aux questions les plus fréquentes. Pour toute autre demande, notre équipe est disponible via le formulaire de contact.",
  items: [
  {
    question: "Proposez-vous des tarifs dégressifs sur les commandes en volume ?",
    answer: "Oui. Nos prix sont structurés pour récompenser les achats en quantité. Plus le volume est important, plus le tarif unitaire est avantageux. Contactez-nous avec vos besoins et nous vous adressons une offre personnalisée sous 24h.",
  },
  {
    question: "Comment obtenir un devis professionnel ?",
    answer: "Utilisez le formulaire de contact en sélectionnant « Devis volume / Achat en gros », indiquez les références et quantités souhaitées. Notre équipe commerciale vous répond sous 24h avec une offre détaillée.",
  },
  {
    question: "Quels types de clients travaillent avec vous ?",
    answer: "Nous travaillons principalement avec des hôtels et résidences qui équipent plusieurs chambres ou espaces communs, des promoteurs immobiliers, des architectes et décorateurs d'intérieur, ainsi que des revendeurs qui achètent régulièrement en stock.",
  },
  {
    question: "Quels sont les délais de livraison pour les grandes commandes ?",
    answer: "Les commandes en stock standard sont expédiées sous 24 à 72h. Pour les commandes volumineuses ou sur mesure (gazon artificiel au mètre, stores), un délai spécifique est convenu lors de la validation du devis.",
  },
  {
    question: "Les particuliers peuvent-ils aussi commander ?",
    answer: "Tout à fait. Même si notre modèle est pensé pour les professionnels et les achats en volume, nous accueillons également les particuliers avec plaisir. Les mêmes produits, la même qualité — quelle que soit la quantité.",
  },
  {
    question: "Livrez-vous sur tout le territoire tunisien ?",
    answer: "Oui, nous livrons dans tous les gouvernorats de Tunisie — de Tunis à Sfax, de Sousse à Bizerte et au-delà. Pour les gros volumes, nous organisons une logistique adaptée.",
  },
  ],
}

export default function LandingFaq({ faq = DEFAULT_FAQ }: { faq?: FaqSection }) {
  const faqItems: FaqItem[] = faq.items
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" style={{ background: "#FFFFFF" }} className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.6fr] lg:gap-24">

          {/* ── Left: header ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-start lg:pt-2"
          >
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 16 }}>
              FAQ
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, margin: "0 0 24px 0" }}>
              Vous avez<br />des questions ?
            </h2>
            <p style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(28,26,20,0.5)", lineHeight: 1.85, fontWeight: 400, maxWidth: 320 }}>
              {faq.introText}
            </p>

            {/* Gold accent line */}
            <div style={{ width: 48, height: 2, background: GOLD, marginTop: 32 }} />
          </motion.div>

          {/* ── Right: accordion ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={item.question}
                  style={{ borderBottom: `1px solid rgba(28,26,20,0.08)` }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left"
                  >
                    <span style={{
                      fontFamily: BODY,
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      color: isOpen ? GOLD : DARK,
                      lineHeight: 1.45,
                      transition: "color 0.2s",
                    }}>
                      {item.question}
                    </span>

                    {/* Plus / minus indicator */}
                    <span
                      className="flex-shrink-0 flex items-center justify-center transition-all duration-300"
                      style={{
                        width: 28,
                        height: 28,
                        border: `1px solid ${isOpen ? GOLD : "rgba(28,26,20,0.15)"}`,
                        marginTop: 2,
                        transition: "border-color 0.2s",
                      }}
                    >
                      <span style={{
                        display: "block",
                        width: 10,
                        height: 1.5,
                        background: isOpen ? GOLD : DARK,
                        position: "relative",
                        transition: "background 0.2s",
                      }}>
                        <span style={{
                          display: "block",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: `translate(-50%, -50%) rotate(${isOpen ? "0deg" : "90deg"})`,
                          width: 10,
                          height: 1.5,
                          background: isOpen ? GOLD : DARK,
                          transition: "transform 0.25s ease, background 0.2s",
                        }} />
                      </span>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{
                          fontFamily: BODY,
                          fontSize: "0.87rem",
                          color: "rgba(28,26,20,0.6)",
                          lineHeight: 1.85,
                          fontWeight: 400,
                          paddingBottom: 24,
                          paddingRight: 16,
                        }}>
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </motion.div>

        </div>
      </div>
    </section>
  )
}
