'use client'

import { Fragment, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  MessageCircle,
  Phone,
  Search,
  Send,
  Trash2,
} from 'lucide-react'

import EmptyState from '@/components/admin/empty-state'
import type { QuoteRequestRecord, QuoteRequestStatus } from '@/types/quote-request.types'

import { deleteQuoteRequestAction, updateQuoteRequestAction } from './actions'

const statusLabels: Record<QuoteRequestStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacte',
  quote_sent: 'Devis envoye',
  won: 'Gagne',
  lost: 'Perdu',
}

const statusClasses: Record<QuoteRequestStatus, string> = {
  new: 'bg-amber-50 text-amber-700',
  contacted: 'bg-sky-50 text-sky-700',
  quote_sent: 'bg-indigo-50 text-indigo-700',
  won: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-slate-100 text-slate-600',
}

const statuses = Object.keys(statusLabels) as QuoteRequestStatus[]

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, '')
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export default function QuoteRequestsClient({
  initialRequests,
}: {
  initialRequests: QuoteRequestRecord[]
}) {
  const [requests, setRequests] = useState(initialRequests)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteRequestStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(requests[0]?.id ?? null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return requests.filter((request) => {
      const haystack = [
        request.name,
        request.phone,
        request.email,
        request.city,
        request.notes,
        ...request.items.map((item) => `${item.category} ${item.ref ?? ''} ${item.name}`),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return (!q || haystack.includes(q)) && (statusFilter === 'all' || request.status === statusFilter)
    })
  }, [requests, query, statusFilter])

  const stats = useMemo(() => ({
    total: requests.length,
    new: requests.filter((request) => request.status === 'new').length,
    active: requests.filter((request) => request.status === 'contacted' || request.status === 'quote_sent').length,
    won: requests.filter((request) => request.status === 'won').length,
  }), [requests])

  async function updateRequest(id: string, data: { status?: QuoteRequestStatus; adminNotes?: string }) {
    const previous = requests
    setSavingId(id)
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, ...data } : request))
    )

    try {
      const result = await updateQuoteRequestAction(id, data)
      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? { ...request, status: result.status, adminNotes: result.adminNotes }
            : request
        )
      )
    } catch {
      setRequests(previous)
      alert('Mise a jour impossible.')
    } finally {
      setSavingId(null)
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm('Supprimer cette demande de devis ?')) return

    const previous = requests
    setRequests((current) => current.filter((request) => request.id !== id))

    try {
      await deleteQuoteRequestAction(id)
    } catch {
      setRequests(previous)
      alert('Suppression impossible.')
    }
  }

  function exportCsv() {
    const headers = ['ID', 'Date', 'Statut', 'Nom', 'Telephone', 'Email', 'Ville', 'References', 'Notes']
    const rows = filtered.map((request) => [
      request.id,
      request.created,
      statusLabels[request.status],
      request.name,
      request.phone,
      request.email ?? '',
      request.city ?? '',
      request.items.map((item) => `${item.category} ${item.ref ?? ''} ${item.name} x${item.quantity}`).join(' | '),
      request.notes ?? '',
    ])

    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `demandes-devis-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Showroom
        </p>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Demandes de devis</h1>
          <span className="text-sm font-medium text-slate-500">{filtered.length} resultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Suivez les demandes catalogue, contactez les visiteurs et gardez l historique commercial.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          ['Total', stats.total],
          ['Nouvelles', stats.new],
          ['En cours', stats.active],
          ['Gagnees', stats.won],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher nom, telephone, ville, reference..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#4F46E5]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | QuoteRequestStatus)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none"
        >
          <option value="all">Tous les statuts</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{statusLabels[status]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Aucune demande trouvee" description="Les demandes envoyees depuis la page devis apparaitront ici." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Client</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Refs</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Statut</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((request) => {
                const isOpen = expandedId === request.id
                const phone = cleanPhone(request.phone)
                const whatsappText = encodeURIComponent(
                  `Bonjour ${request.name || ''}, nous avons bien recu votre demande de devis Update Design.`
                )
                const whatsappHref = `https://wa.me/${phone.replace(/^\+/, '')}?text=${whatsappText}`

                return (
                  <Fragment key={request.id}>
                    <tr
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                      onClick={() => setExpandedId(isOpen ? null : request.id)}
                    >
                      <td className="px-4 py-4 text-slate-400">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-950">{request.name || 'Client showroom'}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{request.phone}{request.city ? ` | ${request.city}` : ''}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {new Date(request.created).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">{request.items.length}</td>
                      <td className="px-4 py-4">
                        <select
                          value={request.status}
                          disabled={savingId === request.id}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => updateRequest(request.id, { status: event.target.value as QuoteRequestStatus })}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold outline-none ${statusClasses[request.status]}`}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{statusLabels[status]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteRequest(request.id)
                          }}
                          className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <td colSpan={6} className="p-5">
                          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selection catalogue</p>
                                  <p className="mt-1 text-sm text-slate-500">{request.email || 'Aucun email'}{request.notes ? ` | ${request.notes}` : ''}</p>
                                </div>
                                <div className="flex gap-2">
                                  <a href={`tel:${request.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                                    <Phone size={13} /> Appeler
                                  </a>
                                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                                    <MessageCircle size={13} /> WhatsApp
                                  </a>
                                </div>
                              </div>

                              <div className="grid gap-2">
                                {request.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4F46E5]">
                                        {item.category} | {item.type}{item.ref ? ` | ${item.ref}` : ''}
                                      </p>
                                      <p className="mt-1 truncate text-sm font-semibold text-slate-950">{item.name}</p>
                                    </div>
                                    <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-600">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Notes internes</p>
                              <textarea
                                defaultValue={request.adminNotes ?? ''}
                                onBlur={(event) => updateRequest(request.id, { adminNotes: event.currentTarget.value })}
                                placeholder="Details de contact, prix propose, prochaine action..."
                                className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#4F46E5]"
                              />
                              <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
                                <CheckCircle2 size={13} /> Sauvegarde au defocus
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
