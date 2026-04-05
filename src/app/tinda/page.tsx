'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight, Truck, ShieldCheck, Phone, Star } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

// ── Brand tokens (identical to /product/[slug]) ───────────────────────────────
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'

// ── Data ──────────────────────────────────────────────────────────────────────
const STEPS = ['Modèle & Fixation', 'Dimensions', 'Structure & Tissu', 'Options', 'Récapitulatif']

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

const LAMBREQUINS = [
  { id: 'L0', name: 'Sans',           img: '/lambreaquin-sans.webp'   },
  { id: 'L1', name: 'Droit de 30cm',  img: '/lambrequin-droit.webp'  },
  { id: 'L2', name: 'Vagues de 30cm', img: '/lambreaquin-vagues.webp' },
]

// ── Config type ───────────────────────────────────────────────────────────────
type Fabric = typeof FABRICS[number]
type Config = {
  modele:         'Pragua' | 'Valancia' | 'Je ne sais pas' | null
  fixation:       'Murale sur Façade' | 'Plafond (avec équerres)' | 'Je ne sais pas' | null
  couleurStruct:  'Gris Foncé' | 'Blanc' | null
  largeur:        string
  avancee:        string
  dimensionsInconnues: boolean
  tissu:          Fabric | null
  lambrequin:     string | null
  logo:           boolean
  logoFile:       File | null
  commande:       'Manuelle' | 'Moteur' | null
  commandeCote:   'Gauche' | 'Droite' | null
  led:            boolean
  capteur:        boolean
}

const EMPTY: Config = {
  modele: null, fixation: null, couleurStruct: null, largeur: '', avancee: '', dimensionsInconnues: false,
  tissu: null, lambrequin: null,
  logo: false, logoFile: null,
  commande: null, commandeCote: null,
  led: false,
  capteur: false,
}

// ── Step validation ───────────────────────────────────────────────────────────
function isStepValid(step: number, c: Config): boolean {
  if (step === 0) return c.modele !== null && c.fixation !== null
  if (step === 1) return c.dimensionsInconnues || (c.largeur !== '' && c.avancee !== '')
  if (step === 2) return c.couleurStruct !== null && c.tissu !== null && c.lambrequin !== null
  if (step === 3) return c.commande !== null && c.commandeCote !== null
  return true
}

// ── Image preloader ───────────────────────────────────────────────────────────
const LAM_SLUG: Record<string, string> = { L0: 'sans', L1: 'droit', L2: 'vagues' }

function preloadStoreImage(model: string | null, lamId: string | null) {
  const m = model === 'Valancia' ? 'valancia' : 'pragua'
  const l = lamId ? (LAM_SLUG[lamId] ?? 'droit') : 'droit'
  const img = new Image()
  img.src = `/store/${m}-${l}.webp`
}

// ── Awning Image Preview ─────────────────────────────────────────────────��────

function AwningPreview({ config }: { config: Config }) {
  const model = config.modele === 'Valancia' ? 'valancia' : 'pragua'
  const lam   = config.lambrequin ? (LAM_SLUG[config.lambrequin] ?? 'droit') : 'droit'
  const src   = `/store/${model}-${lam}.webp`

  return (
    <img
      key={src}
      src={src}
      alt={`${model} ${lam}`}
      className="w-full"
      style={{ objectFit: 'contain' }}
    />
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

// ── Option toggle ─────────────────────────────────────────────────────────────
function Toggle({ active, onChange, label }: { active: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className="flex items-center gap-3 w-full py-3 px-4 transition-all"
      style={{
        border: `1px solid ${active ? GOLD : 'rgba(28,26,20,0.15)'}`,
        background: active ? `${GOLD}10` : 'transparent',
      }}
    >
      <span
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 18, height: 18,
          border: `1.5px solid ${active ? GOLD : 'rgba(28,26,20,0.3)'}`,
          background: active ? GOLD : 'transparent',
          borderRadius: 2,
        }}
      >
        {active && <Check size={11} color="#fff" strokeWidth={3} />}
      </span>
      <span style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: DARK }}>
        {label}
      </span>
    </button>
  )
}

