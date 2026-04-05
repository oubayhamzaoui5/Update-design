'use client'

import { useState, useTransition } from 'react'
import { updateHomepageContentAction } from '../actions'
import { uploadImageAction } from '../upload-image'
import type { HomepageContent, StatItem, FaqItem, Subject, HeroSlide } from '@/types/site-content'
import {
  BarChart3, BookOpen, MessageSquare, Phone, Layers,
  Plus, Trash2, ChevronUp, ChevronDown,
  Save, Check, AlertCircle, ExternalLink,
  ImageIcon, Upload, Home,
} from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  input:  { borderColor: '#E5E7EB', background: '#FAFAFA', color: '#111827' },
  card:   { background: '#FFFFFF', border: '1px solid #E8EAED', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  muted:  { color: '#6B7280' },
  label:  { color: '#374151' },
}

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
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-200 ${className}`}
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
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-200"
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

function SectionTitle({ icon: Icon, color, bg, title, description }: {
  icon: React.ElementType; color: string; bg: string; title: string; description: string
}) {
  return (
    <div className="flex items-start gap-3 pb-5 mb-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: bg }}>
        <Icon size={16} style={{ color }} />
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
        <div
          className="shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ width: 88, height: 66, background: '#F3F4F6', border: '1px solid #E5E7EB' }}
        >
          {value
            ? <img src={value} alt="" className="w-full h-full object-cover" />
            : <ImageIcon size={22} style={{ color: '#D1D5DB' }} />}
        </div>
        <div className="flex-1 space-y-2">
          <Input value={value} onChange={onChange} placeholder="/hero/image.png" />
          <label
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{
              background: uploading ? '#F9FAFB' : '#EEF2FF',
              color: uploading ? '#9CA3AF' : '#4F46E5',
              border: '1px solid #C7D2FE',
            }}
          >
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

// ─── Slide image field (compact, inline with title) ───────────────────────────
function SlideImageField({ value, onChange, folder }: {
  value: string; onChange: (v: string) => void; folder: string
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 40, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
          {value
            ? <img src={value} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} style={{ color: '#D1D5DB' }} /></div>}
        </div>
        <div className="flex-1">
          <Input value={value} onChange={onChange} placeholder="/hero/image.png" />
        </div>
        <label className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold cursor-pointer transition-colors"
          style={{ background: uploading ? '#F9FAFB' : '#EEF2FF', color: uploading ? '#9CA3AF' : '#4F46E5', border: '1px solid #C7D2FE' }}>
          {uploading
            ? <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            : <Upload size={12} />}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {err && <p className="text-xs" style={{ color: '#EF4444' }}>{err}</p>}
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
      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60"
      style={{ background: '#4F46E5', color: '#FFFFFF' }}>
      {loading
        ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
        : <Save size={14} />}
      {loading ? 'Sauvegarde…' : 'Sauvegarder'}
    </button>
  )
}

// ─── Section nav config ───────────────────────────────────────────────────────
type SectionId = 'hero' | 'stats' | 'about' | 'faq' | 'contact'

const NAV: Array<{ id: SectionId; label: string; sub: string; icon: React.ElementType; color: string; bg: string; img?: boolean }> = [
  { id: 'hero',    label: 'Hero',            sub: 'Carrousel + CTA',       icon: Layers,        color: '#4F46E5', bg: '#EEF2FF', img: true },
  { id: 'stats',   label: 'Statistiques',    sub: '3 chiffres clés',       icon: BarChart3,     color: '#0891B2', bg: '#ECFEFF' },
  { id: 'about',   label: 'Section Histoire', sub: 'Textes + image',        icon: BookOpen,      color: '#059669', bg: '#ECFDF5', img: true },
  { id: 'faq',     label: 'FAQ',             sub: 'Questions / réponses',   icon: MessageSquare, color: '#D97706', bg: '#FFFBEB' },
  { id: 'contact', label: 'Contact',         sub: 'Infos & sujets',         icon: Phone,         color: '#7C3AED', bg: '#F5F3FF' },
]

// ─── Content sections ─────────────────────────────────────────────────────────

function HeroSection({ data, onChange }: { data: HomepageContent; onChange: (d: HomepageContent) => void }) {
  const hero = data.hero
  const setHero = (h: HomepageContent['hero']) => onChange({ ...data, hero: h })
  const setSlides = (slides: HeroSlide[]) => setHero({ ...hero, slides })

  const updateSlide = (i: number, field: keyof HeroSlide, v: string) =>
    setSlides(hero.slides.map((s, j) => j === i ? { ...s, [field]: v } : s))

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= hero.slides.length) return
    const arr = [...hero.slides];
    [arr[i], arr[j]] = [arr[j], arr[i]]
    setSlides(arr)
  }

  const remove = (i: number) => setSlides(hero.slides.filter((_, j) => j !== i))
  const add    = () => setSlides([...hero.slides, { id: `slide-${Date.now()}`, title: '', image: '' }])

  return (
    <>
      <SectionTitle icon={Layers} color="#4F46E5" bg="#EEF2FF"
        title="Hero — Carrousel"
        description="Diaporama plein-écran en haut de la page d'accueil." />

      {/* Slides */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
          Slides ({hero.slides.length})
        </p>
        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
          Résolution recommandée : <span className="font-semibold" style={{ color: '#6B7280' }}>1920 × 1080 px</span> (16:9, paysage)
        </p>
      </div>

      <div className="space-y-3">
        {hero.slides.map((slide, i) => (
          <div key={slide.id} className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Slide {i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={13} style={S.muted} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === hero.slides.length - 1}
                  className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={13} style={S.muted} /></button>
                <button type="button" onClick={() => remove(i)}
                  className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={13} style={{ color: '#EF4444' }} /></button>
              </div>
            </div>

            <Field label="Titre du slide" hint="Affiché dans l'aria-label pour l'accessibilité">
              <Input value={slide.title} onChange={v => updateSlide(i, 'title', v)} placeholder="Gazon Artificiel" />
            </Field>

            <Field label="Image" hint="Paysage 16:9 — recommandé : 1920×1080 px ou 1600×900 px. Format PNG ou WebP.">
              <SlideImageField
                value={slide.image}
                onChange={v => updateSlide(i, 'image', v)}
                folder="hero"
              />
            </Field>
          </div>
        ))}
      </div>

      <button type="button" onClick={add}
        className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
        style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}>
        <Plus size={13} /> Ajouter un slide
      </button>
    </>
  )
}

function StatsSection({ data, onChange }: { data: HomepageContent; onChange: (d: HomepageContent) => void }) {
  const update = (i: number, k: keyof StatItem, v: string) =>
    onChange({ ...data, stats: data.stats.map((s, j) => j === i ? { ...s, [k]: v } : s) })
  return (
    <>
      <SectionTitle icon={BarChart3} color="#0891B2" bg="#ECFEFF" title="Statistiques" description="3 chiffres clés dans la barre sous le hero." />
      <div className="space-y-3">
        {data.stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Statistique {i + 1}</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Valeur"><Input value={stat.value} onChange={v => update(i, 'value', v)} placeholder="72h" /></Field>
              <Field label="Suffixe"><Input value={stat.suffix} onChange={v => update(i, 'suffix', v)} placeholder="+" /></Field>
              <Field label="Libellé"><Input value={stat.label} onChange={v => update(i, 'label', v)} placeholder="Livraison" /></Field>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function AboutSection({ data, onChange }: { data: HomepageContent; onChange: (d: HomepageContent) => void }) {
  const set = <K extends keyof HomepageContent['about']>(k: K, v: HomepageContent['about'][K]) =>
    onChange({ ...data, about: { ...data.about, [k]: v } })
  const upStat = (i: number, k: keyof StatItem, v: string) =>
    set('stats', data.about.stats.map((s, j) => j === i ? { ...s, [k]: v } : s))
  return (
    <>
      <SectionTitle icon={BookOpen} color="#059669" bg="#ECFDF5" title="Section Histoire" description="Bloc deux colonnes — image + texte sur la page d'accueil." />
      <div className="space-y-4">
        <ImageField
          label="Image du showroom"
          hint="Moitié gauche du bloc Histoire — recommandé : 800×600 px (4:3), PNG ou WebP."
          value={data.about.image}
          onChange={v => set('image', v)}
          folder="about"
        />
        <div className="pt-1" style={{ borderTop: '1px solid #F3F4F6' }} />
        <Row>
          <Field label="Accroche (eyebrow)"><Input value={data.about.eyebrow} onChange={v => set('eyebrow', v)} placeholder="Notre Histoire" /></Field>
          <Field label="Label du lien CTA"><Input value={data.about.ctaLabel} onChange={v => set('ctaLabel', v)} /></Field>
        </Row>
        <Row>
          <Field label="Titre ligne 1"><Input value={data.about.headline} onChange={v => set('headline', v)} /></Field>
          <Field label="Titre ligne 2 (or)"><Input value={data.about.headlineAccent} onChange={v => set('headlineAccent', v)} /></Field>
        </Row>
        <Field label="Paragraphe 1"><Textarea value={data.about.paragraph1} onChange={v => set('paragraph1', v)} rows={3} /></Field>
        <Field label="Paragraphe 2"><Textarea value={data.about.paragraph2} onChange={v => set('paragraph2', v)} rows={3} /></Field>
        <div className="pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Mini-statistiques (3 chiffres)</p>
          <div className="space-y-2">
            {data.about.stats.map((stat, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 rounded-xl p-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
                <Field label="Valeur"><Input value={stat.value} onChange={v => upStat(i, 'value', v)} /></Field>
                <Field label="Suffixe"><Input value={stat.suffix} onChange={v => upStat(i, 'suffix', v)} /></Field>
                <Field label="Libellé"><Input value={stat.label} onChange={v => upStat(i, 'label', v)} /></Field>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function FaqSection({ data, onChange }: { data: HomepageContent; onChange: (d: HomepageContent) => void }) {
  const set = (faq: HomepageContent['faq']) => onChange({ ...data, faq })
  const upItem = (i: number, k: keyof FaqItem, v: string) =>
    set({ ...data.faq, items: data.faq.items.map((x, j) => j === i ? { ...x, [k]: v } : x) })
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= data.faq.items.length) return
    const arr = [...data.faq.items];
    [arr[i], arr[j]] = [arr[j], arr[i]]
    set({ ...data.faq, items: arr })
  }
  const remove = (i: number) => set({ ...data.faq, items: data.faq.items.filter((_, j) => j !== i) })
  const add    = () => set({ ...data.faq, items: [...data.faq.items, { question: '', answer: '' }] })

  return (
    <>
      <SectionTitle icon={MessageSquare} color="#D97706" bg="#FFFBEB" title="FAQ" description="Questions / réponses sur la page d'accueil." />
      <div className="space-y-4">
        <Field label="Texte d'introduction">
          <Textarea value={data.faq.introText} onChange={v => set({ ...data.faq, introText: v })} rows={2} />
        </Field>
        <div className="space-y-3">
          {data.faq.items.map((item, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Question {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={13} style={S.muted} /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === data.faq.items.length - 1} className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={13} style={S.muted} /></button>
                  <button type="button" onClick={() => remove(i)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={13} style={{ color: '#EF4444' }} /></button>
                </div>
              </div>
              <Field label="Question"><Input value={item.question} onChange={v => upItem(i, 'question', v)} placeholder="Votre question…" /></Field>
              <Field label="Réponse"><Textarea value={item.answer} onChange={v => upItem(i, 'answer', v)} rows={3} placeholder="Votre réponse…" /></Field>
            </div>
          ))}
        </div>
        <button type="button" onClick={add}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
          style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
          <Plus size={13} /> Ajouter une question
        </button>
      </div>
    </>
  )
}

function ContactSection({ data, onChange }: { data: HomepageContent; onChange: (d: HomepageContent) => void }) {
  const set = <K extends keyof HomepageContent['contact']>(k: K, v: HomepageContent['contact'][K]) =>
    onChange({ ...data, contact: { ...data.contact, [k]: v } })
  const upSubj = (i: number, k: keyof Subject, v: string) =>
    set('subjects', data.contact.subjects.map((s, j) => j === i ? { ...s, [k]: v } : s))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= data.contact.subjects.length) return
    const arr = [...data.contact.subjects];
    [arr[i], arr[j]] = [arr[j], arr[i]]
    set('subjects', arr)
  }
  const remove = (i: number) => set('subjects', data.contact.subjects.filter((_, j) => j !== i))
  const add    = () => set('subjects', [...data.contact.subjects, { value: '', label: '' }])

  return (
    <>
      <SectionTitle icon={Phone} color="#7C3AED" bg="#F5F3FF" title="Informations de contact" description="Coordonnées et sujets du formulaire." />
      <div className="space-y-4">
        <Row>
          <Field label="Titre ligne 1"><Input value={data.contact.headline} onChange={v => set('headline', v)} /></Field>
          <Field label="Titre ligne 2 (accent)"><Input value={data.contact.headlineAccent} onChange={v => set('headlineAccent', v)} /></Field>
        </Row>
        <Field label="Description"><Textarea value={data.contact.description} onChange={v => set('description', v)} rows={2} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Téléphone"><Input value={data.contact.phone} onChange={v => set('phone', v)} placeholder="+216 XX XXX XXX" /></Field>
          <Field label="Localisation"><Input value={data.contact.location} onChange={v => set('location', v)} /></Field>
          <Field label="Horaires"><Input value={data.contact.hours} onChange={v => set('hours', v)} placeholder="Lun–Sam, 9h–18h" /></Field>
        </div>
        <div className="pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Sujets du formulaire ({data.contact.subjects.length})</p>
          <div className="space-y-2">
            {data.contact.subjects.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20"><ChevronUp size={11} style={S.muted} /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === data.contact.subjects.length - 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20"><ChevronDown size={11} style={S.muted} /></button>
                </div>
                <Input value={s.value} onChange={v => upSubj(i, 'value', v)} placeholder="valeur" className="w-28 shrink-0 text-xs" />
                <Input value={s.label} onChange={v => upSubj(i, 'label', v)} placeholder="Libellé affiché" className="flex-1 text-xs" />
                <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg hover:bg-red-50 shrink-0"><Trash2 size={13} style={{ color: '#EF4444' }} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={add}
            className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
            style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
            <Plus size={13} /> Ajouter un sujet
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomepageEditorClient({ initial }: { initial: HomepageContent }) {
  const [data, setData]       = useState<HomepageContent>(initial)
  const [section, setSection] = useState<SectionId>('hero')
  const [toast, setToast]     = useState<'success' | 'error' | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await updateHomepageContentAction(data)
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#EEF2FF' }}>
              <Home size={16} style={{ color: '#4F46E5' }} />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: '#111827' }}>Page d&apos;accueil</h1>
              <p className="text-xs" style={S.muted}>Hero, statistiques, histoire, FAQ et contact</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {toast && <Toast state={toast} />}
            <a href="/" target="_blank" rel="noopener noreferrer"
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
                      background: isActive ? n.bg : 'transparent',
                      borderLeft: `3px solid ${isActive ? n.color : 'transparent'}`,
                    }}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                      style={{ background: isActive ? '#FFFFFF' : '#F3F4F6' }}>
                      <Icon size={13} style={{ color: isActive ? n.color : '#9CA3AF' }} />
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
            {section === 'hero'    && <HeroSection    data={data} onChange={setData} />}
            {section === 'stats'   && <StatsSection   data={data} onChange={setData} />}
            {section === 'about'   && <AboutSection   data={data} onChange={setData} />}
            {section === 'faq'     && <FaqSection     data={data} onChange={setData} />}
            {section === 'contact' && <ContactSection data={data} onChange={setData} />}
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
