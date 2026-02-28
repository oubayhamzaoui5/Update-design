import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import PostForm from '@/app/(admin)/admin/blog/_components/post-form'
import { createPostAction } from '@/app/(admin)/admin/blog/actions'
import { getAdminRelatedProductOptions } from '@/lib/services/posts.service'

export const dynamic = 'force-dynamic'

export default async function AdminCreateBlogPostPage() {
  const productOptions = await getAdminRelatedProductOptions()

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <Link
          href="/admin/blog"
          className="group inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-blue-600"
        >
          <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          Retour aux articles
        </Link>
      </div>

      <PostForm action={createPostAction} submitLabel="Creer l'article" productOptions={productOptions} />
    </div>
  )
}

