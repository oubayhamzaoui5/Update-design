'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight, Truck, ShieldCheck, Phone, Star } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

// ── Brand tokens (shared with /tinda) ────────────────────────────────────────
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'

// ── Data ──────────────────────────────────────────────────────────────────────
const STEPS = ['Modèle', 'Structure & Tissu', 'Récapitulatif']

const FABRICS = [
  { id: 'SA8157_Alabastro',   name: 'Alabastro'    },
  { id: 'SA2826_Champagne',   name: 'Champagne'    },
  { id: 'SA2296_Avena',       name: 'Avena'        },
  { id: 'SA2143_Marfil',      name: 'Marfil'       },
  { id: 'SA2838_Integral',    name: 'Integral'     },
  { id: 'SA1069_Optik',       name: 'Optik'        },
  { id: 'SA2146_Marron',      name: 'Marron'       },
  { id: 'SA2316_Cafe',        name: 'Cafe'         },
  { id: 'SA2829_Limon',       name: 'Limon'        },
  { id: 'SA2013_Amarillo',    name: 'Amarillo'     },
  { id: 'SA2050_Naranja',     name: 'Naranja'      },
  { id: 'SA1066_rouge',       name: 'Rouge'        },
  { id: 'SA2210_Rioja',       name: 'Rioja'        },
  { id: 'SA2101_Granate',     name: 'Granate'      },
  { id: 'SA2835_Pink',        name: 'Pink'         },
  { id: 'SA1067_Grape',       name: 'Grape'        },
  { id: 'SA2129_Turkis',      name: 'Turkis'       },
  { id: 'SA2828_Indigo',      name: 'Indigo'       },
  { id: 'SA2235_Azul-Real',   name: 'Azul Real'    },
  { id: 'SA2018_Azul',        name: 'Azul'         },
  { id: 'SA2145_Marino',      name: 'Marino'       },
  { id: 'SA1489_Tropic',      name: 'Tropic'       },
  { id: 'SA2246_Verde-Claro', name: 'Verde Claro'  },
  { id: 'SA2024_Anis',        name: 'Anis'         },
  { id: 'SA2242_Verde',       name: 'Verde'        },
  { id: 'SA2245_Botella',     name: 'Botella'      },
  { id: 'SA8488_Antracita',   name: 'Antracita'    },
  { id: 'SA2821_Silver',      name: 'Silver'       },
  { id: 'SA2979_Perla',       name: 'Perla'        },
  { id: 'SA2327_Basalto',     name: 'Basalto'      },
  { id: 'SA1070_Marmol',      name: 'Marmol'       },
  { id: 'SA2831_Mineral',     name: 'Mineral'      },
  { id: 'SA3582_Tweed-Negro', name: 'Tweed Negro'  },
  { id: 'SA2170_Negro',       name: 'Negro'        },
]

const MODELES_DEPORTE = [
  { id: 'Dallas', img: '/dallas.webp',  desc: 'Parasol déporté compact, idéal pour les espaces réduits.' },
  { id: 'Havana', img: '/havana.webp',  desc: 'Design asymétrique élégant, bras orientable à 360°.' },
  { id: 'Ibiza',  img: '/ibiza.webp',   desc: 'Parasol déporté premium, finition haut de gamme.' },
  { id: 'Mauris', img: '/mauris.webp',  desc: 'Structure multi-têtes pour couvrir de grandes surfaces.' },
] as const

const COULEURS_STRUCT = [
  { id: 'Gris Givré Foncé', label: 'Gris Givré Foncé', img: '/GrisGivréFoncé.jpg' },
  { id: 'Gris Givré',       label: 'Gris Givré',        img: '/Grisgivré.jpg'      },
  { id: 'Marron Givré',     label: 'Marron Givré',      img: '/MarronGivré.jpg'    },
  { id: 'Noir',             label: 'Noir',               hex: '#1A1A1A'             },
] as const

