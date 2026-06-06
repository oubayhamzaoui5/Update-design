import Image from 'next/image'
import Link from 'next/link'

type CategoryItem = {
  id: string
  name: string
  href: string
  image: string
  description: string
}

export default function CategorySection({ items }: { items: CategoryItem[] }) {
  const [featured, ...rest] = items

  return (
    <section aria-labelledby="categories-heading" className="mx-auto max-w-[1280px] px-4 py-12 md:py-20">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-foreground/10 pb-6">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground/40">Collections</p>
          <h2 id="categories-heading" className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Nos Catégories
          </h2>
        </div>
        <Link
          href="/boutique"
          className="group flex items-center gap-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
        >
          Tout voir
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Grid: featured large + stacked small */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Featured card */}
        {featured && (
          <Link href={featured.href} className="group relative block overflow-hidden rounded-xl bg-foreground/[0.03]">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={featured.image}
                alt={featured.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
            <div className="flex items-end justify-between px-5 py-4">
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                  01
                </span>
                <p className="font-serif text-xl font-semibold tracking-tight">{featured.name}</p>
                <p className="mt-0.5 text-sm text-foreground/55">{featured.description}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-foreground/40 transition-all duration-200 group-hover:border-foreground/40 group-hover:text-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>
        )}

        {/* Stacked secondary cards */}
        <div className="flex flex-col gap-4">
          {rest.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative flex flex-1 overflow-hidden rounded-xl bg-foreground/[0.03]"
            >
              <div className="relative w-[38%] shrink-0 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 38vw, 25vw"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between px-5 py-4">
                <div>
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                    0{idx + 2}
                  </span>
                  <p className="font-serif text-lg font-semibold tracking-tight">{item.name}</p>
                  <p className="mt-0.5 text-sm text-foreground/55">{item.description}</p>
                </div>
                <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-foreground/40 transition-all duration-200 group-hover:border-foreground/40 group-hover:text-foreground">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
