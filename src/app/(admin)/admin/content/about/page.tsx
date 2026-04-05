import { getAboutContent } from '@/lib/services/site-content.service'
import AboutEditorClient from './about-editor.client'

export default function AboutEditorPage() {
  const content = getAboutContent()
  return <AboutEditorClient initial={content} />
}
