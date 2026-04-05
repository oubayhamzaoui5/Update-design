'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingBag, Heart, ArrowLeft, Truck, RotateCcw, ShieldCheck, Share2, Check } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import InstallationSteps from '@/components/shop/installation-steps'
import ShopProductCard from '@/app/shop/_components/shop-product-card'
import { getPb } from '@/lib/pb'
import { hasInstallationStepsCategory } from '@/lib/shop/product-category-match'
import type { ProductListItem, ShopCategory } from '@/lib/services/product.service'
import {
  addToCartForUser,
  fetchIsInCart,
  fetchIsInWishlist,
  toggleWishlistForProduct,
} from '@/lib/shop/client-api'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'

// ── Types ─────────────────────────────────────────────────────────────────────
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

type VariantResolved = {
  id: string
  value: string
  resolvedValue: { type: 'image' | 'color' | 'text'; url?: string; value?: string }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const FLAVOR_KEYS = ['saveur', 'flavor', 'flavour', 'goût', 'gout', 'arome', 'arôme', 'taste', 'parfum']
const COUNT_KEYS  = ['count', 'quantité', 'quantite', 'qty', 'portion', 'serving', 'size', 'taille', 'poids', 'weight', 'gramme', 'pack', 'capsule', 'sachet', 'boîte', 'boite', 'unité', 'unite']

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

// ── Main Component ────────────────────────────────────────────────────────────
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
  const [shareCopied, setShareCopied]                 = useState(false)
  const [activeTab, setActiveTab]                     = useState<'description' | 'details'>('details')
  const [currentImageIdx, setCurrentImageIdx]         = useState(0)
  const [displayImageIdx, setDisplayImageIdx]         = useState(0)
  const [isImageFading, setIsImageFading]             = useState(false)
  const leftPanelRef  = useRef<HTMLDivElement | null>(null)
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

  const shouldRenderInstallationSteps = useMemo(() => hasInstallationStepsCategory(product, categories), [product, categories])

  const installationStep3Image = useMemo(() => {
    const productCategoryIds   = new Set(product.categories ?? [])
    const productCategoryTokens = categories
      .filter((c) => productCategoryIds.has(c.id))
      .flatMap((c) => [c.slug, c.name])
      .map((v) => v.toLowerCase())
    return productCategoryTokens.some((t) => t.includes('marbre') || t.includes('marble')) ? '/step3_1.webp' : '/step3.webp'
  }, [product.categories, categories])

  const alsoLikeProducts = useMemo(() => {
    const explicitIds = new Set(explicitRelatedProducts.map((p) => p.id))
    return relatedProducts.filter((p) => !explicitIds.has(p.id)).slice(0, 4)
  }, [explicitRelatedProducts, relatedProducts])

  const fromCategorySlug = searchParams.get('category')
  const originCategory   = useMemo(() => {
    if (!fromCategorySlug) return null
    const bySlug = categories.find((c) => c.slug === fromCategorySlug)
    if (!bySlug) return null
    if (product.categories?.length && !product.categories.includes(bySlug.id)) return null
    return bySlug
  }, [categories, fromCategorySlug, product.categories])

  // ── Meta Pixel ───────────────────────────────────────────────────────────────
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

  // ── Image fading ─────────────────────────────────────────────────────────────
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

  // ── Pin left panel when cart drawer opens ────────────────────────────────────
  useEffect(() => {
    const onCartOpen  = () => { if (leftPanelRef.current) { const { top, left, width } = leftPanelRef.current.getBoundingClientRect(); setPanelFixedStyle({ top, left, width }) } }
    const onCartClose = () => { requestAnimationFrame(() => setPanelFixedStyle(null)) }
    window.addEventListener('cart:drawer:open',  onCartOpen)
    window.addEventListener('cart:drawer:close', onCartClose)
    return () => { window.removeEventListener('cart:drawer:open', onCartOpen); window.removeEventListener('cart:drawer:close', onCartClose) }
  }, [])

  // ── Cart sync ────────────────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
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
      window.dispatchEvent(new Event('cart:open'))
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
      const currentPath = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : `/product/${product.slug}`
      router.push(`/login?next=${encodeURIComponent(currentPath)}`)
    } finally { setIsWishLoading(false) }
  }

  const handleAddRelatedToCart = async (relatedProductId: string) => {
    if (relatedInCartIds.has(relatedProductId)) { window.dispatchEvent(new Event('cart:open')); return }
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
      window.dispatchEvent(new Event('cart:updated')); window.dispatchEvent(new Event('cart:open'))
    } finally { setIsAddingRelatedId(null) }
  }

  const handleShareClick = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : `/product/${product.slug}`
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(url)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 1800)
    } catch { setShareCopied(false) }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const activeProduct = selectedVariant ?? product
  const hasPromo      = typeof activeProduct.promoPrice === 'number' && activeProduct.promoPrice > 0 && activeProduct.promoPrice < activeProduct.price
  const displayPrice  = hasPromo ? activeProduct.promoPrice! : activeProduct.price

  const backHref = originCategory
    ? `/shop/${originCategory.slug}`
    : searchParams.get('promotions') === '1' ? '/shop?promotions=1'
    : searchParams.get('nouveautes') === '1' ? '/shop?nouveautes=1'
    : '/shop'

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: CREAM, minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero split ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row">

        {/* LEFT: Sticky image panel */}
        <div
          ref={leftPanelRef}
          className="relative lg:w-[52%] lg:sticky lg:top-0 lg:h-screen flex flex-col"
          style={{
            background: '#ffffff',
            ...(panelFixedStyle ? { position: 'fixed', top: panelFixedStyle.top, left: panelFixedStyle.left, width: panelFixedStyle.width } : {}),
          }}
        >
          {/* Back link */}
          <div className="absolute z-20" style={{ top: 'calc(var(--navbar-offset-desktop, 80px) + 1rem)', left: '1.5rem' }}>
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-50"
              style={{ fontFamily: BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)' }}
            >
              <ArrowLeft size={12} /> Retour
            </Link>
          </div>

          {/* Main image area */}
          <div
            className="relative flex flex-1 items-center justify-center px-10 pb-10 lg:px-14 lg:pb-14"
            style={{ paddingTop: 'calc(var(--navbar-offset-desktop, 80px) + 1.5rem)', minHeight: 420 }}
          >
<div className="relative w-full aspect-square" style={{ maxWidth: 'min(100%, 520px)' }}>
              <Image
                key={imageUrls[displayImageIdx] ?? '/placeholder-square.png'}
                src={imageUrls[displayImageIdx] ?? '/placeholder-square.png'}
                alt={product.name}
                fill
                priority
                className={`object-cover transition-opacity duration-200 ${isImageFading ? 'opacity-0' : 'opacity-100'}`}
                sizes="(max-width: 1024px) 100vw, 52vw"
              />
            </div>

            {/* Prev / Next arrows */}
            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentImageIdx((i) => (i - 1 + imageUrls.length) % imageUrls.length)}
                  aria-label="Image précédente"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer p-0.5 text-3xl font-black leading-none text-black transition hover:opacity-60 sm:left-3 sm:text-4xl lg:left-4 lg:p-1 lg:text-5xl"
                >
                  <span aria-hidden="true">&#8249;</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImageIdx((i) => (i + 1) % imageUrls.length)}
                  aria-label="Image suivante"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer p-0.5 text-3xl font-black leading-none text-black transition hover:opacity-60 sm:right-3 sm:text-4xl lg:right-4 lg:p-1 lg:text-5xl"
                >
                  <span aria-hidden="true">&#8250;</span>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {imageUrls.length > 1 && (
            <div className="flex justify-center gap-2 px-6 pb-7 flex-wrap">
              {imageUrls.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setCurrentImageIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  className="relative cursor-pointer overflow-hidden transition-all duration-200"
                  style={{
                    width: 60, height: 60, flexShrink: 0,
                    border: i === currentImageIdx ? `2px solid ${GOLD}` : '2px solid rgba(28,26,20,0.12)',
                    opacity: i === currentImageIdx ? 1 : 0.55,
                    background: '#fff',
                  }}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="60px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer when left panel is fixed */}
        {panelFixedStyle && <div className="lg:w-[52%] shrink-0" aria-hidden="true" />}

        {/* RIGHT: Content panel */}
        <div
          className="flex flex-col lg:w-[48%] px-5 pt-8 pb-20 lg:px-12 xl:px-16 lg:pt-28"
          style={{ background: CREAM }}
        >
          {/* Category + breadcrumb */}
          {categoryName && (
            <p style={{ fontFamily: BODY, fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>
              {categoryName}
            </p>
          )}

          {/* Product name */}
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.9rem, 3.2vw, 3rem)', fontWeight: 400, color: DARK, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 8 }}>
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-5" style={{ minHeight: 18 }}>
            {activeProduct.sku && (
              <span style={{ fontFamily: BODY, fontSize: 11, color: 'rgba(28,26,20,0.35)', letterSpacing: '0.08em' }}>
                Réf. {activeProduct.sku}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isInStock ? '#2E9A5F' : '#C0392B', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: isInStock ? '#2E9A5F' : '#C0392B' }}>
                {isInStock ? `En stock${availability.stock > 0 && availability.stock <= 5 ? ` — Plus que ${availability.stock}` : ''}` : 'Rupture de stock'}
              </span>
            </div>
          </div>

          {/* Price + Quantity */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-4">
              <span style={{ fontFamily: BODY, fontSize: '1.6rem', fontWeight: 800, color: GOLD, letterSpacing: '-0.01em' }}>
                {displayPrice.toFixed(2)} {activeProduct.currency}
              </span>
              {hasPromo && (
                <span style={{ fontFamily: BODY, fontSize: '1rem', fontWeight: 500, color: 'rgba(28,26,20,0.35)', textDecoration: 'line-through' }}>
                  {activeProduct.price.toFixed(2)} {activeProduct.currency}
                </span>
              )}
            </div>
            {/* Qty stepper */}
            <div className="flex items-center" style={{ border: `1px solid rgba(196,162,62,0.35)` }}>
              <button
                type="button"
                onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                disabled={!isInStock || quantity <= 1}
                className="flex h-11 w-11 cursor-pointer items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontFamily: BODY, fontSize: '1.1rem', color: DARK }}
                onMouseEnter={(e) => { if (quantity > 1) (e.currentTarget).style.background = `${GOLD}18` }}
                onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent' }}
              >
                −
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
              className="line-clamp-3"
              style={{ fontFamily: BODY, fontSize: '0.85rem', color: 'rgba(28,26,20,0.6)', lineHeight: 1.75, marginBottom: 16 }}
            >
              {product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
            </p>
          )}

          {/* Caractéristiques */}
          {hasDetails && (
            <div className="mb-6">
              <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)', marginBottom: 8 }}>
                Caractéristiques
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
                const values    = variantValuesMap[key] ?? []
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
                          const nextVariant = { ...(selectedVariant?.variantKey ?? {}), [key]: value.value }
                          const keyStr      = variantKeyToString(nextVariant)
                          const variantLink = variantUrlMap[keyStr] ?? `/product/${product.slug}`
                          const isSelected  = selectedVariant?.variantKey?.[key] === value.value
                          return (
                            <Link key={value.id} href={variantLink} onClick={disableSmoothScrollForNextNavigation}>
                              <div
                                title={value.resolvedValue.value ?? value.value}
                                className="cursor-pointer transition-all"
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
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => {
                          const nextVariant = { ...(selectedVariant?.variantKey ?? {}), [key]: value.value }
                          const keyStr      = variantKeyToString(nextVariant)
                          const variantLink = variantUrlMap[keyStr] ?? `/product/${product.slug}`
                          const isSelected  = selectedVariant?.variantKey?.[key] === value.value
                          const display     = value.resolvedValue.value ?? value.value
                          return (
                            <Link key={value.id} href={variantLink} onClick={disableSmoothScrollForNextNavigation}>
                              <span
                                className="inline-flex cursor-pointer items-center justify-center px-4 py-2 transition-all"
                                style={{
                                  fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                                  border: `1px solid ${isSelected ? GOLD : 'rgba(28,26,20,0.2)'}`,
                                  background: isSelected ? GOLD : 'transparent',
                                  color: isSelected ? '#fff' : DARK,
                                }}
                              >
                                {value.resolvedValue.type === 'image' && value.resolvedValue.url && (
                                  <span className="relative mr-2 inline-block" style={{ width: 18, height: 18 }}>
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
            ) : isInCart ? (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('cart:open'))}
                className="w-full cursor-pointer flex items-center justify-center gap-2.5 py-4 transition-opacity hover:opacity-80"
                style={{ background: DARK, fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}
              >
                <ShoppingBag size={15} strokeWidth={1.5} /> Voir le panier
              </button>
            ) : isInStock ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full cursor-pointer flex items-center justify-center gap-2.5 py-4 transition-opacity hover:opacity-85 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
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
                {isWishlisted ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
              <button
                type="button"
                onClick={handleShareClick}
                className="flex items-center justify-center gap-2 cursor-pointer px-4 py-3 transition-opacity hover:opacity-70"
                style={{ border: `1px solid rgba(196,162,62,0.3)`, fontFamily: BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: DARK }}
              >
                {shareCopied ? <Check size={13} strokeWidth={1.5} color="#2E9A5F" /> : <Share2 size={13} strokeWidth={1.5} />}
                {shareCopied ? 'Copié !' : 'Partager'}
              </button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3 mb-10" style={{ borderTop: `1px solid rgba(196,162,62,0.2)`, paddingTop: 20 }}>
            {[
              { icon: Truck,       label: 'Livraison Tunisie' },
              { icon: ShieldCheck, label: 'Qualité garantie'  },
              { icon: RotateCcw,   label: 'Retour facile'     },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <Icon size={18} strokeWidth={1.25} color={`${GOLD}90`} />
                <span style={{ fontFamily: BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)' }}>{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Installation Steps ──────────────────────────────────────────────── */}
      {shouldRenderInstallationSteps && (
        <div style={{ background: '#FAF6EE', borderTop: `1px solid rgba(196,162,62,0.2)` }}>
          <InstallationSteps step3Image={installationStep3Image} />
        </div>
      )}

      {/* ── Related Products (explicit) ─────────────────────────────────────── */}
      {explicitRelatedProducts.length > 0 && (
        <section style={{ background: CREAM, borderTop: `1px solid rgba(196,162,62,0.2)` }} className="py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="mb-10">
              <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 8 }}>
                Complétez votre espace
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: DARK, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                Produits associés
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {explicitRelatedProducts.map((p, i) => (
                <div key={p.id} className="relative">
                  <ShopProductCard product={p} productHref={`/product/${p.slug}`} prioritizeImage={i < 2} />
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
                    {relatedInCartIds.has(p.id) ? 'Voir le panier' : isAddingRelatedId === p.id ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Also Like ───────────────────────────────────────────────────────── */}
      {alsoLikeProducts.length > 0 && (
        <section style={{ background: '#FAF6EE', borderTop: `1px solid rgba(196,162,62,0.2)` }} className="py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 8 }}>
                  Vous aimerez aussi
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: DARK, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                  Autres suggestions
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-60"
                style={{ fontFamily: BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(28,26,20,0.4)' }}
              >
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {alsoLikeProducts.map((p, i) => (
                <ShopProductCard key={p.id} product={p} productHref={`/product/${p.slug}`} prioritizeImage={i < 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
