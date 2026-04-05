'use client'

import { useState, useTransition } from 'react'
import { updateAboutContentAction } from '../actions'
import { uploadImageAction } from '../upload-image'
import type { AboutContent, StatItem } from '@/types/site-content'
import {
  ImageIcon as LucideImage, Quote, Star, Users, Megaphone, BarChart3, BookOpen,
  Plus, Trash2, ChevronUp, ChevronDown,
  Save, Check, AlertCircle, ExternalLink, Upload,
} from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  input:  { borderColor: '#E5E7EB', background: '#FAFAFA', color: '#111827' },
  card:   { background: '#FFFFFF', border: '1px solid #E8EAED', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  muted:  { color: '#6B7280' },
  label:  { color: '#374151' },
}
const GREEN = '#059669'
const GREEN_BG = '#ECFDF5'

// ─── Primitives ───────────────────────────────────────────────────────────────
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-xs font-semibold" style={S.label}>{children}</label>
      {hint && <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string
}) {
  return (
    <input
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-200 ${className}`}
      style={S.input}
      value={value}
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
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-200"
      style={{ ...S.input, resize: 'vertical' }}
      value={value}
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

function SectionTitle({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description: string
}) {
  return (
    <div className="flex items-start gap-3 pb-5 mb-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: GREEN_BG }}>
        <Icon size={16} style={{ color: GREEN }} />
      </div>
      <div>
        <h2 className="text-sm font-bold" style={{ color: '#111827' }}>{title}</h2>
        <p className="text-xs mt-0.5" style={S.muted}>{description}</p>
      </div>
    </div>
  )
}

// ─── Image upload field ───────────────────────────────────────────────────────
function ImageField({ label, hint, value, onChange, folder }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; folder: string
}) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await uploadImageAction(fd)
    setUploading(false)
    if (res.success && res.url) onChange(res.url)
    else setErr(res.error ?? 'Erreur upload.')
    e.target.value = ''
  }

  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ width: 88, height: 66, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
          {value
            ? <img src={value} alt="" className="w-full h-full object-cover" />
            : <LucideImage size={22} style={{ color: '#D1D5DB' }} />}
        </div>
        <div className="flex-1 space-y-2">
          <Input value={value} onChange={onChange} placeholder="/about/image.jpg" />
          <label className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{ background: uploading ? '#F9FAFB' : GREEN_BG, color: uploading ? '#9CA3AF' : GREEN, border: `1px solid ${uploading ? '#E5E7EB' : '#A7F3D0'}` }}>
            {uploading ? (
              <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg> Upload…</>
            ) : (
              <><Upload size={12} /> Choisir une image</>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
          </label>
          {err && <p className="text-xs" style={{ color: '#EF4444' }}>{err}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Toast & Save ─────────────────────────────────────────────────────────────
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

function SaveBtn({ loading }: { loading: boolean }) {
  return (
    <button type="button" disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
      style={{ background: GREEN, color: '#FFFFFF' }}>
      {loading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <Save size={14} />}
      {loading ? 'Sauvegarde…' : 'Sauvegarder'}
    </button>
  )
}

// ─── Checklist editor ─────────────────────────────────────────────────────────
function Checklist({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const arr = [...items];
    [arr[i], arr[j]] = [arr[j], arr[i]]
    onChange(arr)
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={item} onChange={v => onChange(items.map((x, j) => j === i ? v : x))} placeholder="Point clé…" className="flex-1" />
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={12} style={S.muted} /></button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={12} style={S.muted} /></button>
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
        style={{ background: GREEN_BG, color: GREEN, border: `1px solid #A7F3D0` }}>
        <Plus size={12} /> Ajouter un point
      </button>
    </div>
  )
}

