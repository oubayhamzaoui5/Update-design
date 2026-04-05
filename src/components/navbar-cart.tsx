"use client"

import { useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { ShoppingBag, X, ArrowRight } from "lucide-react"

type CartProduct = {
  id: string
  slug: string
  name: string
  sku?: string
  images?: string[]
  imageUrls?: string[]
  price?: number
  promoPrice?: number | null
  currency?: string
  stock?: number
}

type CartItem = {
  id: string
  quantity: number
  product: CartProduct | null
  source?: "server" | "guest"
}

type AuthUser = {
  id: string
}

type GuestCartItem = {
  productId: string
  quantity: number
}

type NavbarCartRenderProps = {
  cartCount: number
  openCart: () => void
}

type NavbarCartProps = {
  currentUser: AuthUser | null
  onOpenChange?: (open: boolean) => void
  children: (props: NavbarCartRenderProps) => ReactNode
}

const GUEST_CART_KEY = "guest_cart"
const FREE_SHIPPING_THRESHOLD = 99

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"
const CREAM   = "#FDFAF5"

function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (it) => it && typeof it.productId === "string" && typeof it.quantity === "number"
    )
  } catch {
    return []
  }
}

function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function NavbarCart({ currentUser, onOpenChange, children }: NavbarCartProps) {
  const router = useRouter()

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalPadding = document.body.style.paddingRight
    if (isCartOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    } else {
      window.dispatchEvent(new Event("cart:drawer:close"))
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = originalPadding
    }
    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = originalPadding
    }
  }, [isCartOpen])

  useEffect(() => {
    onOpenChange?.(isCartOpen)
  }, [isCartOpen, onOpenChange])

  useEffect(() => {
    let cancelled = false

    const loadCart = async () => {
      try {
        if (currentUser) {
          const res = await fetch("/api/shop/cart", { cache: "no-store" })
          if (!res.ok) { if (!cancelled) setCartItems([]); return }
          const data = await res.json()
          const items = Array.isArray(data?.items) ? data.items : []
          const mapped: CartItem[] = items.map((it: any) => {
            const prod = it?.product
            const product: CartProduct | null = prod ? {
              id: prod.id ?? "",
              slug: prod.slug ?? "",
              name: prod.name ?? "",
              sku: prod.sku ?? "",
              images: Array.isArray(prod.images) ? prod.images : [],
              imageUrls: Array.isArray(prod.imageUrls) ? prod.imageUrls : [],
              price: typeof prod.price === "number" ? prod.price : undefined,
              promoPrice: typeof prod.promoPrice === "number" ? prod.promoPrice : null,
              currency: prod.currency ?? "DT",
              stock: typeof prod.stock === "number" ? prod.stock : undefined,
            } : null
            return { id: it.id ?? "", quantity: Number(it.quantity ?? 1), product, source: "server" }
          })
          if (!cancelled) setCartItems(mapped)
          return
        }

        const guest = getGuestCart()
        if (guest.length === 0) { if (!cancelled) setCartItems([]); return }
        const result: CartItem[] = []
        for (const item of guest) {
          try {
            const res = await fetch(`/api/shop/products/id/${item.productId}`, { cache: "no-store" })
            if (!res.ok) continue
            const data = await res.json()
            const prod = data?.product
            if (!prod) continue
            const product: CartProduct = {
              id: prod.id, slug: prod.slug ?? "", name: prod.name ?? "", sku: prod.sku ?? "",
              images: Array.isArray(prod.images) ? prod.images : [],
              imageUrls: Array.isArray(prod.imageUrls) ? prod.imageUrls : [],
              price: typeof prod.price === "number" ? prod.price : undefined,
              promoPrice: typeof prod.promoPrice === "number" ? prod.promoPrice : null,
              currency: prod.currency ?? "DT",
              stock: typeof prod.stock === "number" ? prod.stock : undefined,
            }
            result.push({ id: item.productId, quantity: item.quantity, product, source: "guest" })
          } catch { /* ignore */ }
        }
        if (!cancelled) setCartItems(result)
      } catch (err) {
        console.error("Failed to load cart", err)
        if (!cancelled) setCartItems([])
      }
    }

    void loadCart()

    const onCartUpdated = () => { void loadCart() }
    const onCartOpen = () => {
      window.dispatchEvent(new Event("cart:drawer:open"))
      setIsCartOpen(true)
    }
    if (typeof window !== "undefined") {
      window.addEventListener("cart:updated", onCartUpdated)
      window.addEventListener("cart:open", onCartOpen)
    }
    return () => {
      cancelled = true
      if (typeof window !== "undefined") {
        window.removeEventListener("cart:updated", onCartUpdated)
        window.removeEventListener("cart:open", onCartOpen)
      }
    }
  }, [currentUser])

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) { await handleRemoveItem(itemId); return }
    const prev = cartItems
    setCartItems((items) => items.map((item) => item.id === itemId ? { ...item, quantity: newQty } : item))
    try {
      if (currentUser) {
        const res = await fetch("/api/shop/cart", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, quantity: newQty }),
        })
        if (!res.ok) { setCartItems(prev); return }
      } else {
        const current = getGuestCart()
        const idx = current.findIndex((it) => it.productId === itemId)
        if (idx === -1) { setCartItems(prev); return }
        current[idx].quantity = newQty
        setGuestCart(current)
      }
      if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:updated"))
    } catch (err) { console.error("Failed to update quantity", err); setCartItems(prev) }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Retirer cet article du panier ?")
      if (!ok) return
    }
    try {
      if (currentUser) {
        const res = await fetch(`/api/shop/cart?itemId=${encodeURIComponent(itemId)}`, { method: "DELETE" })
        if (!res.ok) return
      } else {
        setGuestCart(getGuestCart().filter((it) => it.productId !== itemId))
      }
      setCartItems((prev) => prev.filter((item) => item.id !== itemId))
      if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:updated"))
    } catch (err) { console.error("Failed to remove cart item", err) }
  }

  const cartCount = cartItems.length
  const cartCurrency = cartItems.find((item) => item.product?.currency)?.product?.currency ?? "DT"
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const prod = item.product
    if (!prod) return sum
    const unitPrice = prod.promoPrice && typeof prod.promoPrice === "number" && typeof prod.price === "number" && prod.promoPrice < prod.price
      ? prod.promoPrice : prod.price
    if (typeof unitPrice !== "number") return sum
    return sum + unitPrice * item.quantity
  }, 0)

  const shippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal)
  const freeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD

  const overlay = isMounted && createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`relative z-10 flex h-full flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(520px, 96vw)", background: CREAM }}
      >

        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-6"
          style={{ borderBottom: `1px solid rgba(196,162,62,0.2)` }}
        >
          <div>
            <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, fontWeight: 700, marginBottom: 4 }}>
              Update Design
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 400, color: DARK, lineHeight: 1, letterSpacing: "-0.01em", margin: 0 }}>
              Mon Panier
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Fermer le panier"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center transition-opacity hover:opacity-50"
            style={{ color: DARK }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>


        {/* Items */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div style={{ width: 52, height: 52, border: `1px solid rgba(196,162,62,0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingBag size={22} strokeWidth={1.25} color={`${GOLD}80`} />
              </div>
              <div>
                <p style={{ fontFamily: DISPLAY, fontSize: "1.5rem", fontWeight: 400, color: DARK, margin: 0, lineHeight: 1.1 }}>
                  Votre panier est vide
                </p>
                <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: "rgba(28,26,20,0.45)", marginTop: 8, fontWeight: 400 }}>
                  Découvrez notre sélection et ajoutez vos produits préférés.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 transition-all hover:gap-3"
                style={{
                  fontFamily: BODY,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: GOLD,
                  color: "#fff",
                }}
              >
                Voir la boutique <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const prod = item.product
                const productHref = prod?.slug ? `/product/${prod.slug}` : null
                const imgSrc = prod && Array.isArray(prod.imageUrls) && prod.imageUrls.length > 0
                  ? prod.imageUrls[0]! : "/placeholder-square.png"
                const unitPrice = typeof prod?.promoPrice === "number" && prod.promoPrice > 0 && typeof prod?.price === "number" && prod.promoPrice < prod.price
                  ? prod.promoPrice : prod?.price
                const currency = prod?.currency ?? "DT"
                const hasPromo = typeof prod?.promoPrice === "number" && prod.promoPrice > 0 && typeof prod?.price === "number" && prod.promoPrice < prod.price

                return (
                  <div
                    key={item.id}
                    className="flex gap-4"
                    style={{ paddingBottom: 16, borderBottom: `1px solid rgba(196,162,62,0.15)` }}
                  >
                    {/* Image */}
                    <div className="relative shrink-0 overflow-hidden" style={{ width: 80, height: 80, border: `1px solid rgba(196,162,62,0.2)` }}>
                      {productHref ? (
                        <Link href={productHref} onClick={() => setIsCartOpen(false)}>
                          <Image src={imgSrc} alt={prod?.name ?? "Produit"} fill sizes="80px" className="object-cover" />
                        </Link>
                      ) : (
                        <Image src={imgSrc} alt={prod?.name ?? "Produit"} fill sizes="80px" className="object-cover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="min-w-0">
                        {productHref ? (
                          <Link
                            href={productHref}
                            onClick={() => setIsCartOpen(false)}
                            className="block line-clamp-2 leading-snug transition-colors hover:opacity-60"
                            style={{ fontFamily: DISPLAY, fontSize: "1.05rem", fontWeight: 400, color: DARK, letterSpacing: "-0.005em" }}
                          >
                            {prod?.name ?? "Produit indisponible"}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 leading-snug" style={{ fontFamily: DISPLAY, fontSize: "1.05rem", fontWeight: 400, color: DARK }}>
                            {prod?.name ?? "Produit indisponible"}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2 mt-1.5">
                          {unitPrice != null && (
                            <span style={{ fontFamily: BODY, fontSize: "0.88rem", fontWeight: 700, color: GOLD }}>
                              {(unitPrice * item.quantity).toFixed(2)} {currency}
                            </span>
                          )}
                          {hasPromo && prod?.price != null && (
                            <span style={{ fontFamily: BODY, fontSize: "0.75rem", color: "rgba(28,26,20,0.35)", textDecoration: "line-through" }}>
                              {(prod.price * item.quantity).toFixed(2)} {currency}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Qty + Remove */}
                      <div className="mt-2 flex items-center justify-between">
                        {/* Qty stepper */}
                        <div className="flex items-center" style={{ border: `1px solid rgba(196,162,62,0.35)` }}>
                          {(() => {
                            const maxQty = prod?.stock != null ? Math.max(1, prod.stock) : 99
                            return (
                              <>
                                <button
                                  type="button"
                                  disabled={item.quantity <= 1}
                                  onClick={() => void handleUpdateQuantity(item.id, item.quantity - 1)}
                                  aria-label="Diminuer la quantité"
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center transition-colors disabled:opacity-30"
                                  style={{ fontFamily: BODY, fontSize: "1rem", fontWeight: 400, color: DARK, cursor: item.quantity <= 1 ? "not-allowed" : "pointer" }}
                                  onMouseEnter={(e) => { if (item.quantity > 1) (e.currentTarget as HTMLButtonElement).style.background = `${GOLD}18` }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                                >
                                  −
                                </button>
                                <span style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 600, color: DARK, width: 28, textAlign: "center" }}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={item.quantity >= maxQty}
                                  onClick={() => void handleUpdateQuantity(item.id, item.quantity + 1)}
                                  aria-label="Augmenter la quantité"
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center transition-colors disabled:opacity-30"
                                  style={{ fontFamily: BODY, fontSize: "1rem", fontWeight: 400, color: DARK, cursor: item.quantity >= maxQty ? "not-allowed" : "pointer" }}
                                  onMouseEnter={(e) => { if (item.quantity < maxQty) (e.currentTarget as HTMLButtonElement).style.background = `${GOLD}18` }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                                >
                                  +
                                </button>
                              </>
                            )
                          })()}
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleRemoveItem(item.id)}
                          className="cursor-pointer transition-opacity hover:opacity-50"
                          style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C0392B" }}
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: `1px solid rgba(196,162,62,0.25)`, background: "#FAF6EE" }}>
            {/* Subtotal */}
            <div className="flex items-baseline justify-between px-7 py-4" style={{ borderBottom: `1px solid rgba(196,162,62,0.15)` }}>
              <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(28,26,20,0.5)" }}>
                Sous-total
              </span>
              <span style={{ fontFamily: BODY, fontSize: "1.1rem", fontWeight: 700, color: DARK }}>
                {cartSubtotal.toFixed(2)} {cartCurrency}
              </span>
            </div>

            {/* CTA */}
            <div className="px-7 py-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => { setIsCartOpen(false); router.push("/checkout") }}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-2 py-4 transition-all hover:opacity-85 active:scale-[0.99]"
                style={{
                  fontFamily: BODY,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: GOLD,
                  color: "#fff",
                }}
              >
                Passer la commande <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-full cursor-pointer inline-flex items-center justify-center py-3 transition-opacity hover:opacity-60"
                style={{
                  fontFamily: BODY,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(28,26,20,0.45)",
                }}
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )

  return (
    <>
      {children({ cartCount, openCart: () => {
        window.dispatchEvent(new Event("cart:drawer:open"))
        setIsCartOpen(true)
      } })}
      {overlay}
    </>
  )
}
