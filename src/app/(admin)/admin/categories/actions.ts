'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { slugify } from '@/utils/slug'

import { getAdminPbForAction } from '@/lib/admin/actions'
import { assertPocketBaseId } from '@/lib/admin/validation'

type UpsertCategoryInput = {
  name: string
  slug: string
  parentIds: string[]
  desc?: string
  promo?: number
  activeAll?: boolean
}

function normalizePayload(input: UpsertCategoryInput) {
  const name = input.name.trim()
  if (!name) throw new Error('Category name is required')

  const slug = slugify(input.slug.trim() || name)
  if (!slug) throw new Error('Category slug is required')

  const promo =
    typeof input.promo === 'number' && Number.isFinite(input.promo)
      ? Math.max(0, input.promo)
      : 0

  return {
    name,
    slug,
    parent: input.parentIds.length ? input.parentIds : null,
    desc: input.desc?.trim() ?? '',
    promo,
    activeAll: Boolean(input.activeAll),
  }
}

export async function createCategoryAction(input: UpsertCategoryInput) {
  const { pb } = await getAdminPbForAction()
  const payload = normalizePayload(input)
  const created = await pb.collection('categories').create(payload)
  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
  revalidatePath('/shop')
  revalidateTag('shop-categories', 'max')
  return created
}

export async function updateCategoryAction(id: string, input: UpsertCategoryInput) {
  assertPocketBaseId(id, 'category id')
  const { pb } = await getAdminPbForAction()
  const payload = normalizePayload(input)
  const updated = await pb.collection('categories').update(id, payload)
  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
  revalidatePath('/shop')
  revalidateTag('shop-categories', 'max')
  return updated
}

export async function deleteCategoryAction(id: string) {
  assertPocketBaseId(id, 'category id')
  const { pb } = await getAdminPbForAction()
  await pb.collection('categories').delete(id)
  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
  revalidatePath('/shop')
  revalidateTag('shop-categories', 'max')
  return { ok: true }
}
