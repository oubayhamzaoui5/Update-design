"use client"

import { useMemo, useRef, useState } from "react"
import { X, Plus as PlusIcon, Trash2, Search, ChevronDown } from "lucide-react"
import ProductVariantsEditor from "./ProductVariantsEditor"
import { filePreview, fileUrl } from "@/utils/product.utils"
import { CategoryOption, ProductDetail } from "@/types/product.types"

type ProductFormProps = {
  open: boolean
  setOpen: (v: boolean) => void
  form: {
    sku: string
    name: string
    price: string
    promoPrice: string
    description: string
    isActive: boolean
    inView: boolean
    currency: string
    slug: string
    existing: string[]
    files: File[]
    categories: string[]
    details: ProductDetail[]
  }
  setForm: React.Dispatch<
    React.SetStateAction<{
      sku: string
      name: string
      price: string
      promoPrice: string
      description: string
      isActive: boolean
      inView: boolean
      currency: string
      slug: string
      existing: string[]
      files: File[]
      categories: string[]
      details: ProductDetail[]
    }>
  >
  allCategories: CategoryOption[]
  categoryDropdownOpen: boolean
  setCategoryDropdownOpen: (v: boolean) => void
  categorySearch: string
  setCategorySearch: (v: string) => void
  editState: { mode: "create" | "edit"; id?: string }
  createdProductId: string | null
  isVariant: boolean
  setIsVariant: (v: boolean) => void
  isParent: boolean
  setIsParent: (v: boolean) => void
  parentId: string | null
  setParentId: (v: string | null) => void
  variantKey: Record<string, string | null>
  setVariantKey: (v: Record<string, string | null>) => void
  hideCollectionToggle?: boolean
  submitProduct: () => Promise<void>
  adding: boolean
}

type PromoMode = "percent" | "price"

