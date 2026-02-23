import Link from 'next/link'

import { deletePostAction, togglePostPublishedAction } from '@/app/(admin)/admin/blog/actions'
import { getAdminPosts } from '@/lib/services/posts.service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata = {
  title: 'Blog | Administration',
  description: 'Gerez les articles du blog',
  robots: 'noindex, nofollow',
}

export default async function AdminBlogPage() {
  const posts = await getAdminPosts()

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Blog</h1>
          <p className="text-sm text-foreground/70">Gerez vos articles MDX stockes dans PocketBase.</p>
        </div>
        <Link
          href="/admin/blog/create"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Nouvel article
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/20 p-8 text-sm text-foreground/70">
          Aucun article pour le moment.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-foreground/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5">
              <tr>
                <th className="px-4 py-3 font-semibold">Titre</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Etat</th>
                <th className="px-4 py-3 font-semibold">Mis a jour</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-foreground/10">
                  <td className="px-4 py-3">{post.title}</td>
                  <td className="px-4 py-3 text-foreground/70">/{post.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        post.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {post.published ? 'Publie' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {post.updated ? new Date(post.updated).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="rounded-md border border-foreground/20 px-3 py-1.5 text-xs font-medium hover:bg-foreground/5"
                      >
                        Modifier
                      </Link>

                      <form action={togglePostPublishedAction.bind(null, post.id, !post.published)}>
                        <button
                          type="submit"
                          className="rounded-md border border-foreground/20 px-3 py-1.5 text-xs font-medium hover:bg-foreground/5"
                        >
                          {post.published ? 'Masquer' : 'Publier'}
                        </button>
                      </form>

                      <form action={deletePostAction.bind(null, post.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

