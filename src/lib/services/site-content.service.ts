import 'server-only'
import fs from 'fs'
import path from 'path'
import type { HomepageContent, AboutContent, StoreBrasContent, ParasolContent } from '@/types/site-content'
import { createServerPb } from '@/lib/pb'

// ─── File paths ───────────────────────────────────────────────────────────────
// NOTE: works on self-hosted Node.js servers. Not compatible with Vercel's
// read-only serverless filesystem — use a DB-backed store there instead.
const CONTENT_DIR      = path.join(process.cwd(), 'content')
const HOMEPAGE_FILE    = path.join(CONTENT_DIR, 'homepage.json')
const ABOUT_FILE       = path.join(CONTENT_DIR, 'about.json')
const STORE_BRAS_FILE  = path.join(CONTENT_DIR, 'store-bras.json')
const PARASOL_FILE     = path.join(CONTENT_DIR, 'parasols.json')

function ensureDir() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true })
}

// ─── Read helpers ─────────────────────────────────────────────────────────────
function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

// ─── Homepage ─────────────────────────────────────────────────────────────────
const DEFAULT_HOMEPAGE: HomepageContent = readJson<HomepageContent>(
  HOMEPAGE_FILE,
  {} as HomepageContent
)

export function getHomepageContent(): HomepageContent {
  return readJson<HomepageContent>(HOMEPAGE_FILE, DEFAULT_HOMEPAGE)
}

export function saveHomepageContent(data: HomepageContent): void {
  ensureDir()
  fs.writeFileSync(HOMEPAGE_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── About ────────────────────────────────────────────────────────────────────
const DEFAULT_ABOUT: AboutContent = readJson<AboutContent>(
  ABOUT_FILE,
  {} as AboutContent
)

export function getAboutContent(): AboutContent {
  return readJson<AboutContent>(ABOUT_FILE, DEFAULT_ABOUT)
}

export function saveAboutContent(data: AboutContent): void {
  ensureDir()
  fs.writeFileSync(ABOUT_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Store à Bras Invisibles ──────────────────────────────────────────────────
const DEFAULT_STORE_BRAS: StoreBrasContent = readJson<StoreBrasContent>(STORE_BRAS_FILE, {} as StoreBrasContent)

export function getStoreBrasContent(): StoreBrasContent {
  return readJson<StoreBrasContent>(STORE_BRAS_FILE, DEFAULT_STORE_BRAS)
}

export function saveStoreBrasContent(data: StoreBrasContent): void {
  ensureDir()
  fs.writeFileSync(STORE_BRAS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Parasols ─────────────────────────────────────────────────────────────────
const DEFAULT_PARASOL: ParasolContent = readJson<ParasolContent>(PARASOL_FILE, {} as ParasolContent)

export function getParasolContent(): ParasolContent {
  return readJson<ParasolContent>(PARASOL_FILE, DEFAULT_PARASOL)
}

export function saveParasolContent(data: ParasolContent): void {
  ensureDir()
  fs.writeFileSync(PARASOL_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

async function getAdminPb() {
  const pb = createServerPb()
  const email = process.env.PB_ADMIN_EMAIL
  const password = process.env.PB_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('Identifiants administrateur PocketBase manquants.')
  }

  await pb.collection('_superusers').authWithPassword(email, password)
  return pb
}

function mergeContent<T extends Record<string, unknown>>(fallback: T, saved: unknown): T {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fallback
  return { ...fallback, ...(saved as Partial<T>) }
}

export async function getSitePageContent<T extends Record<string, unknown>>(slug: string, fallback: T): Promise<T> {
  try {
    const pb = createServerPb()
    const record = await pb.collection('site_pages').getFirstListItem(`slug="${slug}"`, {
      requestKey: null,
    })

    return mergeContent(fallback, record.content)
  } catch {
    return fallback
  }
}

export async function saveSitePageContent<T extends Record<string, unknown>>(
  slug: string,
  title: string,
  content: T,
): Promise<void> {
  const pb = await getAdminPb()

  try {
    const existing = await pb.collection('site_pages').getFirstListItem(`slug="${slug}"`, {
      requestKey: null,
    })
    await pb.collection('site_pages').update(existing.id, { slug, title, content }, { requestKey: null })
  } catch {
    await pb.collection('site_pages').create({ slug, title, content }, { requestKey: null })
  }
}
