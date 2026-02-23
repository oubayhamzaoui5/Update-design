import type { Metadata } from 'next'
import { PackageSearch, ScrollText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'
import OrdersListClient from '@/app/commandes/_components/orders-list.client'
import type { CustomerOrder } from '@/lib/services/orders.service'
import { getCurrentUserOrders, getRecommendedProductsFromOrders, OrdersServiceError } from '@/lib/services/orders.service'
import OrdersAuthRecoveryClient from '@/app/commandes/_components/orders-auth-recovery.client'
import ShopProductCard from '@/app/shop/_components/shop-product-card'

export const metadata: Metadata = {
  title: 'Update Design | Mes commandes',
}

export default async function CommandesPage() {
  let orders: CustomerOrder[] = []
  let recommendedProducts: Awaited<ReturnType<typeof getRecommendedProductsFromOrders>> = []
  let unauthenticated = false

  try {
    orders = await getCurrentUserOrders()
  } catch (error) {
    if (error instanceof OrdersServiceError && error.code === 'UNAUTHENTICATED') {
      unauthenticated = true
    } else {
      throw error
    }
  }

  if (!unauthenticated) {
    recommendedProducts = await getRecommendedProductsFromOrders(orders, 6)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28">
        {unauthenticated ? (
          <OrdersAuthRecoveryClient />
        ) : (
          <>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Mes commandes</h1>
            <p className="mt-2 text-slate-500">
              Gérez vos achats et suivez vos livraisons en temps réel.
            </p>
          </div>
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:opacity-80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 py-20 text-center">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <PackageSearch className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-900">Aucune commande</h2>
            <p className="mt-2 max-w-xs text-slate-500">
              Vous n'avez pas encore passé de commande. Vos futurs achats apparaîtront ici.
            </p>
            <Link href="/shop" className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-all">
              Commencer mes achats
            </Link>
          </div>
        ) : (
          <OrdersListClient orders={orders} />
        )}

        {recommendedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Vous pourriez aimer</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recommandé selon vos commandes, avec des nouveautés en complément.
                </p>
              </div>
              <Link href="/shop" className="text-sm font-medium text-accent hover:opacity-80">
                Voir plus
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {recommendedProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-transparent p-2 transition hover:border-foreground/15 hover:bg-foreground/[0.02]"
                >
                  <ShopProductCard
                    product={product}
                    productHref={`/produit/${product.slug}`}
                    prioritizeImage={idx < 2}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
