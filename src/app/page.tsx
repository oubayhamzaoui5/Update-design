import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Reveal, RevealItem } from '@/components/ui/reveal'
import { PlaceholderImage } from '@/components/ui/placeholder-image'
import { getAllPublishedPosts } from '@/lib/services/posts.service'
import type { BlogPostPreview } from '@/types/post.types'

export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

export const metadata: Metadata = {
  title: 'Update Design | Catalogue Décoration Intérieure & Extérieure — Tunisie',
  description:
    "Catalogue professionnel de décoration intérieure et extérieure en Tunisie : profils muraux effet bois, panneaux effet marbre, stores à bras invisibles, parasols, gazon artificiel, moulures et éclairage LED. Prix volume, devis sous 24h.",
  keywords: [
    'décoration intérieure tunisie',
    'décoration extérieure tunisie',
    'profil mural effet bois',
    'panneaux effet marbre',
    'store à bras invisible',
    'parasols professionnels',
    'gazon artificiel',
    'moulures décoratives',
    'fournisseur décoration hôtel architecte',
    'update design tunisie',
  ],
  openGraph: {
    title: 'Update Design — Catalogue professionnel décoration en Tunisie',
    description:
      "Décoration intérieure et extérieure pour hôtels, restaurants, architectes, promoteurs, revendeurs et particuliers exigeants.",
    url: siteUrl,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Update Design — Catalogue décoration Tunisie',
    description: 'Profils effet bois, marbre, stores, parasols, gazon et éclairage LED. Prix volume, devis 24h.',
  },
  alternates: { canonical: '/' },
}

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'Manrope', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#1C1A14'
const CREAM = '#FDFAF5'
const PAPER = '#EFE8DA'

/**
 * `span` controls the editorial bento layout on desktop (>= md).
 * Tiles without an `image` still show the embedded production brief.
 */
const categories = [
  {
    title: 'Profil mural effet bois',
    tag: 'Intérieur',
    href: '/profil-mural-effet-bois',
    alt: "Pan de mur intérieur habillé de lattes verticales effet bois chaud, dans un salon ou hall haut de gamme, lumière rasante mettant en valeur le relief du bois — cadrage vertical serré.",
    image: '/home/home-cat-profil-bois.png',
    span: 'md:col-span-1 md:row-span-2',
  },
  {
    title: 'Panneaux effet marbre',
    tag: 'Intérieur',
    href: '/panneaux-effet-marbre',
    alt: "Grand panneau mural effet marbre veiné (blanc/gris ou beige) couvrant un mur de réception d'hôtel ou de salle de bain luxueuse, reflets subtils — cadrage large paysage.",
    image: '/home/home-cat-marbre.png',
    span: 'md:col-span-2 md:row-span-1',
    featured: true,
  },
  {
    title: 'Parasols professionnels',
    tag: 'Extérieur',
    href: '/parasols',
    alt: "Parasol professionnel déporté ouvert au-dessus d'une terrasse d'hôtel ou de restaurant en bord de piscine, ciel bleu, mobilier élégant en contrebas — cadrage vertical.",
    image: '/home/home-cat-parasols.png',
    span: 'md:col-span-1 md:row-span-2',
  },
  {
    title: 'Store à bras invisible',
    tag: 'Extérieur',
    href: '/store-bras',
    alt: "Store banne à bras invisible déployé sur une façade de café ou terrasse, toile tendue couleur unie, belle ombre portée sur la table — cadrage carré ou paysage.",
    image: '/home/home-cat-store-bras.png',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Gazon artificiel',
    tag: 'Extérieur',
    href: '/gazon-artificiel',
    alt: "Surface de gazon artificiel dense et réaliste posée sur une terrasse ou un patio, vue plongeante montrant la texture des brins verts — cadrage carré.",
    image: '/home/home-cat-gazon.png',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Profil effet bois extérieur',
    tag: 'Extérieur',
    href: '/pvc-effet-bois-exterieur',
    alt: "Bardage / claustra extérieur en profilés PVC effet bois sur une façade ou clôture de villa, intégration paysagère soignée, lumière naturelle — cadrage large paysage.",
    image: '/home/home-cat-pvc-bois.png',
    span: 'md:col-span-2 md:row-span-1',
    featured: true,
  },
  {
    title: 'Moulures décoratives',
    tag: 'Intérieur',
    href: '/moulures-decoratives',
    alt: "Détail de moulures et corniches décoratives murales peintes en blanc dans un intérieur élégant, jeu d'ombre et de relief sur le mur — cadrage carré rapproché.",
    image: '/home/home-cat-moulures.png',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Éclairage LED & néon',
    tag: 'Électricité',
    href: '/lampes',
    alt: "Ruban LED / néon flexible allumé soulignant une niche ou un faux-plafond dans une ambiance tamisée, lueur chaude ou colorée — cadrage carré.",
    image: '/home/home-cat-led.png',
    span: 'md:col-span-1 md:row-span-1',
  },
]

