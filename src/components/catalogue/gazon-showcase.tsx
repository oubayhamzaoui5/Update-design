'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Ruler, Sprout } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { ImageSlot } from '@/components/catalogue/image-slot'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'
const GRASS = '#3E7A38'
const GRASS_DEEP = '#244B22'

type Product = { code: string; name: string; note?: string; image?: string; variants?: string[] }
type Accessory = { name: string; text: string; image: string; tag?: string; variants?: string[] }

function heightOf(p: Product) {
  return Number(p.name.match(/(\d+)\s*mm/i)?.[1] ?? p.code.match(/\d+/)?.[0] ?? 0)
}

const usageByHeight: Record<number, string> = {
  10: 'Zones décoratives, stands, vitrines et événements.',
  25: 'Le bon équilibre budget / confort pour terrasses et passages.',
  35: 'Jardins, bords de piscine et espaces visibles très fréquentés.',
  45: 'Densité maximale, rendu naturel premium pour projets soignés.',
}

// Real catalogue photos, in catalogue order. Index maps to rendered slot.
const LEAD_IMAGE = '/categories/gazon/gazon-lead.png'
const HEIGHT_IMAGES = [
  '/categories/gazon/gazon-h1.png',
  '/categories/gazon/gazon-h2.png',
  '/categories/gazon/gazon-h3.png',
  '/categories/gazon/gazon-h4.png',
  '/categories/gazon/gazon-h5.png',
]
const ACCESSORY_IMAGES = [
  '/categories/gazon/gazon-acc1.png',
  '/categories/gazon/gazon-acc2.png',
  '/categories/gazon/gazon-acc3.png',
  '/categories/gazon/gazon-acc4.png',
]

function grassPrompt(mm: number, premium: boolean, width: string) {
  return `Top-down macro product photograph of artificial grass turf, ${mm}mm blade height, ${premium ? 'ultra-dense premium pile, realistic two-tone green with subtle brown thatch layer' : 'standard density, fresh natural green'}, rolled goods in ${width}, even soft studio light, seamless tileable texture, hyper-realistic, sharp blades, neutral background, 8k`
}

