'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check, Clock3, PackageCheck, Truck, ShoppingBag, ArrowLeft } from 'lucide-react'
import type { CustomerOrder, CustomerOrderStatus } from '@/lib/services/orders.service'

type Props = { orders: CustomerOrder[] }

const statusConfig: Record<CustomerOrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock3 },
  confirmed: { label: 'Confirmee', color: 'text-blue-600 bg-blue-50', icon: Check },
  delevering: { label: 'En livraison', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
  delivered: { label: 'Livree', color: 'text-emerald-600 bg-emerald-50', icon: PackageCheck },
  cancelled: { label: 'Annulee', color: 'text-red-600 bg-red-50', icon: Check },
  'on hold': { label: 'En pause', color: 'text-slate-600 bg-slate-50', icon: Clock3 },
  returned: { label: 'Retournee', color: 'text-rose-600 bg-rose-50', icon: ArrowLeft },
}

export default function OrdersListClient({ orders }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)

  async function addAllToCart(order: CustomerOrder) {
    setBusyId(order.id)
    try {
      for (const item of order.items) {
        if (item.productId) {
          await fetch('/api/shop/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
          })
        }
      }
      window.dispatchEvent(new Event('cart:updated'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const config = statusConfig[order.status]
        const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0)
        const primaryDate = order.status === 'delivered' ? order.updatedAt : order.createdAt
        const dateLabel = order.status === 'delivered' ? 'Livree le' : 'Commandee le'

        return (
          <div
            key={order.id}
            className="group overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md transition-all duration-300"
          >
            <div className="flex w-full items-center justify-between p-5 text-left">
              <div className="flex items-center gap-4">
                <div className={`hidden h-12 w-12 items-center justify-center rounded-xl sm:flex ${config.color}`}>
                  <config.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium uppercase tracking-wider text-slate-500">#{order.id.slice(-6)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{dateLabel}</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(primaryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-slate-900">{order.totalAmount.toFixed(2)} DT</p>
                <p className="text-xs text-slate-500">{totalQty} article(s)</p>
              </div>
            </div>

            <div className="px-2 py-4">
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">IMG</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Reference: {item.sku || '-'}</p>
                      <p className="text-xs text-slate-700">{item.unitPrice.toFixed(2)} DT</p>
                    </div>
                    <div className="pr-6 text-right text-sm font-semibold text-slate-900">x {item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 px-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  <p>
                    Frais de livraison: <span className="font-medium">8.00 DT</span>
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">Total: {order.totalAmount.toFixed(2)} DT</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addAllToCart(order)}
                    disabled={busyId === order.id}
                    className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {busyId === order.id ? 'Ajout...' : 'Commander a nouveau'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
