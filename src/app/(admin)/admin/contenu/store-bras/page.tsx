import { getStoreBrasContent } from '@/lib/services/site-content.service'
import StoreBrasEditorClient from './store-bras-editor.client'

export default function StoreBrasEditorPage() {
  const content = getStoreBrasContent()
  return <StoreBrasEditorClient initial={content} />
}
