import 'server-only'

import { unstable_cache } from 'next/cache'
import { z } from 'zod'

import { createServerPb } from '@/lib/pb'

const PB_ID_REGEX = /^[a-zA-Z0-9]{15}$/
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i

const SHOP_PAGE_SIZE_DEFAULT = 24
const SHOP_PAGE_SIZE_MAX = 48
const SHOP_RELATED_LIMIT = 4

const shopListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(SHOP_PAGE_SIZE_MAX).default(SHOP_PAGE_SIZE_DEFAULT),
  query: z.string().trim().max(80).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  promotions: z.enum(['0', '1']).optional(),
  nouveautes: z.enum(['0', '1']).optional(),
  sort: z.enum(['name', 'priceAsc', 'priceDesc', 'latest']).default('name'),
})

const productSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(SLUG_REGEX, 'Invalid slug')

type PocketBaseRecord = Record<string, unknown>
type ProductDetailRecord = { label?: unknown; value?: unknown }

export type ShopCategory = {
  id: string
  name: string
  slug: string
  parent: string | string[] | null
  description: string | null
  promo: number
  activeAll: boolean
}

export type ProductListItem = {
  id: string
  slug: string
  sku: string
  name: string
  price: number
  promoPrice: number | null
  isActive: boolean
  inView: boolean
  description: string
  images: string[]
  imageUrls: string[]
  currency: string
  categories: string[]
  isNew: boolean
  isParent: boolean
  variantKey: Record<string, string>
  stock: number
  inStock: boolean
}

export type ShopListInput = z.infer<typeof shopListQuerySchema>

export type ShopListResult = {
  products: ProductListItem[]
  categories: ShopCategory[]
  categorySlug: string | null
  activeCategory: ShopCategory | null
  pagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
  }
  applied: {
    query: string
    promotions: boolean
    nouveautes: boolean
    sort: ShopListInput['sort']
  }
}

export type ProductAvailability = {
  stock: number
  inStock: boolean
}

export type ProductVariantValue = {
  id: string
  value: string
  resolvedValue: { type: 'image' | 'color' | 'text'; url?: string; value?: string }
}

export type ProductDetailsResult = {
  product: ProductListItem & {
    details: Array<{ label: string; value: string }>
    image: string
  }
  categories: ShopCategory[]
  categoryName: string
  imageUrls: string[]
  availability: ProductAvailability
  variants: Array<ProductListItem & { image: string }>
  variantUrlMap: Record<string, string>
  variantValuesMap: Record<string, ProductVariantValue[]>
  relatedProducts: ProductListItem[]
}

function escapePbString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function normalizeCategoryIds(record: PocketBaseRecord): string[] {
  const raw = (record.categories ?? record.category ?? []) as unknown
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (!raw) return []
  return [String(raw)]
}

function getPbBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PB_URL ??
    process.env.POCKETBASE_URL ??
    'http://127.0.0.1:8090'
  )
}

function fileUrl(collection: string, id: string, filename: string): string {
  return `${getPbBaseUrl()}/api/files/${collection}/${id}/${encodeURIComponent(filename)}`
}

function mapCategory(record: PocketBaseRecord): ShopCategory {
  return {
    id: String(record.id ?? ''),
    name: String(record.name ?? ''),
    slug: String(record.slug ?? ''),
    parent: (record.parent as string | string[] | null | undefined) ?? null,
    description: String(record.desc ?? record.description ?? '') || null,
    promo: Number(record.promo ?? 0),
    activeAll: Boolean(record.activeAll),
  }
}

function resolveCategoryPromoPrice(
  price: number,
  promoPrice: number | null,
  categoryIds: string[],
  categoriesById?: Map<string, ShopCategory>
): number | null {
  const productPromo =
    promoPrice != null && promoPrice > 0 && promoPrice < price ? promoPrice : null

  if (!categoriesById || categoryIds.length === 0) return productPromo

  const overridingCategories = categoryIds
    .map((categoryId) => categoriesById.get(categoryId))
    .filter((category): category is ShopCategory => !!category && category.activeAll)

  // No category is configured to override product promotions.
  if (overridingCategories.length === 0) return productPromo

  let bestPromo: number | null = null

  for (const category of overridingCategories) {
    const percent = Number(category.promo ?? 0)
    if (!Number.isFinite(percent) || percent <= 0) continue

    const cappedPercent = Math.min(100, Math.max(0, percent))
    const candidate = Number((price * (1 - cappedPercent / 100)).toFixed(2))
    if (candidate <= 0 || candidate >= price) continue

    if (bestPromo == null || candidate < bestPromo) {
      bestPromo = candidate
    }
  }

  // At least one category overrides product promo:
  // use best category promo if available, otherwise no promo.
  return bestPromo
}

