import type { Metadata } from 'next'
import Link from 'next/link'

import { getAllPublishedPosts } from '@/lib/services/posts.service'

export const metadata: Metadata = {
  title: 'Update Design | Blog',
  description: 'Actualites et guides autour de nos produits.',
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function BlogPage() {
  const posts = await getAllPublishedPosts()

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-foreground/70">Decouvrez nos conseils et inspirations.</p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/20 p-6 text-foreground/70">
          Aucun article publie pour le moment.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-xl border border-foreground/10 bg-background">
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImage} alt={post.title} className="h-52 w-full object-cover" />
              ) : (
                <div className="h-52 w-full bg-foreground/5" />
              )}
              <div className="space-y-3 p-5">
                <p className="text-xs uppercase tracking-wide text-foreground/60">
                  {post.created ? new Date(post.created).toLocaleDateString('fr-FR') : ''}
                </p>
                <h2 className="text-xl font-semibold">{post.title}</h2>
                {post.excerpt ? <p className="line-clamp-3 text-sm text-foreground/75">{post.excerpt}</p> : null}
                <Link href={`/blog/${post.slug}`} className="inline-block text-sm font-medium text-blue-600 hover:underline">
                  Lire l&apos;article
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
