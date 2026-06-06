'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { saveHomepageContent, saveAboutContent, saveStoreBrasContent, saveParasolContent, saveSitePageContent } from '@/lib/services/site-content.service'
import type { HomepageContent, AboutContent, StoreBrasContent, ParasolContent, MarblePanelsContent, WoodProfileContent } from '@/types/site-content'

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
    revalidatePath('/a-propos')
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

export async function updateWoodProfileContentAction(data: WoodProfileContent): Promise<Result> {
  try {
    await requireAdmin()
    await saveSitePageContent('profil-mural-effet-bois', 'Profil mural effet bois', data)
    revalidatePath('/profil-mural-effet-bois')
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
    return { success: false, error: msg }
  }
}

export async function updateMarblePanelsContentAction(data: MarblePanelsContent): Promise<Result> {
  try {
    await requireAdmin()
    await saveSitePageContent('panneaux-effet-marbre', 'Panneaux effet marbre', data)
    revalidatePath('/panneaux-effet-marbre')
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
    return { success: false, error: msg }
  }
}
