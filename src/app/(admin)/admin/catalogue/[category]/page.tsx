import { notFound } from 'next/navigation'
import CatalogueEditorClient from '../catalogue-editor.client'
import { EDITABLE_CATALOGUE_KEYS, EDITABLE_CATALOGUE_META, type EditableCatalogueKey } from '@/lib/catalogue/editable-catalogue'
import { getDefaultEditableCatalogueContent } from '@/lib/catalogue/editable-catalogue-defaults'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'

export default async function AdminCatalogueCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  if (!EDITABLE_CATALOGUE_KEYS.includes(category as EditableCatalogueKey)) {
    notFound()
  }

  const key = category as EditableCatalogueKey
  const fallback = await getDefaultEditableCatalogueContent(key)
  const content = await getEditableCatalogueContent(key, fallback)

  return <CatalogueEditorClient meta={EDITABLE_CATALOGUE_META[key]} initial={content} />
}
