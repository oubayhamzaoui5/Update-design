'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Layers, Ruler, X } from 'lucide-react'
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
const MODEL_BG = '#FCFCFD'
const CARD_FOOTER_BG = '#D5D0C6'

type Item = { model: string; sku: string }
type Finish = { code: string; name: string; color: string; bicolore?: boolean; items: Item[] }
type Model = { code: string; name: string; format: string; note?: string }
type Accessory = { name: string; text: string; image: string; tag?: string; variants?: string[] }

// ── Real catalogue photos. Slots without a photo fall back to placeholder.
const LEAD_IMAGE = '/categories/pvc/pvc-lead.png'
const MODEL_IMAGES: Record<string, string> = {
  EX01: '/categories/pvc/pvc-ex01.png',
  EX04: '/categories/pvc/pvc-ex04.png',
  EX05: '/categories/pvc/pvc-ex05.png',
}
// Per-SKU overrides go here; until then every cell uses the shared product shot.
const CELL_IMAGES: Record<string, string> = {} // by sku (EX01-TEAK, EX04-RW/BK …)
const CELL_FALLBACK = '/categories/pvc/pvc-cell.png'
const ACCESSORY_IMAGES: string[] = [
  '/categories/pvc/pvc-acc1.png',
  '/categories/pvc/pvc-acc2.png',
  '/categories/pvc/pvc-acc3.png',
]

