"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  // Animation variants for the container (staggers the children)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  // Animation for individual text lines
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98], // Premium "out-quint" easing
      },
    },
  }

  return (
    <section className="relative flex h-screen min-h-screen flex-col items-stretch pt-16 lg:flex-row">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col justify-center bg-white px-8 py-20 lg:px-24"
      >
        <div className="max-w-xl">
          <motion.span 
            variants={itemVariants}
            className="mb-4 block text-sm font-bold uppercase tracking-[0.3em] text-[#c19a2f]"
          >
            Collection 2026
          </motion.span>
          
          <motion.h1 
            variants={itemVariants}
            className="mb-8 text-4xl font-extrabold leading-[1.1] lg:text-6xl"
          >
            Lumiere <br />
            <span className="text-[#c19a2f]">pour un interieur moderne</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mb-10 text-lg leading-relaxed text-slate-600"
          >
            Decouvrez l'alliance du luxe et du savoir-faire a travers notre collection de luminaires aux finitions dorees.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/boutique"
              className="rounded-lg bg-[#c19a2f] px-6 py-3 text-center text-sm font-bold uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95"
            >
              Acheter la collection
            </Link>
            <button className="rounded-lg hover:text-white  px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-[#c19a2f]">
              Voir le lookbook
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* The Image stays static as requested */}
      <div
        className="min-h-[500px] flex-1 bg-cover bg-center"
        style={{ backgroundImage: "url('/heroimg.png')" }}
      >
        <div className="h-full w-full bg-gradient-to-r from-white/20 to-transparent" />
      </div>
    </section>
  )
}
