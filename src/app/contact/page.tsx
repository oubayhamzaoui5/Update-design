import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, ArrowRight, MessageCircle } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

/* ─── SEO ──────────────────────────────────────────────────────── */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

export const metadata: Metadata = {
  title: 'Contactez-Nous — Devis Gratuit | Update Design Tunisie',
  description:
    'Contactez Update Design pour un devis sur mesure : parasols, stores à bras invisibles, panneaux muraux, gazon artificiel. Réponse sous 24h, livraison nationale en Tunisie.',
  keywords: [
    'contact update design tunisie',
    'devis décoration tunisie',
    'fournisseur décoration contact',
    'devis parasol tunisie',
    'devis store tunisie',
    'update design téléphone',
  ],
  openGraph: {
    title: 'Contactez Update Design — Devis Gratuit',
    description: 'Devis volume, partenariat revendeur, question produit — réponse sous 24h.',
    url: `${siteUrl}/contact`,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  alternates: { canonical: '/contact' },
}

/* ─── Tokens ───────────────────────────────────────────────────── */
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'
const SLATE   = '#1A2028'

/* ─── Contact info ─────────────────────────────────────────────── */
const INFO_ITEMS = [
  {
    icon: Phone,
    label: 'Téléphone',
    value: '+216 XX XXX XXX',
    href: 'tel:+216XXXXXXXX',
    sub: 'Lun–Sam, 8h30–18h',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+216 XX XXX XXX',
    href: 'https://wa.me/216XXXXXXXX',
    sub: 'Réponse rapide',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@updatedesign.tn',
    href: 'mailto:contact@updatedesign.tn',
    sub: 'Réponse sous 24h',
  },
  {
    icon: MapPin,
    label: 'Adresse',
    value: 'Tunis, Tunisie',
    href: null,
    sub: 'Livraison nationale',
  },
  {
    icon: Clock,
    label: 'Horaires',
    value: 'Lun – Sam',
    href: null,
    sub: '8h30 – 18h00',
  },
]

const SUBJECTS = [
  'Devis volume / Achat en gros',
  'Hôtel / Résidence / Promoteur',
  'Partenariat revendeur',
  'Architecte / Décorateur / BTP',
  'Store à bras invisibles',
  'Parasols professionnels',
  'Information produit',
  'Suivi de commande',
  'Autre',
]

/* ─── Page ─────────────────────────────────────────────────────── */
export default function ContactPage() {
  return (
    <div style={{ fontFamily: BODY, background: CREAM }}>
      <Navbar reserveSpace />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden py-24 md:py-32"
        style={{ background: SLATE }}
      >
        {/* Diagonal gold line */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #C4A23E 0, #C4A23E 1px, transparent 0, transparent 50%)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
          <p
            style={{
              fontFamily: BODY,
              fontSize: 10,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: GOLD,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            Nous Contacter
          </p>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 400,
              color: CREAM,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            Parlons de<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.6)' }}>votre projet.</em>
          </h1>
          <p
            style={{
              fontFamily: BODY,
              fontSize: '1rem',
              color: 'rgba(253,250,245,0.6)',
              maxWidth: 480,
              lineHeight: 1.7,
            }}
          >
            Devis volume, partenariat revendeur, question produit ou suivi de commande —
            notre équipe vous répond sous 24h, du lundi au samedi.
          </p>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main>
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">

            {/* ── Left: info ─────────────────────────────────── */}
            <div className="lg:col-span-2">
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                Informations
              </p>
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 400,
                  color: DARK,
                  lineHeight: 1.08,
                  letterSpacing: '-0.01em',
                  marginBottom: 28,
                }}
              >
                Nous sommes<br />
                <em style={{ fontStyle: 'italic', color: 'rgba(28,26,20,0.5)' }}>à votre écoute.</em>
              </h2>

              <ul className="flex flex-col gap-0" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {INFO_ITEMS.map((item, i) => {
                  const Icon = item.icon
                  const inner = (
                    <div
                      className="flex items-start gap-4 py-5 transition-colors hover:bg-[rgba(196,162,62,0.04)]"
                      style={{
                        borderTop: i === 0 ? `1px solid rgba(196,162,62,0.2)` : 'none',
                        borderBottom: `1px solid rgba(196,162,62,0.2)`,
                        paddingLeft: 4,
                        paddingRight: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid rgba(196,162,62,0.3)`,
                          color: GOLD,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <Icon size={15} strokeWidth={1.5} />
                      </span>
                      <div>
                        <p
                          style={{
                            fontFamily: BODY,
                            fontSize: 9,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'rgba(28,26,20,0.4)',
                            fontWeight: 700,
                            marginBottom: 3,
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontFamily: DISPLAY,
                            fontSize: '1.15rem',
                            fontWeight: 400,
                            color: DARK,
                            letterSpacing: '-0.01em',
                            marginBottom: 2,
                          }}
                        >
                          {item.value}
                        </p>
                        <p
                          style={{
                            fontFamily: BODY,
                            fontSize: '0.78rem',
                            color: 'rgba(28,26,20,0.45)',
                          }}
                        >
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  )
                  return (
                    <li key={item.label}>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                          className="block"
                        >
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  )
                })}
              </ul>

              {/* Quick links */}
              <div className="mt-8">
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(28,26,20,0.4)',
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  Nos configurateurs
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Configurer mon parasol', href: '/parasol' },
                    { label: 'Configurer mon store', href: '/tinda' },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="inline-flex items-center gap-2 transition-all duration-200 hover:gap-3"
                      style={{
                        fontFamily: BODY,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: GOLD,
                      }}
                    >
                      {l.label} <ArrowRight size={11} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: form ────────────────────────────────── */}
            <div
              className="lg:col-span-3 p-8 md:p-10"
              style={{
                background: SLATE,
                border: `1px solid rgba(196,162,62,0.12)`,
              }}
            >
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Formulaire de contact
              </p>
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)',
                  fontWeight: 400,
                  color: CREAM,
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  marginBottom: 28,
                }}
              >
                Demandez votre devis gratuit
              </h2>

              <form
                action="/api/contact"
                method="POST"
                className="flex flex-col gap-5"
              >
                {/* Name + Company */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      style={{
                        display: 'block',
                        fontFamily: BODY,
                        fontSize: 9,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(253,250,245,0.45)',
                        fontWeight: 700,
                        marginBottom: 7,
                      }}
                    >
                      Nom complet *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Prénom Nom"
                      style={{
                        width: '100%',
                        background: 'rgba(253,250,245,0.05)',
                        border: '1px solid rgba(196,162,62,0.2)',
                        padding: '11px 14px',
                        fontSize: '0.875rem',
                        fontFamily: BODY,
                        color: CREAM,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      style={{
                        display: 'block',
                        fontFamily: BODY,
                        fontSize: 9,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(253,250,245,0.45)',
                        fontWeight: 700,
                        marginBottom: 7,
                      }}
                    >
                      Société / Projet
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Nom de votre société"
                      style={{
                        width: '100%',
                        background: 'rgba(253,250,245,0.05)',
                        border: '1px solid rgba(196,162,62,0.2)',
                        padding: '11px 14px',
                        fontSize: '0.875rem',
                        fontFamily: BODY,
                        color: CREAM,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      style={{
                        display: 'block',
                        fontFamily: BODY,
                        fontSize: 9,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(253,250,245,0.45)',
                        fontWeight: 700,
                        marginBottom: 7,
                      }}
                    >
                      Téléphone *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+216 XX XXX XXX"
                      style={{
                        width: '100%',
                        background: 'rgba(253,250,245,0.05)',
                        border: '1px solid rgba(196,162,62,0.2)',
                        padding: '11px 14px',
                        fontSize: '0.875rem',
                        fontFamily: BODY,
                        color: CREAM,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: 'block',
                        fontFamily: BODY,
                        fontSize: 9,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(253,250,245,0.45)',
                        fontWeight: 700,
                        marginBottom: 7,
                      }}
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      style={{
                        width: '100%',
                        background: 'rgba(253,250,245,0.05)',
                        border: '1px solid rgba(196,162,62,0.2)',
                        padding: '11px 14px',
                        fontSize: '0.875rem',
                        fontFamily: BODY,
                        color: CREAM,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    style={{
                      display: 'block',
                      fontFamily: BODY,
                      fontSize: 9,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'rgba(253,250,245,0.45)',
                      fontWeight: 700,
                      marginBottom: 7,
                    }}
                  >
                    Objet de la demande *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    style={{
                      width: '100%',
                      background: '#1A2028',
                      border: '1px solid rgba(196,162,62,0.2)',
                      padding: '11px 14px',
                      fontSize: '0.875rem',
                      fontFamily: BODY,
                      color: CREAM,
                      outline: 'none',
                      appearance: 'none',
                    }}
                  >
                    <option value="" disabled>Sélectionnez un sujet</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s} style={{ background: '#1A2028' }}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    style={{
                      display: 'block',
                      fontFamily: BODY,
                      fontSize: 9,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'rgba(253,250,245,0.45)',
                      fontWeight: 700,
                      marginBottom: 7,
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Décrivez votre projet, dimensions, quantités souhaitées..."
                    style={{
                      width: '100%',
                      background: 'rgba(253,250,245,0.05)',
                      border: '1px solid rgba(196,162,62,0.2)',
                      padding: '11px 14px',
                      fontSize: '0.875rem',
                      fontFamily: BODY,
                      color: CREAM,
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 transition-all duration-200 hover:brightness-110 hover:shadow-lg"
                  style={{
                    background: GOLD,
                    color: DARK,
                    fontFamily: BODY,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    padding: '16px 32px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Envoyer ma demande <ArrowRight size={14} />
                </button>

                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: '0.78rem',
                    color: 'rgba(253,250,245,0.3)',
                    lineHeight: 1.5,
                  }}
                >
                  Vos données sont traitées uniquement pour répondre à votre demande.
                  Réponse garantie sous 24h (jours ouvrés).
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