// ─── Values editor ────────────────────────────────────────────────────────────
function ValuesEditor({ items, onChange }: {
  items: Array<{ num: string; title: string; text: string }>
  onChange: (v: typeof items) => void
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const arr = [...items];
    [arr[i], arr[j]] = [arr[j], arr[i]]
    onChange(arr)
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Valeur {i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={12} style={S.muted} /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={12} style={S.muted} /></button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} style={{ color: '#EF4444' }} /></button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Field label="N°"><Input value={item.num} onChange={v => onChange(items.map((x, j) => j === i ? { ...x, num: v } : x))} placeholder="01" /></Field>
            <div className="col-span-3"><Field label="Titre"><Input value={item.title} onChange={v => onChange(items.map((x, j) => j === i ? { ...x, title: v } : x))} /></Field></div>
          </div>
          <Field label="Description"><Textarea value={item.text} onChange={v => onChange(items.map((x, j) => j === i ? { ...x, text: v } : x))} rows={2} /></Field>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { num: String(items.length + 1).padStart(2, '0'), title: '', text: '' }])}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
        style={{ background: GREEN_BG, color: GREEN, border: `1px solid #A7F3D0` }}>
        <Plus size={12} /> Ajouter une valeur
      </button>
    </div>
  )
}

// ─── Team stats editor ────────────────────────────────────────────────────────
function TeamStats({ stats, onChange }: { stats: Array<{ v: string; l: string }>; onChange: (s: typeof stats) => void }) {
  return (
    <div className="space-y-2">
      {stats.map((stat, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 rounded-xl p-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
          <Field label="Valeur"><Input value={stat.v} onChange={v => onChange(stats.map((s, j) => j === i ? { ...s, v } : s))} placeholder="10+" /></Field>
          <Field label="Libellé"><Input value={stat.l} onChange={v => onChange(stats.map((s, j) => j === i ? { ...s, l: v } : s))} /></Field>
        </div>
      ))}
    </div>
  )
}

// ─── Section nav config ───────────────────────────────────────────────────────
type SectionId = 'hero' | 'stats' | 'story' | 'vision' | 'values' | 'team' | 'cta'

const NAV: Array<{ id: SectionId; label: string; sub: string; icon: React.ElementType; img?: boolean }> = [
  { id: 'hero',   label: 'Hero',       sub: 'Titre + image fond',      icon: LucideImage, img: true },
  { id: 'stats',  label: 'Statistiques', sub: '4 chiffres clés',       icon: BarChart3 },
  { id: 'story',  label: 'Histoire',   sub: 'Texte + checklist + img', icon: BookOpen,    img: true },
  { id: 'vision', label: 'Vision',     sub: 'Citation de marque',      icon: Quote },
  { id: 'values', label: 'Valeurs',    sub: 'Engagements + image',     icon: Star,        img: true },
  { id: 'team',   label: 'Équipe',     sub: 'Présentation + image',    icon: Users,       img: true },
  { id: 'cta',    label: 'CTA',        sub: 'Appel à l\'action final', icon: Megaphone },
]

