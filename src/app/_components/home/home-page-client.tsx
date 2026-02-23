'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import CategorySection from './category-section'
import HeroSection from './hero-section'
import NewsletterSection from './newsletter-section'
import ProductCard from './product-card'
import SiteFooter from './site-footer'
import type { HomeProduct, HomeProductsResponse } from './types'

const CATEGORY_REGEX = /^[a-z0-9-]{1,40}$/

const CATEGORY_ITEMS = [
  {
    id: 'lighting',
    name: 'Luminaires',
    href: '/boutique?category=lighting',
    image: '/designer-pendant-lights.jpg',
    description: 'Suspensions, lampadaires et appliques.',
  },
  {
    id: 'decor',
    name: 'Decoration',
    href: '/boutique?category=decor',
    image: '/luxury-home-decor-pieces.jpg',
    description: 'Objets design et textures elegantes.',
  },
  {
    id: 'furniture',
    name: 'Mobilier',
    href: '/boutique?category=furniture',
    image: '/contemporary-living-space-pendant-lights.jpg',
    description: 'Pieces signature pour chaque piece.',
  },
]

const FALLBACK_PRODUCTS: HomeProduct[] = [
  {
    id: 'placeholder-1',
    slug: 'modern-arc-floor-lamp',
    name: 'Lampe Arc Minimaliste',
    price: 420,
    promoPrice: 360,
    currency: 'DT',
    imageUrl: '/modern-arc-lamp-minimalist.jpg',
    shortDescription: 'Lampadaire en metal brosse, eclairage doux et diffus.',
    category: 'Lighting',
    inStock: true,
  },
  {
    id: 'placeholder-2',
    slug: 'gold-pendant-light',
    name: 'Suspension Dorée Orbit',
    price: 540,
    promoPrice: null,
    currency: 'DT',
    imageUrl: '/gold-pendant-light-modern.jpg',
    shortDescription: 'Suspension contemporaine pour salle a manger.',
    category: 'Lighting',
    inStock: true,
  },
  {
    id: 'placeholder-3',
    slug: 'ornate-crystal-chandelier',
    name: 'Lustre Cristal Signature',
    price: 980,
    promoPrice: 899,
    currency: 'DT',
    imageUrl: '/crystal-chandelier-luxury.jpg',
    shortDescription: 'Lustre premium pour hall et sejour haut de gamme.',
    category: 'Lighting',
    inStock: true,
  },
  {
    id: 'placeholder-4',
    slug: 'sculptural-floor-lamp',
    name: 'Lampadaire Sculptural',
    price: 610,
    promoPrice: null,
    currency: 'DT',
    imageUrl: '/designer-sculptural-floor-lamp.jpg',
    shortDescription: 'Silhouette organique et ambiance chaleureuse.',
    category: 'Lighting',
    inStock: false,
  },
]

function sanitizeCategory(input: string) {
  const normalized = input.trim().toLowerCase()
  return CATEGORY_REGEX.test(normalized) ? normalized : 'lighting'
}

export default function HomePageClient() {
  const [products, setProducts] = useState<HomeProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const category = sanitizeCategory('lighting')

    async function loadProducts() {
      try {
        setIsLoading(true)
        setError('')
        const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`, {
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Impossible de charger les produits.')
        }

        const data = (await response.json()) as HomeProductsResponse
        setProducts(Array.isArray(data.products) && data.products.length > 0 ? data.products : FALLBACK_PRODUCTS)
      } catch {
        if (!controller.signal.aborted) {
          setProducts(FALLBACK_PRODUCTS)
          setError('Affichage d un catalogue temporaire.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()
    return () => controller.abort()
  }, [])

  const featuredProducts = useMemo(() => products.slice(0, 8), [products])

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />

      <section aria-labelledby="featured-products-heading" className="mx-auto max-w-[1280px] px-4 py-12 md:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="featured-products-heading" className="font-serif text-3xl font-semibold tracking-tight">
              Produits en vedette
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Selection du jour pour l interieur et l eclairage.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/boutique">Voir tout</Link>
          </Button>
        </div>

        {error && <p className="mb-4 text-sm text-foreground/70">{error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-[360px] animate-pulse rounded-2xl border border-foreground/10 bg-foreground/[0.04]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <CategorySection items={CATEGORY_ITEMS} />
      <NewsletterSection />
      <SiteFooter />
    </main>
  )
}