export default function GazonShowcase({
  products,
  accessories,
  referenceCount,
}: {
  products: Product[]
  accessories: Accessory[]
  referenceCount: number
}) {
  const heights = useMemo(() => {
    const sorted = [...products].sort((a, b) => heightOf(a) - heightOf(b))
    return sorted.map((p) => ({ ...p, mm: heightOf(p), premium: /premium/i.test(p.name) }))
  }, [products])

  const [width, setWidth] = useState<'2m' | '4m'>('4m')

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
              <span style={{ color: GOLD }}>Gazon artificiel</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 400 }} className="text-4xl leading-none md:text-5xl">
                  Gazon artificiel
                </h1>
                <p className="mt-2 max-w-[640px] text-sm leading-6 text-[#14130F]/60">
                  Rouleaux pour terrasses, jardins, bords de piscine et espaces pros — sans arrosage ni tonte. Choisissez la hauteur du brin et la largeur.
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{referenceCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">références</p>
                </div>
                <Link href="/devis" className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: GRASS }}>
                  Devis <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LEAD CATALOGUE IMAGE — full width, product-first */}
        <section>
          <div className="mx-auto max-w-[1500px] px-6 pt-8 md:px-10">
            <ImageSlot
              ar="21:9"
              accent={GRASS}
              Icon={Sprout}
              label="Visuel principal"
              src={LEAD_IMAGE}
              alt="Terrasse et jardin habillés de gazon artificiel vert dense, bord de piscine ensoleillé, rendu naturel"
              prompt="Wide lifestyle photograph of a modern terrace and garden covered with lush artificial grass, poolside, warm sunlight, realistic dense green turf, Mediterranean villa, photorealistic, editorial, 8k, horizontal banner"
            />
          </div>
        </section>

        {/* WIDTH TOGGLE */}
        <section id="hauteurs" className="pt-10 md:pt-14">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Catalogue par hauteur</p>
                <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">La hauteur fait le rendu.</h2>
              </div>
              <div className="inline-flex border border-[#14130F]/14 p-1">
                {(['2m', '4m'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWidth(w)}
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition"
                    style={{ background: width === w ? DARK : 'transparent', color: width === w ? CREAM : 'rgba(20,19,15,0.55)' }}
                  >
                    Largeur {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HEIGHT CATALOGUE — one full-width row per height, grass shown at its mm */}
        <section className="pb-6">
          <div className="mx-auto grid max-w-[1500px] gap-5 px-6 md:px-10">
            {heights.map((h, i) => {
              const hasWidth = (h.variants ?? []).some((v) => v.includes(width))
              return (
                <article
                  key={h.code}
                  className="grid gap-0 overflow-hidden border border-[#14130F]/12 bg-white md:grid-cols-[1.35fr_1fr]"
                >
                  {/* full-width grass image at this height */}
                  <div className="relative">
                    <ImageSlot
                      ar="16:9"
                      accent={GRASS}
                      Icon={Sprout}
                      label={`Gazon ${h.mm}mm`}
                      src={HEIGHT_IMAGES[i]}
                      alt={`Rouleau de gazon artificiel ${h.mm}mm${h.premium ? ' premium' : ''}, largeur ${width}, brins ${h.premium ? 'denses vert foncé bicolore' : 'vert naturel'}, vue rapprochée plein cadre`}
                      prompt={grassPrompt(h.mm, h.premium, `largeur ${width}`)}
                    />
                  </div>

                  {/* specs */}
                  <div className="flex flex-col justify-between p-7" style={{ background: PAPER }}>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-end gap-1">
                          <span style={{ fontFamily: DISPLAY }} className="text-6xl leading-none">{h.mm}</span>
                          <span className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#14130F]/45">mm</span>
                        </div>
                        {h.premium && (
                          <span className="border border-[#C4A23E]/45 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
                            Premium dense
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-base font-black uppercase tracking-[0.08em]">{h.premium ? 'Gazon premium' : 'Gazon standard'}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#14130F]/60">{usageByHeight[h.mm] ?? h.note}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {(h.variants ?? []).map((v) => (
                          <span key={v} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white" style={{ background: GRASS }}>{v}</span>
                        ))}
                        <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: hasWidth ? GRASS : 'rgba(20,19,15,0.3)' }}>
                          {hasWidth ? `✓ Dispo ${width}` : `— ${width} sur demande`}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/devis"
                      className="mt-6 inline-flex w-fit items-center gap-3 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white"
                      style={{ background: GRASS_DEEP }}
                    >
                      Demander un devis <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* SPEC STRIP */}
        <section className="py-12" style={{ background: DARK, color: CREAM }}>
          <div className="mx-auto grid max-w-[1500px] gap-px px-6 md:grid-cols-3 md:px-10">
            {[
              { v: String(referenceCount), l: 'références en rouleau' },
              { v: '10 – 45', l: 'hauteurs de brin (mm)' },
              { v: '2m / 4m', l: 'largeurs de rouleau' },
            ].map((s) => (
              <div key={s.l} className="border border-[#C4A23E]/15 p-7">
                <p style={{ fontFamily: DISPLAY }} className="text-5xl leading-none">{s.v}</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* APPLICATION */}
        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <Ruler className="mb-7 h-7 w-7" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.4rem)', lineHeight: 0.95, fontWeight: 400 }}>
                Bien mesurer,
                <br />
                <em style={{ color: 'rgba(20,19,15,0.48)' }}>bien poser.</em>
              </h2>
            </div>
            <div className="grid gap-4">
              {[
                'Mesurer largeur et longueur utiles avant de choisir 2m ou 4m (moins de joints en 4m).',
                'Prévoir une évacuation d’eau et un support stable et compacté.',
                'Choisir une hauteur plus dense (35/45mm premium) pour les zones très visibles.',
                'Prévoir bande de jonction et colle pour des raccords invisibles.',
              ].map((t) => (
                <div key={t} className="flex gap-4 border-b border-[#C4A23E]/20 pb-5 text-sm font-semibold leading-7 text-[#14130F]/66">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GRASS }} />
                  {t}
                </div>
              ))}
              <Link href="/devis" className="mt-5 inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GRASS }}>
                Demander un devis <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ACCESSORIES — placeholders w/ generated prompts */}
        {accessories.length > 0 && (
          <section className="py-10 md:py-14">
            <div className="mx-auto max-w-[1500px] px-6 md:px-10">
              <div className="mb-7 flex items-center gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Accessoires de pose</p>
                <div className="h-px flex-1 bg-[#14130F]/20" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {accessories.map((a, i) => (
                  <article key={a.name} className="border border-[#14130F]/12 bg-[#F7F2E8] p-3">
                    <ImageSlot
                      ar="1:1"
                      accent={GRASS}
                      Icon={Sprout}
                      label={a.tag ?? 'Accessoire'}
                      src={ACCESSORY_IMAGES[i]}
                      alt={`${a.name} — ${a.text}`}
                      prompt={`Clean studio product photograph of ${a.name} for artificial grass installation, ${a.text}, isolated on neutral background, soft light, photorealistic, e-commerce packshot, square, 4k`}
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
      </main>
      <Footer />
    </div>
  )
}
