'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import EmptyState from '@/components/admin/empty-state'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { getPb } from '@/lib/pb'
import { detectShopPreset, getShopPresetPath, stripPresetParams } from '@/lib/shop-presets'
import type { ShopListResult } from '@/lib/services/product.service'

import ShopProductCard from './_components/shop-product-card'

const Footer = dynamic(() => import('@/components/footer'), {
  ssr: true,
  loading: () => <div className="h-32" aria-hidden="true" />,
})

type SearchParams = Record<string, string | string[] | undefined>
const SIGNUP_PROMO_DISMISSED_KEY = 'signup_promo_dismissed_v1'

function ChevronDownIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 transition-transform group-hover:text-foreground/60"
      width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function normalizeSearchParams(searchParams: SearchParams): Record<string, string> {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      if (value[0]) normalized[key] = value[0]
    } else if (typeof value === 'string') {
      normalized[key] = value
    }
  }
  return normalized
}

function buildShopHref(
  current: Record<string, string>,
  updates: Record<string, string | null>
): string {
  const next = new URLSearchParams(current)
  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
  }

  const nextCategory = next.get('category')
  if (nextCategory) next.delete('category')

  let path = nextCategory ? `/boutique/categorie/${nextCategory}` : '/boutique'
  let finalQuery = next

  if (!nextCategory) {
    const preset = detectShopPreset(Object.fromEntries(next.entries()))
    if (preset) {
      path = getShopPresetPath(preset)
      finalQuery = stripPresetParams(next, preset)
    }
  }

  const nextQuery = finalQuery.toString()
  return nextQuery ? `${path}?${nextQuery}` : path
}

function getEffectivePrice(price: number, promoPrice: number | null): number {
  if (promoPrice != null && promoPrice > 0 && promoPrice < price) return promoPrice
  return price
}

function mergeUniqueProducts(current: ShopListResult['products'], incoming: ShopListResult['products']) {
  if (incoming.length === 0) return current
  const seen = new Set(current.map((product) => product.id))
  const appended = incoming.filter((product) => {
    if (seen.has(product.id)) return false
    seen.add(product.id)
    return true
  })
  if (appended.length === 0) return current
  return [...current, ...appended]
}

