'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Check, ExternalLink, FileJson, Save } from 'lucide-react'
import { updateMarblePanelsContentAction, updateWoodProfileContentAction } from './actions'
import type { MarblePanelsContent, WoodProfileContent } from '@/types/site-content'

type CatalogueKind = 'wood' | 'marble'
type CatalogueContent = WoodProfileContent | MarblePanelsContent

const pageMeta = {
  wood: {
    title: 'Profil mural effet bois',
    description: 'Contenu complet de la page /profil-mural-effet-bois',
    previewHref: '/profil-mural-effet-bois',
    color: '#8A6E53',
    bg: '#F7F2E8',
  },
  marble: {
    title: 'Panneaux effet marbre',
    description: 'Contenu complet de la page /panneaux-effet-marbre',
    previewHref: '/panneaux-effet-marbre',
    color: '#374151',
    bg: '#F3F4F6',
  },
}

function Toast({ state }: { state: 'success' | 'error' }) {
  const ok = state === 'success'
  return (
    <div
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
      style={{
        background: ok ? '#ECFDF5' : '#FEF2F2',
        color: ok ? '#065F46' : '#991B1B',
        border: `1px solid ${ok ? '#A7F3D0' : '#FECACA'}`,
      }}
    >
      {ok ? <Check size={14} /> : <AlertCircle size={14} />}
      {ok ? 'Sauvegarde !' : 'Erreur, verifiez le JSON.'}
    </div>
  )
}

export default function CataloguePageEditorClient({
  kind,
  initial,
}: {
  kind: CatalogueKind
  initial: CatalogueContent
}) {
  const meta = pageMeta[kind]
  const [json, setJson] = useState(() => JSON.stringify(initial, null, 2))
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [pending, startTransition] = useTransition()

  const parseError = useMemo(() => {
    try {
      JSON.parse(json)
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'JSON invalide'
    }
  }, [json])

  function save() {
    if (parseError) {
      setToast('error')
      setTimeout(() => setToast(null), 3000)
      return
    }

    startTransition(async () => {
      const data = JSON.parse(json)
      const res =
        kind === 'wood'
          ? await updateWoodProfileContentAction(data as WoodProfileContent)
          : await updateMarblePanelsContentAction(data as MarblePanelsContent)

      setToast(res.success ? 'success' : 'error')
      setTimeout(() => setToast(null), 3000)
    })
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#F4F6FB' }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/contenu" className="mb-3 inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70" style={{ color: '#6B7280' }}>
              <ArrowLeft size={12} /> Gestion du contenu
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: meta.bg }}>
                <FileJson size={18} style={{ color: meta.color }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{meta.title}</h1>
                <p className="text-xs" style={{ color: '#6B7280' }}>{meta.description}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {toast && <Toast state={toast} />}
            <a
              href={meta.previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
              style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}
            >
              <ExternalLink size={12} /> Apercu
            </a>
            <button
              onClick={save}
              disabled={pending || Boolean(parseError)}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              style={{ background: meta.color, color: '#FFFFFF' }}
            >
              <Save size={14} />
              {pending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5" style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#111827' }}>JSON de contenu</h2>
              <p className="mt-0.5 text-xs" style={{ color: '#6B7280' }}>
                Modifiez les textes, listes, references, images et CTA. La structure doit rester valide.
              </p>
            </div>
            {parseError && <p className="text-xs font-medium" style={{ color: '#B91C1C' }}>{parseError}</p>}
          </div>
          <textarea
            value={json}
            onChange={(event) => setJson(event.target.value)}
            spellCheck={false}
            className="min-h-[70vh] w-full rounded-xl border px-4 py-3 font-mono text-xs leading-6 outline-none focus:ring-2"
            style={{
              borderColor: parseError ? '#FCA5A5' : '#E5E7EB',
              background: '#FAFAFA',
              color: '#111827',
              tabSize: 2,
            }}
          />
        </div>
      </div>
    </div>
  )
}
