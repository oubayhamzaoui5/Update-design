'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { EDITABLE_CATALOGUE_META, type EditableCatalogueContent, type EditableCatalogueKey, normalizeEditableCatalogueContent } from '@/lib/catalogue/editable-catalogue'
import { saveEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'

type Result = { success: boolean; error?: string }

export async function updateEditableCatalogueAction(
  key: EditableCatalogueKey,
  data: EditableCatalogueContent,
): Promise<Result> {
  try {
    await requireAdmin()
    const content = normalizeEditableCatalogueContent(data)
    await saveEditableCatalogueContent(key, content)
    revalidatePath(EDITABLE_CATALOGUE_META[key].href)
    revalidatePath('/admin/catalogue')
    revalidatePath(`/admin/catalogue/${key}`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde.',
    }
  }
}
