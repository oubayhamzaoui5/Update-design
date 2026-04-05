import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'
import {
  Layers,
  Palette,
  Ruler,
  Settings,
  ShieldCheck,
  Star,
  ArrowRight,
} from 'lucide-react'
import { getParasolContent } from '@/lib/services/site-content.service'

export const dynamic = 'force-dynamic'

/* ─── SEO ─────────────────────────────────────────────────────────────── */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

export const metadata: Metadata = {
  title: 'Parasols Professionnels — Hôtel, Terrasse & Piscine | Update Design Tunisie',
  description:
    'Parasols professionnels haut de gamme pour hôtels, restaurants et espaces extérieurs en Tunisie. Structure aluminium thermolaqué, toiles Sunbrella® 35+ coloris, modèles déportés Dallas, Havana, Ibiza et Mauris. Devis sur mesure sous 24 h.',
  keywords: [
    'parasol professionnel tunisie',
    'parasol hôtel tunisie',
    'parasol piscine tunisie',
    'parasol déporté tunisie',
    'parasol aluminium tunisie',
    'parasol toile sunbrella tunisie',
    'parasol restaurant terrasse tunisie',
    'update design parasol tunisie',
    'fournisseur parasol tunisie',
    'parasol sur mesure tunisie',
    'parasol promoteur immobilier tunisie',
  ],
  openGraph: {
    title: 'Parasols Professionnels — Update Design Tunisie',
    description:
      'Structure aluminium thermolaqué, toiles Sunbrella® 35+ coloris. Modèles déportés Dallas, Havana, Ibiza & Mauris — devis sous 24 h.',
    url: `${siteUrl}/parasols`,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parasols Professionnels — Update Design Tunisie',
    description:
      'Structure aluminium thermolaqué, toiles Sunbrella® 35+ coloris, modèles déportés haut de gamme.',
  },
  alternates: { canonical: '/parasols' },
}

/* ─── Tokens ──────────────────────────────────────────────────────────── */
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'

/* ─── Feature icons (fixed by position) ──────────────────────────────── */
const FEATURE_ICONS = [Layers, Palette, Ruler, Settings, ShieldCheck, Star]

