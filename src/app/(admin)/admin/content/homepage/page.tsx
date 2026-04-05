import { getHomepageContent } from '@/lib/services/site-content.service'
import HomepageEditorClient from './homepage-editor.client'

export default function HomepageEditorPage() {
  const content = getHomepageContent()
  return <HomepageEditorClient initial={content} />
}
