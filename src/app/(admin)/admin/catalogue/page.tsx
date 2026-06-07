import Link from 'next/link'
import { ExternalLink, Layers, Pencil } from 'lucide-react'
import { EDITABLE_CATALOGUE_KEYS, EDITABLE_CATALOGUE_META } from '@/lib/catalogue/editable-catalogue'
import { getDefaultEditableCatalogueContent } from '@/lib/catalogue/editable-catalogue-defaults'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'

export default async function AdminCataloguePage() {
  const categories = await Promise.all(
    EDITABLE_CATALOGUE_KEYS.map(async (key) => {
      const fallback = await getDefaultEditableCatalogueContent(key)
      const content = await getEditableCatalogueContent(key, fallback)
      return { meta: EDITABLE_CATALOGUE_META[key], content }
    }),
  )

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Catalogue</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Pages catalogue</h1>
          <p className="mt-1 text-sm text-slate-500">Gerez les donnees des pages categories, hors parasols et store bras invisible.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map(({ meta, content }) => (
          <article key={meta.key} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5]">
                    <Layers size={19} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-950">{meta.title}</h2>
                    <p className="mt-1 truncate text-xs text-slate-500">{meta.href}</p>
                  </div>
                </div>
                <a href={meta.href} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                  <ExternalLink size={16} />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Modeles', content.models.length],
                  ['Textures', content.products.length],
                  ['Accessoires', content.accessories.length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xl font-bold text-slate-950">{value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-slate-100 p-4">
              <Link href={`/admin/catalogue/${meta.key}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                <Pencil size={14} /> Modifier
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
