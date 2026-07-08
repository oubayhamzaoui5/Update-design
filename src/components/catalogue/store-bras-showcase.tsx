'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, FileText } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'

const models = [
  {
    id: 'pragua',
    name: 'Pragua',
    tag: 'Robuste',
    image: '/pragua.webp',
    text: 'Base solide pour façades simples, villas, commerces et terrasses régulières.',
    specs: [
      ['Type', 'Store banne à bras invisibles'],
      ['Usage idéal', 'Villas · commerces · terrasses'],
      ['Lambrequin', 'Droit · Vagues · Sans'],
      ['Pose', 'Façade ou plafond'],
    ],
  },
  {
    id: 'valancia',
    name: 'Valancia',
    tag: 'Premium',
    image: '/valancia.webp',
    text: 'Ligne plus nette, idéale quand le store doit rester discret une fois fermé.',
    specs: [
      ['Type', 'Store banne à bras invisibles'],
      ['Usage idéal', 'Hôtels · restaurants · façades soignées'],
      ['Lambrequin', 'Droit · Vagues · Sans'],
      ['Pose', 'Façade ou plafond'],
    ],
  },
]

const lambrequins = [
  { id: 'droit', label: 'Droit' },
  { id: 'vagues', label: 'Vagues' },
  { id: 'sans', label: 'Sans' },
]

const lambrequinGallery = [
  { id: 'droit', label: 'Droit', image: '/lambrequin-droit.webp', text: 'Bordure nette et graphique — la finition classique des façades commerciales.' },
  { id: 'vagues', label: 'Vagues', image: '/lambreaquin-vagues.webp', text: 'Feston arrondi, esprit riviera pour cafés et maisons de caractère.' },
  { id: 'sans', label: 'Sans', image: '/lambreaquin-sans.webp', text: 'Ligne minimale, toile pure — le store disparaît dans l’architecture.' },
]

const options = [
  { name: 'Éclairage LED intégré', image: '/accessoire-led.webp', tag: 'Confort', text: 'Bandeau LED dans le coffre ou les bras pour prolonger la terrasse en soirée.' },
  { name: 'Capteur vent', image: '/accessoire-capteur.webp', tag: 'Sécurité', text: 'Repli automatique du store dès que le vent dépasse le seuil réglé.' },
]

const fixations = [
  { id: 'facade', label: 'Façade', image: '/fixation-facade.webp', text: 'Pose murale pour terrasses, vitrines et ouvertures exposées.' },
  { id: 'plafond', label: 'Plafond', image: '/fixation-plafond.webp', text: 'Pose sous plafond ou avancée pour configurations particulières.' },
]

const fabrics = [
  { file: 'SA2826_Champagne.png', name: 'Champagne' },
  { file: 'SA2821_Silver.png', name: 'Silver' },
  { file: 'SA2831_Mineral.png', name: 'Mineral' },
  { file: 'SA2828_Indigo.png', name: 'Indigo' },
  { file: 'SA2145_Marino.png', name: 'Marino' },
  { file: 'SA2245_Botella.png', name: 'Botella' },
  { file: 'SA2242_Verde.png', name: 'Verde' },
  { file: 'SA2101_Granate.png', name: 'Granate' },
  { file: 'SA2210_Rioja.png', name: 'Rioja' },
  { file: 'SA2316_Cafe.png', name: 'Café' },
  { file: 'SA2170_Negro.png', name: 'Negro' },
  { file: 'SA2143_Marfil.png', name: 'Marfil' },
]

