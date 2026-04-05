'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ArrowUpDown, Check, Heart, LayoutGrid, List, SlidersHorizontal, TicketPercent, Wallet, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Navbar } from '@/components/navbar'
import ShopEmptyState from '@/components/shop/shop-empty-state'
import { Button } from '@/components/ui/button'
import { detectShopPreset, getShopPresetPath, stripPresetParams } from '@/lib/shop-presets'
import { fetchWishlistIds } from '@/lib/shop/client-api'
import type { ShopListResult } from '@/lib/services/product.service'

import ShopProductCard from './_components/shop-product-card'

const Footer = dynamic(() => import('@/components/footer'), {
  ssr: true,
  loading: () => <div className="h-32" aria-hidden="true" />,
})

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'

type SearchParams = Record<string, string | string[] | undefined>
const SIGNUP_PROMO_DISMISSED_KEY = 'signup_promo_dismissed_v1'

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

  let path = nextCategory ? `/shop/${nextCategory}` : '/shop'
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

function mergeUniqueProducts(
  current: ShopListResult['products'],
  incoming: ShopListResult['products']
) {
  if (incoming.length === 0) return current
  const seen = new Set(current.map((p) => p.id))
  const appended = incoming.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
  if (appended.length === 0) return current
  return [...current, ...appended]
}

