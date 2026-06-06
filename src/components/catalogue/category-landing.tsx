import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, Check, MessageCircle, MoveUpRight, Ruler } from 'lucide-react'

import type { ProductListItem } from '@/lib/services/product.service'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const INK = '#25231C'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'

type CatalogueProduct = Pick<
  ProductListItem,
  'id' | 'slug' | 'sku' | 'name' | 'description' | 'imageUrls' | 'currency' | 'price' | 'promoPrice'
>

type CatalogueLandingProps = {
  eyebrow: string
  title: string
  italic: string
  intro: string
  heroImage: string
  heroAlt: string
  products: CatalogueProduct[]
  productFallbackImage: string
  staticModels?: Array<{ ref: string; src: string }>
  accessories?: {
    types?: Array<{ type: string; src: string }>
    typesLabel?: string
    colorsITU?: Array<{ name: string; src: string }>
    colorsL: Array<{ name: string; src: string }>
    colorsLLabel?: string
  }
  interactiveCatalog?: ReactNode
  uses: string[]
  benefits: string[]
  materialNotes: Array<{ label: string; value: string }>
  cta: {
    title: string
    text: string
    href: string
    label: string
  }
}

function formatPrice(product: CatalogueProduct) {
  const price = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price
  if (!price || price <= 0) return 'Sur devis'
  return `${price.toFixed(2)} ${product.currency || 'DT'}`
}