export default function StoreBrasShowcase() {
  const [model, setModel] = useState('pragua')
  const [lambrequin, setLambrequin] = useState('droit')
  const [fixation, setFixation] = useState('facade')
  const [fabric, setFabric] = useState(fabrics[0])

  const currentModel = models.find((m) => m.id === model)!
  const previewSrc = `/store/${model}-${lambrequin}.webp`

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
              <span style={{ color: GOLD }}>Store à bras invisible</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 400 }} className="text-4xl leading-none md:text-5xl">
                  Store à bras invisible
                </h1>
                <p className="mt-2 max-w-[640px] text-sm leading-6 text-[#14130F]/60">
                  Deux modèles de store banne sur mesure, trois styles de lambrequin, une bibliothèque de toiles. Composez, puis recevez un devis réaliste.
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{models.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">modèles</p>
                </div>
                <Link href="/tinda" className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: GOLD }}>
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
              <Image src="/editorial/awning-cafe.jpg" alt="Façade de café ombragée par un store banne sur mesure" fill priority sizes="(max-width:1500px) 100vw, 1500px" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,19,15,0.55),transparent_45%)]" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD }}>Terrasses · Vitrines · Façades</p>
                <p style={{ fontFamily: DISPLAY }} className="mt-2 max-w-[560px] text-2xl leading-tight text-white md:text-4xl">
                  L&apos;ombre, <em style={{ color: GOLD }}>sans alourdir la façade.</em>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MODEL PLATES — catalogue plates, photo + technical panel */}
        <section id="modeles" className="pt-12 md:pt-16">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>La collection</p>
                <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">Deux structures, une même discrétion.</h2>
              </div>
              <p className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52 sm:block">{models.length} modèles</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {models.map((m, index) => (
                <article key={m.id} className="flex flex-col overflow-hidden border border-[#14130F]/12 bg-[#FCFCFD]">
                  <div className="relative aspect-[16/9] overflow-hidden bg-white">
                    <Image src={m.image} alt={`Store banne ${m.name} — bras invisibles, toile déployée`} fill sizes="(max-width:1024px) 100vw, 50vw" priority={index === 0} className="object-contain p-4" />
                    <span className="absolute left-5 top-5 border border-[#14130F]/12 bg-white/85 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#14130F]/70">
                      {m.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between border-t border-[#14130F]/10 p-6 md:p-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#14130F]/40">Modèle 0{index + 1}</p>
                      <h3 style={{ fontFamily: DISPLAY }} className="mt-2 text-5xl leading-none">{m.name}</h3>
                      <p className="mt-4 max-w-[520px] text-sm leading-7 text-[#14130F]/60">{m.text}</p>
                      <div className="mt-6 grid gap-0 border-t border-[#14130F]/12">
                        {m.specs.map(([k, v]) => (
                          <div key={k} className="flex items-baseline justify-between gap-6 border-b border-[#14130F]/12 py-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/45">{k}</span>
                            <span className="text-right text-sm font-semibold text-[#14130F]/80">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setModel(m.id)
                          document.getElementById('configurateur')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="inline-flex items-center justify-center gap-3 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white"
                        style={{ background: DARK }}
                      >
                        Composer ce modèle <ArrowRight size={14} />
                      </button>
                      <Link href="/devis" className="inline-flex items-center justify-center gap-3 border border-[#14130F]/16 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#14130F]">
                        Demander un devis
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* COMPOSER — live preview */}
        <section id="configurateur" className="mt-14 py-14 md:py-20" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Composer</p>
              <h2 className="mt-2 text-2xl font-black tracking-[0.04em]">Modèle, lambrequin, toile et fixation.</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              {/* PREVIEW */}
              <div className="relative overflow-hidden border border-[#14130F]/12 bg-[#FCFCFD]">
                <div className="relative aspect-[4/3]">
                  <Image src={previewSrc} alt={`Store ${currentModel.name} lambrequin ${lambrequin}`} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-contain p-6" />
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-[#14130F]/10 px-5 py-4">
                  <div>
                    <p style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{currentModel.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#14130F]/50">Lambrequin {lambrequin} · Pose {fixation}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="relative h-12 w-12 overflow-hidden border border-[#14130F]/15">
                      <Image src={`/fabrics/${fabric.file}`} alt={fabric.name} fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#14130F]/55">{fabric.name}</span>
                  </div>
                </div>
              </div>

              {/* CONTROLS */}
              <div className="grid content-start gap-7">
                {/* model */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>1 · Modèle</p>
                  <div className="grid grid-cols-2 gap-3">
                    {models.map((m) => {
                      const on = m.id === model
                      return (
                        <button key={m.id} type="button" onClick={() => setModel(m.id)} className="border p-4 text-left transition" style={{ borderColor: on ? GOLD : 'rgba(20,19,15,0.14)', background: on ? '#FCFCFD' : 'transparent' }}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black uppercase tracking-[0.08em]">{m.name}</span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: GOLD }}>{m.tag}</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-[#14130F]/55">{m.text}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* lambrequin */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>2 · Lambrequin</p>
                  <div className="inline-flex border border-[#14130F]/14 p-1">
                    {lambrequins.map((l) => (
                      <button key={l.id} type="button" onClick={() => setLambrequin(l.id)} className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition" style={{ background: lambrequin === l.id ? DARK : 'transparent', color: lambrequin === l.id ? CREAM : 'rgba(20,19,15,0.55)' }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* fabric */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>3 · Toile <span className="text-[#14130F]/40">({fabric.name})</span></p>
                  <div className="flex flex-wrap gap-2">
                    {fabrics.map((f) => {
                      const on = f.file === fabric.file
                      return (
                        <button key={f.file} type="button" onClick={() => setFabric(f)} title={f.name} className="relative h-9 w-9 overflow-hidden border transition hover:scale-105" style={{ borderColor: on ? GOLD : 'rgba(20,19,15,0.18)', outline: on ? `2px solid ${GOLD}` : 'none', outlineOffset: 1 }}>
                          <Image src={`/fabrics/${f.file}`} alt={f.name} fill sizes="36px" className="object-cover" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* fixation */}
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>4 · Fixation</p>
                  <div className="grid grid-cols-2 gap-3">
                    {fixations.map((fx) => {
                      const on = fx.id === fixation
                      return (
                        <button key={fx.id} type="button" onClick={() => setFixation(fx.id)} className="overflow-hidden border text-left transition" style={{ borderColor: on ? GOLD : 'rgba(20,19,15,0.14)' }}>
                          <span className="relative block aspect-[16/10] bg-white">
                            <Image src={fx.image} alt={fx.label} fill sizes="200px" className="object-contain p-3" />
                          </span>
                          <span className="block border-t border-[#14130F]/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em]">{fx.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Link href="/tinda" className="inline-flex w-full items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                  Continuer la configuration <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LAMBREQUIN GALLERY — finish detail */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-7 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Styles de lambrequin</p>
              <div className="h-px flex-1 bg-[#14130F]/25" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">3 finitions</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {lambrequinGallery.map((l) => (
                <article key={l.id} className="group border border-[#14130F]/12 bg-[#FCFCFD]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white">
                    <Image src={l.image} alt={`Lambrequin ${l.label} — détail de finition du store banne`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain p-4 transition duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="border-t border-[#14130F]/10 p-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.12em]">{l.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#14130F]/58">{l.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* OPTIONS — before closing CTA */}
        <section className="pb-12 md:pb-16">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-7 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Options & motorisation</p>
              <div className="h-px flex-1 bg-[#14130F]/25" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">{options.length} options</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {options.map((o) => (
                <article key={o.name} className="grid grid-cols-[0.42fr_0.58fr] overflow-hidden border border-[#14130F]/12 bg-[#FCFCFD]">
                  <div className="relative min-h-[150px] bg-white">
                    <Image src={o.image} alt={`${o.name} pour store banne`} fill sizes="(max-width:768px) 42vw, 20vw" className="object-contain p-4" />
                  </div>
                  <div className="border-l border-[#14130F]/10 p-5 md:p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>{o.tag}</p>
                    <h3 className="mt-2 text-sm font-black uppercase tracking-[0.12em]">{o.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#14130F]/58">{o.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS STRIP */}
        <section className="pb-12 md:pb-16">
          <div className="mx-auto grid max-w-[1500px] gap-px px-6 sm:grid-cols-2 md:grid-cols-4 md:px-10">
            {[
              'Dimensions, avancée et fixation confirmées avant devis.',
              'Toile choisie selon couleur, exposition et rendu de façade.',
              'Motorisation, capteur vent et options selon le projet.',
              'Accompagnement commerces, restaurants, villas et hôtels.',
            ].map((item, i) => (
              <div key={item} className="border border-[#14130F]/12 p-6">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>0{i + 1}</p>
                <p className="text-sm font-semibold leading-7 text-[#14130F]/62">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FORM EXPLAINER — closing CTA */}
        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.92fr_1.08fr] md:px-10">
            <div className="relative min-h-[320px] overflow-hidden border border-[#14130F]/12 md:min-h-[420px]">
              <Image src="/editorial/terrace-dining.jpg" alt="Terrasse de restaurant moderne" fill sizes="(max-width:768px) 100vw, 45vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <FileText className="mb-6 h-7 w-7" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 0.96, fontWeight: 400 }}>
                Le formulaire sert
                <br />
                <em style={{ color: 'rgba(20,19,15,0.48)' }}>à cadrer le projet.</em>
              </h2>
              <p className="mt-6 max-w-[620px] text-base leading-8 text-[#14130F]/62">
                Le store à bras invisible remplace le panier classique : il nous donne les cotes, le support et les options pour revenir avec une proposition réaliste.
              </p>
              <div className="mt-7 grid gap-3">
                {[
                  'Largeur et avancée souhaitées.',
                  'Type de pose : façade, plafond ou cas particulier.',
                  'Toile, lambrequin, motorisation et accessoires.',
                  'Ville, délai souhaité et photo de la façade si disponible.',
                ].map((step) => (
                  <div key={step} className="flex gap-4 border-b border-[#C4A23E]/20 pb-4 text-sm font-semibold leading-7 text-[#14130F]/66">
                    <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                    {step}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/tinda" className="inline-flex w-fit items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                  Configurer mon store <ArrowRight size={14} />
                </Link>
                <Link href="/devis" className="inline-flex w-fit items-center gap-3 border border-[#14130F]/16 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#14130F]">
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
