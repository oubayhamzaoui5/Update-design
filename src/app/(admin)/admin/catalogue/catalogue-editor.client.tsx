'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ExternalLink, Plus, Save, Trash2 } from 'lucide-react'
import type { StaticCatalogueAccessory, StaticCatalogueProduct } from '@/components/catalogue/static-category-page'
import type { EditableCatalogueContent, EditableCatalogueKey, EditableCatalogueMeta } from '@/lib/catalogue/editable-catalogue'
import { updateEditableCatalogueAction } from './actions'

type Section = 'models' | 'products' | 'accessories'

const sectionLabels: Record<Section, string> = {
  models: 'Modeles / tailles',
  products: 'Textures / finitions',
  accessories: 'Accessoires',
}

function splitVariants(value?: string[]) {
  return (value ?? []).join(', ')
}

function parseVariants(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function newProduct(): StaticCatalogueProduct {
  return { code: '', name: '', note: '', image: '', variants: [] }
}

function newAccessory(): StaticCatalogueAccessory {
  return { name: '', text: '', image: '', tag: '', variants: [] }
}

export default function CatalogueEditorClient({
  meta,
  initial,
}: {
  meta: EditableCatalogueMeta
  initial: EditableCatalogueContent
}) {
  const [content, setContent] = useState(initial)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [pending, startTransition] = useTransition()

  function updateProduct(section: 'models' | 'products', index: number, patch: Partial<StaticCatalogueProduct>) {
    setContent((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }))
  }

  function updateAccessory(index: number, patch: Partial<StaticCatalogueAccessory>) {
    setContent((current) => ({
      ...current,
      accessories: current.accessories.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }))
  }

  function addItem(section: Section) {
    setContent((current) => ({
      ...current,
      [section]: [...current[section], section === 'accessories' ? newAccessory() : newProduct()],
    }))
  }

  function deleteItem(section: Section, index: number) {
    setContent((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function save() {
    startTransition(async () => {
      const result = await updateEditableCatalogueAction(meta.key as EditableCatalogueKey, content)
      setToast(result.success ? 'success' : 'error')
      setTimeout(() => setToast(null), 2600)
    })
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#F4F6FB' }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/catalogue" className="mb-3 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900">
              <ArrowLeft size={12} /> Catalogue categories
            </Link>
            <h1 className="text-2xl font-bold text-slate-950">{meta.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Modeles, textures et accessoires affiches sur la page categorie.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {toast && (
              <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${toast === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                <Check size={14} /> {toast === 'success' ? 'Sauvegarde' : 'Erreur'}
              </span>
            )}
            <a href={meta.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
              <ExternalLink size={14} /> Apercu
            </a>
            <button onClick={save} disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              <Save size={14} /> {pending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {(['models', 'products'] as const).map((section) => (
          <section key={section} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">{section === 'products' ? meta.productLabel : sectionLabels[section]}</h2>
                <p className="text-xs text-slate-500">{content[section].length} element(s)</p>
              </div>
              <button onClick={() => addItem(section)} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                <Plus size={13} /> Ajouter
              </button>
            </div>

            <div className="grid gap-3">
              {content[section].map((item, index) => (
                <div key={`${section}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 lg:grid-cols-[0.9fr_1.2fr_1.2fr_1.5fr_auto]">
                  <input value={item.code} onChange={(event) => updateProduct(section, index, { code: event.target.value })} placeholder="Code" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  <input value={item.name} onChange={(event) => updateProduct(section, index, { name: event.target.value })} placeholder="Nom" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  <input value={item.note ?? ''} onChange={(event) => updateProduct(section, index, { note: event.target.value })} placeholder="Note" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  <input value={splitVariants(item.variants)} onChange={(event) => updateProduct(section, index, { variants: parseVariants(event.target.value) })} placeholder="Variantes separees par virgule" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  <button onClick={() => deleteItem(section, index)} className="inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-600">
                    <Trash2 size={14} />
                  </button>
                  <input value={item.image ?? ''} onChange={(event) => updateProduct(section, index, { image: event.target.value })} placeholder="Image URL ou /public/path" className="rounded-lg border border-slate-200 px-3 py-2 text-sm lg:col-span-5" />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Accessoires</h2>
              <p className="text-xs text-slate-500">{content.accessories.length} element(s)</p>
            </div>
            <button onClick={() => addItem('accessories')} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
              <Plus size={13} /> Ajouter
            </button>
          </div>

          <div className="grid gap-3">
            {content.accessories.map((item, index) => (
              <div key={`accessory-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 lg:grid-cols-[1.2fr_1.8fr_1fr_1.5fr_auto]">
                <input value={item.name} onChange={(event) => updateAccessory(index, { name: event.target.value })} placeholder="Nom" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input value={item.text} onChange={(event) => updateAccessory(index, { text: event.target.value })} placeholder="Texte" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input value={item.tag ?? ''} onChange={(event) => updateAccessory(index, { tag: event.target.value })} placeholder="Tag" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input value={splitVariants(item.variants)} onChange={(event) => updateAccessory(index, { variants: parseVariants(event.target.value) })} placeholder="Variantes" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <button onClick={() => deleteItem('accessories', index)} className="inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-600">
                  <Trash2 size={14} />
                </button>
                <input value={item.image} onChange={(event) => updateAccessory(index, { image: event.target.value })} placeholder="Image URL ou /public/path" className="rounded-lg border border-slate-200 px-3 py-2 text-sm lg:col-span-5" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
