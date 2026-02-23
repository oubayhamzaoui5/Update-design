'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { useAuth } from '@/lib/auth/client'

export default function ConnexionPage() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const nextPath = searchParams.get('next')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password, nextPath ?? undefined)
      if (!result.success) {
        setError(result.error || 'Identifiants invalides.')
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const inscriptionHref = nextPath
    ? `/inscription?next=${encodeURIComponent(nextPath)}`
    : '/inscription'

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-foreground/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card/95 p-6 shadow-xl backdrop-blur md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Mon compte</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour suivre vos commandes et gérer vos favoris.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              placeholder="vous@domaine.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-xl bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link href={inscriptionHref} className="font-semibold text-accent hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  )
}
