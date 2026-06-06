import 'server-only'

import { createServerPb } from '@/lib/pb'

type ProductLinkRecord = {
  slug?: unknown
  sku?: unknown
}

export async function getProductHrefBySku(): Promise<Record<string, string>> {
  try {
    const pb = createServerPb()
    const products = await pb.collection('products').getFullList<ProductLinkRecord>({
      fields: 'slug,sku',
      requestKey: null,
    })

    return products.reduce<Record<string, string>>((acc, product) => {
      const sku = typeof product.sku === 'string' ? product.sku.trim().toUpperCase() : ''
      const slug = typeof product.slug === 'string' ? product.slug.trim() : ''
      if (sku && slug) acc[sku] = `/produit/${slug}`
      return acc
    }, {})
  } catch {
    return {}
  }
}
