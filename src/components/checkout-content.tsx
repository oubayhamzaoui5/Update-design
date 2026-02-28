"use client"

import { useEffect, useMemo, useState } from "react"
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
  Plus,
  Minus,
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
}

const PHONE_PREFIX = "+216"
const GUEST_CART_KEY = "guest_cart"
const SIGNUP_PROMO_DISMISSED_KEY = "signup_promo_dismissed_v1"
const DEFAULT_CURRENCY = "DT"
const TUNISIA_CITIES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Beja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabes",
  "Medenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kebili",
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

function formatPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
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
  const [phone, setPhone] = useState("")

  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [notes, setNotes] = useState("")

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

  useEffect(() => {
    let cancelled = false

    const applyModel = (model: Record<string, any> | null) => {
      if (!model) return

      if (typeof model.email === "string") setEmail((prev) => prev || model.email)
      if (typeof model.phone === "string") {
        const rawPhone = model.phone.replace(PHONE_PREFIX, "").trim()
        setPhone((prev) => prev || formatPhoneDigits(rawPhone))
      }
      if (typeof model.name === "string" && model.name.trim()) {
        const [f = "", ...rest] = model.name.trim().split(/\s+/)
        setFirstName((prev) => prev || f)
        setLastName((prev) => prev || rest.join(" "))
      }
      if (typeof model.firstName === "string") setFirstName((prev) => prev || model.firstName)
      if (typeof model.lastName === "string") setLastName((prev) => prev || model.lastName)
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
          throw new Error(data?.message || "Impossible de charger les adresses.")
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
        }))
        setAddresses(mapped)
        if (mapped.length > 0) {
          setSelectedAddressId(mapped[0].id)
        }
      } catch (err: any) {
        if (!cancelled) {
          setAddresses([])
          setOrderError(err?.message || "Impossible de charger les adresses.")
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
    setCity(selected.city || "")
    setPostalCode(selected.postalCode || "")
    setNotes(selected.notes || "")
  }, [addresses, selectedAddressId])

  useEffect(() => {
    let cancelled = false

    const loadBuyNow = async () => {
      if (!buyNow || !buyNowProductId) return false
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
        for (const item of guest) {
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
  const cartCurrency =
    cartItems.find((item) => item.product?.currency)?.product?.currency ?? DEFAULT_CURRENCY
  const shipping = cartItems.length > 0 ? 8 : 0
  const cartTotal = cartSubtotal + shipping

  const canSaveAddress = useMemo(() => {
    if (!isLoggedIn) return false
    return Boolean(address.trim() && city.trim())
  }, [isLoggedIn, address, city])
  const isPostalCodeValid = /^\d{4}$/.test(postalCode.trim())
  const isRequiredFieldsValid = useMemo(
    () =>
      Boolean(
        firstName.trim() &&
        lastName.trim() &&
        phone.trim() &&
        address.trim() &&
        city.trim() &&
        isPostalCodeValid &&
        email.trim()
      ),
    [firstName, lastName, phone, address, city, isPostalCodeValid, email]
  )

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
        setOrderError("Veuillez vous reconnecter pour enregistrer l'adresse.")
        return
      }

      const payload = {
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        notes: notes.trim(),
      }

      if (selectedAddressId !== "new") {
        const res = await fetch("/api/shop/addresses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedAddressId, ...payload }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || "Impossible de mettre a jour l'adresse.")
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
          throw new Error(data?.message || "Impossible d'enregistrer l'adresse.")
        }
        const data = await res.json()
        const created = data?.item
        const mapped: UserAddress = {
          id: String(created.id),
          address: String(created.address ?? payload.address),
          city: String(created.city ?? payload.city),
          postalCode: String(created.postalCode ?? payload.postalCode),
          notes: String(created.notes ?? payload.notes),
        }
        setAddresses((prev) => [mapped, ...prev])
        setSelectedAddressId(mapped.id)
      }
    } catch (err: any) {
      setOrderError(err?.message || "Impossible d'enregistrer l'adresse pour le moment.")
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleConfirmOrder = async () => {
    setOrderError(null)

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setOrderError("Veuillez remplir vos informations de contact.")
      return
    }
    if (!address.trim() || !city.trim()) {
      setOrderError("Veuillez renseigner l'adresse de livraison.")
      return
    }
    if (!/^\d{4}$/.test(postalCode.trim())) {
      setOrderError("Le code postal doit contenir exactement 4 chiffres.")
      return
    }
    if (cartItems.length === 0) {
      setOrderError("Votre panier est vide.")
      return
    }

    try {
      setIsPlacingOrder(true)
      setOrderFlowStage("loading")
      const fullPhone = `${PHONE_PREFIX} ${phone.trim()}`

      const itemsPayload = cartItems.map((item) => ({
        id: item.product?.id,
        productId: item.product?.id,
        name: item.product?.name ?? "Produit",
        sku: item.product?.sku ?? "",
        unitPrice: getUnitPrice(item.product),
        quantity: Math.max(1, Number(item.quantity || 1)),
      }))

      const orderPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: fullPhone,
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        notes: notes.trim(),
        paymentMode: "cash_on_delivery",
        status: "pending",
        items: itemsPayload,
        total: cartTotal,
        currency: cartCurrency,
      }

      const orderRes = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}))
        throw new Error(data?.message || "La commande a echoue. Veuillez reessayer.")
      }

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
      await new Promise((resolve) => window.setTimeout(resolve, 1400))
      router.push("/")
    } catch (err: any) {
      setOrderFlowStage("idle")
      const message = err?.data?.message || err?.message || "La commande a echoue. Veuillez reessayer."
      setOrderError(String(message))
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const goldColor = "#D4AF37"

  const cardClass =
    "rounded-3xl border border-border/40 bg-white/70  p-6 shadow-sm backdrop-blur-md"
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1"
  const inputClass =
    "w-full rounded-2xl border border-border/60 bg-white  px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-accent/20 focus:border-accent"

  return (
    <div className="min-h-screen bg-[#fafafa]  pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] h-[30%] w-[30%] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div
        className={`mx-auto max-w-7xl px-4 ${
          isPromoBannerVisible ? "pt-40 md:pt-44" : "pt-24 md:pt-28"
        }`}
      >
        <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap">
          <span className="hover:text-foreground cursor-pointer transition-colors">Panier</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-bold">Informations</span>
          <ChevronRight className="h-3 w-3" />
          <span className="opacity-50 text-foreground">Livraison</span>
          <ChevronRight className="h-3 w-3" />
          <span className="opacity-50 text-foreground">Paiement</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
                Détails de la <span style={{ color: goldColor }}>Commande</span>
              </h1>
              <p className="text-muted-foreground">Complétez vos informations pour finaliser l&apos;achat.</p>
            </header>

            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <ShoppingBag size={18} />
                </div>
                <h2 className="text-lg font-bold">Contact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className={labelClass}>Prénom <span className="text-destructive">*</span></label>
                  <input type="text" className={inputClass} placeholder="Ahmed" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Nom <span className="text-destructive">*</span></label>
                  <input type="text" className={inputClass} placeholder="Gharbi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className={labelClass}>Email <span className="text-destructive">*</span></label>
                  <input type="email" className={inputClass} placeholder="Ahmed.gharbi@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className={labelClass}>Téléphone <span className="text-destructive">*</span></label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground border-r pr-3 border-border/60">
                      {PHONE_PREFIX}
                    </span>
                    <input
                      type="tel"
                      className={`${inputClass} pl-16`}
                      placeholder="99 999 999"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneDigits(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Truck size={18} />
                  </div>
                  <h2 className="text-lg font-bold">Expédition</h2>
                </div>

                {isLoggedIn && addresses.length > 0 && (
                  <select
                    className="text-xs bg-accent/5 border border-accent/20 rounded-full px-4 py-1.5 font-semibold text-accent outline-none cursor-pointer"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>{a.city} - {a.address.slice(0, 26)}...</option>
                    ))}
                    <option value="new">+ Nouvelle adresse</option>
                  </select>
                )}
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className={labelClass}>Adresse complète <span className="text-destructive">*</span></label>
                  <input type="text" className={inputClass} placeholder="N°, Rue, Appt..." value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className={labelClass}>Ville <span className="text-destructive">*</span></label>
                    <select
                      className={inputClass}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="">Sélectionner une ville</option>
                      {TUNISIA_CITIES.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Code Postal <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inputClass}
                      placeholder="1000"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Instructions spéciales</label>
                  <textarea rows={2} className={`${inputClass} resize-none py-3`} placeholder="Digicode, étage, voisin..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                {isLoggedIn && (
                  <button
                    onClick={handleSaveAddress}
                    disabled={!canSaveAddress}
                    className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest hover:opacity-80 disabled:opacity-30 transition-all"
                  >
                    <Save size={14} />
                    {isSavingAddress ? "Enregistrement..." : "Mémoriser cette adresse"}
                  </button>
                )}
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-lg font-bold">Paiement</h2>
              </div>

              <div className="space-y-3">
                <div className="relative flex items-center p-4 rounded-2xl border-2 border-accent bg-accent/5 transition-all">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-4 border-accent bg-white" />
                    <span className="font-semibold text-sm">Paiement à la livraison</span>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-2xl border border-border/60 bg-zinc-50  opacity-50">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-border" />
                    <span className="font-medium text-sm">Carte Bancaire</span>
                  </div>
                  <CreditCard size={18} className="text-muted-foreground" />
                </div>
              </div>
            </section>
          </div>

          <aside className={`lg:sticky space-y-6 ${isPromoBannerVisible ? "lg:top-40" : "lg:top-28"}`}>
            <div className="rounded-3xl border border-border/50 bg-gradient-to-b from-white to-[#f8f6ef] p-6 text-foreground shadow-xl overflow-hidden relative">
              <div className="absolute -top-10 -right-8 h-40 w-40 rounded-full bg-accent/10 blur-[50px]" />
              <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-gold/10 blur-[45px]" />

              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Récapitulatif <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">{cartItems.length} articles</span>
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden bg-[#f2eee0] border border-border/50">
                       {item.product?.images?.[0] && (
                        <Image
                          src={pbFileUrl(item.product.id, item.product.images[0])}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-1 left-1 rounded-full border border-border/50 bg-white/85 p-1 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-bold truncate pr-4">{item.product?.name}</h4>
                      <p className="mb-2 text-xs text-muted-foreground">Quantité: {item.quantity}</p>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center rounded-full border border-border/50 bg-white px-2 py-1">
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-accent transition-colors"><Minus size={12}/></button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-accent transition-colors"><Plus size={12}/></button>
                         </div>
                         <span className="text-sm font-bold" style={{ color: goldColor }}>
                            {(getUnitPrice(item.product) * item.quantity).toFixed(2)} {item.product?.currency ?? DEFAULT_CURRENCY}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3 border-t border-border/50 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{cartSubtotal.toFixed(2)} {cartCurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-emerald-400 font-medium">+{shipping.toFixed(2)} {cartCurrency}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-lg font-bold">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tighter" style={{ color: goldColor }}>
                      {cartTotal.toFixed(2)} {cartCurrency}
                    </p>
                  </div>
                </div>
              </div>

              <button
                disabled={isPlacingOrder || cartItems.length === 0 || !isRequiredFieldsValid}
                onClick={handleConfirmOrder}
                className={`relative isolate w-full overflow-hidden rounded-lg cursor-pointer py-3 font-bold uppercase tracking-widest text-white transition-transform duration-300 before:absolute before:inset-y-0 before:left-[-40%] before:w-[35%] before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-180%] before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-[420%] hover:scale-[1.01] disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 disabled:hover:before:translate-x-[-180%] ${isPromoBannerVisible ? "mt-10" : "mt-8"}`}
                style={{ backgroundColor: goldColor }}
              >
                <span className="relative z-10">{isPlacingOrder ? "Traitement..." : "Confirmer la Commande"}</span>
              </button>

          
            </div>

            {orderError && (
              <div className="animate-in slide-in-from-top-2 fade-in rounded-2xl border border-destructive/25 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-destructive/80" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive/80">Vérification requise</p>
                    <p className="mt-1 text-sm text-foreground/85">{orderError}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {orderFlowStage !== "idle" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="w-[90%] max-w-sm rounded-3xl border border-border/50 bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              {orderFlowStage === "loading" ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>
                  <h4 className="mt-4 text-lg font-bold">Finalisation de la commande</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Patientez quelques secondes...</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h4 className="mt-4 text-lg font-bold">Votre commande est confirmee</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Redirection vers l'accueil...</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
