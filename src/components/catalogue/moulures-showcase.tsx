'use client'

import Link from 'next/link'
import { ArrowRight, Check, PenTool } from 'lucide-react'
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

type Accessory = { name: string; text: string; image: string; tag?: string; variants?: string[] }

// ── Real catalogue photos. Empty → placeholder + ChatGPT prompt.
const LEAD_IMAGE = '/categories/moulures/hero-salon-moulures.png'
const PRODUCT_IMAGES: string[] = [
  '/categories/moulures/profil-bombage-20mm.png',
  '/categories/moulures/profil-bombage-40mm.png',
  '/categories/moulures/profil-plinthe-100mm.png',
] // order of `profiles`
const ACCESSORY_IMAGES: string[] = [
  '/categories/moulures/accessoire-colle-montage.png',
  '/categories/moulures/accessoire-mastic-finition.png',
  '/categories/moulures/accessoire-angles.png',
  '/categories/moulures/accessoire-primaire-peinture.png',
]

const profiles: Array<{ type: 'bombage' | 'plinthe'; mm: number; title: string; text: string; variants: string[] }> = [
  { type: 'bombage', mm: 20, title: 'Bombage central 20mm', text: 'Relief fin pour cadres muraux discrets et compositions légères.', variants: ['Central', 'Linéaire'] },
  { type: 'bombage', mm: 40, title: 'Bombage central 40mm', text: 'Relief marqué pour une ligne décorative qui structure le mur.', variants: ['Central', 'Linéaire'] },
  { type: 'plinthe', mm: 100, title: 'Plinthe centrale 100mm', text: 'Base décorative pour une finition basse nette et habillée.', variants: ['Centrale'] },
]

const productPrompt = (type: 'bombage' | 'plinthe', mm: number) =>
  type === 'plinthe'
    ? `Studio product photograph of a decorative skirting board (plinthe) ${mm}mm height, smooth white paintable PVC profile, three-quarter angle showing the cross-section, soft light, neutral background, photorealistic e-commerce packshot, 4k`
    : `Studio product photograph of a decorative wall moulding strip, convex 'bombage' profile with ${mm}mm relief depth, smooth white paintable PVC, three-quarter angle showing the cross-section shape, soft light, neutral background, photorealistic e-commerce packshot, 4k`

export default function MouluresShowcase({
  referenceCount,
  accessories,
}: {
  referenceCount: number
  accessories: Accessory[]
}) {
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
              <span style={{ color: GOLD }}>Moulures décoratives</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 400 }} className="text-4xl leading-none md:text-5xl">
                  Moulures décoratives
                </h1>
                <p className="mt-2 max-w-[640px] text-sm leading-6 text-[#14130F]/60">
                  Moulures et plinthes pour structurer murs, plafonds et encadrements — un relief net et peignable. Choisissez le profil et sa hauteur.
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
              Icon={PenTool}
              label="Visuel principal"
              src={LEAD_IMAGE}
              alt="Mur de salon habillé de cadres en moulures décoratives peintes, ambiance raffinée et lumineuse"
              prompt="Interior lifestyle photograph of an elegant living room wall decorated with painted decorative moulding frames (boiserie panelling), soft neutral tones, refined classic-modern style, photorealistic, editorial, 8k, horizontal banner"
            />
          </div>
        </section>

        {/* PROFILE CATALOGUE — photo + cross-section to scale, each with devis CTA */}
        <section id="profils" className="pt-12 md:pt-16">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Profils</p>
                <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">La coupe fait le décor.</h2>
              </div>
              <p className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52 sm:block">{profiles.length} profils</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {profiles.map((p, i) => (
                <article key={p.title} className="flex flex-col overflow-hidden border border-[#14130F]/12 bg-[#FCFCFD]">
                  <ImageSlot
                    ar="4:3"
                    accent={GOLD}
                    Icon={PenTool}
                    label={`${p.mm}mm`}
                    src={PRODUCT_IMAGES[i]}
                    alt={`${p.title} — profil PVC décoratif peignable, relief ${p.mm}mm, vue rapprochée`}
                    prompt={productPrompt(p.type, p.mm)}
                    imgClassName="object-contain bg-[#F4F1EA]"
                  />
                  <div className="flex flex-1 flex-col justify-between border-t border-[#14130F]/10 p-5">
                    <div>
                      <h3 className="text-lg font-black tracking-[0.06em]">{p.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#14130F]/58">{p.text}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.variants.map((v) => (
                          <span key={v} className="border border-[#14130F]/14 bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#14130F]/58">{v}</span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/produit/moulure-decorative-${slugify(p.title)}`} className="mt-5 inline-flex w-fit items-center gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: DARK }}>
                      Demander un devis <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ACCESSORIES — before the closing CTA */}
        {accessories.length > 0 && (
          <section className="py-12 md:py-16">
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
                      Icon={PenTool}
                      label={a.tag ?? 'Accessoire'}
                      src={ACCESSORY_IMAGES[i]}
                      alt={`${a.name} — photo studio de l'accessoire de pose`}
                      prompt={`Clean studio product photograph of ${a.name} for decorative wall moulding installation, ${a.text}, isolated on neutral background, soft light, photorealistic e-commerce packshot, square, 4k`}
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

        {/* APPLICATION — closing CTA */}
        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <PenTool className="mb-6 h-7 w-7" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 0.96, fontWeight: 400 }}>
                Tracer, coller,
                <br />
                <em style={{ color: 'rgba(20,19,15,0.48)' }}>peindre.</em>
              </h2>
            </div>
            <div className="grid gap-4">
              {[
                'Tracer les axes avant pose pour des alignements réguliers.',
                'Prévoir les coupes d’angle pour cadres muraux et plinthes.',
                'Finir joints et raccords avant la peinture finale.',
              ].map((t) => (
                <div key={t} className="flex gap-4 border-b border-[#C4A23E]/20 pb-4 text-sm font-semibold leading-7 text-[#14130F]/66">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {t}
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
