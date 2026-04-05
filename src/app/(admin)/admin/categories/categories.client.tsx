'use client'

import { useRef, useMemo, useState } from 'react'
import RichTextEditor from '@/components/admin/RichTextEditor'
import EmptyState from '@/components/admin/empty-state'
import { ArrowDown, ArrowUp, Image as ImageIcon, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
} from './actions'
import { useAdminToast } from '@/components/admin/AdminToast'
import { slugify } from '@/utils/slug'
import type { AdminCategoryRecord } from '@/lib/admin/data'

type Category = AdminCategoryRecord

type EditState = { mode: 'create' } | { mode: 'edit'; id: string }

const inputClasses =
  'mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/5 placeholder:text-[#9CA3AF] bg-white'

const labelClasses = 'ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-500'

function compareCategories(a: Category, b: Category) {
  const orderA = Number.isFinite(a.order) ? a.order : 0
  const orderB = Number.isFinite(b.order) ? b.order : 0
  if (orderA !== orderB) return orderA - orderB
  return a.name.localeCompare(b.name)
}

type FormState = {
  name: string
  slug: string
  description: string
  parent: string
  promo: string
  activeAll: boolean
  menuImagePreview: string | null
  menuImageFile: File | null
  removeMenuImage: boolean
  coverImagePreview: string | null
  coverImageFile: File | null
  removeCoverImage: boolean
}

function emptyForm(): FormState {
  return {
    name: '',
    slug: '',
    description: '',
    parent: '',
    promo: '0',
    activeAll: false,
    menuImagePreview: null,
    menuImageFile: null,
    removeMenuImage: false,
    coverImagePreview: null,
    coverImageFile: null,
    removeCoverImage: false,
  }
}

