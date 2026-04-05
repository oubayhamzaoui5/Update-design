'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const SLATE   = '#1A2028'
const CREAM   = '#FDFAF5'

const STORAGE_KEY   = 'ud_promo_dismissed_at'
const DELAY_MS      = 4000
const COOLDOWN_MS   = 3 * 60 * 60 * 1000 // 3 hours

export default function PromoPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail]     = useState('')

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    async function initPopup() {
      try {
        const res  = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = await res.json().catch(() => null)
        if (res.ok && data?.user?.id) return
      } catch { /* allow popup if check fails */ }

      try {
        const dismissed = localStorage.getItem(STORAGE_KEY)
        if (dismissed && Date.now() - Number(dismissed) < COOLDOWN_MS) return
      } catch { /* SSR / privacy mode */ }

      timer = setTimeout(() => {
        if (!cancelled) setVisible(true)
      }, DELAY_MS)
    }

    void initPopup()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (visible) {
      const w = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight     = `${w}px`
      document.body.style.overflow         = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow         = ''
      document.documentElement.style.overflow = ''
      document.body.style.paddingRight     = ''
    }
    return () => {
      document.body.style.overflow         = ''
      document.documentElement.style.overflow = ''
      document.body.style.paddingRight     = ''
    }
  }, [visible])

  function handleClose() {
    setVisible(false)
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch { /* ignore */ }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    const captured = email.trim()
    handleClose()
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-signup-modal', { detail: { email: captured } }))
    }, 350)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[9998]"
            style={{ background: 'rgba(28,26,20,0.75)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative flex w-full max-w-[820px] overflow-hidden"
              style={{ border: `1px solid rgba(196,162,62,0.25)` }}
            >
              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Fermer"
                className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: CREAM }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              {/* LEFT — brand panel */}
              <div
                className="hidden w-[40%] shrink-0 flex-col justify-between p-10 sm:flex"
                style={{ background: DARK, minHeight: 480 }}
              >
                {/* Top: brand mark */}
                <div>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: 9,
                      letterSpacing: '0.26em',
                      textTransform: 'uppercase',
                      color: GOLD,
                      fontWeight: 700,
                      marginBottom: 20,
                    }}
                  >
                    Update Design
                  </p>
                  <p
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: '2.8rem',
                      fontWeight: 400,
                      color: CREAM,
                      lineHeight: 1.0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    L&apos;art de<br />
                    <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.55)' }}>
                      l&apos;espace.
                    </em>
                  </p>
                </div>

                {/* Bottom: stats */}
                <div
                  className="flex flex-col gap-4 pt-8"
                  style={{ borderTop: `1px solid rgba(196,162,62,0.15)` }}
                >
                  {[
                    ['1000+', 'Références disponibles'],
                    ['72h', 'Livraison nationale'],
                    ['24h', 'Réponse devis'],
                  ].map(([val, label]) => (
                    <div key={label}>
                      <p
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: '1.6rem',
                          fontWeight: 400,
                          color: GOLD,
                          lineHeight: 1,
                          marginBottom: 3,
                        }}
                      >
                        {val}
                      </p>
                      <p
                        style={{
                          fontFamily: BODY,
                          fontSize: 9,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'rgba(253,250,245,0.4)',
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — form panel */}
              <div
                className="relative flex flex-1 flex-col justify-center overflow-hidden px-8 py-10 sm:px-10"
                style={{ background: SLATE }}
              >
                {/* Subtle gold shimmer */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, #C4A23E 0, #C4A23E 1px, transparent 0, transparent 50%)',
                    backgroundSize: '20px 20px',
                  }}
                />

                <div className="relative z-10">
                  {/* Badge */}
                  <div
                    className="mb-6 inline-flex items-center gap-2 px-3 py-1.5"
                    style={{
                      border: `1px solid rgba(196,162,62,0.3)`,
                      background: 'rgba(196,162,62,0.07)',
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: GOLD }}
                    />
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 9,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: GOLD,
                        fontWeight: 700,
                      }}
                    >
                      Offres Exclusives
                    </span>
                  </div>

                  <h2
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                      fontWeight: 400,
                      color: CREAM,
                      lineHeight: 1.05,
                      letterSpacing: '-0.02em',
                      marginBottom: 10,
                    }}
                  >
                    Restez informé<br />
                    <em style={{ fontStyle: 'italic', color: 'rgba(253,250,245,0.55)' }}>
                      de nos nouveautés
                    </em>
                  </h2>

                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: '0.85rem',
                      color: 'rgba(253,250,245,0.55)',
                      lineHeight: 1.6,
                      marginBottom: 28,
                      maxWidth: 320,
                    }}
                  >
                    Nouveaux produits, promotions volume, conseils décoration —
                    directement dans votre boîte mail.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div
                      className="flex items-stretch"
                      style={{ border: `1px solid rgba(196,162,62,0.25)` }}
                    >
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          background: 'rgba(253,250,245,0.05)',
                          padding: '12px 14px',
                          fontSize: '0.875rem',
                          fontFamily: BODY,
                          color: CREAM,
                          outline: 'none',
                          border: 'none',
                        }}
                      />
                      <button
                        type="submit"
                        className="shrink-0 cursor-pointer flex items-center gap-2 px-5 py-3 transition-all duration-200 hover:brightness-110"
                        style={{
                          background: GOLD,
                          color: DARK,
                          fontFamily: BODY,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          border: 'none',
                        }}
                      >
                        S&apos;inscrire <ArrowRight size={11} />
                      </button>
                    </div>
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: '0.72rem',
                        color: 'rgba(253,250,245,0.25)',
                      }}
                    >
                      Pas de spam. Désinscription à tout moment.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
