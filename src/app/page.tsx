import type { Metadata } from 'next'
import Link from 'next/link'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import CategorySelector from '@/components/CategorySelector'
import Reveal from '@/components/luxe/reveal'
import ShopProductCard from '@/app/shop/_components/shop-product-card'
import { getPb } from '@/lib/pb'
import type { ProductListItem } from '@/lib/services/product.service'
import HeroContent from '@/components/hero-content' 

const roomCategories = [
  {
    name: 'Lighting',
    image: '/lighting.webp',
  },
  {
    name: 'Decoration',
    image: '/decoration.webp',
  },
  {
    name: 'Suspension',
    image: '/suspension.webp',
  },
  {
    name: 'Abat-jour',
    image: '/abat-jour.webp',
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
      fields: 'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,stock',
      requestKey: null,
    })

    ordered.push(...bestSellerRes.items.map(mapRecordToHomeProduct))
  } catch {
    // Fallback when soldCount is missing or the best-seller query fails.
    try {
      const latestRes = await pb.collection('products').getList(1, HOME_PRODUCTS_LIMIT, {
        sort: '-created',
        filter: baseFilter,
        fields: 'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,stock',
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
        fields: 'id,slug,sku,name,price,promoPrice,isActive,inView,description,images,currency,categories,category,isNew,stock',
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
  const bestSellers = await getHomeBestSellerProducts()

  return (
    <div className="bg-[#f8f7f6] text-slate-900">
      <Navbar />

      <main>
        <HeroContent />
        <CategorySelector />

        <section className="mx-auto max-w-7xl px-2 py-18">
          <Reveal>
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold">Explorer nos categories</h2>
                <p className="text-slate-500">Des solutions lumineuses pensees pour chaque espace de votre maison.</p>
              </div>
              <Link href="/boutique" className="border-b-2 border-[#c19a2f]/20 pb-1 font-bold text-[#c19a2f] transition-all hover:border-[#c19a2f]">
                Explorer tous les categories
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {roomCategories.map((item) => (
              <Reveal key={item.name}>
                <Link className="group relative block aspect-square overflow-hidden rounded-xl" href="/boutique">
                  <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-xl font-bold tracking-wide text-white">{item.name}</h3>
                    <span className="text-sm font-semibold text-[#c19a2f] opacity-0 transition-opacity group-hover:opacity-100">Explorer -&gt;</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="overflow-hidden bg-[#c19a2f]/5 py-18">
          <Reveal>
            <div className="mx-auto mb-12 flex max-w-7xl items-center justify-between px-2">
              <h2 className="text-3xl font-bold">Meilleures ventes</h2>
            
            </div>
          </Reveal>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-2 md:grid-cols-2 xl:grid-cols-4">
            {bestSellers.map((product, idx) => (
              <Reveal key={product.id}>
                <div className="rounded-2xl border border-transparent p-2 transition hover:border-foreground/15 hover:bg-foreground/[0.02]">
                  <ShopProductCard
                    product={product}
                    productHref={`/produit/${product.slug}`}
                    prioritizeImage={idx < 2}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-slate-100 py-18">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-2 lg:flex-row">
            <div className="flex-1">
              <img
                alt="Artisan polissant un luminaire"
                className="rounded-2xl shadow-2xl"
                src="/aboutimg.webp"
              />
            </div>
            <div className="flex-1">
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-[#c19a2f]">Notre heritage</span>
              <h2 className="mb-8 text-4xl font-bold">Qualité & Distinction</h2>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                Depuis plus de deux decennies, Update Design met en avant un eclairage artisanal qui allie elegance intemporelle et precision moderne.
              </p>
              <p className="mb-10 text-lg leading-relaxed text-slate-600">
                Nous selectionnons des metaux durables et du verre souffle a la main pour des pieces concues pour durer.
              </p>
              <div className="grid grid-cols-3 gap-8 border-t border-[#c19a2f]/20 pt-10">
                <div>
                  <p className="mb-1 text-3xl font-bold text-[#c19a2f]">20+</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Ans d experience</p>
                </div>
                <div>
                  <p className="mb-1 text-3xl font-bold text-[#c19a2f]">150+</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Designs uniques</p>
                </div>
                <div>
                  <p className="mb-1 text-3xl font-bold text-[#c19a2f]">5k+</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Clients satisfaits</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#c19a2f] py-18 text-center text-white">
          <div className="mx-auto max-w-3xl px-2">
            <h2 className="mb-4 text-4xl font-bold">Rejoignez le cercle prive</h2>
            <p className="mb-10 text-lg text-white/80">
              Recevez en avant-premiere nos nouvelles collections, conseils deco et evenements exclusifs.
            </p>
            <form className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row">
              <input
                className="flex-1 rounded-lg border border-white/30 bg-white/20 px-2 py-4 text-white placeholder:text-white/60 focus:bg-white/30 focus:outline-none"
                placeholder="Votre adresse email"
                type="email"
              />
              <button className="rounded-lg bg-white px-10 py-4 font-extrabold uppercase tracking-widest text-[#c19a2f] transition-all hover:bg-slate-100">
                S abonner
              </button>
            </form>
            <p className="mt-6 text-[10px] uppercase tracking-widest text-white/50">Desinscription a tout moment.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
