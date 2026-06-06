"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD = '#C4A23E'
const DARK = '#1C1A14'
const CREAM = '#FDFAF5'

export default function HeroVideo() {
  return (
    <header className="relative min-h-[88vh] overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,19,15,0.82)_0%,rgba(20,19,15,0.45)_46%,rgba(20,19,15,0.68)_100%)]" />

      <motion.div
        className="relative mx-auto flex min-h-[88vh] max-w-[1400px] flex-col items-center justify-center px-6 pt-[calc(var(--navbar-offset-mobile)+2.25rem)] pb-14 text-center md:px-10 md:pt-[calc(var(--navbar-offset-desktop)+2.75rem)] md:pb-20"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.17,
              delayChildren: 0.22,
            },
          },
        }}
      >
        <motion.h1
          className="mb-5 max-w-[760px]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(2.25rem, 5.6vw, 5rem)',
            lineHeight: 0.92,
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: GOLD,
          }}
          variants={{
            hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.92, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <span style={{ color: CREAM }}>Update </span>
          <span>Design</span>
        </motion.h1>

        <motion.p
          className="max-w-[760px] text-base font-bold leading-7 text-white md:text-lg md:leading-8"
          style={{ fontFamily: BODY }}
          variants={{
            hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          Decoration interieure et exterieure pour vos projets residentiels et professionnels:
          profils effet bois, panneaux effet marbre, stores, parasols, gazon et finitions sur mesure.
        </motion.p>

        <motion.div
          className="mt-7 flex flex-col gap-3 sm:flex-row"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <Link
            href="#nos-categories"
            className="inline-flex items-center justify-center gap-3 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition hover:brightness-110"
            style={{ background: GOLD, color: CREAM }}
          >
            Voir le catalogue <ArrowRight size={14} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-3 border px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition hover:bg-[#C4A23E]/10"
            style={{ borderColor: GOLD, color: CREAM }}
          >
            Visiter le showroom
          </Link>
        </motion.div>
      </motion.div>
    </header>
  )
}
