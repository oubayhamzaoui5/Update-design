import { getParasolContent } from '@/lib/services/site-content.service'
import ParasolEditorClient from './parasol-editor.client'

export default function ParasolEditorPage() {
  const content = getParasolContent()
  return <ParasolEditorClient initial={content} />
}
