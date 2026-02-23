export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  content: string
  published: boolean
  created: string
  updated: string
}

export type BlogPostPreview = Omit<BlogPost, 'content'>

export type PostUpsertInput = {
  title?: string
  slug?: string
  excerpt?: string
  coverImage?: string
  content?: string
  published?: boolean
}
