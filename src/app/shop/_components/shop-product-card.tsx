'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import type { ProductListItem } from '@/lib/services/product.service'

export default function ShopProductCard({
  product,
  productHref,
  prioritizeImage,
}: {
  product: ProductListItem
  productHref: string
  prioritizeImage: boolean
}) {
  const imageSrc = product.imageUrls[0] ?? '/aboutimg.webp'
  const hoverImageSrc = product.imageUrls[1] ?? null
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hoverImageLoaded, setHoverImageLoaded] = useState(false)

  const hasPromo =
    product.promoPrice != null && product.promoPrice > 0 && product.promoPrice < product.price
  const inStock = product.inStock ?? true

  return (
    <article className="group">
      <Link href={productHref} prefetch={false}>
        <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-secondary transition-smooth">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-foreground/10" aria-hidden="true" />
          )}

          <Image
            src={imageSrc}
            alt={product.name}
            fill
            priority={prioritizeImage}
            loading={prioritizeImage ? 'eager' : 'lazy'}
            fetchPriority={prioritizeImage ? 'high' : 'auto'}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 50vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className={`object-cover transition duration-300 group-hover:scale-[1.02] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${
              hoverImageSrc && hoverImageLoaded ? 'group-hover:opacity-0' : ''
            }`}
          />

          {hoverImageSrc && (
            <Image
              src={hoverImageSrc}
              alt={`${product.name} - vue 2`}
              fill
              loading="lazy"
              fetchPriority="auto"
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 50vw"
              onLoad={() => setHoverImageLoaded(true)}
              onError={() => setHoverImageLoaded(false)}
              className={`object-cover transition duration-300 group-hover:scale-[1.02] ${
                hoverImageLoaded ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
              }`}
            />
          )}

          <div className="absolute left-4 top-4 z-10 flex gap-2">
            {product.isNew && (
              <div className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                New
              </div>
            )}
            {hasPromo && (
              <div className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white">
                Promo
              </div>
            )}
          </div>

          {!inStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25">
              <span className="text-sm font-semibold text-white">Rupture de stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-2">
        <h3 className="line-clamp-1 text-sm font-semibold">
          <Link href={productHref} prefetch={false} className="transition-colors hover:text-accent">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="line-clamp-1">{product.sku ? `Reference : ${product.sku}` : '\u00A0'}</span>
          <span className={`font-semibold ${inStock ? 'text-emerald-600' : 'text-red-600'}`}>
            {inStock ? 'En stock' : 'Rupture de stock'}
          </span>
        </div>

        {product.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-accent">
            {hasPromo ? product.promoPrice!.toFixed(2) : product.price.toFixed(2)} {product.currency}
          </span>

          {hasPromo && (
            <span className="text-xs text-red-600 line-through">
              {product.price.toFixed(2)} {product.currency}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