/* ─── Page ────────────────────────────────────────────────────────────── */
export default async function ParasolsPage() {
  const c = getParasolContent()

  return (
    <div style={{ fontFamily: BODY }}>
      <Navbar reserveSpace />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <header
        className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden"
        style={{ background: DARK }}
      >
        <div className="absolute inset-0">
          <Image
            src="/hero/parasols-landscape-new.png"
            alt="Parasols professionnels haut de gamme — Update Design Tunisie"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(46,59,40,0.15) 0%, rgba(28,26,20,0.82) 70%, rgba(28,26,20,0.96) 100%)',
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10 md:pb-20">
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 400,
              color: '#FDFAF5',
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              marginBottom: 18,
            }}
          >
            {c.hero.headline}<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.7)' }}>{c.hero.italic}</em>
          </h1>
          <span
            style={{
              display: 'inline-block',
              fontFamily: BODY,
              fontSize: 13,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: GOLD,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            OutStore®
          </span>

          <p
            style={{
              fontFamily: BODY,
              fontSize: '1.05rem',
              color: 'rgba(253,250,245,0.65)',
              maxWidth: 520,
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            {c.hero.body}
          </p>

          <Link
            href={c.hero.ctaHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: GOLD,
              color: '#fff',
              fontFamily: BODY,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '14px 28px',
              transition: 'all 0.2s',
            }}
            className="w-full sm:w-auto hover:brightness-110 hover:shadow-lg"
          >
            {c.hero.ctaLabel} <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* ── MODELS ───────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-12">
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
              Nos Modèles
            </p>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 400,
                color: DARK,
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              4 modèles déportés,<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(28,26,20,0.5)' }}>une seule exigence</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
            {c.models.map((m) => (
              <article
                key={m.name}
                className="group flex flex-col overflow-hidden"
                style={{ border: '1px solid rgba(196,162,62,0.15)' }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
                  <Image
                    src={m.img}
                    alt={`Parasol ${m.name} — Update Design Tunisie`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(28,26,20,0.65) 0%, transparent 60%)',
                    }}
                  />
                  <p
                    className="absolute bottom-3 left-4"
                    style={{
                      fontFamily: BODY,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: GOLD,
                    }}
                  >
                    {m.tagline}
                  </p>
                </div>

                <div
                  className="flex flex-1 flex-col gap-2 p-5"
                  style={{ background: '#FDFAF5' }}
                >
                  <h3
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: '1.4rem',
                      fontWeight: 400,
                      color: DARK,
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {m.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: '0.82rem',
                      color: 'rgba(28,26,20,0.55)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {m.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href={c.hero.ctaHref}
              style={{
                fontFamily: BODY,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: GOLD,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              className="hover:gap-3 transition-all duration-200"
            >
              {c.hero.ctaLabel} <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24" style={{ background: DARK }}>
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
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
                Caractéristiques
              </p>
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 400,
                  color: '#FDFAF5',
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                Conçu pour durer,<br />
                <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.5)' }}>pensé pour plaire</em>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {c.features.map((f, idx) => {
              const Icon = FEATURE_ICONS[idx % FEATURE_ICONS.length]
              return (
                <div
                  key={f.title}
                  className="group flex flex-col gap-4 p-8 transition-colors duration-200 hover:bg-white/[0.04]"
                  style={{ border: '1px solid rgba(196,162,62,0.1)' }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid rgba(196,162,62,0.3)`,
                      color: GOLD,
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <h3
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: '1.3rem',
                      fontWeight: 400,
                      color: '#FDFAF5',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: '0.85rem',
                      color: 'rgba(253,250,245,0.5)',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {f.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── QUALITÉ & DURABILITÉ ─────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ background: DARK }}>
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">

            <div>
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 20 }}>
                Qualité & Durabilité
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 400, color: '#FDFAF5', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 28 }}>
                {c.premium.headline}<br />
                <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.45)' }}>{c.premium.italic}</em>
              </h2>
              <div style={{ borderLeft: `2px solid rgba(196,162,62,0.3)`, paddingLeft: 20 }}>
                <p style={{ fontFamily: BODY, fontSize: '0.92rem', color: 'rgba(253,250,245,0.65)', lineHeight: 1.85, marginBottom: 16 }}>
                  {c.premium.paragraph1}
                </p>
                <p style={{ fontFamily: BODY, fontSize: '0.92rem', color: 'rgba(253,250,245,0.65)', lineHeight: 1.85 }}>
                  {c.premium.paragraph2}
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-0" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {c.premium.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 py-5"
                  style={{ borderBottom: '1px solid rgba(196,162,62,0.1)' }}
                >
                  <span style={{ width: 6, height: 6, background: GOLD, flexShrink: 0, marginTop: 6 }} />
                  <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: 'rgba(253,250,245,0.65)', lineHeight: 1.7, margin: 0 }}>{feature}</p>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </section>

      {/* ── VISUAL BREAK — full-width image ──────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: 420 }}>
        <Image
          src="/hero/parasols-landscape-new.png"
          alt="Parasols haut de gamme au bord d'une piscine d'hôtel en Tunisie"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(28,26,20,0.45)' }}
        >
          <blockquote
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(1.6rem, 4vw, 3rem)',
              fontWeight: 400,
              color: '#FDFAF5',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              padding: '0 24px',
              maxWidth: 700,
            }}
          >
            &ldquo;{c.quote.text}<br />
            <em style={{ color: GOLD }}>{c.quote.accent}&rdquo;</em>
          </blockquote>
        </div>
      </div>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-28"
        style={{ background: DARK }}
        aria-labelledby="parasols-cta-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #C4A23E 0, #C4A23E 1px, transparent 0, transparent 50%)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative mx-auto max-w-[900px] px-6 text-center md:px-10">
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
            Votre Projet
          </p>
          <h2
            id="parasols-cta-heading"
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
              fontWeight: 400,
              color: CREAM,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            {c.cta.headline}<br />
            <em style={{ fontStyle: 'italic', color: GOLD }}>{c.cta.italic}</em>
          </h2>
          <p
            style={{
              fontFamily: BODY,
              fontSize: '1rem',
              color: 'rgba(253,250,245,0.6)',
              maxWidth: 500,
              margin: '0 auto 36px',
              lineHeight: 1.7,
            }}
          >
            {c.cta.body}
          </p>

          <Link
            href={c.cta.ctaHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: GOLD,
              color: '#fff',
              fontFamily: BODY,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '18px 38px',
              transition: 'all 0.2s',
            }}
            className="w-full sm:w-auto hover:brightness-110 hover:shadow-xl"
          >
            {c.cta.ctaLabel} <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