const DIMENSIONS_PISCINE = [
  { id: '2.85x2.85', label: '2.85 × 2.85 m', img: '/parasol/dim-285.webp' },
  { id: '2.50x2.50', label: '2.50 × 2.50 m', img: '/parasol/dim-250.webp' },
  { id: '2.00x2.00', label: '2.00 × 2.00 m', img: '/parasol/dim-200.webp' },
] as const

const SOCLES = [
  { id: 'Sans Socle', label: 'Sans Socle', img: '/parasol/socle-sans.webp',   desc: 'Fixation au sol intégrée.' },
  { id: 'Fixe',       label: 'Fixe',       img: '/parasol/socle-fixe.webp',   desc: 'Dalle béton scellée au sol.' },
  { id: 'Mobile',     label: 'Mobile',     img: '/parasol/socle-mobile.webp', desc: 'Base lestée déplaçable.' },
] as const

// ── Config type ───────────────────────────────────────────────────────────────
type Fabric         = typeof FABRICS[number]
type TypeParasol    = 'Déporté' | 'Piscine'
type ModeleDeporte  = typeof MODELES_DEPORTE[number]['id']
type DimensionPiscine = typeof DIMENSIONS_PISCINE[number]['id']
type Socle          = typeof SOCLES[number]['id']
type CouleurStruct  = typeof COULEURS_STRUCT[number]['id']

type Config = {
  type:           TypeParasol | null
  modele:         ModeleDeporte | null
  dimension:      DimensionPiscine | null
  socle:          Socle | null
  couleurStruct:  CouleurStruct | null
  tissu:          Fabric | null
  logo:           boolean
  logoFile:       File | null
}

const EMPTY: Config = {
  type: null, modele: null, dimension: null, socle: null,
  couleurStruct: null, tissu: null,
  logo: false, logoFile: null,
}

// ── Step validation ───────────────────────────────────────────────────────────
function isStepValid(step: number, c: Config): boolean {
  if (step === 0) {
    if (!c.type) return false
    if (c.type === 'Déporté') return c.modele !== null
    if (c.type === 'Piscine') return c.dimension !== null && c.socle !== null
  }
  if (step === 1) return c.couleurStruct !== null && c.tissu !== null
  return true
}

// ── Parasol preview ───────────────────────────────────────────────────────────
const MODEL_IMG: Record<string, string> = {
  Dallas: '/parasol/ParasolDallas.webp',
  Havana: '/parasol/ParasolHavana.webp',
  Ibiza:  '/parasol/ParasolIbiza.webp',
  Mauris: '/parasol/ParasolMauris.webp',
}

function ParasolPreview({ config }: { config: Config }) {
  const src = config.modele ? (MODEL_IMG[config.modele] ?? MODEL_IMG.Dallas) : MODEL_IMG.Dallas
  return (
    <img key={src} src={src} alt="Aperçu parasol" className="w-full" style={{ objectFit: 'contain' }} />
  )
}

// ── Summary row ───────────────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5" style={{ borderBottom: '1px solid rgba(196,162,62,0.1)' }}>
      <span style={{ fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(28,26,20,0.45)', minWidth: '45%' }}>
        {label}
      </span>
      <span style={{ fontFamily: BODY, fontSize: '0.75rem', fontWeight: 500, color: DARK, textAlign: 'right', flex: 1 }}>
        {value}
      </span>
    </div>
  )
}

