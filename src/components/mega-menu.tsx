"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface MegaMenuProps {
  isOpen: boolean
  categories?: NavCategory[]
  onClose: () => void
}

export type NavCategory = {
  id: string
  name: string
  slug: string
  order?: number
  parent?: string | string[] | null
  description?: string | null
  menuImageUrl?: string | null
  coverImageUrl?: string | null
}

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = "#C4A23E"
const DARK    = "#1C1A14"
const CREAM   = "#FDFAF5"

function getParentIds(parent: string | string[] | null | undefined): string[] {
  if (!parent) return []
  return Array.isArray(parent) ? parent : [parent]
}

export function MegaMenu({ isOpen, categories = [], onClose }: MegaMenuProps) {
  // Build parent/child tree from flat list
  const roots = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : 0
      const bo = typeof b.order === "number" ? b.order : 0
      return ao !== bo ? ao - bo : a.name.localeCompare(b.name)
    })
    return sorted.filter((c) => getParentIds(c.parent).length === 0)
  }, [categories])

  const childrenOf = useMemo(() => {
    const map = new Map<string, NavCategory[]>()
    for (const cat of categories) {
      for (const pid of getParentIds(cat.parent)) {
        if (!map.has(pid)) map.set(pid, [])
        map.get(pid)!.push(cat)
      }
    }
    // Sort children by order
    for (const [key, arr] of map) {
      map.set(key, arr.sort((a, b) => ((a.order ?? 0) - (b.order ?? 0)) || a.name.localeCompare(b.name)))
    }
    return map
  }, [categories])

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setHoveredId(roots[0]?.id ?? null)
  }, [isOpen, roots])

  useEffect(() => {
    if (!isOpen) return
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [isOpen])

  const activeRoot = roots.find((c) => c.id === hoveredId) ?? null
  const activeChildren = activeRoot ? (childrenOf.get(activeRoot.id) ?? []) : []

  if (roots.length === 0) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onMouseEnter={onClose}
            style={{ background: "rgba(28,26,20,0.45)" }}
          />

          {/* Panel */}
          <motion.div
            className="fixed left-0 right-0 z-40 overflow-hidden"
            style={{ top: "var(--mega-menu-top-desktop, 64px)" }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ background: CREAM, borderTop: `1px solid rgba(196,162,62,0.3)` }}>
              <div className="mx-auto max-w-[1400px] px-10">

                {/* Parent category tabs */}
                <div className="flex items-stretch gap-0" style={{ borderBottom: `1px solid rgba(196,162,62,0.15)` }}>
                  {roots.map((cat) => {
                    const isActive = hoveredId === cat.id
                    return (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setHoveredId(cat.id)}
                        className="relative flex items-center gap-2 px-8 py-5"
                        style={{
                          fontFamily: BODY,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: isActive ? GOLD : `rgba(28,26,20,0.55)`,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          transition: "color 0.15s",
                        }}
                      >
                        {cat.name}
                        <span
                          className="absolute bottom-0 left-0 h-[2px] transition-all duration-200"
                          style={{ width: isActive ? "100%" : "0%", background: GOLD }}
                        />
                      </button>
                    )
                  })}

                  {/* Promotions link */}
                  <Link
                    href="/shop?promo=true"
                    onClick={onClose}
                    onMouseEnter={() => setHoveredId(null)}
                    className="relative flex items-center gap-2 px-6 py-5 transition-opacity hover:opacity-80"
                    style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#DC2626" }}
                  >
                    Promotions
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#DC2626", animation: "pulse 1.8s ease-in-out infinite" }} />
                  </Link>

                  {/* All products link */}
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="ml-auto flex items-center gap-2 px-6 py-5 hover:opacity-60 transition-opacity"
                    style={{ fontFamily: BODY, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: `rgba(28,26,20,0.65)` }}
                  >
                    Tout voir <ArrowRight size={11} />
                  </Link>
                </div>

                {/* Child categories */}
                <div>
                  <motion.div
                    animate={{ height: activeChildren.length > 0 ? "auto" : 0, opacity: activeChildren.length > 0 ? 1 : 0 }}
                    transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <AnimatePresence mode="wait">
                      {activeRoot && activeChildren.length > 0 && (
                        <motion.div
                          key={activeRoot.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="py-8"
                        >
                          <div className="grid grid-cols-5 gap-4">
                            {activeChildren.map((child, i) => {
                              const imgSrc = child.menuImageUrl ?? child.coverImageUrl ?? null
                              return (
                                <motion.div
                                  key={child.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.04, duration: 0.2 }}
                                >
                                  <Link
                                    href={`/shop/${child.slug}`}
                                    onClick={onClose}
                                    className="group flex flex-col overflow-hidden transition-all hover:opacity-90"
                                    style={{ border: `1px solid rgba(196,162,62,0.18)` }}
                                  >
                                    <div
                                      className="relative overflow-hidden"
                                      style={{ aspectRatio: "4/3", background: "rgba(196,162,62,0.07)" }}
                                    >
                                      {imgSrc && (
                                        <img
                                          src={imgSrc}
                                          alt={child.name}
                                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                                        />
                                      )}
                                    </div>
                                    <div className="px-3 py-3" style={{ background: "white" }}>
                                      <p style={{ fontFamily: BODY, fontSize: "0.78rem", fontWeight: 600, color: DARK, letterSpacing: "0.04em", margin: 0, lineHeight: 1.3 }}>
                                        {child.name}
                                      </p>
                                    </div>
                                  </Link>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* If active root has no children, show a direct link row */}
                  {activeRoot && activeChildren.length === 0 && (
                    <div className="py-6">
                      <Link
                        href={`/shop/${activeRoot.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: GOLD, fontFamily: BODY }}
                      >
                        Voir tous les produits <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
