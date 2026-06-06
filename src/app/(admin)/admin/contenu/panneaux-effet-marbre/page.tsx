import CataloguePageEditorClient from '../catalogue-page-editor.client'
import { DEFAULT_MARBLE_PANELS_CONTENT } from '@/lib/site-page-defaults'
import { getSitePageContent } from '@/lib/services/site-content.service'

export default async function MarblePanelsEditorPage() {
  const content = await getSitePageContent('panneaux-effet-marbre', DEFAULT_MARBLE_PANELS_CONTENT)
  return <CataloguePageEditorClient kind="marble" initial={content} />
}