export default function CategoryLanding({
  eyebrow,
  title,
  italic,
  intro,
  heroImage,
  heroAlt,
  products,
  productFallbackImage,
  staticModels,
  accessories,
  interactiveCatalog,
  uses,
  benefits,
  materialNotes,
  cta,
}: CatalogueLandingProps) {
  const featured = products.slice(0, 8)

  return (
    <main style={{ fontFamily: BODY, background: CREAM, color: INK }}>
      <header className="relative overflow-hidden" style={{ background: DARK }}>
        <div className="mx-auto grid min-h-[92vh] max-w-[1500px] grid-cols-1 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative z-10 flex flex-col justify-end px-6 pb-12 pt-24 md:px-10 lg:pb-20 lg:pt-32">
            <div className="mb-10 h-px w-28" style={{ background: GOLD }} />
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              {eyebrow}
            </p>
            <h1
              style={{
                fontFamily: DISPLAY,
                fontSize: 'clamp(3.2rem, 8vw, 7.4rem)',
                lineHeight: 0.86,
                fontWeight: 400,
                color: CREAM,
              }}
            >
              {title}
              <br />
              <em style={{ color: 'rgba(247,242,232,0.55)', fontStyle: 'italic' }}>{italic}</em>
            </h1>
            <p className="mt-8 max-w-[560px] text-base leading-8 text-white/64">{intro}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#catalogue" className="inline-flex items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                Voir la selection <ArrowRight size={14} />
              </Link>
              <Link href={cta.href} className="inline-flex items-center justify-center gap-3 border border-white/20 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/10">
                Demander un devis
              </Link>
            </div>
          </div>

          <div className="relative min-h-[48vh] lg:min-h-[92vh]">
            <Image src={heroImage} alt={heroAlt} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,19,15,0.84)_0%,rgba(20,19,15,0.28)_35%,rgba(20,19,15,0.1)_100%)] lg:bg-[linear-gradient(90deg,rgba(20,19,15,0.9)_0%,rgba(20,19,15,0.18)_30%,rgba(20,19,15,0)_100%)]" />
            <div className="absolute bottom-6 right-6 hidden max-w-[300px] border border-white/20 bg-black/30 p-5 text-white backdrop-blur-md md:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Projet</p>
              <p className="mt-3 text-sm leading-6 text-white/72">Selection, quantitatif et devis selon surface, exposition et finition souhaitee.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-14 md:py-20" style={{ background: PAPER }}>
        <div className="mx-auto grid max-w-[1500px] gap-px px-6 md:grid-cols-4 md:px-10">
          {uses.map((use, index) => (
            <article key={use} className="bg-[#F7F2E8] p-6 md:p-7">
              <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
                0{index + 1}
              </p>
              <p className="text-[15px] font-semibold leading-7 text-[#25231C]/70">{use}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="catalogue" className="py-16 md:py-24">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <div className="mb-12 grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-end">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                Catalogue vivant
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.6rem)', lineHeight: 0.95, fontWeight: 400 }}>
                Pas un panier.
                <br />
                <em style={{ color: 'rgba(37,35,28,0.5)' }}>Une selection projet.</em>
              </h2>
            </div>
            <p className="max-w-[620px] text-base leading-8 text-[#25231C]/62">
              Les produits ci-dessous servent de base de choix. Pour les chantiers, les quantites et les teintes sont confirmees avec l equipe selon stock, surface et rendu attendu.
            </p>
          </div>

          {interactiveCatalog ? (
            interactiveCatalog
          ) : staticModels ? (
            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {staticModels.map((m, index) => (
                <article key={m.ref} className="group">
                  <div className="relative aspect-square overflow-hidden bg-[#D8CCB7]">
                    <Image
                      src={m.src}
                      alt={`Panneau PVC effet marbre ${m.ref}`}
                      fill
                      sizes="(max-width:640px) 33vw,(max-width:1024px) 20vw,14vw"
                      priority={index < 6}
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>{m.ref}</p>
                  <p className="text-[12px] leading-5 text-[#25231C]/50">Panneau PVC effet marbre</p>
                </article>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, index) => (
                <Link key={product.id} href={`/produit/${product.slug}`} className="group block">
                  <article>
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#D8CCB7]">
                      <Image
                        src={product.imageUrls[0] || productFallbackImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority={index < 4}
                        className="object-cover transition duration-700 group-hover:scale-[1.045]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,19,15,0.55),transparent_52%)] opacity-80" />
                      <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                        Details <MoveUpRight size={12} />
                      </span>
                    </div>
                    <div className="pt-5">
                      <h3 className="line-clamp-2 text-[15px] font-bold leading-6">{product.name}</h3>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#25231C]/40">
                        {product.sku ? `Ref. ${product.sku}` : 'Reference catalogue'}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-[#C4A23E]/20 pt-4">
                        <span className="text-sm font-bold" style={{ color: GOLD }}>{formatPrice(product)}</span>
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" style={{ color: GOLD }} />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid overflow-hidden md:grid-cols-[0.9fr_1.1fr]" style={{ background: DARK }}>
              <div className="relative min-h-[360px]">
                <Image src={productFallbackImage} alt="Catalogue Update Design" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center p-8 text-white md:p-12">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Sur demande</p>
                <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1, fontWeight: 400 }}>
                  Catalogue complet disponible en showroom.
                </h3>
                <p className="mt-6 max-w-[560px] text-sm leading-8 text-white/62">
                  Cette gamme depend des arrivages, dimensions et finitions. Contactez Update Design pour recevoir les modeles a jour et les prix volume.
                </p>
                <Link href="/contact" className="mt-8 inline-flex w-fit items-center gap-3 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: GOLD }}>
                  Recevoir le catalogue <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {accessories && !interactiveCatalog && (
            <div className="mt-16 border-t border-[#C4A23E]/20 pt-14">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Profils de finition</p>
              <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem,3.5vw,3rem)', lineHeight: 0.95, fontWeight: 400 }}>
                Accessoires assortis
                <br />
                <em style={{ color: 'rgba(37,35,28,0.45)', fontStyle: 'italic' }}>Profils et textures.</em>
              </h3>

              {accessories.types && accessories.types.length > 0 && (
                <div className="mt-10">
                  <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
                    {accessories.typesLabel ?? 'Type I · T · U'}
                  </p>
                  <div className="grid gap-5 md:grid-cols-3">
                    {accessories.types.map((t) => (
                      <article key={t.type} className="overflow-hidden border border-[#C4A23E]/20">
                        <div className="relative aspect-[4/3] bg-white">
                          <Image src={t.src} alt={`Profil ${t.type}`} fill sizes="(max-width:768px) 100vw,33vw" className="object-contain p-4" />
                        </div>
                        <div className="p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>{t.type}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {accessories.colorsITU && accessories.colorsITU.length > 0 && (
                <div className="mt-7">
                  <div className="flex flex-wrap gap-4">
                    {accessories.colorsITU.map((c) => (
                      <div key={c.name} className="flex flex-col items-center gap-2">
                        <div className="relative h-14 w-14 overflow-hidden border border-[#C4A23E]/25">
                          <Image src={c.src} alt={c.name} fill className="object-cover" sizes="56px" />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#25231C]/50">{c.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
                  {accessories.colorsLLabel ?? 'Type L — 25 mm · 30 mm'}
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {accessories.colorsL.map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-3">
                      <div className="relative aspect-square w-full overflow-hidden border border-[#C4A23E]/25">
                        <Image src={c.src} alt={c.name} fill className="object-cover" sizes="(max-width:640px) 33vw,16vw" />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#25231C]/50">{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24" style={{ background: DARK, color: CREAM }}>
        <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[1.1fr_0.9fr] md:px-10">
          <div>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Pourquoi cette gamme</p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.8rem)', lineHeight: 0.95, fontWeight: 400 }}>
              Le bon materiau
              <br />
              <em style={{ color: 'rgba(247,242,232,0.48)' }}>change la perception du lieu.</em>
            </h2>
          </div>
          <ul className="grid gap-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-4 border-b border-[#C4A23E]/15 pb-5 text-sm leading-7 text-white/65">
                <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-14 grid max-w-[1500px] gap-px px-6 md:grid-cols-3 md:px-10">
          {materialNotes.map((note) => (
            <article key={note.label} className="border border-[#C4A23E]/15 p-7">
              <Ruler className="mb-6 h-5 w-5" style={{ color: GOLD }} />
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>{note.label}</p>
              <p className="text-sm leading-7 text-white/62">{note.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: PAPER }}>
        <div className="absolute left-0 top-0 hidden h-full w-[34vw] bg-[#D2C0A0] md:block" />
        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.82fr_1.18fr] md:px-10">
          <div className="relative min-h-[360px] overflow-hidden">
            <Image src={heroImage} alt={heroAlt} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center py-6">
            <MessageCircle className="mb-7 h-8 w-8" style={{ color: GOLD }} />
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.8rem)', lineHeight: 0.95, fontWeight: 400 }}>
              {cta.title}
            </h2>
            <p className="mt-7 max-w-[620px] text-base leading-8 text-[#25231C]/62">{cta.text}</p>
            <Link href={cta.href} className="mt-9 inline-flex w-fit items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
              {cta.label} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