function ImageField({
  label,
  preview,
  existing,
  removed,
  inputRef,
  onChange,
  onRemove,
  onRestore,
}: {
  label: string
  preview: string | null
  existing?: string
  removed: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (file: File | null, preview: string | null) => void
  onRemove: () => void
  onRestore: () => void
}) {
  const displaySrc = removed ? null : (preview ?? existing ?? null)

  return (
    <div>
      <label className={labelClasses}>{label}</label>
      <div className="mt-1.5 flex items-center gap-3">
        {displaySrc ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200">
            <img src={displaySrc} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <ImageIcon className="h-5 w-5 text-slate-300" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-[#4F46E5] hover:underline"
          >
            {displaySrc ? 'Changer' : 'Choisir une image'}
          </button>
          {(displaySrc || (existing && !removed)) && (
            <button
              type="button"
              onClick={removed ? onRestore : onRemove}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              {removed ? 'Restaurer' : 'Supprimer'}
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => onChange(file, ev.target?.result as string)
          reader.readAsDataURL(file)
        }}
      />
    </div>
  )
}

export default function CategoriesClient(props: { initialCategories: Category[] }) {
  const { initialCategories } = props

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ mode: 'create' })
  const [form, setForm] = useState<FormState>(emptyForm())
  const { toast, ToastContainer } = useAdminToast()

  const menuImageRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)

  const nextOrderValue = useMemo(
    () =>
      categories.reduce((max, item) => {
        const value = Number.isFinite(item.order) ? item.order : 0
        return Math.max(max, value)
      }, 0) + 1,
    [categories]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  }, [categories, query])

  const visible = useMemo(() => filtered.slice().sort(compareCategories), [filtered])

  // Root categories (no parent) for the parent selector
  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parent).sort(compareCategories),
    [categories]
  )

  function resetForm() { setForm(emptyForm()) }

  function openCreate() {
    setEditState({ mode: 'create' })
    resetForm()
    setOpen(true)
  }

  function openEdit(cat: Category) {
    setEditState({ mode: 'edit', id: cat.id })
    setForm({
      name: cat.name ?? '',
      slug: slugify(cat.slug || cat.name || ''),
      description: cat.description ?? '',
      parent: cat.parent ?? '',
      promo: String(cat.promo ?? 0),
      activeAll: cat.activeAll ?? false,
      menuImagePreview: null,
      menuImageFile: null,
      removeMenuImage: false,
      coverImagePreview: null,
      coverImageFile: null,
      removeCoverImage: false,
    })
    setOpen(true)
  }

  function getEditingCat(): Category | undefined {
    if (editState.mode !== 'edit') return undefined
    return categories.find((c) => c.id === editState.id)
  }

  async function submitCategory() {
    const name = form.name.trim()
    if (!name) {
      toast('Veuillez renseigner le champ obligatoire : nom.', 'error')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('slug', form.slug || slugify(name))
      fd.append('description', form.description)
      fd.append('parent', form.parent)
      fd.append('promo', form.promo || '0')
      fd.append('activeAll', String(form.activeAll))

      if (form.menuImageFile) fd.append('menuImage', form.menuImageFile)
      else if (form.removeMenuImage) fd.append('removeMenuImage', 'true')

      if (form.coverImageFile) fd.append('coverImage', form.coverImageFile)
      else if (form.removeCoverImage) fd.append('removeCoverImage', 'true')

      if (editState.mode === 'create') {
        fd.append('order', String(nextOrderValue))
        const created = await createCategoryAction(fd)
        setCategories((prev) => [...prev, { ...created, features: [] }])
        toast('Categorie creee avec succes.', 'success')
      } else {
        const existingOrder = categories.find((c) => c.id === editState.id)?.order ?? 0
        fd.append('order', String(existingOrder))
        const updated = await updateCategoryAction(editState.id, fd)
        setCategories((prev) =>
          prev.map((c) =>
            c.id === updated.id
              ? {
                  ...c,
                  name: updated.name,
                  slug: updated.slug,
                  order: updated.order,
                  description: updated.description ?? '',
                  parent: updated.parent ?? null,
                  promo: updated.promo,
                  activeAll: updated.activeAll,
                  menuImage: updated.menuImage ?? undefined,
                  menuImageUrl: updated.menuImageUrl ?? undefined,
                  coverImage: updated.coverImage ?? undefined,
                  coverImageUrl: updated.coverImageUrl ?? undefined,
                }
              : c
          )
        )
        toast('Categorie mise a jour avec succes.', 'success')
      }

      setOpen(false)
      resetForm()
    } catch (e) {
      console.error(e)
      toast("Echec de l'enregistrement de la categorie.", 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Supprimer cette categorie ?')) return
    try {
      await deleteCategoryAction(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast('Categorie supprimee.', 'success')
    } catch (e) {
      console.error(e)
      toast('Echec de la suppression de la categorie.', 'error')
    }
  }

  async function moveCategory(catId: string, siblings: Category[], direction: 'up' | 'down') {
    if (movingId) return
    const currentIndex = siblings.findIndex((item) => item.id === catId)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= siblings.length) return

    const reordered = siblings.slice()
    const [moved] = reordered.splice(currentIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    const updates = reordered.map((item, index) => ({ id: item.id, order: index + 1 }))
    const updatesMap = new Map(updates.map((item) => [item.id, item.order]))
    const snapshot = categories

    setMovingId(catId)
    setCategories((prev) =>
      prev.map((item) =>
        updatesMap.has(item.id) ? { ...item, order: updatesMap.get(item.id) ?? item.order } : item
      )
    )

    try {
      await reorderCategoriesAction(updates)
      toast('Ordre des categories mis a jour.', 'success')
    } catch (e) {
      console.error(e)
      setCategories(snapshot)
      toast("Echec de la mise a jour de l'ordre des categories.", 'error')
    } finally {
      setMovingId(null)
    }
  }

  const editingCat = getEditingCat()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
          Catalog
        </p>
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#111827' }}>
            Categories
          </h1>
          <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
            {visible.length} result{visible.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Gerez et organisez toutes les categories de produits.
        </p>
      </div>

      <div className="mb-6 flex flex-col items-center gap-3 md:flex-row">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
            style={{ border: '1px solid #E8EAED', background: '#FFFFFF', color: '#111827' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4F46E5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#E8EAED')}
          />
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#4F46E5' }}
        >
          <Plus className="h-5 w-5" />
          New category
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Aucune categorie trouvee" description="Essayez d'ajuster votre recherche ou d'ajouter une nouvelle categorie." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Image</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Category</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Slug</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Parent</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Promo</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Order</th>
                <th className="py-3 px-4 text-center text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((cat, index) => {
                const thumbSrc = cat.menuImageUrl ?? cat.coverImageUrl ?? null
                const parentName = cat.parent
                  ? categories.find((c) => c.id === cat.parent)?.name ?? cat.parent
                  : null
                return (
                  <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      {thumbSrc ? (
                        <img src={thumbSrc} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                          <ImageIcon className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-800">{cat.name}</span>
                      {cat.description && (
                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1 max-w-[220px]">{cat.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">{cat.slug}</td>
                    <td className="py-4 px-4 text-sm text-slate-500">{parentName ?? <span className="text-slate-300">—</span>}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {cat.promo ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                          -{cat.promo}%
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">#{cat.order}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => moveCategory(cat.id, visible, 'up')}
                          disabled={index === 0 || movingId === cat.id || query.trim().length > 0}
                          className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveCategory(cat.id, visible, 'down')}
                          disabled={index === visible.length - 1 || movingId === cat.id || query.trim().length > 0}
                          className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(cat)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editState.mode === 'create' ? 'Ajouter une categorie' : 'Modifier la categorie'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-5rem)] overflow-y-auto p-6">
              <div className="space-y-5">

                {/* Name */}
                <div>
                  <label className={labelClasses}>Nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Décoration d'Intérieur"
                    className={inputClasses}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className={labelClasses}>Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    placeholder={form.name ? slugify(form.name) : 'auto-genere'}
                    className={inputClasses}
                  />
                  <p className="mt-1 ml-1 text-[10px] text-slate-400">
                    Laissez vide pour generer automatiquement depuis le nom.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className={labelClasses}>Description</label>
                  <div className="mt-1.5">
                    <RichTextEditor
                      key={editState.mode === 'edit' ? editState.id : 'create'}
                      initialHtml={form.description}
                      onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                      minHeight={200}
                      placeholder="Rédigez une description riche pour cette catégorie..."
                    />
                  </div>
                </div>

                {/* Parent category */}
                <div>
                  <label className={labelClasses}>Categorie parente</label>
                  <select
                    value={form.parent}
                    onChange={(e) => setForm({ ...form, parent: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="">— Aucune (categorie racine) —</option>
                    {rootCategories
                      .filter((c) => editState.mode !== 'edit' || c.id !== editState.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>

                {/* Promo + ActiveAll */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className={labelClasses}>Promo (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.promo}
                      onChange={(e) => setForm({ ...form, promo: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.activeAll}
                        onChange={(e) => setForm({ ...form, activeAll: e.target.checked })}
                        className="h-4 w-4 rounded accent-[#4F46E5]"
                      />
                      <span className="text-sm font-medium text-slate-700">Appliquer a tous les produits</span>
                    </label>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-1">
                  <p className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Images</p>

                  {/* Menu Image */}
                  <ImageField
                    label="Image menu (mega-menu + page d'accueil)"
                    preview={form.menuImagePreview}
                    existing={editingCat?.menuImageUrl}
                    removed={form.removeMenuImage}
                    inputRef={menuImageRef}
                    onChange={(file, preview) =>
                      setForm({ ...form, menuImageFile: file, menuImagePreview: preview, removeMenuImage: false })
                    }
                    onRemove={() => setForm({ ...form, menuImageFile: null, menuImagePreview: null, removeMenuImage: true })}
                    onRestore={() => setForm({ ...form, removeMenuImage: false })}
                  />

                  <div className="mt-4">
                    {/* Cover Image */}
                    <ImageField
                      label="Image de couverture (page categorie)"
                      preview={form.coverImagePreview}
                      existing={editingCat?.coverImageUrl}
                      removed={form.removeCoverImage}
                      inputRef={coverImageRef}
                      onChange={(file, preview) =>
                        setForm({ ...form, coverImageFile: file, coverImagePreview: preview, removeCoverImage: false })
                      }
                      onRemove={() => setForm({ ...form, coverImageFile: null, coverImagePreview: null, removeCoverImage: true })}
                      onRestore={() => setForm({ ...form, removeCoverImage: false })}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={submitCategory}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving
                      ? 'Enregistrement...'
                      : editState.mode === 'create'
                      ? 'Ajouter une categorie'
                      : 'Enregistrer les modifications'}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {ToastContainer}
    </div>
  )
}
