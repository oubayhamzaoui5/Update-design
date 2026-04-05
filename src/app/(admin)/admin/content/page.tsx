import Link from 'next/link'
import { FileText, Home, User, Wind, Sun, ArrowRight, Eye } from 'lucide-react'

const pages = [
  {
    href:        '/admin/content/homepage',
    previewHref: '/',
    icon:        Home,
    title:       "Page d'accueil",
    description: 'Stats, section À Propos, FAQ et informations de contact.',
    sections:    ['Statistiques (3 chiffres)', 'Section Notre Histoire', 'FAQ (questions / réponses)', 'Contact info & sujets'],
    color:       '#4F46E5',
    bg:          '#EEF2FF',
  },
  {
    href:        '/admin/content/about',
    previewHref: '/about',
    icon:        User,
    title:       'Page À Propos',
    description: 'Hero, histoire, vision, valeurs, équipe et call-to-action.',
    sections:    ['Hero (titre, texte, CTA)', 'Statistiques (4 chiffres)', 'Section Histoire + checklist', 'Citation vision', 'Valeurs (3 items)', 'Équipe + CTA final'],
    color:       '#059669',
    bg:          '#ECFDF5',
  },
  {
    href:        '/admin/content/store-bras',
    previewHref: '/store-bras',
    icon:        Wind,
    title:       'Store à Bras Invisibles',
    description: 'Hero, introduction, caractéristiques, applications et bannière CTA.',
    sections:    ['Hero (titre, corps, CTAs)', 'Section Introduction', 'Grille Caractéristiques (6 items)', 'Liste Applications', 'Bannière CTA finale'],
    color:       '#0F766E',
    bg:          '#F0FDFA',
  },
  {
    href:        '/admin/content/parasols',
    previewHref: '/parasols',
    icon:        Sun,
    title:       'Parasols Professionnels',
    description: 'Hero, modèles (Dallas, Havana, Ibiza, Mauris), caractéristiques et CTA.',
    sections:    ['Hero (titre, corps, CTA)', '4 Modèles (nom, accroche, description)', 'Grille Caractéristiques', 'Citation cinématique', 'Bannière CTA finale'],
    color:       '#B45309',
    bg:          '#FFFBEB',
  },
]

export default function ContentHubPage() {
  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#F4F6FB' }}>
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#EEF2FF' }}>
              <FileText size={18} style={{ color: '#4F46E5' }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#111827' }}>
              Gestion du contenu
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: '#6B7280' }}>
            Modifiez les textes, chiffres et informations affichés sur votre site public.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
          {pages.map((page) => {
            const Icon = page.icon
            return (
              <div
                key={page.href}
                className="rounded-2xl p-6 flex flex-col gap-5"
                style={{ background: '#FFFFFF', border: '1px solid #E8EAED', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                      style={{ background: page.bg }}
                    >
                      <Icon size={20} style={{ color: page.color }} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold" style={{ color: '#111827' }}>{page.title}</h2>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{page.description}</p>
                    </div>
                  </div>
                  <a
                    href={page.previewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors shrink-0"
                    style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}
                    title="Voir la page en direct"
                  >
                    <Eye size={13} />
                    Aperçu
                  </a>
                </div>

                {/* Sections list */}
                <ul className="space-y-1.5">
                  {page.sections.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                      <span className="h-1 w-1 rounded-full shrink-0" style={{ background: page.color, opacity: 0.5 }} />
                      {s}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={page.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors mt-auto"
                  style={{ background: page.color, color: '#FFFFFF' }}
                >
                  Modifier le contenu
                  <ArrowRight size={15} />
                </Link>
              </div>
            )
          })}
        </div>


      </div>
    </div>
  )
}