// ─── Main component ───────────────────────────────────────────────────────────
export default function AboutEditorClient({ initial }: { initial: AboutContent }) {
  const [data, setData]       = useState<AboutContent>(initial)
  const [section, setSection] = useState<SectionId>('hero')
  const [toast, setToast]     = useState<'success' | 'error' | null>(null)
  const [isPending, startTransition] = useTransition()

  function patch<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    setData(d => ({ ...d, [key]: value }))
  }
  function patchField<K extends keyof AboutContent>(key: K, field: string, value: unknown) {
    setData(d => ({ ...d, [key]: { ...(d[key] as Record<string, unknown>), [field]: value } }))
  }

  function save() {
    startTransition(async () => {
      const result = await updateAboutContentAction(data)
      setToast(result.success ? 'success' : 'error')
      setTimeout(() => setToast(null), 3000)
    })
  }

  return (
    <div className="min-h-screen p-5 md:p-8" style={{ background: '#F4F6FB' }}>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: GREEN_BG }}>
              <Users size={16} style={{ color: GREEN }} />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: '#111827' }}>Page À Propos</h1>
              <p className="text-xs" style={S.muted}>Hero, histoire, vision, valeurs, équipe et CTA</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {toast && <Toast state={toast} />}
            <a href="/about" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold"
              style={{ background: '#FFFFFF', color: '#6B7280', border: '1px solid #E5E7EB' }}>
              <ExternalLink size={13} /> Aperçu
            </a>
            <button type="button" onClick={save} disabled={isPending}><SaveBtn loading={isPending} /></button>
          </div>
        </div>

        {/* Two-pane */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr] items-start">

          {/* Section nav */}
          <div className="rounded-2xl p-2 lg:sticky lg:top-6" style={S.card}>
            <p className="px-3 pt-2 pb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Sections</p>
            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
              {NAV.map(n => {
                const Icon = n.icon
                const isActive = section === n.id
                return (
                  <button key={n.id} type="button" onClick={() => setSection(n.id)}
                    className="flex items-center gap-3 shrink-0 rounded-xl px-3 py-2.5 transition-all text-left w-full"
                    style={{
                      background: isActive ? GREEN_BG : 'transparent',
                      borderLeft: `3px solid ${isActive ? GREEN : 'transparent'}`,
                    }}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                      style={{ background: isActive ? '#FFFFFF' : '#F3F4F6' }}>
                      <Icon size={13} style={{ color: isActive ? GREEN : '#9CA3AF' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: isActive ? '#111827' : '#6B7280' }}>{n.label}</p>
                      <p className="text-[10px] hidden lg:block" style={{ color: '#9CA3AF' }}>{n.sub}</p>
                    </div>
                    {n.img && (
                      <span className="ml-auto shrink-0 text-[9px] font-bold rounded px-1 py-0.5 hidden lg:inline"
                        style={{ background: '#FEF3C7', color: '#92400E' }}>img</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form panel */}
          <div className="rounded-2xl p-6" style={S.card}>

            {/* ── HERO ── */}
            {section === 'hero' && (
              <>
                <SectionTitle icon={LucideImage} title="Hero" description="Section plein-écran en haut de la page /about." />
                <div className="space-y-4">
                  <ImageField label="Image de fond" hint="Couvre toute la largeur de l'écran (recommandé : 1920×1080px)" value={data.hero.image} onChange={v => patchField('hero', 'image', v)} folder="about" />
                  <div className="pt-1" style={{ borderTop: '1px solid #F3F4F6' }} />
                  <Row>
                    <Field label="Accroche"><Input value={data.hero.eyebrow} onChange={v => patchField('hero', 'eyebrow', v)} /></Field>
                    <Field label="Label localisation"><Input value={data.hero.locationLabel} onChange={v => patchField('hero', 'locationLabel', v)} placeholder="Tunis, Tunisie" /></Field>
                  </Row>
                  <Field label="Titre ligne 1"><Input value={data.hero.headline} onChange={v => patchField('hero', 'headline', v)} /></Field>
                  <Row>
                    <Field label="Titre accent (or)"><Input value={data.hero.headlineAccent} onChange={v => patchField('hero', 'headlineAccent', v)} /></Field>
                    <Field label="Titre suite"><Input value={data.hero.headlineSuffix} onChange={v => patchField('hero', 'headlineSuffix', v)} /></Field>
                  </Row>
                  <Field label="Corps du texte"><Textarea value={data.hero.body} onChange={v => patchField('hero', 'body', v)} rows={3} /></Field>
                  <Row>
                    <Field label="Label CTA"><Input value={data.hero.ctaLabel} onChange={v => patchField('hero', 'ctaLabel', v)} /></Field>
                    <Field label="Lien CTA"><Input value={data.hero.ctaHref} onChange={v => patchField('hero', 'ctaHref', v)} placeholder="/shop" /></Field>
                  </Row>
                </div>
              </>
            )}

            {/* ── STATS ── */}
            {section === 'stats' && (
              <>
                <SectionTitle icon={BarChart3} title="Statistiques" description="4 chiffres clés affichés dans la barre sous le hero." />
                <div className="space-y-3">
                  {data.stats.map((stat, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Statistique {i + 1}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Valeur"><Input value={stat.value} onChange={v => patch('stats', data.stats.map((s, j) => j === i ? { ...s, value: v } : s))} placeholder="500" /></Field>
                        <Field label="Suffixe"><Input value={stat.suffix} onChange={v => patch('stats', data.stats.map((s, j) => j === i ? { ...s, suffix: v } : s))} placeholder="+" /></Field>
                        <Field label="Libellé"><Input value={stat.label} onChange={v => patch('stats', data.stats.map((s, j) => j === i ? { ...s, label: v } : s))} placeholder="Références" /></Field>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── HISTOIRE ── */}
            {section === 'story' && (
              <>
                <SectionTitle icon={BookOpen} title="Section Histoire" description="Bloc deux colonnes : image à gauche, texte à droite." />
                <div className="space-y-4">
                  <ImageField label="Image showroom" hint="Affichée à gauche de la section (recommandé : 800×600px)" value={data.story.image} onChange={v => patchField('story', 'image', v)} folder="about" />
                  <div className="pt-1" style={{ borderTop: '1px solid #F3F4F6' }} />
                  <Row>
                    <Field label="Accroche"><Input value={data.story.eyebrow} onChange={v => patchField('story', 'eyebrow', v)} /></Field>
                    <Field label="Titre accent (or)"><Input value={data.story.headlineAccent} onChange={v => patchField('story', 'headlineAccent', v)} /></Field>
                  </Row>
                  <Field label="Titre principal"><Input value={data.story.headline} onChange={v => patchField('story', 'headline', v)} /></Field>
                  <Field label="Paragraphe 1"><Textarea value={data.story.paragraph1} onChange={v => patchField('story', 'paragraph1', v)} rows={3} /></Field>
                  <Field label="Paragraphe 2"><Textarea value={data.story.paragraph2} onChange={v => patchField('story', 'paragraph2', v)} rows={3} /></Field>
                  <div>
                    <Label>Points clés (checklist)</Label>
                    <Checklist items={data.story.checklist} onChange={v => patchField('story', 'checklist', v)} />
                  </div>
                </div>
              </>
            )}

            {/* ── VISION ── */}
            {section === 'vision' && (
              <>
                <SectionTitle icon={Quote} title="Citation Vision" description="Section fond sombre avec grande citation de marque." />
                <div className="space-y-4">
                  <Field label="Accroche"><Input value={data.vision.eyebrow} onChange={v => patchField('vision', 'eyebrow', v)} /></Field>
                  <Field label="Début de la citation"><Textarea value={data.vision.quote} onChange={v => patchField('vision', 'quote', v)} rows={2} /></Field>
                  <Row>
                    <Field label="Accent (mis en or)"><Input value={data.vision.quoteAccent} onChange={v => patchField('vision', 'quoteAccent', v)} /></Field>
                    <Field label="Suite de la citation"><Input value={data.vision.quoteSuffix} onChange={v => patchField('vision', 'quoteSuffix', v)} /></Field>
                  </Row>
                  <Field label="Attribution"><Input value={data.vision.attribution} onChange={v => patchField('vision', 'attribution', v)} placeholder="— Fondateur, Update Design" /></Field>
                </div>
              </>
            )}

            {/* ── VALEURS ── */}
            {section === 'values' && (
              <>
                <SectionTitle icon={Star} title="Nos Valeurs" description="Image à gauche + liste numérotée des engagements." />
                <div className="space-y-4">
                  <ImageField label="Image engagements" hint="Affichée à gauche de la liste (recommandé : format portrait 600×800px)" value={data.values.image} onChange={v => patchField('values', 'image', v)} folder="about" />
                  <div className="pt-1" style={{ borderTop: '1px solid #F3F4F6' }} />
                  <Row>
                    <Field label="Accroche"><Input value={data.values.eyebrow} onChange={v => patchField('values', 'eyebrow', v)} /></Field>
                    <Field label="Titre accent"><Input value={data.values.headlineAccent} onChange={v => patchField('values', 'headlineAccent', v)} /></Field>
                  </Row>
                  <Field label="Titre principal"><Input value={data.values.headline} onChange={v => patchField('values', 'headline', v)} /></Field>
                  <div>
                    <Label>Items de valeurs</Label>
                    <ValuesEditor items={data.values.items} onChange={v => patchField('values', 'items', v)} />
                  </div>
                </div>
              </>
            )}

            {/* ── ÉQUIPE ── */}
            {section === 'team' && (
              <>
                <SectionTitle icon={Users} title="Section Équipe" description="Deux colonnes : message d'équipe + photo." />
                <div className="space-y-4">
                  <ImageField label="Photo d'équipe" hint="Affichée à gauche de la section — recommandé : 800×600 px (4:3) ou 960×540 px (16:9), PNG ou WebP." value={data.team.image} onChange={v => patchField('team', 'image', v)} folder="about" />
                  <div className="pt-1" style={{ borderTop: '1px solid #F3F4F6' }} />
                  <Row>
                    <Field label="Accroche"><Input value={data.team.eyebrow} onChange={v => patchField('team', 'eyebrow', v)} /></Field>
                    <Field label="Titre accent"><Input value={data.team.headlineAccent} onChange={v => patchField('team', 'headlineAccent', v)} /></Field>
                  </Row>
                  <Field label="Titre principal"><Input value={data.team.headline} onChange={v => patchField('team', 'headline', v)} /></Field>
                  <Field label="Paragraphe 1"><Textarea value={data.team.paragraph1} onChange={v => patchField('team', 'paragraph1', v)} rows={3} /></Field>
                  <Field label="Paragraphe 2"><Textarea value={data.team.paragraph2} onChange={v => patchField('team', 'paragraph2', v)} rows={3} /></Field>
                  <div>
                    <Label hint="Affichés sous les paragraphes">Statistiques équipe</Label>
                    <TeamStats stats={data.team.stats} onChange={v => patchField('team', 'stats', v)} />
                  </div>
                </div>
              </>
            )}

            {/* ── CTA ── */}
            {section === 'cta' && (
              <>
                <SectionTitle icon={Megaphone} title="Call-to-Action final" description="Section de clôture avec deux boutons d'action." />
                <div className="space-y-4">
                  <Row>
                    <Field label="Accroche"><Input value={data.cta.eyebrow} onChange={v => patchField('cta', 'eyebrow', v)} /></Field>
                    <Field label="Titre accent"><Input value={data.cta.headlineAccent} onChange={v => patchField('cta', 'headlineAccent', v)} /></Field>
                  </Row>
                  <Field label="Titre principal"><Input value={data.cta.headline} onChange={v => patchField('cta', 'headline', v)} /></Field>
                  <Field label="Corps du texte"><Textarea value={data.cta.body} onChange={v => patchField('cta', 'body', v)} rows={3} /></Field>
                  <div className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Bouton principal</p>
                    <Row>
                      <Field label="Texte"><Input value={data.cta.primaryLabel} onChange={v => patchField('cta', 'primaryLabel', v)} /></Field>
                      <Field label="Lien"><Input value={data.cta.primaryHref} onChange={v => patchField('cta', 'primaryHref', v)} placeholder="/shop" /></Field>
                    </Row>
                  </div>
                  <div className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Bouton secondaire</p>
                    <Row>
                      <Field label="Texte"><Input value={data.cta.secondaryLabel} onChange={v => patchField('cta', 'secondaryLabel', v)} /></Field>
                      <Field label="Lien"><Input value={data.cta.secondaryHref} onChange={v => patchField('cta', 'secondaryHref', v)} placeholder="/contact" /></Field>
                    </Row>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end mt-5 gap-2.5 items-center">
          {toast && <Toast state={toast} />}
          <button type="button" onClick={save} disabled={isPending}><SaveBtn loading={isPending} /></button>
        </div>

      </div>
    </div>
  )
}
