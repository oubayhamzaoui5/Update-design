'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { saveHomepageContent, saveAboutContent, saveStoreBrasContent, saveParasolContent } from '@/lib/services/site-content.service'
import type { HomepageContent, AboutContent, StoreBrasContent, ParasolContent } from '@/types/site-content'

type Result = { success: boolean; error?: string }

export async function updateHomepageContentAction(data: HomepageContent): Promise<Result> {
  try {
    await requireAdmin()
    saveHomepageContent(data)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
    return { success: false, error: msg }
  }
}

export async function updateAboutContentAction(data: AboutContent): Promise<Result> {
  try {
    await requireAdmin()
    saveAboutContent(data)
    revalidatePath('/about')
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
    return { success: false, error: msg }
  }
}

export async function updateStoreBrasContentAction(data: StoreBrasContent): Promise<Result> {
  try {
    await requireAdmin()
    saveStoreBrasContent(data)
    revalidatePath('/store-bras')
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
    return { success: false, error: msg }
  }
}

export async function updateParasolContentAction(data: ParasolContent): Promise<Result> {
  try {
    await requireAdmin()
    saveParasolContent(data)
    revalidatePath('/parasols')
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
    return { success: false, error: msg }
  }
}