export default function ExterieurShowcase({
  models,
  finishes,
  accessories,
  referenceCount,
}: {
  models: Model[]
  finishes: Finish[]
  accessories: Accessory[]
  referenceCount: number
}) {
  const [selected, setSelected] = useState<string[]>([])

  const modelMeta = useMemo(() => {
    const m: Record<string, Model> = {}
    for (const x of models) m[x.code] = x
    return m
  }, [models])

  const rows = useMemo(() => {
    if (selected.length === 0) return finishes
    const set = new Set(selected)
    return finishes.filter((f) => set.has(f.code))
  }, [finishes, selected])

  const toggle = (code: string) =>
    setSelected((cur) => (cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]))

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
              <span style={{ color: GOLD }}>PVC effet bois extérieur</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 400 }} className="text-4xl leading-none md:text-5xl">
                  PVC effet bois extérieur
                </h1>
                <p className="mt-2 max-w-[640px] text-sm leading-6 text-[#14130F]/60">
                  Lames et profilés WPC effet bois pour façades et terrasses couvertes — chaleur du bois, tenue extérieure, longueur 2900&nbsp;mm. Choisissez le modèle puis la finition.
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
              label="Visuel principal"
              src={LEAD_IMAGE}
              alt="Façade de villa moderne habillée en lames WPC effet bois teck, lumière chaude, rendu architectural"
              prompt="Wide architectural photograph of a modern Mediterranean villa facade fully clad in WPC wood-effect cladding planks, warm teak tones, vertical lines, late afternoon sunlight, photorealistic, editorial, 8k, horizontal banner"
            />
          </div>
        </section>

        {/* MODELS — 3 profile families, each with devis CTA */}
        <section className="pt-12 md:pt-16">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Modèles</p>
                <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">Trois profils, une même façade.</h2>
              </div>
              <p className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52 sm:block">{models.length} modèles</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {models.map((m, i) => (
                <article key={m.code} className="flex flex-col overflow-hidden border border-[#14130F]/10 bg-white">
                  <ImageSlot
                    ar="4:3"
                    label={`0${i + 1} · ${m.code}`}
                    src={MODEL_IMAGES[m.code]}
                    alt={`${m.name} ${m.format} — profilé WPC effet bois extérieur, vue de la forme du profil`}
                    prompt={`Studio product photograph of a ${m.name.toLowerCase()} WPC exterior cladding profile, ${m.format}, three-quarter angle showing the profile cross-section shape, warm teak wood-effect finish, soft light, neutral background, photorealistic packshot, 4k`}
                  />
                  <div className="flex flex-1 flex-col justify-between border-t border-[#14130F]/10 p-5">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black tracking-[0.06em]">{m.code} · {m.name}</h3>
                        <Ruler className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
                      </div>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: GOLD }}>{m.format}</p>
                      <p className="mt-2 text-sm leading-7 text-[#14130F]/58">{m.note}</p>
                    </div>
                    <Link href="/devis" className="mt-5 inline-flex w-fit items-center gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: DARK }}>
                      Demander un devis <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FINISHES — chip filter + per-finish rows (model × finish) */}
        <section id="finitions" className="py-12 md:py-16">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-4 border-t border-[#14130F]/10 py-4">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>Finitions</p>
                  <p className="mt-1 text-xs font-semibold text-[#14130F]/45">
                    {selected.length === 0 ? 'Toutes les finitions' : `${selected.length} finition${selected.length > 1 ? 's' : ''} sélectionnée${selected.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                {selected.length > 0 && (
                  <button type="button" onClick={() => setSelected([])} className="inline-flex cursor-pointer items-center gap-2 border border-[#C4A23E]/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:bg-[#C4A23E]/10" style={{ color: GOLD }}>
                    <X size={12} /> Tout afficher
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {finishes.map((f) => {
                  const on = selected.includes(f.code)
                  return (
                    <button
                      key={f.code}
                      type="button"
                      onClick={() => toggle(f.code)}
                      className="group inline-flex cursor-pointer items-center gap-2 border px-2.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition hover:-translate-y-0.5 hover:shadow-sm"
                      style={{ borderColor: on ? GOLD : 'rgba(20,19,15,0.14)', background: on ? 'rgba(196,162,62,0.14)' : '#F7F2E8', color: DARK }}
                      aria-pressed={on}
                    >
                      <span
                        className="h-7 w-7 border border-black/10 transition group-hover:scale-105"
                        style={f.bicolore
                          ? { background: `linear-gradient(135deg, ${f.color} 0 60%, #1C1B19 60% 100%)` }
                          : { background: f.color }}
                      />
                      <span className="hidden sm:inline">{f.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-5">
              {rows.map((f) => (
                <article key={f.code} className="overflow-hidden">
                  <div className="border-b border-[#C4A23E]/20 bg-[#F7F2E8] px-5 py-6 md:px-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <span
                          className="mt-2 h-9 w-9 shrink-0 border border-black/10"
                          style={f.bicolore
                            ? { background: `linear-gradient(135deg, ${f.color} 0 60%, #1C1B19 60% 100%)` }
                            : { background: f.color }}
                        />
                        <div className="min-w-0">
                          <h3 style={{ fontFamily: DISPLAY }} className="text-4xl leading-[0.92] text-[#14130F] md:text-5xl">{f.name}</h3>
                          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                            Finition {f.code}{f.bicolore ? ' · bicolore' : ''}
                          </p>
                        </div>
                      </div>
                      <span className="hidden h-px flex-[1.2] bg-[#14130F] md:block" aria-hidden="true" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#14130F]/55 md:shrink-0 md:text-right">
                        {f.items.length} modèle{f.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-start gap-3 p-3">
                    {f.items.map(({ model, sku }) => {
                      const meta = modelMeta[model]
                      const href = `/produit/pvc-effet-bois-exterieur-${slugify(sku)}`
                      return (
                        <article
                          key={sku}
                          className="group w-full cursor-pointer overflow-hidden border border-[#14130F]/12 transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/50 hover:shadow-[0_18px_45px_rgba(20,19,15,0.14)] sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)] xl:w-[calc(25%-0.5625rem)]"
                        >
                          <Link href={href} className="block">
                            <div className="relative" style={{ background: MODEL_BG }}>
                              <ImageSlot
                                ar="1:1"
                                label={sku}
                                src={CELL_IMAGES[sku] ?? CELL_FALLBACK}
                                alt={`${meta?.name ?? model} ${meta?.format ?? ''} en finition ${f.name.toLowerCase()}${f.bicolore ? ' bicolore' : ''}, lame WPC effet bois extérieur`}
                                prompt={`Product photograph of ${(meta?.name ?? model).toLowerCase()} (${meta?.format ?? ''}) WPC exterior cladding plank in ${f.name.toLowerCase()} finish${f.bicolore ? ' with black contrast edge (bicolor)' : ''}, realistic wood-effect surface, three-quarter angle, neutral background, photorealistic packshot, square, 4k`}
                                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                              />
                            </div>
                            <div
                              className="border-t border-[#14130F]/10 p-4"
                              style={{
                                backgroundColor: CARD_FOOTER_BG,
                                backgroundImage: 'radial-gradient(rgba(20,19,15,0.08) 0.7px, transparent 0.7px), linear-gradient(135deg, rgba(255,255,255,0.32), rgba(20,19,15,0.035))',
                                backgroundSize: '7px 7px, 100% 100%',
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-bold">{model}</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#14130F]/45">{meta?.format}</p>
                              </div>
                              <p className="mt-1 text-xs text-[#14130F]/50">{meta?.name}</p>
                            </div>
                          </Link>
                        </article>
                      )
                    })}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ACCESSORIES — before the closing CTA */}
        {accessories.length > 0 && (
          <section className="py-10 md:py-14" style={{ background: PAPER }}>
            <div className="mx-auto max-w-[1500px] px-6 md:px-10">
              <div className="mb-7 flex items-center gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Accessoires de pose</p>
                <div className="h-px flex-1 bg-[#14130F]/30" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">{accessories.length} familles</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {accessories.map((a, i) => (
                  <article key={a.name} className="border border-[#14130F]/12 bg-[#F7F2E8] p-3">
                    <ImageSlot
                      ar="1:1"
                      label={a.tag ?? 'Accessoire'}
                      src={ACCESSORY_IMAGES[i]}
                      alt={`${a.name} — ${a.text}`}
                      prompt={`Clean studio product photograph of ${a.name} for WPC exterior cladding installation, ${a.text}, isolated on neutral background, soft light, photorealistic e-commerce packshot, square, 4k`}
                      sizes="(max-width:640px) 50vw, 25vw"
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

        {/* USAGE — closing CTA section */}
        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <Layers className="mb-6 h-7 w-7" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 0.96, fontWeight: 400 }}>
                Pensé pour la façade
                <br />
                <em style={{ color: 'rgba(20,19,15,0.48)' }}>exigeante.</em>
              </h2>
              <p className="mt-5 max-w-[420px] text-sm leading-7 text-[#14130F]/60">Repères de pose avant de chiffrer votre projet.</p>
            </div>
            <div className="grid gap-4">
              {[
                'Prévoir un support stable, ventilé et aligné avant la pose.',
                'Choisir les cornières WPC (50×50) dans la même finition que les lames.',
                'Calculer les pertes selon coupes, angles et ouvertures.',
                'Mixer EX04 bicolore et EX05 plein ton pour rythmer la façade.',
              ].map((t) => (
                <div key={t} className="flex gap-4 border-b border-[#C4A23E]/20 pb-4 text-sm font-semibold leading-7 text-[#14130F]/66">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
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
