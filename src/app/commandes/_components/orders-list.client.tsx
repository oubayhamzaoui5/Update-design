'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CreditCard, PackageCheck, Truck, ShoppingBag, RotateCcw, Pause } from 'lucide-react'
import type { CustomerOrder, CustomerOrderStatus } from '@/lib/services/orders.service'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'
const SLATE   = '#1A2028'

type Props = { orders: CustomerOrder[] }

const statusConfig: Record<CustomerOrderStatus, { label: string; bg: string; text: string; icon: any }> = {
  paid:       { label: 'Paid',            bg: '#E8F5E9', text: '#2E7D32', icon: CreditCard  },
  delivering: { label: 'Out for delivery',bg: '#EDE7F6', text: '#6A1B9A', icon: Truck       },
  delivered:  { label: 'Delivered',       bg: '#E3F2FD', text: '#1565C0', icon: PackageCheck},
  refunded:   { label: 'Refunded',        bg: '#FCE4EC', text: '#AD1457', icon: RotateCcw   },
  'on hold':  { label: 'On hold',         bg: '#ECEFF1', text: '#37474F', icon: Pause       },
}

export default function OrdersListClient({ orders }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const formatMoney = (value: number) => `$${value.toFixed(2)}`

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
    <div style={{ background: CREAM, fontFamily: BODY }} className="space-y-6 p-4">
      {orders.map((order) => {
        const config = statusConfig[order.status]
        const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
        const deliveryFee = Math.max(0, order.totalAmount - subtotal)
        const primaryDate = order.status === 'delivered' ? order.updatedAt : order.createdAt
        const dateLabel = order.status === 'delivered' ? 'Delivered on' : 'Ordered on'

        return (
          <div
            key={order.id}
            className="overflow-hidden bg-white transition-shadow duration-300 hover:shadow-md"
            style={{
              border: '1px solid rgba(196,162,62,0.18)',
              borderRadius: '4px',
            }}
          >
            {/* Header */}
            <div
              className="flex w-full flex-wrap items-center justify-between gap-4 p-5"
              style={{ borderBottom: '1px solid rgba(196,162,62,0.1)' }}
            >
              <div className="flex items-center gap-4">
                {/* Status icon */}
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center"
                  style={{
                    background: config.bg,
                    border: '1px solid rgba(196,162,62,0.2)',
                    borderRadius: '4px',
                  }}
                >
                  <config.icon className="h-4 w-4" style={{ color: config.text }} />
                </div>

                <div>
                  {/* Order number + status badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: GOLD,
                      }}
                    >
                      #{order.id.slice(-6)}
                    </span>
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: '9px',
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: config.bg,
                        color: config.text,
                        border: '1px solid rgba(196,162,62,0.3)',
                        borderRadius: '2px',
                        padding: '2px 7px',
                      }}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Date label */}
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: '10px',
                      fontWeight: 400,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'rgba(28,26,20,0.4)',
                      marginTop: '4px',
                    }}
                  >
                    {dateLabel}
                  </p>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: DARK,
                    }}
                  >
                    {new Date(primaryDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Total + item count */}
              <div className="text-right">
                <p
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: '20px',
                    fontWeight: 600,
                    color: DARK,
                    lineHeight: 1.2,
                  }}
                >
                  {formatMoney(order.totalAmount)}
                </p>
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: '10px',
                    fontWeight: 400,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(28,26,20,0.4)',
                    marginTop: '2px',
                  }}
                >
                  {totalQty} item{totalQty > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Items list */}
            <div className="p-5">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  style={
                    idx < order.items.length - 1
                      ? { borderBottom: '1px solid rgba(196,162,62,0.08)' }
                      : undefined
                  }
                >
                  {/* Product image */}
                  <div
                    className="relative h-14 w-14 flex-shrink-0 overflow-hidden"
                    style={{ border: '1px solid rgba(196,162,62,0.12)', borderRadius: '3px' }}
                  >
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          background: CREAM,
                          fontFamily: BODY,
                          fontSize: '8px',
                          fontWeight: 500,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'rgba(28,26,20,0.3)',
                        }}
                      >
                        IMG
                      </div>
                    )}
                  </div>

                  {/* Name + SKU */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate"
                      style={{
                        fontFamily: BODY,
                        fontSize: '13px',
                        fontWeight: 500,
                        color: DARK,
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: '10px',
                        fontWeight: 400,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'rgba(28,26,20,0.35)',
                        marginTop: '2px',
                      }}
                    >
                      SKU: {item.sku || '-'}
                    </p>
                  </div>

                  {/* Qty + unit price */}
                  <div className="flex items-center gap-4 pr-1">
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: '11px',
                        fontWeight: 400,
                        color: 'rgba(28,26,20,0.45)',
                      }}
                    >
                      x{item.quantity}
                    </span>
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: '13px',
                        fontWeight: 500,
                        color: DARK,
                      }}
                    >
                      {formatMoney(item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderTop: '1px solid rgba(196,162,62,0.1)',
                background: CREAM,
              }}
            >
              {/* Delivery + total */}
              <div>
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: '10px',
                    fontWeight: 400,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(28,26,20,0.4)',
                  }}
                >
                  Delivery:{' '}
                  <span style={{ color: DARK, fontWeight: 500 }}>{formatMoney(deliveryFee)}</span>
                </p>
                <p
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: DARK,
                    marginTop: '4px',
                  }}
                >
                  Total: {formatMoney(order.totalAmount)}
                </p>
              </div>

              {/* Order again button */}
              <button
                onClick={() => addAllToCart(order)}
                disabled={busyId === order.id}
                className="flex cursor-pointer items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontFamily: BODY,
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: GOLD,
                  color: DARK,
                  border: 'none',
                  borderRadius: '3px',
                  padding: '10px 22px',
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                {busyId === order.id ? 'Adding...' : 'Commander à nouveau'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
