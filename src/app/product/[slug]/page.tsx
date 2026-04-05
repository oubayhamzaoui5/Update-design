import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ProductClient from '@/app/shop/[slug]/product.client'
import { getProductDetailsBySlug } from '@/lib/services/product.service'
import { getOAuthKeys } from '@/lib/oauth-keys'

export const revalidate = 120

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductDetailsBySlug(slug)
  const product = data?.product

  return {
    title: product
      ? `${product.name} | Update Design`
      : 'Produit | Update Design',
    description: product?.description
      ? product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
      : 'Matériaux de décoration haut de gamme — Update Design Tunisie.',
    alternates: { canonical: `/product/${slug}` },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [data, metaPixelId] = await Promise.all([
    getProductDetailsBySlug(slug),
    Promise.resolve(getOAuthKeys()?.metaPixelId ?? null),
  ])

  if (!data) {
    notFound()
  }

  return (
    <ProductClient
      product={data.product}
      imageUrls={data.imageUrls}
      categoryName={data.categoryName}
      categories={data.categories}
      explicitRelatedProducts={data.explicitRelatedProducts}
      relatedProducts={data.relatedProducts}
      availability={data.availability}
      variants={data.variants}
      variantUrlMap={data.variantUrlMap}
      variantValuesMap={data.variantValuesMap}
      metaPixelId={metaPixelId}
    />
  )
}
