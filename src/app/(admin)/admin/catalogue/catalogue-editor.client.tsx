'use client'

import type { ChangeEvent } from 'react'
import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import EmptyState from '@/components/admin/empty-state'
import type { StaticCatalogueAccessory, StaticCatalogueProduct } from '@/components/catalogue/static-category-page'
import type { EditableCatalogueContent, EditableCatalogueKey, EditableCatalogueMeta } from '@/lib/catalogue/editable-catalogue'
import { uploadImageAction } from '../contenu/upload-image'

import { updateEditableCatalogueAction } from './actions'

type Section = 'models' | 'products' | 'accessories'
type CatalogueItem = StaticCatalogueProduct | StaticCatalogueAccessory
type EditState = { section: Section; index: number | null }
type Draft = {
  code: string
  name: string
  description: string
  image: string
  tag: string
  variants: string
}

const sectionLabels: Record<Section, string> = {
  models: 'Modeles',
  products: 'References',
  accessories: 'Accessoires',
}

const sectionDescription: Record<Section, string> = {
  models: 'Formats et familles principales',
  products: 'Textures, finitions et couleurs',
  accessories: 'Pieces et options associees',
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/5 placeholder:text-slate-400'
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700'

function variantsToText(value?: string[]) {
  return (value ?? []).join(', ')
}

function textToVariants(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function itemCode(section: Section, item: CatalogueItem) {
  return section === 'accessories'
    ? (item as StaticCatalogueAccessory).tag ?? ''
    : (item as StaticCatalogueProduct).code ?? ''
}

function itemDescription(section: Section, item: CatalogueItem) {
  return section === 'accessories'
    ? (item as StaticCatalogueAccessory).text ?? ''
    : (item as StaticCatalogueProduct).note ?? ''
}

function itemImage(item: CatalogueItem) {
  return item.image ?? ''
}

function itemVariants(item: CatalogueItem) {
  return 'variants' in item ? item.variants ?? [] : []
}

function isIncomplete(section: Section, item: CatalogueItem) {
  if (!item.name?.trim()) return true
  if (!itemImage(item)) return true
  if (section !== 'accessories' && !itemCode(section, item).trim()) return true
  return false
}

function draftFromItem(section: Section, item?: CatalogueItem): Draft {
  if (!item) {
    return { code: '', name: '', description: '', image: '', tag: '', variants: '' }
  }

  return {
    code: section === 'accessories' ? '' : (item as StaticCatalogueProduct).code ?? '',
    name: item.name ?? '',
    description: itemDescription(section, item),
    image: itemImage(item),
    tag: section === 'accessories' ? (item as StaticCatalogueAccessory).tag ?? '' : '',
    variants: variantsToText(itemVariants(item)),
  }
}

function itemFromDraft(section: Section, draft: Draft): CatalogueItem {
  if (section === 'accessories') {
    return {
      name: draft.name.trim(),
      text: draft.description.trim(),
      image: draft.image.trim(),
      tag: draft.tag.trim(),
      variants: textToVariants(draft.variants),
    } satisfies StaticCatalogueAccessory
  }

  return {
    code: draft.code.trim(),
    name: draft.name.trim(),
    note: draft.description.trim(),
    image: draft.image.trim(),
    variants: textToVariants(draft.variants),
  } satisfies StaticCatalogueProduct
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

function ImageField({
  value,
  folder,
  onChange,
}: {
  value: string
  folder: string
  onChange: (value: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const result = await uploadImageAction(formData)
    event.target.value = ''
    setUploading(false)

    if (result.success && result.url) {
      onChange(result.url)
      return
    }

    setError(result.error ?? 'Upload impossible.')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={24} className="text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
            placeholder="/catalogue/image.webp"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-[#4F46E5]">
            <Upload size={13} /> {uploading ? 'Import...' : 'Choisir une image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}

export default function CatalogueEditorClient({
  meta,
  initial,
}: {
  meta: EditableCatalogueMeta
  initial: EditableCatalogueContent
}) {
  const [content, setContent] = useState(initial)
  const [active, setActive] = useState<Section>('products')
  const [query, setQuery] = useState('')
  const [editState, setEditState] = useState<EditState | null>(null)
  const [draft, setDraft] = useState<Draft>(() => draftFromItem('products'))
  const [isDirty, setIsDirty] = useState(false)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [pending, startTransition] = useTransition()

  const sectionStats = useMemo(() => {
    return (['models', 'products', 'accessories'] as const).map((section) => {
      const items = content[section]
      return {
        section,
        total: items.length,
        incomplete: items.filter((item) => isIncomplete(section, item)).length,
      }
    })
  }, [content])

  const totalIncomplete = sectionStats.reduce((sum, item) => sum + item.incomplete, 0)
  const totalItems = sectionStats.reduce((sum, item) => sum + item.total, 0)

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return content[active]
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (!q) return true
        return `${item.name} ${itemCode(active, item)} ${itemDescription(active, item)}`.toLowerCase().includes(q)
      })
  }, [active, content, query])

  function updateContent(updater: (current: EditableCatalogueContent) => EditableCatalogueContent) {
    setContent(updater)
    setIsDirty(true)
  }

  function openCreate(section: Section = active) {
    setActive(section)
    setEditState({ section, index: null })
    setDraft(draftFromItem(section))
  }

  function openEdit(section: Section, index: number) {
    setActive(section)
    setEditState({ section, index })
    setDraft(draftFromItem(section, content[section][index]))
  }

  function closeEditor() {
    setEditState(null)
    setDraft(draftFromItem(active))
  }

  function saveDraft() {
    if (!editState) return

    updateContent((current) => {
      const section = editState.section
      const item = itemFromDraft(section, draft)
      const currentList = current[section]
      const nextList = editState.index === null
        ? [...currentList, item]
        : currentList.map((entry, index) => (index === editState.index ? item : entry))

      return { ...current, [section]: nextList }
    })

    closeEditor()
  }

  function deleteItem(section: Section, index: number) {
    updateContent((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }))

    if (editState?.section === section && editState.index === index) closeEditor()
  }

  function moveItem(section: Section, index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= content[section].length) return

    updateContent((current) => {
      const nextList = [...current[section]]
      const [item] = nextList.splice(index, 1)
      if (!item) return current
      nextList.splice(nextIndex, 0, item)
      return { ...current, [section]: nextList }
    })
  }

  function savePage() {
    startTransition(async () => {
      const result = await updateEditableCatalogueAction(meta.key as EditableCatalogueKey, content)
      setToast(result.success ? 'success' : 'error')
      if (result.success) setIsDirty(false)
      setTimeout(() => setToast(null), 2400)
    })
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/admin/catalogue" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
                <ArrowLeft size={12} /> Catalogues
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">{meta.title}</h1>
                {isDirty && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Non enregistre</span>}
                {totalIncomplete > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    <AlertTriangle size={12} /> {totalIncomplete} a completer
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{totalItems} elements dans cette page catalogue</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {toast && (
                <span className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${toast === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <Check size={14} /> {toast === 'success' ? 'Enregistre' : 'Erreur'}
                </span>
              )}
              <a href={meta.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
                <ExternalLink size={14} /> Voir la page
              </a>
              <button
                type="button"
                onClick={savePage}
                disabled={pending || !isDirty}
                className="inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={14} /> {pending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2 md:grid-cols-3">
            {sectionStats.map(({ section, total, incomplete }) => (
              <button
                key={section}
                type="button"
                onClick={() => {
                  setActive(section)
                  setQuery('')
                  closeEditor()
                }}
                className={`rounded-lg border px-4 py-3 text-left transition ${active === section ? 'border-[#4F46E5] bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">{sectionLabels[section]}</p>
                    <p className="mt-1 text-xs text-slate-500">{sectionDescription[section]}</p>
                  </div>
                  <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-600">{total}</span>
                </div>
                {incomplete > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <AlertTriangle size={12} /> {incomplete} incomplet{incomplete > 1 ? 's' : ''}
                  </p>
                )}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-5">
          <main className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#4F46E5]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => openCreate(active)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus size={14} /> Ajouter
                </button>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <EmptyState title="Aucun element" description="Ajoutez un element dans cette section." />
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredItems.map(({ item, index }) => {
                  const code = itemCode(active, item)
                  const incomplete = isIncomplete(active, item)
                  const variants = itemVariants(item)

                  return (
                    <article key={`${active}-${index}-${item.name}`} className="grid gap-3 p-4 transition hover:bg-slate-50 sm:grid-cols-[76px_1fr_auto] sm:items-center">
                      <button
                        type="button"
                        onClick={() => openEdit(active, index)}
                        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                        title="Modifier"
                      >
                        {itemImage(item) ? (
                          <img src={itemImage(item)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-300" />
                        )}
                      </button>

                      <button type="button" onClick={() => openEdit(active, index)} className="min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          {code && <span className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-bold text-[#4F46E5]">{code}</span>}
                          <h3 className="truncate text-sm font-bold text-slate-950">{item.name || 'Sans nom'}</h3>
                          {incomplete ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                              <AlertTriangle size={11} /> Incomplet
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                              <Check size={11} /> OK
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{itemDescription(active, item) || 'Aucune description'}</p>
                        {variants.length > 0 && (
                          <p className="mt-1 truncate text-[11px] text-slate-400">{variants.join(', ')}</p>
                        )}
                      </button>

                      <div className="flex items-center gap-1 sm:justify-end">
                        <button type="button" onClick={() => moveItem(active, index, -1)} className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-slate-100" title="Monter">
                          <ArrowUp size={14} />
                        </button>
                        <button type="button" onClick={() => moveItem(active, index, 1)} className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-slate-100" title="Descendre">
                          <ArrowDown size={14} />
                        </button>
                        <button type="button" onClick={() => openEdit(active, index)} className="rounded-lg bg-indigo-50 p-2 text-[#4F46E5] hover:bg-indigo-100" title="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => deleteItem(active, index)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </main>
        </div>

        {editState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {editState.index === null ? 'Nouvel element' : 'Modifier'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{sectionLabels[editState.section]}</p>
                </div>
                <button type="button" onClick={closeEditor} className="rounded-lg bg-slate-50 p-2 text-slate-400 hover:text-slate-700" title="Fermer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {editState.section === 'accessories' ? (
                  <Field label="Etiquette">
                    <input
                      value={draft.tag}
                      onChange={(event) => setDraft((current) => ({ ...current, tag: event.target.value }))}
                      className={inputClass}
                      placeholder="Ref., finition, type..."
                    />
                  </Field>
                ) : (
                  <Field label="Reference">
                    <input
                      value={draft.code}
                      onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
                      className={inputClass}
                      placeholder="EX01, L24, MB004..."
                    />
                  </Field>
                )}

                <Field label="Nom">
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    className={inputClass}
                    placeholder="Nom affiche"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={draft.description}
                    onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                    className={`${inputClass} min-h-24 resize-y`}
                    placeholder="Texte court affiche sur la page"
                  />
                </Field>

                <Field label="Options">
                  <input
                    value={draft.variants}
                    onChange={(event) => setDraft((current) => ({ ...current, variants: event.target.value }))}
                    className={inputClass}
                    placeholder="Separees par virgule"
                  />
                </Field>

                <Field label="Image">
                  <ImageField
                    value={draft.image}
                    folder={`catalogue/${meta.key}`}
                    onChange={(image) => setDraft((current) => ({ ...current, image }))}
                  />
                </Field>

                <button type="button" onClick={saveDraft} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white">
                  <Check size={14} /> {editState.index === null ? 'Ajouter a la page' : 'Mettre a jour'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
