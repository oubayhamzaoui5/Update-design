'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Zap } from 'lucide-react'
import { slugify } from '@/utils/slug'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { ImageSlot } from '@/components/catalogue/image-slot'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'
const INK = '#0C0B09'

type Accessory = { name: string; text: string; image: string; tag?: string; variants?: string[] }

// ── Real catalogue photos. Empty → placeholder + ChatGPT prompt.
const LEAD_IMAGE = '/categories/lampes/hero-boutique-led.png'
const TUBE_IMAGES: string[] = [
  '/categories/lampes/tube-led-60cm.png',
  '/categories/lampes/tube-led-90cm.png',
  '/categories/lampes/tube-led-120cm.png',
  '/categories/lampes/tube-led-150cm.png',
] // order of `TUBES`
const ACCESSORY_IMAGES: string[] = [
  '/categories/lampes/accessoire-supports-fixation.png',
  '/categories/lampes/accessoire-connecteurs-electriques.png',
  '/categories/lampes/accessoire-goulottes.png',
  '/categories/lampes/accessoire-consommables-chantier.png',
]

// Temperature presets → drive the glow inside the dark showroom section.
const TEMPS: Record<string, { label: string; glow: string; tint: string; note: string }> = {
  '4000K': { label: 'Blanc neutre', glow: '#FFD79E', tint: '#FFEFD6', note: 'Lumière neutre pour accueil, showroom et zones de vente.' },
  '8000K': { label: 'Blanc froid', glow: '#CFE6FF', tint: '#EAF4FF', note: 'Blanc froid franc pour ateliers, réserves et postes de travail.' },
}

// From Liste des produits.xlsx — LAMPE: 5 SKU, longueur × température.
const TUBES: Array<{ size: number; power: number; temps: string[] }> = [
  { size: 60, power: 14, temps: ['8000K'] },
  { size: 90, power: 20, temps: ['8000K'] },
  { size: 120, power: 30, temps: ['4000K', '8000K'] },
  { size: 150, power: 30, temps: ['8000K'] },
]

const MAX_SIZE = Math.max(...TUBES.map((t) => t.size))

const tubePrompt = (size: number, power: number, temp: string) => {
  const light = temp === '4000K' ? 'warm neutral white 4000K glow' : 'cool crisp white 8000K glow'
  return `Studio product photograph of a single LED neon tube light, ${size}cm long, ${power}W, glowing with a ${light}, aluminium T8 body, floating on a dark neutral background with soft reflections, photorealistic e-commerce packshot, high detail, 4k`
}

