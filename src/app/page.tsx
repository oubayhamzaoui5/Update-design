import type { Metadata } from 'next'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import LandingHero from '@/components/landing/landing-hero'
import LandingStats from '@/components/landing/landing-stats'
import LandingCategories from '@/components/landing/landing-categories'
import LandingAbout from '@/components/landing/landing-about'
import LandingBestSellers from '@/components/landing/landing-best-sellers'
import LandingTestimonials from '@/components/landing/landing-testimonials'
import LandingBlog from '@/components/landing/landing-blog'
import { getAllPublishedPosts } from '@/lib/services/posts.service'
import { getBestSellers } from '@/lib/bestSellers'
import { getShopCategories } from '@/lib/services/product.service'
import LandingFaq from '@/components/landing/landing-faq'
import LandingContact from '@/components/landing/landing-contact'
import LandingMap from '@/components/landing/landing-map'
import { getHomepageContent } from '@/lib/services/site-content.service'
import LandingStoreBrasSection from '@/components/landing/landing-store-bras-section'
import LandingParasolSection from '@/components/landing/landing-parasol-section'

export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => resolve(fallback), timeoutMs)
      }),
    ])
  } catch {
    return fallback
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export const metadata: Metadata = {
  title: 'Update Design | Fournisseur Décoration en Gros — Tunisie',
  description:
    'Update Design : fournisseur de matériaux de décoration pour hôtels, promoteurs immobiliers, architectes et revendeurs en Tunisie. Panneaux muraux, gazon artificiel, parasols, néons LED — tarifs volume, stock disponible, livraison nationale.',
  keywords: [
    'décoration en gros tunisie',
    'fournisseur décoration tunisie',
    'achat volume décoration',
    'panneau mural effet marbre gros',
    'gazon artificiel en gros tunisie',
    'parasols hôtel tunisie',
    'néon LED tunisie gros',
    'matériaux décoration promoteur',
    'update design tunisie',
    'revendeur décoration tunisie',
    'architecte décoration tunisie',
    'hotel décoration tunisie',
  ],
  openGraph: {
    title: 'Update Design — Fournisseur Décoration en Gros, Tunisie.',
    description:
      'Hôtels, promoteurs, architectes, revendeurs — tarifs volume, 1000+ références, livraison nationale en 72h.',
    url: siteUrl,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Update Design — Fournisseur Décoration en Gros, Tunisie.',
    description:
      'Hôtels, promoteurs, architectes, revendeurs — tarifs volume, 1000+ références, livraison nationale en 72h.',
  },
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  const [posts, bestSellers, shopCategories] = await Promise.all([
    withTimeout(getAllPublishedPosts(), 8_000, []),
    withTimeout(getBestSellers(), 8_000, []),
    withTimeout(getShopCategories(), 8_000, []),
  ])

  const content = getHomepageContent()

  return (
    <div>
      <Navbar reserveSpace />
      <main>
        <LandingHero content={content.hero} />
        <LandingStats stats={content.stats} />
        <LandingCategories categories={shopCategories} />
        <LandingAbout content={content.about} />
        <div style={{ height: 64 }} />
        <LandingStoreBrasSection />
        <div style={{ height: 64 }} />
        <LandingParasolSection />
        <LandingBestSellers products={bestSellers} />
        <LandingTestimonials />
        <LandingBlog posts={posts} />
        <LandingFaq faq={content.faq} />
        <LandingContact contact={content.contact} />
        <LandingMap />
      </main>
      <Footer />
    </div>
  )
}
