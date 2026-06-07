import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import ProfileCatalogueClient from '@/components/catalogue/profile-catalogue-client'
import { DEFAULT_WOOD_PROFILE_CONTENT } from '@/lib/site-page-defaults'
import { getSitePageContent } from '@/lib/services/site-content.service'
import { getProductHrefBySku } from '@/lib/services/catalogue-links.service'
import { getAccessoryProductsForCategory } from '@/lib/services/static-catalogue-products.service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Profil Mural Effet Bois | Modeles & Textures | Update Design',
  description:
    'Catalogue des profiles muraux decoratifs effet bois: textures 2419, 2403, 2039, 4071, 4080 et autres references, avec modeles L24, L18, R15, U12, O15 et P40.',
  alternates: { canonical: '/profil-mural-effet-bois' },
}

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'

const textureColors: Record<string, string> = {
  '2003': '#C9B8A7',
  '2023': '#E5BDA2',
  '2039': '#B3AFAD',
  '2403': '#BB895B',
  '2419': '#8A6E53',
  '4023': '#EBEBED',
  '4047': '#B29A7F',
  '4048': '#7E776C',
  '4051': '#514138',
  '4067': '#7C7369',
  '4071': '#3A4249',
  '4075': '#88878C',
  '4079': '#464B50',
  '4080': '#5D5E62',
  '4083': '#48545E',
  '4103': '#C0996C',
  '5033': '#0F2B2C',
  '6033': '#949FAC',
  '8019': '#247785',
  '8027': '#576A80',
}

const textureNames: Record<string, string> = {
  '2419': 'Noyer Naturel',
  '2403': 'Chene Miel',
  '2039': 'Gris Perle',
  '4071': 'Anthracite Profond',
  '4080': 'Gris Urbain',
  '8019': 'Bleu Petrole',
  '4103': 'Chene Dore',
  '4023': 'Blanc Mineral',
  '4048': 'Taupe Fume',
  '4051': 'Brun Espresso',
  '4075': 'Gris Beton',
  '8027': 'Bleu Ardoise',
  '2003': 'Beige Sable',
  '2023': 'Bois Rose',
  '4047': 'Chene Grise',
  '4067': 'Greige Naturel',
  '4079': 'Graphite',
  '4083': 'Bleu Gris',
  '6033': 'Bleu Acier',
  '5033': 'Vert Profond',
}

const textureRowsBase = [
  { texture: '2419', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '2403', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '2039', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '4071', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '4080', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '8019', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '4103', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '4023', models: ['L24', 'L18', 'R15', 'U12', 'O15', 'P40'] },
  { texture: '4048', models: ['L24', 'L18', 'R15'] },
  { texture: '4051', models: ['L24', 'L18', 'R15'] },
  { texture: '4075', models: ['L24', 'L18', 'R15'] },
  { texture: '8027', models: ['L24', 'L18', 'R15'] },
  { texture: '2003', models: ['L24', 'L18', 'R15'] },
  { texture: '2023', models: ['L24', 'L18', 'R15'] },
  { texture: '4047', models: ['L24', 'L18', 'R15'] },
  { texture: '4067', models: ['L24', 'L18', 'R15'] },
  { texture: '4079', models: ['L24', 'L18', 'R15'] },
  { texture: '4083', models: ['L24', 'L18', 'R15'] },
  { texture: '6033', models: ['L24'] },
  { texture: '5033', models: ['L24'] },
]

const textureRows = textureRowsBase.map((row) => ({
  ...row,
  color: textureColors[row.texture] ?? '#C8BBA8',
  name: textureNames[row.texture] ?? `Texture ${row.texture}`,
}))

const qualityItems = [
  {
    image: '/sotuma/quality/features-1.jpg',
    title: 'Texture claire',
    text: 'Des materiaux selectionnes avec soin',
  },
  {
    image: '/sotuma/quality/features-2.jpg',
    title: 'Etanche',
    text: 'Facile a nettoyer',
  },
  {
    image: '/sotuma/quality/features-3.jpg',
    title: 'Retardateur de flamme',
    text: 'Non decolorant',
  },
  {
    image: '/sotuma/quality/features-4.jpg',
    title: 'Facile a installer',
    text: 'Pas besoin de colle',
  },
]

