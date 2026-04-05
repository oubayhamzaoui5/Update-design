'use client'

import { useState, useTransition } from 'react'
import { updateStoreBrasContentAction } from '../actions'
import type { StoreBrasContent } from '@/types/site-content'
import {
  Wind, Zap, Layers, Save, Check, AlertCircle, Plus, Trash2,
  ChevronUp, ChevronDown, ExternalLink, ArrowLeft, Star,
} from 'lucide-react'
import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  input: { borderColor: '#E5E7EB', background: '#FAFAFA', color: '#111827' },
  card:  { background: '#FFFFFF', border: '1px solid #E8EAED', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  muted: { color: '#6B7280' },
  label: { color: '#374151' },
}
const TEAL = '#0F766E'
const TEAL_BG = '#F0FDFA'

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
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-200"
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
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-200"
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: TEAL_BG }}>
          <Icon size={16} style={{ color: TEAL }} />
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
const DEFAULT: StoreBrasContent = {
  hero: {
    headline: 'Store à Bras',
    italic: 'Invisibles',
    body: "Le store qui disparaît. Bras articulés entièrement escamotables dans un caisson discret — protection maximale le jour, façade parfaite la nuit.",
    ctaLabel: 'Configurer mon store',
    ctaHref: '/tinda',
  },
  models: [
    { name: 'Pragua', desc: 'Conception classique, robuste et polyvalente pour tous types de façades.', img: '/store/pragua-droit.webp', recommended: false },
    { name: 'Valancia', desc: 'Design épuré avec mécanisme à manivelle intégrée, finition premium.', img: '/store/valancia-droit.webp', recommended: true },
  ],
  premium: {
    headline: 'Conçu pour durer,',
    italic: 'pensé pour disparaître',
    paragraph1: "Nos stores à bras invisibles sont fabriqués avec des profilés aluminium thermolaqué résistants à la corrosion, au vent et à la chaleur du climat tunisien. Rien ne rouille, rien ne se déforme.",
    paragraph2: "La toile Sunbrella® — tissu acrylique haute performance — bloque jusqu'à 95 % des rayons UV, résiste à la pluie fine et conserve son éclat des années durant. 34 coloris disponibles, tous coordonnables à vos finitions intérieures et extérieures.",
    features: [
      'Structure aluminium thermolaqué — résistant à la corrosion et aux intempéries',
      'Toiles Sunbrella® acrylique — 34 coloris, résistance UV et pluie garantie',
      'Bras articulés entièrement escamotables dans le caisson',
      'Motorisation Somfy silencieuse — télécommande, murale ou application mobile',
      'Capteur vent & pluie disponible en option',
      "Fabrication sur mesure — largeurs jusqu'à 8 m",
      'Installation professionnelle partout en Tunisie',
    ],
  },
  features: [
    { title: 'Bras Escamotables', body: "Les bras articulés se rétractent entièrement dans le caisson. Façade intacte, esthétique préservée — même fermé." },
    { title: 'Motorisation Somfy', body: "Moteur Somfy ou Nice silencieux. Commande murale, télécommande ou application mobile. Automatisation crépusculaire disponible." },
    { title: 'Structure Aluminium', body: "Profilés aluminium thermolaqué résistants à la corrosion, au vent et à la chaleur. Adapté au climat tunisien." },
    { title: '34 Coloris Sunbrella®', body: "Tissu acrylique haute performance — imperméable, anti-moisissures, résistant aux UV. Coordonnable à toutes vos finitions." },
    { title: 'Lambrequin Sur Mesure', body: "Trois finitions disponibles : sans lambrequin, droit 30 cm ou vagues 30 cm. Option impression logo incluse." },
    { title: 'Fabrication Sur Mesure', body: "Chaque store est fabriqué selon les cotes exactes de votre projet. Largeurs jusqu'à 8 m, profondeur jusqu'à 4 m." },
  ],
  applications: {
    headline: 'Pour quels\nprojets ?',
    description: 'Installés dans toute la Tunisie — du Grand Tunis aux zones touristiques côtières.',
    items: [
      'Hôtels & Résidences Hôtelières',
      'Restaurants & Cafés',
      'Immeubles & Copropriétés',
      'Villas & Maisons Individuelles',
      'Bureaux & Commerces',
    ],
  },
  cta: {
    headline: 'Prêt à habiller',
    italic: 'votre façade ?',
    body: "Modèle, dimensions, coloris, options — configurez votre store et recevez un devis sous 24 h.",
    ctaLabel: 'Configurer mon store',
    ctaHref: '/tinda',
  },
}

