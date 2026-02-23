import 'server-only'

import DOMPurify from 'isomorphic-dompurify'
import { getAdminPbForAction } from '@/lib/admin/actions'
import { assertPocketBaseId } from '@/lib/admin/validation'
import { getPb } from '@/lib/pb'
import type { BlogPost, BlogPostPreview, PostUpsertInput } from '@/types/post.types'
import { slugify } from '@/utils/slug'

const POSTS_COLLECTION = 'posts'
const VALID_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function escapePbFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function toSafeText(value: unknown, max = 8000): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function toSafeCoverImage(value: unknown): string {
  const cleaned = toSafeText(value, 2048)
  if (!cleaned) return ''
  if (cleaned.startsWith('/')) return cleaned
  if (/^https?:\/\//i.test(cleaned)) return cleaned
  return ''
}

function sanitizeHtmlContent(value: unknown): string {
  const raw = toSafeText(value, 200000).replace(/\r\n/g, '\n')
  if (!raw) return ''
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script'],
    ADD_ATTR: ['style', 'target', 'rel'],
  })
}

function normalizeSlug(slug: unknown, fallbackTitle: unknown): string {
  const candidate = toSafeText(slug, 300) || toSafeText(fallbackTitle, 300)
  const normalized = slugify(candidate)
  if (!normalized || !VALID_SLUG_REGEX.test(normalized)) {
    throw new Error('Invalid post slug.')
  }
  return normalized
}

function mapPost(record: Record<string, unknown>): BlogPost {
  return {
    id: String(record.id ?? ''),
    title: toSafeText(record.title, 300),
    slug: toSafeText(record.slug, 300),
    excerpt: toSafeText(record.excerpt, 2000),
    coverImage: toSafeCoverImage(record.coverImage),
    content: sanitizeHtmlContent(record.content),
    published: Boolean(record.published),
    created: toSafeText(record.created, 64),
    updated: toSafeText(record.updated, 64),
  }
}

function normalizeInput(input: PostUpsertInput, mode: 'create' | 'update') {
  const title = toSafeText(input.title, 300)
  if (mode === 'create' && !title) {
    throw new Error('Post title is required.')
  }

  const payload: Record<string, unknown> = {}
  if (title) payload.title = title
  if (mode === 'create' || input.slug != null || title) {
    payload.slug = normalizeSlug(input.slug, input.title)
  }
  if (mode === 'create' || input.excerpt != null) {
    payload.excerpt = toSafeText(input.excerpt, 2000)
  }
  if (mode === 'create' || input.coverImage != null) {
    payload.coverImage = toSafeCoverImage(input.coverImage)
  }
  if (mode === 'create' || input.content != null) {
    payload.content = sanitizeHtmlContent(input.content)
  }
  if (input.published != null || mode === 'create') {
    payload.published = Boolean(input.published)
  }

  return payload
}

export async function getAllPublishedPosts(): Promise<BlogPostPreview[]> {
  const pb = getPb()
  const records = await pb.collection(POSTS_COLLECTION).getFullList({
    filter: 'published=true',
    sort: '-created',
    requestKey: null,
  })

  return records.map((record) => {
    const post = mapPost(record as unknown as Record<string, unknown>)
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      published: post.published,
      created: post.created,
      updated: post.updated,
    }
  })
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalized = toSafeText(slug, 300)
  if (!VALID_SLUG_REGEX.test(normalized)) return null

  const pb = getPb()
  const filter = `slug="${escapePbFilterValue(normalized)}" && published=true`

  try {
    const record = await pb.collection(POSTS_COLLECTION).getFirstListItem(filter, {
      requestKey: null,
    })
    return mapPost(record as unknown as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function getAdminPosts(): Promise<BlogPost[]> {
  const { pb } = await getAdminPbForAction()
  const records = await pb.collection(POSTS_COLLECTION).getFullList({
    sort: '-updated',
    requestKey: null,
  })
  return records.map((record) => mapPost(record as unknown as Record<string, unknown>))
}

export async function getAdminPostById(id: string): Promise<BlogPost | null> {
  assertPocketBaseId(id, 'post id')
  const { pb } = await getAdminPbForAction()

  try {
    const record = await pb.collection(POSTS_COLLECTION).getOne(id, { requestKey: null })
    return mapPost(record as unknown as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function createPost(input: PostUpsertInput): Promise<BlogPost> {
  const { pb } = await getAdminPbForAction()
  const payload = normalizeInput(input, 'create')
  const created = await pb.collection(POSTS_COLLECTION).create(payload)
  return mapPost(created as unknown as Record<string, unknown>)
}

export async function updatePost(id: string, input: PostUpsertInput): Promise<BlogPost> {
  assertPocketBaseId(id, 'post id')
  const { pb } = await getAdminPbForAction()
  const payload = normalizeInput(input, 'update')
  const updated = await pb.collection(POSTS_COLLECTION).update(id, payload)
  return mapPost(updated as unknown as Record<string, unknown>)
}

export async function deletePost(id: string): Promise<{ ok: true }> {
  assertPocketBaseId(id, 'post id')
  const { pb } = await getAdminPbForAction()
  await pb.collection(POSTS_COLLECTION).delete(id)
  return { ok: true }
}
