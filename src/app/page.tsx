import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, Check, FileText, MapPin, PackageCheck, Ruler } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import HeroVideo from '@/components/hero-video'
import { UniverseCategoriesReveal } from '@/components/home/universe-categories-reveal'
import { getAllPublishedPosts } from '@/lib/services/posts.service'
import type { BlogPostPreview } from '@/types/post.types'

export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

export const metadata: Metadata = {
  title: 'Update Design | Catalogue Decoration Interieur & Exterieur Tunisie',
  description:
    'Update Design fournit profils muraux effet bois, panneaux effet marbre, stores a bras invisibles, parasols et solutions decoratives pour projets professionnels en Tunisie.',
  openGraph: {
    title: 'Update Design - Catalogue professionnel decoration Tunisie',
    description:
      'Catalogue decoration interieur et exterieur pour hotels, restaurants, architectes, promoteurs, revendeurs et particuliers exigeants.',
    url: siteUrl,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  alternates: { canonical: '/' },
}

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#1C1A14'
const CREAM = '#FDFAF5'
const PAPER = '#EFE8DA'

const universes = [
  {
    title: 'Profil mural effet bois',
    href: '/profil-mural-effet-bois',
    image: '/editorial/wood-lobby.jpg',
    grid: { gridColumn: '1', gridRow: '1' },
  },
  {
    title: 'Panneaux effet marbre',
    href: '/panneaux-effet-marbre',
    image: '/editorial/marble-lobby.jpg',
    grid: { gridColumn: '2', gridRow: '1' },
    featured: true,
  },
  {
    title: 'Store bras invisible',
    href: '/store-bras',
    image: '/editorial/awning-cafe.jpg',
    grid: { gridColumn: '3', gridRow: '1' },
  },
  {
    title: 'Gazon artificiel',
    href: '/gazon-artificiel',
    image: '/categories/ext-gazon.png',
    grid: { gridColumn: '1', gridRow: '2' },
  },
  {
    title: 'Parasols professionnels',
    href: '/parasols',
    image: '/editorial/hotel-pool-parasols.jpg',
    grid: { gridColumn: '3', gridRow: '2 / 4' },
    featured: true,
  },
  {
    title: 'Profil effet bois exterieur',
    href: '/pvc-effet-bois-exterieur',
    image: '/categories/ext-profiles.png',
    grid: { gridColumn: '2', gridRow: '2' },
  },
  {
    title: 'Moulures decoratives',
    href: '/moulures-decoratives',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80',
    grid: { gridColumn: '1', gridRow: '3' },
  },
  {
    title: 'Lampes LED',
    href: '/lampes',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
    grid: { gridColumn: '2', gridRow: '3' },
  },
]

const proof = [
  { icon: PackageCheck, value: '1000+', label: 'references et finitions' },
  { icon: MapPin, value: '72h', label: 'livraison nationale selon stock' },
  { icon: Building2, value: 'Pro', label: 'hotels, architectes, revendeurs' },
  { icon: FileText, value: '24h', label: 'retour devis projet' },
]

const projectSteps = [
  'Vous choisissez une gamme ou envoyez une photo de votre espace.',
  'Nous confirmons les references, les dimensions et les quantites.',
  'Vous recevez une proposition claire avec disponibilite et options.',
  'L equipe vous accompagne jusqu a la livraison ou l installation.',
]

function formatPostDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function estimateReadingTime(excerpt: string) {
  const words = excerpt ? excerpt.trim().split(/\s+/).filter(Boolean).length : 0
  return Math.max(1, Math.ceil(words / 180))
}

async function getHomePosts(): Promise<BlogPostPreview[]> {
  try {
    const posts = await getAllPublishedPosts()
    return posts.slice(0, 3)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const latestPosts = await getHomePosts()
  const featuredPost = latestPosts[0]
  const supportingPosts = latestPosts.slice(1)

  return (
    <div style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <Navbar reserveSpace />

      <main>
        <HeroVideo />

        <section className="py-10" style={{ background: DARK }}>
          <div className="mx-auto grid max-w-[1400px] gap-px px-6 md:grid-cols-4 md:px-10">
            {proof.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="border border-[#C4A23E]/15 p-6 text-white">
                  <Icon className="mb-5 h-5 w-5" style={{ color: GOLD }} />
                  <p style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{item.value}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{item.label}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section id="nos-categories" className="relative scroll-mt-24 overflow-hidden py-14 md:scroll-mt-28 md:py-24" style={{ background: PAPER, color: DARK }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C4A23E]/30" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(28,26,20,.34)_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="relative z-10 mx-auto max-w-[1420px] px-5 md:px-8">
            <UniverseCategoriesReveal universes={universes} displayFont={DISPLAY} gold={GOLD} />
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-10">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
                Methode projet
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', lineHeight: 1.05, fontWeight: 400 }}>
                Plus proche d un showroom
                <br />
                <em style={{ color: 'rgba(28,26,20,0.52)' }}>que d un panier en ligne.</em>
              </h2>
              <p className="mt-6 max-w-[520px] text-sm leading-8 text-[#1C1A14]/62">
                Pour les produits decoratifs, la bonne decision depend de la surface, de l exposition, du rendu souhaite et du budget. C est pour cela que les pages principales sont pensees comme un catalogue de selection et de demande de devis.
              </p>
            </div>
            <div className="grid gap-px">
              {projectSteps.map((step, index) => (
                <div key={step} className="flex gap-5 border border-[#C4A23E]/20 bg-[#EFE8DA] p-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[10px] font-bold" style={{ border: `1px solid ${GOLD}`, color: GOLD }}>
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-7 text-[#1C1A14]/68">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28" style={{ background: DARK, color: CREAM }}>
          <div className="mx-auto grid max-w-[1400px] gap-12 px-6 md:grid-cols-2 md:px-10">
            <div className="relative min-h-[420px] overflow-hidden">
              <Image src="/editorial/marble-lobby.jpg" alt="Lobby professionnel avec finition marbre" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <Ruler className="mb-6 h-8 w-8" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.1rem, 4vw, 3.7rem)', lineHeight: 1.0, fontWeight: 400 }}>
                Professionnels,
                <br />
                <em style={{ color: 'rgba(253,250,245,0.5)' }}>on parle quantites.</em>
              </h2>
              <ul className="mt-8 space-y-4">
                {['Prix volume pour revendeurs, hotels et chantiers.', 'Conseil choix matiere, couleur, dimensions et exposition.', 'Livraison nationale et accompagnement selon projet.'].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-white/65">
                    <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="mt-9 inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                Parler a un conseiller <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {featuredPost && (
          <section className="relative overflow-hidden py-16 md:py-28" style={{ background: DARK, color: CREAM }}>
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,rgba(196,162,62,.55)_1px,transparent_1px)] [background-size:84px_84px]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-[46%] w-full bg-[#EFE8DA]" />
            <div className="pointer-events-none absolute left-1/2 top-8 hidden -translate-x-1/2 select-none text-[22vw] leading-none text-[#FDFAF5]/[0.035] md:block" style={{ fontFamily: DISPLAY }}>
              BLOG
            </div>

            <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-10">
              <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
                <div className="pb-0 lg:pb-16">
                  <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
                    Journal Update Design
                  </p>
                  <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 7vw, 6.8rem)', lineHeight: 0.86, fontWeight: 400 }}>
                    Le carnet
                    <br />
                    <em className="text-[#FDFAF5]/45">des matieres.</em>
                  </h2>
                  <p className="mt-7 max-w-[440px] text-sm leading-8 text-[#FDFAF5]/56">
                    Inspirations chantier, conseils de pose et lectures courtes pour choisir une finition avec plus d assurance.
                  </p>
                  <Link
                    href="/blog"
                    className="mt-9 inline-flex items-center gap-3 border border-[#C4A23E]/45 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.22em] transition duration-300 hover:bg-[#C4A23E] hover:text-[#1C1A14]"
                    style={{ color: CREAM }}
                  >
                    Tous les articles <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="group relative min-h-[620px] overflow-hidden bg-[#1C1A14] shadow-[0_30px_80px_rgba(0,0,0,0.34)] md:min-h-[700px]"
                  >
                    {featuredPost.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-[0.78] contrast-[1.08] saturate-[0.7] transition duration-700 group-hover:scale-[1.035] group-hover:opacity-95 group-hover:saturate-100"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: DARK }} />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(28,26,20,0.92),rgba(28,26,20,0.42)_48%,rgba(28,26,20,0.04))]" />
                    <div className="absolute left-0 top-0 border-b border-r border-[#C4A23E]/35 bg-[#1C1A14]/70 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur" style={{ color: GOLD }}>
                      Article selectionne
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                      <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FDFAF5]/54">
                        {featuredPost.created && <span>{formatPostDate(featuredPost.created)}</span>}
                        {featuredPost.excerpt && (
                          <>
                            <span className="h-px w-8 bg-[#C4A23E]/60" />
                            <span>{estimateReadingTime(featuredPost.excerpt)} min lecture</span>
                          </>
                        )}
                      </div>
                      <h3 className="max-w-[760px]" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.35rem, 4.6vw, 4.8rem)', lineHeight: 0.9, fontWeight: 400 }}>
                        {featuredPost.title}
                      </h3>
                      {featuredPost.excerpt && (
                        <p className="mt-6 max-w-[600px] text-sm leading-8 text-[#FDFAF5]/68">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <span className="mt-8 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] transition-all duration-200 group-hover:gap-5" style={{ color: GOLD }}>
                        Lire l&apos;article <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>

                  <div className="grid gap-px bg-[#C4A23E]/25 lg:grid-rows-[auto_1fr]">
                    <div className="bg-[#FDFAF5] p-7 text-[#1C1A14]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
                        Index rapide
                      </p>
                      <p className="mt-4 text-sm leading-7 text-[#1C1A14]/56">
                        Les derniers sujets pour passer de l idee au choix produit.
                      </p>
                    </div>

                    <div className="grid gap-px">
                      {supportingPosts.map((post, index) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group flex min-h-[220px] flex-col justify-end bg-[#FDFAF5] p-7 text-[#1C1A14] transition duration-300 hover:bg-[#EFE8DA]"
                        >
                          <div className="mb-6 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1A14]/38">
                            <span style={{ color: GOLD }}>0{index + 2}</span>
                            {post.excerpt && <span>{estimateReadingTime(post.excerpt)} min</span>}
                          </div>
                          <h3 className="line-clamp-3 transition-colors group-hover:text-[#C4A23E]" style={{ fontFamily: DISPLAY, fontSize: '1.65rem', lineHeight: 1.02, fontWeight: 400 }}>
                            {post.title}
                          </h3>
                          <span className="mt-5 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-200 group-hover:gap-3" style={{ color: GOLD }}>
                            Lire <ArrowRight size={11} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
