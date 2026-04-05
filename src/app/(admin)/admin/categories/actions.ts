'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { slugify } from '@/utils/slug'

import { getAdminPbForAction } from '@/lib/admin/actions'
import { assertPocketBaseId } from '@/lib/admin/validation'

export async function createCategoryAction(formData: FormData) {
  const { pb } = await getAdminPbForAction()

  const name = (formData.get('name') as string ?? '').trim()
  if (!name) throw new Error('Category name is required')

  const rawSlug = (formData.get('slug') as string ?? '').trim()
  const slug = slugify(rawSlug || name)
  if (!slug) throw new Error('Category slug is required')

  const order = Number(formData.get('order') ?? 0)
  const description = (formData.get('description') as string ?? '').trim() || null
  const parent = (formData.get('parent') as string ?? '').trim() || null
  const promo = Number(formData.get('promo') ?? 0)
  const activeAll = formData.get('activeAll') === 'true'

  const payload: Record<string, unknown> = {
    name,
    slug,
    order: Number.isFinite(order) ? Math.max(0, order) : 0,
    description,
    parent,
    promo: Number.isFinite(promo) ? Math.max(0, promo) : 0,
    activeAll,
  }

  const menuImage = formData.get('menuImage')
  if (menuImage instanceof File && menuImage.size > 0) payload.menuImage = menuImage

  const coverImage = formData.get('coverImage')
  if (coverImage instanceof File && coverImage.size > 0) payload.coverImage = coverImage

  const created = await pb.collection('categories').create(payload)

  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  revalidateTag('shop-categories', 'max')

  return {
    id: String(created.id ?? ''),
    name: String(created.name ?? name),
    slug: String(created.slug ?? slug),
    order: Number(created.order ?? 0),
    description: (created.description ?? created.desc ?? null) as string | null,
    parent: (created.parent ?? null) as string | null,
    promo: Number(created.promo ?? 0),
    activeAll: Boolean(created.activeAll),
    menuImage: (created.menuImage ?? null) as string | null,
    menuImageUrl: null as string | null,
    coverImage: (created.coverImage ?? null) as string | null,
    coverImageUrl: null as string | null,
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  assertPocketBaseId(id, 'category id')
  const { pb } = await getAdminPbForAction()

  const name = (formData.get('name') as string ?? '').trim()
  if (!name) throw new Error('Category name is required')

  const rawSlug = (formData.get('slug') as string ?? '').trim()
  const slug = slugify(rawSlug || name)
  if (!slug) throw new Error('Category slug is required')

  const order = Number(formData.get('order') ?? 0)
  const description = (formData.get('description') as string ?? '').trim() || null
  const parent = (formData.get('parent') as string ?? '').trim() || null
  const promo = Number(formData.get('promo') ?? 0)
  const activeAll = formData.get('activeAll') === 'true'

  const payload: Record<string, unknown> = {
    name,
    slug,
    order: Number.isFinite(order) ? Math.max(0, order) : 0,
    description,
    parent,
    promo: Number.isFinite(promo) ? Math.max(0, promo) : 0,
    activeAll,
  }

  const menuImage = formData.get('menuImage')
  if (menuImage instanceof File && menuImage.size > 0) {
    payload.menuImage = menuImage
  } else if (formData.get('removeMenuImage') === 'true') {
    payload.menuImage = null
  }

  const coverImage = formData.get('coverImage')
  if (coverImage instanceof File && coverImage.size > 0) {
    payload.coverImage = coverImage
  } else if (formData.get('removeCoverImage') === 'true') {
    payload.coverImage = null
  }

  const updated = await pb.collection('categories').update(id, payload)

  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  revalidateTag('shop-categories', 'max')

  return {
    id: String(updated.id ?? id),
    name: String(updated.name ?? name),
    slug: String(updated.slug ?? slug),
    order: Number(updated.order ?? 0),
    description: (updated.description ?? updated.desc ?? null) as string | null,
    parent: (updated.parent ?? null) as string | null,
    promo: Number(updated.promo ?? 0),
    activeAll: Boolean(updated.activeAll),
    menuImage: (updated.menuImage ?? null) as string | null,
    menuImageUrl: null as string | null,
    coverImage: (updated.coverImage ?? null) as string | null,
    coverImageUrl: null as string | null,
  }
}

export async function deleteCategoryAction(id: string) {
  assertPocketBaseId(id, 'category id')
  const { pb } = await getAdminPbForAction()
  await pb.collection('categories').delete(id)
  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  revalidateTag('shop-categories', 'max')
  return { ok: true }
}

export async function reorderCategoriesAction(
  updates: Array<{ id: string; order: number }>
) {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('No category order updates provided')
  }

  const { pb } = await getAdminPbForAction()

  await Promise.all(
    updates.map(async (update) => {
      assertPocketBaseId(update.id, 'category id')
      const safeOrder = Number.isFinite(update.order) ? Math.max(0, update.order) : 0
      await pb.collection('categories').update(update.id, { order: safeOrder })
    })
  )

  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  revalidateTag('shop-categories', 'max')
  return { ok: true }
}
