'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  updateVariantKeyAction,
} from '@/app/(admin)/admin/products/actions'
import { normalizeRelationIds } from '@/utils/product.utils'
import type {
  Product,
  CategoryOption,
  EditState,
  ID,
  ProductDetail,
} from '@/types/product.types'

type UseProductsProps = {
  initialProducts: Product[]
  perPage: number
  initialPage: number
  initialQuery: string
  initialSort: 'name' | 'price'
  allCategories: CategoryOption[]
  parent?: Product
}

export function useProducts({
  initialProducts,
  perPage,
  initialPage,
  initialQuery,
  initialSort,
  allCategories,
  parent,
}: UseProductsProps) {
  // State
  const [products, setProducts] = useState<Product[]>(initialProducts ?? [])
  const [query, setQuery] = useState(initialQuery || '')
  const [sortBy, setSortBy] = useState<'name' | 'price'>(initialSort)
  const [page, setPage] = useState(initialPage)
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ mode: 'create' })
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)

  // Auto-dismiss notice after 5 seconds
  const setTimedNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 5000)
  }, [])

  // Filtered and sorted products
  const filtered = useMemo(() => {
    const q = query.toLowerCase()

    return products
      .filter(
        (p) =>
          // Match query
          (p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)) &&
          // Match category
          (!categoryFilter ||
            p.categories?.some?.((c) => c === categoryFilter) ||
            p.categories.includes(categoryFilter))
      )
      .sort((a, b) =>
        sortBy === 'name'
          ? a.name.localeCompare(b.name)
          : a.price - b.price
      )
  }, [products, query, sortBy, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  // Form state
  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    promoPrice: '',
    description: '',
    isActive: true,
    inView: true,
    currency: 'DT',
    slug: '',
    existing: [] as string[],
    files: [] as File[],
    categories: [] as string[],
    details: [] as ProductDetail[],
  })

  const [isVariant, setIsVariant] = useState(false)
  const [parentId, setParentId] = useState<string | null>(null)
  const [isParent, setIsParent] = useState(false)
  const [variantKey, setVariantKey] = useState<Record<string, string | null>>({})

  // Reset form
  const resetForm = useCallback(() => {
    setForm({
      sku: '',
      name: '',
      price: '',
      promoPrice: '',
      description: '',
      isActive: true,
      inView: true,
      currency: 'DT',
      slug: '',
      existing: [],
      files: [],
      categories: [],
      details: [],
    })
    setIsVariant(false)
    setIsParent(false)
    setParentId(null)
    setVariantKey({})
  }, [])

  // Open create form
  const openCreateForm = useCallback(() => {
    setEditState({ mode: 'create' })

    if (parent) {
      // Prefill for variant
      setForm({
        sku: '',
        name: '',
        price: parent.price ? String(parent.price) : '',
        promoPrice: parent.promoPrice != null ? String(parent.promoPrice) : '',
        description: parent.description ?? '',
        isActive: true,
        inView: false,
        currency: 'DT',
        slug: '',
        existing: [],
        files: [],
        categories: Array.isArray(parent.categories)
          ? parent.categories.slice()
          : normalizeRelationIds(parent.expand?.category),
        details: Array.isArray(parent.details)
          ? parent.details.map((item) => ({ label: item.label ?? '', value: item.value ?? '' }))
          : [],
      })
      setParentId(parent.id)
      setIsVariant(true)
      setIsParent(false)
      setVariantKey({})
    } else {
      resetForm()
      setIsParent(true)
    }

    setOpen(true)
  }, [parent, resetForm])

  // Open edit form
  const openEditForm = useCallback((p: Product) => {
    setEditState({ mode: 'edit', id: p.id })
    setForm({
      sku: p.sku ?? '',
      name: p.name ?? '',
      price: p.price ? String(p.price) : '',
      promoPrice: p.promoPrice != null ? String(p.promoPrice) : '',
      description: p.description ?? '',
      isActive: !!p.isActive,
      inView: p.inView ?? true,
      currency: typeof p.currency === 'string' && p.currency ? p.currency : 'DT',
      slug: '',
      existing: Array.isArray(p.images) ? p.images.slice() : [],
      files: [],
      categories: Array.isArray(p.categories) ? p.categories.slice() : [],
      details: Array.isArray(p.details)
        ? p.details.map((item) => ({ label: item.label ?? '', value: item.value ?? '' }))
        : [],
    })
    setIsVariant(p.isVariant ?? false)
    setIsParent(p.isParent ?? (!p.isVariant && !p.parent))
    setParentId(p.parent ?? null)
    setVariantKey(p.variantKey ?? {})
    setOpen(true)
  }, [])

  // Create product
  const create = useCallback(
    async (fd: FormData, categories: string[]) => {
      setAdding(true)
      try {
        const rec = await createProductAction(fd)
        setCreatedProductId(rec.id)

        const normalized: Product = {
          ...rec,
          categories,
        }

        setProducts((prev) => [normalized, ...prev])
        setTimedNotice('âœ… Product created successfully')
        setOpen(false)
        resetForm()
      } catch (e) {
        setTimedNotice('âŒ Failed to create product')
        console.error('Create product error:', e)
      } finally {
        setAdding(false)
      }
    },
    [resetForm, setTimedNotice]
  )

  // Update product
  const update = useCallback(
    async (id: ID, fd: FormData, updatedCategories: string[]) => {
      setAdding(true)
      try {
        const rec = await updateProductAction(id, fd)

        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...rec,
                  categories: updatedCategories,
                }
              : p
          )
        )

        setTimedNotice('âœ… Product updated successfully')
        setOpen(false)
        resetForm()
      } catch (e) {
        setTimedNotice('âŒ Failed to update product')
        console.error('Update product error:', e)
      } finally {
        setAdding(false)
      }
    },
    [resetForm, setTimedNotice]
  )

  // Delete product
  const remove = useCallback(
    async (id: ID) => {
      if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return
      }

      try {
        await deleteProductAction(id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setTimedNotice('âœ… Product deleted successfully')
      } catch (e) {
        setTimedNotice('âŒ Failed to delete product')
        console.error('Delete product error:', e)
      }
    },
    [setTimedNotice]
  )

  // Update variant value
  const updateVariantValue = useCallback(
    async (variantId: ID, key: string, value: string) => {
      const product = products.find((p) => p.id === variantId)
      if (!product) return

      const newVariant = {
        ...(product.variantKey ?? {}),
        [key]: value,
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === variantId ? { ...p, variantKey: newVariant } : p
        )
      )

      try {
        await updateVariantKeyAction(variantId, newVariant)
      } catch (e) {
        console.error('Update variant key error:', e)
        // Revert on error
        setProducts((prev) =>
          prev.map((p) =>
            p.id === variantId ? { ...p, variantKey: product.variantKey } : p
          )
        )
        setTimedNotice('âŒ Failed to update variant')
      }
    },
    [products, setTimedNotice]
  )

  const submitProduct = useCallback(async () => {
    const fd = new FormData()

    fd.set('sku', form.sku.trim())
    fd.set('name', form.name.trim())
    fd.set('price', String(Number(form.price || 0)))
    fd.set('promoPrice', form.promoPrice === '' ? '' : String(Number(form.promoPrice)))
    fd.set('description', form.description)
    fd.set('isActive', String(form.isActive))
    fd.set('inView', String(form.inView))
    fd.set('currency', form.currency || 'DT')
    fd.set(
      'details',
      JSON.stringify(
        form.details
          .map((item) => ({
            label: item.label.trim(),
            value: item.value.trim(),
          }))
          .filter((item) => item.label || item.value)
      )
    )

    if (form.slug) fd.set('slug', form.slug)
    if (isVariant) fd.set('isVariant', 'true')
    if (isParent) fd.set('isParent', 'true')
    if (parentId) fd.set('parent', parentId)
    if (Object.keys(variantKey).length > 0) {
      fd.set('variantKey', JSON.stringify(variantKey))
    }

    for (const file of form.files) {
      fd.append('images', file)
    }

    if (editState.mode === 'create') {
      await create(fd, form.categories)
      return
    }

    await update(editState.id, fd, form.categories)
  }, [
    create,
    editState,
    form,
    isParent,
    isVariant,
    parentId,
    update,
    variantKey,
  ])

  return {
    // State
    products,
    pageItems,
    totalPages,
    query,
    setQuery,
    sortBy,
    setSortBy,
    page,
    setPage,
    open,
    setOpen,
    adding,
    notice,
    form,
    setForm,
    categoryDropdownOpen,
    setCategoryDropdownOpen,
    categorySearch,
    setCategorySearch,
    createdProductId,
    isVariant,
    setIsVariant,
    isParent,
    setIsParent,
    parentId,
    setParentId,
    variantKey,
    setVariantKey,
    editState,
    setEditState,
    categoryFilter,
    setCategoryFilter,

    // CRUD
    create,
    update,
    remove,
    updateVariantValue,

    // Form handlers
    openCreateForm,
    openEditForm,
    resetForm,
    submitProduct,
  }
}

