'use client'

import { useState, useTransition } from 'react'
import { updateParasolContentAction } from '../actions'
import type { ParasolContent } from '@/types/site-content'
import {
  Sun, Layers, Star, Save, Check, AlertCircle, Plus, Trash2,
  ChevronUp, ChevronDown, ExternalLink, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  input: { borderColor: '#E5E7EB', background: '#FAFAFA', color: '#111827' },
  card:  { background: '#FFFFFF', border: '1px solid #E8EAED', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  muted: { color: '#6B7280' },
  label: { color: '#374151' },
}
const AMBER = '#B45309'
const AMBER_BG = '#FFFBEB'

// ─── Primitives ───────────────────────────────────────────────────────────────
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-xs font-semibold" style={S.label}>{children}</label>
      {hint && <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-200"
      style={S.input}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-200"
      style={{ ...S.input, resize: 'vertical' }}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div><Label hint={hint}>{label}</Label>{children}</div>
}

function SectionCard({ icon: Icon, title, description, children }: {
  icon: React.ElementType; title: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl p-6 space-y-5" style={S.card}>
      <div className="flex items-start gap-3 pb-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: AMBER_BG }}>
          <Icon size={16} style={{ color: AMBER }} />
        </div>
        <div>
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>{title}</h2>
          <p className="text-xs mt-0.5" style={S.muted}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function Toast({ state }: { state: 'success' | 'error' }) {
  const ok = state === 'success'
  return (
    <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
      style={{ background: ok ? '#ECFDF5' : '#FEF2F2', color: ok ? '#065F46' : '#991B1B', border: `1px solid ${ok ? '#A7F3D0' : '#FECACA'}` }}>
      {ok ? <Check size={14} /> : <AlertCircle size={14} />}
      {ok ? 'Sauvegardé !' : 'Erreur — réessayez.'}
    </div>
  )
}

// ─── Default content ──────────────────────────────────────────────────────────
const DEFAULT: ParasolContent = {
  hero: {
    headline: 'Parasols',
    italic: 'Premium',
    body: "De la piscine d'hôtel à la terrasse de restaurant — structure aluminium thermolaqué, toiles Sunbrella® et 4 modèles exclusifs déportés. Livraison nationale, installation professionnelle.",
    ctaLabel: 'Configurer mon parasol',
    ctaHref: '/parasol',
  },
  models: [
    { name: 'Dallas', img: '/dallas.webp', tagline: 'Compact & Fonctionnel', desc: "Parasol déporté compact, idéal pour les espaces réduits. Facilement repositionnable." },
    { name: 'Havana', img: '/havana.webp', tagline: 'Élégance Asymétrique', desc: "Design asymétrique élégant avec bras orientable à 360°. La référence des terrasses de restaurant." },
    { name: 'Ibiza', img: '/ibiza.webp', tagline: 'Premium Hôtelier', desc: "Parasol déporté premium avec finition haut de gamme. Conçu pour les établissements 4 et 5 étoiles." },
    { name: 'Mauris', img: '/mauris.webp', tagline: 'Grandes Surfaces', desc: "Structure multi-têtes pour couvrir de larges surfaces. Idéal pour les plages privées et les piscines." },
  ],
  features: [
    { title: 'Structure Aluminium', body: "Profilés aluminium thermolaqué ultra-résistants à la corrosion saline. Adaptés au bord de mer et aux zones côtières tunisiennes." },
    { title: '35+ Coloris Sunbrella®', body: "Toiles en tissu acrylique Sunbrella® : imperméables, anti-moisissures, résistantes aux UV. Personnalisables à l'identité visuelle de votre établissement." },
    { title: 'Dimensions Sur Mesure', body: "Diamètres de 2 à 6 m, formes carrées ou rectangulaires. Chaque parasol est dimensionné précisément selon vos espaces." },
    { title: 'Motorisation Disponible', body: "Option motorisation pour les grandes structures. Ouverture et fermeture automatiques, compatible avec des systèmes domotiques." },
    { title: 'Résistance Vent & UV', body: "Testé pour résister aux vents forts (classe 5). Filtre jusqu'à 95 % des UV. Durée de vie supérieure à 10 ans avec entretien standard." },
    { title: 'Référence Hôtelière', body: "Installés dans les hôtels et résidences balnéaires de Tunisie. Nos commerciaux se déplacent sur site pour les projets d'envergure." },
  ],
  premium: {
    headline: 'Conçu pour durer,',
    italic: 'pensé pour plaire',
    paragraph1: "Nos parasols sont fabriqués avec des profilés aluminium thermolaqué ultra-résistants à la corrosion saline — adaptés au bord de mer et aux zones côtières tunisiennes. Rien ne rouille, rien ne se déforme, même après des années d'exposition.",
    paragraph2: "La toile Sunbrella® filtre jusqu'à 95 % des rayons UV, résiste à la pluie et conserve son éclat sur le long terme. Plus de 35 coloris disponibles, tous coordonnables à l'identité visuelle de votre établissement.",
    features: [
      'Structure aluminium thermolaqué — résistant à la corrosion saline et aux intempéries',
      "Toiles Sunbrella® acrylique — 35+ coloris, protection UV jusqu'à 95 %",
      '4 modèles déportés exclusifs — Dallas, Havana, Ibiza, Mauris',
      'Dimensions sur mesure — diamètres de 2 à 6 m, formes carrées ou rectangulaires',
      'Motorisation disponible — ouverture automatique compatible domotique',
      'Testé classe 5 résistance au vent — durée de vie supérieure à 10 ans',
      'Installation professionnelle partout en Tunisie',
    ],
  },
  quote: {
    text: "L'ombre n'est pas un luxe.",
    accent: "C'est une signature.",
  },
  cta: {
    headline: "Donnez de l'ombre",
    italic: 'à votre projet.',
    body: "Partagez vos dimensions, votre coloris préféré et la nature de votre projet — nous revenons vers vous avec une offre sur mesure sous 24 heures.",
    ctaLabel: 'Configurer mon parasol',
    ctaHref: '/parasol',
  },
}

function merge(saved: ParasolContent): ParasolContent {
  return {
    hero: { ...DEFAULT.hero, ...saved?.hero },
    models: saved?.models?.length ? saved.models : DEFAULT.models,
    features: saved?.features?.length ? saved.features : DEFAULT.features,
    premium: {
      ...DEFAULT.premium,
      ...saved?.premium,
      features: saved?.premium?.features?.length ? saved.premium.features : DEFAULT.premium.features,
    },
    quote: { ...DEFAULT.quote, ...saved?.quote },
    cta: { ...DEFAULT.cta, ...saved?.cta },
  }
}

// ─── Editor ───────────────────────────────────────────────────────────────────
export default function ParasolEditorClient({ initial }: { initial: ParasolContent }) {
  const [d, setD] = useState<ParasolContent>(() => merge(initial))
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof ParasolContent>(section: K, patch: Partial<ParasolContent[K]>) {
    setD(prev => ({ ...prev, [section]: { ...(prev[section] as object), ...(patch as object) } }))
  }

  function save() {
    startTransition(async () => {
      const res = await updateParasolContentAction(d)
      setToast(res.success ? 'success' : 'error')
      setTimeout(() => setToast(null), 3000)
    })
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#F4F6FB' }}>
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-xs mb-3 transition-opacity hover:opacity-70" style={{ color: '#6B7280' }}>
              <ArrowLeft size={12} /> Gestion du contenu
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: AMBER_BG }}>
                <Sun size={18} style={{ color: AMBER }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Parasols Premium</h1>
                <p className="text-xs" style={{ color: '#6B7280' }}>Textes et contenus de la page /parasols</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {toast && <Toast state={toast} />}
            <a href="/parasols" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
              style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
              <ExternalLink size={12} /> Aperçu
            </a>
            <button onClick={save} disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              style={{ background: AMBER, color: '#FFFFFF' }}>
              {pending ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <Save size={14} />}
              {pending ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Hero */}
        <SectionCard icon={Sun} title="Hero" description="Bannière principale en haut de la page parasols">
          <Row>
            <Field label="Titre principal"><Input value={d.hero.headline} onChange={v => set('hero', { headline: v })} placeholder="Parasols" /></Field>
            <Field label="Titre italique"><Input value={d.hero.italic} onChange={v => set('hero', { italic: v })} placeholder="Premium" /></Field>
          </Row>
          <Field label="Corps du texte"><Textarea value={d.hero.body} onChange={v => set('hero', { body: v })} rows={3} /></Field>
          <Row>
            <Field label="Libellé du bouton CTA"><Input value={d.hero.ctaLabel} onChange={v => set('hero', { ctaLabel: v })} placeholder="Configurer mon parasol" /></Field>
            <Field label="Lien du bouton CTA"><Input value={d.hero.ctaHref} onChange={v => set('hero', { ctaHref: v })} placeholder="/parasol" /></Field>
          </Row>
        </SectionCard>

        {/* Models */}
        <SectionCard icon={Layers} title="Modèles" description="Les 4 modèles de parasols (Dallas, Havana, Ibiza, Mauris)">
          <div className="space-y-4">
            {d.models.map((m, i) => (
              <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Modèle {i + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => { if (i === 0) return; const a = [...d.models]; [a[i], a[i-1]] = [a[i-1], a[i]]; setD(p => ({ ...p, models: a })) }} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30"><ChevronUp size={12} style={S.muted} /></button>
                    <button type="button" onClick={() => { if (i === d.models.length - 1) return; const a = [...d.models]; [a[i], a[i+1]] = [a[i+1], a[i]]; setD(p => ({ ...p, models: a })) }} disabled={i === d.models.length - 1} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30"><ChevronDown size={12} style={S.muted} /></button>
                    <button type="button" onClick={() => setD(p => ({ ...p, models: p.models.filter((_, j) => j !== i) }))} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
                  </div>
                </div>
                <Row>
                  <Field label="Nom"><Input value={m.name} onChange={v => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, name: v } : x) }))} placeholder="Dallas" /></Field>
                  <Field label="Accroche"><Input value={m.tagline} onChange={v => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, tagline: v } : x) }))} placeholder="Compact & Fonctionnel" /></Field>
                </Row>
                <Field label="Description"><Textarea value={m.desc} onChange={v => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, desc: v } : x) }))} rows={2} /></Field>
                <Field label="Image (chemin /public)" hint="ex: /dallas.webp"><Input value={m.img} onChange={v => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, img: v } : x) }))} placeholder="/dallas.webp" /></Field>
              </div>
            ))}
            <button type="button" onClick={() => setD(p => ({ ...p, models: [...p.models, { name: '', tagline: '', desc: '', img: '' }] }))}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{ background: AMBER_BG, color: AMBER, border: `1px solid #FDE68A` }}>
              <Plus size={12} /> Ajouter un modèle
            </button>
          </div>
        </SectionCard>

        {/* Features */}
        <SectionCard icon={Star} title="Caractéristiques" description="Grille de fonctionnalités produit (fond sombre)">
          <div className="space-y-4">
            {d.features.map((f, i) => (
              <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Fonctionnalité {i + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => { if (i === 0) return; const a = [...d.features]; [a[i], a[i-1]] = [a[i-1], a[i]]; setD(p => ({ ...p, features: a })) }} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30"><ChevronUp size={12} style={S.muted} /></button>
                    <button type="button" onClick={() => { if (i === d.features.length - 1) return; const a = [...d.features]; [a[i], a[i+1]] = [a[i+1], a[i]]; setD(p => ({ ...p, features: a })) }} disabled={i === d.features.length - 1} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30"><ChevronDown size={12} style={S.muted} /></button>
                    <button type="button" onClick={() => setD(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
                  </div>
                </div>
                <Field label="Titre"><Input value={f.title} onChange={v => setD(p => ({ ...p, features: p.features.map((x, j) => j === i ? { ...x, title: v } : x) }))} /></Field>
                <Field label="Description"><Textarea value={f.body} onChange={v => setD(p => ({ ...p, features: p.features.map((x, j) => j === i ? { ...x, body: v } : x) }))} rows={2} /></Field>
              </div>
            ))}
            <button type="button" onClick={() => setD(p => ({ ...p, features: [...p.features, { title: '', body: '' }] }))}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{ background: AMBER_BG, color: AMBER, border: `1px solid #FDE68A` }}>
              <Plus size={12} /> Ajouter une fonctionnalité
            </button>
          </div>
        </SectionCard>

        {/* Premium */}
        <SectionCard icon={Layers} title="Qualité & Durabilité" description="Section éditoriale bicolonne (fond sombre)">
          <Row>
            <Field label="Titre principal"><Input value={d.premium.headline} onChange={v => set('premium', { headline: v })} placeholder="Conçu pour durer," /></Field>
            <Field label="Titre italique"><Input value={d.premium.italic} onChange={v => set('premium', { italic: v })} placeholder="pensé pour plaire" /></Field>
          </Row>
          <Field label="Paragraphe 1"><Textarea value={d.premium.paragraph1} onChange={v => set('premium', { paragraph1: v })} rows={4} /></Field>
          <Field label="Paragraphe 2"><Textarea value={d.premium.paragraph2} onChange={v => set('premium', { paragraph2: v })} rows={4} /></Field>
          <Field label="Liste de points">
            <div className="space-y-2">
              {d.premium.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={feat} onChange={v => setD(p => ({ ...p, premium: { ...p.premium, features: p.premium.features.map((x, j) => j === i ? v : x) } }))} placeholder="Caractéristique…" />
                  <button type="button" onClick={() => { if (i === 0) return; const a = [...d.premium.features]; [a[i], a[i-1]] = [a[i-1], a[i]]; setD(p => ({ ...p, premium: { ...p.premium, features: a } })) }} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={12} style={S.muted} /></button>
                  <button type="button" onClick={() => { if (i === d.premium.features.length - 1) return; const a = [...d.premium.features]; [a[i], a[i+1]] = [a[i+1], a[i]]; setD(p => ({ ...p, premium: { ...p.premium, features: a } })) }} disabled={i === d.premium.features.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={12} style={S.muted} /></button>
                  <button type="button" onClick={() => setD(p => ({ ...p, premium: { ...p.premium, features: p.premium.features.filter((_, j) => j !== i) } }))} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setD(p => ({ ...p, premium: { ...p.premium, features: [...p.premium.features, ''] } }))}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
                style={{ background: AMBER_BG, color: AMBER, border: `1px solid #FDE68A` }}>
                <Plus size={12} /> Ajouter un point
              </button>
            </div>
          </Field>
        </SectionCard>

        {/* Quote */}
        <SectionCard icon={Star} title="Citation" description="Bloc citation sur image pleine largeur">
          <Field label="Texte principal" hint="Première ligne de la citation (couleur blanche)">
            <Textarea value={d.quote.text} onChange={v => set('quote', { text: v })} rows={2} placeholder="L'ombre n'est pas un luxe." />
          </Field>
          <Field label="Accentuation dorée" hint="Deuxième ligne en italique doré">
            <Input value={d.quote.accent} onChange={v => set('quote', { accent: v })} placeholder="C'est une signature." />
          </Field>
        </SectionCard>

        {/* CTA */}
        <SectionCard icon={Sun} title="Bannière CTA" description="Section d'appel à l'action en bas de page">
          <Row>
            <Field label="Titre principal"><Input value={d.cta.headline} onChange={v => set('cta', { headline: v })} placeholder="Donnez de l'ombre" /></Field>
            <Field label="Titre italique (doré)"><Input value={d.cta.italic} onChange={v => set('cta', { italic: v })} placeholder="à votre projet." /></Field>
          </Row>
          <Field label="Paragraphe"><Textarea value={d.cta.body} onChange={v => set('cta', { body: v })} rows={3} /></Field>
          <Row>
            <Field label="Libellé du bouton"><Input value={d.cta.ctaLabel} onChange={v => set('cta', { ctaLabel: v })} /></Field>
            <Field label="Lien du bouton"><Input value={d.cta.ctaHref} onChange={v => set('cta', { ctaHref: v })} placeholder="/parasol" /></Field>
          </Row>
        </SectionCard>

        {/* Bottom save */}
        <div className="flex justify-end gap-3 pb-4">
          {toast && <Toast state={toast} />}
          <button onClick={save} disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
            style={{ background: AMBER, color: '#FFFFFF' }}>
            {pending ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <Save size={14} />}
            {pending ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
          </button>
        </div>

      </div>
    </div>
  )
}
