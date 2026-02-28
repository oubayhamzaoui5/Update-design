// components/navbar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  LayoutGrid,
  PackageOpen,
  Settings,
  LogOut,
  Package as PackageIcon,
  CreditCard,
} from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  order?: number
  parent?: string | string[] | null
  description?: string | null
}

type Product = {
  id: string
  slug: string
  sku: string
  name: string
  description?: string | null
  images?: string[]
}

// ðŸ⬝¹ Product type for cart (minimal)
type CartProduct = {
  id: string
  slug: string
  name: string
  sku?: string
  images?: string[]
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

interface NavbarProps {
  categories?: Category[]
}

type AuthUser = {
  id: string
  surname?: string
  name?: string
  email?: string
  role?: string
}

const GUEST_CART_KEY = "guest_cart"
const SIGNUP_PROMO_DISMISSED_KEY = "signup_promo_dismissed_v1"
const SIGNUP_PROMO_DISMISS_TTL_MS = 60 * 60 * 1000

type GuestCartItem = {
  productId: string
  quantity: number
}

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

function pbFileUrl(productId: string, filename: string) {
  const PB_URL = process.env.NEXT_PUBLIC_PB_URL!
  return `${PB_URL}/api/files/products/${productId}/${filename}`
}

function escapeFilterValue(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function compareCategoryOrder(a: Category, b: Category) {
  const aOrder = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 0
  const bOrder = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 0
  if (aOrder !== bOrder) return aOrder - bOrder
  return a.name.localeCompare(b.name)
}

export function Navbar(props: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const categoriesProp = props.categories ?? []

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )
  const [searchValue, setSearchValue] = useState("")

  // internal categories state (from props OR fetched)
  const [internalCategories, setInternalCategories] =
    useState<Category[]>(categoriesProp)

  // search dropdown state
  const [searchOpen, setSearchOpen] = useState(false)
  const [productResults, setProductResults] = useState<Product[]>([])
  const [categoryResults, setCategoryResults] = useState<Category[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<number | null>(null)

  // profile dropdown state (desktop)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileTimeoutRef = useRef<number | null>(null)

  // profile dropdown positioning
  const [profileShiftX, setProfileShiftX] = useState(0)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  // auth user (PocketBase)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isAuthResolved, setIsAuthResolved] = useState(false)

  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // for portal (avoid SSR document undefined)
  const [isMounted, setIsMounted] = useState(false)

  const [showSignupPromo, setShowSignupPromo] = useState(false)
  const [hasPassedPromoBanner, setHasPassedPromoBanner] = useState(false)

  const getLoginHref = () => {
    const query = typeof window !== "undefined" ? window.location.search.slice(1) : ""
    const currentPath = `${pathname}${query ? `?${query}` : ""}`
    return `/connexion?next=${encodeURIComponent(currentPath)}`
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissedUntilRaw = window.localStorage.getItem(
      SIGNUP_PROMO_DISMISSED_KEY
    )
    const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : 0
    const shouldShow = !dismissedUntil || Number.isNaN(dismissedUntil) || Date.now() >= dismissedUntil
    setShowSignupPromo(shouldShow)

    if (shouldShow && dismissedUntilRaw) {
      window.localStorage.removeItem(SIGNUP_PROMO_DISMISSED_KEY)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      // Promo banner height is h-10 (2.5rem = 40px)
      setHasPassedPromoBanner(window.scrollY >= 40)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const closeSignupPromo = () => {
    if (typeof window !== "undefined") {
      const dismissedUntil = Date.now() + SIGNUP_PROMO_DISMISS_TTL_MS
      window.localStorage.setItem(
        SIGNUP_PROMO_DISMISSED_KEY,
        String(dismissedUntil)
      )
    }
    setShowSignupPromo(false)
  }

  const handleProfileEnter = () => {
    if (profileTimeoutRef.current) {
      window.clearTimeout(profileTimeoutRef.current)
    }
    setIsProfileOpen(true)
  }

  const handleProfileLeave = () => {
    if (profileTimeoutRef.current) {
      window.clearTimeout(profileTimeoutRef.current)
    }
    profileTimeoutRef.current = window.setTimeout(() => {
      setIsProfileOpen(false)
    }, 150)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // ignore server logout errors and still clear client state
    }

    setCurrentUser(null)
    setIsProfileOpen(false)
    router.push("/")
  }

  // Wishlist behavior (desktop + mobile)
  const handleWishlistClick = () => {
    if (!currentUser) {
      // no user logged in -> go to login
      router.push(getLoginHref())
      return
    }

    // user logged in -> go to wishlist page
    router.push("/Wishlist")
  }

  // Cart icon behavior: open drawer (even if not logged in)
  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  // Lock body scroll when cart is open
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



  // read auth session on mount
  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" })
        if (!res.ok) {
          if (!cancelled) setCurrentUser(null)
          return
        }

        const data = await res.json()
        if (!cancelled) {
          setCurrentUser((data?.user as AuthUser) ?? null)
        }
      } catch {
        if (!cancelled) setCurrentUser(null)
      } finally {
        if (!cancelled) setIsAuthResolved(true)
      }
    }

    loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  // Load cart items on mount and auth state changes
useEffect(() => {
  const PB_URL = process.env.NEXT_PUBLIC_PB_URL
  if (!PB_URL) return

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

      // ðŸ§¾ Guest: load from localStorage
      const guest = getGuestCart()
      if (guest.length === 0) {
        if (!cancelled) setCartItems([])
        return
      }

      const result: CartItem[] = []
      for (const item of guest) {
        try {
          const res = await fetch(
            `${PB_URL}/api/collections/products/records/${item.productId}`,
            { cache: "no-store" }
          )
          if (!res.ok) continue
          const prod = await res.json()

          const product: CartProduct = {
            id: prod.id,
            slug: prod.slug ?? "",
            name: prod.name ?? "",
            sku: prod.sku ?? "",
            images: Array.isArray(prod.images) ? prod.images : [],
            price: typeof prod.price === "number" ? prod.price : undefined,
            promoPrice:
              typeof prod.promoPrice === "number" ? prod.promoPrice : null,
            currency: prod.currency ?? "DT",
          }

          result.push({
            id: item.productId, // id = productId for guest
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

  loadCart()

  // Listen to global events
  const onCartUpdated = () => {
    loadCart()
  }

  const onCartOpen = () => {
    setIsCartOpen(true) // open the cart drawer when product page says so
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


  // Update quantity (server or guest)
  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) {
      await handleRemoveItem(itemId)
      return
    }

    try {
      if (currentUser) {
        // Server cart
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
        // Guest cart: update localStorage
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

  // Remove item (server or guest)
  const handleRemoveItem = async (itemId: string) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Supprimer cet article du panier ?")
      if (!ok) return
    }

    try {
      if (currentUser) {
        // Server cart
        const res = await fetch(
          `/api/shop/cart?itemId=${encodeURIComponent(itemId)}`,
          { method: "DELETE" }
        )
        if (!res.ok) return
      } else {
        // Guest: remove from localStorage
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

  // sync props -> state & fetch once if no categories were passed
  useEffect(() => {
    if (categoriesProp.length > 0) {
      setInternalCategories(categoriesProp.slice().sort(compareCategoryOrder))
      return
    }

    const PB_URL = process.env.NEXT_PUBLIC_PB_URL
    if (!PB_URL) return

    const controller = new AbortController()

    const load = async () => {
      try {
        const res = await fetch(
          `${PB_URL}/api/collections/categories/records?perPage=200&sort=order,name`,
          { cache: "no-store", signal: controller.signal }
        )
        const data = await res.json()
        const items = Array.isArray(data?.items) ? data.items : []

        const mapped: Category[] = items.map((c: any) => ({
          id: c.id,
          name: c.name ?? "",
          slug: c.slug ?? "",
          order: Number(c.order ?? 0),
          parent: c.parent ?? null,
          description: c.desc ?? c.description ?? null,
        }))

        setInternalCategories(mapped.sort(compareCategoryOrder))
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Failed to fetch navbar categories", err)
        }
      }
    }

    load()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // IMPORTANT: only once on mount

  // close search on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!searchWrapRef.current) return
      if (!searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // clamp profile dropdown horizontally when opened
  useEffect(() => {
    if (!isProfileOpen || !profileMenuRef.current) return

    const el = profileMenuRef.current
    const rect = el.getBoundingClientRect()
    const padding = 8 // margin from viewport edges

    let shift = 0

    if (rect.right > window.innerWidth - padding) {
      shift = window.innerWidth - padding - rect.right
    }

    if (rect.left < padding) {
      shift = padding - rect.left
    }

    setProfileShiftX(shift)
  }, [isProfileOpen])

  // root categories
  const rootCategories = internalCategories.filter((cat) => {
    if (Array.isArray(cat.parent)) return cat.parent.length === 0
    return !cat.parent
  }).sort(compareCategoryOrder)

  // children
  const getCategoryChildren = (parentId: string) =>
    internalCategories.filter((cat) => {
      if (Array.isArray(cat.parent)) return cat.parent.includes(parentId)
      return cat.parent === parentId
    }).sort(compareCategoryOrder)

  // toggle category expansion
  const toggleCategory = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const next = new Set(expandedCategories)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedCategories(next)
  }

  // debounced searching (products from PB + categories local)
  useEffect(() => {
    const q = searchValue.trim()
    if (!q) {
      setSearchOpen(false)
      setProductResults([])
      setCategoryResults([])
      setIsSearching(false)
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
      return
    }

    setSearchOpen(true)

    // category search
    const qLower = q.toLowerCase()
    const catMatches = internalCategories.filter((c) =>
      c.name.toLowerCase().includes(qLower)
    )
    setCategoryResults(catMatches.slice(0, 6))

    // debounce PB products search
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      try {
        setIsSearching(true)
        const PB_URL = process.env.NEXT_PUBLIC_PB_URL!
        const safeQ = escapeFilterValue(q)

        const url =
          `${PB_URL}/api/collections/products/records` +
          `?perPage=6&filter=(name~"${safeQ}"||sku~"${safeQ}")`

        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()

        const items: Product[] = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : []

        setProductResults(items)
      } catch (err) {
        console.error("Navbar product search failed", err)
        setProductResults([])
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [searchValue, internalCategories])

  // recursive category list
  const CategoryList = ({
    items,
    level = 0,
  }: {
    items: Category[]
    level?: number
  }) => (
    <div className={level > 0 ? "ml-4 mt-2 space-y-2" : "space-y-2"}>
      {items.map((category) => {
        const children = getCategoryChildren(category.id)
        const isExpanded = expandedCategories.has(category.id)

        return (
          <div key={category.id}>
            <div className="flex items-center justify-between">
              <Link
                href={`/boutique/categorie/${category.slug}`}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                {category.name}
              </Link>

              {children.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => toggleCategory(category.id, e)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-black/5"
                  aria-label="Afficher les sous-catégories"
                >
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {isExpanded && children.length > 0 && (
              <CategoryList items={children} level={level + 1} />
            )}
          </div>
        )
      })}
    </div>
  )

  const LogoSwap = ({ size = 60 }: { size?: number }) => (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src="/logow.webp"
        alt="Logo"
        fill
        sizes="(max-width: 768px) 36px, 60px"
        className="object-contain"
        priority
      />
    </div>
  )

  const hasNoResults =
    !isSearching &&
    categoryResults.length === 0 &&
    productResults.length === 0

  const displayName =
    [currentUser?.surname, currentUser?.name].filter(Boolean).join(" ") ||
    currentUser?.email ||
    "Mon compte"
  const shouldShowSignupPromo = isAuthResolved && !currentUser && showSignupPromo

  // ðŸ§® Number of distinct products in cart (badge)
  const cartCount = cartItems.length

  // ðŸ§® Cart currency (first found or "DT")
  const cartCurrency =
    cartItems.find((item) => item.product?.currency)?.product?.currency ?? "DT"

  // ðŸ§® Cart total (with promo logic)
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

  // Cart overlay rendered via portal (outside nav)
  const cartOverlay =
    isMounted &&
    createPortal(
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsCartOpen(false)}
        />

        {/* Panel */}
        <div
          className={`
            relative z-10 h-full w-full max-w-md bg-white text-black border-l border-gray-200 shadow-2xl flex flex-col
            transform transition-transform duration-300
            ${isCartOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Header */}
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

          {/* Content */}
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
                  const imgSrc =
                    prod &&
                    Array.isArray(prod.images) &&
                    prod.images.length > 0
                      ? pbFileUrl(prod.id, prod.images[0]!)
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
                      className="flex gap-3 border border-gray-200 rounded-xl p-2 relative"
                    >
                      {/* Delete button - red X */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 cursor-pointer"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Supprimer l'article"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>

                      <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={imgSrc}
                          alt={prod?.name ?? "Produit"}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate pr-6">
                          {prod?.name ?? "Produit indisponible"}
                        </p>
                        {prod?.sku && (
                            <p className="text-xs text-gray-500">
                            Reference: {prod.sku}
                            </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-300 text-xs hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                handleUpdateQuantity(
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
                                handleUpdateQuantity(
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
                            <span className="text-sm font-semibold ">
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

          {/* Footer */}
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
      {shouldShowSignupPromo && (
        <div className="absolute left-0 right-0 top-0 z-50 border-b border-red-700 bg-red-600 text-white">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-center px-4">
            <p className="pr-8 text-center text-[9px] font-medium whitespace-nowrap md:text-sm">
              <Link href="/inscription" className="underline underline-offset-2">
                Créez un compte
              </Link>{' '}
              et obtenez 10% de réduction sur votre première commande.
            </p>
            <button
              type="button"
              onClick={closeSignupPromo}
              className="absolute right-4 inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-700/60"
              aria-label="Close promotion"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <nav
        className={`left-0 right-0 z-40 border-b border-black/10 bg-white text-black backdrop-blur-md ${
          isDesktopMenuOpen ? "md:border-b-0" : ""
        } ${
          shouldShowSignupPromo
            ? hasPassedPromoBanner
              ? "fixed top-0"
              : "absolute top-10"
            : "fixed top-0"
        }`}
      >
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between px-0 py-0.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsDesktopMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-black/5"
              aria-label="Ouvrir le menu desktop"
              aria-expanded={isDesktopMenuOpen}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 origin-center bg-accent transition-all duration-300   ${
                    isDesktopMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 bg-accent transition-all duration-300 ${
                    isDesktopMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[14px] h-0.5 w-5 origin-center bg-accent transition-all duration-300 ${
                    isDesktopMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>

            <Link href="/" className="flex items-center gap-3">
              <LogoSwap size={70} />
            </Link>
          </div>

          {/* Search desktop */}
          <div className="flex-1 px-4">
            <div className="relative w-full" ref={searchWrapRef}>
              <div
                className="flex w-full items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-5 py-2 transition-colors"
              >
                <Search size={18} className="opacity-70" />
                <input
                  type="text"
                  placeholder="Rechercher Categorie , Produit ..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => searchValue.trim() && setSearchOpen(true)}
                  className="flex-1 bg-transparent text-sm text-black outline-none placeholder-gray-600 placeholder-opacity-70"
                />
              </div>

              {searchOpen && (
                <div
                  className="absolute left-0 right-0 mt-2 overflow-hidden rounded-xl border border-black/10 bg-white text-black transition-colors"
                >
                  <div className="max-h-96 overflow-y-auto px-2 py-2">
                    {categoryResults.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                          Catégories
                        </div>
                        <div className="space-y-1">
                          {categoryResults.map((c) => (
                            <Link
                              key={c.id}
                              href={`/boutique/categorie/${c.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-foreground/5"
                            >
                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-md bg-black/5"
                              >
                                <LayoutGrid className="h-4 w-4 opacity-80" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {c.name}
                                </div>
                                <div className="text-xs opacity-60">
                                  Catégorie
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {productResults.length > 0 && (
                      <div className="mb-1">
                        <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                          Produits
                        </div>
                        <div className="space-y-1">
                          {productResults.map((p) => {
                            const firstImg =
                              Array.isArray(p.images) && p.images.length > 0
                                ? pbFileUrl(p.id, p.images[0]!)
                                : "/placeholder-square.webp"

                            return (
                              <Link
                                key={p.id}
                                href={`/shop/${p.slug}`}
                                onClick={() => setSearchOpen(false)}
                                className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-foreground/5"
                              >
                                <div className="relative h-12 w-12 overflow-hidden rounded-md flex-shrink-0">
                                  <Image
                                    src={firstImg}
                                    alt={p.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {p.name}
                                  </div>
                                    <div className="text-xs opacity-70 truncate">
                                    Reference: {p.sku}
                                    </div>
                                  {p.description && (
                                    <div className="text-xs opacity-70 line-clamp-2">
                                      {p.description}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {hasNoResults && (
                      <div className="flex items-center gap-3 rounded-lg bg-foreground/5 px-3 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground/5">
                          <PackageOpen className="h-5 w-5 opacity-70" />
                        </div>
                        <div className="text-sm opacity-70">
                          Aucun résultat trouvé.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Icons desktop */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Wishlist button visible only for logged-in users */}
            {currentUser && (
              <button
                type="button"
                className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
                aria-label="Favoris"
                onClick={handleWishlistClick}
              >
                <Heart size={20} />
              </button>
            )}

            {/* Cart with badge */}
            <button
              type="button"
              className="relative p-2 hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Panier"
              onClick={handleCartClick}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-accent text-white text-[10px] font-semibold px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Profile + centered dropdown with delay */}
            <div
              className="relative"
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
              <button
                type="button"
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="Compte"
                onClick={() => setIsProfileOpen((v) => !v)}
              >
                <User size={20} />
              </button>

              {isProfileOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute left-1/2 top-full mt-2 w-60 max-w-[calc(100vw-4rem)] space-y-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-black shadow-lg"
                  style={{
                    transform: `translateX(calc(-50% + ${profileShiftX}px))`,
                  }}
                >
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                    Mon compte
                  </div>

                  {currentUser ? (
                    <div className="space-y-1">
                      {/* Full name / Profile */}
<Link
  href={currentUser?.role === "admin" ? "/admin" : "/commandes"}
  className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
  onClick={() => setIsProfileOpen(false)}
>
  <div className="flex items-center gap-2">
    <User className="h-4 w-4 opacity-80" />
    <span className="font-medium truncate">{displayName}</span>
  </div>
  <ChevronRight className="h-3 w-3 opacity-50" />
</Link>

                      {/* Orders */}
                    {currentUser?.role !== "admin" && (
  <Link
    href="/commandes"
    className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
    onClick={() => setIsProfileOpen(false)}
  >
    <div className="flex items-center gap-2">
      <PackageIcon className="h-4 w-4 opacity-80" />
      <span>Mes commandes</span>
    </div>
    <ChevronRight className="h-3 w-3 opacity-50" />
  </Link>
)}

                      {/* Settings */}
                      <Link
                        href={currentUser?.role === "admin" ? "/admin" : "/commandes"}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 opacity-80" />
                          <span>Paramètres</span>
                        </div>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </Link>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 opacity-80 text-red-500" />
                          <span className="text-red-500">Se déconnecter</span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href={getLoginHref()}
                        className="inline-block w-full cursor-pointer rounded-md border border-accent/60 bg-gray-100 px-6 py-2.5 text-center text-sm font-medium text-black transition-colors hover:bg-gray-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Se connecter
                      </Link>

                      <Link
                        href="/inscription"
                        className="inline-block w-full text-sm text-center px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:opacity-80 cursor-pointer transition-opacity"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        S&apos;inscrire
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={`hidden md:block overflow-hidden bg-white transition-all duration-300 ease-out ${
            isDesktopMenuOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!isDesktopMenuOpen}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto whitespace-nowrap px-0 py-4">
            {rootCategories.map((category) => (
              <Link
                key={category.id}
                href={`/boutique/categorie/${category.slug}`}
                className="text-sm font-extrabold hover:opacity-70 transition-opacity"
              >
                {category.name}
              </Link>
            ))}

            <Link
              href="/Nouveautes"
              className="text-sm font-extrabold hover:opacity-70 transition-opacity"
            >
              Nouveautés
            </Link>

            <Link
              href="/Promotions"
              className="text-sm font-extrabold text-red-600 transition-colors hover:text-red-700"
            >
              Promotions
            </Link>

            <Link
              href="/contact"
              className="text-sm font-extrabold hover:opacity-70 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
        {/* Mobile */}
        <div className="md:hidden flex items-center gap-1 px-2 py-3">
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="Accueil">
            <LogoSwap size={36} />
          </Link>
               <button
            type="button"
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Compte"
            onClick={() => {
              if (currentUser?.role === "admin") {
                router.push("/admin")
                return
              }
              setIsProfileOpen((v) => !v)
            }}
          >
            <User size={20} />
          </button>

      

            <div className="relative flex-1" ref={searchWrapRef}>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 transition-colors">
              <Search size={16} className="opacity-70" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => searchValue.trim() && setSearchOpen(true)}
                className="w-full bg-transparent text-xs text-black outline-none placeholder-gray-600 placeholder-opacity-70"
              />
            </div>

            {searchOpen && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-black/10 bg-white text-black transition-colors">
                <div className="max-h-80 overflow-y-auto px-2 py-2">
                  {categoryResults.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                        CatÃ©gories
                      </div>
                      <div className="space-y-1">
                        {categoryResults.map((c) => (
                          <Link
                            key={c.id}
                            href={`/boutique/categorie/${c.slug}`}
                            onClick={() => {
                              setSearchOpen(false)
                              setIsMenuOpen(false)
                            }}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-black/5"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground/5">
                              <LayoutGrid className="h-4 w-4 opacity-80" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {c.name}
                              </div>
                              <div className="text-xs opacity-60">
                                CatÃ©gorie
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {productResults.length > 0 && (
                    <div className="mb-1">
                      <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                        Produits
                      </div>
                      <div className="space-y-1">
                        {productResults.map((p) => {
                          const firstImg =
                            Array.isArray(p.images) && p.images.length > 0
                              ? pbFileUrl(p.id, p.images[0]!)
                              : "/placeholder-square.webp"

                          return (
                            <Link
                              key={p.id}
                              href={`/shop/${p.slug}`}
                              onClick={() => {
                                setSearchOpen(false)
                                setIsMenuOpen(false)
                              }}
                              className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-foreground/5"
                            >
                              <div className="relative h-12 w-12 overflow-hidden rounded-md flex-shrink-0">
                                <Image
                                  src={firstImg}
                                  alt={p.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {p.name}
                                </div>
                                <div className="text-xs opacity-70 truncate">
                                  Reference: {p.sku}
                                </div>
                                {p.description && (
                                  <div className="text-xs opacity-70 line-clamp-2">
                                    {p.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {hasNoResults && (
                    <div className="flex items-center gap-3 rounded-lg bg-foreground/5 px-3 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground/5">
                        <PackageOpen className="h-5 w-5 opacity-70" />
                      </div>
                      <div className="text-sm opacity-70">
                        Aucun rÃ©sultat trouvÃ©.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCartClick}
            aria-label="Panier"
            className="relative p-1 hover:opacity-70 transition-opacity"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-accent text-white text-[10px] font-semibold px-1">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
    <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 transition-all duration-300 hover:opacity-70 ${isMenuOpen ? "rotate-90" : "rotate-0"}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
     
        </div>

        {/* Mobile panel */}
        <div
          className={`border-t border-black/10 bg-white text-black transition-all duration-300 ease-out md:hidden ${
            isMenuOpen ? "max-h-[calc(100vh-80px)] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div className="overflow-y-auto p-4">

            {/* Mobile links */}
            <div className="space-y-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Accueil
              </Link>

              <Link
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Boutique
              </Link>

              <Link
                href="/Nouveautes"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Nouveautés
              </Link>

              <Link
                href="/Promotions"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium text-red-600 transition-colors hover:text-red-700"
              >
                Promotions
              </Link>

              <Link
                href="/a-propos"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                ì propos
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Contact
              </Link>

              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Blog
              </Link>

              {/* Mobile Boutique Categories */}
              <div>
                <button
                  type="button"
                  onClick={(e) => toggleCategory("mobile-boutique", e)}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity w-full"
                  aria-label="Afficher ou masquer les categories"
                >
                  Catégories
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      expandedCategories.has("mobile-boutique")
                        ? "rotate-90"
                        : ""
                    }`}
                  />
                </button>

                {expandedCategories.has("mobile-boutique") && (
                  <div className="mt-3 ml-2">
                    <CategoryList items={rootCategories} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </nav>

      {cartOverlay}
    </>
  )
}