function mapProduct(
  record: PocketBaseRecord,
  categoriesById?: Map<string, ShopCategory>
): ProductListItem {
  const id = String(record.id ?? '')
  const images = Array.isArray(record.images) ? record.images.map(String) : []
  const stock = Number(record.stock ?? 0)
  const price = Number(record.price ?? 0)
  const rawPromo =
    record.promoPrice === null || record.promoPrice === undefined
      ? null
      : Number(record.promoPrice)
  const categoryIds = normalizeCategoryIds(record)
  return {
    id,
    slug: String(record.slug ?? ''),
    sku: String(record.sku ?? ''),
    name: String(record.name ?? ''),
    price,
    promoPrice: resolveCategoryPromoPrice(price, rawPromo, categoryIds, categoriesById),
    isActive: Boolean(record.isActive),
    inView: record.inView === undefined || record.inView === null ? true : Boolean(record.inView),
    description: String(record.description ?? ''),
    images,
    imageUrls: images.map((img) => fileUrl('products', id, img)),
    currency: String(record.currency ?? 'DT'),
    categories: categoryIds,
    isNew: Boolean(record.isNew),
    isParent: Boolean(record.isParent),
    variantKey: (record.variantKey as Record<string, string> | undefined) ?? {},
    stock,
    inStock: stock > 0,
  }
}

const getCachedCategories = unstable_cache(
  async (): Promise<ShopCategory[]> => {
    const pb = createServerPb()
    const records = await pb.collection('categories').getFullList(500, {
      sort: 'name',
      fields: 'id,name,slug,parent,desc,description,promo,activeAll',
      requestKey: null,
    })
    return records.map((c) => mapCategory(c as PocketBaseRecord))
  },
  ['shop-categories-v1'],
  { revalidate: 300, tags: ['shop-categories'] }
)

function sortToPocketBase(sort: ShopListInput['sort']): string {
  if (sort === 'priceAsc') return 'price'
  if (sort === 'priceDesc') return '-price'
  if (sort === 'latest') return '-created'
  return 'name'
}

function parseVariantRef(raw: string) {
  const imageMatch = raw.match(/^isImage\((.+)\)$/)
  if (imageMatch) return { type: 'image' as const, id: imageMatch[1] }

  const colorMatch = raw.match(/^isColor\((.+)\)$/)
  if (colorMatch) return { type: 'color' as const, id: colorMatch[1] }

  return null
}

function variantKeyToString(value: Record<string, string>): string {
  return Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|')
}

export function parseShopListInput(
  searchParams: Record<string, string | string[] | undefined>
): ShopListInput {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      if (value[0]) normalized[key] = value[0]
    } else if (typeof value === 'string') {
      normalized[key] = value
    }
  }

  return shopListQuerySchema.parse(normalized)
}

export async function getShopCategoryBySlug(slug: string): Promise<ShopCategory | null> {
  const value = slug.trim()
  if (!value) return null

  const categories = await getCachedCategories()
  return categories.find((category) => category.slug === value) ?? null
}

export async function getShopList(input: ShopListInput): Promise<ShopListResult> {
  const categories = await getCachedCategories()
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const activeCategory = input.category
    ? categories.find((c) => c.slug === input.category) ?? null
    : null

  const baseFilters = ['isActive=true', '(inView=true || inView=null)']

  if (input.query) {
    const q = escapePbString(input.query)
    baseFilters.push(`(name ~ "${q}" || sku ~ "${q}")`)
  }

  let categoryFilters: string[] = []
  if (activeCategory) {
    const childIds = categories
      .filter((cat) => {
        const parentField = cat.parent
        if (!parentField) return false
        const parentIds = Array.isArray(parentField) ? parentField : [parentField]
        return parentIds.includes(activeCategory.id)
      })
      .map((c) => c.id)

    const ids = Array.from(new Set([activeCategory.id, ...childIds]))
    categoryFilters = ids
  }

  if (input.promotions === '1') {
    baseFilters.push('promoPrice != null && promoPrice > 0 && promoPrice < price')
  }

  if (input.nouveautes === '1') {
    baseFilters.push('isNew=true')
  }

  const pb = createServerPb()

  const fetchList = async (filter: string) =>
    pb.collection('products').getList(input.page, input.perPage, {
      filter,
      sort: sortToPocketBase(input.sort),
      fields:
        'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isParent,variantKey,stock',
      requestKey: null,
    })

  const baseFilterString = baseFilters.join(' && ')
  let result: Awaited<ReturnType<typeof fetchList>>

  if (categoryFilters.length === 0) {
    result = await fetchList(baseFilterString)
  } else {
    const categoryOnRelation = categoryFilters
      .map((id) => `category ~ "${escapePbString(id)}"`)
      .join(' || ')
    const categoriesOnRelation = categoryFilters
      .map((id) => `categories ~ "${escapePbString(id)}"`)
      .join(' || ')

    result = await fetchList(`${baseFilterString} && (${categoryOnRelation})`).catch(async () => {
      return fetchList(`${baseFilterString} && (${categoriesOnRelation})`).catch(async () => {
        // Last-resort fallback: keep page responsive even if category filter schema is incompatible.
        return fetchList(baseFilterString)
      })
    })
  }

  const products = result.items.map((r: PocketBaseRecord) => mapProduct(r, categoriesById))

  return {
    products,
    categories,
    categorySlug: input.category ?? null,
    activeCategory,
    pagination: {
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      hasPrevPage: result.page > 1,
      hasNextPage: result.page < result.totalPages,
    },
    applied: {
      query: input.query ?? '',
      promotions: input.promotions === '1',
      nouveautes: input.nouveautes === '1',
      sort: input.sort,
    },
  }
}

