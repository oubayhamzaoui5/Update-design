import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, MessageCircle, Ruler } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { DEFAULT_MARBLE_PANELS_CONTENT } from '@/lib/site-page-defaults'
import { getSitePageContent } from '@/lib/services/site-content.service'
import { getProductHrefBySku } from '@/lib/services/catalogue-links.service'
import { getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'
import { slugify } from '@/utils/slug'

const SOTUMA = 'https://www.sotuma.tn'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'

const marbleModels = [
  { ref: 'MB004', name: 'Blanc Calacatta', tone: 'Clair', src: `${SOTUMA}/web/image/231443/MB004-.jpg` },
  { ref: 'MB007', name: 'Arabescato Gris', tone: 'Gris', src: `${SOTUMA}/web/image/163663/MB007.jpg` },
  { ref: 'MB008', name: 'Statuario Blanc', tone: 'Clair', src: `${SOTUMA}/web/image/163657/MB008.jpg` },
  { ref: 'MB010', name: 'Marbre Ivoire', tone: 'Chaud', src: `${SOTUMA}/web/image/163662/MB010.jpg` },
  { ref: 'MB012', name: 'Carrara Nuage', tone: 'Clair', src: `${SOTUMA}/web/image/163666/MB012.jpg` },
  { ref: 'MB018', name: 'Noir Saint Laurent', tone: 'Fonce', src: `${SOTUMA}/web/image/231444/MB018-.jpg` },
  { ref: 'MB019', name: 'Gris Imperial', tone: 'Gris', src: `${SOTUMA}/web/image/163668/MB019.jpg` },
  { ref: 'MB021', name: 'Onyx Beige', tone: 'Chaud', src: `${SOTUMA}/web/image/163659/MB021.jpg` },
  { ref: 'MB031', name: 'Blanc Veine Or', tone: 'Clair', src: `${SOTUMA}/web/image/163661/MB031.jpg` },
  { ref: 'MB032', name: 'Grigio Venato', tone: 'Gris', src: `${SOTUMA}/web/image/163660/MB032.jpg` },
  { ref: 'MB033', name: 'Noir Marquina', tone: 'Fonce', src: `${SOTUMA}/web/image/163665/MB033.jpg` },
  { ref: 'MB044', name: 'Travertin Dore', tone: 'Chaud', src: `${SOTUMA}/web/image/163664/MB044.jpg` },
  { ref: 'MB063', name: 'Borghini Soft', tone: 'Clair', src: `${SOTUMA}/web/image/163658/MB063.jpg` },
]

const marbleImageByBaseRef = new Map(marbleModels.map((model) => [model.ref, model.src]))

function marbleFallbackImage(ref: string) {
  const baseRef = ref.split('/')[0]?.trim().toUpperCase()
  return marbleImageByBaseRef.get(baseRef) ?? '/categories/int-marbre.png'
}

const marblePanelModels = [
  {
    model: '290cm x 220cm',
    image: `${SOTUMA}/web/image/231443/MB004-.jpg`,
    text: 'Grand panneau pour habillage mural large et rendu continu.',
  },
  {
    model: '290cm x 120cm',
    image: `${SOTUMA}/web/image/163663/MB007.jpg`,
    text: 'Format panneau vertical pour murs, niches et zones ciblees.',
  },
]

const accessoryTypes = [
  {
    type: 'Type I',
    text: 'Jonction droite entre deux panneaux.',
    src: `${SOTUMA}/web/image/160794/Accessoires-I.jpg`,
    detail: `${SOTUMA}/web/image/160796/Acc-typeI.png`,
  },
  {
    type: 'Type T',
    text: 'Raccord visible pour une finition nette.',
    src: `${SOTUMA}/web/image/160802/Accessoires-T.jpg`,
    detail: `${SOTUMA}/web/image/160803/Acc-typeT.png`,
  },
  {
    type: 'Type U',
    text: 'Encadrement et finition de bord.',
    src: `${SOTUMA}/web/image/160805/Accessoires-U.jpg`,
    detail: `${SOTUMA}/web/image/160806/Acc-typeU.png`,
  },
]

const lDetails = [
  { type: 'Type L 25 x 25', src: `${SOTUMA}/web/image/160832/Acc-typeL25.png` },
  { type: 'Type L 35 x 35', src: `${SOTUMA}/web/image/160831/Acc-typeL30.png` },
]

const lProfiles = [
  { name: 'Black', src: '/accessories/type-l-black.png' },
  { name: 'Purple', src: '/accessories/type-l-purple.png' },
  { name: 'Gold', src: '/accessories/type-l-gold.png' },
  { name: 'Silver', src: '/accessories/type-l-silver.png' },
  { name: 'Grey', src: '/accessories/type-l-grey.png' },
  { name: 'White', src: '/accessories/type-l-white.png' },
]

const accessoryFinishes = [
  { name: 'Gold', typeIImage: '/accessories/type-i-gold.png', typeTImage: '/accessories/type-t-gold.png', typeUImage: '/accessories/type-u-gold.png' },
  { name: 'Bronze', typeIImage: '/accessories/type-i-bronze.png', typeTImage: '/accessories/type-t-bronze.png', typeUImage: '/accessories/type-u-bronze.png' },
  { name: 'Black', typeIImage: '/accessories/type-i-black.png', typeTImage: '/accessories/type-t-black.png', typeUImage: '/accessories/type-u-black.png' },
  { name: 'Brown', typeIImage: '/accessories/type-i-brown.png', typeTImage: '/accessories/type-t-brown.png', typeUImage: '/accessories/type-u-brown.png' },
]

function accessoryFinishImage(type: string, fallback: string, finish: (typeof accessoryFinishes)[number]) {
  if (type === 'Type I') return finish.typeIImage
  if (type === 'Type T') return finish.typeTImage
  if (type === 'Type U') return finish.typeUImage
  return fallback
}

const usageNotes = [
  'Halls, salons, receptions, murs TV et bureaux avec rendu pierre naturelle.',
  'Pose legere en renovation pour eviter les contraintes du marbre massif.',
  'References MB selectionnees selon couleur, veinage et ambiance du projet.',
]

const benefits = [
  'PVC rigide avec impression haute definition effet marbre.',
  'Panneaux faciles a couper, transporter et poser sur mur existant.',
  'Profils I, T, U et L pour angles, jonctions et bordures propres.',
  'Catalogue adapte aux projets particuliers, hotels, restaurants et showrooms.',
]

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Panneaux PVC Effet Marbre | Catalogue Update Design Tunisie',
  description:
    'Catalogue de panneaux muraux PVC effet marbre: references MB, profils de finition et accompagnement projet pour salons, halls, hotels et espaces professionnels.',
  alternates: { canonical: '/panneaux-effet-marbre' },
}

