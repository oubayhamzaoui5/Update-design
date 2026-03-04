// components/navbar.tsx
"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { NavbarCart } from "@/components/navbar-cart"
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  LayoutGrid,
  PackageOpen,
  Settings,
  LogOut,
  Package as PackageIcon,
} from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  order?: number
  parent?: string | string[] | null
  description?: string | null
}

type Product = {
  id: string
  slug: string
  sku: string
  name: string
  description?: string | null
  images?: string[]
  imageUrls?: string[]
}

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

const SIGNUP_PROMO_DISMISSED_KEY = "signup_promo_dismissed_v1"
const SIGNUP_PROMO_DISMISS_TTL_MS = 60 * 60 * 1000
const PHONE_PREFIX = "+216"
const PHONE_LOCAL_DIGITS_COUNT = 8

function resolveRedirectPath(path?: string | null): string | null {
  if (!path) return null
  if (!path.startsWith("/")) return null
  if (path.startsWith("//")) return null
  return path
}

function compareCategoryOrder(a: Category, b: Category) {
  const aOrder = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 0
  const bOrder = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 0
  if (aOrder !== bOrder) return aOrder - bOrder
  return a.name.localeCompare(b.name)
}

function formatPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, PHONE_LOCAL_DIGITS_COUNT)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
}

function extractLocalPhoneDigits(value: string) {
  const trimmed = value.trim()
  const withoutPrefix = trimmed.startsWith(PHONE_PREFIX)
    ? trimmed.slice(PHONE_PREFIX.length)
    : trimmed

  let digits = withoutPrefix.replace(/\D/g, "")
  if (digits.startsWith("216") && digits.length > PHONE_LOCAL_DIGITS_COUNT) {
    digits = digits.slice(3)
  }
  return digits.slice(0, PHONE_LOCAL_DIGITS_COUNT)
}

function formatPhoneForStorage(value: string) {
  const digits = extractLocalPhoneDigits(value)
  if (digits.length !== PHONE_LOCAL_DIGITS_COUNT) return null
  return `${PHONE_PREFIX} ${formatPhoneDigits(digits)}`
}

