'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'

export type QuoteCartItem = {
  id: string
  category: string
  type: 'Modele' | 'Texture' | 'Accessoire'
  name: string
  ref?: string
  image?: string
  quantity: number
}

const STORAGE_KEY = 'update_design_quote_cart_v1'
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"

function readItems(): QuoteCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => item?.id && item?.name && item?.category)
  } catch {
    return []
  }
}

function writeItems(items: QuoteCartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('quote-cart:updated'))
}

export function addQuoteItem(item: Omit<QuoteCartItem, 'quantity'>, quantity = 1) {
  const items = readItems()
  const existing = items.find((entry) => entry.id === item.id)
  const next = existing
    ? items.map((entry) =>
        entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry
      )
    : [...items, { ...item, quantity }]
  writeItems(next)
}

export function QuoteButton({
  item,
  compact = false,
  label = 'Demander un devis',
  openDevis = true,
}: {
  item: Omit<QuoteCartItem, 'quantity'>
  compact?: boolean
  label?: string
  openDevis?: boolean
}) {
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        addQuoteItem(item)
        setAdded(true)
        if (openDevis) {
          window.setTimeout(() => {
            window.location.href = '/devis'
          }, 120)
        }
        window.setTimeout(() => setAdded(false), 1600)
      }}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:opacity-90"
      style={{ background: GOLD, minHeight: compact ? 40 : 46 }}
    >
      {added ? 'Ajoute au devis' : label}
      <ArrowRight size={12} />
    </button>
  )
}

export function QuoteCartPanel() {
  const [items, setItems] = useState<QuoteCartItem[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const sync = () => setItems(readItems())
    sync()
    window.addEventListener('quote-cart:updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('quote-cart:updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const grouped = useMemo(() => {
    return items.reduce<Record<string, QuoteCartItem[]>>((acc, item) => {
      const key = item.category
      acc[key] = acc[key] ?? []
      acc[key].push(item)
      return acc
    }, {})
  }, [items])

  const updateQuantity = (id: string, quantity: number) => {
    const next = quantity < 1
      ? items.filter((item) => item.id !== id)
      : items.map((item) => (item.id === id ? { ...item, quantity } : item))
    setItems(next)
    writeItems(next)
  }

  const summary = items
    .map((item) => `${item.category} | ${item.type} | ${item.ref ? `${item.ref} - ` : ''}${item.name} x${item.quantity}`)
    .join('\n')

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Bonjour Update Design,\nJe souhaite un devis pour:\n${summary || '-'}\n\nNotes: ${notes || '-'}`
  )}`

  return (
    <main className="min-h-screen px-6 py-28 md:px-10" style={{ fontFamily: BODY, background: CREAM, color: DARK }}>
      <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.72fr_0.28fr]">
        <section>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
            Panier devis
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 0.9, fontWeight: 400 }}>
            Votre selection
            <br />
            <em style={{ color: 'rgba(20,19,15,0.48)' }}>catalogue.</em>
          </h1>

          {items.length === 0 ? (
            <div className="mt-10 border border-[#14130F]/10 bg-white p-8">
              <p className="text-sm font-semibold text-[#14130F]/58">Aucun article ajoute pour le moment.</p>
              <Link href="/#nos-categories" className="mt-6 inline-flex items-center gap-3 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: GOLD }}>
                Explorer le catalogue <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-8">
              {Object.entries(grouped).map(([category, categoryItems]) => (
                <div key={category}>
                  <div className="mb-4 flex items-center gap-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>{category}</p>
                    <div className="h-px flex-1 bg-[#14130F]/20" />
                  </div>
                  <div className="grid gap-3">
                    {categoryItems.map((item) => (
                      <article key={item.id} className="grid gap-4 border border-[#14130F]/10 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>{item.type}{item.ref ? ` | ${item.ref}` : ''}</p>
                          <h2 className="mt-2 text-lg font-black text-[#14130F]">{item.name}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label="Reduire quantite" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-10 w-10 items-center justify-center border border-[#14130F]/12 bg-[#F7F2E8]">
                            <Minus size={14} />
                          </button>
                          <span className="flex h-10 min-w-10 items-center justify-center border border-[#14130F]/12 bg-white text-sm font-bold">{item.quantity}</span>
                          <button type="button" aria-label="Augmenter quantite" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-10 w-10 items-center justify-center border border-[#14130F]/12 bg-[#F7F2E8]">
                            <Plus size={14} />
                          </button>
                          <button type="button" aria-label="Retirer" onClick={() => updateQuantity(item.id, 0)} className="flex h-10 w-10 items-center justify-center border border-[#14130F]/12 bg-white text-[#14130F]/55">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-28">
          <div className="border border-[#14130F]/10 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Finaliser</p>
            <p className="mt-4 text-sm leading-7 text-[#14130F]/58">
              Ajoutez vos dimensions, surface, ville ou urgence. Vous pouvez envoyer la demande ou continuer a explorer.
            </p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              className="mt-5 w-full border border-[#14130F]/12 bg-[#F7F2E8] p-4 text-sm outline-none focus:border-[#C4A23E]"
              placeholder="Surface, dimensions, ville, delai..."
            />
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-3 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white" style={{ background: GOLD }}>
              Proceed devis <ArrowRight size={13} />
            </a>
            <Link href="/#nos-categories" className="mt-3 inline-flex w-full items-center justify-center gap-3 border border-[#14130F]/16 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#14130F]">
              Continuer exploration
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
