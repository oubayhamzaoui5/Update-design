"use client"

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE },
  },
}

/** Staggered group. Direct <Reveal.Item> children animate in sequence on scroll. */
export function Reveal({
  children,
  className,
  amount = 0.2,
  load = false,
}: {
  children: ReactNode
  className?: string
  amount?: number
  /** When true, animates on mount (hero) instead of on scroll. */
  load?: boolean
}) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      {...(load
        ? { animate: 'visible' }
        : { whileInView: 'visible', viewport: { once: true, amount } })}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div variants={item} className={className} style={style}>
      {children}
    </motion.div>
  )
}

Reveal.Item = RevealItem

export default Reveal
