"use client"

import { motion } from "framer-motion"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

import type { StatItem } from "@/types/site-content"

const DEFAULT_STATS: StatItem[] = [
  { value: "72h",   suffix: "",   label: "Livraison nationale" },
  { value: "1000",  suffix: "+",  label: "Références en stock" },
  { value: "4.8",   suffix: "/5", label: "Satisfaction client" },
]

export default function LandingStats({ stats = DEFAULT_STATS }: { stats?: StatItem[] }) {
  return (
    <section style={{ background: "#F5EDD8", borderBottom: "1px solid rgba(196,162,62,0.15)" }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-3"
        >
          {stats.map(({ value, label, suffix }, i) => (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="flex flex-col items-center justify-center py-10 md:py-12 gap-2"
              style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(196,162,62,0.2)" : "none" }}
            >
              <div className="flex items-baseline gap-1">
                <span style={{ fontFamily: DISPLAY, fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 500, color: GOLD, lineHeight: 1 }}>
                  {value}
                </span>
                {suffix && (
                  <span style={{ fontFamily: DISPLAY, fontSize: "clamp(1rem, 2vw, 1.5rem)", fontWeight: 400, color: `${GOLD}80`, lineHeight: 1 }}>
                    {suffix}
                  </span>
                )}
              </div>
              <span style={{ fontFamily: BODY, fontSize: "0.68rem", fontWeight: 600, color: "rgba(28,26,20,0.45)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
