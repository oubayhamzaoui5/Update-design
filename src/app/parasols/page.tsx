import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { getParasolContent } from '@/lib/services/site-content.service'
import type { ParasolContent } from '@/types/site-content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Parasols Professionnels & Hotellerie | Update Design Tunisie',
  description:
    'Parasols professionnels pour hotels, cafes, restaurants, piscines, terrasses et jardins. Selection de modeles et formulaire de devis sur mesure.',
  alternates: { canonical: '/parasols' },
}

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'

// Technical plate data per model — type, dimensions, usage + silhouette variant
const MODEL_PLATES: Record<string, { type: string; dim: string; usage: string; silhouette: 'cantilever' | 'asym' | 'duo' }> = {
  Dallas: { type: 'Déporté compact', dim: '2.5 – 3 m', usage: 'Espaces réduits & résidentiel', silhouette: 'cantilever' },
  Havana: { type: 'Asymétrique · bras 360°', dim: '3 m', usage: 'Terrasses de restaurant', silhouette: 'asym' },
  Ibiza: { type: 'Déporté premium', dim: '3 – 4 m', usage: 'Hôtels 4★ / 5★', silhouette: 'cantilever' },
  Mauris: { type: 'Multi-têtes', dim: '4 m +', usage: 'Plages privées & piscines', silhouette: 'duo' },
}

// Structure (mât + armature) finishes — real swatches
const STRUCTURES = [
  { file: '/parasol/structures/gris-givre.webp', name: 'Gris givré' },
  { file: '/parasol/structures/gris-givre-fonce.webp', name: 'Gris givré foncé' },
  { file: '/parasol/structures/marron-givre.webp', name: 'Marron givré' },
  { file: '/parasol/structures/noir.webp', name: 'Noir' },
]

// Full toile library — real acrylic swatches
const FABRICS = [
  'SA2826_Champagne', 'SA2821_Silver', 'SA2979_Perla', 'SA8157_Alabastro', 'SA2143_Marfil', 'SA2296_Avena',
  'SA2829_Limon', 'SA2013_Amarillo', 'SA2050_Naranja', 'SA1066_rouge', 'SA2210_Rioja', 'SA2101_Granate',
  'SA2146_Marron', 'SA2316_Cafe', 'SA2024_Anis', 'SA2246_Verde-Claro', 'SA2242_Verde', 'SA2245_Botella',
  'SA2129_Turkis', 'SA2018_Azul', 'SA2235_Azul-Real', 'SA2145_Marino', 'SA2828_Indigo', 'SA1067_Grape',
  'SA2835_Pink', 'SA2831_Mineral', 'SA2327_Basalto', 'SA8488_Antracita', 'SA3582_Tweed-Negro', 'SA2170_Negro',
  'SA1070_Marmol', 'SA1069_Optik', 'SA1489_Tropic', 'SA2838_Integral',
].map((f) => ({ file: `/parasol/dallas-fabrics/${f}.webp`, ref: f.split('_')[0], name: f.split('_')[1].replace(/-/g, ' ') }))

