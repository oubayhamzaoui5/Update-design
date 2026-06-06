'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingBag, Heart, ArrowLeft, Truck, RotateCcw, ShieldCheck, Share2, Check } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import InstallationSteps from '@/components/shop/installation-steps'
import ShopProductCard from '@/app/boutique/_components/shop-product-card'
import { getPb } from '@/lib/pb'
import type { ProductListItem, ShopCategory } from '@/lib/services/product.service'
import {
  addToCartForUser,
  fetchIsInCart,
  fetchIsInWishlist,
  toggleWishlistForProduct,
} from '@/lib/shop/client-api'

// â”€â”€ Brand tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#14130F'
const CREAM   = '#F7F2E8'
const PAPER   = '#E9DDC9'
const CARD_FOOTER_BG = '#D5D0C6'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type DetailItem = { label: string; value: string }
type VariantKey = Record<string, string>

type ProductWithDetails = ProductListItem & {
  details?: DetailItem[] | null
  variantKey?: VariantKey
}

type AvailabilityInfo = {
  stock: number
  inStock: boolean
}

type GuestCartItem = {
  productId: string
  quantity: number
}

type InlineCartProduct = {
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

type InlineCartItem = {
  id: string
  quantity: number
  product: InlineCartProduct | null
  source: 'server' | 'guest'
}

type VariantResolved = {
  id: string
  value: string
  resolvedValue: { type: 'image' | 'color' | 'text'; url?: string; value?: string }
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FLAVOR_KEYS = ['saveur', 'flavor', 'flavour', 'goÃ»t', 'gout', 'arome', 'arÃ´me', 'taste', 'parfum']
const COUNT_KEYS  = ['count', 'quantitÃ©', 'quantite', 'qty', 'portion', 'serving', 'size', 'taille', 'poids', 'weight', 'gramme', 'pack', 'capsule', 'sachet', 'boÃ®te', 'boite', 'unitÃ©', 'unite']

function isFlavorKey(k: string) { return FLAVOR_KEYS.some((f) => k.toLowerCase().includes(f)) }
function isCountKey(k: string)  { return COUNT_KEYS.some((c) => k.toLowerCase().includes(c)) }

const GUEST_CART_KEY = 'guest_cart'
function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => item && typeof item.productId === 'string' && typeof item.quantity === 'number' && item.quantity > 0)
  } catch { return [] }
}
function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)) } catch {}
}
function variantKeyToString(value: VariantKey): string {
  return Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|')
}
function disableSmoothScrollForNextNavigation() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.add('no-smooth-scroll')
  window.setTimeout(() => root.classList.remove('no-smooth-scroll'), 300)
}
function resolveVariantDisplay(variantKey: VariantKey | undefined, variantValuesMap: Record<string, VariantResolved[]>): string {
  if (!variantKey) return ''
  return Object.entries(variantKey)
    .map(([key, raw]) => {
      const match = variantValuesMap[key]?.find((item) => item.value === raw)
      return match?.resolvedValue?.value ?? raw
    })
    .filter(Boolean)
    .join(' / ')
}
function getInlineCartUnitPrice(product: InlineCartProduct | null): number {
  if (!product) return 0
  const price = typeof product.price === 'number' ? product.price : 0
  const promo = typeof product.promoPrice === 'number' ? product.promoPrice : null
  return promo != null && promo > 0 && promo < price ? promo : price
}

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ProductClient({
  product,
  imageUrls,
  categoryName,
  categories,
  explicitRelatedProducts,
  relatedProducts,
  availability,
  variants = [],
  variantUrlMap = {},
  variantValuesMap = {},
  metaPixelId = null,
}: {
  product: ProductWithDetails
  imageUrls: string[]
  categoryName: string
  categories: ShopCategory[]
  explicitRelatedProducts: ProductListItem[]
  relatedProducts: ProductListItem[]
  availability: AvailabilityInfo
  variants?: ProductWithDetails[]
  variantUrlMap?: Record<string, string>
  variantValuesMap?: Record<string, VariantResolved[]>
  metaPixelId?: string | null
}) {
  const router      = useRouter()
  const searchParams = useSearchParams()

  const [quantity, setQuantity]                       = useState(1)
  const [isWishlisted, setIsWishlisted]               = useState(false)
  const [isAdding, setIsAdding]                       = useState(false)
  const [isInCart, setIsInCart]                       = useState(false)
  const [isMainCartStatusReady, setIsMainCartStatusReady] = useState(false)
  const [isWishLoading, setIsWishLoading]             = useState(false)
  const [isAddingRelatedId, setIsAddingRelatedId]     = useState<string | null>(null)
  const [relatedInCartIds, setRelatedInCartIds]       = useState<Set<string>>(new Set())
  const [inlineCartItems, setInlineCartItems]         = useState<InlineCartItem[]>([])
  const [isInlineCartLoading, setIsInlineCartLoading] = useState(true)
  const [shareCopied, setShareCopied]                 = useState(false)
  const [activeTab, setActiveTab]                     = useState<'description' | 'details'>('details')
  const [currentImageIdx, setCurrentImageIdx]         = useState(0)
  const [displayImageIdx, setDisplayImageIdx]         = useState(0)
  const [isImageFading, setIsImageFading]             = useState(false)
  const leftPanelRef  = useRef<HTMLDivElement | null>(null)
  const inlineCartRef = useRef<HTMLDivElement | null>(null)
  const [panelFixedStyle, setPanelFixedStyle] = useState<{ top: number; left: number; width: number } | null>(null)

  const defaultVariant = useMemo<ProductWithDetails | null>(() => {
    if (variants.length === 0) return null
    const target = product.variantKey ?? {}
    const match  = variants.find((v) => Object.entries(target).every(([k, val]) => v.variantKey?.[k] === val))
    return match ?? variants[0]
  }, [product.variantKey, variants])

  const [selectedVariant, setSelectedVariant] = useState<ProductWithDetails | null>(defaultVariant)
  useEffect(() => { setSelectedVariant(defaultVariant) }, [defaultVariant])

  const details = useMemo<DetailItem[]>(() => {
    if (!Array.isArray(product.details)) return []
    return product.details.filter((item): item is DetailItem =>
      Boolean(item) && typeof item.label === 'string' && item.label.trim().length > 0 && typeof item.value === 'string')
  }, [product.details])

  const hasDetails = details.length > 0
  useEffect(() => { if (!hasDetails && activeTab === 'details') setActiveTab('description') }, [activeTab, hasDetails])

  const isInStock            = availability.inStock
  const maxSelectableQuantity = isInStock ? Math.max(1, availability.stock) : 1

  const productCategoryTokens = useMemo(() => {
    const productCategoryIds   = new Set(product.categories ?? [])
    return categories
      .filter((c) => productCategoryIds.has(c.id))
      .flatMap((c) => [c.slug, c.name])
      .map((v) => v.toLowerCase())
  }, [product.categories, categories])

  const isMarbleProduct = useMemo(
    () => productCategoryTokens.some((t) => t.includes('marbre') || t.includes('marble')),
    [productCategoryTokens]
  )
  const isWoodProfileProduct = useMemo(
    () =>
      productCategoryTokens.some((t) =>
        (t.includes('profil') || t.includes('profile') || t.includes('pvc')) &&
        (t.includes('bois') || t.includes('wood'))
      ) ||
      [product.slug, product.name, product.sku ?? ''].some((t) => t.toLowerCase().includes('effet-bois')),
    [product.name, product.sku, product.slug, productCategoryTokens]
  )

  const shouldRenderInstallationSteps = isWoodProfileProduct && !isMarbleProduct

  const fromCategorySlug = searchParams.get('category')
  const originCategory   = useMemo(() => {
    if (!fromCategorySlug) return null
    const bySlug = categories.find((c) => c.slug === fromCategorySlug)
    if (!bySlug) return null
    if (product.categories?.length && !product.categories.includes(bySlug.id)) return null
    return bySlug
  }, [categories, fromCategorySlug, product.categories])

  // â”€â”€ Meta Pixel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!metaPixelId) return
    const pixelId = metaPixelId
    function initAndTrack() {
      const w = window as Window & { fbq?: (...args: unknown[]) => void; _fbq?: unknown }
      if (typeof w.fbq !== 'function') {
        const fbq: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string } = function (...args: unknown[]) {
          if (fbq.callMethod) fbq.callMethod(...args)
          else { if (!fbq.queue) fbq.queue = []; fbq.queue.push(args) }
        }
        fbq.loaded = true; fbq.version = '2.0'; fbq.queue = []
        w.fbq = fbq; w._fbq = fbq
        const script = document.createElement('script')
        script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'
        document.head.appendChild(script)
      }
      w.fbq!('init', pixelId)
      w.fbq!('track', 'ViewContent', { content_ids: [product.id], content_type: 'product', content_name: product.name, value: product.promoPrice ?? product.price, currency: product.currency ?? 'TND' })
    }
    if (document.readyState === 'complete') initAndTrack()
    else { window.addEventListener('load', initAndTrack, { once: true }); return () => window.removeEventListener('load', initAndTrack) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaPixelId, product.id])

  // â”€â”€ Image fading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (currentImageIdx === displayImageIdx) return
    setIsImageFading(true)
    const t = window.setTimeout(() => {
      setDisplayImageIdx(currentImageIdx)
      window.requestAnimationFrame(() => setIsImageFading(false))
    }, 140)
    return () => window.clearTimeout(t)
  }, [currentImageIdx, displayImageIdx])

  useEffect(() => { setQuantity((prev) => Math.max(1, Math.min(prev, maxSelectableQuantity))) }, [maxSelectableQuantity])

  // â”€â”€ Pin left panel when cart drawer opens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const onCartOpen  = () => { if (leftPanelRef.current) { const { top, left, width } = leftPanelRef.current.getBoundingClientRect(); setPanelFixedStyle({ top, left, width }) } }
    const onCartClose = () => { requestAnimationFrame(() => setPanelFixedStyle(null)) }
    window.addEventListener('cart:drawer:open',  onCartOpen)
    window.addEventListener('cart:drawer:close', onCartClose)
    return () => { window.removeEventListener('cart:drawer:open', onCartOpen); window.removeEventListener('cart:drawer:close', onCartClose) }
  }, [])

  // â”€â”€ Cart sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      const inGuest  = getGuestCart().some((i) => i.productId === product.id)
      let   inServer = false
      try { inServer = await fetchIsInCart(product.id) } catch {}
      if (!cancelled) { setIsInCart(inServer || inGuest); setIsMainCartStatusReady(true) }
    }
    sync()
    window.addEventListener('cart:updated', sync); window.addEventListener('focus', sync)
    return () => { cancelled = true; window.removeEventListener('cart:updated', sync); window.removeEventListener('focus', sync) }
  }, [product.id])

  useEffect(() => {
    let cancelled = false

    const mapProduct = (prod: any): InlineCartProduct | null => {
      if (!prod) return null
      return {
        id: prod.id ?? '',
        slug: prod.slug ?? '',
        name: prod.name ?? '',
        sku: prod.sku ?? '',
        images: Array.isArray(prod.images) ? prod.images : [],
        imageUrls: Array.isArray(prod.imageUrls) ? prod.imageUrls : [],
        price: typeof prod.price === 'number' ? prod.price : Number(prod.price ?? 0),
        promoPrice: prod.promoPrice == null ? null : Number(prod.promoPrice),
        currency: prod.currency ?? 'DT',
        stock: typeof prod.stock === 'number' ? prod.stock : Number(prod.stock ?? 0),
      }
    }

    const loadInlineCart = async () => {
      setIsInlineCartLoading(true)
      try {
        const serverRes = await fetch('/api/shop/cart', { cache: 'no-store' })
        if (serverRes.ok) {
          const data = await serverRes.json().catch(() => ({}))
          const rows = Array.isArray(data?.items) ? data.items : []
          if (!cancelled) {
            setInlineCartItems(rows.map((item: any) => ({
              id: item.id ?? '',
              quantity: Math.max(1, Number(item.quantity ?? 1)),
              product: mapProduct(item.product),
              source: 'server' as const,
            })))
          }
          return
        }

        const guest = getGuestCart()
        const result: InlineCartItem[] = []
        for (const item of guest) {
          try {
            const res = await fetch(`/api/shop/products/id/${item.productId}`, { cache: 'no-store' })
            if (!res.ok) continue
            const data = await res.json().catch(() => ({}))
            result.push({
              id: item.productId,
              quantity: Math.max(1, Number(item.quantity ?? 1)),
              product: mapProduct(data?.product),
              source: 'guest',
            })
          } catch {}
        }
        if (!cancelled) setInlineCartItems(result)
      } catch {
        if (!cancelled) setInlineCartItems([])
      } finally {
        if (!cancelled) setIsInlineCartLoading(false)
      }
    }

    void loadInlineCart()
    window.addEventListener('cart:updated', loadInlineCart)
    window.addEventListener('focus', loadInlineCart)
    return () => {
      cancelled = true
      window.removeEventListener('cart:updated', loadInlineCart)
      window.removeEventListener('focus', loadInlineCart)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      const explicitIds = new Set(explicitRelatedProducts.map((p) => p.id))
      const guest       = new Set(getGuestCart().map((i) => i.productId).filter((id) => explicitIds.has(id)))
      const checks      = await Promise.all(explicitRelatedProducts.map(async (p) => ({ id: p.id, inCart: await fetchIsInCart(p.id).catch(() => false) })))
      const merged      = new Set(guest); checks.forEach((c) => { if (c.inCart) merged.add(c.id) })
      if (!cancelled) setRelatedInCartIds(merged)
    }
    sync()
    window.addEventListener('cart:updated', sync); window.addEventListener('focus', sync)
    return () => { cancelled = true; window.removeEventListener('cart:updated', sync); window.removeEventListener('focus', sync) }
  }, [explicitRelatedProducts])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const signedIn = getPb(true).authStore.isValid
      if (!signedIn) { if (!cancelled) setIsWishlisted(false); return }
      try { const inWishlist = await fetchIsInWishlist(product.id); if (!cancelled) setIsWishlisted(inWishlist) }
      catch { if (!cancelled) setIsWishlisted(false) }
    }
    run()
    return () => { cancelled = true }
  }, [product.id])

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAddToCart = async () => {
    if (!isInStock) return
    const safeQty = Math.max(1, Math.min(quantity, maxSelectableQuantity))
    try {
      setIsAdding(true)
      try { await addToCartForUser(product.id, safeQty) }
      catch {
        const current = getGuestCart()
        const idx = current.findIndex((i) => i.productId === product.id)
        if (idx >= 0) current[idx].quantity = Math.min(current[idx].quantity + safeQty, maxSelectableQuantity)
        else current.push({ productId: product.id, quantity: safeQty })
        setGuestCart(current)
      }
      if (safeQty !== quantity) setQuantity(safeQty)
      setIsInCart(true)
      window.dispatchEvent(new Event('cart:updated'))
      window.setTimeout(() => inlineCartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
      const w = window as Window & { fbq?: (...args: unknown[]) => void }
      if (metaPixelId && typeof w.fbq === 'function') {
        w.fbq('track', 'AddToCart', { content_ids: [product.id], content_type: 'product', content_name: product.name, value: product.promoPrice ?? product.price, currency: product.currency ?? 'TND', num_items: safeQty })
      }
    } finally { setIsAdding(false) }
  }

  const handleWishlistClick = async () => {
    try {
      setIsWishLoading(true)
      const inWishlist = await toggleWishlistForProduct(product.id)
      setIsWishlisted(inWishlist)
    } catch {
      const currentPath = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : `/produit/${product.slug}`
      router.push(`/connexion?next=${encodeURIComponent(currentPath)}`)
    } finally { setIsWishLoading(false) }
  }

  const handleAddRelatedToCart = async (relatedProductId: string) => {
    if (relatedInCartIds.has(relatedProductId)) {
      inlineCartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    try {
      setIsAddingRelatedId(relatedProductId)
      try { await addToCartForUser(relatedProductId, 1) }
      catch {
        const current = getGuestCart()
        const idx = current.findIndex((i) => i.productId === relatedProductId)
        if (idx >= 0) current[idx].quantity += 1; else current.push({ productId: relatedProductId, quantity: 1 })
        setGuestCart(current)
      }
      setRelatedInCartIds((prev) => new Set(prev).add(relatedProductId))
      window.dispatchEvent(new Event('cart:updated'))
      window.setTimeout(() => inlineCartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
    } finally { setIsAddingRelatedId(null) }
  }

  const handleInlineUpdateQuantity = async (item: InlineCartItem, newQty: number) => {
    if (newQty < 1) {
      await handleInlineRemoveItem(item)
      return
    }
    const maxQty = item.product?.stock != null ? Math.max(1, item.product.stock) : 99
    const safeQty = Math.max(1, Math.min(newQty, maxQty))
    setInlineCartItems((items) => items.map((row) => row.id === item.id ? { ...row, quantity: safeQty } : row))
    try {
      if (item.source === 'server') {
        const res = await fetch('/api/shop/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id, quantity: safeQty }),
        })
        if (!res.ok) throw new Error('Update failed')
      } else {
        const current = getGuestCart()
        const idx = current.findIndex((row) => row.productId === item.id)
        if (idx >= 0) {
          current[idx].quantity = safeQty
          setGuestCart(current)
        }
      }
      window.dispatchEvent(new Event('cart:updated'))
    } catch {
      window.dispatchEvent(new Event('cart:updated'))
    }
  }

  const handleInlineRemoveItem = async (item: InlineCartItem) => {
    setInlineCartItems((items) => items.filter((row) => row.id !== item.id))
    try {
      if (item.source === 'server') {
        const res = await fetch(`/api/shop/cart?itemId=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Remove failed')
      } else {
        setGuestCart(getGuestCart().filter((row) => row.productId !== item.id))
      }
      window.dispatchEvent(new Event('cart:updated'))
    } catch {
      window.dispatchEvent(new Event('cart:updated'))
    }
  }

  const handleShareClick = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : `/produit/${product.slug}`
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(url)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 1800)
    } catch { setShareCopied(false) }
  }

  // â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const activeProduct = selectedVariant ?? product
  const activeVariantKey = selectedVariant?.variantKey ?? product.variantKey ?? {}
  const compatibleVariantValuesMap = useMemo(() => {
    if (variants.length === 0) return variantValuesMap

    const variantKeys = Object.keys(variants[0]?.variantKey ?? {})
    const nextMap: Record<string, VariantResolved[]> = {}

    for (const key of variantKeys) {
      const compatibleRawValues = new Set<string>()
      const otherSelections = Object.entries(activeVariantKey).filter(
        ([otherKey, value]) => otherKey !== key && typeof value === 'string' && value.length > 0
      )

      for (const variant of variants) {
        const currentKey = variant.variantKey ?? {}
        const matchesOtherSelections = otherSelections.every(([otherKey, value]) => currentKey[otherKey] === value)
        const currentValue = currentKey[key]

        if (matchesOtherSelections && typeof currentValue === 'string' && currentValue.length > 0) {
          compatibleRawValues.add(currentValue)
        }
      }

      const allValues = variantValuesMap[key] ?? []
      const compatibleValues = allValues.filter((value) => compatibleRawValues.has(value.value))
      nextMap[key] = compatibleValues.length > 0 ? compatibleValues : allValues
    }

    return nextMap
  }, [activeVariantKey, variantValuesMap, variants])
  const hasPromo      = typeof activeProduct.promoPrice === 'number' && activeProduct.promoPrice > 0 && activeProduct.promoPrice < activeProduct.price
  const displayPrice  = hasPromo ? activeProduct.promoPrice! : activeProduct.price
  const inlineCartSubtotal = useMemo(
    () => inlineCartItems.reduce((sum, item) => sum + getInlineCartUnitPrice(item.product) * item.quantity, 0),
    [inlineCartItems]
  )
  const inlineCartCurrency = inlineCartItems.find((item) => item.product?.currency)?.product?.currency ?? activeProduct.currency ?? 'DT'

  const backHref = originCategory
    ? `/boutique/${originCategory.slug}`
    : searchParams.get('promotions') === '1' ? '/boutique?promotions=1'
    : searchParams.get('nouveautes') === '1' ? '/boutique?nouveautes=1'
    : '/boutique'

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div style={{ background: CREAM, minHeight: '100vh', fontFamily: BODY, color: DARK }}>
      <Navbar reserveSpace />

      {/* â”€â”€ Hero split â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-col lg:flex-row" style={{ background: CREAM }}>

        {/* LEFT: Sticky image panel */}
        <div
          ref={leftPanelRef}
          className="relative flex flex-col lg:sticky lg:top-0 lg:h-screen lg:w-[44%]"
          style={{
            background: PAPER,
            color: DARK,
            ...(panelFixedStyle ? { position: 'fixed', top: panelFixedStyle.top, left: panelFixedStyle.left, width: panelFixedStyle.width } : {}),
          }}
        >
          <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'linear-gradient(90deg,#C4A23E 1px,transparent 1px),linear-gradient(#C4A23E 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
          {/* Back link */}
          <div className="absolute left-5 top-6 z-20 md:left-8">
            <Link
              href={backHref}
              className="inline-flex cursor-pointer items-center gap-2 border px-4 py-3 transition hover:bg-white/70"
              style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(20,19,15,0.62)', borderColor: 'rgba(20,19,15,0.12)' }}
            >
              <ArrowLeft size={12} /> Retour
            </Link>
          </div>

          {/* Main image area */}
          <div
            className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-8 pt-24 md:px-10 lg:px-12 lg:pb-10 lg:pt-24"
            style={{ minHeight: 390 }}
          >
            {imageUrls.length > 1 && (
              <div className="flex w-full items-center justify-between" style={{ maxWidth: 'min(100%, 430px)' }}>
                <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD }}>
                  Photos produit & inspirations
                </span>
                <span className="border bg-white/70 px-2.5 py-1" style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, color: 'rgba(20,19,15,0.52)', borderColor: 'rgba(20,19,15,0.10)' }}>
                  {displayImageIdx + 1}/{imageUrls.length}
                </span>
              </div>
            )}
            <div className="relative w-full aspect-square border border-[#C4A23E]/20 bg-white shadow-[0_30px_80px_rgba(20,19,15,0.10)]" style={{ maxWidth: 'min(100%, 430px)' }}>
              <Image
                key={imageUrls[displayImageIdx] ?? '/placeholder-square.png'}
                src={imageUrls[displayImageIdx] ?? '/placeholder-square.png'}
                alt={product.name}
                fill
                priority
                className={`object-contain p-8 transition-opacity duration-200 ${isImageFading ? 'opacity-0' : 'opacity-100'}`}
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            {/* Prev / Next arrows */}
            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentImageIdx((i) => (i - 1 + imageUrls.length) % imageUrls.length)}
                  aria-label="Image prÃ©cÃ©dente"
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer border border-[#14130F]/10 bg-white/80 px-3 py-1 text-3xl font-light leading-none text-[#14130F]/70 shadow-sm transition hover:bg-white hover:text-[#14130F] sm:left-3 sm:text-4xl lg:left-4 lg:text-5xl"
                >
                  <span aria-hidden="true">&#8249;</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImageIdx((i) => (i + 1) % imageUrls.length)}
                  aria-label="Image suivante"
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer border border-[#14130F]/10 bg-white/80 px-3 py-1 text-3xl font-light leading-none text-[#14130F]/70 shadow-sm transition hover:bg-white hover:text-[#14130F] sm:right-3 sm:text-4xl lg:right-4 lg:text-5xl"
                >
                  <span aria-hidden="true">&#8250;</span>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {imageUrls.length > 1 && (
            <div className="relative z-10 flex flex-wrap justify-center gap-2 px-6 pb-7">
              {imageUrls.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setCurrentImageIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  className="relative cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    width: 68, height: 68, flexShrink: 0,
                    border: i === currentImageIdx ? `2px solid ${GOLD}` : '2px solid rgba(20,19,15,0.12)',
                    opacity: i === currentImageIdx ? 1 : 0.74,
                    background: '#fff',
                    boxShadow: i === currentImageIdx ? '0 10px 24px rgba(20,19,15,0.12)' : 'none',
                  }}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-1.5" sizes="68px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer when left panel is fixed */}
        {panelFixedStyle && <div className="shrink-0 lg:w-[44%]" aria-hidden="true" />}

        {/* RIGHT: Content panel */}
        <div
          className="flex flex-col px-5 pb-20 pt-8 md:px-10 lg:w-[56%] lg:px-12 lg:pt-16 xl:px-16"
          style={{ background: CREAM }}
        >
          <div className="w-full border border-[#14130F]/10 bg-[#F7F2E8] p-5 md:p-7 lg:p-8" style={{ boxShadow: '0 18px 55px rgba(20,19,15,0.08)' }}>
          {/* Category + breadcrumb */}
          {categoryName && (
            <p style={{ fontFamily: BODY, fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>
              {categoryName}
            </p>
          )}

          {/* Product name */}
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 400, color: DARK, lineHeight: 0.92, marginBottom: 14 }}>
            {product.name}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-3" style={{ minHeight: 18 }}>
            {activeProduct.sku && (
              <span className="border border-[#14130F]/12 px-3 py-1.5" style={{ fontFamily: BODY, fontSize: 10, color: 'rgba(20,19,15,0.48)', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>
                RÃ©f. {activeProduct.sku}
              </span>
            )}
            <div className="flex items-center gap-1.5 border border-[#14130F]/12 px-3 py-1.5">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isInStock ? '#2E9A5F' : '#C0392B', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: isInStock ? '#2E9A5F' : '#C0392B' }}>
                {isInStock ? `En stock${availability.stock > 0 && availability.stock <= 5 ? ` â€” Plus que ${availability.stock}` : ''}` : 'Rupture de stock'}
              </span>
            </div>
          </div>

          {/* Price + Quantity */}
          <div className="mb-7 flex flex-col gap-4 border-y border-[#C4A23E]/20 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-4">
              <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, color: GOLD, lineHeight: 1 }}>
                {displayPrice.toFixed(2)} {activeProduct.currency}
              </span>
              {hasPromo && (
                <span style={{ fontFamily: BODY, fontSize: '1rem', fontWeight: 500, color: 'rgba(28,26,20,0.35)', textDecoration: 'line-through' }}>
                  {activeProduct.price.toFixed(2)} {activeProduct.currency}
                </span>
              )}
            </div>
            {/* Qty stepper */}
            <div className="flex w-fit items-center bg-white/45" style={{ border: `1px solid rgba(196,162,62,0.35)` }}>
              <button
                type="button"
                onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                disabled={!isInStock || quantity <= 1}
                className="flex h-11 w-11 cursor-pointer items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontFamily: BODY, fontSize: '1.1rem', color: DARK }}
                onMouseEnter={(e) => { if (quantity > 1) (e.currentTarget).style.background = `${GOLD}18` }}
                onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent' }}
              >
                âˆ’
              </button>
              <span style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: DARK, width: 40, textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((v) => Math.min(v + 1, maxSelectableQuantity))}
                disabled={!isInStock || quantity >= maxSelectableQuantity}
                className="flex h-11 w-11 cursor-pointer items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontFamily: BODY, fontSize: '1.1rem', color: DARK }}
                onMouseEnter={(e) => { if (quantity < maxSelectableQuantity) (e.currentTarget).style.background = `${GOLD}18` }}
                onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Description preview */}
          {product.description && (
            <p
              className="line-clamp-4"
              style={{ fontFamily: BODY, fontSize: '0.95rem', color: 'rgba(20,19,15,0.64)', lineHeight: 1.85, marginBottom: 22 }}
            >
              {product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
            </p>
          )}

          {/* CaractÃ©ristiques */}
          {hasDetails && (
            <div className="mb-7 border border-[#14130F]/10 bg-white/35 p-4">
              <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)', marginBottom: 8 }}>
                CaractÃ©ristiques
              </p>
              <div>
                {details.map((item, i) => (
                  <div
                    key={item.label + i}
                    className="flex items-start justify-between py-2"
                    style={{ borderBottom: `1px solid rgba(196,162,62,0.1)` }}
                  >
                    <span style={{ fontFamily: BODY, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(28,26,20,0.45)', minWidth: '40%' }}>
                      {item.label}
                    </span>
                    <span style={{ fontFamily: BODY, fontSize: '0.8rem', fontWeight: 500, color: DARK, textAlign: 'right', flex: 1 }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ width: '100%', height: 1, background: `rgba(196,162,62,0.2)`, marginBottom: 28 }} />

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-8 space-y-6">
              {Object.keys(variants[0].variantKey ?? {}).map((key) => {
                const values    = compatibleVariantValuesMap[key] ?? variantValuesMap[key] ?? []
                const isFlavor  = isFlavorKey(key)
                const isCount   = isCountKey(key)
                return (
                  <div key={key}>
                    <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.5)', marginBottom: 12 }}>
                      {key}
                    </p>

                    {/* Color swatches */}
                    {!isFlavor && !isCount && values[0]?.resolvedValue.type === 'color' && (
                      <div className="flex flex-wrap gap-3">
                        {values.map((value) => {
                          const nextVariant = { ...activeVariantKey, [key]: value.value }
                          const keyStr      = variantKeyToString(nextVariant)
                          const variantLink = variantUrlMap[keyStr] ?? `/produit/${product.slug}`
                          const isSelected  = activeVariantKey[key] === value.value
                          return (
                            <Link key={value.id} href={variantLink} onClick={disableSmoothScrollForNextNavigation}>
                              <div
                                title={value.resolvedValue.value ?? value.value}
                                className="cursor-pointer transition-all hover:scale-105"
                                style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  backgroundColor: value.resolvedValue.value,
                                  border: `2px solid ${isSelected ? GOLD : 'rgba(28,26,20,0.15)'}`,
                                  boxShadow: isSelected ? `0 0 0 3px ${CREAM}, 0 0 0 5px ${GOLD}` : 'none',
                                }}
                              />
                            </Link>
                          )
                        })}
                      </div>
                    )}

                    {/* Text / image pills */}
                    {(!isFlavor || true) && values[0]?.resolvedValue.type !== 'color' && (
                      <div className="flex flex-wrap gap-2.5">
                        {values.map((value) => {
                          const nextVariant = { ...activeVariantKey, [key]: value.value }
                          const keyStr      = variantKeyToString(nextVariant)
                          const variantLink = variantUrlMap[keyStr] ?? `/produit/${product.slug}`
                          const isSelected  = activeVariantKey[key] === value.value
                          const display     = value.resolvedValue.value ?? value.value
                          return (
                            <Link key={value.id} href={variantLink} onClick={disableSmoothScrollForNextNavigation}>
                              <span
                                className="inline-flex cursor-pointer items-center justify-center px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                                style={{
                                  fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                                  border: `1px solid ${isSelected ? GOLD : 'rgba(28,26,20,0.2)'}`,
                                  background: isSelected ? GOLD : 'rgba(255,255,255,0.32)',
                                  color: isSelected ? '#fff' : DARK,
                                }}
                              >
                                {value.resolvedValue.type === 'image' && value.resolvedValue.url && (
                                  <span className="relative mr-2 inline-block border border-black/10 bg-white" style={{ width: 26, height: 26 }}>
                                    <Image src={value.resolvedValue.url} alt={display} fill unoptimized className="object-cover" />
                                  </span>
                                )}
                                {display}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Add to cart button */}
            {!isMainCartStatusReady ? (
              <button disabled className="w-full py-4 opacity-60" style={{ background: GOLD, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>
                Chargement...
              </button>
            ) : isInCart && isInStock ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex w-full cursor-pointer items-center justify-center gap-2.5 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(20,19,15,0.18)]"
                style={{ background: DARK, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}
              >
                <ShoppingBag size={15} strokeWidth={1.5} /> {isAdding ? 'Ajout en cours...' : 'Ajouter encore'}
              </button>
            ) : isInStock ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex w-full cursor-pointer items-center justify-center gap-2.5 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(196,162,62,0.28)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: GOLD, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}
              >
                <ShoppingBag size={15} strokeWidth={1.5} />
                {isAdding ? 'Ajout en cours...' : 'Ajouter au panier'}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 opacity-50 cursor-not-allowed"
                style={{ background: 'rgba(28,26,20,0.15)', fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: DARK }}
              >
                Indisponible
              </button>
            )}

            {/* Wishlist + Share */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleWishlistClick}
                disabled={isWishLoading}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 py-3 transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{ border: `1px solid rgba(196,162,62,0.3)`, fontFamily: BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: DARK }}
              >
                <Heart size={13} strokeWidth={1.5} className={isWishlisted ? 'fill-[#C4A23E] text-[#C4A23E]' : ''} />
                {isWishlisted ? 'SauvegardÃ©' : 'Sauvegarder'}
              </button>
              <button
                type="button"
                onClick={handleShareClick}
                className="flex items-center justify-center gap-2 cursor-pointer px-4 py-3 transition-opacity hover:opacity-70"
                style={{ border: `1px solid rgba(196,162,62,0.3)`, fontFamily: BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: DARK }}
              >
                {shareCopied ? <Check size={13} strokeWidth={1.5} color="#2E9A5F" /> : <Share2 size={13} strokeWidth={1.5} />}
                {shareCopied ? 'CopiÃ© !' : 'Partager'}
              </button>
            </div>
          </div>

          {/* Inline cart */}
          <div ref={inlineCartRef} className="mb-6 border border-[#14130F]/10 bg-white/45 p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 4 }}>
                  Votre sÃ©lection
                </p>
                <p style={{ fontFamily: BODY, fontSize: 12, color: 'rgba(20,19,15,0.55)', lineHeight: 1.55 }}>
                  Livraison n&apos;est pas disponible pour le moment. Validez la commande et notre Ã©quipe vous contacte pour la suite.
                </p>
              </div>
              <span className="shrink-0 border border-[#C4A23E]/25 px-2.5 py-1" style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, color: GOLD }}>
                {inlineCartItems.length}
              </span>
            </div>

            {isInlineCartLoading ? (
              <p style={{ fontFamily: BODY, fontSize: 12, color: 'rgba(20,19,15,0.45)' }}>Chargement du panier...</p>
            ) : inlineCartItems.length === 0 ? (
              <p style={{ fontFamily: BODY, fontSize: 12, color: 'rgba(20,19,15,0.45)' }}>Ajoutez un article pour prÃ©parer votre commande.</p>
            ) : (
              <>
                <div className="max-h-[310px] space-y-3 overflow-y-auto pr-1">
                  {inlineCartItems.map((item) => {
                    const prod = item.product
                    const imgSrc = prod?.imageUrls?.[0] ?? '/placeholder-square.png'
                    const unitPrice = getInlineCartUnitPrice(prod)
                    const maxQty = prod?.stock != null ? Math.max(1, prod.stock) : 99
                    return (
                      <div key={item.id} className="flex gap-3 border-b border-[#C4A23E]/10 pb-3 last:border-b-0 last:pb-0">
                        <Link href={prod?.slug ? `/produit/${prod.slug}` : '#'} className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden border border-[#C4A23E]/20 bg-white">
                          <Image src={imgSrc} alt={prod?.name ?? 'Produit'} fill sizes="64px" className="object-cover transition duration-300 hover:scale-105" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={prod?.slug ? `/produit/${prod.slug}` : '#'} className="line-clamp-2 cursor-pointer transition-opacity hover:opacity-65" style={{ fontFamily: BODY, fontSize: 13, fontWeight: 700, color: DARK }}>
                            {prod?.name ?? 'Produit'}
                          </Link>
                          {prod?.sku && <p style={{ fontFamily: BODY, fontSize: 10, color: 'rgba(20,19,15,0.38)', marginTop: 2 }}>RÃ©f. {prod.sku}</p>}
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <div className="flex items-center bg-white/70" style={{ border: `1px solid rgba(196,162,62,0.32)` }}>
                              <button type="button" onClick={() => void handleInlineUpdateQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1} className="flex h-7 w-7 cursor-pointer items-center justify-center transition hover:bg-[#C4A23E]/10 disabled:cursor-not-allowed disabled:opacity-35">-</button>
                              <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 700, width: 26, textAlign: 'center', color: DARK }}>{item.quantity}</span>
                              <button type="button" onClick={() => void handleInlineUpdateQuantity(item, item.quantity + 1)} disabled={item.quantity >= maxQty} className="flex h-7 w-7 cursor-pointer items-center justify-center transition hover:bg-[#C4A23E]/10 disabled:cursor-not-allowed disabled:opacity-35">+</button>
                            </div>
                            <div className="text-right">
                              <p style={{ fontFamily: BODY, fontSize: 12, fontWeight: 700, color: GOLD }}>
                                {(unitPrice * item.quantity).toFixed(2)} {prod?.currency ?? inlineCartCurrency}
                              </p>
                              <button type="button" onClick={() => void handleInlineRemoveItem(item)} className="cursor-pointer transition-opacity hover:opacity-60" style={{ fontFamily: BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C0392B' }}>
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#C4A23E]/15 pt-4">
                  <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(20,19,15,0.48)' }}>Sous-total</span>
                  <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 800, color: DARK }}>{inlineCartSubtotal.toFixed(2)} {inlineCartCurrency}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/paiement')}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 py-3.5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(196,162,62,0.24)]"
                  style={{ background: GOLD, color: '#fff', fontFamily: BODY, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}
                >
                  Passer la commande
                </button>
              </>
            )}
          </div>

          {/* Trust strip */}
          <div className="mb-2 grid grid-cols-3 gap-px" style={{ borderTop: `1px solid rgba(196,162,62,0.2)`, paddingTop: 20 }}>
            {[
              { icon: Truck,       label: 'Livraison indisponible' },
              { icon: ShieldCheck, label: 'QualitÃ© garantie'  },
              { icon: RotateCcw,   label: 'Retour facile'     },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 bg-white/35 p-3 text-center">
                <Icon size={18} strokeWidth={1.25} color={`${GOLD}90`} />
                <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)' }}>{label}</span>
              </div>
            ))}
          </div>
          </div>

        </div>
      </div>

      {/* â”€â”€ Installation Steps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {shouldRenderInstallationSteps && (
        <div style={{ background: '#FAF6EE', borderTop: `1px solid rgba(196,162,62,0.2)` }}>
          <InstallationSteps />
        </div>
      )}

      {/* â”€â”€ Related Products (explicit) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {explicitRelatedProducts.length > 0 && (
        <section style={{ background: CREAM, borderTop: `1px solid rgba(196,162,62,0.2)` }} className="py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="mb-10">
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 8 }}>
                ComplÃ©tez votre espace
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: DARK, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                Produits associÃ©s
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {explicitRelatedProducts.map((p, i) => (
                <div key={p.id} className="relative">
                  <ShopProductCard product={p} productHref={`/produit/${p.slug}`} prioritizeImage={i < 2} />
                  <button
                    type="button"
                    onClick={() => void handleAddRelatedToCart(p.id)}
                    disabled={isAddingRelatedId === p.id}
                    className="mt-3 w-full cursor-pointer py-2.5 transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{
                      fontFamily: BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                      background: relatedInCartIds.has(p.id) ? DARK : GOLD,
                      color: '#fff',
                    }}
                  >
                    {relatedInCartIds.has(p.id) ? 'Deja ajoute' : isAddingRelatedId === p.id ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      <Footer />
    </div>
  )
}
