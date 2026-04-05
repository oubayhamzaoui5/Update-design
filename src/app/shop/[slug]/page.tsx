import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getShopList, getShopCategoryBySlugDirect, parseShopListInput } from '@/lib/services/product.service'
import ShopClient from '../shop.client'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getShopCategoryBySlugDirect(slug)
  if (!category) return {}

  const title = `${category.name} — Update Design`
  const description = category.description
    ? category.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 155)
    : `Découvrez notre gamme ${category.name} — Update Design, fournisseur décoration en gros en Tunisie.`

  return {
    title,
    description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      title,
      description,
      url: `/shop/${slug}`,
      siteName: 'Update Design',
      type: 'website',
      locale: 'fr_TN',
    },
  }
}

export default async function ShopCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const category = await getShopCategoryBySlugDirect(slug)

  if (!category) notFound()

  const sp = await searchParams
  const input = parseShopListInput({ ...sp, category: slug })
  const data = await getShopList(input)

  return <ShopClient data={data} searchParams={{ ...sp, category: slug }} />
}