// Side-elevation silhouette, drawn to type — the catalogue's technical device
function ParasolSilhouette({ variant }: { variant: 'cantilever' | 'asym' | 'duo' }) {
  const stroke = 'rgba(20,19,15,0.75)'
  if (variant === 'duo') {
    return (
      <svg viewBox="0 0 240 120" className="h-full w-full" role="img" aria-label="Silhouette parasol multi-têtes">
        <line x1="10" y1="108" x2="230" y2="108" stroke={stroke} strokeWidth="2" />
        <line x1="120" y1="108" x2="120" y2="30" stroke={stroke} strokeWidth="2.5" />
        <path d="M120 30 L28 44 M120 30 L212 44" stroke={GOLD} strokeWidth="2.5" fill="none" />
        <path d="M28 44 L66 58 L120 46 M212 44 L174 58 L120 46" stroke={stroke} strokeWidth="1.8" fill="none" />
        <line x1="66" y1="58" x2="66" y2="66" stroke={stroke} strokeWidth="1.4" />
        <line x1="174" y1="58" x2="174" y2="66" stroke={stroke} strokeWidth="1.4" />
      </svg>
    )
  }
  if (variant === 'asym') {
    return (
      <svg viewBox="0 0 240 120" className="h-full w-full" role="img" aria-label="Silhouette parasol asymétrique">
        <line x1="10" y1="108" x2="230" y2="108" stroke={stroke} strokeWidth="2" />
        <line x1="196" y1="108" x2="196" y2="26" stroke={stroke} strokeWidth="2.5" />
        <path d="M196 26 Q160 18 128 34" stroke={GOLD} strokeWidth="2.5" fill="none" />
        <path d="M150 30 L34 52 L96 64 L150 44 Z" stroke={stroke} strokeWidth="1.8" fill="none" />
        <line x1="96" y1="64" x2="96" y2="74" stroke={stroke} strokeWidth="1.4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full" role="img" aria-label="Silhouette parasol déporté">
      <line x1="10" y1="108" x2="230" y2="108" stroke={stroke} strokeWidth="2" />
      <line x1="200" y1="108" x2="200" y2="24" stroke={stroke} strokeWidth="2.5" />
      <path d="M200 24 Q168 14 138 28" stroke={GOLD} strokeWidth="2.5" fill="none" />
      <path d="M138 28 L36 46 M138 28 L86 62" stroke={stroke} strokeWidth="1.8" fill="none" />
      <path d="M36 46 L86 62" stroke={stroke} strokeWidth="1.8" fill="none" />
      <line x1="86" y1="62" x2="86" y2="72" stroke={stroke} strokeWidth="1.4" />
    </svg>
  )
}

const DEFAULT_PARASOL_CONTENT: ParasolContent = {
  hero: {
    headline: 'Parasols',
    italic: 'Premium',
    body: "De la piscine d'hotel a la terrasse de restaurant, nos parasols associent structure aluminium, toiles techniques et modeles deportes pour composer une zone d'ombre durable.",
    ctaLabel: 'Configurer mon parasol',
    ctaHref: '/parasol',
  },
  models: [
    { name: 'Dallas', img: '/dallas.webp', tagline: 'Compact & Fonctionnel', desc: 'Parasol deporte compact, ideal pour les espaces reduits. Facilement repositionnable.' },
    { name: 'Havana', img: '/havana.webp', tagline: 'Elegance Asymetrique', desc: 'Design asymetrique elegant avec bras orientable a 360 degres. La reference des terrasses de restaurant.' },
    { name: 'Ibiza', img: '/ibiza.webp', tagline: 'Premium Hotelier', desc: 'Parasol deporte premium avec finition haut de gamme. Concu pour les etablissements 4 et 5 etoiles.' },
    { name: 'Mauris', img: '/mauris.webp', tagline: 'Grandes Surfaces', desc: 'Structure multi-tetes pour couvrir de larges surfaces. Ideal pour les plages privees et les piscines.' },
  ],
  features: [
    { title: 'Structure Aluminium', body: 'Profiles aluminium thermolaque ultra-resistants a la corrosion saline, adaptes au bord de mer et aux zones cotieres tunisiennes.' },
    { title: 'Toiles techniques', body: 'Toiles acryliques resistantes aux UV, a la pluie et aux usages intensifs en hotellerie, restauration et espaces prives.' },
    { title: 'Dimensions Sur Mesure', body: 'Diametres, formes carrees ou rectangulaires et implantation ajustees selon la zone a couvrir.' },
    { title: 'Installation Professionnelle', body: 'Accompagnement sur le choix du modele, du coloris, de la fixation et de la quantite selon votre projet.' },
  ],
  premium: {
    headline: 'Concu pour durer,',
    italic: 'pense pour plaire',
    paragraph1: "Chaque parasol est choisi selon l'exposition, la circulation et l'intensite d'usage du lieu. La structure doit rester stable, lisible et facile a utiliser au quotidien.",
    paragraph2: "La toile et les finitions permettent d'accorder l'ombre a l'identite du projet: hotel, cafe, piscine, villa, jardin ou terrasse professionnelle.",
    features: [
      'Structure aluminium thermolaque resistante aux intemperies',
      'Toiles personnalisables selon coloris et usage',
      '4 modeles deportes: Dallas, Havana, Ibiza, Mauris',
      'Dimensions adaptees a la surface et a la circulation',
      'Devis et installation possibles partout en Tunisie',
    ],
  },
  quote: {
    text: "L'ombre n'est pas un luxe.",
    accent: "C'est une signature.",
  },
  cta: {
    headline: "Donnez de l'ombre",
    italic: 'a votre projet.',
    body: 'Partagez vos dimensions, votre coloris prefere et la nature de votre projet. Nous revenons vers vous avec une proposition adaptee a votre espace.',
    ctaLabel: 'Configurer mon parasol',
    ctaHref: '/parasol',
  },
}

function mergeParasolContent(saved: ParasolContent): ParasolContent {
  return {
    hero: { ...DEFAULT_PARASOL_CONTENT.hero, ...saved?.hero },
    models: saved?.models?.length ? saved.models : DEFAULT_PARASOL_CONTENT.models,
    features: saved?.features?.length ? saved.features : DEFAULT_PARASOL_CONTENT.features,
    premium: {
      ...DEFAULT_PARASOL_CONTENT.premium,
      ...saved?.premium,
      features: saved?.premium?.features?.length ? saved.premium.features : DEFAULT_PARASOL_CONTENT.premium.features,
    },
    quote: { ...DEFAULT_PARASOL_CONTENT.quote, ...saved?.quote },
    cta: { ...DEFAULT_PARASOL_CONTENT.cta, ...saved?.cta },
  }
}

export default function ParasolsPage() {
  const content = mergeParasolContent(getParasolContent())

  return (
    <div style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <Navbar reserveSpace />

      <main>
        {/* COMPACT CATEGORY BAND */}
        <section className="border-b" style={{ background: CREAM, borderColor: 'rgba(20,19,15,0.12)' }}>
          <div className="mx-auto max-w-[1500px] px-6 py-7 md:px-10">
            <nav className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">
              <Link href="/boutique" className="hover:text-[#14130F]">Catalogue</Link>
              <span className="px-2">/</span>
              <span style={{ color: GOLD }}>Parasols professionnels</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 400 }} className="text-4xl leading-none md:text-5xl">
                  Parasols professionnels
                </h1>
                <p className="mt-2 max-w-[640px] text-sm leading-6 text-[#14130F]/60">
                  Quatre modèles déportés, une structure aluminium thermolaqué et une bibliothèque de toiles acryliques. Chaque parasol est dimensionné sur mesure pour votre espace.
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{content.models.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">modèles</p>
                </div>
                <Link href={content.hero.ctaHref} className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: GOLD }}>
                  Configurer <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LEAD — real project photography */}
        <section>
          <div className="mx-auto max-w-[1500px] px-6 pt-8 md:px-10">
            <div className="relative aspect-[16/7] w-full overflow-hidden md:aspect-[21/8]">
              <Image src="/editorial/hotel-pool-parasols.jpg" alt="Parasols professionnels installés autour d'une piscine d'hôtel" fill priority sizes="(max-width:1500px) 100vw, 1500px" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,19,15,0.55),transparent_45%)]" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD }}>Hôtels · Restaurants · Piscines · Villas</p>
                <p style={{ fontFamily: DISPLAY }} className="mt-2 max-w-[560px] text-2xl leading-tight text-white md:text-4xl">
                  L&apos;ombre n&apos;est pas un luxe. <em style={{ color: GOLD }}>C&apos;est une signature.</em>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MODEL PLATES — numbered catalogue plates, photo + technical panel */}
        <section id="modeles" className="pt-12 md:pt-16">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>La collection</p>
                <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">Quatre modèles, quatre implantations.</h2>
              </div>
              <p className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52 sm:block">{content.models.length} modèles déportés</p>
            </div>

            <div className="grid gap-10">
              {content.models.map((model, index) => {
                const plate = MODEL_PLATES[model.name]
                const flip = index % 2 === 1
                return (
                  <article key={`${model.name}-${index}`} className="grid overflow-hidden border border-[#14130F]/12 bg-[#FCFCFD] lg:grid-cols-2">
                    <div className={`relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[460px] ${flip ? 'lg:order-2' : ''}`}>
                      {model.img ? (
                        <Image
                          src={model.img}
                          alt={`Parasol ${model.name} — ${model.tagline}`}
                          fill
                          sizes="(max-width:1024px) 100vw, 50vw"
                          priority={index === 0}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#E9DDC9]">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#14130F]/45">Image à venir</p>
                        </div>
                      )}
                      <span className="absolute left-5 top-5 bg-black/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                        {model.tagline}
                      </span>
                    </div>

                    <div className={`flex flex-col justify-between p-6 md:p-9 ${flip ? 'lg:order-1' : ''}`}>
                      <div>
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#14130F]/40">Modèle 0{index + 1}</p>
                            <h3 style={{ fontFamily: DISPLAY }} className="mt-2 text-5xl leading-none md:text-6xl">{model.name}</h3>
                          </div>
                          {plate && (
                            <div className="hidden h-20 w-40 shrink-0 border border-[#14130F]/12 bg-[#F1E9DA] px-3 py-2 sm:block" style={{ backgroundImage: 'radial-gradient(rgba(20,19,15,0.06) 0.7px, transparent 0.7px)', backgroundSize: '8px 8px' }}>
                              <ParasolSilhouette variant={plate.silhouette} />
                            </div>
                          )}
                        </div>
                        <p className="mt-5 max-w-[520px] text-sm leading-7 text-[#14130F]/60">{model.desc}</p>

                        {plate && (
                          <div className="mt-7 grid gap-0 border-t border-[#14130F]/12">
                            {[
                              ['Type', plate.type],
                              ['Dimensions', plate.dim],
                              ['Usage idéal', plate.usage],
                              ['Structure', 'Aluminium thermolaqué'],
                            ].map(([k, v]) => (
                              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-[#14130F]/12 py-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">{k}</span>
                                <span className="text-sm font-semibold text-[#14130F]/80">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href={content.hero.ctaHref} className="inline-flex items-center justify-center gap-3 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: DARK }}>
                          Configurer ce modèle <ArrowRight size={14} />
                        </Link>
                        <Link href="/devis" className="inline-flex items-center justify-center gap-3 border border-[#14130F]/16 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#14130F]">
                          Demander un devis
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* MATERIALS LIBRARY — structures + toiles */}
        <section className="mt-14 py-12 md:py-16" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Bibliothèque matières</p>
              <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">Composez structure et toile.</h2>
            </div>

            <div className="grid gap-10 lg:grid-cols-[0.32fr_0.68fr]">
              {/* structures */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#14130F]/55">01 · Structure</p>
                  <div className="h-px flex-1 bg-[#14130F]/20" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#14130F]/40">{STRUCTURES.length} finitions</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {STRUCTURES.map((s) => (
                    <figure key={s.file} className="group">
                      <div className="relative aspect-square overflow-hidden border border-[#14130F]/12 bg-white">
                        <Image src={s.file} alt={`Structure aluminium finition ${s.name}`} fill sizes="(max-width:1024px) 25vw, 10vw" className="object-cover transition duration-500 group-hover:scale-[1.05]" />
                      </div>
                      <figcaption className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#14130F]/54">{s.name}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>

              {/* toiles */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#14130F]/55">02 · Toile acrylique</p>
                  <div className="h-px flex-1 bg-[#14130F]/20" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#14130F]/40">{FABRICS.length} coloris</p>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 lg:grid-cols-9">
                  {FABRICS.map((fabric) => (
                    <figure key={fabric.file} className="group" title={`${fabric.ref} ${fabric.name}`}>
                      <div className="relative aspect-square overflow-hidden border border-[#14130F]/12 bg-white">
                        <Image src={fabric.file} alt={`Toile parasol coloris ${fabric.name} (${fabric.ref})`} fill sizes="(max-width:640px) 20vw, 8vw" className="object-cover transition duration-500 group-hover:scale-[1.08]" />
                      </div>
                      <figcaption className="mt-1.5 truncate text-center text-[9px] font-bold uppercase tracking-[0.08em] text-[#14130F]/50">{fabric.name}</figcaption>
                    </figure>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-7 text-[#14130F]/55">Toiles acryliques teintées masse, résistantes aux UV et aux usages intensifs. Coloris confirmés sur échantillon avant commande.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SPEC STRIP */}
        <section className="py-12 md:py-16">
          <div className="mx-auto grid max-w-[1500px] gap-px px-6 sm:grid-cols-2 md:grid-cols-4 md:px-10">
            {[
              { v: `${content.models.length}`, l: 'modèles déportés' },
              { v: `${FABRICS.length}`, l: 'coloris de toile' },
              { v: '2 – 6m', l: 'dimensions sur mesure' },
              { v: 'TN', l: 'installation nationale' },
            ].map((s) => (
              <div key={s.l} className="border border-[#14130F]/12 p-7">
                <p style={{ fontFamily: DISPLAY }} className="text-5xl leading-none">{s.v}</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QUALITÉ — closing CTA */}
        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <ShieldCheck className="mb-6 h-7 w-7" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 0.96, fontWeight: 400 }}>
                {content.premium.headline}
                <br />
                <em style={{ color: 'rgba(20,19,15,0.48)' }}>{content.premium.italic}</em>
              </h2>
              <p className="mt-6 max-w-[480px] text-sm leading-7 text-[#14130F]/60">{content.cta.body}</p>
            </div>
            <div className="grid gap-4">
              {content.premium.features.map((item) => (
                <div key={item} className="flex gap-4 border-b border-[#C4A23E]/20 pb-4 text-sm font-semibold leading-7 text-[#14130F]/66">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {item}
                </div>
              ))}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href={content.hero.ctaHref} className="inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                  {content.hero.ctaLabel} <ArrowRight size={14} />
                </Link>
                <Link href="/devis" className="inline-flex w-fit items-center gap-3 border border-[#14130F]/16 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#14130F]">
                  Demander un devis <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
