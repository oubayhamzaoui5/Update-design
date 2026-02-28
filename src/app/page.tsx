import type { Metadata } from 'next'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import HeroContent from '@/components/hero-content'
import HomeBestSellersSection from '@/components/home/home-best-sellers-section'
import HomeCategoriesSection from '@/components/home/home-categories-section'
import HomeContactSection from '@/components/home/home-contact-section'
import HomeFaqSection from '@/components/home/home-faq-section'
import HomeHeritageSection from '@/components/home/home-heritage-section'
import HomeLatestBlogsSection from '@/components/home/home-latest-blogs-section'
import HomeMarblePanelSection from '@/components/home/home-marble-panel-section'
import HomeMapSection from '@/components/home/home-map-section'
import HomeWoodProfileSection from '@/components/home/home-wood-profile-section'
import { getPb } from '@/lib/pb'
import { getAllPublishedPosts } from '@/lib/services/posts.service'
import type { ProductListItem } from '@/lib/services/product.service'

const roomCategories = [
  {
    name: 'PROFILE MURAL D\u00c9CORATIF',
    image: '/c2.webp',
    href: '/boutique/categorie/effet-bois-d-interieur',
    spanTwoColumns: true,
  },
  {
    name: 'PANNEAU MURAL EN PVC',
    image: '/c1.webp',
    href: '/boutique/categorie/effet-marbre',
    spanTwoColumns: true,
  },
  {
    name: 'Lighting',
    image: '/lighting.webp',
    href: '/boutique/categorie/lighting',
  },
  {
    name: 'Decoration',
    image: '/decoration.webp',
    href: '/boutique/categorie/decoration',
  },
  {
    name: 'Suspension',
    image: '/suspension.webp',
    href: '/boutique/categorie/suspension',
  },
  {
    name: 'Abat-jour',
    image: '/abat-jour.webp',
    href: '/boutique/categorie/abat-jour',
  },
]

const HOME_PRODUCTS_LIMIT = 8

function getPbBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PB_URL ?? process.env.POCKETBASE_URL ?? 'http://127.0.0.1:8090'
}

function mapRecordToHomeProduct(record: any): ProductListItem {
  const images = Array.isArray(record.images) ? record.images : []
  const imageUrls = images.map(
    (filename: string) =>
      `${getPbBaseUrl()}/api/files/products/${record.id}/${encodeURIComponent(filename)}`
  )

  return {
    id: String(record.id ?? ''),
    slug: String(record.slug ?? ''),
    sku: String(record.sku ?? ''),
    name: String(record.name ?? ''),
    price: Number(record.price ?? 0),
    promoPrice: record.promoPrice == null ? null : Number(record.promoPrice),
    isActive: Boolean(record.isActive),
    inView: record.inView === undefined || record.inView === null ? true : Boolean(record.inView),
    description: String(record.description ?? ''),
    images,
    imageUrls,
    currency: String(record.currency ?? 'DT'),
    categories: Array.isArray(record.categories)
      ? record.categories.map(String)
      : record.category
        ? [String(record.category)]
        : [],
    isNew: Boolean(record.isNew),
    isVariant: Boolean(record.isVariant),
    isParent: Boolean(record.isParent),
    variantKey:
      record.variantKey && typeof record.variantKey === 'object'
        ? (record.variantKey as Record<string, string>)
        : {},
    stock: Number(record.stock ?? 0),
    inStock: Number(record.stock ?? 0) > 0,
  }
}

async function getHomeBestSellerProducts(): Promise<ProductListItem[]> {
  const ordered: ProductListItem[] = []
  const pb = getPb()
  const baseFilter = 'isActive=true && (inView=true || inView=null) && stock > 0'

  try {
    const bestSellerRes = await pb.collection('products').getList(1, HOME_PRODUCTS_LIMIT, {
      sort: '-soldCount,-created',
      filter: baseFilter,
      fields: 'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isVariant,stock',
      requestKey: null,
    })

    ordered.push(...bestSellerRes.items.map(mapRecordToHomeProduct))
  } catch {
    // Fallback when soldCount is missing or the best-seller query fails.
    try {
      const latestRes = await pb.collection('products').getList(1, HOME_PRODUCTS_LIMIT, {
        sort: '-created',
        filter: baseFilter,
        fields: 'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isVariant,stock',
        requestKey: null,
      })
      ordered.push(...latestRes.items.map(mapRecordToHomeProduct))
    } catch {
      // keep rendering home even if PB is unavailable
    }
  }

  if (ordered.length < HOME_PRODUCTS_LIMIT) {
    try {
      const existingIds = new Set(ordered.map((item) => item.id))
      const fillRes = await pb.collection('products').getList(1, 48, {
        sort: '-created',
        filter: baseFilter,
        fields: 'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,isVariant,stock',
        requestKey: null,
      })

      for (const raw of fillRes.items) {
        const mapped = mapRecordToHomeProduct(raw)
        if (existingIds.has(mapped.id)) continue
        ordered.push(mapped)
        existingIds.add(mapped.id)
        if (ordered.length === HOME_PRODUCTS_LIMIT) break
      }
    } catch {
      // ignore and continue to placeholders if still needed
    }
  }

  return ordered.slice(0, HOME_PRODUCTS_LIMIT)
}

export const metadata: Metadata = {
  title: 'Update Deisgn',
  description: 'Collection premium de luminaires et creations artisanales pour interieurs modernes.',
}

export default async function HomePage() {
  const [bestSellers, posts] = await Promise.all([
    getHomeBestSellerProducts(),
    getAllPublishedPosts(),
  ])
  const latestPosts = posts.slice(0, 6)

  return (
    <div className="bg-white text-slate-900">
      <Navbar />

      <main>
        <HeroContent />
        <HomeCategoriesSection categories={roomCategories} />
        <HomeHeritageSection />
        <HomeMarblePanelSection />
        <HomeWoodProfileSection />

        <HomeBestSellersSection products={bestSellers} />
                <HomeContactSection />

        <HomeFaqSection />
        <HomeLatestBlogsSection posts={latestPosts} />
        <HomeMapSection />
      </main>

      <Footer />
    </div>
  )
}