export default async function ProfilMuralEffetBoisPage() {
  const [content, productHrefBySku] = await Promise.all([
    getSitePageContent('profil-mural-effet-bois', DEFAULT_WOOD_PROFILE_CONTENT),
    getProductHrefBySku(),
  ])
  const accessoryProducts = await getAccessoryProductsForCategory('woodInterior')

  return (
    <div style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <Navbar reserveSpace />

      <main>
        <header className="relative overflow-hidden" style={{ background: DARK, color: CREAM }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(90deg,#C4A23E 1px,transparent 1px),linear-gradient(#C4A23E 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
          <div className="relative mx-auto grid min-h-[76vh] max-w-[1500px] gap-12 px-6 py-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:py-28">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.34em]" style={{ color: GOLD }}>
                {content.hero.eyebrow}
              </p>
              <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3.2rem, 8vw, 7.2rem)', lineHeight: 0.86, fontWeight: 400 }}>
                {content.hero.headline}
                <br />
                <em style={{ color: 'rgba(247,242,232,0.52)', fontStyle: 'italic' }}>{content.hero.italic}</em>
              </h1>
              <p className="mt-8 max-w-[620px] text-base leading-8 text-white/64">
                {content.hero.body}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/devis" className="inline-flex items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                  {content.hero.primaryLabel} <ArrowRight size={14} />
                </Link>
                <Link href={content.hero.secondaryHref} className="inline-flex items-center justify-center gap-3 border border-white/20 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/10">
                  {content.hero.secondaryLabel}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {content.hero.stats.map((item) => (
                <div key={item.value} className="border border-[#C4A23E]/18 p-6">
                  <p style={{ fontFamily: DISPLAY }} className="text-5xl leading-none">{item.label}</p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

<ProfileCatalogueClient rows={content.textures} productHrefBySku={productHrefBySku} />

        {accessoryProducts.length > 0 && (
          <section className="py-8 md:py-12" style={{ background: PAPER }}>
            <div className="mx-auto max-w-[1500px] px-6 md:px-10">
              <div className="mb-7 flex items-center gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Accessoires profil bois</p>
                <div className="h-px flex-1 bg-[#14130F]/30" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">
                  {accessoryProducts.length} references
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {accessoryProducts.map((product, index) => (
                  <article key={`${product.code}-${index}`} className="group overflow-hidden border border-[#14130F]/10 bg-[#FCFCFD] transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-white">
                      <Image
                        src="/categories/int-accessoires.png"
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.045]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,19,15,0.34),transparent_58%)]" />
                      <p className="absolute left-4 top-4 bg-black/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        Ref. {product.code}
                      </p>
                    </div>
                    <div
                      className="flex min-h-[150px] flex-col justify-between border-t border-[#14130F]/10 p-5"
                      style={{
                        backgroundColor: '#D5D0C6',
                        backgroundImage:
                          'radial-gradient(rgba(20,19,15,0.08) 0.7px, transparent 0.7px), linear-gradient(135deg, rgba(255,255,255,0.32), rgba(20,19,15,0.035))',
                        backgroundSize: '7px 7px, 100% 100%',
                      }}
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
                          Ref. {product.code}
                        </p>
                        <h3 className="mt-5 text-lg font-black leading-tight text-[#14130F]">{product.name}</h3>
                      </div>
                      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#14130F]/42">
                        {product.note ?? 'Accessoire catalogue'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-8 md:py-12" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {content.quality.items.map((item) => (
                <article
                  key={item.title}
                  className="group overflow-hidden bg-[#F7F2E8] transition duration-300 hover:shadow-[0_12px_32px_rgba(20,19,15,0.10)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-[#14130F]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#14130F]/55">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" style={{ background: DARK, color: CREAM }}>
          <div className="mx-auto grid max-w-[1500px] gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-10">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                {content.advice.eyebrow}
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.6rem)', lineHeight: 0.95, fontWeight: 400 }}>
                {content.advice.headline}
                <br />
                <em style={{ color: 'rgba(247,242,232,0.5)' }}>{content.advice.italic}</em>
              </h2>
            </div>
            <div className="grid gap-4">
              {content.advice.points.map((item) => (
                <div key={item} className="flex gap-4 border-b border-[#C4A23E]/15 pb-5 text-sm leading-7 text-white/65">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {item}
                </div>
              ))}
              <Link href="/devis" className="mt-5 inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                {content.advice.ctaLabel} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
