import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  FileText,
  Layers,
  MessageSquareText,
  MousePointerClick,
  Plus,
  Sparkles,
} from 'lucide-react'

import { EDITABLE_CATALOGUE_KEYS, EDITABLE_CATALOGUE_META } from '@/lib/catalogue/editable-catalogue'
import { getAdminQuoteRequests, getAdminShowroomSummary } from '@/lib/admin/data'
import { getDefaultEditableCatalogueContent } from '@/lib/catalogue/editable-catalogue-defaults'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'
import type { QuoteRequestStatus } from '@/types/quote-request.types'

export const dynamic = 'force-dynamic'

const STATUS_META: Record<QuoteRequestStatus, { label: string; dot: string; chip: string }> = {
  new: { label: 'Nouveau', dot: 'bg-[#C4A23E]', chip: 'bg-[#C4A23E]/12 text-[#8A6D1B]' },
  contacted: { label: 'Contacté', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700' },
  quote_sent: { label: 'Devis envoyé', dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  won: { label: 'Gagné', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  lost: { label: 'Perdu', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-600' },
}

function relativeTime(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr.replace(' ', 'T'))
  const diff = Date.now() - d.getTime()
  if (Number.isNaN(diff)) return ''
  const mins = Math.round(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 30) return `il y a ${days} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'UD'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export default async function DashboardPage() {
  const [summary, requests, catalogueHealth] = await Promise.all([
    getAdminShowroomSummary(),
    getAdminQuoteRequests(),
    Promise.all(
      EDITABLE_CATALOGUE_KEYS.map(async (key) => {
        const fallback = await getDefaultEditableCatalogueContent(key)
        const content = await getEditableCatalogueContent(key, fallback)
        const allItems = [...content.models, ...content.products, ...content.accessories]
        const missingImages = allItems.filter((item) => !item.image).length

        return {
          key,
          meta: EDITABLE_CATALOGUE_META[key],
          total: allItems.length,
          missingImages,
        }
      })
    ),
  ])

  const latestRequests = requests.slice(0, 5)
  const needsAttention = catalogueHealth.filter((page) => page.total === 0 || page.missingImages > 0)
  const totalImages = catalogueHealth.reduce((sum, p) => sum + p.total, 0)
  const totalMissing = catalogueHealth.reduce((sum, p) => sum + p.missingImages, 0)
  const completeness = totalImages > 0 ? Math.round(((totalImages - totalMissing) / totalImages) * 100) : 100

  const stats = [
    {
      label: 'Nouvelles demandes',
      value: summary.quoteRequestsNew,
      hint: 'à traiter',
      icon: MessageSquareText,
      href: '/admin/devis',
      accent: true,
    },
    {
      label: 'Demandes totales',
      value: summary.quoteRequestsTotal,
      hint: 'depuis le début',
      icon: FileText,
      href: '/admin/devis',
    },
    {
      label: "Visiteurs aujourd'hui",
      value: summary.visitsToday,
      hint: 'visiteurs uniques',
      icon: MousePointerClick,
      href: '/admin',
    },
    {
      label: 'Références catalogue',
      value: summary.catalogueItems,
      hint: 'éléments publiés',
      icon: Layers,
      href: '/admin/catalogue',
    },
  ]

  return (
    <div className="min-h-screen px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#1C1A14]/8 bg-white px-3 py-1 text-[11px] font-semibold text-[#8A8475]">
              <Sparkles size={12} className="text-[#C4A23E]" />
              Showroom Update Design
            </div>
            <h1
              className="text-[28px] font-bold tracking-tight text-[#1C1A14] md:text-[32px]"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Tableau de bord
            </h1>
            <p className="mt-1 text-sm text-[#7C766A]">
              Pilotez les demandes de devis, le catalogue et les pages publiques.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/devis"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1C1A14] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a2620]"
            >
              <MessageSquareText size={15} className="text-[#C4A23E]" /> Voir les devis
            </Link>
            <Link
              href="/admin/catalogue"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1C1A14]/12 bg-white px-4 py-2.5 text-sm font-semibold text-[#1C1A14] transition hover:border-[#C4A23E]/50 hover:bg-[#C4A23E]/[0.04]"
            >
              <Plus size={15} /> Modifier le catalogue
            </Link>
          </div>
        </header>

        {/* Stat cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative overflow-hidden rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(28,26,20,0.08)] ${
                  item.accent ? 'border-[#C4A23E]/35' : 'border-[#1C1A14]/8'
                }`}
              >
                {item.accent && (
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#C4A23E]/10 blur-xl" />
                )}
                <div className="relative mb-6 flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      item.accent ? 'bg-[#C4A23E] text-[#1C1A14]' : 'bg-[#1C1A14]/[0.06] text-[#1C1A14]'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <ArrowUpRight size={16} className="text-[#C5BFB0] transition group-hover:text-[#C4A23E]" />
                </div>
                <p className="relative text-[30px] font-bold leading-none tracking-tight text-[#1C1A14]">
                  {item.value}
                </p>
                <p className="relative mt-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#1C1A14]">
                  {item.label}
                </p>
                <p className="relative mt-0.5 text-xs text-[#9A9486]">{item.hint}</p>
              </Link>
            )
          })}
        </section>

        {/* Two columns */}
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Latest requests */}
          <section className="overflow-hidden rounded-2xl border border-[#1C1A14]/8 bg-white">
            <div className="flex items-center justify-between border-b border-[#1C1A14]/8 px-5 py-4">
              <div>
                <h2 className="text-[15px] font-bold text-[#1C1A14]">Dernières demandes</h2>
                <p className="mt-0.5 text-xs text-[#9A9486]">Les nouveaux prospects arrivent ici.</p>
              </div>
              <Link
                href="/admin/devis"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1C1A14] transition hover:bg-[#1C1A14]/[0.05]"
              >
                Tout voir <ArrowRight size={13} className="text-[#C4A23E]" />
              </Link>
            </div>
            <div className="divide-y divide-[#1C1A14]/6">
              {latestRequests.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1C1A14]/[0.05] text-[#9A9486]">
                    <MessageSquareText size={18} />
                  </span>
                  <p className="text-sm font-semibold text-[#1C1A14]">Aucune demande pour le moment</p>
                  <p className="text-xs text-[#9A9486]">Les demandes de devis du site apparaîtront ici.</p>
                </div>
              ) : (
                latestRequests.map((request) => {
                  const meta = STATUS_META[request.status]
                  return (
                    <Link
                      key={request.id}
                      href="/admin/devis"
                      className="flex items-center gap-3.5 px-5 py-3.5 transition hover:bg-[#C4A23E]/[0.04]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C1A14] text-[12px] font-bold text-[#C4A23E]">
                        {initials(request.name || 'Update Design')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#1C1A14]">
                          {request.name || 'Client showroom'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#9A9486]">
                          {request.phone || 'Sans téléphone'} · {request.items.length} référence
                          {request.items.length > 1 ? 's' : ''}
                          {request.created ? ` · ${relativeTime(request.created)}` : ''}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.chip}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </section>

          {/* Catalogue health */}
          <section className="overflow-hidden rounded-2xl border border-[#1C1A14]/8 bg-white">
            <div className="flex items-center justify-between border-b border-[#1C1A14]/8 px-5 py-4">
              <div>
                <h2 className="text-[15px] font-bold text-[#1C1A14]">Santé du catalogue</h2>
                <p className="mt-0.5 text-xs text-[#9A9486]">Complétude des images et des pages.</p>
              </div>
              {needsAttention.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C4A23E]/12 px-2.5 py-1 text-[11px] font-bold text-[#8A6D1B]">
                  <AlertTriangle size={12} /> {needsAttention.length} à revoir
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 size={12} /> Complet
                </span>
              )}
            </div>

            {/* Completeness bar */}
            <div className="border-b border-[#1C1A14]/6 px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1C1A14]">Complétude des images</span>
                <span className="font-bold text-[#1C1A14]">{completeness}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#1C1A14]/8">
                <div
                  className="h-full rounded-full bg-[#C4A23E] transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#9A9486]">
                {totalMissing > 0 ? `${totalMissing} image${totalMissing > 1 ? 's' : ''} manquante${totalMissing > 1 ? 's' : ''}` : 'Toutes les images sont en place'}
              </p>
            </div>

            <div className="max-h-[320px] divide-y divide-[#1C1A14]/6 overflow-y-auto">
              {catalogueHealth.map((page) => {
                const ok = page.total > 0 && page.missingImages === 0
                return (
                  <div key={page.key} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        page.total === 0 ? 'bg-rose-400' : page.missingImages > 0 ? 'bg-[#C4A23E]' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1C1A14]">{page.meta.title}</p>
                      <p className="mt-0.5 truncate text-xs text-[#9A9486]">
                        {page.total} élément{page.total > 1 ? 's' : ''}
                        {ok ? ' · complet' : ` · ${page.missingImages} image${page.missingImages > 1 ? 's' : ''} manquante${page.missingImages > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <a
                        href={page.meta.href}
                        target="_blank"
                        rel="noreferrer"
                        title="Voir la page"
                        className="rounded-lg border border-[#1C1A14]/8 p-1.5 text-[#9A9486] transition hover:border-[#1C1A14]/15 hover:text-[#1C1A14]"
                      >
                        <Eye size={14} />
                      </a>
                      <Link
                        href={`/admin/catalogue/${page.key}`}
                        title="Modifier"
                        className="rounded-lg bg-[#1C1A14] p-1.5 text-[#C4A23E] transition hover:bg-[#2a2620]"
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
