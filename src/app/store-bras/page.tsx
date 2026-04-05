import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'
import { ArrowRight, Star, Wind, Zap, ShieldCheck, Palette, Layers, Ruler } from 'lucide-react'
import { getStoreBrasContent } from '@/lib/services/site-content.service'

export const dynamic = 'force-dynamic'

/* ─── SEO ─────────────────────────────────────────────────────────────── */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

export const metadata: Metadata = {
  title: 'Store à Bras Invisibles — Protection Solaire Premium | Update Design Tunisie',
  description:
    'Stores à bras invisibles haut de gamme : mécanisme escamotable, toiles Sunbrella® haute résistance, structure aluminium thermolaqué, motorisation Somfy. Fabrication et installation en Tunisie.',
  keywords: [
    'store bras invisible tunisie',
    'store premium tunisie',
    'store motorisé sur mesure tunisie',
    'protection solaire tunisie',
    'toile sunbrella store tunisie',
    'update design store tunisie',
  ],
  openGraph: {
    title: 'Store à Bras Invisibles Premium — Update Design Tunisie',
    description: 'Toiles Sunbrella®, motorisation Somfy, structure aluminium. Fabrication sur mesure en Tunisie.',
    url: `${siteUrl}/store-bras`,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Store à Bras Invisibles Premium — Update Design Tunisie',
    description: 'Toiles Sunbrella®, motorisation Somfy, structure aluminium. Fabrication sur mesure.',
  },
  alternates: { canonical: '/store-bras' },
}

/* ─── Tokens ──────────────────────────────────────────────────────────── */
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'

/* ─── Feature icons (fixed by position) ──────────────────────────────── */
const FEATURE_ICONS = [Wind, Zap, ShieldCheck, Palette, Layers, Ruler]

/* ─── Page ────────────────────────────────────────────────────────────── */
export default async function StoreBrasPage() {
  const c = getStoreBrasContent()

  return (
    <div style={{ fontFamily: BODY, background: CREAM }}>
      <Navbar reserveSpace />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <header
        className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden"
        style={{ background: DARK }}
      >
        <div className="absolute inset-0">
          <Image
            src="/hero/stores-landscape-new.png"
            alt="Store à bras invisibles motorisé — Update Design Tunisie"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(18,14,8,0.92) 0%, rgba(18,14,8,0.48) 50%, rgba(18,14,8,0.14) 100%)',
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10 md:pb-20">
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              fontWeight: 400,
              color: CREAM,
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              marginBottom: 18,
            }}
          >
            {c.hero.headline}<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.7)' }}>{c.hero.italic}</em>
          </h1>
          <span style={{ display: 'inline-block', fontFamily: BODY, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 24 }}>
            OutStore®
          </span>
          <p style={{ fontFamily: BODY, fontSize: '1.05rem', color: 'rgba(253,250,245,0.7)', maxWidth: 480, lineHeight: 1.7, marginBottom: 36 }}>
            {c.hero.body}
          </p>
          <Link
            href={c.hero.ctaHref}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: GOLD, color: '#fff', fontFamily: BODY, fontSize: 11,
              fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '14px 28px', transition: 'all 0.2s',
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
          <div className="mb-14">
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 12 }}>
              Nos Modèles
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, color: DARK, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
              Pragua & Valancia
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {c.models.map((model) => (
              <div key={model.name}>
                <div
                  className="relative w-full overflow-hidden"
                  style={{ background: '#f0ede6', aspectRatio: '4/3', border: model.recommended ? `1px solid ${GOLD}` : '1px solid rgba(196,162,62,0.15)' }}
                >
                  {model.recommended && (
                    <div style={{ position: 'absolute', top: 14, right: 14, background: GOLD, color: '#fff', fontFamily: BODY, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, zIndex: 1 }}>
                      <Star size={9} fill="#fff" strokeWidth={0} /> Recommandé
                    </div>
                  )}
                  <Image
                    src={model.img}
                    alt={`Store ${model.name} avec lambrequin droit`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-6"
                  />
                </div>
                <div className="pt-6">
                  <h3 style={{ fontFamily: DISPLAY, fontSize: '1.6rem', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', marginBottom: 8 }}>{model.name}</h3>
                  <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: 'rgba(28,26,20,0.6)', lineHeight: 1.75 }}>
                    {model.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href={c.hero.ctaHref}
              style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, borderBottom: `1px solid rgba(196,162,62,0.4)`, paddingBottom: 5, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              className="transition-all hover:gap-3"
            >
              {c.hero.ctaLabel} <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PREMIUM ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ background: DARK }}>
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">

            {/* Left: editorial text */}
            <div>
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 20 }}>
                Qualité & Durabilité
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 400, color: CREAM, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 28 }}>
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

            {/* Right: features */}
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

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24" style={{ background: DARK }}>
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-12">
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 12 }}>
              Caractéristiques
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: CREAM, lineHeight: 1.05, letterSpacing: '-0.01em', margin: 0 }}>
              Ce qui le rend différent
            </h2>
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
                  <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(196,162,62,0.3)`, color: GOLD }}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: '1.3rem', fontWeight: 400, color: CREAM, margin: 0, letterSpacing: '-0.01em' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(253,250,245,0.5)', lineHeight: 1.7, margin: 0 }}>
                    {f.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── APPLICATIONS ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-24" style={{ background: CREAM }}>
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-20">
            <div style={{ flex: '0 0 auto', maxWidth: 300 }}>
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 14 }}>Applications</p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: DARK, lineHeight: 1.08, letterSpacing: '-0.01em', marginBottom: 14, whiteSpace: 'pre-line' }}>
                {c.applications.headline}
              </h2>
              <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.7 }}>
                {c.applications.description}
              </p>
            </div>

            <ul className="flex flex-1 flex-col" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {c.applications.items.map((app, i) => (
                <li
                  key={app}
                  className="flex items-center justify-between py-5 transition-colors hover:bg-[rgba(196,162,62,0.04)]"
                  style={{ borderTop: i === 0 ? `1px solid rgba(196,162,62,0.2)` : 'none', borderBottom: `1px solid rgba(196,162,62,0.2)` }}
                >
                  <span style={{ fontFamily: DISPLAY, fontSize: '1.25rem', fontWeight: 400, color: DARK, letterSpacing: '-0.01em' }}>{app}</span>
                  <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.2em' }}>0{i + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24" style={{ background: DARK }} aria-labelledby="store-bras-cta-heading">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C4A23E 0, #C4A23E 1px, transparent 0, transparent 50%)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto max-w-[900px] px-6 text-center md:px-10">
          <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 18 }}>Votre Projet</p>
          <h2
            id="store-bras-cta-heading"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', fontWeight: 400, color: CREAM, lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: 20 }}
          >
            {c.cta.headline}<br />
            <em style={{ fontStyle: 'italic', color: GOLD }}>{c.cta.italic}</em>
          </h2>
          <p style={{ fontFamily: BODY, fontSize: '1rem', color: 'rgba(253,250,245,0.6)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
            {c.cta.body}
          </p>
          <Link
            href={c.cta.ctaHref}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: GOLD, color: '#fff', fontFamily: BODY, fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '18px 38px', transition: 'all 0.2s' }}
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
