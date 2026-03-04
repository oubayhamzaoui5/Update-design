import type { Metadata } from 'next'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import HomeBestSellersSection from '@/components/home/home-best-sellers-section'
import HomeCategoriesSection from '@/components/home/home-categories-section'
import HomeFaqSection from '@/components/home/home-faq-section'
import HomeHeritageSection from '@/components/home/home-heritage-section'
import HomeLatestBlogsSection from '@/components/home/home-latest-blogs-section'
import HomeMarblePanelSection from '@/components/home/home-marble-panel-section'
import HomeMapSection from '@/components/home/home-map-section'
import HomeWhyChooseSection from '@/components/home/home-why-choose-section'
import HomeWoodProfileSection from '@/components/home/home-wood-profile-section'
import { getAllPublishedPosts } from '@/lib/services/posts.service'
import { getHomeBestSellerProducts } from '@/lib/services/product.service'
import HomeTestHero from './home-test/home-test-hero'
import categoryC1Image from '../../public/c1.webp'
import categoryC2Image from '../../public/c2.webp'
import categoryC3Image from '../../public/c3.webp'
import categoryC4Image from '../../public/c4.webp'

const roomCategories = [
  {
    name: 'PROFILE MURAL D\u00c9CORATIF',
    image: categoryC2Image,
    href: '/boutique/categorie/effet-bois-d-interieur',
  },
  {
    name: 'PANNEAU MURAL EN PVC',
    image: categoryC1Image,
    href: '/boutique/categorie/effet-marbre',
  },
  {
    name: "PROFILE MURAL EFFET BOIS D'EXTERIEUR",
    image: categoryC3Image,
    href: '/boutique/categorie/profile-mural-effet-bois-d-exterieur',
  },
  {
    name: 'ACCESSOIRES',
    image: categoryC4Image,
    href: '/boutique/categorie/accessoires',
  },
]

const HOME_PRODUCTS_LIMIT = 6

export const metadata: Metadata = {
  title: 'Update Deisgn',
  description: 'Collection premium de luminaires et creations artisanales pour interieurs modernes.',
}

export default async function HomePage() {
  const [bestSellers, posts] = await Promise.all([
    getHomeBestSellerProducts(HOME_PRODUCTS_LIMIT),
    getAllPublishedPosts(),
  ])
  const latestPosts = posts.slice(0, 6)

  return (
    <div className="bg-white text-slate-900">
      <Navbar reserveSpace />

      <main>
        <HomeTestHero />
        <HomeCategoriesSection categories={roomCategories} />
        <HomeHeritageSection />
        <HomeMarblePanelSection />
        <HomeWoodProfileSection />
        <HomeBestSellersSection products={bestSellers} />
        <HomeWhyChooseSection />
        <HomeLatestBlogsSection posts={latestPosts} />
                <HomeFaqSection />

        <HomeMapSection />
      </main>

      <Footer />
    </div>
  )
}
