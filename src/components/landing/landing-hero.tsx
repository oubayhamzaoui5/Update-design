"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { HomepageContent } from "@/types/site-content"

type HeroContent = HomepageContent["hero"]

const DEFAULT: HeroContent = {
  ctaLabel: "Découvrir",
  ctaHref:  "/shop",
  slides: [
    { id: "gazon",        title: "Gazon Artificiel",        image: "/hero/gazon-landscape-new.png" },
    { id: "parasols",     title: "Parasols",                image: "/hero/parasols-landscape-new.png" },
    { id: "panneaux",     title: "Panneaux Muraux",         image: "/hero/panneaux-landscape-new.png" },
    { id: "profile-bois", title: "Profile Mural Bois",      image: "/hero/profile-bois-landscape-new.png" },
    { id: "stores",       title: "Store à Bras Invisibles", image: "/hero/stores-landscape-new.png" },
  ],
}

export default function LandingHero({ content = DEFAULT }: { content?: HeroContent }) {
  const slides = content.slides.length > 0 ? content.slides : DEFAULT.slides
  const [current, setCurrent] = useState(0)

  const total = slides.length
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])
  const goTo = useCallback((index: number) => setCurrent(index), [])

  useEffect(() => {
    const id = setTimeout(next, 5000)
    return () => clearTimeout(id)
  }, [current, next])

  const slide = slides[current] ?? slides[0]

  return (
    <section className="relative aspect-[16/9] w-full overflow-hidden bg-[#111] lg:h-[calc(100vh-64px)] lg:aspect-auto">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={current === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <button type="button" onClick={prev} aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-0.5 text-3xl font-black leading-none text-black transition hover:opacity-80 sm:left-3 sm:text-4xl lg:left-4 lg:p-1 lg:text-5xl">
        <span aria-hidden="true">&#8249;</span>
      </button>

      <button type="button" onClick={next} aria-label="Next slide"
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-0.5 text-3xl font-black leading-none text-black transition hover:opacity-80 sm:right-3 sm:text-4xl lg:right-4 lg:p-1 lg:text-5xl">
        <span aria-hidden="true">&#8250;</span>
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((s, index) => (
          <button key={s.id} type="button" onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`} aria-current={current === index}
            className={`h-2.5 w-2.5 cursor-pointer rounded-full transition ${current === index ? "bg-[var(--accent)]" : "bg-zinc-700/50 hover:bg-zinc-600/50"}`}
          />
        ))}
      </div>
    </section>
  )
}