function merge(saved: StoreBrasContent): StoreBrasContent {
  return {
    hero: { ...DEFAULT.hero, ...saved?.hero },
    models: saved?.models?.length ? saved.models : DEFAULT.models,
    premium: {
      ...DEFAULT.premium,
      ...saved?.premium,
      features: saved?.premium?.features?.length ? saved.premium.features : DEFAULT.premium.features,
    },
    features: saved?.features?.length ? saved.features : DEFAULT.features,
    applications: {
      ...DEFAULT.applications,
      ...saved?.applications,
      items: saved?.applications?.items?.length ? saved.applications.items : DEFAULT.applications.items,
    },
    cta: { ...DEFAULT.cta, ...saved?.cta },
  }
}

// ─── Editor ───────────────────────────────────────────────────────────────────
export default function StoreBrasEditorClient({ initial }: { initial: StoreBrasContent }) {
  const [d, setD] = useState<StoreBrasContent>(() => merge(initial))
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof StoreBrasContent>(section: K, patch: Partial<StoreBrasContent[K]>) {
    setD(prev => ({ ...prev, [section]: { ...(prev[section] as object), ...(patch as object) } }))
  }

  function save() {
    startTransition(async () => {
      const res = await updateStoreBrasContentAction(d)
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: TEAL_BG }}>
                <Wind size={18} style={{ color: TEAL }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Store à Bras Invisibles</h1>
                <p className="text-xs" style={{ color: '#6B7280' }}>Textes et contenus de la page /store-bras</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {toast && <Toast state={toast} />}
            <a href="/store-bras" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
              style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
              <ExternalLink size={12} /> Aperçu
            </a>
            <button onClick={save} disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              style={{ background: TEAL, color: '#FFFFFF' }}>
              {pending ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <Save size={14} />}
              {pending ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Hero */}
        <SectionCard icon={Wind} title="Hero" description="Bannière principale en haut de la page">
          <Row>
            <Field label="Titre (1ère ligne)"><Input value={d.hero.headline} onChange={v => set('hero', { headline: v })} placeholder="Store à Bras" /></Field>
            <Field label="Titre italique (2e ligne)"><Input value={d.hero.italic} onChange={v => set('hero', { italic: v })} placeholder="Invisibles" /></Field>
          </Row>
          <Field label="Corps du texte"><Textarea value={d.hero.body} onChange={v => set('hero', { body: v })} rows={3} /></Field>
          <Row>
            <Field label="Libellé du bouton CTA"><Input value={d.hero.ctaLabel} onChange={v => set('hero', { ctaLabel: v })} placeholder="Configurer mon store" /></Field>
            <Field label="Lien du bouton CTA"><Input value={d.hero.ctaHref} onChange={v => set('hero', { ctaHref: v })} placeholder="/tinda" /></Field>
          </Row>
        </SectionCard>

        {/* Models */}
        <SectionCard icon={Star} title="Modèles" description="Les stores Pragua et Valancia">
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
                  <Field label="Nom"><Input value={m.name} onChange={v => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, name: v } : x) }))} placeholder="Pragua" /></Field>
                  <Field label="Image (chemin /public)" hint="ex: /store/pragua-droit.webp"><Input value={m.img} onChange={v => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, img: v } : x) }))} placeholder="/store/pragua-droit.webp" /></Field>
                </Row>
                <Field label="Description"><Textarea value={m.desc} onChange={v => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, desc: v } : x) }))} rows={2} /></Field>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`recommended-${i}`} checked={!!m.recommended}
                    onChange={e => setD(p => ({ ...p, models: p.models.map((x, j) => j === i ? { ...x, recommended: e.target.checked } : x) }))}
                    className="h-4 w-4 rounded" />
                  <label htmlFor={`recommended-${i}`} className="text-xs font-medium" style={{ color: '#374151' }}>Afficher le badge &ldquo;Recommandé&rdquo;</label>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setD(p => ({ ...p, models: [...p.models, { name: '', desc: '', img: '', recommended: false }] }))}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{ background: TEAL_BG, color: TEAL, border: `1px solid #99F6E4` }}>
              <Plus size={12} /> Ajouter un modèle
            </button>
          </div>
        </SectionCard>

        {/* Premium */}
        <SectionCard icon={Layers} title="Qualité & Durabilité" description="Section éditoriale bicolonne (fond sombre)">
          <Row>
            <Field label="Titre principal"><Input value={d.premium.headline} onChange={v => set('premium', { headline: v })} placeholder="Conçu pour durer," /></Field>
            <Field label="Titre italique"><Input value={d.premium.italic} onChange={v => set('premium', { italic: v })} placeholder="pensé pour disparaître" /></Field>
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
                style={{ background: TEAL_BG, color: TEAL, border: `1px solid #99F6E4` }}>
                <Plus size={12} /> Ajouter un point
              </button>
            </div>
          </Field>
        </SectionCard>

        {/* Features */}
        <SectionCard icon={Zap} title="Caractéristiques" description="Grille de 6 fonctionnalités produit (fond sombre)">
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
              style={{ background: TEAL_BG, color: TEAL, border: `1px solid #99F6E4` }}>
              <Plus size={12} /> Ajouter une fonctionnalité
            </button>
          </div>
        </SectionCard>

        {/* Applications */}
        <SectionCard icon={Layers} title="Applications" description="Section liste des types de projets">
          <Row>
            <Field label="Titre" hint="Utilisez \n pour un saut de ligne"><Input value={d.applications.headline} onChange={v => set('applications', { headline: v })} placeholder="Pour quels\nprojets ?" /></Field>
            <Field label="Description"><Textarea value={d.applications.description} onChange={v => set('applications', { description: v })} rows={2} /></Field>
          </Row>
          <Field label="Éléments de la liste">
            <div className="space-y-2">
              {d.applications.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={item} onChange={v => setD(p => ({ ...p, applications: { ...p.applications, items: p.applications.items.map((x, j) => j === i ? v : x) } }))} placeholder="Type de projet…" />
                  <button type="button" onClick={() => { if (i === 0) return; const a = [...d.applications.items]; [a[i], a[i-1]] = [a[i-1], a[i]]; setD(p => ({ ...p, applications: { ...p.applications, items: a } })) }} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={12} style={S.muted} /></button>
                  <button type="button" onClick={() => { if (i === d.applications.items.length - 1) return; const a = [...d.applications.items]; [a[i], a[i+1]] = [a[i+1], a[i]]; setD(p => ({ ...p, applications: { ...p.applications, items: a } })) }} disabled={i === d.applications.items.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={12} style={S.muted} /></button>
                  <button type="button" onClick={() => setD(p => ({ ...p, applications: { ...p.applications, items: p.applications.items.filter((_, j) => j !== i) } }))} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setD(p => ({ ...p, applications: { ...p.applications, items: [...p.applications.items, ''] } }))}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
                style={{ background: TEAL_BG, color: TEAL, border: `1px solid #99F6E4` }}>
                <Plus size={12} /> Ajouter une application
              </button>
            </div>
          </Field>
        </SectionCard>

        {/* CTA */}
        <SectionCard icon={Zap} title="Bannière CTA" description="Section d'appel à l'action en bas de page (fond sombre)">
          <Row>
            <Field label="Titre principal"><Input value={d.cta.headline} onChange={v => set('cta', { headline: v })} placeholder="Prêt à habiller" /></Field>
            <Field label="Titre italique (dorée)"><Input value={d.cta.italic} onChange={v => set('cta', { italic: v })} placeholder="votre façade ?" /></Field>
          </Row>
          <Field label="Paragraphe"><Textarea value={d.cta.body} onChange={v => set('cta', { body: v })} rows={3} /></Field>
          <Row>
            <Field label="Libellé du bouton"><Input value={d.cta.ctaLabel} onChange={v => set('cta', { ctaLabel: v })} /></Field>
            <Field label="Lien du bouton"><Input value={d.cta.ctaHref} onChange={v => set('cta', { ctaHref: v })} placeholder="/tinda" /></Field>
          </Row>
        </SectionCard>

        {/* Bottom save */}
        <div className="flex justify-end gap-3 pb-4">
          {toast && <Toast state={toast} />}
          <button onClick={save} disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
            style={{ background: TEAL, color: '#FFFFFF' }}>
            {pending ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <Save size={14} />}
            {pending ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
          </button>
        </div>

      </div>
    </div>
  )
}
