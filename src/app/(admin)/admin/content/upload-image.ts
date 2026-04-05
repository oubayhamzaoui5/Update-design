'use server'

import fs from 'fs'
import path from 'path'
import { requireAdmin } from '@/lib/auth'

export async function uploadImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireAdmin()

    const file   = formData.get('file') as File | null
    const folder = ((formData.get('folder') as string) || 'content')
      .replace(/[^a-zA-Z0-9/_-]/g, '') // sanitize

    if (!file || file.size === 0)
      return { success: false, error: 'Aucun fichier reçu.' }
    if (!file.type.startsWith('image/'))
      return { success: false, error: 'Le fichier n\'est pas une image.' }
    if (file.size > 8 * 1024 * 1024)
      return { success: false, error: 'Fichier trop volumineux (max 8 Mo).' }

    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']
    if (!allowed.includes(ext))
      return { success: false, error: `Extension .${ext} non autorisée.` }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const destDir = path.join(process.cwd(), 'public', folder)
    fs.mkdirSync(destDir, { recursive: true })

    const filename = `${Date.now()}.${ext}`
    fs.writeFileSync(path.join(destDir, filename), buffer)

    return { success: true, url: `/${folder}/${filename}` }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur serveur.' }
  }
}
