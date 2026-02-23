import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import ReadingProgress from './_components/reading-progress'
import { getPostBySlug } from '@/lib/services/posts.service'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function estimateReadingTime(html: string): number {
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = plain ? plain.split(' ').length : 0
  return Math.max(1, Math.ceil(words / 220))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Update Design | Article not found',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `Update Design | ${post.title}`,
    description: post.excerpt || post.title,
    openGraph: {
      title: `Update Design | ${post.title}`,
      description: post.excerpt || post.title,
      type: 'article',
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const readingTime = estimateReadingTime(post.content)
  const publishedAt = post.created ? new Date(post.created).toLocaleDateString('en-US') : ''

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-20 pt-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:px-6">
      <ReadingProgress />

      <article className="mx-auto w-full max-w-[820px]">
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400" style={{ fontFamily: 'Inter, Geist, system-ui, sans-serif' }}>
            {publishedAt ? <span>{publishedAt}</span> : null}
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl" style={{ fontFamily: 'Inter, Geist, system-ui, sans-serif' }}>
            {post.title}
          </h1>

          {post.excerpt ? <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">{post.excerpt}</p> : null}
        </header>

        {post.coverImage ? (
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1600}
              height={900}
              unoptimized
              className="h-auto w-full object-cover"
              sizes="(max-width: 900px) 100vw, 820px"
              priority
            />
          </div>
        ) : null}

        <div
          className="prose prose-blue max-w-none dark:prose-invert prose-headings:font-semibold prose-img:rounded-xl"
          style={{ fontFamily: 'Georgia, Merriweather, Charter, serif' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  )
}

