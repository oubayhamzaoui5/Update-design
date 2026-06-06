"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

type UniverseCategory = {
  title: string
  href: string
  image: string
  grid: {
    gridColumn: string
    gridRow: string
  }
  featured?: boolean
}

type UniverseCategoriesRevealProps = {
  universes: UniverseCategory[]
  displayFont: string
  gold: string
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const headingVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 34, scale: 0.97, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.82, ease: EASE_OUT },
  },
}

function CategoryCard({
  item,
  displayFont,
  sizes,
  desktop = false,
}: {
  item: UniverseCategory
  displayFont: string
  sizes: string
  desktop?: boolean
}) {
  return (
    <motion.div variants={cardVariants} style={desktop ? item.grid : undefined}>
      <Link
        href={item.href}
        className={`group relative block overflow-hidden bg-[#1C1A14] shadow-[0_16px_34px_rgba(28,26,20,0.15)] transition duration-500 ${
          desktop ? "h-full hover:-translate-y-0.5" : "h-[240px] active:scale-[0.99]"
        }`}
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes={sizes}
          className="object-cover opacity-[0.82] contrast-[1.08] saturate-[0.72] transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100 group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(28,26,20,0.76),rgba(28,26,20,0.12)_58%,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3
            style={{
              fontFamily: displayFont,
              fontSize: desktop && item.featured ? "2.2rem" : desktop ? "1.5rem" : "1.6rem",
              lineHeight: 1,
            }}
            className="text-white"
          >
            {item.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}

export function UniverseCategoriesReveal({ universes, displayFont, gold }: UniverseCategoriesRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      variants={containerVariants}
    >
      <motion.div className="mb-8 flex items-center gap-4 md:mb-10" variants={headingVariants}>
        <p className="text-[11px] font-bold uppercase tracking-[0.32em]" style={{ color: gold }}>
          Nos categories
        </p>
        <span className="h-px flex-1" style={{ background: gold }} />
      </motion.div>

      <motion.div className="flex flex-col gap-3 md:hidden" variants={containerVariants}>
        {universes.map((item) => (
          <CategoryCard key={item.href} item={item} displayFont={displayFont} sizes="100vw" />
        ))}
      </motion.div>

      <motion.div
        className="hidden gap-3 md:grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 260px)" }}
        variants={containerVariants}
      >
        {universes.map((item) => (
          <CategoryCard
            key={item.href}
            item={item}
            displayFont={displayFont}
            sizes="(max-width: 1024px) 50vw, 33vw"
            desktop
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
