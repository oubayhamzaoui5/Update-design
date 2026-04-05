'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Package, MapPin, Phone, CreditCard, ArrowRight, ArrowLeft, Truck, Download } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'
const SLATE   = '#1A2028'

// Compatibility aliases — map old Chia tokens to Update Design brand
const FONT     = BODY
const GRADIENT = `linear-gradient(135deg, ${SLATE} 0%, #222B33 100%)`
const TEXTURE  = { background: CREAM }

type OrderItem = {
  productId?: string
  name: string
  sku?: string
  unitPrice: number
  quantity: number
  imageUrl?: string
}

type Order = {
  id: string
  created: string
  status: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  postalCode: string
  paymentMode: string
  total: number
  currency: string
  items: OrderItem[]
}

const statusLabels: Record<string, string> = {
  paid: 'Paid',
  delivering: 'Delivering',
  delivered: 'Delivered',
  refunded: 'Refunded',
  'on hold': 'On hold',
}

const paymentLabels: Record<string, string> = {
  cash_on_delivery: 'Cash on delivery',
  stripe: 'Card payment',
  test_mode: 'Test mode',
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownloadInvoice = async (o: Order) => {
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const W = 210
      const margin = 18
      let y = 0

      // Gold header bar
      doc.setFillColor(28, 26, 20)
      doc.rect(0, 0, W, 36, 'F')
      doc.setFillColor(196, 162, 62)
      doc.rect(0, 34, W, 2, 'F')

      // Brand
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(253, 250, 245)
      doc.text('UPDATE DESIGN', margin, 16)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(196, 162, 62)
      doc.text('FACTURE', margin, 24)

      // Order ID top-right
      doc.setFontSize(7)
      doc.setTextColor(220, 200, 255)
      const idText = `#${o.id.slice(-8).toUpperCase()}`
      doc.text(idText, W - margin, 16, { align: 'right' })
      const dateStr = new Date(o.created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      doc.text(dateStr, W - margin, 24, { align: 'right' })

      y = 50

      // ── Billed To ──
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(124, 58, 237)
      doc.text('BILLED TO', margin, y)
      y += 5

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(17, 17, 17)
      doc.text(`${o.firstName} ${o.lastName}`, margin, y)
      y += 5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(80, 80, 80)
      if (o.address) { doc.text(o.address, margin, y); y += 5 }
      if (o.city || o.postalCode) { doc.text(`${o.city}${o.postalCode ? ' ' + o.postalCode : ''}`, margin, y); y += 5 }
      if (o.phone) { doc.text(`Tel: ${o.phone}`, margin, y); y += 5 }

      y += 4

      // ── Payment info (right column) ──
      const col2 = W / 2 + 4
      let ry = 50
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(124, 58, 237)
      doc.text('PAYMENT', col2, ry); ry += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(80, 80, 80)
      const pm: Record<string, string> = { cash_on_delivery: 'Cash on delivery', stripe: 'Card payment', test_mode: 'Test mode' }
      doc.text(pm[o.paymentMode] ?? o.paymentMode, col2, ry); ry += 5
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 17, 17)
      const statusLabelsLocal: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', delevering: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
      doc.text(`Status: ${statusLabelsLocal[o.status] ?? o.status}`, col2, ry)

      // Divider
      y = Math.max(y, ry) + 8
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, y, W - margin, y)
      y += 8

      // ── Items table header ──
      doc.setFillColor(245, 239, 228)
      doc.roundedRect(margin, y - 4, W - margin * 2, 10, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(60, 60, 60)
      doc.text('ITEM', margin + 2, y + 2)
      doc.text('QTY', W - margin - 46, y + 2, { align: 'center' })
      doc.text('UNIT PRICE', W - margin - 24, y + 2, { align: 'right' })
      doc.text('TOTAL', W - margin, y + 2, { align: 'right' })
      y += 12

      // ── Items ──
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      for (const item of o.items) {
        doc.setTextColor(17, 17, 17)
        const nameLines = doc.splitTextToSize(item.name, 90)
        doc.text(nameLines, margin + 2, y)
        if (item.sku) {
          doc.setFontSize(7)
          doc.setTextColor(150, 150, 150)
          doc.text(`SKU: ${item.sku}`, margin + 2, y + nameLines.length * 4.5)
          doc.setFontSize(8.5)
        }
        doc.setTextColor(17, 17, 17)
        doc.text(String(item.quantity), W - margin - 46, y, { align: 'center' })
        doc.text(`$${item.unitPrice.toFixed(2)}`, W - margin - 24, y, { align: 'right' })
        doc.text(`$${(item.unitPrice * item.quantity).toFixed(2)}`, W - margin, y, { align: 'right' })
        y += nameLines.length * 5 + (item.sku ? 5 : 0) + 4

        doc.setDrawColor(230, 230, 230)
        doc.setLineWidth(0.2)
        doc.line(margin, y - 2, W - margin, y - 2)
      }

      y += 4

      // ── Totals ──
      const subtotal = o.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      const totalsX = W - margin - 60

      doc.setFontSize(8.5)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'normal')
      doc.text('Subtotal', totalsX, y)
      doc.text(`$${subtotal.toFixed(2)}`, W - margin, y, { align: 'right' })
      y += 6

      doc.text('Shipping', totalsX, y)
      doc.setTextColor(46, 125, 50)
      doc.text(`+$${(o.total - subtotal).toFixed(2)}`, W - margin, y, { align: 'right' })
      y += 2

      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(totalsX, y + 2, W - margin, y + 2)
      y += 7

      doc.setFillColor(124, 58, 237)
      doc.roundedRect(totalsX - 4, y - 4, W - margin - totalsX + 8, 11, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text('TOTAL', totalsX, y + 3)
      doc.text(`$${o.total.toFixed(2)}`, W - margin, y + 3, { align: 'right' })
      y += 18

      // ── Footer ──
      doc.setDrawColor(220, 200, 255)
      doc.setLineWidth(0.4)
      doc.line(margin, y, W - margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text('Merci pour votre commande ! — updatedesign.tn', W / 2, y, { align: 'center' })

      doc.save(`invoice-${o.id.slice(-8).toUpperCase()}.pdf`)
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (!orderId) {
      setError('Missing order ID.')
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/shop/orders/${orderId}`, { cache: 'no-store' })
        if (!res.ok) {
          setError('Order not found.')
          return
        }
        const data = await res.json()
        if (!cancelled && data.order) {
          setOrder(data.order)
          void handleDownloadInvoice(data.order)
        }
      } catch {
        if (!cancelled) setError('Unable to load the order.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [orderId])

  return (
    <div
      className="min-h-screen pb-20"
      style={{ fontFamily: BODY, background: CREAM }}
    >
      <Navbar reserveSpace />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-12 md:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: GOLD, borderTopColor: 'transparent' }}
            />
          </div>
        ) : error ? (
          <div
            className="overflow-hidden rounded-sm bg-white"
            style={{ border: '1px solid rgba(196,162,62,0.15)' }}
          >
            {/* Error header */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
            >
              <ArrowLeft className="h-4 w-4" style={{ color: GOLD }} />
              <h2
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: DISPLAY, color: CREAM, letterSpacing: '0.18em' }}
              >
                Order not found
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center" style={TEXTURE}>
              <p
                className="text-sm"
                style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}
              >
                {error}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-sm px-6 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ fontFamily: BODY, background: GOLD, color: DARK }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>
          </div>
        ) : order ? (
          <div className="space-y-8">
            {/* Page title */}
            <header className="mb-2">
              <h1
                className="leading-none"
                style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', color: DARK, fontWeight: 400 }}
              >
                Commande{' '}
                <span style={{ color: GOLD }}>Confirmée !</span>
              </h1>
              <p
                className="mt-2 text-xs uppercase tracking-widest"
                style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.4)', letterSpacing: '0.18em' }}
              >
                Merci pour votre achat — votre commande a bien été reçue.
              </p>
            </header>

            {/* Success banner */}
            <section
              className="overflow-hidden rounded-sm bg-white"
              style={{ border: '1px solid rgba(196,162,62,0.15)' }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <CheckCircle2 className="h-4 w-4" style={{ color: GOLD }} />
                <h2
                  className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: DISPLAY, color: CREAM, letterSpacing: '0.18em' }}
                >
                  Confirmation
                </h2>
              </div>
              <div
                className="flex flex-col items-center justify-center gap-4 px-5 py-10 text-center"
                style={TEXTURE}
              >
                <CheckCircle2 className="h-12 w-12" style={{ color: GOLD }} />
                <p
                  className="text-sm tracking-wide"
                  style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.55)' }}
                >
                  Votre commande a été passée avec succès.
                </p>
                <div
                  className="rounded-sm px-4 py-1.5 text-xs uppercase tracking-widest"
                  style={{ fontFamily: BODY, background: 'rgba(196,162,62,0.08)', color: GOLD, border: '1px solid rgba(196,162,62,0.25)' }}
                >
                  #{order.id.slice(-8).toUpperCase()}
                </div>
              </div>
            </section>

            {/* Order items */}
            <section
              className="overflow-hidden rounded-sm bg-white"
              style={{ border: '1px solid rgba(196,162,62,0.15)' }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <Package className="h-4 w-4" style={{ color: GOLD }} />
                <h2
                  className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: DISPLAY, color: CREAM, letterSpacing: '0.18em' }}
                >
                  Produits commandés
                </h2>
              </div>

              <div className="divide-y px-5 pt-5" style={{ divideColor: 'rgba(196,162,62,0.1)' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-5">
                    <div
                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm"
                      style={{ border: '1px solid rgba(196,162,62,0.2)' }}
                    >
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-wider"
                          style={{ fontFamily: BODY, background: SLATE, color: 'rgba(253,250,245,0.5)' }}
                        >
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm"
                        style={{ fontFamily: DISPLAY, fontWeight: 600, color: DARK, letterSpacing: '0.01em' }}
                      >
                        {item.name}
                      </p>
                      {item.sku && (
                        <p
                          className="mt-0.5 text-[10px] uppercase tracking-wider"
                          style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.35)' }}
                        >
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pr-1">
                      <span
                        className="text-xs uppercase tracking-wider"
                        style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.45)' }}
                      >
                        ×{item.quantity}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ fontFamily: BODY, color: DARK }}
                      >
                        <span className="mr-0.5 text-[10px] opacity-50">$</span>
                        {(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div
                className="space-y-2.5 p-5"
                style={{ borderTop: '1px solid rgba(196,162,62,0.12)' }}
              >
                <div className="flex justify-between">
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.4)', letterSpacing: '0.16em' }}
                  >
                    Sous-total
                  </span>
                  <span
                    className="text-sm"
                    style={{ fontFamily: BODY, color: DARK }}
                  >
                    ${order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.4)', letterSpacing: '0.16em' }}
                  >
                    Livraison
                  </span>
                  <span
                    className="text-sm"
                    style={{ fontFamily: BODY, color: '#2E7D32' }}
                  >
                    +${(order.total - order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)).toFixed(2)}
                  </span>
                </div>
                <div
                  className="flex items-end justify-between pt-3"
                  style={{ borderTop: '1px solid rgba(196,162,62,0.12)' }}
                >
                  <span
                    className="text-sm uppercase tracking-widest"
                    style={{ fontFamily: DISPLAY, color: DARK, letterSpacing: '0.14em' }}
                  >
                    Total
                  </span>
                  <span
                    className="text-xl font-medium"
                    style={{ fontFamily: DISPLAY, color: DARK }}
                  >
                    <span className="mr-0.5 text-sm opacity-40">$</span>
                    {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            {/* Delivery info */}
            <section
              className="overflow-hidden rounded-sm bg-white"
              style={{ border: '1px solid rgba(196,162,62,0.15)' }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <Truck className="h-4 w-4" style={{ color: GOLD }} />
                <h2
                  className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: DISPLAY, color: CREAM, letterSpacing: '0.18em' }}
                >
                  Livraison
                </h2>
              </div>
              <div className="space-y-2.5 p-5" style={TEXTURE}>
                <p
                  className="text-sm"
                  style={{ fontFamily: DISPLAY, fontWeight: 600, color: DARK, fontSize: '1rem' }}
                >
                  {order.firstName} {order.lastName}
                </p>
                <p
                  className="text-sm"
                  style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.55)' }}
                >
                  {order.address}
                </p>
                <p
                  className="text-sm"
                  style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.55)' }}
                >
                  {order.city}{order.postalCode ? ` ${order.postalCode}` : ''}
                </p>
                {order.phone && (
                  <div className="flex items-center gap-2 pt-1">
                    <Phone size={13} style={{ color: GOLD, flexShrink: 0 }} />
                    <span
                      className="text-sm"
                      style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.55)' }}
                    >
                      {order.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CreditCard size={13} style={{ color: GOLD, flexShrink: 0 }} />
                  <span
                    className="text-sm"
                    style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.55)' }}
                  >
                    {paymentLabels[order.paymentMode] ?? order.paymentMode}
                  </span>
                </div>
              </div>
            </section>

            {/* Status + orders link */}
            <section
              className="overflow-hidden rounded-sm bg-white"
              style={{ border: '1px solid rgba(196,162,62,0.15)' }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <MapPin className="h-4 w-4" style={{ color: GOLD }} />
                <h2
                  className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: DISPLAY, color: CREAM, letterSpacing: '0.18em' }}
                >
                  Statut de commande
                </h2>
              </div>
              <div
                className="flex flex-wrap items-center justify-between gap-4 p-5"
                style={TEXTURE}
              >
                <div
                  className="rounded-sm px-3 py-1 text-xs uppercase tracking-widest"
                  style={{
                    fontFamily: BODY,
                    background: 'rgba(196,162,62,0.08)',
                    color: GOLD,
                    border: '1px solid rgba(196,162,62,0.25)',
                    letterSpacing: '0.14em',
                  }}
                >
                  {statusLabels[order.status] ?? order.status}
                </div>
                <Link
                  href="/orders"
                  className="flex items-center gap-1.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{
                    fontFamily: BODY,
                    color: GOLD,
                    letterSpacing: '0.14em',
                  }}
                >
                  Mes commandes <ArrowRight size={13} style={{ color: GOLD }} />
                </Link>
              </div>
            </section>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => handleDownloadInvoice(order)}
                disabled={downloading}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ fontFamily: BODY, background: 'white', color: DARK, border: '1px solid rgba(196,162,62,0.3)', letterSpacing: '0.14em' }}
              >
                <Download className="h-4 w-4" style={{ color: GOLD }} />
                {downloading ? 'Génération…' : 'Télécharger la facture'}
              </button>
              <Link
                href="/orders"
                className="flex flex-1 items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ fontFamily: BODY, background: GOLD, color: DARK, letterSpacing: '0.14em' }}
              >
                Mes commandes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ fontFamily: BODY, background: CREAM }}
        >
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: GOLD, borderTopColor: 'transparent' }}
          />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  )
}
