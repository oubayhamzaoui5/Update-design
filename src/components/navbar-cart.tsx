"use client"

import { useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { CreditCard, ShoppingCart, X } from "lucide-react"

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

function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (it) =>
        it &&
        typeof it.productId === "string" &&
        typeof it.quantity === "number"
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    const originalOverflow = document.body.style.overflow

    if (isCartOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = originalOverflow
    }

    return () => {
      document.body.style.overflow = originalOverflow
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
          if (!res.ok) {
            if (!cancelled) setCartItems([])
            return
          }

          const data = await res.json()
          const items = Array.isArray(data?.items) ? data.items : []
          const mapped: CartItem[] = items.map((it: any) => {
            const prod = it?.product
            const product: CartProduct | null = prod
              ? {
                  id: prod.id ?? "",
                  slug: prod.slug ?? "",
                  name: prod.name ?? "",
                  sku: prod.sku ?? "",
                  images: Array.isArray(prod.images) ? prod.images : [],
                  imageUrls: Array.isArray(prod.imageUrls)
                    ? prod.imageUrls
                    : [],
                  price:
                    typeof prod.price === "number" ? prod.price : undefined,
                  promoPrice:
                    typeof prod.promoPrice === "number"
                      ? prod.promoPrice
                      : null,
                  currency: prod.currency ?? "DT",
                }
              : null

            return {
              id: it.id ?? "",
              quantity: Number(it.quantity ?? 1),
              product,
              source: "server",
            }
          })

          if (!cancelled) setCartItems(mapped)
          return
        }

        const guest = getGuestCart()
        if (guest.length === 0) {
          if (!cancelled) setCartItems([])
          return
        }

        const result: CartItem[] = []
        for (const item of guest) {
          try {
            const res = await fetch(`/api/shop/products/id/${item.productId}`, {
              cache: "no-store",
            })
            if (!res.ok) continue
            const data = await res.json()
            const prod = data?.product
            if (!prod) continue

            const product: CartProduct = {
              id: prod.id,
              slug: prod.slug ?? "",
              name: prod.name ?? "",
              sku: prod.sku ?? "",
              images: Array.isArray(prod.images) ? prod.images : [],
              imageUrls: Array.isArray(prod.imageUrls) ? prod.imageUrls : [],
              price: typeof prod.price === "number" ? prod.price : undefined,
              promoPrice:
                typeof prod.promoPrice === "number" ? prod.promoPrice : null,
              currency: prod.currency ?? "DT",
            }

            result.push({
              id: item.productId,
              quantity: item.quantity,
              product,
              source: "guest",
            })
          } catch {
            // ignore single product errors
          }
        }

        if (!cancelled) {
          setCartItems(result)
        }
      } catch (err) {
        console.error("Failed to load cart", err)
        if (!cancelled) setCartItems([])
      }
    }

    void loadCart()

    const onCartUpdated = () => {
      void loadCart()
    }

    const onCartOpen = () => {
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
    if (newQty < 1) {
      await handleRemoveItem(itemId)
      return
    }

    try {
      if (currentUser) {
        const res = await fetch("/api/shop/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, quantity: newQty }),
        })
        if (!res.ok) return

        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQty } : item
          )
        )
      } else {
        const current = getGuestCart()
        const idx = current.findIndex((it) => it.productId === itemId)
        if (idx === -1) return

        current[idx].quantity = newQty
        setGuestCart(current)

        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQty } : item
          )
        )
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch (err) {
      console.error("Failed to update quantity", err)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Supprimer cet article du panier ?")
      if (!ok) return
    }

    try {
      if (currentUser) {
        const res = await fetch(
          `/api/shop/cart?itemId=${encodeURIComponent(itemId)}`,
          { method: "DELETE" }
        )
        if (!res.ok) return
      } else {
        const current = getGuestCart()
        const next = current.filter((it) => it.productId !== itemId)
        setGuestCart(next)
      }

      setCartItems((prev) => prev.filter((item) => item.id !== itemId))

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch (err) {
      console.error("Failed to remove cart item", err)
    }
  }

  const cartCount = cartItems.length
  const cartCurrency =
    cartItems.find((item) => item.product?.currency)?.product?.currency ?? "DT"
  const cartTotal = cartItems.reduce((sum, item) => {
    const prod = item.product
    if (!prod) return sum

    const unitPrice =
      prod.promoPrice &&
      typeof prod.promoPrice === "number" &&
      typeof prod.price === "number" &&
      prod.promoPrice < prod.price
        ? prod.promoPrice
        : prod.price

    if (typeof unitPrice !== "number") return sum
    return sum + unitPrice * item.quantity
  }, 0)

  const overlay =
    isMounted &&
    createPortal(
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsCartOpen(false)}
        />

        <div
          className={`
            relative z-10 h-full w-full max-w-md bg-white text-black border-l border-gray-200 shadow-2xl flex flex-col
            transform transition-transform duration-300
            ${isCartOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Mon panier</h2>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
              onClick={() => setIsCartOpen(false)}
              aria-label="Fermer le panier"
            >
              <X size={18} className="text-gray-700" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-sm text-gray-500">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-60" />
                <p>Votre panier est vide.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const prod = item.product
                  const productHref = prod?.slug ? `/shop/${prod.slug}` : null
                  const imgSrc =
                    prod &&
                    Array.isArray(prod.imageUrls) &&
                    prod.imageUrls.length > 0
                      ? prod.imageUrls[0]!
                      : "/placeholder-square.webp"

                  const price =
                    prod?.promoPrice &&
                    typeof prod.promoPrice === "number" &&
                    typeof prod.price === "number" &&
                    prod.promoPrice < prod.price
                      ? prod.promoPrice
                      : prod?.price

                  const currency = prod?.currency ?? "DT"

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3  p-1 relative"
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 cursor-pointer"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Supprimer l'article"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>

                      {productHref ? (
                        <Link
                          href={productHref}
                          onClick={() => setIsCartOpen(false)}
                          className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100"
                        >
                          <Image
                            src={imgSrc}
                            alt={prod?.name ?? "Produit"}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                      ) : (
                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={imgSrc}
                            alt={prod?.name ?? "Produit"}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {productHref ? (
                          <Link
                            href={productHref}
                            onClick={() => setIsCartOpen(false)}
                            className="block text-sm font-medium truncate pr-6 transition-colors hover:text-accent"
                          >
                            {prod?.name ?? "Produit indisponible"}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium truncate pr-6">
                            {prod?.name ?? "Produit indisponible"}
                          </p>
                        )}
                        {prod?.sku && (
                          <p className="text-xs text-gray-500">
                            Reference: {prod.sku}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-300 text-xs hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                void handleUpdateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Diminuer la quantité"
                            >
                              -
                            </button>
                            <span className="text-xs font-medium min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-300 text-xs hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                void handleUpdateQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Augmenter la quantité"
                            >
                              +
                            </button>
                          </div>

                          {price != null && (
                            <span className="text-sm font-semibold">
                              {(price * item.quantity).toFixed(2)} {currency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-3">
            <button
              type="button"
              disabled={cartItems.length === 0}
              className={`
                w-full h-11 rounded-md text-white text-sm font-medium
                flex items-center justify-center gap-2 transition-opacity
                ${
                  cartItems.length === 0
                    ? "bg-accent opacity-60 cursor-not-allowed"
                    : "bg-accent hover:opacity-90 cursor-pointer"
                }
              `}
              onClick={() => {
                if (cartItems.length === 0) return
                setIsCartOpen(false)
                router.push("/chekout")
              }}
            >
              <CreditCard size={18} />
              <span>
                Procéder au paiement - {cartTotal.toFixed(2)} {cartCurrency}
              </span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    )

  return (
    <>
      {children({
        cartCount,
        openCart: () => setIsCartOpen(true),
      })}
      {overlay}
    </>
  )
}
