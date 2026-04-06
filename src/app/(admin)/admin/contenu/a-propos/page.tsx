import { getAboutContent } from '@/lib/services/site-content.service'
import AboutEditorClient from './a-propos-editor.client'

export default function AboutEditorPage() {
  const content = getAboutContent()
  return <AboutEditorClient initial={content} />
}
