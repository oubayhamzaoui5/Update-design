"use client"

import Link from "next/link"

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"
const CREAM   = "#EDE8DF"

const columns = [
  {
    heading: "Boutique",
    links: [
      { label: "Tous les produits",  href: "/shop" },
      { label: "Panneaux muraux",    href: "/shop" },
      { label: "Gazon artificiel",   href: "/shop" },
      { label: "Néons LED",          href: "/shop" },
      { label: "Nouveautés",         href: "/shop" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Nous contacter",   href: "/#contact" },
      { label: "FAQ",              href: "/#faq" },
      { label: "Livraison",        href: "/#faq" },
      { label: "Retours",          href: "/#faq" },
      { label: "Suivi commande",   href: "/#contact" },
    ],
  },
  {
    heading: "Entreprise",
    links: [
      { label: "Notre histoire",    href: "/#story" },
      { label: "Blog",              href: "/blog" },
      { label: "Projets pro",       href: "/#contact" },
      { label: "Politique de confidentialité", href: "#" },
      { label: "Conditions d'utilisation",     href: "#" },
    ],
  },
]

export default function Footer() {
  return (
    <footer aria-label="Site footer" style={{ background: CREAM, borderTop: `1px solid rgba(196,162,62,0.2)` }}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-16 pb-10">

        {/* ── Top row: logo + tagline ── */}
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1, margin: 0, letterSpacing: "0.08em" }}>
              <span style={{ fontWeight: 600, color: DARK, letterSpacing: "0.12em" }}>UPDATE</span>
              {" "}
              <span style={{ fontWeight: 700, color: GOLD, letterSpacing: "0.08em" }}>DESIGN</span>
            </h2>
            <p style={{ fontFamily: BODY, fontSize: "0.82rem", color: `rgba(28,26,20,0.5)`, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, marginTop: 10 }}>
              Décoration intérieure &amp; extérieure — Tunisie
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <p style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: `rgba(28,26,20,0.65)`, fontWeight: 700, marginRight: 6 }}>
              Suivez-nous
            </p>
            <a href="#" aria-label="Instagram"
              className="flex items-center justify-center transition-all hover:opacity-70"
              style={{ width: 38, height: 38, border: `1px solid rgba(196,162,62,0.35)`, color: DARK, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="#" aria-label="Facebook"
              className="flex items-center justify-center transition-all hover:opacity-70"
              style={{ width: 38, height: 38, border: `1px solid rgba(196,162,62,0.35)`, color: DARK, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: `rgba(196,162,62,0.15)`, marginBottom: 48 }} />

        {/* ── Link columns ── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 mb-14">
          {columns.map(({ heading, links }) => (
            <div key={heading}>
              <p style={{ fontFamily: BODY, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 20 }}>
                {heading}
              </p>
              <nav className="flex flex-col gap-3">
                {links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 600, color: `rgba(28,26,20,0.65)`, letterSpacing: "0.02em" }}
                    className="transition-colors hover:text-[#C4A23E]"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row" style={{ borderTop: `1px solid rgba(196,162,62,0.15)`, paddingTop: 28 }}>
          <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: `rgba(28,26,20,0.65)`, fontWeight: 700 }}>
            &copy; 2026 Update Design. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, display: "inline-block" }} />
            <span style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: `rgba(28,26,20,0.65)`, fontWeight: 700 }}>
              Sublimez votre espace
            </span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, display: "inline-block" }} />
          </div>
        </div>

      </div>
    </footer>
  )
}
