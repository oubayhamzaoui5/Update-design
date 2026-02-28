'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, RotateCcw, Share2, Shield, ShoppingCart, Truck } from 'lucide-react'

import Button from '@/components/admin/button'
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
      <div className="flex items-baseline gap-3">
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
  const [addMessage, setAddMessage] = useState<string | null>(null)
  const [isWishLoading, setIsWishLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('details')
  const [hasSignupPromoBanner, setHasSignupPromoBanner] = useState(false)

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
    const dismissedUntilRaw = window.localStorage.getItem(SIGNUP_PROMO_DISMISSED_KEY)
    const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : 0
    const isDismissed =
      !!dismissedUntilRaw && Number.isFinite(dismissedUntil) && Date.now() < dismissedUntil
    const isLoggedIn = getPb(true).authStore.isValid
    setHasSignupPromoBanner(!isLoggedIn && !isDismissed)
  }, [])

  const mainCategory = useMemo(() => {
    if (!product.categories || product.categories.length === 0) return null
    return categories.find((c) => c.id === product.categories?.[0]) ?? null
  }, [categories, product.categories])

  const shouldRenderInstallationSteps = useMemo(
    () => hasInstallationStepsCategory(product, categories),
    [product, categories]
  )

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

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const signedIn = getPb(true).authStore.isValid
      if (!signedIn) {
        if (!cancelled) {
          const exists = getGuestCart().some((item) => item.productId === product.id)
          setIsInCart(exists)
        }
        return
      }

      try {
        const inCart = await fetchIsInCart(product.id)
        if (!cancelled && inCart) {
          setIsInCart(true)
          return
        }
      } catch {
        // ignore and fallback to local cart
      }

      if (!cancelled) {
        const exists = getGuestCart().some((item) => item.productId === product.id)
        if (exists) setIsInCart(true)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [product.id])

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
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-destructive/10 text-destructive'
  const globalStatusDotClass = isInStock ? 'bg-emerald-600' : 'bg-red-500'

  const navOffset = hasSignupPromoBanner ? 136 : 76

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: navOffset }}>
      <Navbar />

      <div className="mx-auto mb-0 max-w-7xl px-4 py-4">
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

      <div className="mx-auto max-w-7xl px-4 py-0 md:py-0">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <ProductGallery images={imageUrls} productName={product.name} />
          </div>

          <div className="space-y-3">
            <div className="mb-2 space-y-4 py-2">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{product.name}</h1>
            </div>

            <div>
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
              <Price p={product} />
            </div>

            {product.description && (
              <p className="line-clamp-4 leading-relaxed text-muted-foreground">{product.description}</p>
            )}

            {variants.length > 0 && (
              <div className="mt-4">
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

            <div className="mb-2 space-y-3">
              <label className="text-sm font-semibold">Quantite</label>
              <div className="flex w-fit items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 rounded-lg border border-border transition-smooth hover:bg-secondary"
                  disabled={!isInStock}
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 rounded-lg border border-border transition-smooth hover:bg-secondary"
                  disabled={!isInStock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {isInCart ? (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('cart:open'))
                    }
                  }}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-foreground font-medium text-white transition-opacity hover:opacity-80"
                >
                  <ShoppingCart size={20} />
                  Voir le panier
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || !isInStock}
                  className="h-12 w-full cursor-pointer rounded-md bg-accent font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isInStock ? (isAdding ? 'Ajout en cours...' : 'Ajouter au panier') : 'Indisponible'}
                </button>
              )}

              {addMessage && <p className="text-sm text-emerald-600">{addMessage}</p>}

              <div className="flex gap-3">
                <button
                  className={`h-12 flex-1 rounded-md border font-medium transition-colors ${
                    isInStock
                      ? 'cursor-pointer bg-white text-black hover:bg-accent hover:text-white'
                      : 'cursor-not-allowed bg-gray-200 text-gray-500'
                  }`}
                  onClick={() => router.push(`/chekout?buyNow=1&productId=${product.id}&qty=${quantity}`)}
                  disabled={!isInStock}
                >
                  {isInStock ? 'Acheter maintenant' : 'Indisponible'}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={handleWishlistClick}
                    disabled={isWishLoading}
                    className="grid h-12 w-12 cursor-pointer place-items-center rounded-md bg-transparent transition-all duration-150 hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart
                      size={20}
                      className={isWishlisted ? 'fill-accent text-accent' : 'text-foreground'}
                      fill={isWishlisted ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="relative">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex h-12 w-12 cursor-pointer items-center justify-center bg-transparent transition-all duration-150 hover:bg-secondary/70"
                    onClick={handleShareClick}
                  >
                    <Share2 size={20} />
                  </Button>

                  <span
                    className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-black shadow-md transition-all duration-200 ${
                      shareCopied ? 'opacity-100 -translate-y-1' : 'translate-y-1 opacity-0'
                    }`}
                  >
                    Lien copie
                  </span>
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

      <div className="mx-auto max-w-7xl px-4 py-10">
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
              <p className="text-muted-foreground">{product.description || 'Aucune description pour le moment.'}</p>
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

      {shouldRenderInstallationSteps ? <InstallationSteps /> : null}

      {relatedProducts.length > 0 && (
        <div className="mx-auto max-w-7xl border-t border-border px-4 py-10">
          <h2 className="mb-6 text-2xl font-bold">Vous pourriez aussi aimer</h2>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((item, idx) => {
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