// ─── Tiny chevron for selects ───────────────────────────────────────────────
function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1C1A14]/50"
      width="10" height="10" viewBox="0 0 12 12" fill="none"
    >
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Decorative thin gold line ───────────────────────────────────────────────
function GoldLine({ className = '' }: { className?: string }) {
  return <div className={`h-px ${className}`} style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
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
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [isCompactGrid, setIsCompactGrid] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isFetchingRef = useRef(false)
  const lastLoadAtRef = useRef(0)
  const lastScrollYRef = useRef(0)

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
    let cancelled = false

    const resolvePromoVisibility = async () => {
      const dismissedUntilRaw = window.localStorage.getItem(SIGNUP_PROMO_DISMISSED_KEY)
      const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : 0
      const isDismissed =
        !!dismissedUntilRaw && Number.isFinite(dismissedUntil) && Date.now() < dismissedUntil

      let signedIn = false
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        signedIn = response.ok
      } catch {
        signedIn = false
      }

      if (cancelled) return
      setIsSignedIn(signedIn)
      setHasSignupPromoBanner(!signedIn && !isDismissed)
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== SIGNUP_PROMO_DISMISSED_KEY) return
      void resolvePromoVisibility()
    }

    const onVisibilityChange = () => { void resolvePromoVisibility() }

    void resolvePromoVisibility()
    window.addEventListener('storage', onStorage)
    window.addEventListener('signup-promo:visibility-change', onVisibilityChange)

    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('signup-promo:visibility-change', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!isSignedIn) { setWishlistIds(new Set()); return }
    let cancelled = false
    const load = async () => {
      try {
        const ids = await fetchWishlistIds()
        if (!cancelled) setWishlistIds(new Set(ids))
      } catch {
        if (!cancelled) setWishlistIds(new Set())
      }
    }
    void load()
    return () => { cancelled = true }
  }, [isSignedIn])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobileViewport(mobile)
      if (!mobile) setIsMobileNavVisible(true)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !isMobileViewport) return
    const threshold = 8
    lastScrollYRef.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollYRef.current
      if (y <= 10) setIsMobileNavVisible(true)
      else if (delta > threshold) setIsMobileNavVisible(false)
      else if (delta < -threshold) setIsMobileNavVisible(true)
      lastScrollYRef.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobileViewport])

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
    if (isWishlistView)    return { overline: 'Ma Sélection', title: 'Wishlist',       description: 'Les pièces que vous avez sauvegardées pour plus tard.' }
    if (isPromotionsView)  return { overline: 'Offres Spéciales', title: 'Promotions', description: 'Les meilleures promotions disponibles en ce moment.' }
    if (isNouveautesView)  return { overline: 'Arrivages Récents', title: 'Nouveautés',description: 'Les dernières pièces intégrées à notre collection.' }
    return {
      overline: 'Collection · Update Design',
      title: data.activeCategory ? data.activeCategory.name : 'Boutique',
      description: data.activeCategory?.description
        ? null
        : "Explorez notre collection complète — décoration intérieure, extérieure et éclairage. Filtrez selon vos envies.",
    }
  }, [data.activeCategory, isNouveautesView, isPromotionsView, isWishlistView])

  const withinPriceRange = useCallback((price: number): boolean => {
    if (selectedPriceRange === 'all')     return true
    if (selectedPriceRange === '0-100')   return price <= 100
    if (selectedPriceRange === '100-300') return price >= 100 && price <= 300
    if (selectedPriceRange === '300-600') return price >= 300 && price <= 600
    if (selectedPriceRange === '600+')    return price >= 600
    return true
  }, [selectedPriceRange])

  const filteredProducts = useMemo(
    () =>
      products
        .filter((p) => (inStockOnly ? p.inStock : true))
        .filter((p) => withinPriceRange(getEffectivePrice(p.price, p.promoPrice))),
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
      if (!response.ok) throw new Error('Impossible de charger plus de produits.')
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
      (entries) => { for (const entry of entries) { if (entry.isIntersecting) void loadMore() } },
      { rootMargin: '300px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  function pushQuery(updates: Record<string, string | null>) {
    router.push(buildShopHref(currentQuery, updates))
  }

  const navOffsetClass = hasSignupPromoBanner ? 'pt-[100px] md:pt-[112px]' : 'pt-[60px] md:pt-[72px]'
  const stickyOffset = hasSignupPromoBanner ? 56 : 56
  const effectiveStickyOffset = isMobileViewport ? (isMobileNavVisible ? stickyOffset : 8) : stickyOffset

  // Active filter count (for mobile badge)
  const activeFilterCount = [
    currentQuery.category,
    selectedPriceRange !== 'all' ? selectedPriceRange : null,
    inStockOnly ? 'stock' : null,
    data.applied.promotions ? 'promo' : null,
  ].filter(Boolean).length

  // Top-level categories only (no parent)
  const topCategories = data.categories.filter((c) => !c.parent || (Array.isArray(c.parent) && c.parent.length === 0))

  return (
    <div className={`relative min-h-screen bg-background ${navOffsetClass}`} style={{ fontFamily: BODY }}>
      <Navbar categories={data.categories} />

      <main id="main-content">

        {/* ─── HERO ──────────────────────────────────────────────────────── */}
        <section style={{ background: '#FDFAF5', borderBottom: '1px solid rgba(196,162,62,0.12)' }}>

          {data.activeCategory ? (
            /* Category hero: full-width cover image banner */
            <div className="mx-auto max-w-[1400px] px-6 md:px-10">
              {data.activeCategory.coverImageUrl && (
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '21/6', minHeight: 220, maxHeight: 420, border: `1px solid rgba(196,162,62,0.2)` }}>
                  <Image
                    src={data.activeCategory.coverImageUrl}
                    alt={data.activeCategory.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(28,22,14,0.65) 0%, rgba(28,22,14,0.25) 60%, transparent 100%)' }} />
                  <div className="absolute inset-0 flex flex-col justify-end px-8 py-8 md:px-12 md:py-10">
                    <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C4A23E', fontWeight: 700, marginBottom: 8 }}>
                      Accueil · Collection · {data.activeCategory.name}
                    </p>
                    <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem,4.5vw,3.2rem)', fontWeight: 400, color: '#FFFDF9', lineHeight: 1.05, margin: 0, letterSpacing: '-0.01em' }}>
                      {data.activeCategory.name}
                    </h1>
                  </div>
                </div>
              )}

              <div className="py-8 md:py-10">
                {!data.activeCategory.coverImageUrl && (
                  <>
                    <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 10 }}>
                      Accueil · Collection · {data.activeCategory.name}
                    </p>
                    <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 400, color: DARK, lineHeight: 1.05, margin: 0, letterSpacing: '-0.01em' }}>
                      {data.activeCategory.name}
                    </h1>
                    <GoldLine className="mt-5 w-16" />
                  </>
                )}

                {data.activeCategory.description ? (
                  <div
                    className="mt-4 space-y-2 text-sm leading-relaxed [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-2 [&_strong]:font-semibold [&_b]:font-semibold [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1"
                    style={{ color: `${DARK}99` }}
                    dangerouslySetInnerHTML={{ __html: data.activeCategory.description }}
                  />
                ) : null}

                {data.activeCategory.features.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {data.activeCategory.features.map((feat, i) => (
                      <li key={`${feat}-${i}`} className="flex items-start gap-2.5 text-sm" style={{ color: `${DARK}99` }}>
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            /* Generic hero */
            <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-10 md:py-14">
              <div className="flex items-end justify-between gap-8">
                <div>
                  <p style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 10 }}>
                    {heroContent.overline}
                  </p>
                  <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 400, color: DARK, lineHeight: 1.0, margin: 0, letterSpacing: '-0.02em' }}>
                    {heroContent.title}
                  </h1>
                  {heroContent.description && (
                    <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: `${DARK}80` }}>
                      {heroContent.description}
                    </p>
                  )}
                </div>

                {/* Product count pill */}
                <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                  <span style={{ fontFamily: DISPLAY, fontSize: '2.5rem', fontWeight: 400, color: DARK, lineHeight: 1 }}>
                    {pagination.totalItems}
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${DARK}55` }}>
                    produits
                  </span>
                </div>
              </div>
              <GoldLine className="mt-6 w-20" />
            </div>
          )}
        </section>

        {/* ─── CATEGORY PILLS ─────────────────────────────────────────────── */}
        {!isWishlistView && !isPromotionsView && !isNouveautesView && topCategories.length > 0 && (
          <div style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EDE8' }}>
            <div className="mx-auto max-w-[1400px] px-4 md:px-10">
              <div className="flex items-center gap-2 overflow-x-auto py-3 hide-scrollbar">
                {/* "Toutes" pill */}
                <button
                  type="button"
                  onClick={() => pushQuery({ category: null, query: null })}
                  className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    fontFamily: BODY,
                    letterSpacing: '0.04em',
                    background: !currentQuery.category ? GOLD : 'transparent',
                    color: !currentQuery.category ? '#fff' : `${DARK}88`,
                    border: `1px solid ${!currentQuery.category ? GOLD : 'rgba(28,26,20,0.15)'}`,
                  }}
                >
                  Toutes
                </button>

                {topCategories.map((cat) => {
                  const isActive = currentQuery.category === cat.slug
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => pushQuery({ category: cat.slug, query: null })}
                      className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        fontFamily: BODY,
                        letterSpacing: '0.04em',
                        background: isActive ? GOLD : 'transparent',
                        color: isActive ? '#fff' : `${DARK}88`,
                        border: `1px solid ${isActive ? GOLD : 'rgba(28,26,20,0.15)'}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── FILTER BAR (sticky) ─────────────────────────────────────────── */}
        <div
          className="sticky z-20"
          style={{ top: effectiveStickyOffset, background: '#fff', borderBottom: '1px solid #F0EDE8', boxShadow: '0 1px 12px rgba(28,26,20,0.06)' }}
        >
          <div className="mx-auto max-w-[1400px] px-4 md:px-10">
            <div className="flex items-center gap-2 py-2.5">

              {/* Mobile toggle */}
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors md:hidden"
                style={{
                  fontFamily: BODY,
                  background: activeFilterCount > 0 ? GOLD : '#F5F0E8',
                  color: activeFilterCount > 0 ? '#fff' : DARK,
                  border: `1px solid ${activeFilterCount > 0 ? GOLD : '#E8E2D8'}`,
                }}
                onClick={() => setIsMobileFiltersOpen((p) => !p)}
                aria-expanded={isMobileFiltersOpen}
              >
                <SlidersHorizontal size={13} />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold" style={{ color: GOLD }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter controls — hidden on mobile unless open */}
              <div
                id="shop-filters-row"
                className={`${isMobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-wrap md:flex-nowrap items-center gap-1.5 min-w-0 flex-1`}
              >

                {/* Label (desktop only) */}
                <span
                  className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] shrink-0 mr-1"
                  style={{ color: `${DARK}55`, fontFamily: BODY }}
                >
                  <SlidersHorizontal size={12} />
                  Filtres
                </span>

                {/* Divider */}
                <div className="hidden md:block h-4 w-px bg-stone-200 mx-1 shrink-0" />

                {/* Price */}
                <div className="relative shrink-0">
                  <Wallet size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: `${DARK}60` }} />
                  <select
                    id="shop-price"
                    value={selectedPriceRange}
                    onChange={(e) => pushQuery({ priceRange: e.target.value })}
                    className="h-8 cursor-pointer appearance-none rounded-full border pl-8 pr-7 text-[11px] font-medium transition-colors focus:outline-none"
                    style={{
                      fontFamily: BODY,
                      borderColor: selectedPriceRange !== 'all' ? GOLD : '#E0D8CC',
                      color: selectedPriceRange !== 'all' ? GOLD : `${DARK}88`,
                      background: selectedPriceRange !== 'all' ? `${GOLD}14` : '#FDFAF5',
                    }}
                  >
                    <option value="all">Prix</option>
                    <option value="0-100">0 – 100 DT</option>
                    <option value="100-300">100 – 300 DT</option>
                    <option value="300-600">300 – 600 DT</option>
                    <option value="600+">600+ DT</option>
                  </select>
                  <ChevronDown />
                </div>

                {/* Divider */}
                <div className="hidden md:block h-4 w-px bg-stone-200 mx-0.5 shrink-0" />

                {/* Promotions toggle */}
                <label
                  className="inline-flex h-8 shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 text-[11px] font-medium transition-all"
                  style={{
                    fontFamily: BODY,
                    borderColor: data.applied.promotions ? GOLD : '#E0D8CC',
                    color: data.applied.promotions ? GOLD : `${DARK}80`,
                    background: data.applied.promotions ? `${GOLD}14` : '#FDFAF5',
                  }}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={data.applied.promotions}
                    onChange={(e) => pushQuery({ promotions: e.target.checked ? '1' : null })}
                  />
                  <TicketPercent size={12} />
                  Promotions
                </label>

                {/* En Stock toggle */}
                <label
                  className="inline-flex h-8 shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 text-[11px] font-medium transition-all"
                  style={{
                    fontFamily: BODY,
                    borderColor: inStockOnly ? GOLD : '#E0D8CC',
                    color: inStockOnly ? GOLD : `${DARK}80`,
                    background: inStockOnly ? `${GOLD}14` : '#FDFAF5',
                  }}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={inStockOnly}
                    onChange={(e) => pushQuery({ inStock: e.target.checked ? '1' : null })}
                  />
                  <Check size={12} />
                  En Stock
                </label>

                {/* Wishlist toggle (only if signed in) */}
                {isSignedIn && (
                  <label
                    className="inline-flex h-8 shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 text-[11px] font-medium transition-all"
                    style={{
                      fontFamily: BODY,
                      borderColor: isWishlistView ? GOLD : '#E0D8CC',
                      color: isWishlistView ? GOLD : `${DARK}80`,
                      background: isWishlistView ? `${GOLD}14` : '#FDFAF5',
                    }}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isWishlistView}
                      onChange={(e) => pushQuery({ wishlist: e.target.checked ? '1' : null })}
                    />
                    <Heart size={12} />
                    Favoris
                  </label>
                )}

                {/* Spacer */}
                <div className="hidden md:block flex-1" />

                {/* Divider */}
                <div className="hidden md:block h-4 w-px bg-stone-200 mx-0.5 shrink-0" />

                {/* Sort */}
                <div className="relative shrink-0">
                  <ArrowUpDown size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: `${DARK}60` }} />
                  <select
                    id="shop-sort"
                    value={data.applied.sort}
                    onChange={(e) => pushQuery({ sort: e.target.value })}
                    className="h-8 cursor-pointer appearance-none rounded-full border pl-8 pr-7 text-[11px] font-medium focus:outline-none transition-colors"
                    style={{
                      fontFamily: BODY,
                      borderColor: '#E0D8CC',
                      color: `${DARK}88`,
                      background: '#FDFAF5',
                    }}
                  >
                    <option value="name">Par Nom</option>
                    <option value="latest">Nouveautés</option>
                    <option value="priceAsc">Prix ↑</option>
                    <option value="priceDesc">Prix ↓</option>
                  </select>
                  <ChevronDown />
                </div>

                {/* Grid toggle (desktop) */}
                <button
                  type="button"
                  className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-full border transition-colors"
                  style={{
                    borderColor: '#E0D8CC',
                    background: '#FDFAF5',
                    color: `${DARK}70`,
                  }}
                  onClick={() => setIsCompactGrid((p) => !p)}
                  title={isCompactGrid ? 'Grille normale' : 'Grille compacte'}
                >
                  {isCompactGrid ? <LayoutGrid size={13} /> : <List size={13} />}
                </button>

              </div>

              {/* Active filter clear chips (mobile, after filter row) */}
              {isMobileFiltersOpen && activeFilterCount > 0 && (
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors md:hidden"
                  style={{ fontFamily: BODY, background: '#FEF0EE', color: '#C0392B', border: '1px solid #FACACC' }}
                  onClick={() => pushQuery({ category: null, priceRange: null, inStock: null, promotions: null, wishlist: null, sort: null })}
                >
                  <X size={11} />
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── PRODUCTS ───────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-10 md:py-8">

          {/* Result count */}
          {filteredProducts.length > 0 && (
            <p className="mb-5 text-[11px] font-medium" style={{ color: `${DARK}50`, fontFamily: BODY, letterSpacing: '0.06em' }}>
              {filteredProducts.length < pagination.totalItems
                ? `${filteredProducts.length} / ${pagination.totalItems} produits`
                : `${pagination.totalItems} produit${pagination.totalItems !== 1 ? 's' : ''}`}
            </p>
          )}

          <div className="min-h-[40vh] space-y-5">
            {filteredProducts.length === 0 ? (
              <ShopEmptyState
                title="Aucun produit trouvé"
                description="Essayez de modifier vos filtres ou votre recherche."
              />
            ) : (
              <div
                className={`grid gap-4 sm:gap-6 ${
                  isCompactGrid
                    ? 'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {filteredProducts.map((product, idx) => {
                  const productHref = originQuery
                    ? `/product/${product.slug}?${originQuery}`
                    : `/product/${product.slug}`

                  return (
                    <div
                      key={product.id}
                      className="rounded-xl border border-transparent p-2 transition hover:border-foreground/10 hover:bg-foreground/[0.02] [content-visibility:auto]"
                    >
                      <ShopProductCard
                        product={product}
                        productHref={productHref}
                        prioritizeImage={idx < 4}
                        enableWishlist={isSignedIn}
                        initialWishlisted={wishlistIds.has(product.id)}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {loadMoreError && (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span>{loadMoreError}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => void loadMore()}>
                  Réessayer
                </Button>
              </div>
            )}

            {isFetchingMore && (
              <div className="flex items-center justify-center py-6">
                <div
                  className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200"
                  style={{ borderTopColor: GOLD }}
                  role="status"
                  aria-live="polite"
                >
                  <span className="sr-only">Chargement...</span>
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
