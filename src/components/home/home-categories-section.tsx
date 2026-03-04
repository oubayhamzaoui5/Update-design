'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image, { type StaticImageData } from 'next/image'
import { motion } from 'framer-motion'

type RoomCategory = {
  name: string
  image: string | StaticImageData
  href: string
  spanTwoColumns?: boolean
}

type HomeCategoriesSectionProps = {
  categories: RoomCategory[]
}

// 1. Parent variants to coordinate the children stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Time between each card starting
      delayChildren: 0.1,    // Initial delay before first card
    },
  },
}

// 2. Specific direction variants based on your requirements
const childVariants = [
  { hidden: { opacity: 0, y: -60 }, visible: { opacity: 1, y: 0 } }, // C1: Top to Bottom
  { hidden: { opacity: 0, x: 60 },  visible: { opacity: 1, x: 0 } }, // C2: Right to Left
  { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } }, // C3: Left to Right
  { hidden: { opacity: 0, y: 60 },  visible: { opacity: 1, y: 0 } }, // C4: Bottom to Top
]

export default function HomeCategoriesSection({ categories }: HomeCategoriesSectionProps) {
  const visibleCategories = categories.slice(0, 4)
  const firstRowCategories = visibleCategories.slice(0, 2)
  const secondRowCategories = visibleCategories.slice(2, 4).reverse()
  const secondRowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const row = secondRowRef.current
    if (!row) return

    const scrollToRight = () => {
      row.scrollLeft = row.scrollWidth - row.clientWidth
    }

    scrollToRight()
    window.addEventListener('resize', scrollToRight)
    return () => window.removeEventListener('resize', scrollToRight)
  }, [secondRowCategories.length])

  return (
    <section id="home-categories" className="mx-auto max-w-7xl px-4 py-10 md:px-2 md:py-16 lg:py-18">
      {/* Header Section */}
      <div className="mb-4 flex items-end justify-between md:mb-12">
        <div>
          <h2 className="mb-2 text-2xl font-bold md:text-3xl">Explorer nos categories</h2>
          <p className="text-sm text-slate-500 md:text-base">
            Des solutions lumineuses pensees pour chaque espace de votre maison.
          </p>
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

      {/* Desktop Grid (Animated Chain Reaction) */}
      <motion.div
        className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {visibleCategories.map((item, index) => (
          <motion.div
            key={`desktop-${item.name}`}
            variants={childVariants[index]}
            transition={{
              duration: 0.8,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
          >
            <Link
              className="group relative block overflow-hidden rounded-xl aspect-[16/9]"
              href={item.href}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold tracking-wide text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                  {item.name}
                </h3>
                <span className="inline-block translate-y-1 text-sm font-semibold text-[#c19a2f] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:translate-x-1">
                  Explorer -&gt;
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile View (Horizontal Scroll) */}
      <div className="space-y-4 md:hidden">
        {/* Mobile Row 1 */}
        <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {firstRowCategories.map((item) => (
            <div key={`mobile-row-1-${item.name}`} className="w-[85%] max-w-none flex-none snap-start">
              <Link
                className="group relative block overflow-hidden rounded-xl aspect-[16/9]"
                href={item.href}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="85vw"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-sm font-bold tracking-wide text-white">
                    {item.name}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile Row 2 */}
        <div ref={secondRowRef} className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {secondRowCategories.map((item) => (
            <div key={`mobile-row-2-${item.name}`} className="w-[85%] max-w-none flex-none snap-start">
              <Link
                className="group relative block overflow-hidden rounded-xl aspect-[16/9]"
                href={item.href}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="85vw"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-sm font-bold tracking-wide text-white">
                    {item.name}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
