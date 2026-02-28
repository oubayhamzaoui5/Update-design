import { Suspense } from 'react'
import { getProductsWithCategories } from '@/lib/data/products.server'
import ProductsClient from './products.client'
import ProductsLoadingSkeleton from './loading'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata = {
  title: 'Update Design | Tableau de bord',
  description: 'Gerez votre catalogue produits',
  robots: 'noindex, nofollow',
}

export default async function AdminProductsPage() {
  const { products, categories, totalItems } = await getProductsWithCategories()

  return (
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsClient
        initialProducts={products}
        totalItems={totalItems}
        initialPage={1}
        perPage={Math.max(products.length, 1)}
        initialQuery=""
        initialSort="name"
        allCategories={categories}
        parentVariantKeys={[]}
        variables={[]}
      />
    </Suspense>
  )
}
