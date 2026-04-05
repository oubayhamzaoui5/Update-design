import type { Metadata } from 'next'
import { PackageSearch, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'
import OrdersListClient from '@/app/orders/_components/orders-list.client'
import type { CustomerOrder } from '@/lib/services/orders.service'
import { getCurrentUserOrders, OrdersServiceError } from '@/lib/services/orders.service'
import OrdersAuthRecoveryClient from '@/app/orders/_components/orders-auth-recovery.client'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'
const SLATE   = '#1A2028'

export const metadata: Metadata = {
  title: 'Mes Commandes | Update Design',
}

export default async function OrdersPage() {
  let orders: CustomerOrder[] = []
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

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: BODY, background: CREAM }}
    >
      <Navbar reserveSpace />

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 md:px-8">
        {unauthenticated ? (
          <OrdersAuthRecoveryClient />
        ) : (
          <>
            {/* Header */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1
                  style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.02em', lineHeight: 1 }}
                >
                  Mes{' '}
                  <em style={{ fontStyle: 'italic', color: GOLD }}>Commandes.</em>
                </h1>
                <p
                  className="mt-3 text-sm uppercase tracking-[0.15em]"
                  style={{ fontFamily: BODY, fontWeight: 600, color: 'rgba(28,26,20,0.4)' }}
                >
                  Suivez vos achats en temps réel.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.12em] transition-all duration-200 hover:gap-3"
                style={{ fontFamily: BODY, fontWeight: 700, color: GOLD, border: `1px solid rgba(196,162,62,0.3)` }}
              >
                <ArrowLeft className="h-4 w-4" />
                Boutique
              </Link>
            </div>

            {orders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 text-center"
                style={{ border: `1px solid rgba(196,162,62,0.15)`, background: '#fff' }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center"
                  style={{ background: `rgba(196,162,62,0.1)`, border: `1px solid rgba(196,162,62,0.3)` }}
                >
                  <PackageSearch className="h-8 w-8" style={{ color: GOLD }} />
                </div>
                <h2
                  className="mt-6"
                  style={{ fontFamily: DISPLAY, fontSize: '1.6rem', fontWeight: 400, color: DARK }}
                >
                  Aucune commande
                </h2>
                <p
                  className="mt-2 max-w-xs text-xs uppercase tracking-wider"
                  style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.4)' }}
                >
                  Vos achats apparaîtront ici.
                </p>
                <Link
                  href="/shop"
                  className="mt-8 inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-[0.12em] transition-all duration-200 hover:brightness-110"
                  style={{
                    fontFamily: BODY,
                    fontWeight: 700,
                    background: GOLD,
                    color: DARK,
                  }}
                >
                  Voir la boutique &#8594;
                </Link>
              </div>
            ) : (
              <OrdersListClient orders={orders} />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