async function getVariantsAndValues(
  baseRecord: PocketBaseRecord,
  categoriesById: Map<string, ShopCategory>
): Promise<{
  variants: Array<ProductListItem & { image: string }>
  variantUrlMap: Record<string, string>
  variantValuesMap: Record<string, ProductVariantValue[]>
}> {
  const pb = createServerPb()
  const recordId = String(baseRecord.id ?? '')
  const isParent = Boolean(baseRecord.isParent)
  const parentId = String(baseRecord.parent ?? '')

  let rawVariants: PocketBaseRecord[] = []

  if (isParent) {
    const children = await pb.collection('products').getFullList(200, {
      filter: `parent="${escapePbString(recordId)}" && isActive=true && (inView=true || inView=null)`,
      fields:
        'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isParent,parent,variantKey,stock',
      requestKey: null,
    })
    rawVariants = [baseRecord, ...(children as unknown as PocketBaseRecord[])]
  } else if (parentId && PB_ID_REGEX.test(parentId)) {
    const [parent, siblings] = await Promise.all([
      pb.collection('products').getOne(parentId, {
        fields:
          'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isParent,parent,variantKey,stock',
        requestKey: null,
      }),
      pb.collection('products').getFullList(200, {
        filter: `parent="${escapePbString(parentId)}" && isActive=true && (inView=true || inView=null)`,
        fields:
          'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isParent,parent,variantKey,stock',
        requestKey: null,
      }),
    ])
    rawVariants = [parent as unknown as PocketBaseRecord, ...(siblings as unknown as PocketBaseRecord[])]
  }

  if (rawVariants.length === 0) {
    return { variants: [], variantUrlMap: {}, variantValuesMap: {} }
  }

  const variants = rawVariants.map((v) => {
    const product = mapProduct(v, categoriesById)
    return {
      ...product,
      image: product.imageUrls[0] ?? '/aboutimg.webp',
    }
  })

  const variantUrlMap: Record<string, string> = {}
  for (const variant of variants) {
    const key = variantKeyToString(variant.variantKey ?? {})
    if (key) {
      variantUrlMap[key] = `/produit/${variant.slug}`
    }
  }

  const variableIds = new Set<string>()
  for (const variant of variants) {
    for (const raw of Object.values(variant.variantKey ?? {})) {
      const parsed = parseVariantRef(String(raw))
      if (parsed?.id && PB_ID_REGEX.test(parsed.id)) variableIds.add(parsed.id)
    }
  }

  const variableMap = new Map<string, PocketBaseRecord>()
  if (variableIds.size > 0) {
    const filter = Array.from(variableIds)
      .map((id) => `id="${escapePbString(id)}"`)
      .join(' || ')
    const records = await pb.collection('variables').getFullList(500, {
      filter,
      fields: 'id,color,image',
      requestKey: null,
    })
    for (const rec of records as unknown as PocketBaseRecord[]) {
      variableMap.set(String(rec.id ?? ''), rec)
    }
  }

  const variantValuesMap: Record<string, ProductVariantValue[]> = {}
  const keys = Object.keys(variants[0]?.variantKey ?? {})

  for (const key of keys) {
    const uniq = new Map<string, ProductVariantValue>()
    for (const variant of variants) {
      const raw = variant.variantKey?.[key]
      if (!raw || uniq.has(raw)) continue

      const parsed = parseVariantRef(raw)
      if (!parsed) {
        uniq.set(raw, {
          id: variant.id,
          value: raw,
          resolvedValue: { type: 'text', value: raw },
        })
        continue
      }

      const variable = variableMap.get(parsed.id)
      if (parsed.type === 'image') {
        const image = String(variable?.image ?? '')
        uniq.set(raw, {
          id: variant.id,
          value: raw,
          resolvedValue: {
            type: 'image',
            url: image ? fileUrl('variables', parsed.id, image) : '/aboutimg.webp',
          },
        })
      } else {
        uniq.set(raw, {
          id: variant.id,
          value: raw,
          resolvedValue: {
            type: 'color',
            value: String(variable?.color ?? '#000000'),
          },
        })
      }
    }

    variantValuesMap[key] = Array.from(uniq.values())
  }

  return {
    variants,
    variantUrlMap,
    variantValuesMap,
  }
}

