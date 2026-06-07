'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Ruler, X } from 'lucide-react'
import { slugify } from '@/utils/slug'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const MODEL_BG = '#FCFCFD'
const CARD_FOOTER_BG = '#D5D0C6'

type TextureRow = {
  texture: string
  name: string
  models: string[]
  color: string
}

const modelDescriptions: Record<string, string> = {
  L24: 'Ligne large',
  L18: 'Ligne fine',
  R15: 'Relief arrondi',
  U12: 'Rainure U',
  O15: 'Relief O',
  P40: 'Profil profond',
}

const modelDetails = [
  { model: 'L24', image: '/sotuma/model-details/l24.png', text: 'Largeur 168 mm, relief 24 mm' },
  { model: 'L18', image: '/sotuma/model-details/l18.png', text: 'Largeur 170 mm, relief 18 mm' },
  { model: 'R15', image: '/sotuma/model-details/r15.png', text: 'Largeur 157 mm, relief 15 mm' },
  { model: 'U12', image: '/sotuma/model-details/u12.png', text: 'Profil rainure U, nouveau modele' },
  { model: 'O15', image: '/sotuma/model-details/o15.png', text: 'Profil onde O, nouveau modele' },
  { model: 'P40', image: '/sotuma/model-details/p40.png', text: 'Profil profond, nouveau modele' },
]

function modelImage(texture: string, model: string) {
  return `/sotuma/profiles/${texture}-${model.toLowerCase()}.jpg`
}

export default function ProfileCatalogueClient({
  rows,
  productHrefBySku = {},
}: {
  rows: TextureRow[]
  productHrefBySku?: Record<string, string>
}) {
  const [selected, setSelected] = useState<string[]>([])

  const filteredRows = useMemo(() => {
    if (selected.length === 0) return rows
    const selectedSet = new Set(selected)
    return rows.filter((row) => selectedSet.has(row.texture))
  }, [rows, selected])

  const toggleTexture = (texture: string) => {
    setSelected((current) =>
      current.includes(texture)
        ? current.filter((item) => item !== texture)
        : [...current, texture]
    )
  }

  return (
    <>
      <section className="py-16 md:py-24" style={{ background: '#E9DDC9' }}>
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
<div className="grid gap-4 md:grid-cols-3">
            {modelDetails.map((item) => (
              <article key={item.model} className="overflow-hidden border border-[#14130F]/10 bg-[#FCFCFD] transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                <div className="relative aspect-square bg-[#FCFCFD]">
                  <Image src={item.image} alt={`Detail modele ${item.model}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-5" />
                </div>
                <div className="border-t border-[#14130F]/10 bg-[#D5D0C6] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-black tracking-[0.08em]">{item.model}</h3>
                    <Ruler className="h-4 w-4" style={{ color: GOLD }} />
                  </div>
                  <p className="mt-2 text-sm text-[#14130F]/58">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="references" className="py-8 md:py-10">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <div className="mb-4 border-t border-[#14130F]/10 py-4">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
                  Filtre couleur
                </p>
                <p className="mt-1 text-xs font-semibold text-[#14130F]/45">
                  {selected.length === 0 ? 'Toutes les textures' : `${selected.length} texture${selected.length > 1 ? 's' : ''} selectionnee${selected.length > 1 ? 's' : ''}`}
                </p>
              </div>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="inline-flex cursor-pointer items-center gap-2 border border-[#C4A23E]/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:bg-[#C4A23E]/10"
                  style={{ color: GOLD }}
                >
                  <X size={12} /> Tout afficher
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {rows.map((row) => {
                const active = selected.includes(row.texture)
                return (
                  <button
                    key={row.texture}
                    type="button"
                    onClick={() => toggleTexture(row.texture)}
                    className="group inline-flex cursor-pointer items-center gap-2 border px-2.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition hover:-translate-y-0.5 hover:shadow-sm"
                    style={{
                      borderColor: active ? GOLD : 'rgba(20,19,15,0.14)',
                      background: active ? 'rgba(196,162,62,0.14)' : '#F7F2E8',
                      color: DARK,
                    }}
                    aria-pressed={active}
                  >
                    <span className="h-7 w-7 border border-black/10 transition group-hover:scale-105" style={{ background: row.color }} />
                    <span className="hidden sm:inline">{row.name}</span>
                    <span className="text-[#14130F]/45">{row.texture}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-5">
            {filteredRows.map((row) => (
              <article key={row.texture} className="overflow-hidden">
                <div className="border-b border-[#C4A23E]/20 bg-[#F7F2E8] px-5 py-6 md:px-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span className="mt-2 h-9 w-9 shrink-0 border border-black/10" style={{ background: row.color }} />
                      <div className="min-w-0">
                        <h3 style={{ fontFamily: DISPLAY }} className="text-4xl leading-[0.92] text-[#14130F] md:text-5xl">
                          {row.name}
                        </h3>
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                          Ref. {row.texture}
                        </p>
                      </div>
                    </div>
                    <span className="hidden h-px flex-[1.2] bg-[#14130F]" aria-hidden="true" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#14130F]/55 md:shrink-0 md:text-right">
                      {row.models.length} modele{row.models.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-start gap-3 p-3">
                  {row.models.map((model) => {
                    const sku = `${model}-${row.texture}`.toUpperCase()
                    const href = productHrefBySku[sku] ?? `/produit/pvc-effet-bois-${slugify(sku)}`

                    return (
                    <article
                      key={`${row.texture}-${model}`}
                      className="group w-full cursor-pointer overflow-hidden border border-[#14130F]/12 transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/50 hover:shadow-[0_18px_45px_rgba(20,19,15,0.14)] sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)] xl:w-[calc(16.666%-0.625rem)]"
                    >
                    <Link href={href} className="block">
                      <div className="relative aspect-square overflow-hidden" style={{ background: MODEL_BG }}>
                        <Image
                          src={modelImage(row.texture, model)}
                          alt={`Texture ${row.texture}, modele ${model}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          className="object-contain p-5 transition duration-500 group-hover:scale-[1.05]"
                        />
                      </div>
                      <div
                        className="border-t border-[#14130F]/10 p-4"
                        style={{
                          backgroundColor: CARD_FOOTER_BG,
                          backgroundImage:
                            'radial-gradient(rgba(20,19,15,0.08) 0.7px, transparent 0.7px), linear-gradient(135deg, rgba(255,255,255,0.32), rgba(20,19,15,0.035))',
                          backgroundSize: '7px 7px, 100% 100%',
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold">{model}</p>
                          {['U12', 'O15', 'P40'].includes(model) && (
                            <span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>Nouveau</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#14130F]/50">{modelDescriptions[model]}</p>
                      </div>
                    </Link>
                    </article>
                  )})}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