export function Navbar(props: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const categoriesProp = props.categories ?? []
  const reserveSpace = props.reserveSpace ?? false

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )
  const [searchValue, setSearchValue] = useState("")

  // internal categories state (from props OR fetched)
  const [internalCategories, setInternalCategories] =
    useState<Category[]>(categoriesProp)

  // search dropdown state
  const [searchOpen, setSearchOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [productResults, setProductResults] = useState<Product[]>([])
  const [categoryResults, setCategoryResults] = useState<Category[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const desktopSearchWrapRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchWrapRef = useRef<HTMLDivElement | null>(null)
  const desktopSearchResultsRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchResultsRef = useRef<HTMLDivElement | null>(null)
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<number | null>(null)

  // profile dropdown state (desktop)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileTimeoutRef = useRef<number | null>(null)

  // profile dropdown positioning
  const [profileShiftX, setProfileShiftX] = useState(0)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  // auth user (PocketBase)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isAuthResolved, setIsAuthResolved] = useState(false)

  const [showSignupPromo, setShowSignupPromo] = useState(false)
  const [hasPassedPromoBanner, setHasPassedPromoBanner] = useState(false)
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true)
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [signupSurname, setSignupSurname] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("")
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null)
  const [authPanelHeight, setAuthPanelHeight] = useState<number | null>(null)
  const authLoginPanelRef = useRef<HTMLDivElement | null>(null)
  const authSignupPanelRef = useRef<HTMLDivElement | null>(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissedUntilRaw = window.localStorage.getItem(
      SIGNUP_PROMO_DISMISSED_KEY
    )
    const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : 0
    const shouldShow = !dismissedUntil || Number.isNaN(dismissedUntil) || Date.now() >= dismissedUntil
    setShowSignupPromo(shouldShow)
    window.dispatchEvent(new Event("signup-promo:visibility-change"))

    if (shouldShow && dismissedUntilRaw) {
      window.localStorage.removeItem(SIGNUP_PROMO_DISMISSED_KEY)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const authParam = params.get("auth")
    if (authParam !== "login" && authParam !== "signup") return

    const nextParam = resolveRedirectPath(params.get("next"))
    setPostLoginRedirect(nextParam)
    setAuthMode(authParam)
    setIsAuthModalOpen(true)
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    setAuthError("")
    setAuthPassword("")

    const url = new URL(window.location.href)
    url.searchParams.delete("auth")
    url.searchParams.delete("next")
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
  }, [pathname])

  useEffect(() => {
    if (!isAuthModalOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAuthModalOpen(false)
        setAuthPassword("")
        setAuthError("")
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isAuthModalOpen])

  useLayoutEffect(() => {
    if (!isAuthModalOpen) {
      setAuthPanelHeight(null)
      return
    }

    const activePanel =
      authMode === "login" ? authLoginPanelRef.current : authSignupPanelRef.current

    if (activePanel) {
      setAuthPanelHeight(activePanel.scrollHeight)
    }
  }, [isAuthModalOpen, authMode, authError, isAuthSubmitting])

  useEffect(() => {
    if (!isAuthModalOpen) return

    const updateHeight = () => {
      const activePanel =
        authMode === "login" ? authLoginPanelRef.current : authSignupPanelRef.current
      if (activePanel) {
        setAuthPanelHeight(activePanel.scrollHeight)
      }
    }

    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [isAuthModalOpen, authMode])

  useEffect(() => {
    const onScroll = () => {
      // Promo banner height is h-10 (2.5rem = 40px)
      setHasPassedPromoBanner(window.scrollY >= 40)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const scrollThreshold = 8

    const updateMobileNavVisibility = () => {
      const currentScrollY = window.scrollY
      const isMobileViewport = window.innerWidth < 768

      if (!isMobileViewport) {
        setIsMobileNavVisible(true)
        lastScrollYRef.current = currentScrollY
        return
      }

      if (
        isMenuOpen ||
        searchOpen ||
        isSearchExpanded ||
        isProfileOpen ||
        isCartPanelOpen ||
        isAuthModalOpen
      ) {
        setIsMobileNavVisible(true)
        lastScrollYRef.current = currentScrollY
        return
      }

      const delta = currentScrollY - lastScrollYRef.current

      if (currentScrollY <= 10) {
        setIsMobileNavVisible(true)
      } else if (delta > scrollThreshold) {
        setIsMobileNavVisible(false)
      } else if (delta < -scrollThreshold) {
        setIsMobileNavVisible(true)
      }

      lastScrollYRef.current = currentScrollY
    }

    lastScrollYRef.current = window.scrollY
    updateMobileNavVisibility()

    window.addEventListener("scroll", updateMobileNavVisibility, { passive: true })
    window.addEventListener("resize", updateMobileNavVisibility)
    return () => {
      window.removeEventListener("scroll", updateMobileNavVisibility)
      window.removeEventListener("resize", updateMobileNavVisibility)
    }
  }, [
    isMenuOpen,
    searchOpen,
    isSearchExpanded,
    isProfileOpen,
    isCartPanelOpen,
    isAuthModalOpen,
  ])

  const closeSignupPromo = () => {
    if (typeof window !== "undefined") {
      const dismissedUntil = Date.now() + SIGNUP_PROMO_DISMISS_TTL_MS
      window.localStorage.setItem(
        SIGNUP_PROMO_DISMISSED_KEY,
        String(dismissedUntil)
      )
      window.dispatchEvent(new Event("signup-promo:visibility-change"))
    }
    setShowSignupPromo(false)
  }

  const handleProfileEnter = () => {
    if (!currentUser) return
    if (profileTimeoutRef.current) {
      window.clearTimeout(profileTimeoutRef.current)
    }
    setIsProfileOpen(true)
  }

  const handleProfileLeave = () => {
    if (!currentUser) return
    if (profileTimeoutRef.current) {
      window.clearTimeout(profileTimeoutRef.current)
    }
    profileTimeoutRef.current = window.setTimeout(() => {
      setIsProfileOpen(false)
    }, 150)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // ignore server logout errors and still clear client state
    }

    setCurrentUser(null)
    setIsProfileOpen(false)
    router.push("/")
  }

  const openAuthModal = (
    redirectTo?: string | null,
    mode: "login" | "signup" = "login"
  ) => {
    setAuthError("")
    setAuthMode(mode)
    if (mode === "login") {
      setAuthPassword("")
    } else {
      setSignupPassword("")
      setSignupPasswordConfirm("")
    }
    setPostLoginRedirect(resolveRedirectPath(redirectTo ?? null))
    setIsAuthModalOpen(true)
    setIsProfileOpen(false)
    setIsMenuOpen(false)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setAuthPassword("")
    setSignupPassword("")
    setSignupPasswordConfirm("")
    setAuthError("")
    setAuthMode("login")
  }

  const switchAuthMode = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setAuthError("")
    if (mode === "login") {
      if (!authEmail) {
        const fallbackPhone = formatPhoneForStorage(signupPhone) ?? ""
        setAuthEmail(signupEmail || fallbackPhone)
      }
      setAuthPassword("")
      return
    }

    if (!signupEmail && authEmail.includes("@")) {
      setSignupEmail(authEmail)
    }
    if (!signupPhone && authEmail && !authEmail.includes("@")) {
      setSignupPhone(formatPhoneDigits(extractLocalPhoneDigits(authEmail)))
    }
    setSignupPassword("")
    setSignupPasswordConfirm("")
  }

  const handleSocialLoginClick = (provider: "google" | "facebook") => {
    const label = provider === "google" ? "Google" : "Facebook"
    setAuthError(`Connexion ${label} bientot disponible.`)
  }

  const handleAuthLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isAuthSubmitting) return

    setAuthError("")
    setIsAuthSubmitting(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: authEmail.trim(),
          password: authPassword,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAuthError(data?.message ?? "Connexion impossible")
        return
      }

      setCurrentUser((data?.user as AuthUser) ?? null)
      closeAuthModal()
      router.refresh()

      const safeRedirect = resolveRedirectPath(postLoginRedirect)
      if (safeRedirect) {
        router.push(safeRedirect)
        return
      }

      if ((data?.user as AuthUser | undefined)?.role === "admin") {
        router.push("/admin/products")
      }
    } catch {
      setAuthError("Une erreur est survenue.")
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  const handleAuthSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isAuthSubmitting) return

    setAuthError("")
    const formattedSignupPhone = formatPhoneForStorage(signupPhone)
    if (!formattedSignupPhone) {
      setAuthError("Le telephone doit etre au format +216 XX XXX XXX.")
      return
    }
    setIsAuthSubmitting(true)

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail.trim(),
          phone: formattedSignupPhone,
          password: signupPassword,
          passwordConfirm: signupPasswordConfirm,
          surname: signupSurname.trim(),
          name: signupName.trim(),
        }),
      })

      const registerData = await registerRes.json().catch(() => ({}))
      if (!registerRes.ok) {
        setAuthError(registerData?.message ?? "Inscription impossible")
        return
      }

      // Auto-login after successful registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: signupEmail.trim() || formattedSignupPhone,
          password: signupPassword,
        }),
      })

      const loginData = await loginRes.json().catch(() => ({}))
      if (!loginRes.ok) {
        setAuthError("Compte cree. Connectez-vous avec vos identifiants.")
        switchAuthMode("login")
        setAuthEmail(signupEmail.trim() || formattedSignupPhone)
        return
      }

      setCurrentUser((loginData?.user as AuthUser) ?? null)
      closeAuthModal()
      router.refresh()

      const safeRedirect = resolveRedirectPath(postLoginRedirect)
      if (safeRedirect) {
        router.push(safeRedirect)
        return
      }

      if ((loginData?.user as AuthUser | undefined)?.role === "admin") {
        router.push("/admin/products")
      }
    } catch {
      setAuthError("Une erreur est survenue.")
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  // Wishlist behavior (desktop + mobile)
  const handleWishlistClick = () => {
    if (!currentUser) {
      openAuthModal(pathname)
      return
    }

    // user logged in -> go to wishlist page
    router.push("/Wishlist")
  }

  // read auth session on mount
  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" })
        if (!res.ok) {
          if (!cancelled) setCurrentUser(null)
          return
        }

        const data = await res.json()
        if (!cancelled) {
          setCurrentUser((data?.user as AuthUser) ?? null)
        }
      } catch {
        if (!cancelled) setCurrentUser(null)
      } finally {
        if (!cancelled) setIsAuthResolved(true)
      }
    }

    loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  // sync props -> state & fetch once if no categories were passed
  useEffect(() => {
    if (categoriesProp.length > 0) {
      setInternalCategories(categoriesProp.slice().sort(compareCategoryOrder))
      return
    }

    const controller = new AbortController()

    const load = async () => {
      try {
        const res = await fetch("/api/shop/categories", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error("Failed to fetch navbar categories")
        }
        const data = await res.json()
        const items = Array.isArray(data?.categories) ? data.categories : []

        const mapped: Category[] = items.map((c: any) => ({
          id: c.id,
          name: c.name ?? "",
          slug: c.slug ?? "",
          order: Number(c.order ?? 0),
          parent: c.parent ?? null,
          description: c.description ?? null,
        }))

        setInternalCategories(mapped.sort(compareCategoryOrder))
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Failed to fetch navbar categories", err)
        }
      }
    }

    load()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // IMPORTANT: only once on mount

  // close search on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      const inDesktopSearch = desktopSearchWrapRef.current?.contains(target)
      const inMobileSearch = mobileSearchWrapRef.current?.contains(target)
      const inDesktopResults = desktopSearchResultsRef.current?.contains(target)
      const inMobileResults = mobileSearchResultsRef.current?.contains(target)
      if (!inDesktopSearch && !inMobileSearch && !inDesktopResults && !inMobileResults) {
        setSearchOpen(false)
        setIsSearchExpanded(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // clamp profile dropdown horizontally when opened
  useEffect(() => {
    if (!isProfileOpen || !profileMenuRef.current) return

    const el = profileMenuRef.current
    const rect = el.getBoundingClientRect()
    const padding = 8 // margin from viewport edges

    let shift = 0

    if (rect.right > window.innerWidth - padding) {
      shift = window.innerWidth - padding - rect.right
    }

    if (rect.left < padding) {
      shift = padding - rect.left
    }

    setProfileShiftX(shift)
  }, [isProfileOpen])

  // root categories
  const rootCategories = internalCategories.filter((cat) => {
    if (Array.isArray(cat.parent)) return cat.parent.length === 0
    return !cat.parent
  }).sort(compareCategoryOrder)

  // children
  const getCategoryChildren = (parentId: string) =>
    internalCategories.filter((cat) => {
      if (Array.isArray(cat.parent)) return cat.parent.includes(parentId)
      return cat.parent === parentId
    }).sort(compareCategoryOrder)

  // toggle category expansion
  const toggleCategory = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const next = new Set(expandedCategories)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedCategories(next)
  }

  const closeSearchPanel = () => {
    setSearchOpen(false)
    setIsSearchExpanded(false)
  }

  const openSearchPanel = () => {
    setIsSearchExpanded(true)
    if (searchValue.trim()) {
      setSearchOpen(true)
    }

    requestAnimationFrame(() => {
      const input =
        window.innerWidth >= 768
          ? desktopSearchInputRef.current
          : mobileSearchInputRef.current
      input?.focus()
    })
  }

  const toggleSearchPanel = () => {
    if (isSearchExpanded) {
      closeSearchPanel()
      return
    }
    openSearchPanel()
  }

  // debounced searching (products from internal API + categories local)
  useEffect(() => {
    const q = searchValue.trim()
    if (!q) {
      setSearchOpen(false)
      setProductResults([])
      setCategoryResults([])
      setIsSearching(false)
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
      return
    }

    setSearchOpen(true)

    // category search
    const qLower = q.toLowerCase()
    const catMatches = internalCategories.filter((c) =>
      c.name.toLowerCase().includes(qLower)
    )
    setCategoryResults(catMatches.slice(0, 6))

    // debounce products search
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      try {
        setIsSearching(true)
        const params = new URLSearchParams({
          page: "1",
          perPage: "6",
          query: q,
          sort: "name",
        })
        const res = await fetch(`/api/shop/products?${params.toString()}`, {
          cache: "no-store",
        })
        if (!res.ok) {
          throw new Error("Navbar product search failed")
        }
        const data = await res.json()
        const items: Product[] = Array.isArray(data?.products) ? data.products : []

        setProductResults(items)
      } catch (err) {
        console.error("Navbar product search failed", err)
        setProductResults([])
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [searchValue, internalCategories])

  // recursive category list
  const CategoryList = ({
    items,
    level = 0,
  }: {
    items: Category[]
    level?: number
  }) => (
    <div className={level > 0 ? "ml-4 mt-2 space-y-2" : "space-y-2"}>
      {items.map((category) => {
        const children = getCategoryChildren(category.id)
        const isExpanded = expandedCategories.has(category.id)

        return (
          <div key={category.id}>
            <div className="flex items-center justify-between">
              <Link
                href={`/boutique/categorie/${category.slug}`}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                {category.name}
              </Link>

              {children.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => toggleCategory(category.id, e)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-black/5"
                  aria-label="Afficher les sous-catégories"
                >
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {isExpanded && children.length > 0 && (
              <CategoryList items={children} level={level + 1} />
            )}
          </div>
        )
      })}
    </div>
  )

  const LogoSwap = ({
    size = 60,
    scale = 1,
  }: {
    size?: number
    scale?: number
  }) => (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src="/logow.webp"
        alt="Logo"
        fill
        sizes="(max-width: 768px) 36px, 60px"
        className="object-contain"
        style={{ transform: `scale(${scale})` }}
        priority
      />
    </div>
  )

  const hasNoResults =
    !isSearching &&
    categoryResults.length === 0 &&
    productResults.length === 0

  const displayName =
    [currentUser?.surname, currentUser?.name].filter(Boolean).join(" ") ||
    currentUser?.email ||
    "Mon compte"
  const shouldShowSignupPromo = isAuthResolved && !currentUser && showSignupPromo
  const navSpacerClass = reserveSpace
    ? shouldShowSignupPromo
      ? isSearchExpanded
        ? "h-[156px] md:h-[172px]"
        : "h-[100px] md:h-[112px]"
      : isSearchExpanded
        ? "h-[116px] md:h-[132px]"
        : "h-[60px] md:h-[72px]"
    : null

  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.style.setProperty(
      "--navbar-offset-mobile",
      shouldShowSignupPromo
        ? isSearchExpanded
          ? "156px"
          : "100px"
        : isSearchExpanded
          ? "116px"
          : "60px"
    )
    root.style.setProperty(
      "--navbar-offset-desktop",
      shouldShowSignupPromo
        ? isSearchExpanded
          ? "172px"
          : "112px"
        : isSearchExpanded
          ? "132px"
          : "72px"
    )
  }, [shouldShowSignupPromo, isSearchExpanded])

  return (
    <NavbarCart currentUser={currentUser} onOpenChange={setIsCartPanelOpen}>
      {({ cartCount, openCart }) => (
    <>
      {shouldShowSignupPromo && (
        <div className="absolute inset-x-0 top-0 z-50 overflow-x-clip border-b border-red-700 bg-red-600 text-white">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-center px-10 sm:px-8">
            <p className="max-w-full text-center text-[12px] font-medium leading-tight whitespace-normal md:text-sm md:whitespace-nowrap">
              <button
                type="button"
                onClick={() => openAuthModal(pathname)}
                className="underline underline-offset-2"
              >
                Connectez-vous
              </button>{" "}
              et obtenez 10% de reduction sur votre premiere commande.
            </p>
            <button
              type="button"
              onClick={closeSignupPromo}
              className="absolute right-2 sm:right-4 inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-700/60"
              aria-label="Close promotion"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <nav
        className={`left-0 right-0 z-40 border-b border-black/10 bg-white text-black backdrop-blur-md transition-transform duration-300 md:translate-y-0 ${
          isMobileNavVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isDesktopMenuOpen ? "md:border-b-0" : ""
        } ${
          shouldShowSignupPromo
            ? hasPassedPromoBanner
              ? "fixed top-0"
              : "absolute top-10"
            : "fixed top-0"
        }`}
      >
        {/* Desktop */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center px-0 py-0.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 justify-self-start">
            <button
              type="button"
              onClick={() => setIsDesktopMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-black/5"
              aria-label="Ouvrir le menu desktop"
              aria-expanded={isDesktopMenuOpen}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 origin-center bg-accent transition-all duration-300   ${
                    isDesktopMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 bg-accent transition-all duration-300 ${
                    isDesktopMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[14px] h-0.5 w-5 origin-center bg-accent transition-all duration-300 ${
                    isDesktopMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={toggleSearchPanel}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-black/5 ${
                isSearchExpanded ? "bg-black/5" : ""
              }`}
              aria-label="Afficher la recherche"
              aria-expanded={isSearchExpanded}
              aria-controls="desktop-navbar-search"
            >
              <Search size={20} />
            </button>
          </div>

          <Link href="/" className="flex items-center gap-3 justify-self-center">
            <LogoSwap size={70} scale={1.2} />
          </Link>
          {/* Icons desktop */}
          <div className="flex items-center gap-4 justify-self-end">
            {/* Wishlist button visible only for logged-in users */}
            {currentUser && (
              <button
                type="button"
                className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
                aria-label="Favoris"
                onClick={handleWishlistClick}
              >
                <Heart size={20} />
              </button>
            )}

            {/* Cart with badge */}
            <button
              type="button"
              className="relative p-2 hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Panier"
              onClick={openCart}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-accent text-white text-[10px] font-semibold px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Profile + centered dropdown with delay */}
            <div
              className="relative"
              onMouseEnter={currentUser ? handleProfileEnter : undefined}
              onMouseLeave={currentUser ? handleProfileLeave : undefined}
            >
              <button
                type="button"
                className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
                aria-label="Compte"
                onClick={() => {
                  if (!currentUser) {
                    openAuthModal(pathname)
                    return
                  }
                  setIsProfileOpen((v) => !v)
                }}
              >
                <User size={20} />
              </button>

              {currentUser && isProfileOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute left-1/2 top-full mt-2 w-60 max-w-[calc(100vw-4rem)] space-y-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-black shadow-lg"
                  style={{
                    transform: `translateX(calc(-50% + ${profileShiftX}px))`,
                  }}
                >
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                    Mon compte
                  </div>

                  <div className="space-y-1">
                      {/* Full name / Profile */}
<Link
  href={currentUser?.role === "admin" ? "/admin" : "/commandes"}
  className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
  onClick={() => setIsProfileOpen(false)}
>
  <div className="flex items-center gap-2">
    <User className="h-4 w-4 opacity-80" />
    <span className="font-medium truncate">{displayName}</span>
  </div>
  <ChevronRight className="h-3 w-3 opacity-50" />
</Link>

                      {/* Orders */}
                    {currentUser?.role !== "admin" && (
  <Link
    href="/commandes"
    className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
    onClick={() => setIsProfileOpen(false)}
  >
    <div className="flex items-center gap-2">
      <PackageIcon className="h-4 w-4 opacity-80" />
      <span>Mes commandes</span>
    </div>
    <ChevronRight className="h-3 w-3 opacity-50" />
  </Link>
)}

                      {/* Settings */}
                      <Link
                        href={currentUser?.role === "admin" ? "/admin" : "/commandes"}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 opacity-80" />
                          <span>Paramètres</span>
                        </div>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </Link>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 opacity-80 text-red-500" />
                          <span className="text-red-500">Se déconnecter</span>
                        </div>
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          id="desktop-navbar-search"
          className={`hidden md:block overflow-hidden transition-all duration-300 ease-out ${
            isSearchExpanded ? "max-h-[96px] opacity-100 pb-2" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!isSearchExpanded}
        >
          <div className="mx-auto max-w-7xl px-0">
            <div className="relative w-full" ref={desktopSearchWrapRef}>
              <div className="flex w-full items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-5 py-2 transition-colors">
                <Search size={18} className="opacity-70" />
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  placeholder="Rechercher Categorie , Produit ..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => {
                    setIsSearchExpanded(true)
                    if (searchValue.trim()) setSearchOpen(true)
                  }}
                  className="flex-1 bg-transparent text-sm text-black outline-none placeholder-gray-600 placeholder-opacity-70"
                />
              </div>

            </div>
          </div>
        </div>
        <div
          className={`hidden md:block overflow-hidden bg-white transition-all duration-300 ease-out ${
            isDesktopMenuOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!isDesktopMenuOpen}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto whitespace-nowrap px-0 py-4">
            {rootCategories.map((category) => (
              <Link
                key={category.id}
                href={`/boutique/categorie/${category.slug}`}
                className="text-sm font-extrabold hover:opacity-70 transition-opacity"
              >
                {category.name}
              </Link>
            ))}

            <Link
              href="/Nouveautes"
              className="text-sm font-extrabold hover:opacity-70 transition-opacity"
            >
              Nouveautés
            </Link>

            <Link
              href="/Promotions"
              className="text-sm font-extrabold text-red-600 transition-colors hover:text-red-700"
            >
              Promotions
            </Link>

            <Link
              href="/#contact"
              className="text-sm font-extrabold hover:opacity-70 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
        {/* Mobile */}
        <div className="md:hidden relative" ref={mobileSearchWrapRef}>
          <div className="relative flex items-center justify-between px-2 py-2.5">
            <button
              type="button"
              onClick={toggleSearchPanel}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-black/5 ${
                isSearchExpanded ? "bg-black/5" : ""
              }`}
              aria-label="Afficher la recherche"
              aria-expanded={isSearchExpanded}
            >
              <Search size={18} />
            </button>

            <Link
              href="/"
              className="absolute left-1/2 flex -translate-x-1/2 items-center"
              aria-label="Accueil"
            >
              <LogoSwap size={36} scale={1.25} />
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 hover:opacity-70 transition-opacity"
                aria-label="Compte"
                onClick={() => {
                  if (!currentUser) {
                    openAuthModal(pathname)
                    return
                  }
                  if (currentUser?.role === "admin") {
                    router.push("/admin")
                    return
                  }
                  setIsProfileOpen((v) => !v)
                }}
              >
                <User size={20} />
              </button>

              <button
                type="button"
                onClick={openCart}
                aria-label="Panier"
                className="relative p-1 hover:opacity-70 transition-opacity"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-accent text-white text-[10px] font-semibold px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen)
                  closeSearchPanel()
                }}
                className={`p-2 transition-all duration-300 hover:opacity-70 ${isMenuOpen ? "rotate-90" : "rotate-0"}`}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              isSearchExpanded ? "max-h-20 opacity-100 pb-2" : "max-h-0 opacity-0"
            }`}
            aria-hidden={!isSearchExpanded}
          >
            <div className="px-2">
              <div className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 transition-colors">
                <Search size={16} className="opacity-70" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Rechercher..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => {
                    setIsSearchExpanded(true)
                    if (searchValue.trim()) setSearchOpen(true)
                  }}
                  className="w-full bg-transparent text-xs text-black outline-none placeholder-gray-600 placeholder-opacity-70"
                />
              </div>
            </div>
          </div>

        </div>
        {/* Mobile panel */}
        <div
          className={`border-t border-black/10 bg-white text-black transition-all duration-300 ease-out md:hidden ${
            isMenuOpen ? "max-h-[calc(100vh-80px)] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div className="overflow-y-auto p-4">

            {/* Mobile links */}
            <div className="space-y-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Accueil
              </Link>

   

              <Link
                href="/Nouveautes"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Nouveautés
              </Link>

              <Link
                href="/Promotions"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium text-red-600 transition-colors hover:text-red-700"
              >
                Promotions
              </Link>

     
              <Link
                href="/#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium hover:opacity-70 transition-opacity"
              >
                Contact
              </Link>

              {/* Mobile Boutique Categories */}
              <div>
                <button
                  type="button"
                  onClick={(e) => toggleCategory("mobile-boutique", e)}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity w-full"
                  aria-label="Afficher ou masquer les categories"
                >
                  Catégories
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      expandedCategories.has("mobile-boutique")
                        ? "rotate-90"
                        : ""
                    }`}
                  />
                </button>

                {expandedCategories.has("mobile-boutique") && (
                  <div className="mt-3 ml-2">
                    <CategoryList items={rootCategories} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </nav>

      {isSearchExpanded && searchOpen && (
        <>
          <div
            className="pointer-events-none fixed left-0 right-0 z-[45] hidden md:block"
            style={{ top: "var(--navbar-offset-desktop)" }}
          >
            <div className="mx-auto max-w-7xl px-0">
              <div
                ref={desktopSearchResultsRef}
                className="pointer-events-auto mt-2 overflow-hidden rounded-xl border border-black/10 bg-white text-black transition-colors"
              >
                <div className="max-h-96 overflow-y-auto px-2 py-2">
                  {categoryResults.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                        Categories
                      </div>
                      <div className="space-y-1">
                        {categoryResults.map((c) => (
                          <Link
                            key={c.id}
                            href={`/boutique/categorie/${c.slug}`}
                            onClick={closeSearchPanel}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-foreground/5"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-black/5">
                              <LayoutGrid className="h-4 w-4 opacity-80" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {c.name}
                              </div>
                              <div className="text-xs opacity-60">
                                Categorie
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {productResults.length > 0 && (
                    <div className="mb-1">
                      <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                        Produits
                      </div>
                      <div className="space-y-1">
                        {productResults.map((p) => {
                          const firstImg =
                            Array.isArray(p.imageUrls) && p.imageUrls.length > 0
                              ? p.imageUrls[0]!
                              : "/placeholder-square.webp"

                          return (
                            <Link
                              key={p.id}
                              href={`/shop/${p.slug}`}
                              onClick={closeSearchPanel}
                              className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-foreground/5"
                            >
                              <div className="relative h-12 w-12 overflow-hidden rounded-md flex-shrink-0">
                                <Image
                                  src={firstImg}
                                  alt={p.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {p.name}
                                </div>
                                <div className="text-xs opacity-70 truncate">
                                  Reference: {p.sku}
                                </div>
                                {p.description && (
                                  <div className="text-xs opacity-70 line-clamp-2">
                                    {p.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {hasNoResults && (
                    <div className="flex items-center gap-3 rounded-lg bg-foreground/5 px-3 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground/5">
                        <PackageOpen className="h-5 w-5 opacity-70" />
                      </div>
                      <div className="text-sm opacity-70">
                        Aucun resultat trouve.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none fixed left-0 right-0 z-[45] md:hidden"
            style={{ top: "var(--navbar-offset-mobile)" }}
          >
            <div
              ref={mobileSearchResultsRef}
              className="pointer-events-auto overflow-hidden border-x border-b border-black/10 bg-white text-black transition-colors"
            >
              <div className="max-h-80 overflow-y-auto px-2 py-2">
                {categoryResults.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                      Categories
                    </div>
                    <div className="space-y-1">
                      {categoryResults.map((c) => (
                        <Link
                          key={c.id}
                          href={`/boutique/categorie/${c.slug}`}
                          onClick={() => {
                            closeSearchPanel()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-black/5"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground/5">
                            <LayoutGrid className="h-4 w-4 opacity-80" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {c.name}
                            </div>
                            <div className="text-xs opacity-60">
                              Categorie
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {productResults.length > 0 && (
                  <div className="mb-1">
                    <div className="px-2 py-1 text-xs uppercase tracking-wider opacity-60">
                      Produits
                    </div>
                    <div className="space-y-1">
                      {productResults.map((p) => {
                        const firstImg =
                          Array.isArray(p.imageUrls) && p.imageUrls.length > 0
                            ? p.imageUrls[0]!
                            : "/placeholder-square.webp"

                        return (
                          <Link
                            key={p.id}
                            href={`/shop/${p.slug}`}
                            onClick={() => {
                              closeSearchPanel()
                              setIsMenuOpen(false)
                            }}
                            className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:opacity-80 hover:bg-foreground/5"
                          >
                            <div className="relative h-12 w-12 overflow-hidden rounded-md flex-shrink-0">
                              <Image
                                src={firstImg}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {p.name}
                              </div>
                              <div className="text-xs opacity-70 truncate">
                                Reference: {p.sku}
                              </div>
                              {p.description && (
                                <div className="text-xs opacity-70 line-clamp-2">
                                  {p.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {hasNoResults && (
                  <div className="flex items-center gap-3 rounded-lg bg-foreground/5 px-3 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground/5">
                      <PackageOpen className="h-5 w-5 opacity-70" />
                    </div>
                    <div className="text-sm opacity-70">
                      Aucun resultat trouve.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {navSpacerClass ? <div aria-hidden className={navSpacerClass} /> : null}

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={closeAuthModal}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-black/10 bg-white text-black shadow-2xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
              <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-foreground/10 blur-3xl" />
            </div>

            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 transition-colors hover:bg-white"
              aria-label="Fermer la connexion"
            >
              <X size={16} />
            </button>

            <div className="relative px-6 pb-6 pt-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                Mon compte
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                {authMode === "login" ? "Connexion" : "Creer un compte"}
              </h2>
              <p className="mt-1 text-sm text-black/60">
                {authMode === "login"
                  ? "Connectez-vous pour suivre vos commandes et gerer vos favoris."
                  : "Inscrivez-vous rapidement, puis suivez vos commandes en direct."}
              </p>

              {authError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {authError}
                </div>
              )}

              <div
                className="mt-5 relative overflow-hidden transition-[height] duration-300 ease-out"
                style={authPanelHeight != null ? { height: `${authPanelHeight}px` } : undefined}
              >
                <div
                  ref={authLoginPanelRef}
                  className={`transition-transform duration-300 ease-out ${
                    authMode === "login"
                      ? "relative translate-x-0 opacity-100"
                      : "pointer-events-none absolute inset-0 -translate-x-4 opacity-0"
                  }`}
                >
                  <form className="space-y-3" onSubmit={handleAuthLogin}>
                    <div className="space-y-1.5">
                      <label htmlFor="auth-email" className="text-sm font-medium">
                        Email ou telephone <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="auth-email"
                        type="text"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                        placeholder="vous@domaine.com ou +216..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="auth-password" className="text-sm font-medium">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="auth-password"
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                        placeholder="********"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthSubmitting}
                      className="mt-1 h-11 w-full rounded-xl bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAuthSubmitting ? "Connexion en cours..." : "Se connecter"}
                    </button>
                  </form>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialLoginClick("google")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/15 bg-white text-sm font-medium transition-colors hover:bg-black/[0.03]"
                    >
                      <span className="font-bold text-[13px]">G</span>
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLoginClick("facebook")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/15 bg-white text-sm font-medium transition-colors hover:bg-black/[0.03]"
                    >
                      <span className="font-bold text-[13px]">f</span>
                      <span>Facebook</span>
                    </button>
                  </div>

                  <p className="mt-4 text-center text-sm text-black/60">
                    Pas de compte ?{" "}
                    <button
                      type="button"
                      onClick={() => switchAuthMode("signup")}
                      className="font-semibold text-accent transition-opacity hover:opacity-80"
                    >
                      S&apos;inscrire
                    </button>
                  </p>
                </div>

                <div
                  ref={authSignupPanelRef}
                  className={`transition-transform duration-300 ease-out ${
                    authMode === "signup"
                      ? "relative translate-x-0 opacity-100"
                      : "pointer-events-none absolute inset-0 translate-x-4 opacity-0"
                  }`}
                >
                  <form className="space-y-3" onSubmit={handleAuthSignup}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="signup-surname" className="text-sm font-medium">
                          Prenom <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="signup-surname"
                          type="text"
                          required
                          minLength={2}
                          value={signupSurname}
                          onChange={(e) => setSignupSurname(e.target.value)}
                          className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                          placeholder="Votre prenom"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="signup-name" className="text-sm font-medium">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="signup-name"
                          type="text"
                          required
                          minLength={2}
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="signup-phone" className="text-sm font-medium">
                        Telephone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 border-r border-black/15 pr-3 text-sm font-semibold text-black/60">
                          {PHONE_PREFIX}
                        </span>
                        <input
                          id="signup-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          required
                          value={signupPhone}
                          onChange={(e) =>
                            setSignupPhone(
                              formatPhoneDigits(extractLocalPhoneDigits(e.target.value))
                            )
                          }
                          className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 pl-16 text-sm outline-none transition focus:border-accent"
                          placeholder="20 123 456"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="signup-email" className="text-sm font-medium">
                        Email <span className="text-black/40">(optionnel)</span>
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                        placeholder="vous@domaine.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="signup-password" className="text-sm font-medium">
                          Mot de passe <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="signup-password"
                          type="password"
                          required
                          minLength={8}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                          placeholder="********"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="signup-password-confirm" className="text-sm font-medium">
                          Confirmation <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="signup-password-confirm"
                          type="password"
                          required
                          minLength={8}
                          value={signupPasswordConfirm}
                          onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                          className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                          placeholder="********"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthSubmitting}
                      className="mt-1 h-11 w-full rounded-xl bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAuthSubmitting ? "Creation en cours..." : "Creer mon compte"}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-sm text-black/60">
                    Deja inscrit ?{" "}
                    <button
                      type="button"
                      onClick={() => switchAuthMode("login")}
                      className="font-semibold text-accent transition-opacity hover:opacity-80"
                    >
                      Se connecter
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
      )}
    </NavbarCart>
  )
}

