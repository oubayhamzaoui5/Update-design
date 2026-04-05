"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  CreditCard,
  Save,
  X,
  ChevronRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react"

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
  source?: "pb" | "guest"
}

type GuestCartItem = {
  productId: string
  quantity: number
}

type UserAddress = {
  id: string
  address: string
  city: string
  postalCode?: string
  notes?: string
  country?: string
  state?: string
  address2?: string
}

const BODY  = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD  = '#C4A23E'
const DARK  = '#1C1A14'
const CREAM = '#FDFAF5'
const SLATE = '#1A2028'
const GUEST_CART_KEY = "guest_cart"
const SIGNUP_PROMO_DISMISSED_KEY = "signup_promo_dismissed_v1"
const DEFAULT_CURRENCY = "USD"

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PT", name: "Portugal" },
  { code: "IE", name: "Ireland" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "GR", name: "Greece" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "TR", name: "Turkey" },
  { code: "IL", name: "Israel" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "DZ", name: "Algeria" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "NZ", name: "New Zealand" },
] as const

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "Washington D.C." }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const

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

function pbFileUrl(productId: string, filename: string) {
  const base =
    process.env.NEXT_PUBLIC_PB_URL ??
    process.env.POCKETBASE_URL ??
    "http://127.0.0.1:8090"
  return `${base}/api/files/products/${productId}/${encodeURIComponent(filename)}`
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function isPlaceholderEmail(value: string) {
  return normalizeEmail(value).endsWith("@placeholder.local")
}

function getUnitPrice(product: CartProduct | null): number {
  if (!product) return 0
  const price = typeof product.price === "number" ? product.price : 0
  const promo = typeof product.promoPrice === "number" ? product.promoPrice : null
  if (promo != null && promo > 0 && promo < price) return promo
  return price
}

export function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const buyNow = searchParams.get("buyNow") === "1"
  const buyNowProductId = searchParams.get("productId")
  const buyNowQty = Math.max(1, Number(searchParams.get("qty") ?? "1") || 1)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [profileEmail, setProfileEmail] = useState("")

  const [country, setCountry] = useState("")
  const [address, setAddress] = useState("")
  const [address2, setAddress2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [notes, setNotes] = useState("")

  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("new")
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [isPromoBannerVisible, setIsPromoBannerVisible] = useState(false)
  const [orderFlowStage, setOrderFlowStage] = useState<"idle" | "loading" | "success">("idle")
  const [stripeConfigured, setStripeConfigured] = useState(false)

  useEffect(() => {
    const threshold = 8
    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current
      if (delta > threshold) setIsNavbarVisible(false)
      else if (delta < -threshold) setIsNavbarVisible(true)
      lastScrollYRef.current = currentY
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Load Stripe config
  useEffect(() => {
    fetch('/api/shop/stripe/config')
      .then(r => r.json())
      .then(data => setStripeConfigured(!!data?.configured))
      .catch(() => setStripeConfigured(false))
  }, [])

  useEffect(() => {
    let cancelled = false

    const applyModel = (model: Record<string, any> | null) => {
      if (!model) return

      if (typeof model.email === "string") {
        const nextEmail = model.email.trim()
        if (nextEmail) {
          setProfileEmail(nextEmail)
          if (!isPlaceholderEmail(nextEmail)) {
            setEmail((prev) => prev || nextEmail)
          }
        }
      }
      if (typeof model.surname === "string" && model.surname.trim()) {
        setFirstName((prev) => prev || model.surname.trim())
      }
      if (typeof model.name === "string" && model.name.trim()) {
        setLastName((prev) => prev || model.name.trim())
      }
      if (typeof model.firstName === "string" && model.firstName.trim()) {
        setFirstName((prev) => prev || model.firstName.trim())
      }
      if (typeof model.lastName === "string" && model.lastName.trim()) {
        setLastName((prev) => prev || model.lastName.trim())
      }
    }

    const syncAuthState = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" })
        if (!res.ok) {
          if (cancelled) return
          setIsLoggedIn(false)
          setAuthUserId(null)
          return
        }
        const data = await res.json()
        const user = data?.user
        if (cancelled) return
        if (user?.id) {
          setIsLoggedIn(true)
          setAuthUserId(String(user.id))
          applyModel(user)
          return
        }
      } catch {
        // ignore and fallback to logged out state
      }

      if (cancelled) return
      setIsLoggedIn(false)
      setAuthUserId(null)
    }

    void syncAuthState()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissedUntilRaw = window.localStorage.getItem(SIGNUP_PROMO_DISMISSED_KEY)
    const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : 0
    const isDismissed =
      !!dismissedUntilRaw && Number.isFinite(dismissedUntil) && Date.now() < dismissedUntil
    setIsPromoBannerVisible(!isLoggedIn && !isDismissed)
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) {
      setAddresses([])
      setSelectedAddressId("new")
      return
    }

    let cancelled = false

    const loadAddresses = async () => {
      try {
        const res = await fetch("/api/shop/addresses", {
          method: "GET",
          cache: "no-store",
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || "Failed to load addresses.")
        }
        const data = await res.json()
        const rows = Array.isArray(data?.items) ? data.items : []
        if (cancelled) return
        const mapped: UserAddress[] = rows.map((row: any) => ({
          id: String(row.id),
          address: String(row.address ?? ""),
          city: String(row.city ?? ""),
          postalCode: typeof row.postalCode === "string" ? row.postalCode : "",
          notes: typeof row.notes === "string" ? row.notes : "",
          country: typeof row.country === "string" ? row.country : "",
          state: typeof row.state === "string" ? row.state : "",
          address2: typeof row.address2 === "string" ? row.address2 : "",
        }))
        setAddresses(mapped)
        if (mapped.length > 0) {
          setSelectedAddressId(mapped[0].id)
        }
      } catch (err: any) {
        if (!cancelled) {
          setAddresses([])
          setOrderError(err?.message || "Failed to load addresses.")
        }
      }
    }

    void loadAddresses()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (selectedAddressId === "new") return
    const selected = addresses.find((a) => a.id === selectedAddressId)
    if (!selected) return
    setAddress(selected.address || "")
    setAddress2(selected.address2 || "")
    setCity(selected.city || "")
    setPostalCode(selected.postalCode || "")
    setNotes(selected.notes || "")
    setCountry(selected.country || "")
    setState(selected.state || "")
  }, [addresses, selectedAddressId])

  useEffect(() => {
    let cancelled = false

    const loadBuyNow = async () => {
      const PB_ID_RE = /^[a-zA-Z0-9]{15}$/
      if (!buyNow || !buyNowProductId || !PB_ID_RE.test(buyNowProductId)) return false
      try {
        const res = await fetch(`/api/shop/products/id/${buyNowProductId}`, { cache: "no-store" })
        if (!res.ok) {
          if (!cancelled) setCartItems([])
          return true
        }
        const payload = await res.json()
        const p = payload?.product
        const product: CartProduct = {
          id: p.id,
          slug: p.slug ?? "",
          name: p.name ?? "",
          sku: p.sku ?? "",
          images: Array.isArray(p.images) ? p.images : [],
          price: typeof p.price === "number" ? p.price : undefined,
          promoPrice: typeof p.promoPrice === "number" ? p.promoPrice : null,
          currency: p.currency ?? DEFAULT_CURRENCY,
        }
        if (!cancelled) {
          setCartItems([{ id: p.id, quantity: buyNowQty, product, source: "guest" }])
        }
      } catch {
        if (!cancelled) setCartItems([])
      }
      return true
    }

    const loadCart = async () => {
      const loadedBuyNow = await loadBuyNow()
      if (loadedBuyNow) return

      try {
        if (isLoggedIn) {
          const res = await fetch("/api/shop/cart", { method: "GET", cache: "no-store" })
          if (!res.ok) {
            if (!cancelled) setCartItems([])
            return
          }
          const data = await res.json()
          const items = Array.isArray(data?.items) ? data.items : []
          if (cancelled) return

          const mapped: CartItem[] = items.map((it: any) => {
            const prod = it.product
            const product: CartProduct | null = prod
              ? {
                  id: prod.id,
                  slug: prod.slug ?? "",
                  name: prod.name ?? "",
                  sku: prod.sku ?? "",
                  images: Array.isArray(prod.images) ? prod.images : [],
                  price: typeof prod.price === "number" ? prod.price : undefined,
                  promoPrice: typeof prod.promoPrice === "number" ? prod.promoPrice : null,
                  currency: prod.currency ?? DEFAULT_CURRENCY,
                }
              : null

            return { id: it.id, quantity: Number(it.quantity ?? 1), product, source: "pb" }
          })

          setCartItems(mapped)
          return
        }

        const guest = getGuestCart()
        if (guest.length === 0) {
          if (!cancelled) setCartItems([])
          return
        }

        const result: CartItem[] = []
        const PB_ID_RE = /^[a-zA-Z0-9]{15}$/
        for (const item of guest) {
          if (!PB_ID_RE.test(item.productId)) continue
          try {
            const res = await fetch(`/api/shop/products/id/${item.productId}`, { cache: "no-store" })
            if (!res.ok) continue
            const payload = await res.json()
            const prod = payload?.product
            const product: CartProduct = {
              id: prod.id,
              slug: prod.slug ?? "",
              name: prod.name ?? "",
              sku: prod.sku ?? "",
              images: Array.isArray(prod.images) ? prod.images : [],
              price: typeof prod.price === "number" ? prod.price : undefined,
              promoPrice: typeof prod.promoPrice === "number" ? prod.promoPrice : null,
              currency: prod.currency ?? DEFAULT_CURRENCY,
            }

            result.push({ id: item.productId, quantity: item.quantity, product, source: "guest" })
          } catch {
            // ignore a single broken product
          }
        }

        if (!cancelled) setCartItems(result)
      } catch {
        if (!cancelled) setCartItems([])
      }
    }

    void loadCart()
    return () => {
      cancelled = true
    }
  }, [buyNow, buyNowProductId, buyNowQty, isLoggedIn])

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + getUnitPrice(item.product) * item.quantity, 0),
    [cartItems]
  )
  const cartCurrency = "USD"
  const shipping = cartItems.length > 0 ? (country === "US" ? 5 : country ? 20 : 0) : 0
  const cartTotal = cartSubtotal + shipping

  const canSaveAddress = useMemo(() => {
    if (!isLoggedIn) return false
    return Boolean(address.trim() && city.trim())
  }, [isLoggedIn, address, city])

  const isPostalCodeValid = useMemo(() => {
    const pc = postalCode.trim()
    if (!pc) return false
    if (country === "US") return /^\d{5}$/.test(pc)
    return pc.length > 0
  }, [postalCode, country])

  const isRequiredFieldsValid = useMemo(
    () =>
      Boolean(
        firstName.trim() &&
        lastName.trim() &&
        country.trim() &&
        address.trim() &&
        city.trim() &&
        isPostalCodeValid &&
        (country !== "US" || state.trim())
      ),
    [firstName, lastName, country, address, city, isPostalCodeValid, state]
  )

  const syncEmailToProfile = async (showError = true) => {
    if (!isLoggedIn) return true

    const nextEmail = email.trim()
    if (!nextEmail || isPlaceholderEmail(nextEmail)) return true
    if (normalizeEmail(nextEmail) === normalizeEmail(profileEmail)) return true

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Failed to update your email.")
      }
      const data = await res.json().catch(() => ({}))
      const updatedEmail =
        typeof data?.user?.email === "string" && data.user.email.trim()
          ? data.user.email.trim()
          : nextEmail
      setProfileEmail(updatedEmail)
      setEmail(updatedEmail)
      return true
    } catch (err: any) {
      if (showError) {
        setOrderError(err?.message || "Failed to update your email.")
      }
      return false
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) {
      await handleRemoveItem(itemId)
      return
    }

    if (buyNow) {
      setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it)))
      return
    }

    try {
      if (isLoggedIn) {
        const res = await fetch("/api/shop/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, quantity: newQty }),
        })
        if (!res.ok) return
        setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it)))
      } else {
        const current = getGuestCart()
        const idx = current.findIndex((it) => it.productId === itemId)
        if (idx === -1) return
        current[idx].quantity = newQty
        setGuestCart(current)
        setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it)))
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch {
      // ignore quantity update failures in UI flow
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (buyNow) {
      setCartItems((prev) => prev.filter((it) => it.id !== itemId))
      return
    }

    try {
      if (isLoggedIn) {
        const res = await fetch(`/api/shop/cart?itemId=${encodeURIComponent(itemId)}`, {
          method: "DELETE",
        })
        if (!res.ok) return
      } else {
        const next = getGuestCart().filter((it) => it.productId !== itemId)
        setGuestCart(next)
      }
      setCartItems((prev) => prev.filter((it) => it.id !== itemId))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch {
      // ignore delete failures in UI flow
    }
  }

  const handleSaveAddress = async () => {
    if (!canSaveAddress || isSavingAddress) return
    setOrderError(null)

    try {
      setIsSavingAddress(true)
      if (!isLoggedIn || !authUserId) {
        setOrderError("Please log in again to save your address.")
        return
      }

      const payload = {
        address: address.trim(),
        address2: address2.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        notes: notes.trim(),
        country: country.trim(),
        state: state.trim(),
      }

      if (selectedAddressId !== "new") {
        const res = await fetch("/api/shop/addresses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedAddressId, ...payload }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || "Failed to update address.")
        }
        setAddresses((prev) =>
          prev.map((a) => (a.id === selectedAddressId ? { ...a, ...payload } : a))
        )
      } else {
        const res = await fetch("/api/shop/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || "Failed to save address.")
        }
        const data = await res.json()
        const created = data?.item
        const mapped: UserAddress = {
          id: String(created.id),
          address: String(created.address ?? payload.address),
          address2: String(created.address2 ?? payload.address2),
          city: String(created.city ?? payload.city),
          postalCode: String(created.postalCode ?? payload.postalCode),
          notes: String(created.notes ?? payload.notes),
          country: String(created.country ?? payload.country),
          state: String(created.state ?? payload.state),
        }
        setAddresses((prev) => [mapped, ...prev])
        setSelectedAddressId(mapped.id)
      }
    } catch (err: any) {
      setOrderError(err?.message || "Failed to save address.")
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleConfirmOrder = async () => {
    setOrderError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setOrderError("Please fill in your contact information.")
      return
    }
    if (!country.trim()) {
      setOrderError("Please select your country.")
      return
    }
    if (!address.trim() || !city.trim()) {
      setOrderError("Please enter your shipping address.")
      return
    }
    if (cartItems.length === 0) {
      setOrderError("Your cart is empty.")
      return
    }

    try {
      setIsPlacingOrder(true)
      setOrderFlowStage("loading")
      const didSyncEmail = await syncEmailToProfile(true)
      if (!didSyncEmail) {
        setOrderFlowStage("idle")
        return
      }

      const itemsPayload = cartItems.map((item) => ({
        id: item.product?.id,
        productId: item.product?.id,
        name: item.product?.name ?? "Product",
        sku: item.product?.sku ?? "",
        unitPrice: getUnitPrice(item.product),
        quantity: Math.max(1, Number(item.quantity || 1)),
      }))

      const orderPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        country: country.trim(),
        address: address.trim(),
        address2: address2.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        notes: notes.trim(),
        shipping,
        items: itemsPayload,
        total: cartTotal,
        currency: cartCurrency,
      }

      const orderRes = await fetch("/api/shop/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
      const orderData = await orderRes.json().catch(() => ({}))
      if (!orderRes.ok) {
        throw new Error(orderData?.message || "Checkout failed. Please try again.")
      }

      // Stripe redirect
      if (typeof orderData?.url === "string" && orderData.url) {
        if (!buyNow) {
          if (isLoggedIn) {
            await Promise.allSettled(
              cartItems
                .filter((it) => it.source === "pb")
                .map((it) =>
                  fetch(`/api/shop/cart?itemId=${encodeURIComponent(it.id)}`, { method: "DELETE" })
                )
            )
          } else {
            setGuestCart([])
          }
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart:updated"))
        }
        window.location.href = orderData.url
        return
      }

      // Test mode
      const createdOrderId = typeof orderData?.orderId === "string" ? orderData.orderId : ""

      if (!buyNow) {
        if (isLoggedIn) {
          await Promise.allSettled(
            cartItems
              .filter((it) => it.source === "pb")
              .map((it) =>
                fetch(`/api/shop/cart?itemId=${encodeURIComponent(it.id)}`, { method: "DELETE" })
              )
          )
        } else {
          setGuestCart([])
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"))
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1000))
      setOrderFlowStage("success")
      await new Promise((resolve) => window.setTimeout(resolve, 800))
      router.push(createdOrderId ? `/checkout/confirmation?id=${encodeURIComponent(createdOrderId)}` : "/")
    } catch (err: any) {
      setOrderFlowStage("idle")
      const message = err?.data?.message || err?.message || "Checkout failed. Please try again."
      setOrderError(String(message))
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: BODY,
    fontWeight: 400,
    fontSize: '14px',
    border: `1px solid rgba(196,162,62,0.28)`,
    borderRadius: '2px',
    background: '#fff',
    padding: '10px 14px',
    outline: 'none',
    width: '100%',
    color: DARK,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  }
  const inputCls = "focus:border-[#C4A23E] focus:shadow-[0_0_0_3px_rgba(196,162,62,0.12)]"
  const labelCls = "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em]"

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        fontFamily: BODY,
        backgroundColor: CREAM,
      }}
    >
      <div className={`mx-auto max-w-7xl px-4 md:px-8 ${isPromoBannerVisible ? "pt-28 md:pt-32" : "pt-28 md:pt-32"}`}>

        {/* Breadcrumb */}
        <nav
          className="mb-10 flex items-center gap-2 overflow-x-auto whitespace-nowrap"
          style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.35)' }}
        >
          <span className="transition-colors hover:text-[#C4A23E] cursor-pointer">Panier</span>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span style={{ color: DARK, fontWeight: 600 }}>Informations</span>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span>Paiement</span>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span>Livraison</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_400px]">
          {/* LEFT COLUMN — Form */}
          <div className="space-y-6">

            {/* Page title */}
            <header className="mb-2">
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 8 }}>
                Finaliser la commande
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 400,
                  color: DARK,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                }}
              >
                Détails de livraison
              </h1>
            </header>

            {/* CONTACT Section */}
            <section style={{ border: `1px solid rgba(196,162,62,0.2)`, background: '#fff' }}>
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <ShoppingBag className="h-4 w-4" style={{ color: GOLD }} />
                <h2 style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  Contact
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                      Prénom <span style={{ color: '#C62828' }}>*</span>
                    </label>
                    <input type="text" className={inputCls} style={inputStyle} placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                      Nom <span style={{ color: '#C62828' }}>*</span>
                    </label>
                    <input type="text" className={inputCls} style={inputStyle} placeholder="Nom de famille" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                    Email
                  </label>
                  <input type="email" className={inputCls} style={inputStyle} placeholder="vous@domaine.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => { void syncEmailToProfile(false) }} />
                </div>
              </div>
            </section>

            {/* SHIPPING Section */}
            <section style={{ border: `1px solid rgba(196,162,62,0.2)`, background: '#fff' }}>
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4" style={{ color: GOLD }} />
                  <h2 style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Livraison
                  </h2>
                </div>
                {isLoggedIn && addresses.length > 0 && (
                  <select
                    className="cursor-pointer px-3 py-1 text-[11px]"
                    style={{ fontFamily: BODY, background: 'rgba(255,255,255,0.1)', border: `1px solid rgba(196,162,62,0.4)`, color: 'rgba(255,255,255,0.85)', borderRadius: '2px' }}
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id} className="text-black bg-white">{a.city} — {a.address.slice(0, 26)}…</option>
                    ))}
                    <option value="new" className="text-black bg-white">+ Nouvelle adresse</option>
                  </select>
                )}
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                    Pays <span style={{ color: '#C62828' }}>*</span>
                  </label>
                  <select className={inputCls} style={inputStyle} value={country} onChange={(e) => { setCountry(e.target.value); setState("") }}>
                    <option value="">Sélectionner le pays...</option>
                    {COUNTRIES.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}
                  </select>
                  {country && (
                    <p className="mt-1.5" style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.08em', color: GOLD }}>
                      {country === "US" ? "Frais de port: $5.00" : "Livraison internationale: $20.00"}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                    Adresse ligne 1 <span style={{ color: '#C62828' }}>*</span>
                  </label>
                  <input type="text" className={inputCls} style={inputStyle} placeholder="Rue, numéro, appartement..." value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                    Adresse ligne 2 <span style={{ color: 'rgba(28,26,20,0.3)' }}>(optionnel)</span>
                  </label>
                  <input type="text" className={inputCls} style={inputStyle} placeholder="Étage, bâtiment, bureau..." value={address2} onChange={(e) => setAddress2(e.target.value)} />
                </div>

                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                    {country === "US" ? "État" : "État / Province / Région"}
                    {country === "US" && <span style={{ color: '#C62828' }}> *</span>}
                  </label>
                  {country === "US" ? (
                    <select className={inputCls} style={inputStyle} value={state} onChange={(e) => setState(e.target.value)}>
                      <option value="">Sélectionner l'état...</option>
                      {US_STATES.map((s) => (<option key={s.code} value={s.code}>{s.name}</option>))}
                    </select>
                  ) : (
                    <input type="text" className={inputCls} style={inputStyle} placeholder="État / Province / Région" value={state} onChange={(e) => setState(e.target.value)} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                      Ville <span style={{ color: '#C62828' }}>*</span>
                    </label>
                    <input type="text" className={inputCls} style={inputStyle} placeholder="Tunis" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                      {country === "US" ? "Code ZIP" : "Code Postal"} <span style={{ color: '#C62828' }}>*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inputCls}
                      style={inputStyle}
                      placeholder={country === "US" ? "10001" : "1000"}
                      value={postalCode}
                      onChange={(e) => {
                        if (country === "US") setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))
                        else setPostalCode(e.target.value.slice(0, 10))
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.5)' }}>
                    Instructions spéciales
                  </label>
                  <textarea rows={2} className={inputCls} style={{ ...inputStyle, resize: 'none' }} placeholder="Code d'accès, étage, instructions de livraison..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                {isLoggedIn && (
                  <button
                    onClick={handleSaveAddress}
                    disabled={!canSaveAddress}
                    className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-70 disabled:opacity-30"
                    style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, background: 'none', border: 'none', padding: 0 }}
                  >
                    <Save size={12} style={{ color: GOLD }} />
                    {isSavingAddress ? "Enregistrement..." : "Enregistrer cette adresse"}
                  </button>
                )}
              </div>
            </section>

            {/* PAYMENT Section */}
            <section style={{ border: `1px solid rgba(196,162,62,0.2)`, background: '#fff' }}>
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: GOLD }} />
                <h2 style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  Paiement
                </h2>
              </div>

              <div className="space-y-4 p-6">
                {stripeConfigured ? (
                  <div
                    className="flex items-center gap-4 px-4 py-3.5"
                    style={{ border: `1px solid rgba(196,162,62,0.25)`, background: CREAM }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: GOLD, borderRadius: '50%' }}>
                      <CreditCard className="h-4 w-4" style={{ color: '#fff' }} />
                    </div>
                    <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: DARK }}>
                      Carte bancaire
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold tracking-wider" style={{ background: '#635BFF', color: '#fff', fontFamily: BODY, borderRadius: '3px' }}>
                      <svg width="10" height="10" viewBox="0 0 32 32" fill="none"><path d="M14.2 12.6c0-1.1.9-1.5 2.3-1.5 2.1 0 4.7.6 6.8 1.7V7.3C21.1 6.5 18.8 6 16.5 6 11.2 6 7.7 8.7 7.7 13c0 6.5 9 5.5 9 8.3 0 1.3-1.1 1.7-2.6 1.7-2.3 0-5.2-.9-7.5-2.2v5.6c2.6 1.1 5.2 1.6 7.5 1.6 5.4 0 9.2-2.7 9.2-7.1-.1-7-9.1-5.8-9.1-8.3z" fill="white"/></svg>
                      Stripe
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-start gap-4 px-4 py-3.5"
                    style={{ border: `1px solid rgba(196,162,62,0.25)`, background: CREAM }}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: 'rgba(196,162,62,0.12)', borderRadius: '50%' }}>
                      <div className="h-2 w-2 rounded-full" style={{ background: GOLD }} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: DARK }}>Mode Test</span>
                      <span style={{ fontFamily: BODY, fontSize: 11, color: 'rgba(28,26,20,0.45)' }}>
                        Aucun processeur de paiement configuré. Commandes placées en mode test.
                      </span>
                    </div>
                  </div>
                )}

                {/* Security note */}
                <div className="flex items-center gap-2">
                  <svg width="11" height="13" viewBox="0 0 12 14" fill="none"><path d="M6 0L0 2.5v4C0 9.9 2.6 13 6 14c3.4-1 6-4.1 6-7.5v-4L6 0z" fill="rgba(196,162,62,0.5)"/></svg>
                  <span style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.08em', color: 'rgba(28,26,20,0.4)' }}>
                    Chiffrement SSL 256 bits — vos données sont sécurisées
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — Order Summary */}
          <aside
            className="lg:sticky space-y-4 transition-[top] duration-300"
            style={{
              top: isNavbarVisible
                ? isPromoBannerVisible ? '8rem' : '7rem'
                : '1rem',
            }}
          >
            <div style={{ border: `1px solid rgba(196,162,62,0.2)`, background: '#fff' }}>

              {/* Summary header */}
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}
              >
                <h3 style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  Récapitulatif
                </h3>
                <span
                  className="px-2 py-0.5"
                  style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.12em', border: `1px solid rgba(196,162,62,0.4)`, color: 'rgba(255,255,255,0.7)' }}
                >
                  {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Cart items */}
              <div className="max-h-[360px] divide-y overflow-y-auto px-4 py-4" style={{ borderColor: 'rgba(196,162,62,0.12)' }}>
                {cartItems.map((item) => (
                  <div key={item.id} className="group flex gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden" style={{ border: `1px solid rgba(196,162,62,0.2)` }}>
                      {item.product?.images?.[0] && (
                        <Image src={pbFileUrl(item.product.id, item.product.images[0])} alt={item.product.name} fill className="object-cover" />
                      )}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute left-0.5 top-0.5 bg-white/90 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ border: `1px solid rgba(196,162,62,0.3)` }}
                      >
                        <X size={9} style={{ color: DARK }} />
                      </button>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <h4 className="truncate text-sm" style={{ fontFamily: BODY, fontWeight: 500, color: DARK }}>
                        {item.product?.name}
                      </h4>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden" style={{ border: `1px solid rgba(196,162,62,0.28)` }}>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center text-sm transition-colors hover:bg-[#C4A23E] hover:text-white"
                            style={{ fontFamily: BODY, color: DARK }}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs" style={{ fontFamily: BODY, color: DARK }}>{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center text-sm transition-colors hover:bg-[#C4A23E] hover:text-white"
                            style={{ fontFamily: BODY, color: DARK }}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold" style={{ fontFamily: BODY, color: GOLD }}>
                          ${(getUnitPrice(item.product) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 px-5 py-4" style={{ borderTop: `1px solid rgba(196,162,62,0.15)`, background: CREAM }}>
                <div className="flex justify-between">
                  <span style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.45)' }}>Sous-total</span>
                  <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: DARK }}>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.45)' }}>Livraison</span>
                  <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: country ? GOLD : 'rgba(28,26,20,0.4)' }}>
                    {country ? `+$${shipping.toFixed(2)}` : "Sélectionner le pays"}
                  </span>
                </div>
                <div className="flex items-end justify-between pt-2.5" style={{ borderTop: `1px solid rgba(196,162,62,0.15)` }}>
                  <span style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: DARK, fontWeight: 600 }}>Total</span>
                  <span style={{ fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: GOLD, letterSpacing: '-0.01em' }}>
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Confirm button */}
              <div className="px-5 pb-5">
                <button
                  disabled={isPlacingOrder || cartItems.length === 0 || !isRequiredFieldsValid}
                  onClick={handleConfirmOrder}
                  className="w-full cursor-pointer py-3.5 text-sm font-semibold uppercase tracking-[0.14em] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ fontFamily: BODY, background: GOLD, color: DARK, border: 'none', borderRadius: '1px', letterSpacing: '0.14em' }}
                >
                  {isPlacingOrder ? "Traitement en cours..." : stripeConfigured ? "Payer avec Stripe →" : "Passer la commande →"}
                </button>
                <p className="mt-2.5 text-center" style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(28,26,20,0.35)' }}>
                  Les taxes sont calculées à la commande
                </p>
              </div>
            </div>

            {orderError && (
              <div style={{ border: `1px solid rgba(198,40,40,0.3)`, background: '#fff' }}>
                <div className="px-4 py-3" style={{ background: 'rgba(198,40,40,0.06)', borderLeft: '3px solid #C62828' }}>
                  <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C62828', fontWeight: 600 }}>Attention requise</p>
                </div>
                <div className="px-4 py-3">
                  <p style={{ fontFamily: BODY, fontSize: 13, color: DARK }}>{orderError}</p>
                </div>
              </div>
            )}
          </aside>
        </div>

      </div>

      {/* Order flow overlay */}
      {orderFlowStage !== "idle" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(26,32,40,0.75)' }}>
          <div
            className="w-[90%] max-w-xs overflow-hidden"
            style={{ border: `1px solid rgba(196,162,62,0.25)`, background: '#fff' }}
          >
            {/* Header strip */}
            <div className="px-5 py-3.5" style={{ background: SLATE, borderLeft: `3px solid ${GOLD}` }}>
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                {orderFlowStage === "loading" ? "Traitement de la commande" : "Commande confirmée"}
              </p>
            </div>
            {/* Body */}
            <div className="flex flex-col items-center px-6 py-10 text-center" style={{ background: CREAM }}>
              {orderFlowStage === "loading" ? (
                <>
                  <div
                    className="flex h-14 w-14 items-center justify-center"
                    style={{ border: `1px solid rgba(196,162,62,0.3)`, background: GOLD }}
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                  <h4 className="mt-5 text-base font-medium" style={{ fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: DARK, letterSpacing: '-0.01em', fontSize: 22 }}>
                    Traitement en cours...
                  </h4>
                  <p className="mt-1.5" style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(28,26,20,0.4)' }}>
                    Veuillez patienter un instant
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="flex h-14 w-14 items-center justify-center"
                    style={{ border: `1px solid rgba(46,125,50,0.3)`, background: 'rgba(46,125,50,0.08)' }}
                  >
                    <CheckCircle2 className="h-7 w-7" style={{ color: '#2E7D32' }} />
                  </div>
                  <h4 className="mt-5" style={{ fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: DARK, letterSpacing: '-0.01em', fontSize: 22 }}>
                    Commande confirmée
                  </h4>
                  <p className="mt-1.5" style={{ fontFamily: BODY, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(28,26,20,0.4)' }}>
                    Redirection en cours...
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
