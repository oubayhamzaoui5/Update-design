// components/navbar.tsx
"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { NavbarCart } from "@/components/navbar-cart"
import { MegaMenu, type NavCategory } from "@/components/mega-menu"
import {
  ShoppingBag,
  CircleUser,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
  SlidersHorizontal,
  LogOut,
} from "lucide-react"

type Category = NavCategory

interface NavbarProps {
  categories?: Category[]
  reserveSpace?: boolean
}

type AuthUser = {
  id: string
  surname?: string
  name?: string
  email?: string
  role?: string
}

// ── Brand tokens ────────────────────────────────────────────────────────────
const UD_GOLD   = "#C4A23E"
const UD_CREAM  = "#FDFAF5"
const UD_CREAM2 = "#F5EDD8"
const UD_DARK   = "#1C1A14"
const DISPLAY_FONT = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY_FONT    = "'DM Sans', 'Outfit', system-ui, sans-serif"

function resolveRedirectPath(path?: string | null): string | null {
  if (!path) return null
  if (!path.startsWith("/")) return null
  if (path.startsWith("//")) return null
  try {
    const decoded = decodeURIComponent(path).toLowerCase().replace(/\\/g, "/")
    if (decoded.startsWith("//")) return null
    if (decoded.includes("javascript:") || decoded.includes("data:") || decoded.includes("vbscript:")) return null
  } catch {
    return null
  }
  return path
}

function compareCategoryOrder(a: Category, b: Category) {
  const aOrder = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 0
  const bOrder = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 0
  if (aOrder !== bOrder) return aOrder - bOrder
  return a.name.localeCompare(b.name)
}

// ── Logo ─────────────────────────────────────────────────────────────────────
function LogoSwap({ size = 60, dark = false }: { size?: number; dark?: boolean }) {
  const base = Math.max(11, Math.round(size * 0.165))
  const imgSize = Math.round(size * 0.38)
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <Image src="/logow.webp" alt="Update Design logo" width={imgSize} height={imgSize} className="object-contain" />
      <span
        className="inline-flex flex-col leading-none"
        style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.08em" }}
      >
        <span style={{ fontSize: base * 0.72, fontWeight: 700, color: dark ? "#1C1A14" : "rgba(255,255,255,0.9)", letterSpacing: "0.12em" }}>
          UPDATE
        </span>
        <span style={{ fontSize: base, fontWeight: 800, color: UD_GOLD, letterSpacing: "0.08em" }}>
          DESIGN
        </span>
      </span>
    </span>
  )
}

