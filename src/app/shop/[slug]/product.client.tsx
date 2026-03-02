'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Heart, RotateCcw, Share2, Shield, ShoppingCart, Truck } from 'lucide-react'

import Card from '@/components/admin/card'
import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import InstallationSteps from '@/components/shop/installation-steps'
import ProductGallery from '@/components/shop/product-gallery.client'
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

type BreadcrumbItem = {
  label: string
  href?: string
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

const GUEST_CART_KEY = 'guest_cart'
const SIGNUP_PROMO_DISMISSED_KEY = 'signup_promo_dismissed_v1'

function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    )
  } catch {
    return []
  }
}

function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch {
    // ignore storage write errors
  }
}

function variantKeyToString(value: VariantKey): string {
  return Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|')
}

function Price({ p }: { p: ProductWithDetails }) {
  const hasPromo = p.promoPrice != null && p.promoPrice > 0 && p.promoPrice < p.price
  if (!hasPromo) {
    return (
      <span className="text-3xl font-bold tracking-tight text-accent">
        {p.price.toFixed(2)} <span className="text-sm font-medium text-accent/80">{p.currency}</span>
      </span>
    )
  }

  const discount = Math.round(((p.price - p.promoPrice!) / p.price) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold tracking-tight text-accent">
          {p.promoPrice!.toFixed(2)} <span className="text-sm font-medium text-accent">{p.currency}</span>
        </span>
        <span className="text-lg text-foreground/50 line-through">
          {p.price.toFixed(2)} {p.currency}
        </span>
        <span className="rounded bg-destructive px-2 py-1 text-sm font-semibold text-white">
          Economisez {discount}%
        </span>
      </div>
    </div>
  )
}

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
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isMainCartStatusReady, setIsMainCartStatusReady] = useState(false)
  const [addMessage, setAddMessage] = useState<string | null>(null)
  const [isWishLoading, setIsWishLoading] = useState(false)
  const [isAddingRelatedId, setIsAddingRelatedId] = useState<string | null>(null)
  const [relatedInCartIds, setRelatedInCartIds] = useState<Set<string>>(new Set())
  const [isRelatedCartStatusReady, setIsRelatedCartStatusReady] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('details')
  const [hasSignupPromoBanner, setHasSignupPromoBanner] = useState(false)
  const [isDesktopViewport, setIsDesktopViewport] = useState(false)
  const [alsoLikeSlide, setAlsoLikeSlide] = useState(0)
  const alsoLikeScrollRef = useRef<HTMLDivElement | null>(null)

  const defaultVariant = useMemo<ProductWithDetails | null>(() => {
    if (variants.length === 0) return null
    const target = product.variantKey ?? {}
    const match = variants.find((variant) =>
      Object.entries(target).every(([key, value]) => variant.variantKey?.[key] === value)
    )
    return match ?? variants[0]
  }, [product.variantKey, variants])

  const [selectedVariant, setSelectedVariant] = useState<ProductWithDetails | null>(defaultVariant)
  useEffect(() => {
    setSelectedVariant(defaultVariant)
  }, [defaultVariant])

  const details = useMemo<DetailItem[]>(() => {
    if (!Array.isArray(product.details)) return []
    return product.details.filter(
      (item): item is DetailItem =>
        Boolean(item) &&
        typeof item.label === 'string' &&
        item.label.trim().length > 0 &&
        typeof item.value === 'string'
    )
  }, [product.details])

  const hasDetails = details.length > 0
  useEffect(() => {
    if (!hasDetails && activeTab === 'details') {
      setActiveTab('description')
    }
  }, [activeTab, hasDetails])

  const isInStock = availability.inStock

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false

    const resolveSignupBannerVisibility = async () => {
      const dismissedUntilRaw = window.localStorage.getItem(SIGNUP_PROMO_DISMISSED_KEY)
      const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : 0
      const isDismissed =
        !!dismissedUntilRaw && Number.isFinite(dismissedUntil) && Date.now() < dismissedUntil

      if (isDismissed) {
        if (!cancelled) setHasSignupPromoBanner(false)
        return
      }

      let isLoggedIn = false
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          isLoggedIn = Boolean(data?.user?.id)
        } else {
          isLoggedIn = getPb(true).authStore.isValid
        }
      } catch {
        isLoggedIn = getPb(true).authStore.isValid
      }

      if (!cancelled) {
        setHasSignupPromoBanner(!isLoggedIn)
      }
    }

    resolveSignupBannerVisibility()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const onChange = (event: MediaQueryListEvent) => setIsDesktopViewport(event.matches)
    setIsDesktopViewport(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  const mainCategory = useMemo(() => {
    if (!product.categories || product.categories.length === 0) return null
    return categories.find((c) => c.id === product.categories?.[0]) ?? null
  }, [categories, product.categories])

  const shouldRenderInstallationSteps = useMemo(
    () => hasInstallationStepsCategory(product, categories),
    [product, categories]
  )
  const installationStep3Image = useMemo(() => {
    const productCategoryIds = new Set(product.categories ?? [])
    const productCategoryTokens = categories
      .filter((category) => productCategoryIds.has(category.id))
      .flatMap((category) => [category.slug, category.name])
      .map((value) => value.toLowerCase())

    const hasMarbreCategory = productCategoryTokens.some(
      (token) => token.includes('marbre') || token.includes('marble')
    )
    if (hasMarbreCategory) return '/step3_1.webp'

    const hasBoisCategory = productCategoryTokens.some((token) => token.includes('bois'))
    if (hasBoisCategory) return '/step3.webp'

    return '/step3.webp'
  }, [product.categories, categories])

  const fromPromotions = searchParams.get('promotions') === '1'
  const fromNouveautes = searchParams.get('nouveautes') === '1'
  const fromWishlist = searchParams.get('wishlist') === '1'
  const fromCategorySlug = searchParams.get('category')

  const originCategory = useMemo(() => {
    if (!fromCategorySlug) return null
    const bySlug = categories.find((c) => c.slug === fromCategorySlug)
    if (!bySlug) return null
    if (product.categories?.length && !product.categories.includes(bySlug.id)) return null
    return bySlug
  }, [categories, fromCategorySlug, product.categories])

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Accueil', href: '/' },
      { label: 'Boutique', href: '/boutique' },
    ]
    if (fromWishlist) {
      items.push({ label: 'Ma wishlist', href: '/Wishlist' })
    } else if (fromPromotions) {
      items.push({ label: 'Promotions', href: '/Promotions' })
    } else if (fromNouveautes) {
      items.push({ label: 'Nouveautes', href: '/Nouveautes' })
    } else if (originCategory) {
      items.push({ label: originCategory.name, href: `/boutique/categorie/${originCategory.slug}` })
    } else if (mainCategory) {
      items.push({
        label: mainCategory.name,
        href: mainCategory.slug ? `/boutique/categorie/${mainCategory.slug}` : '/boutique',
      })
    }
    items.push({ label: product.name })
    return items
  }, [fromWishlist, fromPromotions, fromNouveautes, originCategory, mainCategory, product.name])

  const alsoLikeProducts = useMemo(() => {
    const explicitIds = new Set(explicitRelatedProducts.map((item) => item.id))
    return relatedProducts.filter((item) => !explicitIds.has(item.id)).slice(0, 4)
  }, [explicitRelatedProducts, relatedProducts])
  const alsoLikePages = useMemo(() => {
    const pages: ProductListItem[][] = []
    for (let i = 0; i < alsoLikeProducts.length; i += 2) {
      pages.push(alsoLikeProducts.slice(i, i + 2))
    }
    return pages
  }, [alsoLikeProducts])

  useEffect(() => {
    setAlsoLikeSlide(0)
  }, [alsoLikePages.length])

  const handleAlsoLikeScroll = () => {
    const container = alsoLikeScrollRef.current
    if (!container) return
    const pageWidth = container.clientWidth
    if (!pageWidth) return
    const nextSlide = Math.round(container.scrollLeft / pageWidth)
    const boundedSlide = Math.max(0, Math.min(nextSlide, Math.max(alsoLikePages.length - 1, 0)))
    setAlsoLikeSlide(boundedSlide)
  }

  const scrollAlsoLike = (direction: 'prev' | 'next') => {
    const container = alsoLikeScrollRef.current
    if (!container || alsoLikePages.length <= 1) return
    const targetSlide =
      direction === 'prev'
        ? alsoLikeSlide === 0
          ? alsoLikePages.length - 1
          : alsoLikeSlide - 1
        : alsoLikeSlide === alsoLikePages.length - 1
          ? 0
          : alsoLikeSlide + 1
    container.scrollTo({ left: targetSlide * container.clientWidth, behavior: 'smooth' })
    setAlsoLikeSlide(targetSlide)
  }

  useEffect(() => {
    let cancelled = false
    const syncMainInCart = async () => {
      const existsInGuest = getGuestCart().some((item) => item.productId === product.id)
      let existsOnServer = false
      try {
        existsOnServer = await fetchIsInCart(product.id)
      } catch {
        existsOnServer = false
      }
      if (!cancelled) {
        setIsInCart(existsOnServer || existsInGuest)
        setIsMainCartStatusReady(true)
      }
    }

    syncMainInCart()
    const onCartUpdated = () => {
      syncMainInCart()
    }
    const onFocus = () => {
      syncMainInCart()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('cart:updated', onCartUpdated)
      window.addEventListener('focus', onFocus)
    }

    return () => {
      cancelled = true
      if (typeof window !== 'undefined') {
        window.removeEventListener('cart:updated', onCartUpdated)
        window.removeEventListener('focus', onFocus)
      }
    }
  }, [product.id])

  useEffect(() => {
    let cancelled = false

    const syncRelatedInCart = async () => {
      const explicitIds = new Set(explicitRelatedProducts.map((item) => item.id))
      const guest = new Set(
        getGuestCart()
          .map((item) => item.productId)
          .filter((id) => explicitIds.has(id))
      )
      const checks = await Promise.all(
        explicitRelatedProducts.map(async (item) => ({
          id: item.id,
          inCart: await fetchIsInCart(item.id).catch(() => false),
        }))
      )

      const merged = new Set(guest)
      checks.forEach((check) => {
        if (check.inCart) merged.add(check.id)
      })

      if (!cancelled) {
        setRelatedInCartIds(merged)
        setIsRelatedCartStatusReady(true)
      }
    }

    syncRelatedInCart()
    const onCartUpdated = () => {
      syncRelatedInCart()
    }
    const onFocus = () => {
      syncRelatedInCart()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('cart:updated', onCartUpdated)
      window.addEventListener('focus', onFocus)
    }
    return () => {
      cancelled = true
      if (typeof window !== 'undefined') {
        window.removeEventListener('cart:updated', onCartUpdated)
        window.removeEventListener('focus', onFocus)
      }
    }
  }, [explicitRelatedProducts])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const signedIn = getPb(true).authStore.isValid
      if (!signedIn) {
        if (!cancelled) setIsWishlisted(false)
        return
      }

      try {
        const inWishlist = await fetchIsInWishlist(product.id)
        if (!cancelled) setIsWishlisted(inWishlist)
      } catch {
        if (!cancelled) setIsWishlisted(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [product.id])

  const handleAddToCart = async () => {
    if (!isInStock) return

    try {
      setIsAdding(true)
      try {
        await addToCartForUser(product.id, quantity)
      } catch {
        const current = getGuestCart()
        const idx = current.findIndex((it) => it.productId === product.id)
        if (idx >= 0) {
          current[idx].quantity += quantity
        } else {
          current.push({ productId: product.id, quantity })
        }
        setGuestCart(current)
      }

      setIsInCart(true)
      setAddMessage('Article ajoute au panier.')
      window.setTimeout(() => setAddMessage(null), 2500)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart:updated'))
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleWishlistClick = async () => {
    try {
      setIsWishLoading(true)
      const inWishlist = await toggleWishlistForProduct(product.id)
      setIsWishlisted(inWishlist)
    } catch {
      const currentPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : `/produit/${product.slug}`
      router.push(`/connexion?next=${encodeURIComponent(currentPath)}`)
    } finally {
      setIsWishLoading(false)
    }
  }

  const handleAddRelatedToCart = async (relatedProductId: string) => {
    if (relatedInCartIds.has(relatedProductId)) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart:open'))
      }
      return
    }

    try {
      setIsAddingRelatedId(relatedProductId)
      try {
        await addToCartForUser(relatedProductId, 1)
      } catch {
        const current = getGuestCart()
        const idx = current.findIndex((it) => it.productId === relatedProductId)
        if (idx >= 0) {
          current[idx].quantity += 1
        } else {
          current.push({ productId: relatedProductId, quantity: 1 })
        }
        setGuestCart(current)
      }

      setRelatedInCartIds((prev) => new Set(prev).add(relatedProductId))

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart:updated'))
      }
    } finally {
      setIsAddingRelatedId(null)
    }
  }

  const handleShareClick = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : `/produit/${product.slug}`
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      }
      setShareCopied(true)
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setShareCopied(false), 1500)
      }
    } catch {
      setShareCopied(false)
    }
  }

  const globalStatusLabel = isInStock ? 'En stock' : 'Rupture de stock'
  const globalStatusWrapperClass = isInStock
    ? ' text-emerald-700'
    : ' text-destructive'
  const globalStatusDotClass = isInStock ? 'bg-emerald-600' : 'bg-red-500'

  const navOffset = hasSignupPromoBanner
    ? isDesktopViewport
      ? 116
      : 98
    : isDesktopViewport
      ? 76
      : 58

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: navOffset }}>
      <Navbar />

      <div className="mx-auto mb-0 max-w-[1400px] px-4 pt-3 lg:pt-2 ">
        <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">
          {breadcrumbItems.map((item, idx) => {
            const isLast = idx === breadcrumbItems.length - 1
            return (
              <span key={`${item.label}-${idx}`} className="inline-flex items-center">
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:underline underline-offset-2">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
                {!isLast && <span className="mx-1 text-foreground/40">/</span>}
              </span>
            )
          })}
        </p>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-0 md:py-0">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <ProductGallery images={imageUrls} productName={product.name} />
          </div>

          <div>
            <div className="mb-0 pt-2">
              <h1 className="text-xl font-extrabold tracking-tight md:text-3xl">{product.name}</h1>
            </div>

            <div className='mb-2'>
              {product.sku && (
                <div className="mb-1 flex items-center justify-between gap-4 text-sm">
                  <p className="text-muted-foreground">Reference : {product.sku}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${globalStatusWrapperClass}`}
                  >
                    <span className={`mr-1.5 h-2 w-2 rounded-full ${globalStatusDotClass}`} />
                    {globalStatusLabel}
                  </span>
                </div>
              )}
              
              <Price p={product}  />
            </div>

            {product.description && (
              <p className="line-clamp-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {explicitRelatedProducts.length > 0 && (
              <div className="pt-2">
                <h2 className="mb-1 text-base font-semibold">Vous en aurez sûrement besoin:</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 pr-1">
                  {explicitRelatedProducts.map((item) => (
                    <article
                      key={item.id}
                      className="flex min-w-[320px] max-w-[320px] gap-3 rounded-md border border-border bg-background p-1"
                    >
                      <Link
                        href={`/produit/${item.slug}`}
                        className="relative h-24 w-24 shrink-0 overflow-hidden"
                      >
                        <Image
                          src={item.imageUrls[0] ?? '/aboutimg.webp'}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/produit/${item.slug}`} className="block truncate text-sm font-semibold hover:underline">
                          {item.name}
                        </Link>
                        <p className="mt-2 mb-3 text-xs text-muted-foreground">
                          {(item.promoPrice ?? item.price).toFixed(2)} {item.currency}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAddRelatedToCart(item.id)}
                          disabled={
                            !isRelatedCartStatusReady ||
                            ((!item.inStock && !relatedInCartIds.has(item.id)) || isAddingRelatedId === item.id)
                          }
                          className=" h-8 cursor-pointer rounded-md bg-accent px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {!isRelatedCartStatusReady
                            ? 'Chargement...'
                            : relatedInCartIds.has(item.id)
                            ? 'Voir le panier'
                            : !item.inStock
                            ? 'Indisponible'
                            : isAddingRelatedId === item.id
                              ? 'Ajout...'
                              : 'Ajouter au panier'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div className="mt-2">
                {Object.keys(variants[0].variantKey ?? {}).map((key) => {
                  const values = variantValuesMap[key] ?? []
                  return (
                    <div key={key} className="mb-3">
                      <p className="mb-1 text-xs font-medium">{key}</p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => {
                          const nextVariant = {
                            ...(selectedVariant?.variantKey ?? {}),
                            [key]: value.value,
                          }
                          const keyStr = variantKeyToString(nextVariant)
                          const variantLink = variantUrlMap[keyStr] ?? `/produit/${product.slug}`
                          const isSelected = selectedVariant?.variantKey?.[key] === value.value

                          if (value.resolvedValue.type === 'image') {
                            return (
                              <Link key={value.id} href={variantLink} className="variant-button">
                                <span
                                  className={`relative block h-6 w-6 overflow-hidden rounded-full border ${
                                    isSelected ? 'ring-2 ring-accent' : ''
                                  }`}
                                >
                                  <Image
                                    src={value.resolvedValue.url ?? '/aboutimg.webp'}
                                    alt={key}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </span>
                              </Link>
                            )
                          }

                          if (value.resolvedValue.type === 'color') {
                            return (
                              <Link key={value.id} href={variantLink} className="variant-button">
                                <div
                                  style={{ backgroundColor: value.resolvedValue.value }}
                                  className={`h-6 w-6 cursor-pointer rounded-full border ${
                                    isSelected ? 'ring-2 ring-accent' : ''
                                  }`}
                                />
                              </Link>
                            )
                          }

                          return (
                            <Link key={value.id} href={variantLink} className="variant-button">
                              <button
                                type="button"
                                className={`rounded-md border px-2 py-1 text-xs font-medium ${
                                  isSelected
                                    ? 'border-accent bg-accent text-white'
                                    : 'border-border bg-background hover:bg-secondary/50'
                                }`}
                              >
                                {value.resolvedValue.value}
                              </button>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}



            {/* Actions Row */}
<div className="mt-3 space-y-3">
  {/* Row 1: Add to Cart & Quantity */}
  <div className="flex items-center gap-3">
    <div className="flex-1">
      {!isMainCartStatusReady ? (
        <button
          disabled
          className="h-12 w-full cursor-not-allowed rounded-md bg-accent font-semibold text-white opacity-70"
        >
          Chargement...
        </button>
      ) : isInCart ? (
        <button
          onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new Event('cart:open'))}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <ShoppingCart size={18} />
          Voir le panier
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={!isMainCartStatusReady || isAdding || !isInStock}
          className="h-12 w-full cursor-pointer rounded-md bg-accent font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
        >
          {isInStock ? (isAdding ? 'Ajout...' : 'Ajouter au panier') : 'Indisponible'}
        </button>
      )}
    </div>

    {/* Quantity Selector - Now part of the top row */}
    <div className="flex h-12 items-center gap-1 rounded-md border border-black/50 bg-secondary/30 p-1">
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-colors hover:bg-background disabled:opacity-30"
        disabled={!isInStock || quantity <= 1}
      >
        -
      </button>
      <span className="w-8 text-center font-bold text-sm">{quantity}</span>
      <button
        onClick={() => setQuantity(quantity + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-colors hover:bg-background disabled:opacity-30"
        disabled={!isInStock}
      >
        +
      </button>
    </div>
  </div>

  {/* Row 2: Buy Now & Icons (Aligned) */}
  <div className="flex items-center gap-3">
    <button
      className={`h-12 flex-1 rounded-md border border-black font-medium transition-colors ${
        isInStock
          ? 'cursor-pointer bg-white text-black hover:bg-accent hover:border-accent hover:text-white'
          : 'cursor-not-allowed bg-gray-200 text-gray-500 border-gray-300'
      }`}
      onClick={() => router.push(`/chekout?buyNow=1&productId=${product.id}&qty=${quantity}`)}
      disabled={!isInStock}
    >
      {isInStock ? 'Acheter maintenant' : 'Indisponible'}
    </button>

    {/* Wishlist Button */}
    <button
      type="button"
      onClick={handleWishlistClick}
      disabled={isWishLoading}
      className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/50 bg-transparent transition-all hover:bg-secondary/70 active:scale-90"
    >
      <Heart
        size={20}
        className={isWishlisted ? 'fill-accent text-accent' : 'text-foreground'}
      />
    </button>

    {/* Share Button */}
    <div className="relative">
      <button
        type="button"
        onClick={handleShareClick}
        className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-black/50 bg-transparent transition-all hover:bg-secondary/70 active:scale-90"
      >
        <Share2 size={16} />
      </button>
      {shareCopied && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-[10px] text-white">
          Lien copié
        </span>
      )}
    </div>
  </div>
</div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="space-y-2 text-center">
                <Truck size={20} className="mx-auto text-muted-foreground" />
                <p className="text-xs font-semibold">Livraison rapide</p>
              </div>
              <div className="space-y-2 text-center">
                <RotateCcw size={20} className="mx-auto text-muted-foreground" />
                <p className="text-xs font-semibold">Retours faciles</p>
              </div>
              <div className="space-y-2 text-center">
                <Shield size={20} className="mx-auto text-muted-foreground" />
                <p className="text-xs font-semibold">Paiement securise</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-2 lg:px-4 py-10">
        <div className="space-y-2">
          <div className="flex gap-2">
              {hasDetails && (
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`rounded-md px-3 py-1 text-sm font-semibold ${
                  activeTab === 'details'
                    ? 'bg-secondary text-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                Details
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`rounded-md px-3 py-1 text-sm font-semibold ${
                activeTab === 'description'
                  ? 'bg-secondary text-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              Description
            </button>
          
          </div>

          <Card className="rounded-2xl border border-border bg-background p-5">
            {activeTab === 'description' || !hasDetails ? (
              <p className="whitespace-pre-line text-sm lg:text-base text-muted-foreground">
                {product.description || 'Aucune description pour le moment.'}
              </p>
            ) : details.length > 0 ? (
              <dl className="space-y-3 text-sm text-muted-foreground">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0"
                  >
                    <dt className="min-w-[120px] font-semibold">{detail.label}</dt>
                    <dd className="flex-1 text-right">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun detail pour le moment.</p>
            )}
          </Card>

        </div>
      </div>

      {shouldRenderInstallationSteps ? <InstallationSteps step3Image={installationStep3Image} /> : null}

      {alsoLikeProducts.length > 0 && (
        <div className="mx-auto max-w-[1400px] border-t border-border px-4 py-10">
          <h2 className="mb-6 text-2xl font-bold">Vous aimerez aussi</h2>

          <div className="md:hidden">
            <div
              ref={alsoLikeScrollRef}
              onScroll={handleAlsoLikeScroll}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {alsoLikePages.map((page, pageIdx) => (
                <div
                  key={`also-like-page-${pageIdx}`}
                  className="grid w-full shrink-0 snap-start grid-cols-2 gap-3"
                >
                  {page.map((item, idx) => {
                    const productHref = `/produit/${item.slug}`
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-transparent p-2 transition hover:border-foreground/15 hover:bg-foreground/[0.02] [content-visibility:auto]"
                      >
                        <ShopProductCard
                          product={item}
                          productHref={productHref}
                          prioritizeImage={pageIdx === 0 && idx === 0}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

       
          </div>

          <div className="hidden grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-6 md:grid lg:grid-cols-3 xl:grid-cols-4">
            {alsoLikeProducts.map((item, idx) => {
              const productHref = `/produit/${item.slug}`
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-transparent p-2 transition hover:border-foreground/15 hover:bg-foreground/[0.02] [content-visibility:auto]"
                >
                  <ShopProductCard product={item} productHref={productHref} prioritizeImage={idx === 0} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}


