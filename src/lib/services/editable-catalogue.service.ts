import 'server-only'

import { getSitePageContent, saveSitePageContent } from '@/lib/services/site-content.service'
import {
  EDITABLE_CATALOGUE_META,
  type EditableCatalogueContent,
  type EditableCatalogueKey,
  normalizeEditableCatalogueContent,
} from '@/lib/catalogue/editable-catalogue'

function slugFor(key: EditableCatalogueKey) {
  return `catalogue-${key}`
}

export async function getEditableCatalogueContent(
  key: EditableCatalogueKey,
  fallback: EditableCatalogueContent,
): Promise<EditableCatalogueContent> {
  const content = await getSitePageContent(slugFor(key), fallback)
  return normalizeEditableCatalogueContent(content)
}

export async function saveEditableCatalogueContent(
  key: EditableCatalogueKey,
  content: EditableCatalogueContent,
): Promise<void> {
  await saveSitePageContent(slugFor(key), `Catalogue ${EDITABLE_CATALOGUE_META[key].title}`, content)
}
