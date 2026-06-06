import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, FileText, MessageCircle, MoveUpRight } from 'lucide-react'
import { QuoteButton } from '@/components/catalogue/quote-cart'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'

type LeadShowcasePageProps = {
  eyebrow: string
  title: string
  italic: string
  intro: string
  heroImage: string
  heroAlt: string
  ctaHref: string
  ctaLabel: string
  models: Array<{ name: string; text: string; image: string; tag?: string }>
  proof: string[]
  steps: string[]
  formTitle: string
  formText: string
  secondaryImage: string
  secondaryAlt: string
  quoteCategory?: string
}

export default function LeadShowcasePage({
  eyebrow,
  title,
  italic,
  intro,
  heroImage,
  heroAlt,
  ctaHref,
  ctaLabel,
  models,
  proof,
  steps,
  formTitle,
  formText,
  secondaryImage,
  secondaryAlt,
  quoteCategory = title,
}: LeadShowcasePageProps) {
  return (
    <main style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <header className="relative min-h-[94vh] overflow-hidden" style={{ background: DARK }}>
        <Image src={heroImage} alt={heroAlt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,19,15,0.92)_0%,rgba(20,19,15,0.66)_42%,rgba(20,19,15,0.16)_100%)]" />
        <div className="relative mx-auto flex min-h-[94vh] max-w-[1500px] flex-col justify-end px-6 pb-14 md:px-10 md:pb-20">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
            {eyebrow}
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3.4rem, 8vw, 7.6rem)', lineHeight: 0.86, fontWeight: 400, color: CREAM }}>
            {title}
            <br />
            <em style={{ color: 'rgba(247,242,232,0.58)', fontStyle: 'italic' }}>{italic}</em>
          </h1>
          <p className="mt-8 max-w-[610px] text-base leading-8 text-white/66 md:text-lg">{intro}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={ctaHref} className="inline-flex items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
              {ctaLabel} <ArrowRight size={14} />
            </Link>
            <Link href="#modeles" className="inline-flex items-center justify-center gap-3 border border-white/22 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/10">
              Voir les options
            </Link>
          </div>
        </div>
      </header>

      <section className="py-12" style={{ background: DARK }}>
        <div className="mx-auto grid max-w-[1500px] gap-px px-6 md:grid-cols-4 md:px-10">
          {proof.map((item, index) => (
            <div key={item} className="border border-[#C4A23E]/15 p-6 text-white">
              <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>0{index + 1}</p>
              <p className="text-sm font-semibold leading-7 text-white/68">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modeles" className="py-16 md:py-24" style={{ background: PAPER }}>
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <div className="mb-12 max-w-[760px]">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Selection
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 5vw, 4.8rem)', lineHeight: 0.95, fontWeight: 400 }}>
              Des options claires,
              <br />
              <em style={{ color: 'rgba(20,19,15,0.5)' }}>un devis sur mesure.</em>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {models.map((model) => (
              <article key={model.name} className="group bg-[#F7F2E8]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#D5C6AD]">
                  <Image src={model.image} alt={model.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.045]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,19,15,0.62),transparent_58%)]" />
                  {model.tag && <p className="absolute left-4 top-4 bg-black/30 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">{model.tag}</p>}
                  <MoveUpRight className="absolute bottom-4 right-4 h-5 w-5 text-white/80" />
                </div>
                <div className="border-x border-b border-[#C4A23E]/20 p-5">
                  <h3 style={{ fontFamily: DISPLAY }} className="text-3xl leading-none">{model.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#14130F]/60">{model.text}</p>
                  <div className="mt-5">
                    <QuoteButton
                      item={{
                        id: `${quoteCategory}-modele-${model.name}`,
                        category: quoteCategory,
                        type: 'Modele',
                        name: model.name,
                        ref: model.tag,
                        image: model.image,
                      }}
                      compact
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-6 md:grid-cols-[0.92fr_1.08fr] md:px-10">
          <div className="relative min-h-[420px] overflow-hidden">
            <Image src={secondaryImage} alt={secondaryAlt} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <FileText className="mb-7 h-8 w-8" style={{ color: GOLD }} />
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 0.95, fontWeight: 400 }}>
              Le formulaire sert
              <br />
              <em style={{ color: 'rgba(20,19,15,0.48)' }}>a cadrer le projet.</em>
            </h2>
            <p className="mt-7 max-w-[620px] text-base leading-8 text-[#14130F]/62">{formText}</p>
            <div className="mt-8 grid gap-3">
              {steps.map((step) => (
                <div key={step} className="flex gap-4 border-b border-[#C4A23E]/20 pb-4 text-sm font-semibold leading-7 text-[#14130F]/66">
                  <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  {step}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={ctaHref} className="inline-flex w-fit items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                {ctaLabel} <ArrowRight size={14} />
              </Link>
              <Link href="/devis" className="inline-flex w-fit items-center gap-3 border border-[#14130F]/16 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#14130F]">
                Voir le devis <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 text-center md:py-28" style={{ background: DARK, color: CREAM }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(90deg,#C4A23E 1px,transparent 1px),linear-gradient(#C4A23E 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative mx-auto max-w-[900px] px-6 md:px-10">
          <MessageCircle className="mx-auto mb-7 h-8 w-8" style={{ color: GOLD }} />
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Devis rapide</p>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.6rem, 6vw, 5rem)', lineHeight: 0.94, fontWeight: 400 }}>
            {formTitle}
          </h2>
          <Link href={ctaHref} className="mt-9 inline-flex items-center justify-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
            {ctaLabel} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