// ── Pill selector ─────────────────────────────────────────────────────────────
function Pills<T extends string>({
  options, value, onChange,
}: { options: T[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-5 py-2.5 transition-all cursor-pointer"
            style={{
              fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              border: `1px solid ${active ? GOLD : 'rgba(28,26,20,0.2)'}`,
              background: active ? GOLD : 'transparent',
              color: active ? '#fff' : DARK,
            }}
          >
            {opt}
          </button>
        )
      })}
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
export default function TindaPage() {
  const [step, setStep]     = useState(0)
  const [config, setConfig] = useState<Config>(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof Config>(key: K, val: Config[K]) =>
    setConfig((prev) => ({ ...prev, [key]: val }))

  const goToStep = (fn: (s: number) => number) => { setStep(fn) }

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [step])

  const canNext = isStepValid(step, config)

  const summary = useMemo(() => {
    const rows: { label: string; value: string }[] = []
    if (config.modele)        rows.push({ label: 'Modèle',            value: config.modele })
    if (config.fixation)      rows.push({ label: 'Fixation',          value: config.fixation })
    if (config.couleurStruct) rows.push({ label: 'Couleur structure',  value: config.couleurStruct })
    if (config.dimensionsInconnues) rows.push({ label: 'Dimensions',    value: 'À définir avec notre équipe' })
    else {
      if (config.largeur)     rows.push({ label: 'Largeur',           value: `${config.largeur} cm` })
      if (config.avancee)     rows.push({ label: 'Avancée',           value: `${config.avancee} cm` })
    }
    if (config.tissu)         rows.push({ label: 'Tissu',             value: `${config.tissu.name} (${config.tissu.id})` })
    if (config.lambrequin)    rows.push({ label: 'Lambrequin',        value: LAMBREQUINS.find(l => l.id === config.lambrequin)?.name ?? '' })
    if (config.logo)          rows.push({ label: 'Impression logo',   value: config.logoFile?.name || 'Oui' })
    if (config.commande)      rows.push({ label: 'Commande',          value: `${config.commande}${config.commandeCote ? ` — ${config.commandeCote}` : ''}` })
    if (config.led)           rows.push({ label: 'LED',               value: 'Oui' })
    if (config.capteur)       rows.push({ label: 'Capteur',           value: 'Inclus' })
    return rows
  }, [config])

  if (submitted) {
    return (
      <div style={{ background: CREAM, minHeight: '100vh' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center px-6 py-40 text-center">
          <div
            className="flex items-center justify-center mb-8"
            style={{ width: 72, height: 72, background: GOLD, borderRadius: '50%' }}
          >
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

        {/* ── LEFT: Sticky visual panel ────────────────────────────────────── */}
        <div
          className="h-[200px] pt-16 overflow-hidden lg:w-[52%] lg:sticky lg:top-0 lg:h-screen lg:pt-20 flex items-center justify-center px-6 lg:px-14"
          style={{ background: '#fff' }}
        >
          <div className="w-full max-w-[280px] lg:max-w-none" style={{ position: 'relative' }}>
            <AwningPreview config={config} />
            <p style={{
              position: 'absolute', top: '75%', left: '50%', transform: 'translateX(-50%)',
              fontFamily: BODY, fontSize: '0.85rem', color: DARK, lineHeight: 1.6,
              textAlign: 'center', width: '80%',
            }}>
              * Cette illustration est une représentation indicative destinée à vous aider à visualiser la forme générale du store. Les couleurs, proportions et finitions réelles peuvent différer.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Configurator panel ────────────────────────────────────── */}
        <div
          className="flex flex-col lg:w-[48%] px-5 pt-6 pb-20 lg:px-12 xl:px-16 lg:pt-28"
          style={{ background: CREAM }}
        >

          {/* Step progress bar */}
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

          {/* ── Step 0: Modèle & Fixation ──────────────────────────────────── */}
          {step === 0 && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                  Modèle & fixation
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                  Choisissez votre modèle de store et le type de fixation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ paddingTop: 14 }}>
                {/* Pragua */}
                {(['Pragua', 'Valancia'] as const).map((m) => {
                  const active = config.modele === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('modele', m)}
                      onMouseEnter={() => Object.keys(LAM_SLUG).forEach((id) => preloadStoreImage(m, id))}
                      className="flex flex-col items-start text-left transition-all cursor-pointer"
                      style={{
                        border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                        background: active ? `${GOLD}08` : '#fff',
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      {/* Recommandé tag — top-right, half outside the card */}
                      {m === 'Valancia' && (
                        <span style={{
                          position: 'absolute', top: '-13px', right: '14px',
                          fontFamily: BODY, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
                          textTransform: 'uppercase', background: GOLD, color: '#fff',
                          padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 5,
                          zIndex: 1,
                        }}>
                          <Star size={10} fill="#fff" strokeWidth={0} />
                          Recommandé
                        </span>
                      )}

                      {/* Product image */}
                      <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 160 }}>
                        <img
                          src={m === 'Pragua' ? '/pragua.webp' : '/valancia.webp'}
                          alt={m}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
                        />
                      </div>

                      <div className="p-4 w-full">
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="flex items-center gap-2">
                            <span style={{ fontFamily: DISPLAY, fontSize: '1.3rem', fontWeight: 400, color: active ? DARK : 'rgba(28,26,20,0.6)' }}>
                              {m}
                            </span>
                          </div>
                          {active && (
                            <span className="flex items-center justify-center" style={{ width: 20, height: 20, background: GOLD, borderRadius: '50%' }}>
                              <Check size={11} color="#fff" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.6 }}>
                          {m === 'Pragua'
                            ? 'Conception classique, robuste et polyvalente pour tous types de façades.'
                            : 'Design épuré avec mécanisme à manivelle intégrée, finition premium.'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Not sure option */}
              <button
                type="button"
                onClick={() => set('modele', 'Je ne sais pas')}
                className="w-full flex items-center gap-4 px-5 py-4 transition-all cursor-pointer"
                style={{
                  border: `2px solid ${config.modele === 'Je ne sais pas' ? GOLD : 'rgba(28,26,20,0.12)'}`,
                  background: config.modele === 'Je ne sais pas' ? `${GOLD}08` : '#fff',
                }}
              >
                <span
                  style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${config.modele === 'Je ne sais pas' ? GOLD : 'rgba(28,26,20,0.3)'}`,
                    background: config.modele === 'Je ne sais pas' ? GOLD : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {config.modele === 'Je ne sais pas' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </span>
                <div className="text-left">
                  <p style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: DARK, marginBottom: 2 }}>
                    Je ne suis pas sûr(e)
                  </p>
                  <p style={{ fontFamily: BODY, fontSize: '0.75rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>
                    Pas de problème — après votre commande, notre équipe vous contactera pour choisir ensemble le modèle le mieux adapté à votre installation.
                  </p>
                </div>
              </button>

              {/* Fixation */}
              <div style={{ borderTop: '1px solid rgba(196,162,62,0.15)', paddingTop: 24 }}>
                <FieldLabel>Type de fixation</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { id: 'Murale sur Façade',      img: '/fixation-facade.webp',  desc: 'Fixation directe sur le mur de façade, solution la plus courante.' },
                    { id: 'Plafond (avec équerres)', img: '/fixation-plafond.webp', desc: 'Fixation au plafond avec équerres, idéale sous une terrasse couverte.' },
                  ] as const).map(({ id, img, desc }) => {
                    const active = config.fixation === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => set('fixation', id)}
                        className="flex flex-col items-start text-left transition-all cursor-pointer overflow-hidden"
                        style={{
                          border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                          background: active ? `${GOLD}08` : '#fff',
                        }}
                      >
                        <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 130 }}>
                          <img src={img} alt={id} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                        </div>
                        <div className="p-3 w-full">
                          <div className="flex items-center justify-between w-full mb-1">
                            <span style={{ fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 400, color: active ? DARK : 'rgba(28,26,20,0.6)' }}>{id}</span>
                            {active && <span className="flex items-center justify-center" style={{ width: 18, height: 18, background: GOLD, borderRadius: '50%' }}><Check size={10} color="#fff" strokeWidth={3} /></span>}
                          </div>
                          <p style={{ fontFamily: BODY, fontSize: '0.73rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>{desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => set('fixation', 'Je ne sais pas')}
                  className="w-full flex items-center gap-4 px-5 py-4 mt-3 transition-all cursor-pointer"
                  style={{
                    border: `2px solid ${config.fixation === 'Je ne sais pas' ? GOLD : 'rgba(28,26,20,0.12)'}`,
                    background: config.fixation === 'Je ne sais pas' ? `${GOLD}08` : '#fff',
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${config.fixation === 'Je ne sais pas' ? GOLD : 'rgba(28,26,20,0.3)'}`, background: config.fixation === 'Je ne sais pas' ? GOLD : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {config.fixation === 'Je ne sais pas' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </span>
                  <div className="text-left">
                    <p style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: DARK, marginBottom: 2 }}>Je ne suis pas sûr(e)</p>
                    <p style={{ fontFamily: BODY, fontSize: '0.75rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>Notre équipe vous contactera pour déterminer la fixation adaptée.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Dimensions ─────────────────────────────────────────── */}
          {step === 1 && (() => {
            // Fixed rect dimensions — only labels change
            const rX = 20, rY = 16, rW = 140, rH = 70

            return (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                    Dimensions du store
                  </h1>
                  <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                    La largeur est la mesure horizontale, l'avancée est la profondeur de dépliage.
                  </p>
                </div>

                {/* Fixed top-view diagram — only text updates */}
                <div style={{ background: '#fff', border: '1px solid rgba(196,162,62,0.18)', padding: '20px 16px' }}>
                  <svg viewBox="0 0 210 130" width="100%" style={{ display: 'block' }}>
                    <rect x={rX} y={rY} width={rW} height={rH} fill={`${GOLD}10`} stroke={GOLD} strokeWidth="1.5" />
                    {[0.33, 0.66].map((t) => (
                      <line key={t} x1={rX} y1={rY + rH * t} x2={rX + rW} y2={rY + rH * t} stroke={`${GOLD}25`} strokeWidth="0.75" />
                    ))}
                    <line x1={rX} y1={rY + rH + 12} x2={rX + rW} y2={rY + rH + 12} stroke={GOLD} strokeWidth="1" />
                    <line x1={rX}      y1={rY + rH + 8}  x2={rX}      y2={rY + rH + 16} stroke={GOLD} strokeWidth="1" />
                    <line x1={rX + rW} y1={rY + rH + 8}  x2={rX + rW} y2={rY + rH + 16} stroke={GOLD} strokeWidth="1" />
                    <text x={rX + rW / 2} y={rY + rH + 28} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="sans-serif" fontWeight="700">
                      {config.largeur ? `${config.largeur} cm` : 'Largeur'}
                    </text>
                    <line x1={rX + rW + 12} y1={rY} x2={rX + rW + 12} y2={rY + rH} stroke={GOLD} strokeWidth="1" />
                    <line x1={rX + rW + 8} y1={rY}      x2={rX + rW + 16} y2={rY}      stroke={GOLD} strokeWidth="1" />
                    <line x1={rX + rW + 8} y1={rY + rH} x2={rX + rW + 16} y2={rY + rH} stroke={GOLD} strokeWidth="1" />
                    <text
                      x={rX + rW + 30} y={rY + rH / 2}
                      textAnchor="middle" dominantBaseline="middle" fontSize="10"
                      fill={GOLD} fontFamily="sans-serif" fontWeight="700"
                      transform={`rotate(90, ${rX + rW + 30}, ${rY + rH / 2})`}
                    >
                      {config.avancee ? `${config.avancee} cm` : 'Avancée'}
                    </text>
                  </svg>
                </div>

                {/* Inputs */}
                <div className="flex flex-col gap-5">
                  {/* Largeur */}
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <label style={{ fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(28,26,20,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Largeur
                      </label>
                      {config.largeur && (
                        <span style={{ fontFamily: BODY, fontSize: '1.1rem', fontWeight: 800, color: GOLD }}>
                          {config.largeur} cm
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      placeholder="Entrez la largeur en cm..."
                      value={config.largeur}
                      onChange={(e) => setConfig((prev) => ({ ...prev, largeur: e.target.value, dimensionsInconnues: false }))}
                      className="w-full px-5 py-4 outline-none transition-all"
                      style={{
                        fontFamily: BODY, fontSize: '1rem', fontWeight: 600, color: DARK,
                        border: `2px solid ${config.largeur ? GOLD : 'rgba(28,26,20,0.15)'}`,
                        background: config.largeur ? `${GOLD}06` : '#fff',
                      }}
                    />
                    <p style={{ fontFamily: BODY, fontSize: 9, color: 'rgba(28,26,20,0.35)', marginTop: 6, letterSpacing: '0.06em' }}>
                      Entre 150 cm et 600 cm
                    </p>
                  </div>

                  {/* Avancée */}
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <label style={{ fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(28,26,20,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Avancée
                      </label>
                      {config.avancee && (
                        <span style={{ fontFamily: BODY, fontSize: '1.1rem', fontWeight: 800, color: GOLD }}>
                          {config.avancee} cm
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['150', '200', '250', '300'].map((v) => {
                        const sel = config.avancee === v
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setConfig((prev) => ({ ...prev, avancee: v, dimensionsInconnues: false }))}
                            className="py-4 cursor-pointer transition-all"
                            style={{
                              fontFamily: BODY, fontSize: '0.9rem', fontWeight: 700,
                              border: `2px solid ${sel ? GOLD : 'rgba(28,26,20,0.15)'}`,
                              background: sel ? GOLD : '#fff',
                              color: sel ? '#fff' : DARK,
                            }}
                          >
                            {v}
                            <span style={{ fontSize: '0.65rem', fontWeight: 500, display: 'block', opacity: 0.75 }}>cm</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Not sure option */}
                <button
                  type="button"
                  onClick={() => {
                    if (!config.dimensionsInconnues) {
                      setConfig((prev) => ({ ...prev, dimensionsInconnues: true, largeur: '', avancee: '' }))
                    } else {
                      set('dimensionsInconnues', false)
                    }
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 transition-all cursor-pointer"
                  style={{
                    border: `2px solid ${config.dimensionsInconnues ? GOLD : 'rgba(28,26,20,0.12)'}`,
                    background: config.dimensionsInconnues ? `${GOLD}08` : '#fff',
                  }}
                >
                  <span
                    style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${config.dimensionsInconnues ? GOLD : 'rgba(28,26,20,0.3)'}`,
                      background: config.dimensionsInconnues ? GOLD : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {config.dimensionsInconnues && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </span>
                  <div className="text-left">
                    <p style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: DARK, marginBottom: 2 }}>
                      Je ne suis pas sûr(e)
                    </p>
                    <p style={{ fontFamily: BODY, fontSize: '0.75rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>
                      Notre équipe vous contactera après votre demande pour relever les dimensions sur place.
                    </p>
                  </div>
                </button>
              </div>
            )
          })()}

          {/* ── Step 2: Structure & Tissu ──────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                  Structure & tissu
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                  Choisissez la couleur de la structure, du tissu et le style de lambrequin.
                </p>
              </div>

              {/* Structure color */}
              <div>
                <FieldLabel>Couleur de la structure</FieldLabel>
                <div className="grid grid-cols-6 gap-2.5">
                  {([
                    { label: 'Gris Foncé', bg: '#404040' },
                    { label: 'Blanc',      bg: '#F6F5F3' },
                  ] as const).map(({ label, bg }) => {
                    const active = config.couleurStruct === label
                    return (
                      <button
                        key={label}
                        type="button"
                        title={label}
                        onClick={() => set('couleurStruct', label)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <div
                          style={{
                            width: '100%', aspectRatio: '1/1',
                            background: bg,
                            border: `2px solid ${active ? GOLD : 'transparent'}`,
                            boxShadow: active ? `0 0 0 1px ${CREAM}, 0 0 0 3px ${GOLD}` : '0 0 0 1px rgba(0,0,0,0.1)',
                            transition: 'all 0.15s',
                          }}
                        />
                        <span style={{ fontFamily: BODY, fontSize: 11, color: active ? GOLD : DARK, fontWeight: active ? 700 : 500, textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.03em' }}>
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

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

              {/* Lambrequin */}
              <div>
                <FieldLabel>Style de lambrequin</FieldLabel>
                <div className="flex flex-col gap-3">
                  {LAMBREQUINS.map((l) => {
                    const active = config.lambrequin === l.id
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => set('lambrequin', l.id)}
                        onMouseEnter={() => preloadStoreImage(config.modele, l.id)}
                        className="flex items-center gap-4 px-3 py-3 cursor-pointer transition-all text-left"
                        style={{
                          border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                          background: active ? `${GOLD}08` : '#fff',
                        }}
                      >
                        {/* Radio dot */}
                        <span
                          style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.3)'}`,
                            background: active ? GOLD : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                        </span>

                        {/* Image */}
                        <div style={{ flexShrink: 0, width: 150, height: 100 }}>
                          <img
                            src={l.img}
                            alt={l.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        <span style={{ fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700, color: active ? DARK : 'rgba(28,26,20,0.55)' }}>
                          {l.name}
                        </span>

                        {active && <Check size={14} color={GOLD} strokeWidth={2.5} className="ml-auto flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Logo */}
              <div>
                <FieldLabel>Impression logo</FieldLabel>
                <Toggle active={config.logo} onChange={(v) => set('logo', v)} label="Ajouter un logo sur le tissu" />
                {config.logo && (
                  <div className="mt-3">
                    <label
                      className="flex items-center gap-3 w-full px-4 py-3 cursor-pointer"
                      style={{
                        border: '1px dashed rgba(196,162,62,0.5)',
                        background: `${GOLD}05`,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span style={{ fontFamily: BODY, fontSize: '0.85rem', color: config.logoFile ? DARK : 'rgba(28,26,20,0.4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {config.logoFile ? config.logoFile.name : 'Joindre votre fichier logo (PNG, SVG, PDF…)'}
                      </span>
                      {config.logoFile && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); set('logoFile', null) }}
                          style={{ color: 'rgba(28,26,20,0.35)', fontFamily: BODY, fontSize: '1rem', lineHeight: 1 }}
                        >×</button>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf,.svg,.ai,.eps"
                        className="sr-only"
                        onChange={(e) => set('logoFile', e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Options ────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                  Options
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                  Choisissez le mode d'actionnement et les accessoires souhaités.
                </p>
              </div>

              {/* Control type */}
              <div>
                <FieldLabel>Mode d'actionnement</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ paddingTop: 14 }}>
                  {(['Manuelle', 'Moteur'] as const).map((m) => {
                    const active = config.commande === m
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set('commande', m)}
                        className="flex items-center gap-4 p-5 cursor-pointer transition-all"
                        style={{
                          border: `2px solid ${active ? GOLD : 'rgba(28,26,20,0.12)'}`,
                          background: active ? `${GOLD}08` : '#fff',
                          position: 'relative',
                          overflow: 'visible',
                        }}
                      >
                        {/* Recommandé tag — top-right, half outside the card */}
                        {m === 'Moteur' && (
                          <span style={{
                            position: 'absolute', top: '-13px', right: '14px',
                            fontFamily: BODY, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
                            textTransform: 'uppercase', background: GOLD, color: '#fff',
                            padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 5,
                            zIndex: 1,
                          }}>
                            <Star size={10} fill="#fff" strokeWidth={0} />
                            Recommandé
                          </span>
                        )}
                        <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {m === 'Manuelle' ? (
                            <svg viewBox="0 0 36 36" width="36" height="36">
                              <circle cx="18" cy="18" r="12" fill="none" stroke={active ? GOLD : 'rgba(28,26,20,0.25)'} strokeWidth="2" />
                              <line x1="18" y1="6" x2="18" y2="14" stroke={active ? GOLD : 'rgba(28,26,20,0.25)'} strokeWidth="2" strokeLinecap="round" />
                              <line x1="18" y1="22" x2="18" y2="30" stroke={active ? GOLD : 'rgba(28,26,20,0.25)'} strokeWidth="2" strokeLinecap="round" />
                              <line x1="6" y1="18" x2="14" y2="18" stroke={active ? GOLD : 'rgba(28,26,20,0.25)'} strokeWidth="2" strokeLinecap="round" />
                              <line x1="22" y1="18" x2="30" y2="18" stroke={active ? GOLD : 'rgba(28,26,20,0.25)'} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 36 36" width="36" height="36">
                              <circle cx="18" cy="18" r="12" fill="none" stroke={active ? GOLD : 'rgba(28,26,20,0.25)'} strokeWidth="2" />
                              <circle cx="18" cy="18" r="4" fill={active ? GOLD : 'rgba(28,26,20,0.2)'} />
                              <path d="M18 6 A12 12 0 0 1 30 18" fill="none" stroke={active ? GOLD : 'rgba(28,26,20,0.25)'} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <p style={{ fontFamily: BODY, fontSize: '0.9rem', fontWeight: 700, color: DARK }}>{m}</p>
                          </div>
                          <p style={{ fontFamily: BODY, fontSize: '0.75rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.4 }}>
                            {m === 'Manuelle' ? 'Manivelle intégrée, robuste et économique' : (
                              <>
                                Moteur électrique
                                <span style={{ display: 'block', color: GOLD, fontWeight: 700 }}>télécommande incluse</span>
                              </>
                            )}
                          </p>
                        </div>
                        {active && <Check size={16} color={GOLD} strokeWidth={2.5} className="ml-auto flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Côté commande */}
              <div>
                <FieldLabel>Côté mécanisme</FieldLabel>
                <Pills options={['Gauche', 'Droite'] as const} value={config.commandeCote} onChange={(v) => set('commandeCote', v)} />
              </div>

              {/* Accessories */}
              <div>
                <FieldLabel>Accessoires</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                  {/* LED card */}
                  <button
                    type="button"
                    onClick={() => set('led', !config.led)}
                    className="flex flex-col items-start text-left transition-all cursor-pointer overflow-hidden"
                    style={{
                      border: `2px solid ${config.led ? GOLD : 'rgba(28,26,20,0.12)'}`,
                      background: config.led ? `${GOLD}08` : '#fff',
                    }}
                  >
                    <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 130 }}>
                      <img src="/accessoire-led.webp" alt="Éclairage LED" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                    </div>
                    <div className="p-3 w-full">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span style={{ fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 400, color: config.led ? DARK : 'rgba(28,26,20,0.6)' }}>Éclairage LED</span>
                        {config.led && <span className="flex items-center justify-center" style={{ width: 18, height: 18, background: GOLD, borderRadius: '50%' }}><Check size={10} color="#fff" strokeWidth={3} /></span>}
                      </div>
                      <p style={{ fontFamily: BODY, fontSize: '0.73rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>Bande LED intégrée sous le store pour un éclairage d'ambiance.</p>
                    </div>
                  </button>

                  {/* Capteur card — only when Moteur */}
                  {config.commande === 'Moteur' && (
                    <button
                      type="button"
                      onClick={() => set('capteur', !config.capteur)}
                      className="flex flex-col items-start text-left transition-all cursor-pointer overflow-hidden"
                      style={{
                        border: `2px solid ${config.capteur ? GOLD : 'rgba(28,26,20,0.12)'}`,
                        background: config.capteur ? `${GOLD}08` : '#fff',
                      }}
                    >
                      <div className="w-full flex items-center justify-center" style={{ background: '#f7f5f0', height: 130 }}>
                        <img src="/accessoire-capteur.webp" alt="Capteur vent / pluie" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                      </div>
                      <div className="p-3 w-full">
                        <div className="flex items-center justify-between w-full mb-1">
                          <span style={{ fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 400, color: config.capteur ? DARK : 'rgba(28,26,20,0.6)' }}>Capteur vent / pluie</span>
                          {config.capteur && <span className="flex items-center justify-center" style={{ width: 18, height: 18, background: GOLD, borderRadius: '50%' }}><Check size={10} color="#fff" strokeWidth={3} /></span>}
                        </div>
                        <p style={{ fontFamily: BODY, fontSize: '0.73rem', color: 'rgba(28,26,20,0.45)', lineHeight: 1.5 }}>Repliage automatique du store en cas de vent ou de pluie.</p>
                      </div>
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ── Step 5: Récapitulatif ───────────────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-8">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
                  Récapitulatif
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.75 }}>
                  Vérifiez votre configuration avant d'envoyer la demande de devis.
                </p>
              </div>

              {/* Summary table */}
              <div style={{ border: '1px solid rgba(196,162,62,0.2)', background: '#fff', padding: '8px 16px' }}>
                <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(196,162,62,0.15)', marginBottom: 4 }}>
                  <div style={{ width: 3, height: 22, background: GOLD }} />
                  <p style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)' }}>
                    Ordre de fabrication — Store Bras Invisible
                  </p>
                </div>
                {summary.map((row) => (
                  <SummaryRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>

              {/* Tissu color preview */}
              {config.tissu && (
                <div className="flex items-center gap-4 p-4" style={{ border: '1px solid rgba(196,162,62,0.15)', background: '#fff' }}>
                  <div style={{ width: 48, height: 48, flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(28,26,20,0.1)' }}>
                    <img src={`/fabrics/${config.tissu.id}.png`} alt={config.tissu.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700, color: DARK }}>{config.tissu.name}</p>
                    <p style={{ fontFamily: BODY, fontSize: '0.75rem', color: 'rgba(28,26,20,0.45)' }}>Référence : {config.tissu.id}</p>
                  </div>
                </div>
              )}

              {/* Contact note */}
              <div className="flex items-start gap-4 p-5" style={{ background: `${GOLD}0C`, border: `1px solid ${GOLD}30` }}>
                <Phone size={18} color={GOLD} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700, color: DARK, marginBottom: 4 }}>
                    Devis gratuit sous 24h
                  </p>
                  <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: 'rgba(28,26,20,0.55)', lineHeight: 1.65 }}>
                    Notre équipe vous contactera pour confirmer les détails techniques et vous transmettre le devis personnalisé.
                  </p>
                </div>
              </div>

              {/* Trust strip */}
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

          {/* ── Navigation buttons ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mt-12">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goToStep((s) => s - 1)}
                className="flex items-center gap-2 px-6 py-3.5 cursor-pointer transition-opacity hover:opacity-70"
                style={{
                  border: '1px solid rgba(196,162,62,0.3)',
                  fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: DARK,
                }}
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
                style={{
                  background: GOLD,
                  fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#fff',
                }}
              >
                Étape suivante <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 cursor-pointer transition-opacity hover:opacity-85"
                style={{
                  background: DARK,
                  fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#fff',
                }}
              >
                <Check size={14} /> Envoyer la demande de devis
              </button>
            )}
          </div>

          {!canNext && step < 4 && (
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
