import Link from 'next/link'
import { ExternalLink, Layers } from 'lucide-react'
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
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#F4F6FB' }}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Catalogue categories</h1>
          <p className="mt-1 text-sm text-slate-500">Donnees affiches sur les pages catalogue, hors parasols et store bras invisible.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map(({ meta, content }) => (
            <article key={meta.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-950">{meta.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">{meta.href}</p>
                  </div>
                </div>
                <a href={meta.href} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-950">
                  <ExternalLink size={16} />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-slate-950">{content.models.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modeles</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-slate-950">{content.products.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Textures</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-slate-950">{content.accessories.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accessoires</p>
                </div>
              </div>

              <Link href={`/admin/catalogue/${meta.key}`} className="mt-5 inline-flex w-full justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
                Modifier
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