const clientele = ['Hôtels & Resorts', 'Restaurants & Cafés', 'Architectes', 'Promoteurs', 'Revendeurs', 'Particuliers exigeants']

const proof = [
  { value: '1000+', label: 'références & finitions' },
  { value: 'Pro', label: 'hôtels, architectes, revendeurs' },
  { value: '24h', label: 'retour sur devis projet' },
  { value: 'Sur-mesure', label: 'stores & parasols configurables' },
]

function formatPostDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function estimateReadingTime(excerpt: string) {
  const words = excerpt ? excerpt.trim().split(/\s+/).filter(Boolean).length : 0
  return Math.max(1, Math.ceil(words / 180))
}

async function getHomePosts(): Promise<BlogPostPreview[]> {
  try {
    const posts = await getAllPublishedPosts()
    return posts.slice(0, 6)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const latestPosts = await getHomePosts()
  const featuredPost = latestPosts[0]
  const supportingPosts = latestPosts.slice(1)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Update Design',
    url: siteUrl,
    description:
      'Catalogue professionnel de décoration intérieure et extérieure en Tunisie.',
    areaServed: 'TN',
    knowsAbout: categories.map((c) => c.title),
    makesOffer: categories.map((c) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: c.title, url: `${siteUrl}${c.href}` },
    })),
  }

  return (
    <div style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar reserveSpace />

      <main>
        {/* ───────────────────────── HERO ───────────────────────── */}
        <header className="relative min-h-[92vh] overflow-hidden" style={{ background: DARK }}>
          <Image
            src="/home/home-hero.png"
            alt="Photo signature plein écran : un intérieur ou une terrasse haut de gamme entièrement aménagé par Update Design (mur effet bois + marbre, ou terrasse avec parasols et store), lumière dorée de fin de journée. Image cinématographique, sombre et chic."
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,19,15,0.78)_0%,rgba(20,19,15,0.4)_45%,rgba(20,19,15,0.82)_100%)]" />

          <Reveal
            load
            className="relative mx-auto flex min-h-[92vh] max-w-[1400px] flex-col justify-center px-6 pt-[calc(var(--navbar-offset-mobile)+2rem)] pb-16 md:px-10 md:pt-[calc(var(--navbar-offset-desktop)+2.5rem)] md:pb-24"
          >
            <RevealItem className="mb-7 flex items-center gap-4">
              <span className="h-px w-12" style={{ background: GOLD }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-white">
                Décoration intérieure & extérieure — Tunisie
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                className="max-w-[16ch]"
                style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.6rem, 7vw, 6.2rem)', lineHeight: 0.94, fontWeight: 500, color: '#FFFFFF' }}
              >
                Le catalogue qui
                <br />
                <em style={{ color: '#FFFFFF', fontStyle: 'italic' }}>habille vos espaces.</em>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mt-7 max-w-[560px] text-base font-medium leading-8 text-white md:text-lg">
                Profils effet bois, panneaux effet marbre, stores à bras invisibles, parasols,
                gazon et finitions sur mesure — pour vos projets résidentiels et professionnels.
              </p>
            </RevealItem>

            <RevealItem className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#catalogue"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition hover:brightness-110"
                style={{ background: GOLD, color: '#FFFFFF' }}
              >
                Voir le catalogue <ArrowRight size={15} />
              </Link>
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-3 border px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
                style={{ borderColor: 'rgba(196,162,62,0.6)' }}
              >
                Demander un devis
              </Link>
            </RevealItem>
          </Reveal>
        </header>

        {/* ─────────────── PROOF STRIP ─────────────── */}
        <section className="py-8" style={{ background: DARK }} aria-label="Update Design en bref">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-6 md:grid-cols-4 md:px-10">
            {proof.map((item) => (
              <div key={item.label} className="border border-[#C4A23E]/15 p-6 text-white">
                <p style={{ fontFamily: DISPLAY }} className="text-3xl leading-none" >{item.value}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────── CLIENTÈLE STRIP ─────────────── */}
        <section className="border-y border-[#C4A23E]/20 py-7" style={{ background: CREAM }} aria-label="Clientèle">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-5 px-6 md:flex-row md:justify-between md:px-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1C1A14]/45">
              Le choix des professionnels
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
              {clientele.map((c) => (
                <span key={c} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1C1A14]/70">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────── CATALOGUE / CATEGORIES GALLERY ─────────────── */}
        <section
          id="catalogue"
          className="relative scroll-mt-24 overflow-hidden py-16 md:scroll-mt-28 md:py-24"
          style={{ background: PAPER }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(28,26,20,.4)_1px,transparent_1px)] [background-size:14px_14px]" />
          <div className="relative z-10 mx-auto max-w-[1420px] px-5 md:px-8">
            <Reveal className="mb-9 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
              <RevealItem>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
                  Nos catégories
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.1rem, 4.4vw, 3.6rem)', lineHeight: 1, fontWeight: 400 }}>
                  Un univers complet,
                  <br />
                  <em style={{ color: 'rgba(28,26,20,0.5)' }}>intérieur & extérieur.</em>
                </h2>
              </RevealItem>
              <RevealItem>
                <Link href="/boutique" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition hover:gap-3" style={{ color: DARK }}>
                  Tout le catalogue <ArrowUpRight size={15} style={{ color: GOLD }} />
                </Link>
              </RevealItem>
            </Reveal>

            <Reveal
              className="grid grid-cols-1 gap-3 md:grid-cols-4 md:[grid-auto-rows:230px] md:[grid-auto-flow:dense]"
              amount={0.1}
            >
              {categories.map((cat) => (
                <RevealItem key={cat.href} className={`${cat.span} min-h-[260px] md:min-h-0`}>
                  <Link href={cat.href} className="group relative block h-full overflow-hidden transition duration-500 hover:-translate-y-0.5">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <PlaceholderImage tone="dark" alt={cat.alt} />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(28,26,20,0.78),rgba(28,26,20,0.05)_60%,transparent)] transition-opacity duration-500 group-hover:opacity-90" />
                    <span className="absolute right-4 top-4 z-10 border border-[#C4A23E]/45 bg-[#1C1A14]/55 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.2em] backdrop-blur" style={{ color: GOLD }}>
                      {cat.tag}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-5">
                      <h3
                        className="text-white"
                        style={{ fontFamily: DISPLAY, fontSize: cat.featured ? '2rem' : '1.5rem', lineHeight: 1, fontWeight: 400 }}
                      >
                        {cat.title}
                      </h3>
                      <ArrowUpRight size={20} className="shrink-0 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" style={{ color: GOLD }} />
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ─────────────── FEATURE : INTÉRIEUR ─────────────── */}
        <section className="py-16 md:py-24" aria-label="Décoration intérieure">
          <div className="mx-auto grid max-w-[1400px] items-stretch gap-10 px-6 md:grid-cols-2 md:px-10">
            <Reveal className="order-2 flex flex-col justify-center md:order-1">
              <RevealItem>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                  Intérieur
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1.02, fontWeight: 400 }}>
                  Des murs qui
                  <br />
                  <em style={{ color: 'rgba(28,26,20,0.5)' }}>racontent une matière.</em>
                </h2>
                <p className="mt-6 max-w-[480px] text-sm leading-8 text-[#1C1A14]/62">
                  Profils muraux effet bois, panneaux effet marbre, moulures et accessoires :
                  des finitions nobles, faciles à poser, pour transformer un hall, une chambre ou un salon
                  sans gros œuvre.
                </p>
              </RevealItem>
              <RevealItem className="mt-8 flex flex-wrap gap-3">
                <Link href="/profil-mural-effet-bois" className="inline-flex items-center gap-2 border border-[#1C1A14]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:border-[#C4A23E] hover:text-[#C4A23E]">
                  Effet bois
                </Link>
                <Link href="/panneaux-effet-marbre" className="inline-flex items-center gap-2 border border-[#1C1A14]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:border-[#C4A23E] hover:text-[#C4A23E]">
                  Effet marbre
                </Link>
                <Link href="/moulures-decoratives" className="inline-flex items-center gap-2 border border-[#1C1A14]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:border-[#C4A23E] hover:text-[#C4A23E]">
                  Moulures
                </Link>
              </RevealItem>
            </Reveal>

            <Reveal className="order-1 grid grid-cols-2 gap-3 md:order-2" amount={0.15}>
              <RevealItem className="relative col-span-2 min-h-[300px] overflow-hidden">
                <Image
                  src="/home/home-interior-bois.png"
                  alt="Salon ou hall d'hôtel élégant dont tout un pan de mur est habillé en profil effet bois vertical, mobilier sobre, lumière chaude. Vue d'ensemble."
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </RevealItem>
              <RevealItem className="relative min-h-[220px] overflow-hidden">
                <Image
                  src="/home/home-interior-marbre-detail.png"
                  alt="Gros plan sur la texture d'un panneau effet marbre veiné, détail des reflets et de la profondeur."
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </RevealItem>
              <RevealItem className="relative min-h-[220px] overflow-hidden">
                <Image
                  src="/home/home-interior-moulures-detail.png"
                  alt="Détail de moulures décoratives blanches en relief sur un mur d'intérieur, ombre douce."
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </RevealItem>
            </Reveal>
          </div>
        </section>

        {/* ─────────────── FEATURE : EXTÉRIEUR ─────────────── */}
        <section className="py-16 md:py-24" style={{ background: DARK, color: CREAM }} aria-label="Aménagement extérieur">
          <div className="mx-auto grid max-w-[1400px] items-stretch gap-10 px-6 md:grid-cols-2 md:px-10">
            <Reveal className="grid grid-cols-2 gap-3" amount={0.15}>
              <RevealItem className="relative col-span-2 min-h-[300px] overflow-hidden">
                <Image
                  src="/home/home-exterior-terrace.png"
                  alt="Terrasse de restaurant ou bord de piscine d'hôtel aménagé avec plusieurs parasols professionnels déportés ouverts et un store banne, ambiance lumineuse de jour."
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </RevealItem>
              <RevealItem className="relative min-h-[220px] overflow-hidden">
                <Image
                  src="/home/home-exterior-gazon-detail.png"
                  alt="Surface de gazon artificiel réaliste posée sur une terrasse, vue plongeante sur la texture verte."
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </RevealItem>
              <RevealItem className="relative min-h-[220px] overflow-hidden">
                <Image
                  src="/home/home-exterior-pvc-detail.png"
                  alt="Façade de villa habillée d'un bardage / claustra PVC effet bois extérieur, intégration paysagère."
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </RevealItem>
            </Reveal>

            <Reveal className="flex flex-col justify-center">
              <RevealItem>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                  Extérieur
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1.02, fontWeight: 400 }}>
                  L'ombre, le confort,
                  <br />
                  <em style={{ color: 'rgba(253,250,245,0.5)' }}>l'allure dehors.</em>
                </h2>
                <p className="mt-6 max-w-[480px] text-sm leading-8 text-white/64">
                  Parasols professionnels, stores à bras invisibles, gazon artificiel et profilés effet bois
                  extérieur. De la terrasse de café à la villa, des solutions robustes et configurables sur mesure.
                </p>
              </RevealItem>
              <RevealItem className="mt-8 flex flex-wrap gap-3">
                <Link href="/parasols" className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#C4A23E] hover:text-[#C4A23E]">
                  Parasols
                </Link>
                <Link href="/store-bras" className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#C4A23E] hover:text-[#C4A23E]">
                  Stores
                </Link>
                <Link href="/gazon-artificiel" className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#C4A23E] hover:text-[#C4A23E]">
                  Gazon
                </Link>
              </RevealItem>
            </Reveal>
          </div>
        </section>

        {/* ─────────────── SHOWROOM STATEMENT (full bleed) ─────────────── */}
        <section className="relative min-h-[60vh] overflow-hidden" aria-label="Showroom Update Design">
          <Image
            src="/home/home-showroom.png"
            alt="Intérieur du showroom Update Design à Tunis : grands panneaux d'échantillons (effet bois, marbre, tissus de stores) exposés, éclairage soigné, espace professionnel et accueillant."
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(20,19,15,0.86)_0%,rgba(20,19,15,0.5)_60%,rgba(20,19,15,0.2)_100%)]" />
          <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-[1400px] items-center px-6 py-20 md:px-10">
            <Reveal className="max-w-[640px]">
              <RevealItem>
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                  Le showroom
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 5vw, 4.4rem)', lineHeight: 1, fontWeight: 400, color: CREAM }}>
                  Plus proche d'un showroom
                  <br />
                  <em style={{ color: 'rgba(253,250,245,0.5)' }}>que d'un panier en ligne.</em>
                </h2>
                <p className="mt-6 max-w-[500px] text-sm leading-8 text-white/68">
                  Pour la décoration, le bon choix dépend de la surface, de l'exposition et du rendu souhaité.
                  Nos pages sont pensées comme un catalogue de sélection et de demande de devis.
                </p>
              </RevealItem>
              <RevealItem>
                <Link href="/a-propos" className="mt-8 inline-flex items-center gap-3 border border-[#C4A23E]/50 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#C4A23E] hover:text-[#1C1A14]">
                  Découvrir Update Design <ArrowRight size={14} />
                </Link>
              </RevealItem>
            </Reveal>
          </div>
        </section>

        {/* ─────────────── JOURNAL / BLOG ─────────────── */}
        {featuredPost && (
          <section className="py-16 md:py-24" style={{ background: CREAM }} aria-label="Journal Update Design">
            <div className="mx-auto max-w-[1400px] px-6 md:px-10">
              <Reveal className="mb-10 flex flex-col gap-5 border-b border-[#1C1A14]/10 pb-7 md:mb-14 md:flex-row md:items-end md:justify-between">
                <RevealItem>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
                    Le journal
                  </p>
                  <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.1rem, 4.6vw, 3.8rem)', lineHeight: 1, fontWeight: 400 }}>
                    Le carnet
                    <em style={{ color: 'rgba(28,26,20,0.5)' }}> des matières.</em>
                  </h2>
                </RevealItem>
                <RevealItem>
                  <Link href="/blog" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition hover:gap-3" style={{ color: DARK }}>
                    Tous les articles <ArrowUpRight size={15} style={{ color: GOLD }} />
                  </Link>
                </RevealItem>
              </Reveal>

              <Reveal className="grid items-stretch gap-6 lg:grid-cols-[1.4fr_1fr]" amount={0.12}>
                {/* Featured */}
                <RevealItem className="h-full">
                  <Link href={`/blog/${featuredPost.slug}`} className="group flex h-full flex-col">
                    <div className="relative mb-6 aspect-[16/10] overflow-hidden">
                      {featuredPost.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featuredPost.coverImage}
                          alt={featuredPost.title}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <PlaceholderImage tone="dark" ratio="16:10 · paysage" alt={`Image de couverture de l'article : ${featuredPost.title}`} />
                      )}
                      <span className="absolute left-4 top-4 z-10 bg-[#1C1A14] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                        À la une
                      </span>
                    </div>
                    <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1C1A14]/40">
                      {featuredPost.created && <span>{formatPostDate(featuredPost.created)}</span>}
                      {featuredPost.excerpt && (
                        <>
                          <span className="h-px w-8 bg-[#C4A23E]/60" />
                          <span>{estimateReadingTime(featuredPost.excerpt)} min de lecture</span>
                        </>
                      )}
                    </div>
                    <h3 className="max-w-[640px] transition-colors group-hover:text-[#C4A23E]" style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)', lineHeight: 1.02, fontWeight: 400 }}>
                      {featuredPost.title}
                    </h3>
                    {featuredPost.excerpt && (
                      <p className="mt-4 max-w-[560px] text-sm leading-7 text-[#1C1A14]/58">{featuredPost.excerpt}</p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] transition-all group-hover:gap-3" style={{ color: GOLD }}>
                      Lire l&apos;article <ArrowRight size={13} />
                    </span>
                  </Link>
                </RevealItem>

                {/* Secondary list */}
                <RevealItem className="flex h-full flex-col divide-y divide-[#1C1A14]/10 border-t border-[#1C1A14]/10 lg:border-l lg:border-t-0 lg:pl-6">
                  {supportingPosts.length > 0 ? (
                    supportingPosts.map((post, index) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-1 gap-4 py-4 first:pt-0 lg:items-center lg:first:pt-0">
                        <div className="relative aspect-square w-24 shrink-0 overflow-hidden md:w-28">
                          {post.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                            />
                          ) : (
                            <PlaceholderImage tone="dark" alt={`Image de couverture de l'article : ${post.title}`} />
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
                            0{index + 2}
                            {post.excerpt && <span className="text-[#1C1A14]/35"> · {estimateReadingTime(post.excerpt)} min</span>}
                          </span>
                          <h3 className="line-clamp-3 transition-colors group-hover:text-[#C4A23E]" style={{ fontFamily: DISPLAY, fontSize: '1.4rem', lineHeight: 1.08, fontWeight: 400 }}>
                            {post.title}
                          </h3>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-6">
                      <p className="text-sm leading-7 text-[#1C1A14]/55">
                        D&apos;autres articles arrivent bientôt — inspirations chantier, conseils de pose et choix des finitions.
                      </p>
                      <Link href="/blog" className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:gap-3" style={{ color: GOLD }}>
                        Voir le blog <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </RevealItem>
              </Reveal>
            </div>
          </section>
        )}

        {/* ─────────────── DEVIS CTA BAND ─────────────── */}
        <section className="relative overflow-hidden py-20 md:py-28" style={{ background: DARK, color: CREAM }} aria-label="Demander un devis">
          <Image
            src="/home/home-cta-band.png"
            alt="Plan rapproché et chaleureux d'un projet réalisé (mur effet bois + détail doré, ou terrasse avec parasol), servant de fond discret et élégant au bandeau de contact."
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[rgba(20,19,15,0.82)]" />
          <div className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 md:grid-cols-2 md:items-center md:px-10">
            <Reveal>
              <RevealItem>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.1rem, 4.4vw, 3.8rem)', lineHeight: 1, fontWeight: 400 }}>
                  Professionnels,
                  <br />
                  <em style={{ color: 'rgba(253,250,245,0.5)' }}>parlons quantités.</em>
                </h2>
              </RevealItem>
            </Reveal>
            <Reveal className="flex flex-col">
              <RevealItem>
                <ul className="space-y-4">
                  {[
                    'Prix volume pour revendeurs, hôtels et chantiers.',
                    'Conseil choix matière, couleur, dimensions et exposition.',
                    "Accompagnement projet, du choix des références à la pose.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-white/68">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </RevealItem>
              <RevealItem className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/devis" className="inline-flex items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ background: GOLD, color: DARK }}>
                  Demander un devis <ArrowRight size={14} />
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center gap-3 border border-white/25 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/10">
                  Parler à un conseiller
                </Link>
              </RevealItem>
            </Reveal>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