export default async function PanneauxEffetMarbrePage() {
  const [content, productHrefBySku] = await Promise.all([
    getSitePageContent('panneaux-effet-marbre', DEFAULT_MARBLE_PANELS_CONTENT),
    getProductHrefBySku(),
  ])
  const backendProducts = await getStaticCatalogueProductsByCategory('marble')
  const referenceModels = backendProducts.length > 0
    ? Array.from(backendProducts.reduce((groups, product) => {
        const [baseRef, sizeCode] = product.code.split('/')
        const ref = baseRef.trim().toUpperCase()
        const size = sizeCode === '244' ? '1220x2440mm' : '1220x2900mm'
        const current = groups.get(ref)

        if (current) {
          if (!current.variants.includes(size)) current.variants.push(size)
          return groups
        }

        groups.set(ref, {
          ref,
          name: ref,
          tone: 'PVC',
          src: product.image ?? marbleFallbackImage(ref),
          variants: [size],
        })

        return groups
      }, new Map<string, { ref: string; name: string; tone: string; src: string; variants: string[] }>()).values())
    : content.references.models

  const marbleHref = (ref: string) => {
    const sku = ref.toUpperCase()
    return productHrefBySku[sku] ?? productHrefBySku[`MB-${sku.replace(/^MB/, '')}`] ?? `/produit/panneau-effet-marbre-${slugify(ref)}`
  }

  const productHref = (name: string, prefix: string) => `/produit/${prefix}-${slugify(name)}`
  return (
    <div style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <Navbar reserveSpace />

      <main>
        <header className="relative overflow-hidden" style={{ background: DARK, color: CREAM }}>
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(90deg,#C4A23E 1px,transparent 1px),linear-gradient(#C4A23E 1px,transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          <div className="relative mx-auto grid min-h-[76vh] max-w-[1500px] gap-12 px-6 py-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:py-28">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.34em]" style={{ color: GOLD }}>
                {content.hero.eyebrow}
              </p>
              <h1
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(3.2rem, 8vw, 7.2rem)',
                  lineHeight: 0.86,
                  fontWeight: 400,
                }}
              >
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
                  <p style={{ fontFamily: DISPLAY }} className="text-5xl leading-none">
                    {item.label}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="grid gap-4 md:grid-cols-2">
              {marblePanelModels.map((item) => (
                <article key={item.model} className="overflow-hidden border border-[#14130F]/10 bg-[#FCFCFD] transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                  <div className="relative aspect-square bg-[#FCFCFD]">
                    <Image
                      src={item.image}
                      alt={`Modele panneau effet marbre ${item.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="border-t border-[#14130F]/10 p-5"
                    style={{
                      backgroundColor: '#D5D0C6',
                      backgroundImage:
                        'radial-gradient(rgba(20,19,15,0.08) 0.7px, transparent 0.7px), linear-gradient(135deg, rgba(255,255,255,0.32), rgba(20,19,15,0.035))',
                      backgroundSize: '7px 7px, 100% 100%',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-black tracking-[0.08em]">{item.model}</h3>
                      <Ruler className="h-4 w-4" style={{ color: GOLD }} />
                    </div>
                    <p className="mt-2 text-sm text-[#14130F]/58">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="references" className="py-8 md:py-10">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-7 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Textures</p>
              <div className="h-px flex-1 bg-[#14130F]/30" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">
                {referenceModels.length} {content.references.countLabel}
              </p>
            </div>

            <div className="grid justify-start gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {referenceModels.map((model, index) => {
                const variants = (model as { variants?: string[] }).variants ?? []

                return (
                <article key={model.ref} className="group overflow-hidden bg-[#F7F2E8] transition duration-300 hover:shadow-[0_12px_32px_rgba(20,19,15,0.10)]">
                  <Link href={marbleHref(model.ref)} className="block cursor-pointer">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={model.src}
                      alt={`Panneau PVC effet marbre ${model.ref}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      priority={index < 5}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#14130F]">{model.name}</h3>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
                          Ref. {model.ref}
                        </p>
                        {variants.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {variants.map((variant) => (
                              <span key={variant} className="border border-[#14130F]/14 bg-white/35 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#14130F]/52">
                                {variant}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 border border-[#14130F]/14 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#14130F]/52">
                        {model.tone}
                      </span>
                    </div>
                  </div>
                  </Link>
                </article>
              )})}
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-7 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Accessoires</p>
              <div className="h-px flex-1 bg-[#14130F]/30" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {content.finishing.accessories.map((item) => (
                <div key={item.type}>
                  <Link href={productHref(item.type, 'profil-finition-marbre')} className="group block cursor-pointer overflow-hidden bg-white transition duration-300 hover:shadow-[0_12px_32px_rgba(20,19,15,0.10)]">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={item.detail}
                        alt={`Schema technique profil ${item.type}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-5 transition duration-500 group-hover:scale-[1.04] [filter:invert(1)_hue-rotate(180deg)_saturate(1.15)]"
                      />
                    </div>
                    <div className="border-t border-[#14130F]/10 px-5 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/58">{item.type}</p>
                    </div>
                  </Link>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {accessoryFinishes.map((finish) => (
                      <article key={`${item.type}-${finish.name}`} className="group border border-[#14130F]/12 bg-[#F7F2E8] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/50 hover:shadow-[0_14px_34px_rgba(20,19,15,0.12)]">
                      <Link href={productHref(`${item.type} ${finish.name}`, 'profil-finition-marbre')} className="block cursor-pointer">
                        <div className="relative aspect-square overflow-hidden border border-[#14130F]/10 bg-white">
                          <Image
                            src={accessoryFinishImage(item.type, item.src, finish)}
                            alt={`${item.type} ${finish.name}`}
                            fill
                            sizes="(max-width:640px) 50vw, (max-width:1024px) 16vw, 12vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.05]"
                          />
                        </div>
                        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#14130F]/54">
                          {item.type}
                        </p>
                      </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                {content.finishing.lDetails.map((detail) => (
                  <Link key={detail.type} href={productHref(detail.type, 'profil-finition-marbre')} className="group cursor-pointer overflow-hidden bg-white transition duration-300 hover:shadow-[0_12px_32px_rgba(20,19,15,0.10)]">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={detail.src}
                        alt={`Schema technique ${detail.type}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-5 transition duration-500 group-hover:scale-[1.04] [filter:invert(1)_hue-rotate(180deg)_saturate(1.15)]"
                      />
                    </div>
                    <div className="border-t border-[#14130F]/10 px-5 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14130F]/58">{detail.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {lProfiles.map((profile) => (
                  <article key={profile.name} className="group border border-[#14130F]/12 bg-[#F7F2E8] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/50 hover:shadow-[0_14px_34px_rgba(20,19,15,0.12)]">
                  <Link href={productHref(`Type L ${profile.name}`, 'profil-finition-marbre')} className="block cursor-pointer">
                    <div className="relative aspect-square overflow-hidden border border-[#14130F]/10 bg-white">
                      <Image src={profile.src} alt={profile.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw" className="object-cover transition duration-500 group-hover:scale-[1.05]" />
                    </div>
                    <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#14130F]/54">{profile.name}</p>
                  </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" style={{ background: DARK, color: CREAM }}>
          <div className="mx-auto grid max-w-[1500px] gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-10">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                {content.advice.eyebrow}
              </p>
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(2.4rem, 5vw, 4.6rem)',
                  lineHeight: 0.95,
                  fontWeight: 400,
                }}
              >
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
              <Link href={content.advice.ctaHref} className="mt-5 inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                {content.advice.ctaLabel} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.82fr_1.18fr] md:px-10">
            <div className="relative min-h-[360px] overflow-hidden border border-[#14130F]/12">
              <Image src={content.proposal.image} alt={content.proposal.imageAlt} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center py-6">
              <MessageCircle className="mb-7 h-8 w-8" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.8rem)', lineHeight: 0.95, fontWeight: 400 }}>
                {content.proposal.headline}
              </h2>
              <p className="mt-7 max-w-[620px] text-base leading-8 text-[#14130F]/62">
                {content.proposal.body}
              </p>
              <Link href="/devis" className="mt-9 inline-flex w-fit items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                {content.proposal.ctaLabel} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