export function Navbar(props: NavbarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const categoriesProp = props.categories ?? []
  const reserveSpace   = props.reserveSpace ?? false

  const [isMenuOpen, setIsMenuOpen]               = useState(false)
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false)
  const megaMenuTimeoutRef = useRef<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [internalCategories, setInternalCategories] = useState<Category[]>(categoriesProp)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileShiftX, setProfileShiftX] = useState(0)
  const profileMenuRef  = useRef<HTMLDivElement | null>(null)
  const profileRootRef  = useRef<HTMLDivElement | null>(null)

  const [currentUser, setCurrentUser]     = useState<AuthUser | null>(null)
  const [isAuthResolved, setIsAuthResolved] = useState(false)

  const [showSignupPromo, setShowSignupPromo]         = useState(false)
  const [hasPassedPromoBanner, setHasPassedPromoBanner] = useState(false)
  const [isMobileNavVisible, setIsMobileNavVisible]   = useState(true)
  const [isCartPanelOpen, setIsCartPanelOpen]         = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen]         = useState(false)
  const [authMode, setAuthMode]   = useState<"login" | "signup" | "forgot">("login")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword]   = useState("")
  const [authError, setAuthError]         = useState("")
  const [authFieldErrors, setAuthFieldErrors] = useState<Record<string, string>>({})
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [forgotEmail, setForgotEmail]   = useState("")
  const [forgotSent, setForgotSent]     = useState(false)
  const authForgotPanelRef  = useRef<HTMLDivElement | null>(null)
  const [signupSurname, setSignupSurname]                 = useState("")
  const [signupName, setSignupName]                       = useState("")
  const [signupEmail, setSignupEmail]                     = useState("")
  const [signupPassword, setSignupPassword]               = useState("")
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("")
  const [postLoginRedirect, setPostLoginRedirect]         = useState<string | null>(null)
  const [authPanelHeight, setAuthPanelHeight]             = useState<number | null>(null)
  const authLoginPanelRef  = useRef<HTMLDivElement | null>(null)
  const authSignupPanelRef = useRef<HTMLDivElement | null>(null)
  const lastScrollYRef     = useRef(0)

  const [scrolled, setScrolled] = useState(false)

  // Always cream/white
  const navBg     = `rgba(253,250,245,0.98)`
  const navBorder = `rgba(196,162,62,0.18)`
  const navShadow = scrolled ? "0 2px 32px rgba(0,0,0,0.08)" : "0 1px 0 rgba(196,162,62,0.12)"
  const linkColor = `#1C1A14`
  const iconColor = `#1C1A14`

  useEffect(() => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new Event("signup-promo:visibility-change"))
  }, [])

  useEffect(() => { setIsDesktopMenuOpen(false) }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const authParam      = params.get("auth")
    const authErrorParam = params.get("auth_error")

    if (authErrorParam) {
      const errorMessages: Record<string, string> = {
        google_not_configured: "Google sign-in is not configured yet.",
        oauth_init_failed: "Could not initiate Google sign-in. Please try again.",
        oauth_missing_params: "Google sign-in failed. Please try again.",
        oauth_state_mismatch: "Google sign-in failed (security check). Please try again.",
        oauth_no_record: "Google sign-in failed. No account found.",
        oauth_failed: "Google sign-in failed. Please try again.",
      }
      setAuthError(errorMessages[authErrorParam] ?? "Sign-in failed. Please try again.")
      setAuthMode("login")
      setIsAuthModalOpen(true)
      setIsProfileOpen(false)
      setIsMenuOpen(false)
      const url = new URL(window.location.href)
      url.searchParams.delete("auth_error")
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
      return
    }

    if (authParam !== "login" && authParam !== "signup") return
    const nextParam = resolveRedirectPath(params.get("next"))
    setPostLoginRedirect(nextParam)
    setAuthMode(authParam)
    setIsAuthModalOpen(true)
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    setAuthError("")
    setAuthFieldErrors({})
    setAuthPassword("")
    const url = new URL(window.location.href)
    url.searchParams.delete("auth")
    url.searchParams.delete("next")
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
  }, [pathname])

  useEffect(() => {
    if (!isAuthModalOpen) return
    const orig = { body: document.body.style.overflow, html: document.documentElement.style.overflow }
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsAuthModalOpen(false); setAuthError("") } }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = orig.body
      document.documentElement.style.overflow = orig.html
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isAuthModalOpen])

  useLayoutEffect(() => {
    if (!isAuthModalOpen) { setAuthPanelHeight(null); return }
    const activePanel = authMode === "login" ? authLoginPanelRef.current : authMode === "signup" ? authSignupPanelRef.current : authForgotPanelRef.current
    if (activePanel) setAuthPanelHeight(activePanel.scrollHeight)
  }, [isAuthModalOpen, authMode, authError, isAuthSubmitting])

  useEffect(() => {
    if (!isAuthModalOpen) return
    const update = () => {
      const activePanel = authMode === "login" ? authLoginPanelRef.current : authMode === "signup" ? authSignupPanelRef.current : authForgotPanelRef.current
      if (activePanel) setAuthPanelHeight(activePanel.scrollHeight)
    }
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [isAuthModalOpen, authMode])

  useEffect(() => {
    const onScroll = () => setHasPassedPromoBanner(window.scrollY >= 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const email = (e as CustomEvent<{ email: string }>).detail?.email ?? ""
      setSignupEmail(email)
      openAuthModal(null, "signup")
    }
    window.addEventListener("open-signup-modal", handler)
    return () => window.removeEventListener("open-signup-modal", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const threshold = 8
    const update = () => {
      const y = window.scrollY
      if (isMenuOpen || isProfileOpen || isCartPanelOpen || isAuthModalOpen) {
        setIsMobileNavVisible(true); lastScrollYRef.current = y; return
      }
      const delta = y - lastScrollYRef.current
      if (y <= 10) setIsMobileNavVisible(true)
      else if (delta > threshold) setIsMobileNavVisible(false)
      else if (delta < -threshold) setIsMobileNavVisible(true)
      lastScrollYRef.current = y
    }
    lastScrollYRef.current = window.scrollY; update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update) }
  }, [isMenuOpen, isProfileOpen, isCartPanelOpen, isAuthModalOpen])

  const closeSignupPromo = () => {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("signup-promo:visibility-change"))
    setShowSignupPromo(false)
  }

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    setCurrentUser(null); setIsProfileOpen(false); router.push("/")
  }

  const openAuthModal = (redirectTo?: string | null, mode: "login" | "signup" = "login") => {
    setAuthError(""); setAuthFieldErrors({}); setAuthMode(mode)
    if (mode === "login") setAuthPassword("")
    else { setSignupPassword(""); setSignupPasswordConfirm("") }
    setPostLoginRedirect(resolveRedirectPath(redirectTo ?? null))
    setIsAuthModalOpen(true); setIsProfileOpen(false); setIsMenuOpen(false)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false); setAuthPassword(""); setSignupPassword(""); setSignupPasswordConfirm("")
    setAuthError(""); setAuthFieldErrors({}); setAuthMode("login"); setForgotSent(false); setForgotEmail("")
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (isAuthSubmitting) return
    setAuthError(""); setAuthFieldErrors({}); setIsAuthSubmitting(true)
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail.trim() }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setAuthError(data?.message ?? "Impossible d'envoyer l'email."); return }
      setForgotSent(true)
    } catch { setAuthError("Une erreur est survenue.") } finally { setIsAuthSubmitting(false) }
  }

  const switchAuthMode = (mode: "login" | "signup" | "forgot") => {
    setAuthMode(mode); setAuthError(""); setAuthFieldErrors({})
    if (mode === "forgot") { setForgotSent(false); return }
    if (mode === "login") { if (!authEmail && signupEmail) setAuthEmail(signupEmail); setAuthPassword(""); return }
    if (!signupEmail && authEmail.includes("@")) setSignupEmail(authEmail)
    setSignupPassword(""); setSignupPasswordConfirm("")
  }

  const handleAuthLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (isAuthSubmitting) return
    setAuthError(""); setAuthFieldErrors({}); setIsAuthSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: authEmail.trim(), password: authPassword }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAuthError(data?.message ?? "Connexion échouée.")
        if (data?.fieldErrors && typeof data.fieldErrors === "object") setAuthFieldErrors(data.fieldErrors)
        return
      }
      setCurrentUser((data?.user as AuthUser) ?? null); closeAuthModal(); router.refresh()
      const safeRedirect = resolveRedirectPath(postLoginRedirect)
      if (safeRedirect) { router.push(safeRedirect); return }
      if ((data?.user as AuthUser | undefined)?.role === "admin") router.push("/admin/products")
    } catch { setAuthError("Une erreur est survenue.") } finally { setIsAuthSubmitting(false) }
  }

  const handleAuthSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (isAuthSubmitting) return
    setAuthError(""); setAuthFieldErrors({}); setIsAuthSubmitting(true)
    try {
      const registerRes = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: signupEmail.trim(), password: signupPassword, passwordConfirm: signupPasswordConfirm, surname: signupSurname.trim(), name: signupName.trim() }) })
      const registerData = await registerRes.json().catch(() => ({}))
      if (!registerRes.ok) {
        setAuthError(registerData?.message ?? "Inscription échouée.")
        if (registerData?.fieldErrors && typeof registerData.fieldErrors === "object") setAuthFieldErrors(registerData.fieldErrors)
        return
      }
      const loginRes = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: signupEmail.trim(), password: signupPassword }) })
      const loginData = await loginRes.json().catch(() => ({}))
      if (!loginRes.ok) { setAuthError("Compte créé. Connectez-vous avec vos identifiants."); switchAuthMode("login"); setAuthEmail(signupEmail.trim()); return }
      setCurrentUser((loginData?.user as AuthUser) ?? null); closeAuthModal(); router.refresh()
      const safeRedirect = resolveRedirectPath(postLoginRedirect)
      if (safeRedirect) { router.push(safeRedirect); return }
      if ((loginData?.user as AuthUser | undefined)?.role === "admin") router.push("/admin/products")
    } catch { setAuthError("Une erreur est survenue.") } finally { setIsAuthSubmitting(false) }
  }

  useEffect(() => {
    let cancelled = false
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" })
        if (!res.ok) { if (!cancelled) setCurrentUser(null); return }
        const data = await res.json()
        if (!cancelled) setCurrentUser((data?.user as AuthUser) ?? null)
      } catch { if (!cancelled) setCurrentUser(null) } finally { if (!cancelled) setIsAuthResolved(true) }
    }
    loadSession()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (categoriesProp.length > 0) { setInternalCategories(categoriesProp.slice().sort(compareCategoryOrder)); return }
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch("/api/shop/categories", { cache: "no-store", signal: controller.signal })
        if (!res.ok) throw new Error("Failed to fetch navbar categories")
        const data = await res.json()
        const items = Array.isArray(data?.categories) ? data.categories : []
        const mapped: Category[] = items.map((c: any) => ({ id: c.id, name: c.name ?? "", slug: c.slug ?? "", order: Number(c.order ?? 0), parent: c.parent ?? null, description: c.description ?? null, menuImageUrl: c.menuImageUrl ?? null, coverImageUrl: c.coverImageUrl ?? null }))
        setInternalCategories(mapped.sort(compareCategoryOrder))
      } catch (err: any) { if (err?.name !== "AbortError") console.error("Failed to fetch navbar categories", err) }
    }
    load()
    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isProfileOpen || !profileMenuRef.current) return
    const el = profileMenuRef.current; const padding = 8
    const updateShift = () => {
      if (!el) return
      const rect = el.getBoundingClientRect(); let shift = 0
      if (rect.right > window.innerWidth - padding) shift = window.innerWidth - padding - rect.right
      if (rect.left < padding) shift = padding - rect.left
      setProfileShiftX(shift)
    }
    updateShift(); requestAnimationFrame(updateShift)
    const t = window.setTimeout(updateShift, 60)
    window.addEventListener("resize", updateShift)
    window.addEventListener("scroll", updateShift, { passive: true })
    return () => { window.clearTimeout(t); window.removeEventListener("resize", updateShift); window.removeEventListener("scroll", updateShift) }
  }, [isProfileOpen])

  useEffect(() => {
    if (!isProfileOpen) return
    const onDocClick = (e: MouseEvent) => { if (!profileRootRef.current?.contains(e.target as Node)) setIsProfileOpen(false) }
    const onKeyDown  = (e: KeyboardEvent) => { if (e.key === "Escape") setIsProfileOpen(false) }
    document.addEventListener("mousedown", onDocClick)
    window.addEventListener("keydown", onKeyDown)
    return () => { document.removeEventListener("mousedown", onDocClick); window.removeEventListener("keydown", onKeyDown) }
  }, [isProfileOpen])

  const rootCategories = internalCategories.filter((cat) => { if (Array.isArray(cat.parent)) return cat.parent.length === 0; return !cat.parent }).sort(compareCategoryOrder)
  const getCategoryChildren = (parentId: string) => internalCategories.filter((cat) => { if (Array.isArray(cat.parent)) return cat.parent.includes(parentId); return cat.parent === parentId }).sort(compareCategoryOrder)
  const toggleCategory = (id: string, e?: React.MouseEvent) => { e?.stopPropagation(); const next = new Set(expandedCategories); next.has(id) ? next.delete(id) : next.add(id); setExpandedCategories(next) }

  const CategoryList = ({ items, level = 0 }: { items: Category[]; level?: number }) => (
    <div className={level > 0 ? "ml-4 mt-2 space-y-2" : "space-y-2"}>
      {items.map((category) => {
        const children  = getCategoryChildren(category.id)
        const isExpanded = expandedCategories.has(category.id)
        return (
          <div key={category.id}>
            <div className="flex items-center justify-between">
              <Link href={`/shop/${category.slug}`} className="text-sm font-light tracking-wide transition-colors hover:opacity-60" style={{ color: UD_DARK, fontFamily: BODY_FONT }} onClick={(e) => e.stopPropagation()}>
                {category.name}
              </Link>
              {children.length > 0 && (
                <button type="button" onClick={(e) => toggleCategory(category.id, e)} className="inline-flex h-6 w-6 items-center justify-center transition-colors" style={{ color: UD_DARK }}>
                  <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>
            {isExpanded && children.length > 0 && <CategoryList items={children} level={level + 1} />}
          </div>
        )
      })}
    </div>
  )

  const displayName  = [currentUser?.surname, currentUser?.name].filter(Boolean).join(" ") || currentUser?.email || "Compte"
  const fullName     = [currentUser?.surname, currentUser?.name].filter(Boolean).join(" ").trim()
  const profileLabel = currentUser ? (fullName || currentUser.email || "Compte") : "Connexion"

  const shouldShowSignupPromo = showSignupPromo
  const navSpacerClass = reserveSpace ? shouldShowSignupPromo ? "h-[94px] md:h-[104px]" : "h-[54px] md:h-[64px]" : null

  useLayoutEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.style.setProperty("--navbar-offset-mobile",   shouldShowSignupPromo ? "94px" : "54px")
    root.style.setProperty("--navbar-offset-desktop",  shouldShowSignupPromo ? "104px" : "64px")
    root.style.setProperty("--mega-menu-top-desktop",  shouldShowSignupPromo && !hasPassedPromoBanner ? "104px" : "64px")
  }, [shouldShowSignupPromo, hasPassedPromoBanner])

  // ── Shared input style ────────────────────────────────────────────────────
  const inputCls = "w-full border bg-white px-4 py-3 text-sm font-light outline-none transition-all placeholder:text-black/25"
  const labelCls = "block text-[9px] font-light uppercase tracking-[0.22em] mb-1.5"

  return (
    <NavbarCart currentUser={currentUser} onOpenChange={setIsCartPanelOpen}>
      {({ cartCount, openCart }) => (
        <>
          {/* ── Promo banner ─────────────────────────────────────────────── */}
          {shouldShowSignupPromo && (
            <div className="absolute inset-x-0 top-0 z-50 overflow-x-clip" style={{ background: UD_CREAM2, borderBottom: "1px solid rgba(196,162,62,0.2)" }}>
              <div className="mx-auto flex h-10 max-w-7xl items-center justify-center px-10 sm:px-8">
                <p className="max-w-full text-center text-[11px] leading-tight tracking-[0.16em] uppercase whitespace-normal md:whitespace-nowrap" style={{ color: UD_DARK, fontFamily: BODY_FONT, fontWeight: 700 }}>
                  Livraison gratuite en Tunisie dès 200 DT d&apos;achat
                </p>
                <button type="button" onClick={closeSignupPromo} className="absolute right-2 sm:right-4 inline-flex h-8 w-8 cursor-pointer items-center justify-center opacity-30 hover:opacity-70 transition-opacity" style={{ color: UD_DARK }} aria-label="Fermer">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Navbar ───────────────────────────────────────────────────── */}
          <nav
            className={`left-0 right-0 z-40 transition-all duration-400 ${shouldShowSignupPromo ? hasPassedPromoBanner ? "fixed top-0" : "absolute top-10" : "fixed top-0"}`}
            style={{ background: navBg, backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: `1px solid ${navBorder}`, boxShadow: navShadow, transition: "background 0.35s, box-shadow 0.35s, border-color 0.35s, transform 0.3s, backdrop-filter 0.35s" }}
          >
            {/* Desktop */}
            <div className="hidden md:flex items-center px-12 xl:px-20 mx-auto" style={{ height: 64 }}>

              {/* Logo */}
              <Link href="/" className="flex items-center mr-16 flex-shrink-0">
                <LogoSwap size={160} dark={true} />
              </Link>

              {/* Nav links */}
              <div className="flex items-center gap-8 flex-1">
                {/* Shop — hover triggers mega menu */}
                <div
                  className="relative"
                  onMouseEnter={() => { if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current); setIsDesktopMenuOpen(true) }}
                  onMouseLeave={() => { megaMenuTimeoutRef.current = window.setTimeout(() => setIsDesktopMenuOpen(false), 300) }}
                >
                  <button
                    type="button"
                    onClick={() => setIsDesktopMenuOpen((p) => !p)}
                    className="relative group text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-200 cursor-pointer pb-0.5"
                    style={{ color: isDesktopMenuOpen ? UD_GOLD : linkColor, fontFamily: BODY_FONT }}
                    aria-expanded={isDesktopMenuOpen}
                  >
                    Boutique
                    <span className="absolute -bottom-0.5 left-0 h-px transition-all duration-300 group-hover:w-full" style={{ width: isDesktopMenuOpen ? "100%" : "0%", background: UD_GOLD }} />
                  </button>
                  {isDesktopMenuOpen && <div className="absolute left-1/2 -translate-x-1/2 top-full w-[200vw] h-4" />}
                </div>

                {[{ href: "/#story", label: "À Propos" }, { href: "/#contact", label: "Contact" }, { href: "/blog", label: "Blog" }].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="relative group text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-200 pb-0.5"
                    style={{ color: linkColor, fontFamily: BODY_FONT }}
                  >
                    {label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full" style={{ background: UD_GOLD }} />
                  </Link>
                ))}
              </div>

              {/* Right icons */}
              <div className="flex items-center gap-0.5 ml-auto">
                {/* Cart */}
                <button type="button" className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center transition-all hover:opacity-60 active:scale-95" style={{ color: iconColor }} aria-label="Panier" onClick={openCart}>
                  <ShoppingBag size={19} strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-4 min-w-[1rem] rounded-full text-[9px] font-medium px-1" style={{ background: UD_GOLD, color: "white", fontFamily: BODY_FONT }}>
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>

                {/* Profile */}
                <div className="relative" ref={profileRootRef}>
                  <button type="button" className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 px-3 transition-all hover:opacity-60 active:scale-95" style={{ color: iconColor }} aria-label="Mon compte"
                    onClick={() => { if (!currentUser) { openAuthModal(pathname); return } setIsProfileOpen((v) => !v) }}
                  >
                    <CircleUser size={19} strokeWidth={2} />
                    <span className="max-w-[10rem] truncate text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ fontFamily: BODY_FONT, color: linkColor }}>
                      {profileLabel}
                    </span>
                  </button>

                  <AnimatePresence>
                    {currentUser && isProfileOpen && (
                      <div ref={profileMenuRef} className="absolute left-1/2 top-full mt-3 w-56" style={{ transform: `translateX(calc(-50% + ${profileShiftX}px))`, maxWidth: "calc(100vw - 16px)" }}>
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                          style={{ background: UD_CREAM, border: "1px solid rgba(196,162,62,0.2)", boxShadow: "0 16px 48px rgba(0,0,0,0.1)" }}
                        >
                          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(196,162,62,0.12)" }}>
                            <div className="truncate text-[11px] font-medium tracking-[0.1em]" style={{ color: UD_DARK, fontFamily: BODY_FONT }}>{displayName}</div>
                            <div className="text-[10px] font-light mt-0.5 truncate" style={{ color: "rgba(28,26,20,0.4)", fontFamily: BODY_FONT }}>{currentUser?.email}</div>
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            {[
                              { href: currentUser?.role === "admin" ? "/admin" : "/orders", icon: <CircleUser size={13} strokeWidth={2} />, label: currentUser?.role === "admin" ? "Panneau admin" : "Mon profil" },
                              ...(currentUser?.role !== "admin" ? [{ href: "/orders", icon: <ClipboardList size={13} strokeWidth={2} />, label: "Mes commandes" }, { href: "/account", icon: <SlidersHorizontal size={13} strokeWidth={2} />, label: "Paramètres" }] : []),
                            ].map(({ href, icon, label }) => (
                              <Link key={href + label} href={href} className="flex items-center gap-3 px-3 py-2 text-[11px] tracking-wide rounded transition-colors hover:bg-black/5" style={{ color: UD_DARK, fontFamily: BODY_FONT }} onClick={() => setIsProfileOpen(false)}>
                                {icon}{label}
                              </Link>
                            ))}
                            <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "4px 8px" }} />
                            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-[11px] tracking-wide rounded transition-colors hover:bg-red-50 cursor-pointer" style={{ color: "rgba(200,60,60,0.8)", fontFamily: BODY_FONT }}>
                              <LogOut size={13} strokeWidth={2} />Déconnexion
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ── Mobile header ──────────────────────────────────────────── */}
            <div className="md:hidden relative" style={{ height: 54 }}>
              <div className="flex items-center h-full px-4 gap-2">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex h-10 w-10 items-center justify-center transition-all" style={{ color: iconColor }} aria-label="Menu">
                  <AnimatePresence mode="wait" initial={false}>
                    {isMenuOpen
                      ? <motion.div key="x"    initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}  transition={{ duration: 0.15 }}><X    size={18} strokeWidth={2} /></motion.div>
                      : <motion.div key="menu" initial={{ rotate:  45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={18} strokeWidth={2} /></motion.div>
                    }
                  </AnimatePresence>
                </button>

                <div className="flex flex-1 items-center justify-center">
                  <Link href="/" aria-label="Accueil"><LogoSwap size={100} dark={scrolled} /></Link>
                </div>

                <div className="flex items-center gap-1">
                  <button type="button" className="inline-flex h-10 w-10 cursor-pointer items-center justify-center transition-all hover:opacity-60" style={{ color: iconColor }} aria-label="Mon compte"
                    onClick={() => { if (!currentUser) { openAuthModal(pathname); return } if (currentUser?.role === "admin") { router.push("/admin"); return } setIsProfileOpen((v) => !v) }}
                  >
                    <CircleUser size={19} strokeWidth={2} />
                  </button>
                  <button type="button" onClick={openCart} aria-label="Panier" className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center transition-all hover:opacity-60" style={{ color: iconColor }}>
                    <ShoppingBag size={19} strokeWidth={2} />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 min-w-[1rem] rounded-full text-[9px] font-medium px-1" style={{ background: UD_GOLD, color: "white" }}>
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile panel */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className="md:hidden overflow-hidden"
                  style={{ background: UD_CREAM, borderTop: "1px solid rgba(196,162,62,0.12)" }}
                >
                  <div className="p-6 space-y-5">
                    {[{ href: "/shop", label: "Boutique" }, { href: "/#story", label: "À Propos" }, { href: "/#contact", label: "Contact" }, { href: "/blog", label: "Blog" }].map(({ href, label }, i) => (
                      <motion.div key={href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.2 }}>
                        <Link href={href} onClick={() => setIsMenuOpen(false)} className="block text-[13px] font-semibold tracking-[0.2em] uppercase transition-colors" style={{ color: "rgba(28,26,20,0.6)", fontFamily: BODY_FONT }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = UD_GOLD)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(28,26,20,0.6)")}>
                          {label}
                        </Link>
                      </motion.div>
                    ))}
                    <div style={{ height: 1, background: `linear-gradient(to right, ${UD_GOLD}30, transparent)` }} />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }} className="text-[10px] tracking-[0.25em] uppercase" style={{ color: UD_GOLD, fontFamily: BODY_FONT, fontWeight: 300 }}>
                      Tunisie · Décoration Premium
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Desktop Mega Menu */}
          <div className="hidden md:block" onMouseEnter={() => { if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current); setIsDesktopMenuOpen(true) }} onMouseLeave={() => { megaMenuTimeoutRef.current = window.setTimeout(() => setIsDesktopMenuOpen(false), 300) }}>
            <MegaMenu isOpen={isDesktopMenuOpen} categories={internalCategories} onClose={() => setIsDesktopMenuOpen(false)} />
          </div>

          {navSpacerClass ? <div aria-hidden className={navSpacerClass} /> : null}

          {/* ── Auth Modal ───────────────────────────────────────────────── */}
          {(() => {
            const leftContent = {
              login:  { lines: ["Bon",       "Retour."],      sub: "Accédez à vos commandes et favoris." },
              signup: { lines: ["Rejoignez", "Notre Monde."], sub: "Découvrez notre univers de décoration." },
              forgot: { lines: ["Réinitia-", "liser."],       sub: "Nous vous enverrons un lien par email." },
            }[authMode]

            return (
              <AnimatePresence>
                {isAuthModalOpen && (
                  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={closeAuthModal} />

                    <motion.div
                      className="relative flex w-full max-w-[780px] overflow-hidden"
                      initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
                      style={{ border: "1px solid rgba(196,162,62,0.25)", boxShadow: "0 40px 100px rgba(0,0,0,0.2)" }}
                    >
                      {/* Left panel */}
                      <div className="relative hidden w-[38%] shrink-0 flex-col justify-between overflow-hidden p-8 sm:flex" style={{ background: UD_CREAM2, minHeight: 500, borderRight: "1px solid rgba(196,162,62,0.15)" }}>
                        <div aria-hidden className="pointer-events-none absolute -right-4 bottom-0 select-none" style={{ fontSize: "10rem", fontFamily: DISPLAY_FONT, fontWeight: 400, color: "rgba(196,162,62,0.07)", lineHeight: 0.85 }}>UD</div>

                        <div>
                          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5" style={{ border: "1px solid rgba(196,162,62,0.35)" }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: UD_GOLD }} />
                            <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: UD_GOLD, fontFamily: BODY_FONT, fontWeight: 300 }}>Update Design</span>
                          </div>

                          <motion.h2 key={authMode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                            className="leading-[0.9] tracking-[-0.01em]" style={{ fontFamily: DISPLAY_FONT, fontWeight: 300, fontSize: "2.8rem", color: UD_DARK }}>
                            {leftContent.lines[0]}<br /><span style={{ color: UD_GOLD }}>{leftContent.lines[1]}</span>
                          </motion.h2>
                          <motion.p key={authMode + "-sub"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.08 }}
                            className="mt-4 text-[11px] font-light tracking-[0.1em] leading-relaxed" style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>
                            {leftContent.sub}
                          </motion.p>
                        </div>

                        <div className="flex gap-6" style={{ borderTop: "1px solid rgba(196,162,62,0.2)", paddingTop: "1.25rem" }}>
                          {[["500+", "Produits"], ["Tunisie", "Livraison"], ["100%", "Qualité"]].map(([val, label]) => (
                            <div key={label}>
                              <p className="text-sm font-light" style={{ color: UD_GOLD, fontFamily: DISPLAY_FONT }}>{val}</p>
                              <p className="text-[9px] uppercase tracking-[0.18em] font-light mt-0.5" style={{ color: "rgba(28,26,20,0.35)", fontFamily: BODY_FONT }}>{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right panel */}
                      <div className="relative flex flex-1 flex-col justify-center px-8 py-9" style={{ background: UD_CREAM }}>
                        <button type="button" onClick={closeAuthModal} className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center transition-all hover:opacity-40" style={{ color: "rgba(28,26,20,0.4)" }} aria-label="Fermer">
                          <X size={16} strokeWidth={2} />
                        </button>

                        {/* Tabs */}
                        <div className="mb-7 flex" style={{ borderBottom: "1px solid rgba(196,162,62,0.15)" }}>
                          {(["login", "signup"] as const).map((m) => (
                            <button key={m} type="button" onClick={() => switchAuthMode(m)} className="flex-1 cursor-pointer pb-3 text-[10px] font-light uppercase tracking-[0.2em] transition-all" style={{ fontFamily: BODY_FONT, color: authMode === m ? UD_GOLD : "rgba(28,26,20,0.35)", borderBottom: authMode === m ? `1px solid ${UD_GOLD}` : "1px solid transparent", marginBottom: -1 }}>
                              {m === "login" ? "Connexion" : "Inscription"}
                            </button>
                          ))}
                        </div>

                        {/* Header */}
                        <div className="mb-6">
                          <p className="text-[9px] font-light uppercase tracking-[0.25em] mb-1" style={{ color: UD_GOLD, fontFamily: BODY_FONT }}>
                            {authMode === "forgot" ? "Réinitialisation" : authMode === "login" ? "Bienvenue" : "Nouveau compte"}
                          </p>
                          <h2 className="text-2xl font-light leading-none tracking-[-0.01em]" style={{ fontFamily: DISPLAY_FONT, fontWeight: 300, color: UD_DARK }}>
                            {authMode === "login" ? "Se connecter." : authMode === "signup" ? "Nous rejoindre." : "Réinitialiser."}
                          </h2>
                        </div>

                        {authError && (
                          <div className="mb-4 px-3 py-2 text-xs font-light" style={{ border: "1px solid rgba(200,60,60,0.3)", background: "rgba(200,60,60,0.05)", color: "rgba(180,40,40,0.9)", fontFamily: BODY_FONT }}>
                            {authError}
                          </div>
                        )}

                        {/* Sliding panels */}
                        <div className="relative overflow-visible transition-[height] duration-300 ease-out" style={authPanelHeight != null ? { height: `${authPanelHeight}px` } : undefined}>

                          {/* LOGIN */}
                          <div ref={authLoginPanelRef} className={`transition-all duration-300 ease-out ${authMode === "login" ? "relative translate-x-0 opacity-100" : "pointer-events-none absolute inset-0 -translate-x-4 opacity-0"}`}>
                            <form className="space-y-4" onSubmit={handleAuthLogin}>
                              <div>
                                <label htmlFor="auth-email" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>Email <span style={{ color: UD_GOLD }}>*</span></label>
                                <input id="auth-email" type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className={inputCls} placeholder="vous@email.com" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                {authFieldErrors.identifier && <p className="mt-1 text-[10px]" style={{ color: "rgba(180,40,40,0.9)" }}>{authFieldErrors.identifier}</p>}
                              </div>
                              <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                  <label htmlFor="auth-password" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT, marginBottom: 0 }}>Mot de passe <span style={{ color: UD_GOLD }}>*</span></label>
                                  <button type="button" onClick={() => switchAuthMode("forgot")} className="text-[9px] uppercase tracking-wider cursor-pointer transition-colors hover:opacity-70" style={{ color: UD_GOLD, fontFamily: BODY_FONT }}>Oublié ?</button>
                                </div>
                                <input id="auth-password" type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className={inputCls} placeholder="••••••••" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                {authFieldErrors.password && <p className="mt-1 text-[10px]" style={{ color: "rgba(180,40,40,0.9)" }}>{authFieldErrors.password}</p>}
                              </div>
                              <button type="submit" disabled={isAuthSubmitting} className="mt-2 h-12 w-full cursor-pointer text-[11px] uppercase tracking-[0.2em] font-light transition-all hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: UD_GOLD, color: "white", fontFamily: BODY_FONT }}>
                                {isAuthSubmitting ? "Connexion..." : "Se connecter"}
                              </button>
                            </form>
                            <div className="mt-3">
                              <a href="/api/auth/oauth/google" className="inline-flex w-full h-10 cursor-pointer items-center justify-center gap-2 text-xs font-light uppercase tracking-[0.12em] transition-all hover:opacity-70" style={{ border: "1px solid rgba(28,26,20,0.15)", color: "rgba(28,26,20,0.5)", fontFamily: BODY_FONT }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Continuer avec Google
                              </a>
                            </div>
                            <p className="mt-4 text-center text-[11px] font-light" style={{ color: "rgba(28,26,20,0.4)", fontFamily: BODY_FONT }}>
                              Pas encore de compte ?{" "}
                              <button type="button" onClick={() => switchAuthMode("signup")} className="cursor-pointer underline underline-offset-2 transition-opacity hover:opacity-70" style={{ color: UD_GOLD }}>S&apos;inscrire</button>
                            </p>
                          </div>

                          {/* SIGNUP */}
                          <div ref={authSignupPanelRef} className={`transition-all duration-300 ease-out ${authMode === "signup" ? "relative translate-x-0 opacity-100" : "pointer-events-none absolute inset-0 translate-x-4 opacity-0"}`}>
                            <form className="space-y-3" onSubmit={handleAuthSignup}>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor="signup-surname" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>Prénom <span style={{ color: UD_GOLD }}>*</span></label>
                                  <input id="signup-surname" type="text" required minLength={2} value={signupSurname} onChange={(e) => setSignupSurname(e.target.value)} className={inputCls} placeholder="Prénom" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                  {authFieldErrors.surname && <p className="mt-1 text-[10px]" style={{ color: "rgba(180,40,40,0.9)" }}>{authFieldErrors.surname}</p>}
                                </div>
                                <div>
                                  <label htmlFor="signup-name" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>Nom <span style={{ color: UD_GOLD }}>*</span></label>
                                  <input id="signup-name" type="text" required minLength={2} value={signupName} onChange={(e) => setSignupName(e.target.value)} className={inputCls} placeholder="Nom" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                  {authFieldErrors.name && <p className="mt-1 text-[10px]" style={{ color: "rgba(180,40,40,0.9)" }}>{authFieldErrors.name}</p>}
                                </div>
                              </div>
                              <div>
                                <label htmlFor="signup-email" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>Email <span style={{ color: UD_GOLD }}>*</span></label>
                                <input id="signup-email" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className={inputCls} placeholder="vous@email.com" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                {authFieldErrors.email && <p className="mt-1 text-[10px]" style={{ color: "rgba(180,40,40,0.9)" }}>{authFieldErrors.email}</p>}
                              </div>
                              <div>
                                <label htmlFor="signup-password" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>Mot de passe <span style={{ color: UD_GOLD }}>*</span></label>
                                <input id="signup-password" type="password" required minLength={8} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className={inputCls} placeholder="8 caractères minimum" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                {authFieldErrors.password && <p className="mt-1 text-[10px]" style={{ color: "rgba(180,40,40,0.9)" }}>{authFieldErrors.password}</p>}
                              </div>
                              <div>
                                <label htmlFor="signup-password-confirm" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>Confirmer <span style={{ color: UD_GOLD }}>*</span></label>
                                <input id="signup-password-confirm" type="password" required minLength={8} value={signupPasswordConfirm} onChange={(e) => setSignupPasswordConfirm(e.target.value)} className={inputCls} placeholder="Répéter le mot de passe" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                {authFieldErrors.passwordConfirm && <p className="mt-1 text-[10px]" style={{ color: "rgba(180,40,40,0.9)" }}>{authFieldErrors.passwordConfirm}</p>}
                              </div>
                              <button type="submit" disabled={isAuthSubmitting} className="mt-2 h-12 w-full cursor-pointer text-[11px] uppercase tracking-[0.2em] font-light transition-all hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: UD_GOLD, color: "white", fontFamily: BODY_FONT }}>
                                {isAuthSubmitting ? "Création..." : "Créer mon compte"}
                              </button>
                            </form>
                            <p className="mt-4 text-center text-[11px] font-light" style={{ color: "rgba(28,26,20,0.4)", fontFamily: BODY_FONT }}>
                              Déjà inscrit ?{" "}
                              <button type="button" onClick={() => switchAuthMode("login")} className="cursor-pointer underline underline-offset-2 transition-opacity hover:opacity-70" style={{ color: UD_GOLD }}>Se connecter</button>
                            </p>
                          </div>

                          {/* FORGOT */}
                          <div ref={authForgotPanelRef} className={`transition-all duration-300 ease-out ${authMode === "forgot" ? "relative translate-x-0 opacity-100" : "pointer-events-none absolute inset-0 translate-x-4 opacity-0"}`}>
                            {forgotSent ? (
                              <div className="px-4 py-8 text-center" style={{ border: "1px solid rgba(196,162,62,0.2)", background: "white" }}>
                                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center" style={{ border: `1px solid ${UD_GOLD}` }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={UD_GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <p className="text-sm font-light uppercase tracking-[0.2em]" style={{ color: UD_GOLD, fontFamily: BODY_FONT }}>Email envoyé</p>
                                <p className="mt-2 text-xs font-light" style={{ color: "rgba(28,26,20,0.4)", fontFamily: BODY_FONT }}>Vérifiez votre boîte mail.</p>
                              </div>
                            ) : (
                              <form className="space-y-4" onSubmit={handleForgotPassword}>
                                <div>
                                  <label htmlFor="forgot-email" className={labelCls} style={{ color: "rgba(28,26,20,0.45)", fontFamily: BODY_FONT }}>Email <span style={{ color: UD_GOLD }}>*</span></label>
                                  <input id="forgot-email" type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputCls} placeholder="vous@email.com" style={{ color: UD_DARK, borderColor: "rgba(196,162,62,0.25)", fontFamily: BODY_FONT }} onFocus={(e) => (e.target.style.borderColor = UD_GOLD)} onBlur={(e) => (e.target.style.borderColor = "rgba(196,162,62,0.25)")} />
                                </div>
                                <button type="submit" disabled={isAuthSubmitting} className="mt-2 h-12 w-full cursor-pointer text-[11px] uppercase tracking-[0.2em] font-light transition-all hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: UD_GOLD, color: "white", fontFamily: BODY_FONT }}>
                                  {isAuthSubmitting ? "Envoi..." : "Envoyer le lien"}
                                </button>
                              </form>
                            )}
                            <p className="mt-4 text-center text-[11px] font-light" style={{ color: "rgba(28,26,20,0.4)", fontFamily: BODY_FONT }}>
                              <button type="button" onClick={() => switchAuthMode("login")} className="cursor-pointer underline underline-offset-2 transition-opacity hover:opacity-70" style={{ color: UD_GOLD }}>← Retour à la connexion</button>
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            )
          })()}
        </>
      )}
    </NavbarCart>
  )
}