async function getRelatedProducts(
  current: ProductListItem,
  categoriesById: Map<string, ShopCategory>
): Promise<ProductListItem[]> {
  const pb = createServerPb()
  const baseFilter = 'isActive=true && (inView=true || inView=null) && stock>0'
  const relatedById = new Map<string, PocketBaseRecord>()

  const addRecords = (records: PocketBaseRecord[]) => {
    for (const record of records) {
      const id = String(record.id ?? '')
      if (!id || id === current.id || relatedById.has(id)) continue
      relatedById.set(id, record)
      if (relatedById.size >= SHOP_RELATED_LIMIT) break
    }
  }

  const buildExcludeFilter = () => {
    const existing = [current.id, ...Array.from(relatedById.keys())]
    return existing.map((id) => `id!="${escapePbString(id)}"`).join(' && ')
  }

  if (current.categories.length > 0) {
    const relationFilters = [
      current.categories.map((id) => `category ~ "${escapePbString(id)}"`).join(' || '),
      current.categories.map((id) => `categories ~ "${escapePbString(id)}"`).join(' || '),
    ].filter(Boolean)

    for (const relationFilter of relationFilters) {
      if (relatedById.size >= SHOP_RELATED_LIMIT) break
      const sameCategory = await pb
        .collection('products')
        .getList(1, SHOP_RELATED_LIMIT * 3, {
          filter: `${baseFilter} && ${buildExcludeFilter()} && (${relationFilter})`,
          sort: '-created',
          fields:
            'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isParent,variantKey,stock',
          requestKey: null,
        })
        .catch(() => null)

      if (sameCategory?.items) {
        addRecords(sameCategory.items as unknown as PocketBaseRecord[])
      }
    }
  }

  if (relatedById.size < SHOP_RELATED_LIMIT) {
    const fallback = await pb.collection('products').getList(1, SHOP_RELATED_LIMIT, {
      filter: `${baseFilter} && ${buildExcludeFilter()}`,
      sort: '-created',
      fields:
        'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isParent,variantKey,stock',
      requestKey: null,
    })
    addRecords(fallback.items as unknown as PocketBaseRecord[])
  }

  const trimmed = Array.from(relatedById.values()).slice(0, SHOP_RELATED_LIMIT)
  return trimmed.map((r) => mapProduct(r, categoriesById))
}

export async function getProductDetailsBySlug(rawSlug: string): Promise<ProductDetailsResult | null> {
  const slug = productSlugSchema.safeParse(rawSlug)
  if (!slug.success) return null

  const pb = createServerPb()
  const escapedSlug = escapePbString(slug.data)

  let record: PocketBaseRecord
  try {
    const rec = await pb.collection('products').getFirstListItem(
      `slug="${escapedSlug}" && isActive=true && (inView=true || inView=null)`,
      {
        fields:
          'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isParent,parent,variantKey,details,stock',
        requestKey: null,
      }
    )
    record = rec as unknown as PocketBaseRecord
  } catch {
    return null
  }

  const categories = await getCachedCategories()
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const base = mapProduct(record, categoriesById)
  const availability: ProductAvailability = {
    stock: base.stock,
    inStock: base.inStock,
  }
  const detailsRaw: ProductDetailRecord[] = Array.isArray(record.details)
    ? (record.details as ProductDetailRecord[])
    : []
  const details = detailsRaw
    .filter((item): item is { label: string; value: string } => {
      return (
        !!item &&
        typeof item === 'object' &&
        typeof item.label === 'string' &&
        typeof item.value === 'string'
      )
    })
    .map((item) => ({ label: item.label, value: item.value }))

  const categoryName =
    base.categories.length > 0
      ? categories.find((cat) => base.categories.includes(cat.id))?.name ?? ''
      : ''

  const { variants, variantUrlMap, variantValuesMap } = await getVariantsAndValues(record, categoriesById)
  const relatedProducts = await getRelatedProducts(base, categoriesById)

  return {
    product: {
      ...base,
      details,
      image: base.imageUrls[0] ?? '/aboutimg.webp',
    },
    categories,
    categoryName,
    imageUrls: base.imageUrls.length > 0 ? base.imageUrls : ['/aboutimg.webp'],
    availability,
    variants,
    variantUrlMap,
    variantValuesMap,
    relatedProducts,
  }
}
