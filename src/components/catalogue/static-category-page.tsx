import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Layers, PackageSearch, Ruler, Sparkles } from 'lucide-react'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'

export type StaticCatalogueProduct = {
  code: string
  name: string
  note?: string
  image?: string
  variants?: string[]
}

export type StaticCatalogueAccessory = {
  name: string
  text: string
  image: string
  tag?: string
}

export type StaticCatalogueFeature = {
  title: string
  text: string
}

type StaticCataloguePageProps = {
  eyebrow: string
  title: string
  italic: string
  intro: string
  image: string
  imageAlt: string
  productImage: string
  productImageAlt: string
  stats: Array<{ value: string; label: string }>
  models?: StaticCatalogueProduct[]
  products: StaticCatalogueProduct[]
  accessories: StaticCatalogueAccessory[]
  accessoryProducts?: StaticCatalogueProduct[]
  features: StaticCatalogueFeature[]
  application: string[]
}

export default function StaticCataloguePage({
  eyebrow,
  title,
  italic,
  intro,
  image,
  imageAlt,
  productImage,
  productImageAlt,
  stats,
  models,
  products,
  accessories,
  accessoryProducts = [],
  features,
  application,
}: StaticCataloguePageProps) {
  const visibleModels = models ?? products.slice(0, Math.min(3, products.length))

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
          <div className="relative mx-auto grid min-h-[76vh] max-w-[1500px] gap-12 px-6 py-20 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:py-28">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.34em]" style={{ color: GOLD }}>
                {eyebrow}
              </p>
              <h1
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(3.2rem, 8vw, 7.2rem)',
                  lineHeight: 0.86,
                  fontWeight: 400,
                }}
              >
                {title}
                <br />
                <em style={{ color: 'rgba(247,242,232,0.52)', fontStyle: 'italic' }}>{italic}</em>
              </h1>
              <p className="mt-8 max-w-[640px] text-base leading-8 text-white/64">{intro}</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#modeles"
                  className="inline-flex items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
                  style={{ background: GOLD }}
                >
                  Voir les references <ArrowRight size={14} />
                </Link>
                <Link
                  href="/devis"
                  className="inline-flex items-center justify-center gap-3 border border-white/20 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/10"
                >
                  Demander un devis
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative min-h-[340px] overflow-hidden border border-[#C4A23E]/18 bg-black/20 md:min-h-[470px]">
                <Image src={image} alt={imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,19,15,0.56),transparent_62%)]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="border border-[#C4A23E]/18 p-5">
                    <p style={{ fontFamily: DISPLAY }} className="text-4xl leading-none">
                      {item.value}
                    </p>
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="py-12 md:py-20" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((item) => (
                <article key={item.title} className="group border border-[#14130F]/10 bg-[#FCFCFD] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                  <Sparkles className="mb-8 h-5 w-5 transition duration-300 group-hover:scale-110" style={{ color: GOLD }} />
                  <h2 className="text-lg font-black tracking-[0.08em]">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#14130F]/58">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="modeles" className="py-10 md:py-14">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-8 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Modeles</p>
              <div className="h-px flex-1 bg-[#14130F]/24" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">
                Choix de base
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleModels.map((model) => (
                <article key={`model-${model.code}-${model.name}`} className="overflow-hidden border border-[#14130F]/10 bg-[#FCFCFD] transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                  <div className="relative aspect-[16/8] overflow-hidden bg-white">
                    <Image
                      src={model.image ?? productImage}
                      alt={`${model.name} - ${productImageAlt}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 hover:scale-[1.045]"
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
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Modele</p>
                        <h3 className="mt-3 text-lg font-black tracking-[0.08em]">{model.name}</h3>
                      </div>
                      <Ruler className="h-4 w-4" style={{ color: GOLD }} />
                    </div>
                    <p className="mt-2 text-sm text-[#14130F]/58">{model.note ?? `Ref. ${model.code}`}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="catalogue" className="py-10 md:py-14">
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-8 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Textures</p>
              <div className="h-px flex-1 bg-[#14130F]/24" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">
                {products.length} texture{products.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <article key={`${product.code}-${product.name}-${index}`} className="group overflow-hidden border border-[#14130F]/10 bg-[#FCFCFD] transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-white">
                    <Image
                      src={product.image ?? productImage}
                      alt={`${product.name} - ${productImageAlt}`}
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
                    className="flex min-h-[218px] flex-col justify-between border-t border-[#14130F]/10 p-5"
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
                      {product.variants && product.variants.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {product.variants.map((variant) => (
                            <span key={variant} className="border border-[#14130F]/14 bg-white/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#14130F]/58">
                              {variant}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#14130F]/42">
                      {product.note ?? 'Catalogue statique'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" style={{ background: PAPER }}>
          <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:px-10">
            <div>
              <Layers className="mb-7 h-7 w-7" style={{ color: GOLD }} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.4rem)', lineHeight: 0.95, fontWeight: 400 }}>
                Usages
                <br />
                <em style={{ color: 'rgba(20,19,15,0.48)' }}>et preparation.</em>
              </h2>
            </div>
            <div className="grid gap-4">
              {application.map((item) => (
                <div key={item} className="flex gap-4 border-b border-[#C4A23E]/20 pb-5 text-sm font-semibold leading-7 text-[#14130F]/66">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {item}
                </div>
              ))}
              <Link href="/devis" className="mt-5 inline-flex w-fit items-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                Demander un devis <Ruler size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12" style={{ background: PAPER }}>
          <div className="mx-auto max-w-[1500px] px-6 md:px-10">
            <div className="mb-7 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Accessoires</p>
              <div className="h-px flex-1 bg-[#14130F]/30" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#14130F]/52">
                {accessoryProducts.length > 0 ? `${accessoryProducts.length} references` : 'Par categorie'}
              </p>
            </div>

            {accessoryProducts.length > 0 && (
              <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {accessoryProducts.map((product, index) => (
                  <article key={`${product.code}-${product.name}-${index}`} className="group overflow-hidden border border-[#14130F]/10 bg-[#FCFCFD] transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:shadow-[0_18px_45px_rgba(20,19,15,0.12)]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-white">
                      <Image
                        src={product.image ?? productImage}
                        alt={`${product.name} - accessoire`}
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
                      className="flex min-h-[178px] flex-col justify-between border-t border-[#14130F]/10 p-5"
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
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {accessories.map((item) => (
                <article key={item.name} className="group cursor-pointer border border-[#14130F]/12 bg-[#F7F2E8] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/50 hover:shadow-[0_14px_34px_rgba(20,19,15,0.12)]">
                  <div className="relative aspect-square overflow-hidden border border-[#14130F]/10 bg-white">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                    {item.tag && (
                      <p className="absolute left-3 top-3 bg-black/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        {item.tag}
                      </p>
                    )}
                  </div>
                  <div className="px-2 py-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#14130F]">{item.name}</h3>
                      <PackageSearch className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
                    </div>
                    <p className="text-sm leading-6 text-[#14130F]/58">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