export default function ShopClient({
  data,
  searchParams = {},
}: {
  data: ShopListResult
  searchParams?: SearchParams
}) {
  const router = useRouter()
  const currentQuery = normalizeSearchParams(searchParams)
  const [products, setProducts] = useState<ShopListResult['products']>(data.products)
  const [pagination, setPagination] = useState(data.pagination)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [hasSignupPromoBanner, setHasSignupPromoBanner] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isFetchingRef = useRef(false)
  const lastLoadAtRef = useRef(0)

  if (data.activeCategory && !currentQuery.category) {
    currentQuery.category = data.activeCategory.slug
  }

  useEffect(() => {
    setProducts(data.products)
    setPagination(data.pagination)
    setIsFetchingMore(false)
    setLoadMoreError(null)
    isFetchingRef.current = false
    lastLoadAtRef.current = 0
  }, [data])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = window.localStorage.getItem(SIGNUP_PROMO_DISMISSED_KEY) === '1'
    const isLoggedIn = getPb(true).authStore.isValid
    setHasSignupPromoBanner(!isLoggedIn && !dismissed)
  }, [])

  const originQuery = useMemo(() => {
    const params = new URLSearchParams(currentQuery)
    params.delete('page')
    return params.toString()
  }, [currentQuery])

  const inStockOnly = currentQuery.inStock === '1'
  const selectedPriceRange = currentQuery.priceRange ?? 'all'
  const isWishlistView = currentQuery.wishlist === '1'
  const isPromotionsView = currentQuery.promotions === '1'
  const isNouveautesView = currentQuery.sort === 'latest' || currentQuery.nouveautes === '1'

  const heroContent = useMemo(() => {
    if (isWishlistView) {
      return {
        title: 'Wishlist',
        description: "Retrouvez les produits que vous avez enregistres dans votre wishlist.",
      }
    }

    if (isPromotionsView) {
      return {
        title: 'Promotions',
        description: 'Profitez des meilleures promotions disponibles en ce moment.',
      }
    }

    if (isNouveautesView) {
      return {
        title: 'Nouveautes',
        description: 'Decouvrez les derniers produits ajoutes a notre boutique.',
      }
    }

    return {
      title: 'Boutique',
      description:
        "Explorez l'integralite de notre collection, un espace ou le design rencontre la fonctionnalite. " +
        "Que vous cherchiez l'inspiration ou une piece specifique, profitez d'une experience de navigation " +
        'fluide pour filtrer nos creations selon vos criteres les plus exigeants.',
    }
  }, [isNouveautesView, isPromotionsView, isWishlistView])

  const withinPriceRange = useCallback((price: number): boolean => {
    if (selectedPriceRange === 'all') return true
    if (selectedPriceRange === '0-100') return price <= 100
    if (selectedPriceRange === '100-300') return price >= 100 && price <= 300
    if (selectedPriceRange === '300-600') return price >= 300 && price <= 600
    if (selectedPriceRange === '600+') return price >= 600
    return true
  }, [selectedPriceRange])

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => (inStockOnly ? product.inStock : true))
        .filter((product) => withinPriceRange(getEffectivePrice(product.price, product.promoPrice))),
    [inStockOnly, products, withinPriceRange]
  )

  const loadMore = useCallback(async () => {
    const now = Date.now()
    if (isFetchingRef.current || !pagination.hasNextPage) return
    if (now - lastLoadAtRef.current < 300) return

    lastLoadAtRef.current = now
    isFetchingRef.current = true

    setIsFetchingMore(true)
    setLoadMoreError(null)

    try {
      const nextPage = pagination.page + 1
      const params = new URLSearchParams(currentQuery)
      params.set('page', String(nextPage))
      params.set('perPage', String(pagination.perPage))

      const response = await fetch(`/api/shop/products?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Impossible de charger plus de produits.')
      }

      const nextData = (await response.json()) as ShopListResult
      setProducts((prev) => mergeUniqueProducts(prev, nextData.products))
      setPagination(nextData.pagination)
    } catch {
      setLoadMoreError('Echec du chargement des produits suivants.')
    } finally {
      isFetchingRef.current = false
      setIsFetchingMore(false)
    }
  }, [currentQuery, pagination])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void loadMore()
          }
        }
      },
      {
        rootMargin: '300px 0px',
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  function pushQuery(updates: Record<string, string | null>) {
    router.push(buildShopHref(currentQuery, updates))
  }

  const navOffset = hasSignupPromoBanner ? 96 : 56
  const stickyOffset = hasSignupPromoBanner ? 96 : 56

  return (
    <div className="relative min-h-screen bg-background" style={{ paddingTop: navOffset }}>
      <Navbar categories={data.categories} />

      <main id="main-content">
        <section className="relative overflow-hidden bg-gradient-to-b from-accent/[0.2] to-transparent py-10 md:py-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-14 top-8 h-44 w-44 rounded-full bg-foreground/5 blur-3xl" />
            <div className="absolute right-0 top-16 h-52 w-52 rounded-full bg-foreground/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-[1400px] px-4">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              {data.activeCategory?.name ?? heroContent.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground/70">
              {data.activeCategory?.description ?? heroContent.description}
            </p>
          </div>
        </section>

<div className="sticky z-20 px-8 py-6" style={{ top: stickyOffset }}> 
  <div className="mx-auto w-fit rounded-xl border border-border/40 bg-background/95 p-1.5 shadow-sm backdrop-blur-xl md:rounded-full">
    <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
      
      {/* Category Select - Compact h-10 */}
      <div className="group relative">
        <select
          id="shop-category"
          value={currentQuery.category ?? ''}
          onChange={(event) =>
            pushQuery({ category: event.target.value || null, query: null })
          }
          className={`h-10 cursor-pointer appearance-none rounded-lg md:rounded-full border px-4 pr-9 text-sm font-medium transition-all focus:outline-none ${
            currentQuery.category 
              ? 'border-accent/50 bg-accent/5 text-accent' 
              : 'border-transparent bg-secondary/40 text-foreground/80 hover:bg-secondary/60'
          }`}
        >
          <option value="">Tous les Catégories</option>
          {data.categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon />
      </div>

      {/* Price Select */}
      <div className="group relative">
        <select
          id="shop-price"
          value={selectedPriceRange}
          onChange={(event) => pushQuery({ priceRange: event.target.value })}
          className={`h-10 cursor-pointer appearance-none rounded-lg md:rounded-full border px-4 pr-9 text-sm font-medium transition-all focus:outline-none ${
            selectedPriceRange !== 'all'
              ? 'border-accent/50 bg-accent/5 text-accent'
              : 'border-transparent bg-secondary/40 text-foreground/80 hover:bg-secondary/60'
          }`}
        >
          <option value="all">Prix</option>
          <option value="0-100">0-100 DT</option>
          <option value="100-300">100-300 DT</option>
          <option value="300-600">300-600 DT</option>
          <option value="600+">600+ DT</option>
        </select>
        <ChevronDownIcon />
      </div>

      <div className="mx-0.5 hidden h-5 w-px bg-border/40 md:block" />

      {/* Checkboxes - Solid Accent when active */}
      {[
        { id: 'promotions', label: 'Promotions', checked: data.applied.promotions, key: 'promotions' },
        { id: 'inStock', label: 'En Stock', checked: inStockOnly, key: 'inStock' },
      ].map((item) => (
        <label
          key={item.id}
          className={`flex h-10 cursor-pointer select-none items-center gap-2 rounded-lg md:rounded-full border px-4 text-sm font-medium transition-all ${
            item.checked
              ? 'border-accent bg-accent text-white'
              : 'border-transparent bg-secondary/40 text-foreground/70 hover:bg-secondary/60'
          }`}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={item.checked}
            onChange={(event) => pushQuery({ [item.key]: event.target.checked ? '1' : null })}
          />
          {item.label}
        </label>
      ))}

      <div className="mx-0.5 hidden h-5 w-px bg-border/40 md:block" />

      {/* Sort Select */}
      <div className="group relative">
        <select
          id="shop-sort"
          value={data.applied.sort}
          onChange={(event) => pushQuery({ sort: event.target.value })}
          className="h-10 cursor-pointer appearance-none rounded-lg md:rounded-full border border-transparent bg-secondary/40 px-4 pr-9 text-sm font-medium text-foreground/80 transition-all hover:bg-secondary/60 focus:outline-none"
        >
          <option value="name">Trier par Nom</option>
          <option value="latest">Nouveautés</option>
          <option value="priceAsc">Trier par Prix ↑</option>
          <option value="priceDesc">Trier par Prix ↓</option>
        </select>
        <ChevronDownIcon />
      </div>
    </div>
  </div>
</div>

        <div className="mx-auto max-w-[1400px] px-4 py-2 ">
          <div className="space-y-5">
            {filteredProducts.length === 0 ? (
              <EmptyState
                title="Aucun produit trouve"
                description="Essayez de modifier vos filtres ou votre recherche."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, idx) => {
                  const productHref = originQuery
                    ? `/produit/${product.slug}?${originQuery}`
                    : `/produit/${product.slug}`

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-transparent p-2 transition hover:border-foreground/15 hover:bg-foreground/[0.02] [content-visibility:auto]"
                    >
                      <ShopProductCard product={product} productHref={productHref} prioritizeImage={idx === 0} />
                    </div>
                  )
                })}
              </div>
            )}

            {loadMoreError && (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span>{loadMoreError}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => void loadMore()}>
                  Reessayer
                </Button>
              </div>
            )}

            {isFetchingMore && (
              <div className="flex items-center justify-center py-2">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-2 border-accent/25 border-t-accent"
                  role="status"
                  aria-live="polite"
                >
                  <span className="sr-only">Chargement de plus de produits...</span>
                </div>
              </div>
            )}

            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


