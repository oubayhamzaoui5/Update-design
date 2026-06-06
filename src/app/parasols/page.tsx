import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, MessageCircle, ShieldCheck, Sun } from 'lucide-react'

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
  const stats = [
    { label: `${content.models.length}`, value: 'modeles exclusifs' },
    { label: '35+', value: 'coloris de toile' },
    { label: '2-6m', value: 'dimensions sur mesure' },
    { label: 'TN', value: 'installation nationale' },
  ]

  return (
    <div style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <Navbar reserveSpace />

      <main>
        <header className="relative overflow-hidden" style={{ background: DARK, color: CREAM }}>
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(90deg,#C4A23E 1px,transparent 1px),linear-gradient(#C4A23E 1px,transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          <div className="relative mx-auto grid min-h-[76vh] max-w-[1500px] gap-12 px-6 py-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:py-28">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.34em]" style={{ color: GOLD }}>
                Parasols professionnels
              </p>
              <h1
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(3.2rem, 8vw, 7.2rem)',
                  lineHeight: 0.86,
                  fontWeight: 400,
                }}
              >
                {content.hero.headline}
                <br />
                <em style={{ color: 'rgba(247,242,232,0.52)', fontStyle: 'italic' }}>{content.hero.italic}</em>
              </h1>
              <p className="mt-8 max-w-[620px] text-base leading-8 text-white/64">
                {content.hero.body}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href={content.hero.ctaHref} className="inline-flex items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                  {content.hero.ctaLabel} <ArrowRight size={14} />
                </Link>
                <Link href="#modeles" className="inline-flex items-center justify-center gap-3 border border-white/20 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/10">
                  Voir les modeles
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((item) => (
                <div key={item.value} className="border border-[#C4A23E]/18 p-6">
                  <p style={{ fontFamily: DISPLAY }} className="text-5xl leading-none">
                    {item.label}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section id="modeles" className="py-8 md:py-10">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-7 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Modeles</p>
              <div className="h-px flex-1 bg-[#14130F]/30" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">
                {content.models.length} references
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {content.models.map((model, index) => (
                <article key={`${model.name}-${index}`} className="group overflow-hidden bg-[#F7F2E8] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#D5C6AD]">
                    {model.img ? (
                      <Image
                        src={model.img}
                        alt={`Parasol ${model.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority={index < 2}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#14130F]/90 px-6 text-center">
                        <Sun className="h-8 w-8" style={{ color: GOLD }} />
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/52">Image a venir</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,19,15,0.62),transparent_58%)]" />
                    <p className="absolute left-4 top-4 bg-black/30 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {model.tagline}
                    </p>
                  </div>
                  <div className="border-x border-b border-[#C4A23E]/20 p-5">
                    <h3 style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{model.name}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#14130F]/60">{model.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" style={{ background: DARK, color: CREAM }}>
          <div className="mx-auto grid max-w-[1500px] gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-10">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                Qualite & durabilite
              </p>
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(2.4rem, 5vw, 4.6rem)',
                  lineHeight: 0.95,
                  fontWeight: 400,
                }}
              >
                {content.premium.headline}
                <br />
                <em style={{ color: 'rgba(247,242,232,0.5)' }}>{content.premium.italic}</em>
              </h2>
            </div>
            <div className="grid gap-4">
              {content.premium.features.map((item) => (
                <div key={item} className="flex gap-4 border-b border-[#C4A23E]/15 pb-5 text-sm leading-7 text-white/65">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {item}
                </div>
              ))}
              <Link href={content.hero.ctaHref} className="mt-5 inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                {content.hero.ctaLabel} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-7 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Caracteristiques</p>
              <div className="h-px flex-1 bg-[#14130F]/30" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.features.map((feature) => (
                <article key={feature.title} className="bg-[#F7F2E8] p-6 transition duration-300 hover:shadow-[0_12px_32px_rgba(20,19,15,0.10)]">
                  <ShieldCheck className="mb-8 h-6 w-6" style={{ color: GOLD }} />
                  <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#14130F]">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#14130F]/58">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative min-h-[58vh] overflow-hidden" style={{ background: DARK, color: CREAM }}>
          <Image
            src="/editorial/terrace-dining.jpg"
            alt="Terrasse de restaurant avec espace ombrage"
            fill
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,19,15,0.9),rgba(20,19,15,0.42))]" />
          <div className="relative mx-auto flex min-h-[58vh] max-w-[1500px] flex-col justify-center px-6 py-20 md:px-10">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Signature exterieure
            </p>
            <blockquote style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.8rem, 6vw, 5.6rem)', lineHeight: 0.94, fontWeight: 400 }}>
              {content.quote.text}
              <br />
              <em style={{ color: GOLD, fontStyle: 'italic' }}>{content.quote.accent}</em>
            </blockquote>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.82fr_1.18fr] md:px-10">
            <div className="relative min-h-[360px] overflow-hidden border border-[#14130F]/12">
              <Image src="/editorial/hotel-pool-parasols.jpg" alt="Projet parasol en espace piscine" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center py-6">
              <MessageCircle className="mb-7 h-8 w-8" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.8rem)', lineHeight: 0.95, fontWeight: 400 }}>
                {content.cta.headline}
                <br />
                <em style={{ color: 'rgba(20,19,15,0.5)' }}>{content.cta.italic}</em>
              </h2>
              <p className="mt-7 max-w-[620px] text-base leading-8 text-[#14130F]/62">
                {content.cta.body}
              </p>
              <Link href={content.cta.ctaHref} className="mt-9 inline-flex w-fit items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                {content.cta.ctaLabel} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
