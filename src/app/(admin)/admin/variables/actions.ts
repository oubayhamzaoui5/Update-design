'use server'

import { revalidatePath } from 'next/cache'

import { getAdminPbForAction } from '@/lib/admin/actions'
import { assertPocketBaseId } from '@/lib/admin/validation'

export async function createVariableAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim()

  if (!name) throw new Error('Variable name is required')
  if (type !== 'color' && type !== 'image') throw new Error('Invalid variable type')

  const safe = new FormData()
  safe.set('name', name)
  safe.set('type', type)

  if (type === 'color') {
    const color = String(formData.get('color') ?? '').trim()
    if (!color) throw new Error('Color value is required')
    safe.set('color', color)
  }

  if (type === 'image') {
    const image = formData.get('image')
    if (!(image instanceof File) || image.size === 0) {
      throw new Error('Image file is required')
    }
    safe.set('image', image)
  }

  const { pb } = await getAdminPbForAction()
  const created = await pb.collection('variables').create(safe)
  revalidatePath('/admin/variables')
  revalidatePath('/admin/products')
  return created
}

export async function deleteVariableAction(id: string) {
  assertPocketBaseId(id, 'variable id')
  const { pb } = await getAdminPbForAction()
  await pb.collection('variables').delete(id)
  revalidatePath('/admin/variables')
  revalidatePath('/admin/products')
  return { ok: true }
}
