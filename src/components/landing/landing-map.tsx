"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

export default function LandingMap() {
  return (
    <section style={{ background: "#FDFAF5" }} className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 12 }}>
              Où nous trouver
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 400, color: DARK, lineHeight: 1.05, margin: 0 }}>
              Notre showroom
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, border: `1px solid rgba(196,162,62,0.3)` }}>
              <MapPin size={15} style={{ color: GOLD }} />
            </div>
            <div>
              <div style={{ fontFamily: BODY, fontSize: "0.86rem", fontWeight: 700, color: DARK }}>Tunis, Tunisie</div>
              <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(28,26,20,0.45)", letterSpacing: "0.1em" }}>Livraison nationale 72h</div>
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden"
          style={{ border: "1px solid rgba(196,162,62,0.18)", height: 420 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102526.43661133993!2d10.1244961!3d36.8190238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd337f5e7ef543%3A0xd671924e714a0275!2sTunis!5e0!3m2!1sfr!2stn!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "grayscale(20%) contrast(1.05)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Update Design — Tunis"
          />
        </motion.div>

      </div>
    </section>
  )
}
