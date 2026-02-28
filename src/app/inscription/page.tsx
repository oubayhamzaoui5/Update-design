'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useMemo, useState } from 'react'

import { getPb } from '@/lib/pb'

const PHONE_PREFIX = '+216'
const GUEST_CART_KEY = 'guest_cart'

type GuestCartItem = {
  productId: string
  quantity: number
}

function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (it) => it && typeof it.productId === 'string' && typeof it.quantity === 'number'
    )
  } catch {
    return []
  }
}

function clearGuestCart() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(GUEST_CART_KEY)
  } catch {
    // ignore
  }
}

export default function InscriptionPage() {
  const router = useRouter()
  const [nextPath, setNextPath] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginHref = useMemo(() => {
    if (!nextPath) return '/connexion'
    return `/connexion?next=${encodeURIComponent(nextPath)}`
  }, [nextPath])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setNextPath(params.get('next'))
  }, [])

  const createCartFromGuestCart = async (pb: any) => {
    if (typeof window === 'undefined') return

    const userId = pb.authStore.model?.id
    if (!userId) return

    const guestItems = getGuestCart()
    if (guestItems.length === 0) return

    for (const item of guestItems) {
      const qty = Number(item.quantity ?? 1)
      if (!item.productId || qty <= 0) continue

      await pb.collection('cart_items').create({
        user: userId,
        product: item.productId,
        quantity: qty,
      })
    }

    clearGuestCart()
    window.dispatchEvent(new Event('cart:updated'))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    const fullPhone = `${PHONE_PREFIX} ${phone.trim()}`

    try {
      setIsSubmitting(true)
      const pb = getPb(true)

      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: confirmPassword,
        surname: firstName.trim(),
        name: lastName.trim(),
        role: 'customer',
        phone: fullPhone,
        emailVisibility: false,
      })

      await pb.collection('users').authWithPassword(email, password)

      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: pb.authStore.token,
            user: pb.authStore.model,
          }),
        })
      } catch {
        // ignore sync failure
      }

      try {
        await createCartFromGuestCart(pb)
      } catch (cartErr) {
        console.error('Erreur de migration panier invité', cartErr)
      }

      setSuccess('Compte créé avec succès. Redirection en cours...')
      setTimeout(() => {
        router.push(nextPath || '/')
      }, 1000)
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Une erreur est survenue, veuillez réessayer.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-foreground/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl rounded-2xl border border-border/60 bg-card/95 p-6 shadow-xl backdrop-blur md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Nouveau client</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Créer un compte</h1>
        <p className="mt-2 text-sm text-muted-foreground">Inscrivez-vous pour suivre vos commandes et enregistrer vos favoris.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              placeholder="vous@domaine.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Téléphone</label>
            <div className="flex">
              <div className="flex items-center rounded-l-xl border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                {PHONE_PREFIX}
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 rounded-r-xl border border-l-0 border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                placeholder="20 123 456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Vous avez déjà un compte ?{' '}
          <Link href={loginHref} className="font-semibold text-accent hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
