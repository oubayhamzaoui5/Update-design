"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowRight, Phone, MapPin, Clock } from "lucide-react"
import type { HomepageContent } from "@/types/site-content"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"

type ContactSection = HomepageContent["contact"]

const DEFAULT_CONTACT: ContactSection = {
  headline:       "Nous sommes",
  headlineAccent: "à votre écoute.",
  description:    "Demande de devis, achat en volume, partenariat revendeur ou question produit — nous répondons sous 24h.",
  phone:          "+216 XX XXX XXX",
  location:       "Tunisie — livraison nationale",
  hours:          "Lun–Sam, 9h–18h",
  subjects: [
    { value: "devis",    label: "Devis volume / Achat en gros" },
    { value: "hotel",    label: "Hôtel / Résidence / Promoteur" },
    { value: "reseller", label: "Partenariat revendeur" },
    { value: "pro",      label: "Architecte / Décorateur / BTP" },
    { value: "product",  label: "Information produit" },
    { value: "order",    label: "Suivi de commande" },
    { value: "general",  label: "Question générale" },
  ],
}

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "#FDFAF5",
  border: "1px solid rgba(196,162,62,0.2)",
  padding: "12px 16px",
  fontSize: "0.875rem",
  fontFamily: BODY,
  fontWeight: 400,
  color: DARK,
  outline: "none",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: BODY,
  fontSize: 9,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(28,26,20,0.45)",
  fontWeight: 700,
  marginBottom: 7,
}

export default function LandingContact({ contact = DEFAULT_CONTACT }: { contact?: ContactSection }) {
  const [purpose, setPurpose] = useState(contact.subjects[0]?.value ?? "devis")

  return (
    <section id="contact" style={{ background: "#FDFAF5" }} className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">

        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_1.5fr]" style={{ border: "1px solid rgba(196,162,62,0.18)" }}>

          {/* ── Left: info panel ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between p-10 md:p-14"
            style={{ background: DARK, borderRight: "1px solid rgba(196,162,62,0.12)" }}
          >
            <div>
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 20 }}>
                Contact
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: "white", lineHeight: 1.05, margin: "0 0 24px 0" }}>
                {contact.headline}<br />
                <span style={{ color: GOLD }}>{contact.headlineAccent}</span>
              </h2>
              <p style={{ fontFamily: BODY, fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.8, fontWeight: 400, marginBottom: 40 }}>
                {contact.description}
              </p>

              <div className="flex flex-col gap-6">
                {[
                  { icon: Phone,  label: "Téléphone",    value: contact.phone },
                  { icon: MapPin, label: "Localisation",  value: contact.location },
                  { icon: Clock,  label: "Horaires",      value: contact.hours },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 36, height: 36, border: `1px solid rgba(196,162,62,0.3)` }}>
                      <Icon size={14} style={{ color: GOLD }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, fontWeight: 600, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontFamily: BODY, fontSize: "0.86rem", color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Socials */}
            <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(196,162,62,0.15)" }}>
              <p style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontWeight: 600, marginBottom: 12 }}>
                Retrouvez-nous
              </p>
              <div className="flex gap-3">
                <a href="#" aria-label="Instagram"
                  className="flex items-center justify-center transition-all hover:opacity-70"
                  style={{ width: 38, height: 38, border: "1px solid rgba(196,162,62,0.25)", color: "rgba(255,255,255,0.65)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" aria-label="Facebook"
                  className="flex items-center justify-center transition-all hover:opacity-70"
                  style={{ width: 38, height: 38, border: "1px solid rgba(196,162,62,0.25)", color: "rgba(255,255,255,0.65)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* ── Right: form ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-10 md:p-14"
            style={{ background: "white" }}
          >
            <form className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  { label: "Nom complet", type: "text",  placeholder: "Votre nom" },
                  { label: "Email",       type: "email", placeholder: "votre@email.com" },
                ].map(({ label, type, placeholder }) => (
                  <label key={label} className="flex flex-col">
                    <span style={labelStyle}>{label}</span>
                    <input type={type} placeholder={placeholder} style={inputBase}
                      onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(196,162,62,0.2)")} />
                  </label>
                ))}
              </div>

              <label className="flex flex-col">
                <span style={labelStyle}>Téléphone</span>
                <input type="tel" placeholder="+216 XX XXX XXX" style={inputBase}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(196,162,62,0.2)")} />
              </label>

              <label className="flex flex-col">
                <span style={labelStyle}>Objet</span>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
                  style={{ ...inputBase, appearance: "none", cursor: "pointer" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(196,162,62,0.2)")}>
                  {contact.subjects.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span style={labelStyle}>Message</span>
                <textarea placeholder="Comment pouvons-nous vous aider ?" rows={5}
                  style={{ ...inputBase, resize: "vertical" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(196,162,62,0.2)")} />
              </label>

              <button type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:opacity-85 cursor-pointer mt-1"
                style={{ background: GOLD, color: "white", padding: "14px 32px", fontFamily: BODY }}>
                Envoyer le message
                <ArrowRight size={13} />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
