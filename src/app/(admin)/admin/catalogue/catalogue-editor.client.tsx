'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import EmptyState from '@/components/admin/empty-state'
import { ArrowLeft, Check, ExternalLink, Image as ImageIcon, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react'
import type { StaticCatalogueAccessory, StaticCatalogueProduct } from '@/components/catalogue/static-category-page'
import type { EditableCatalogueContent, EditableCatalogueKey, EditableCatalogueMeta } from '@/lib/catalogue/editable-catalogue'
import { updateEditableCatalogueAction } from './actions'

type Section = 'models' | 'products' | 'accessories'
type EditState =
  | { section: Section; index: number }
  | { section: Section; index: null }

type Draft = {
  code: string
  name: string
  note: string
  text: string
  image: string
  tag: string
  variants: string
}

const sectionLabels: Record<Section, string> = {
  models: 'Modeles',
  products: 'Textures',
  accessories: 'Accessoires',
}

const inputClasses =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/5 placeholder:text-slate-400'

const labelClasses = 'ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500'

function variantsToText(value?: string[]) {
  return (value ?? []).join(', ')
}

function textToVariants(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function draftFromItem(section: Section, item?: StaticCatalogueProduct | StaticCatalogueAccessory): Draft {
  if (!item) {
    return { code: '', name: '', note: '', text: '', image: '', tag: '', variants: '' }
  }

  if (section === 'accessories') {
    const accessory = item as StaticCatalogueAccessory
    return {
      code: '',
      name: accessory.name ?? '',
      note: '',
      text: accessory.text ?? '',
      image: accessory.image ?? '',
      tag: accessory.tag ?? '',
      variants: variantsToText(accessory.variants),
    }
  }

  const product = item as StaticCatalogueProduct
  return {
    code: product.code ?? '',
    name: product.name ?? '',
    note: product.note ?? '',
    text: '',
    image: product.image ?? '',
    tag: '',
    variants: variantsToText(product.variants),
  }
}

function itemImage(item: StaticCatalogueProduct | StaticCatalogueAccessory) {
  return item.image || '/placeholder-square.png'
}

function itemSubtitle(section: Section, item: StaticCatalogueProduct | StaticCatalogueAccessory) {
  if (section === 'accessories') return (item as StaticCatalogueAccessory).text
  return (item as StaticCatalogueProduct).note ?? `Ref. ${(item as StaticCatalogueProduct).code}`
}

export default function CatalogueEditorClient({
  meta,
  initial,
}: {
  meta: EditableCatalogueMeta
  initial: EditableCatalogueContent
}) {
  const [content, setContent] = useState(initial)
  const [active, setActive] = useState<Section>('models')
  const [query, setQuery] = useState('')
  const [editState, setEditState] = useState<EditState | null>(null)
  const [draft, setDraft] = useState<Draft>(() => draftFromItem('models'))
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [pending, startTransition] = useTransition()

  const activeItems = content[active]
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activeItems.map((item, index) => ({ item, index }))
    return activeItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const code = 'code' in item ? item.code : item.tag
        return `${item.name} ${code ?? ''} ${itemSubtitle(active, item) ?? ''}`.toLowerCase().includes(q)
      })
  }, [active, activeItems, query])

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

    setContent((current) => {
      const section = editState.section
      const nextItem =
        section === 'accessories'
          ? ({
              name: draft.name.trim(),
              text: draft.text.trim(),
              image: draft.image.trim(),
              tag: draft.tag.trim(),
              variants: textToVariants(draft.variants),
            } satisfies StaticCatalogueAccessory)
          : ({
              code: draft.code.trim(),
              name: draft.name.trim(),
              note: draft.note.trim(),
              image: draft.image.trim(),
              variants: textToVariants(draft.variants),
            } satisfies StaticCatalogueProduct)

      const list = current[section]
      const nextList = editState.index === null
        ? [...list, nextItem]
        : list.map((item, index) => index === editState.index ? nextItem : item)

      return { ...current, [section]: nextList }
    })
    closeEditor()
  }

  function deleteItem(section: Section, index: number) {
    setContent((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }))
    if (editState?.section === section && editState.index === index) closeEditor()
  }

  function saveAll() {
    startTransition(async () => {
      const result = await updateEditableCatalogueAction(meta.key as EditableCatalogueKey, content)
      setToast(result.success ? 'success' : 'error')
      setTimeout(() => setToast(null), 2600)
    })
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/catalogue" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft size={12} /> Catalogue categories
          </Link>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Catalogue</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{meta.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Gerez modeles, textures et accessoires de cette page.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {toast && (
            <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${toast === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <Check size={14} /> {toast === 'success' ? 'Sauvegarde !' : 'Erreur'}
            </div>
          )}
          <a href={meta.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
            <ExternalLink size={14} /> Apercu
          </a>
          <button onClick={saveAll} disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
            <Save size={14} /> {pending ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap gap-2">
                {(['models', 'products', 'accessories'] as const).map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setActive(section)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${active === section ? 'bg-[#4F46E5] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {sectionLabels[section]}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${active === section ? 'bg-white/18 text-white' : 'bg-white text-slate-400'}`}>
                      {content[section].length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher par nom, code, tag..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/5"
                />
              </div>

              <button onClick={() => openCreate(active)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState title="Aucun element trouve" description="Ajustez la recherche ou ajoutez un nouvel element." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredItems.map(({ item, index }) => (
                <article key={`${active}-${index}-${item.name}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-square bg-slate-50">
                    {itemImage(item) ? (
                      <Image src={itemImage(item)} alt={item.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImageIcon size={28} />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-lg bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      {'code' in item ? item.code || active : item.tag || 'Accessoire'}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-950">{item.name || 'Sans nom'}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{itemSubtitle(active, item) || 'Aucune note'}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => openEdit(active, index)} className="rounded-lg bg-slate-50 p-2 text-slate-500 hover:bg-indigo-50 hover:text-[#4F46E5]">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteItem(active, index)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {'variants' in item && item.variants && item.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.variants.slice(0, 8).map((variant) => (
                          <span key={variant} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {variant}
                          </span>
                        ))}
                        {item.variants.length > 8 && (
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            +{item.variants.length - 8}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                {editState ? (editState.index === null ? 'Nouvel element' : 'Modifier element') : 'Edition rapide'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {editState ? sectionLabels[editState.section] : 'Selectionnez une carte ou ajoutez un element.'}
              </p>
            </div>
            {editState && (
              <button onClick={closeEditor} className="rounded-lg bg-slate-50 p-2 text-slate-400 hover:text-slate-700">
                <X size={14} />
              </button>
            )}
          </div>

          {!editState ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">Aucun element ouvert</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Utilisez Ajouter ou Modifier sur une carte.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {editState.section !== 'accessories' && (
                <div>
                  <label className={labelClasses}>Code</label>
                  <input value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} className={inputClasses} placeholder="EX01, L24, MB004..." />
                </div>
              )}

              <div>
                <label className={labelClasses}>Nom</label>
                <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className={inputClasses} placeholder="Nom affiche" />
              </div>

              {editState.section === 'accessories' ? (
                <div>
                  <label className={labelClasses}>Description</label>
                  <textarea value={draft.text} onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))} className={`${inputClasses} min-h-24 resize-y`} placeholder="Texte accessoire" />
                </div>
              ) : (
                <div>
                  <label className={labelClasses}>Note</label>
                  <input value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className={inputClasses} placeholder="Note courte" />
                </div>
              )}

              {editState.section === 'accessories' && (
                <div>
                  <label className={labelClasses}>Tag</label>
                  <input value={draft.tag} onChange={(event) => setDraft((current) => ({ ...current, tag: event.target.value }))} className={inputClasses} placeholder="Ref., type, finition..." />
                </div>
              )}

              <div>
                <label className={labelClasses}>Variantes</label>
                <input value={draft.variants} onChange={(event) => setDraft((current) => ({ ...current, variants: event.target.value }))} className={inputClasses} placeholder="Separees par virgule" />
              </div>

              <div>
                <label className={labelClasses}>Image</label>
                <input value={draft.image} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} className={inputClasses} placeholder="/categories/image.png ou URL" />
              </div>

              <button onClick={saveDraft} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white">
                <Check size={14} /> Appliquer
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