// ── Field label ───────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.45)', marginBottom: 12 }}>
      {children}
    </p>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ParasolPage() {
  const [step, setStep]           = useState(0)
  const [config, setConfig]       = useState<Config>(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof Config>(key: K, val: Config[K]) =>
    setConfig((prev) => ({ ...prev, [key]: val }))

  const goToStep = (fn: (s: number) => number) => { setStep(fn) }

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [step])

  const canNext = isStepValid(step, config)

  const summary = useMemo(() => {
    const rows: { label: string; value: string }[] = []
    if (config.type)           rows.push({ label: 'Type',              value: config.type })
    if (config.modele)         rows.push({ label: 'Modèle',            value: config.modele })
    if (config.dimension)      rows.push({ label: 'Dimension',         value: DIMENSIONS_PISCINE.find(d => d.id === config.dimension)?.label ?? '' })
    if (config.socle)          rows.push({ label: 'Socle',             value: config.socle })
    if (config.couleurStruct)  rows.push({ label: 'Couleur structure', value: config.couleurStruct })
    if (config.tissu)          rows.push({ label: 'Tissu',             value: `${config.tissu.name} (${config.tissu.id})` })
    if (config.logo)           rows.push({ label: 'Impression logo',   value: config.logoFile?.name || 'Oui' })
    return rows
  }, [config])

  if (submitted) {
    return (
      <div style={{ background: CREAM, minHeight: '100vh' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center px-6 py-40 text-center">
          <div className="flex items-center justify-center mb-8" style={{ width: 72, height: 72, background: GOLD, borderRadius: '50%' }}>
            <Check size={32} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: DARK, marginBottom: 16 }}>
            Demande envoyée
          </h1>
          <p style={{ fontFamily: BODY, fontSize: '0.9rem', color: 'rgba(28,26,20,0.55)', maxWidth: 420, lineHeight: 1.8, marginBottom: 32 }}>
            Notre équipe va préparer votre devis personnalisé et vous contacter dans les plus brefs délais.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 transition-opacity hover:opacity-80"
            style={{ background: GOLD, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff' }}
          >
            Retour à l'accueil
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ background: CREAM, minHeight: '100vh' }}>
      <Navbar />

      <div className="flex flex-col lg:flex-row">

        {/* ── LEFT: Sticky visual panel ─────────────────────────────────────── */}
        <div
          className="h-[200px] pt-16 overflow-hidden lg:w-[52%] lg:sticky lg:top-0 lg:h-screen lg:pt-20 flex items-center justify-center px-6 lg:px-14"
          style={{ background: '#fff' }}
        >
          <div className="w-full max-w-[280px] lg:max-w-none">
            <ParasolPreview config={config} />
          </div>
        </div>

        {/* ── RIGHT: Configurator panel ─────────────────────────────────────── */}
        <div
          className="flex flex-col lg:w-[48%] px-5 pt-6 pb-20 lg:px-12 xl:px-16 lg:pt-28"
          style={{ background: CREAM }}
        >

          {/* Step progress bar — identical to /tinda */}
          <div className="mb-10">
            <div className="flex items-center gap-0 mb-4">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => { if (i < step || isStepValid(i - 1, config)) goToStep(() => i) }}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div
                      className="flex items-center justify-center transition-all"
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i < step ? GOLD : i === step ? DARK : 'transparent',
                        border: `2px solid ${i <= step ? (i < step ? GOLD : DARK) : 'rgba(28,26,20,0.2)'}`,
                        color: i <= step ? '#fff' : 'rgba(28,26,20,0.35)',
                      }}
                    >
                      {i < step
                        ? <Check size={12} strokeWidth={3} />
                        : <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                      }
                    </div>
                    <span
                      style={{
                        fontFamily: BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: i === step ? DARK : i < step ? GOLD : 'rgba(28,26,20,0.3)',
                        display: 'none',
                      }}
                      className="sm:block"
                    >
                      {s}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-1" style={{ height: 1, background: i < step ? GOLD : 'rgba(28,26,20,0.12)' }} />
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD }}>
              Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
            </p>
          </div>

          {/* ── Step 0: Modèle ────────────────────────────────────────────────── */}
          {step === 0 && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                  Choisissez votre parasol
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                  Sélectionnez le type et le modèle qui correspond à votre projet.
                </p>
              </div>

              {/* Type selector */}
              <div>
                <FieldLabel>Type de parasol</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    {
                      id: 'Déporté' as const,
                      img: '/dallas.webp',
                      desc: 'Mât excentré, aucune colonne centrale. Disponible en 1, 2 ou 4 têtes pour couvrir de petites à très grandes surfaces.',
                    },
                    {
                      id: 'Piscine' as const,
                      img: '/parasol/type-piscine.webp',
                      desc: 'Mât central droit, conçu pour les bords de piscine. Compact, stable et facile à installer.',
                    },
                  ]).map((t) => {
                    const active = config.type === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setConfig({ ...EMPTY, type: t.id })}
                        className="flex flex-col items-start text-left transition-all cursor-pointer overflow-hidden"
                        style={{
                          border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                          background: active ? `${GOLD}08` : '#fff',
                        }}
                      >
                        <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 180 }}>
                          <img src={t.img} alt={t.id} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 14 }} />
                        </div>
                        <div className="p-3 w-full">
                          <div className="flex items-center justify-between w-full mb-1">
                            <span style={{ fontFamily: DISPLAY, fontSize: '1.2rem', fontWeight: 400, color: active ? DARK : 'rgba(28,26,20,0.6)' }}>{t.id}</span>
                            {active && <span className="flex items-center justify-center" style={{ width: 18, height: 18, background: GOLD, borderRadius: '50%' }}><Check size={10} color="#fff" strokeWidth={3} /></span>}
                          </div>
                          <p style={{ fontFamily: BODY, fontSize: '0.72rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>{t.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Déporté: model cards */}
              {config.type === 'Déporté' && (
                <div>
                  <FieldLabel>Modèle</FieldLabel>
                  <div className="grid grid-cols-2 gap-4" style={{ paddingTop: 14 }}>
                    {MODELES_DEPORTE.map((m) => {
                      const active = config.modele === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => set('modele', m.id)}
                          onMouseEnter={() => { const img = new Image(); img.src = m.img }}
                          className="flex flex-col items-start text-left transition-all cursor-pointer"
                          style={{
                            border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                            background: active ? `${GOLD}08` : '#fff',
                            position: 'relative', overflow: 'visible',
                          }}
                        >
                          <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 180 }}>
                            <img src={m.img} alt={m.id} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 14 }} />
                          </div>
                          <div className="p-3 w-full">
                            <div className="flex items-center justify-between w-full mb-1">
                              <span style={{ fontFamily: DISPLAY, fontSize: '1.2rem', fontWeight: 400, color: active ? DARK : 'rgba(28,26,20,0.6)' }}>{m.id}</span>
                              {active && <span className="flex items-center justify-center" style={{ width: 18, height: 18, background: GOLD, borderRadius: '50%' }}><Check size={10} color="#fff" strokeWidth={3} /></span>}
                            </div>
                            <p style={{ fontFamily: BODY, fontSize: '0.72rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>{m.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Piscine: dimensions + quantité + socle */}
              {config.type === 'Piscine' && (
                <>
                  <div>
                    <FieldLabel>Dimensions</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {DIMENSIONS_PISCINE.map((d) => {
                        const active = config.dimension === d.id
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => set('dimension', d.id)}
                            className="flex flex-col items-start text-left transition-all cursor-pointer overflow-hidden"
                            style={{
                              border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                              background: active ? `${GOLD}08` : '#fff',
                            }}
                          >
                            <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 90 }}>
                              <img src={d.img} alt={d.label} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 10 }} />
                            </div>
                            <div className="p-2.5 w-full">
                              <div className="flex items-center justify-between w-full">
                                <span style={{ fontFamily: BODY, fontSize: '0.75rem', fontWeight: 700, color: active ? DARK : 'rgba(28,26,20,0.6)' }}>{d.label}</span>
                                {active && <Check size={12} color={GOLD} strokeWidth={3} />}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Socle</FieldLabel>
                    <div className="grid grid-cols-3 gap-4">
                      {SOCLES.map((s) => {
                        const active = config.socle === s.id
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => set('socle', s.id)}
                            className="flex flex-col items-start text-left transition-all cursor-pointer overflow-hidden"
                            style={{
                              border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                              background: active ? `${GOLD}08` : '#fff',
                            }}
                          >
                            <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 110 }}>
                              <img src={s.img} alt={s.id} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                            </div>
                            <div className="p-3 w-full">
                              <div className="flex items-center justify-between w-full mb-1">
                                <span style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 400, color: active ? DARK : 'rgba(28,26,20,0.6)' }}>{s.label}</span>
                                {active && <span className="flex items-center justify-center" style={{ width: 16, height: 16, background: GOLD, borderRadius: '50%' }}><Check size={9} color="#fff" strokeWidth={3} /></span>}
                              </div>
                              <p style={{ fontFamily: BODY, fontSize: '0.72rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>{s.desc}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step 1: Structure ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                  Structure & tissu
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                  Choisissez la couleur de la structure et du tissu de votre parasol.
                </p>
              </div>

              <div>
              <FieldLabel>Couleur de la structure</FieldLabel>
              <div className="grid grid-cols-6 gap-2.5">
                {COULEURS_STRUCT.map((c) => {
                  const active = config.couleurStruct === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => set('couleurStruct', c.id)}
                      title={c.label}
                      className="flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <div
                        style={{
                          width: '100%', aspectRatio: '1/1',
                          background: 'hex' in c ? c.hex : undefined,
                          border: `2px solid ${active ? GOLD : 'transparent'}`,
                          boxShadow: active ? `0 0 0 1px ${CREAM}, 0 0 0 3px ${GOLD}` : '0 0 0 1px rgba(0,0,0,0.1)',
                          transition: 'all 0.15s',
                          overflow: 'hidden',
                        }}
                      >
                        {'img' in c && (
                          <img src={c.img} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        )}
                      </div>
                      <span style={{
                        fontFamily: BODY, fontSize: 11, color: active ? GOLD : DARK,
                        fontWeight: active ? 700 : 500, textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.03em',
                      }}>
                        {c.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              </div>

              {/* ── Tissu ──────────────────────────────────────────────────────── */}

              {/* Fabric swatches */}
              <div>
                <FieldLabel>Couleur du tissu</FieldLabel>
                <div className="grid grid-cols-6 gap-2.5 mb-3">
                  {FABRICS.map((f) => {
                    const active = config.tissu?.id === f.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        title={f.name}
                        onClick={() => set('tissu', f)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      >
                        <div
                          style={{
                            width: '100%', aspectRatio: '1/1',
                            background: 'rgba(240,238,235,0.1)',
                            border: `2px solid ${active ? GOLD : 'transparent'}`,
                            boxShadow: active ? `0 0 0 1px ${CREAM}, 0 0 0 3px ${GOLD}` : '0 0 0 1px rgba(0,0,0,0.1)',
                            transition: 'all 0.15s',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={`/fabrics/${f.id}.png`}
                            alt={f.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                        <span style={{ fontFamily: BODY, fontSize: 11, color: active ? GOLD : DARK, fontWeight: active ? 700 : 500, textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.03em' }}>
                          {f.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {config.tissu && (
                  <p style={{ fontFamily: BODY, fontSize: '0.8rem', color: DARK, fontWeight: 600 }}>
                    Sélectionné : <span style={{ color: GOLD }}>{config.tissu.name}</span>
                  </p>
                )}
              </div>


              {/* Logo */}
              <div>
                <FieldLabel>Impression logo</FieldLabel>
                <button
                  type="button"
                  onClick={() => set('logo', !config.logo)}
                  className="flex items-center gap-3 w-full py-3 px-4 transition-all"
                  style={{
                    border: `1px solid ${config.logo ? GOLD : 'rgba(28,26,20,0.15)'}`,
                    background: config.logo ? `${GOLD}10` : 'transparent',
                  }}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 18, height: 18,
                      border: `1.5px solid ${config.logo ? GOLD : 'rgba(28,26,20,0.3)'}`,
                      background: config.logo ? GOLD : 'transparent',
                      borderRadius: 2,
                    }}
                  >
                    {config.logo && <Check size={11} color="#fff" strokeWidth={3} />}
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: DARK }}>
                    Ajouter un logo sur le tissu
                  </span>
                </button>
                {config.logo && (
                  <div className="mt-3">
                    <label
                      className="flex items-center gap-3 w-full px-4 py-3 cursor-pointer"
                      style={{ border: '1px dashed rgba(196,162,62,0.5)', background: `${GOLD}05` }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: config.logoFile ? DARK : 'rgba(28,26,20,0.4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {config.logoFile ? config.logoFile.name : 'Joindre votre fichier logo (PNG, SVG, PDF…)'}
                      </span>
                      {config.logoFile && (
                        <button type="button" onClick={(e) => { e.preventDefault(); set('logoFile', null) }} style={{ color: 'rgba(28,26,20,0.35)', fontFamily: BODY, fontSize: '1rem', lineHeight: 1 }}>×</button>
                      )}
                      <input type="file" accept="image/*,.pdf,.svg,.ai,.eps" className="sr-only" onChange={(e) => set('logoFile', e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Récapitulatif ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                  Récapitulatif
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                  Vérifiez votre configuration avant d'envoyer la demande de devis.
                </p>
              </div>

              <div style={{ border: '1px solid rgba(196,162,62,0.2)', background: '#fff', padding: '8px 16px' }}>
                <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(196,162,62,0.15)', marginBottom: 4 }}>
                  <div style={{ width: 3, height: 22, background: GOLD }} />
                  <p style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)' }}>
                    Ordre de fabrication — Parasol {config.type ?? ''}
                  </p>
                </div>
                {summary.map((row) => (
                  <SummaryRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>

              <div className="flex items-start gap-4 p-5" style={{ background: `${GOLD}0C`, border: `1px solid ${GOLD}30` }}>
                <Phone size={18} color={GOLD} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700, color: DARK, marginBottom: 4 }}>Devis gratuit sous 24h</p>
                  <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.65 }}>
                    Notre équipe vous contactera pour confirmer les détails techniques et vous transmettre le devis personnalisé.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3" style={{ borderTop: '1px solid rgba(196,162,62,0.2)', paddingTop: 20 }}>
                {[
                  { icon: Truck,       label: 'Livraison Tunisie' },
                  { icon: ShieldCheck, label: 'Garantie qualité'  },
                  { icon: Phone,       label: 'Support dédié'     },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <Icon size={18} strokeWidth={1.25} color={`${GOLD}90`} />
                    <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mt-12">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goToStep((s) => s - 1)}
                className="flex items-center gap-2 px-6 py-3.5 cursor-pointer transition-opacity hover:opacity-70"
                style={{ border: '1px solid rgba(196,162,62,0.3)', fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: DARK }}
              >
                <ArrowLeft size={12} /> Précédent
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => { if (canNext) goToStep((s) => s + 1) }}
                disabled={!canNext}
                className="flex-1 flex items-center justify-center gap-2 py-4 cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: GOLD, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}
              >
                Étape suivante <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 cursor-pointer transition-opacity hover:opacity-85"
                style={{ background: DARK, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}
              >
                <Check size={14} /> Envoyer la demande de devis
              </button>
            )}
          </div>

          {!canNext && step < 2 && (
            <p style={{ fontFamily: BODY, fontSize: 10, color: 'rgba(28,26,20,0.4)', marginTop: 10, letterSpacing: '0.06em' }}>
              * Veuillez compléter tous les champs requis pour continuer.
            </p>
          )}

        </div>
      </div>

      <Footer />
    </div>
  )
}