function parseNumericInput(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Number(value.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

function formatNumeric(value: number): string {
  if (!Number.isFinite(value)) return ""
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}

function SwitchField({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description: string
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:bg-slate-50/50"
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <span className="relative inline-flex h-6 w-11 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-600" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

const inputClasses = "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"

export default function ProductForm({
  open,
  setOpen,
  form,
  setForm,
  allCategories,
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  categorySearch,
  setCategorySearch,
  editState,
  isVariant,
  setIsVariant,
  isParent,
  setIsParent,
  hideCollectionToggle = false,
  submitProduct,
  adding,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [promoMode, setPromoMode] = useState<PromoMode>("percent")
  const [thumbOrder, setThumbOrder] = useState<string[]>([])

  const thumbItems = useMemo(() => {
    const existingItems = form.existing.map((filename) => ({
      id: `existing:${filename}`,
      kind: "existing" as const,
      src: editState.mode === "edit" && editState.id ? fileUrl(editState.id, filename) : "",
      filename,
      file: null as File | null,
    }))

    const fileItems = form.files.map((file, idx) => ({
      id: `file:${file.name}:${file.size}:${file.lastModified}:${idx}`,
      kind: "files" as const,
      src: filePreview(file),
      filename: null as string | null,
      file,
    }))

    return [...existingItems, ...fileItems]
  }, [editState.id, editState.mode, form.existing, form.files])

  const orderedThumbs = useMemo(() => {
    const byId = new Map(thumbItems.map((item) => [item.id, item]))
    const ordered = thumbOrder.map((id) => byId.get(id)).filter((item): item is (typeof thumbItems)[number] => !!item)
    const remaining = thumbItems.filter((item) => !thumbOrder.includes(item.id))
    return [...ordered, ...remaining]
  }, [thumbItems, thumbOrder])

  const allImageCount = form.existing.length + form.files.length
  const mainImageSrc = orderedThumbs[0]?.src ?? ""

  function addImagesFromInput(filesList: FileList | null) {
    if (!filesList) return
    const files = Array.from(filesList)
    setForm((prev) => ({ ...prev, files: [...prev.files, ...files] }))
  }

  function removeExistingAt(index: number) {
    setForm((prev) => {
      const next = prev.existing.slice()
      next.splice(index, 1)
      return { ...prev, existing: next }
    })
  }

  function removeFileAt(index: number) {
    setForm((prev) => {
      const next = prev.files.slice()
      next.splice(index, 1)
      return { ...prev, files: next }
    })
  }

  function reorderThumbs(sourceId: string, targetId: string) {
    if (!sourceId || !targetId || sourceId === targetId) return

    const currentIds = orderedThumbs.map((item) => item.id)
    const sourceIndex = currentIds.indexOf(sourceId)
    const targetIndex = currentIds.indexOf(targetId)
    if (sourceIndex === -1 || targetIndex === -1) return

    const nextIds = currentIds.slice()
    const [movedId] = nextIds.splice(sourceIndex, 1)
    nextIds.splice(targetIndex, 0, movedId)

    const itemById = new Map(orderedThumbs.map((item) => [item.id, item]))
    const nextExisting: string[] = []
    const nextFiles: File[] = []

    for (const id of nextIds) {
      const item = itemById.get(id)
      if (!item) continue
      if (item.kind === "existing" && item.filename) nextExisting.push(item.filename)
      if (item.kind === "files" && item.file) nextFiles.push(item.file)
    }

    setThumbOrder(nextIds)
    setForm((prev) => ({ ...prev, existing: nextExisting, files: nextFiles }))
  }

  const selectedCategoryObjs = form.categories
    .map((id) => allCategories.find((c) => c.id === id))
    .filter((c): c is CategoryOption => !!c)

  const categorySummary =
    selectedCategoryObjs.length === 0
      ? "Sélectionner les catégories"
      : selectedCategoryObjs.length === 1
      ? selectedCategoryObjs[0].name
      : `${selectedCategoryObjs[0].name} + ${selectedCategoryObjs.length - 1} autres`

  function toggleCategory(id: string) {
    setForm((prev) => {
      const exists = prev.categories.includes(id)
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== id)
          : [...prev.categories, id],
      }
    })
  }

  function closeCategoryDropdown() {
    setCategoryDropdownOpen(false)
    setCategorySearch("")
  }

  const promoInputValue =
    promoMode === "price"
      ? form.promoPrice
      : (() => {
          const basePrice = parseNumericInput(form.price)
          const absolutePromo = parseNumericInput(form.promoPrice)
          if (basePrice == null || basePrice <= 0 || absolutePromo == null || absolutePromo < 0) return ""
          const percent = Math.min(100, Math.max(0, ((basePrice - absolutePromo) / basePrice) * 100))
          return formatNumeric(percent)
        })()

  function handlePromoModeChange(nextMode: PromoMode) {
    setPromoMode(nextMode)
  }

  function handlePromoInputChange(nextValue: string) {
    if (!nextValue.trim()) {
      setForm((prev) => ({ ...prev, promoPrice: "" }))
      return
    }

    const parsedInput = parseNumericInput(nextValue)
    if (parsedInput == null) {
      setForm((prev) => ({ ...prev, promoPrice: "" }))
      return
    }

    if (promoMode === "price") {
      const absolute = Math.max(0, parsedInput)
      setForm((prev) => ({ ...prev, promoPrice: formatNumeric(absolute) }))
      return
    }

    const basePrice = parseNumericInput(form.price)
    if (basePrice == null || basePrice <= 0) {
      setForm((prev) => ({ ...prev, promoPrice: "" }))
      return
    }

    const percent = Math.min(100, Math.max(0, parsedInput))
    const absolute = basePrice * (1 - percent / 100)
    setForm((prev) => ({ ...prev, promoPrice: formatNumeric(Math.max(0, absolute)) }))
  }

  function handlePriceChange(nextPriceValue: string) {
    setForm((prev) => {
      const nextForm = { ...prev, price: nextPriceValue }

      if (promoMode !== "percent") return nextForm

      const previousBasePrice = parseNumericInput(prev.price)
      const previousAbsolutePromo = parseNumericInput(prev.promoPrice)
      if (previousBasePrice == null || previousBasePrice <= 0 || previousAbsolutePromo == null) {
        return nextForm
      }

      const nextBasePrice = parseNumericInput(nextPriceValue)
      if (nextBasePrice == null || nextBasePrice <= 0) {
        nextForm.promoPrice = ""
        return nextForm
      }

      const previousPercent = ((previousBasePrice - previousAbsolutePromo) / previousBasePrice) * 100
      const safePercent = Math.min(100, Math.max(0, previousPercent))
      nextForm.promoPrice = formatNumeric(Math.max(0, nextBasePrice * (1 - safePercent / 100)))
      return nextForm
    })
  }

  function addDetailRow() {
    setForm((prev) => ({
      ...prev,
      details: [...prev.details, { label: "", value: "" }],
    }))
  }

  function updateDetailRow(index: number, field: keyof ProductDetail, nextValue: string) {
    setForm((prev) => ({
      ...prev,
      details: prev.details.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: nextValue } : row
      ),
    }))
  }

  function removeDetailRow(index: number) {
    setForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  function Thumb({
    item,
  }: {
    item: {
      id: string
      kind: "existing" | "files"
      src: string
      filename: string | null
      file: File | null
    }
  }) {
    const isExisting = item.kind === "existing"

    const onRemove = () => {
      if (isExisting && item.filename) {
        const idx = form.existing.indexOf(item.filename)
        if (idx !== -1) removeExistingAt(idx)
      } else if (!isExisting && item.file) {
        const idx = form.files.indexOf(item.file)
        if (idx !== -1) removeFileAt(idx)
      }
    }

    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move"
          e.dataTransfer.setData("text/plain", item.id)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const sourceId = e.dataTransfer.getData("text/plain")
          reorderThumbs(sourceId, item.id)
        }}
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 cursor-move"
      >
        {item.src && <img src={item.src} alt="" className="h-full w-full object-cover" />}
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-600 hover:text-white"
          title="Supprimer l'image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return open ? (
    <>
      <div
        className="fixed inset-0 z-40 h-[100vh] bg-slate-900/40 backdrop-blur-[2px]"
        onClick={() => {
          setOpen(false)
          closeCategoryDropdown()
        }}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {editState.mode === "create" ? "Nouveau produit" : "Modifier le produit"}
          </h2>
          <button
            onClick={() => {
              setOpen(false)
              closeCategoryDropdown()
            }}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          <div className="rounded-2xl border border-slate-200 p-2 bg-slate-50/50">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm">
              {mainImageSrc ? (
                <img src={mainImageSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 transition-colors hover:bg-slate-50 group"
                >
                  <div className="rounded-full bg-slate-100 p-4 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                    <PlusIcon className="h-8 w-8 text-slate-300 transition-colors group-hover:text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-400 group-hover:text-blue-600">
                    Ajouter l&apos;image principale
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {orderedThumbs.slice(0, 4).map((item) => (
              <Thumb key={item.id} item={item} />
            ))}
            {Array.from({ length: Math.max(0, 4 - Math.min(4, allImageCount)) }).map((_, i) => (
              <button
                key={`add-${i}`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500"
              >
                <PlusIcon className="h-6 w-6" />
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addImagesFromInput(e.target.files)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Référence *</label>
              <input
                type="text"
                value={form.sku}
                placeholder="SKU-001"
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Nom du produit *</label>
              <input
                type="text"
                value={form.name}
                placeholder="Ex: T-shirt en coton"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Description</label>
            <textarea
              value={form.description}
              placeholder="Décrivez les caractéristiques du produit..."
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClasses} resize-none`}
              rows={8}
            />
          </div>

          <div className="relative">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Catégories</label>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-left text-sm transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
            >
              <span className={selectedCategoryObjs.length === 0 ? "text-slate-400" : "font-medium text-slate-700"}>
                {categorySummary}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto p-1.5">
                  {allCategories
                    .filter((c) =>
                      !categorySearch ? true : c.name.toLowerCase().includes(categorySearch.toLowerCase())
                    )
                    .map((cat) => {
                      const checked = form.categories.includes(cat.id)
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              checked
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {checked && <div className="h-2 w-2 bg-white rounded-[1px]" />}
                          </span>
                          <span className={`truncate text-sm ${checked ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                            {cat.name}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>
            )}
          </div>

          <ProductVariantsEditor
            isVariant={isVariant}
            setIsVariant={setIsVariant}
            isParent={isParent}
            setIsParent={setIsParent}
            hidden={hideCollectionToggle}
          />

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/30 p-5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Spécifications</label>
              <button
                type="button"
                onClick={addDetailRow}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-600 border border-slate-200 shadow-sm transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                <PlusIcon className="h-3 w-3" />
                Ajouter
              </button>
            </div>

            {form.details.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center">
                <p className="text-xs text-slate-400 italic">Aucune spécification ajoutée.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {form.details.map((row, index) => (
                  <div key={index} className="flex gap-2 items-center group"> 
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateDetailRow(index, "label", e.target.value)}
                      placeholder="Caractéristique"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                    />
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => updateDetailRow(index, "value", e.target.value)}
                      placeholder="Valeur"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                    />
                    <button
                      type="button"
                      onClick={() => removeDetailRow(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Prix de vente *</label>
              <div className="relative">
                 <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={`${inputClasses} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {form.currency || "$"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Promotion</label>
              <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50/30 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-600/5">
                <input
                  type="number"
                  step="0.01"
                  value={promoInputValue}
                  onChange={(e) => handlePromoInputChange(e.target.value)}
                  placeholder={promoMode === "percent" ? "0" : "0.00"}
                  className="h-10 w-full bg-transparent px-4 text-sm outline-none placeholder:text-slate-400"
                />
                <div className="flex p-1 gap-1 border-l border-slate-100 bg-white/50">
                  <button
                    type="button"
                    onClick={() => handlePromoModeChange("percent")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      promoMode === "percent" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromoModeChange("price")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      promoMode === "price" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {form.currency || "$"}
                  </button>
                </div>
              </div>
              {promoMode === "percent" && (
                <div className="mt-2 flex items-center gap-1.5 px-1">
                  <div className="h-1 w-1 rounded-full bg-blue-500" />
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                    Prix final : <span className="text-blue-600">{form.promoPrice || "0"} {form.currency}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <SwitchField
              id="isActive"
              checked={form.isActive}
              onChange={(next) => setForm({ ...form, isActive: next })}
              label="Statut du produit"
              description="Activer pour permettre l'achat et la gestion des stocks"
            />
            <SwitchField
              id="inView"
              checked={form.inView}
              onChange={(next) => setForm({ ...form, inView: next })}
              label="Visibilité Boutique"
              description="Rendre visible le produit dans le catalogue public"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={submitProduct} 
              disabled={adding} 
              className="flex-[2] flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
            >
              {adding ? (
                <div className="flex items-center gap-2">
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                   <span>Traitement...</span>
                </div>
              ) : (
                editState.mode === "create" ? "Créer le produit" : "Enregistrer les modifications"
              )}
            </button>
            <button
              onClick={() => {
                setOpen(false)
                closeCategoryDropdown()
              }}
              className="flex-1 rounded-xl bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-[0.98]"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  ) : null
}