export default function LampesShowcase({ referenceCount, accessories }: { referenceCount: number; accessories: Accessory[] }) {
  const [temp, setTemp] = useState('8000K')
  const t = TEMPS[temp]

  return (
    <div style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <Navbar reserveSpace />
      <main>
        {/* COMPACT CATEGORY BAND — no tall hero */}
        <section className="border-b" style={{ background: CREAM, borderColor: 'rgba(20,19,15,0.12)' }}>
          <div className="mx-auto max-w-[1500px] px-6 py-7 md:px-10">
            <nav className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">
              <Link href="/boutique" className="hover:text-[#14130F]">Catalogue</Link>
              <span className="px-2">/</span>
              <span style={{ color: GOLD }}>Lampes & tubes néon LED</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 400 }} className="text-4xl leading-none md:text-5xl">
                  Tubes néon LED
                </h1>
                <p className="mt-2 max-w-[640px] text-sm leading-6 text-[#14130F]/60">
                  Éclairage régulier pour boutiques, réserves, ateliers et bureaux. Choisissez la longueur — du 60&nbsp;cm compact au 150&nbsp;cm en ligne continue — et la température de lumière.
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{referenceCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">références</p>
                </div>
                <Link href="/devis" className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: GOLD }}>
                  Devis <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LEAD CATALOGUE IMAGE */}
        <section>
          <div className="mx-auto max-w-[1500px] px-6 pt-8 md:px-10">
            <ImageSlot
              ar="21:9"
              accent={GOLD}
              Icon={Zap}
              label="Visuel principal"
              src={LEAD_IMAGE}
              alt="Ligne continue de tubes néon LED allumés au plafond d'une boutique moderne, lumière régulière et nette"
              prompt="Wide interior photograph of a modern retail store ceiling lit by a continuous line of glowing LED neon tube lights, clean even white light, professional lighting installation, photorealistic, editorial, 8k, horizontal banner"
            />
          </div>
        </section>

        {/* DARK SHOWROOM — signature device: the tubes glow in a dark room */}
        <section id="tubes" className="mt-10 md:mt-14" style={{ background: INK, color: '#EDEAE3' }}>
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 transition-colors duration-700" style={{ background: `radial-gradient(900px 360px at 50% 0%, ${t.glow}1e, transparent 70%)` }} />
            <div className="relative mx-auto max-w-[1500px] px-6 py-12 md:px-10 md:py-16">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Température & longueur</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">Réglez la lumière, comparez la longueur.</h2>
                  <p className="mt-3 max-w-[560px] text-sm leading-7 text-white/50">
                    <span className="font-bold" style={{ color: t.glow }}>{temp}</span> — {t.note}
                  </p>
                </div>
                <div className="inline-flex border border-white/15 p-1">
                  {Object.keys(TEMPS).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setTemp(code)}
                      className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition"
                      style={{ background: temp === code ? TEMPS[code].glow : 'transparent', color: temp === code ? INK : 'rgba(237,234,227,0.6)' }}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {TUBES.map((tube, i) => {
                  const available = tube.temps.includes(temp)
                  const ratio = tube.size / MAX_SIZE
                  return (
                    <article key={tube.size} className="flex flex-col overflow-hidden border border-white/10 bg-white/[0.02]">
                      <ImageSlot
                        ar="4:3"
                        accent={GOLD}
                        Icon={Zap}
                        dark
                        label={`${tube.size}cm`}
                        src={TUBE_IMAGES[i]}
                        alt={`Tube néon LED ${tube.size}cm ${tube.power}W, lumière ${temp}, vue produit sur fond sombre`}
                        prompt={tubePrompt(tube.size, tube.power, tube.temps.includes(temp) ? temp : tube.temps[0])}
                        sizes="(max-width:640px) 100vw, 25vw"
                        imgClassName="object-cover bg-[#080706]"
                      />
                      {/* glowing tube to scale — signature device */}
                      <div className="relative h-16 border-y border-white/10 px-5 py-3" style={{ background: '#080706' }}>
                        <div className="relative flex h-full items-center">
                          <div
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(14, ratio * 100)}%`,
                              background: available ? `linear-gradient(90deg, ${t.tint}, #ffffff)` : 'rgba(255,255,255,0.14)',
                              boxShadow: available ? `0 0 20px 2px ${t.glow}aa` : 'none',
                            }}
                          />
                        </div>
                        <span className="absolute right-3 top-3 border border-white/15 bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/60">{tube.size}cm</span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{tube.size}</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">cm · {tube.power}W</span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {['4000K', '8000K'].map((code) => {
                              const has = tube.temps.includes(code)
                              return (
                                <span
                                  key={code}
                                  className="border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                                  style={has
                                    ? { borderColor: `${TEMPS[code].glow}66`, background: `${TEMPS[code].glow}1a`, color: TEMPS[code].glow }
                                    : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}
                                >
                                  {code}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                        <Link href={`/produit/tube-neon-led-${slugify(`${tube.size}cm-${tube.power}w`)}`} className="mt-5 inline-flex w-fit items-center gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ background: GOLD, color: INK }}>
                          Demander un devis <ArrowRight size={14} />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SPEC STRIP */}
        <section className="py-12 md:py-16">
          <div className="mx-auto grid max-w-[1500px] gap-px px-6 md:grid-cols-3 md:px-10">
            {[
              { v: String(referenceCount), l: 'références LED' },
              { v: '60 – 150', l: 'longueurs (cm)' },
              { v: '4000–8000K', l: 'températures' },
            ].map((s) => (
              <div key={s.l} className="border border-[#14130F]/12 p-7">
                <p style={{ fontFamily: DISPLAY }} className="text-5xl leading-none">{s.v}</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ACCESSORIES — before the closing CTA */}
        {accessories.length > 0 && (
          <section className="pb-12 md:pb-16">
            <div className="mx-auto max-w-[1500px] px-6 md:px-10">
              <div className="mb-7 flex items-center gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Accessoires de pose</p>
                <div className="h-px flex-1 bg-[#14130F]/25" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">{accessories.length} familles</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {accessories.map((a, i) => (
                  <article key={a.name} className="border border-[#14130F]/12 bg-[#FCFCFD] p-3">
                    <ImageSlot
                      ar="1:1"
                      accent={GOLD}
                      Icon={Zap}
                      label={a.tag ?? 'Accessoire'}
                      src={ACCESSORY_IMAGES[i]}
                      alt={`${a.name} — photo studio de l'accessoire de pose`}
                      prompt={`Clean studio product photograph of ${a.name} for LED tube light installation, ${a.text}, isolated on a neutral light background, soft light, photorealistic e-commerce packshot, square, 4k`}
                      sizes="(max-width:640px) 50vw, 25vw"
                      imgClassName="object-contain bg-[#F4F1EA]"
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#14130F]">{a.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#14130F]/58">{a.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* INSTALL — closing CTA */}
        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <Zap className="mb-6 h-7 w-7" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 0.96, fontWeight: 400 }}>
                Une pose
                <br />
                <em style={{ color: 'rgba(20,19,15,0.48)' }}>propre et durable.</em>
              </h2>
            </div>
            <div className="grid gap-4">
              {[
                'Choisir la température selon l’usage : accueil et showroom en 4000K, atelier et stock en 8000K.',
                'Prévoir les longueurs par zone pour limiter les raccords visibles.',
                'Faire valider l’alimentation et la protection électrique avant installation.',
                'Aligner les tubes pour une ligne lumineuse continue et régulière.',
              ].map((line) => (
                <div key={line} className="flex gap-4 border-b border-[#C4A23E]/20 pb-4 text-sm font-semibold leading-7 text-[#14130F]/66">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {line}
                </div>
              ))}
              <Link href="/devis" className="mt-5 inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                Demander un devis <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
