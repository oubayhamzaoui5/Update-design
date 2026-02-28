"use client"

import { Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const atmospheriqueFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['900'],
  style: ['italic'],
})
const HERO_IMAGES = ['hero1.webp', 'hero2.webp', 'hero3.webp', 'hero4.webp', 'hero5.webp', 'hero6.webp']

export default function Hero() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <section className="relative flex h-[50vh] lg:h-screen flex-col items-stretch pt-24 lg:flex-row">
      <div className="relative z-10 flex flex-1 flex-col justify-start bg-transparent px-4 pb-3 pt-0 lg:h-screen lg:min-h-0 lg:flex-[1.1] lg:px-24 lg:py-16">
       <div className="mx-auto max-w-xl pt-24 lg:pt-8 text-center text-white lg:mx-0 lg:text-left">
  <span className="mb-0 lg:mb-2 block text-sm lg:text-base font-bold uppercase tracking-[0.3em]">
    Collection 2026
  </span>

  <h1 className="mb-6 lg:mb-2 text-4xl font-extrabold leading-[1.1] lg:text-7xl">
    Élégance
    <span>
      <span> pour {' '} <br /><span> votre intérieur</span></span>{' '}
      <span
        className="relative lg:-top-2 inline-block text-[1.12em] tracking-wide"
      >
        raffiné
      </span>
    </span>
  </h1>

  <p className="mb-4 hidden text-lg font-semibold leading-relaxed lg:block">
    Découvrez notre univers de décoration d’intérieur en Tunisie : profilés muraux décoratifs, panneaux muraux en PVC, panneaux en MDF et solutions modernes pour sublimer votre salon, chambre, cuisine et même salle de bain avec style et caractère.
  </p>

  <div className="flex flex-row items-center justify-center gap-3 lg:justify-start">
    <Link
      href="/boutique"
      className="relative isolate cursor-pointer overflow-hidden rounded-lg bg-[#c19a2f] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-white transition-transform duration-300 before:absolute before:inset-y-0 before:left-[-40%] before:w-[35%] before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-180%] before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-[420%] hover:scale-[1.01] active:scale-95 lg:px-6 lg:text-sm lg:tracking-widest"
    >
      Découvrir nos collections
    </Link>
    <Link
      href="#home-categories"
      className="relative cursor-pointer px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 lg:px-6 lg:text-sm lg:tracking-widest after:absolute after:bottom-2 after:left-4 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100"
    >
      Explorer nos catégories
    </Link>
  </div>
</div>
      </div>

      {/* Hero background image slider */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <div className="relative h-full w-full">
          {HERO_IMAGES.map((image, index) => (
            <img
              key={image}
              src={`/${image}`}
              alt=""
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      </div>
    </section>
  )
}

