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
  const [loadedCount, setLoadedCount] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const heroImages: Record<HeroVariant, StaticImageData> = {
    hero1: hero4Image,
    hero2: hero1Image,
    hero3: hero2Image,
    hero4: hero3Image,
  }

  // Handle image load tracking
  const handleImageLoad = () => {
    setLoadedCount((prev) => prev + 1)
  }

  // Once all images (4 slides + 1 overlay) are loaded, start the entrance
  useEffect(() => {
    if (loadedCount >= slides.length + 1) {
      setIsReady(true)
      // Small delay before starting text animations for a smoother feel
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    }
  }, [loadedCount])

  // Slide interval logic (only starts once ready)
  useEffect(() => {
    if (!isReady) return

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [currentIndex, isReady])

  return (
    <section className="relative w-full bg-white overflow-hidden transition-colors duration-500">
      
      {/* 1. Spinner Overlay - Visible until images load */}
      {!isReady && (
       <div className={`fixed inset-0 z-[1000] flex items-center justify-center bg-white transition-opacity duration-500 ${isReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
  <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
</div>
      )}

      <div className="relative w-full aspect-[16/9] max-h-[90dvh] min-h-[36dvh] overflow-hidden md:aspect-auto md:min-h-0 md:h-[calc(100dvh-var(--navbar-offset-desktop,72px))] md:max-h-[calc(100dvh-var(--navbar-offset-desktop,72px))]">
        
        {/* 2. Background Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex && isReady ? "opacity-100 z-0" : "opacity-0"
            }`}
          >
            <Image
              src={heroImages[slide]}
              alt={slide}
              fill
              priority
              sizes="100vw"
              onLoad={handleImageLoad}
              className="object-cover object-bottom" 
            />
          </div>
        ))}

        {/* 3. Decorative Overlay (hero.png) */}
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
            onLoad={handleImageLoad}
            className="object-cover object-bottom"
          />
        </div>

        {/* 4. Text Content - Staggered Fade-in */}
        <div className="absolute inset-0 z-20 flex flex-col items-start justify-start bg-gradient-to-r from-black/80 via-black/20 to-transparent px-4 pt-10 sm:px-8 sm:pt-18 md:justify-center md:px-24 md:pt-0 lg:px-32">
          
          <h1 
            className={`mb-1 text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl sm:text-4xl md:mb-4 md:text-5xl lg:text-6xl transition-all duration-1000 delay-300 ${
              showContent ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            Où vos visions <br /> prennent vie.
          </h1>

          <p 
            className={`hidden max-w-xl text-gray-100 drop-shadow-md md:block md:text-lg transition-all duration-1000 delay-500 ${
              showContent ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            Transformez votre espace avec <strong>Update Design</strong>.
            Découvrez la référence en Tunisie pour des panneaux muraux
            élégants et une décoration d&apos;intérieur moderne.
          </p>

          <div 
            className={`transition-all duration-1000 delay-700 ${
              showContent ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <Link
              href="/boutique"
              className="mt-4 relative isolate inline-flex h-9 items-center justify-center overflow-hidden rounded-md bg-accent px-5 text-xs font-semibold text-white shadow-xl transition-transform duration-300 before:absolute before:inset-y-0 before:left-[-40%] before:w-[35%] before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-180%] before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-[420%] hover:scale-[1.01] active:scale-95 md:mt-8 md:h-12 md:px-10 md:text-base"
            >
              Découvrir la collection
            </Link>
          </div>
        </div>

        {/* 5. Dots Navigation */}
        <div className={`absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-2 transition-opacity duration-1000 sm:bottom-4 md:bottom-6 md:gap-3 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 transition-all duration-500 rounded-full md:h-3 ${
                index === currentIndex ? "bg-accent w-6 md:w-10" : "bg-white/30 w-3 md:w-4 hover:bg-white/50 cursor-pointer"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
