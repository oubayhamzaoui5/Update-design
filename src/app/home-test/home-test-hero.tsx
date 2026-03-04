"use client"

import { useEffect, useState } from "react"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"

// public imports
import heroOverlay from "../../../public/hero.png"
import hero1Image from "../../../public/hero1.png"
import hero2Image from "../../../public/hero2.png" 
import hero3Image from "../../../public/hero3.png"
import hero4Image from "../../../public/hero4.png"

type HeroVariant = "hero1" | "hero2" | "hero3" | "hero4"
const slides: HeroVariant[] = ["hero1", "hero2", "hero3", "hero4"]

export default function HomeTestHero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showContent, setShowContent] = useState(false)

  const heroImages: Record<HeroVariant, StaticImageData> = {
    hero1: hero4Image,
    hero2: hero1Image,
    hero3: hero2Image,
    hero4: hero3Image,
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [currentIndex])

  return (
    <section className="relative w-full bg-black overflow-hidden">
      <div className="relative w-full aspect-[16/9] max-h-[90dvh] min-h-[500px] overflow-hidden">
        
        {/* 1. Background Slides - Pure Opacity Fade */}
        {slides.map((slide, index) => (
          <div
            key={slide}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-0" : "opacity-0"
            }`}
          >
            <Image
              src={heroImages[slide]}
              alt={slide}
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom" 
              // Removed all scale and transform classes here
            />
          </div>
        ))}

        {/* 2. Decorative Overlay (hero.png) - Slides up smoothly */}
        <div 
          className={`absolute inset-0 z-10 pointer-events-none transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showContent ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <Image
            src={heroOverlay}
            alt="Update Design Overlay"
            fill
            priority
            className="object-cover object-bottom"
          />
        </div>

        {/* 3. Text Content - Staggered Fade-in */}
        <div className="absolute inset-0 z-20 flex flex-col items-start justify-center bg-gradient-to-r from-black/80 via-black/20 to-transparent px-6 sm:px-12 md:px-24 lg:px-32">
          
          <h1 
            className={`mb-4 text-4xl font-extrabold tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl transition-all duration-1000 delay-300 ${
              showContent ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            Où vos visions <br className="hidden sm:block" /> prennent vie.
          </h1>

          <p 
            className={`hidden max-w-xl text-gray-100 drop-shadow-md md:block md:text-lg transition-all duration-1000 delay-500 ${
              showContent ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            Transformez votre espace avec <strong>Update Design</strong>.
            Découvrez la référence en Tunisie pour des panneaux muraux
            élégants et une décoration d'intérieur moderne.
          </p>

          <div 
            className={`transition-all duration-1000 delay-700 ${
              showContent ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <Link
              href="/boutique"
              className="mt-8 relative isolate inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-accent px-10 text-base font-semibold text-white shadow-xl transition-transform duration-300 before:absolute before:inset-y-0 before:left-[-40%] before:w-[35%] before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-180%] before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-[420%] hover:scale-[1.01] active:scale-95"
            >
              Découvrir la collection
            </Link>
          </div>
        </div>

        {/* 4. Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 transition-all duration-500 rounded-full ${
                index === currentIndex ? "bg-accent w-10" : "bg-white/30 w-4 hover:bg-white/50 cursor-pointer"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
