import Link from 'next/link'
import Image from 'next/image'

type RoomCategory = {
  name: string
  image: string
  href: string
  spanTwoColumns?: boolean
}

type HomeCategoriesSectionProps = {
  categories: RoomCategory[]
}

export default function HomeCategoriesSection({ categories }: HomeCategoriesSectionProps) {
  const firstRowCategories = categories.slice(0, 2)
  const secondRowCategories = categories.slice(2)

  return (
    <section id="home-categories" className="mx-auto max-w-7xl px-4 py-14 md:px-2 md:py-18">
      <div className="mb-4 flex items-end justify-between md:mb-12">
        <div>
          <h2 className="mb-2 text-2xl font-bold md:text-3xl">Explorer nos categories</h2>
          <p className="text-sm text-slate-500 md:text-base">Des solutions lumineuses pensees pour chaque espace de votre maison.</p>
          <Link
            href="/boutique"
            className="mt-3 mb-0 inline-block border-b-2 border-[#c19a2f]/40 pb-1 font-bold text-[#c19a2f] transition-all duration-300 hover:border-[#c19a2f] hover:-translate-y-0.5 md:hidden"
          >
            Explorer tous les categories
          </Link>
        </div>
        <Link
          href="/boutique"
          className="hidden border-b-2 border-[#c19a2f]/20 pb-1 font-bold text-[#c19a2f] transition-all duration-300 hover:border-[#c19a2f] hover:-translate-y-0.5 md:inline-block"
        >
          Explorer tous les categories
        </Link>
      </div>

      <div className="space-y-4 md:hidden">
        <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {firstRowCategories.map((item) => (
            <div key={`mobile-row-1-${item.name}`} className="w-[85%] max-w-none flex-none snap-start">
              <Link
                className={`group relative block overflow-hidden rounded-xl ${item.spanTwoColumns ? 'aspect-[2/1]' : 'aspect-square'}`}
                href={item.href}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="85vw"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-sm font-bold tracking-wide text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                    {item.name}
                  </h3>
           
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {secondRowCategories.map((item) => (
            <div key={`mobile-row-2-${item.name}`} className="w-[45%] max-w-none flex-none snap-start">
              <Link
                className={`group relative block overflow-hidden rounded-xl ${item.spanTwoColumns ? 'aspect-[2/1]' : 'aspect-square'}`}
                href={item.href}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="45vw"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-sm font-bold tracking-wide text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                    {item.name}
                  </h3>
             
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
        {categories.map((item) => (
          <div key={item.name} className={item.spanTwoColumns ? 'md:col-span-2 lg:col-span-2' : undefined}>
            <Link
              className={`group relative block overflow-hidden rounded-xl ${item.spanTwoColumns ? 'aspect-[2/1]' : 'aspect-square'}`}
              href={item.href}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes={item.spanTwoColumns ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw'}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold tracking-wide text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                  {item.name}
                </h3>
                <span className="inline-block text-sm font-semibold text-[#c19a2f] transition-transform duration-300 group-hover:translate-x-1">
                  Explorer -&gt;
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
