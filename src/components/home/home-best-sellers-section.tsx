import ShopProductCard from '@/app/shop/_components/shop-product-card'
import type { ProductListItem } from '@/lib/services/product.service'

type HomeBestSellersSectionProps = {
  products: ProductListItem[]
}

export default function HomeBestSellersSection({ products }: HomeBestSellersSectionProps) {
  return (
    <section className="overflow-hidden bg-white py-2 lg:py-18">
      <div className="mx-auto mb-4 lg:mb-12 flex max-w-7xl items-center justify-between px-2">
        <h2 className="text-2xl lg:text-3xl font-bold">Meilleures ventes</h2>
      </div>

      <div className="mx-auto max-w-7xl px-2 md:hidden">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-scroll always-visible-scrollbar pb-1">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="w-[calc((100%-0.75rem)/2)] min-w-[calc((100%-0.75rem)/2)] flex-none snap-start rounded-2xl border border-transparent p-1"
            >
              <ShopProductCard
                product={product}
                productHref={`/produit/${product.slug}`}
                prioritizeImage={idx < 2}
                disableAnimations
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl grid-cols-1 gap-6 px-2 md:grid md:grid-cols-2 xl:grid-cols-4">
        {products.map((product, idx) => (
          <div key={product.id} className="rounded-2xl border border-transparent p-2">
            <ShopProductCard
              product={product}
              productHref={`/produit/${product.slug}`}
              prioritizeImage={idx < 2}
              disableAnimations
            />
          </div>
        ))}
      </div>
    </section>
  )
}
