import CataloguePageEditorClient from '../catalogue-page-editor.client'
import { DEFAULT_WOOD_PROFILE_CONTENT } from '@/lib/site-page-defaults'
import { getSitePageContent } from '@/lib/services/site-content.service'

export default async function WoodProfileEditorPage() {
  const content = await getSitePageContent('profil-mural-effet-bois', DEFAULT_WOOD_PROFILE_CONTENT)
  return <CataloguePageEditorClient kind="wood" initial={content} />
}
