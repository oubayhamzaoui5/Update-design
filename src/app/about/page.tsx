import type { Metadata } from 'next'
import AboutPageContent from './about.client'
import { getAboutContent } from '@/lib/services/site-content.service'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://updatedesign.tn'

export const metadata: Metadata = {
  title: 'À Propos — Update Design | Fournisseur Décoration Professionnelle en Tunisie',
  description:
    "Update Design est le partenaire décoration des hôtels, promoteurs immobiliers, architectes et revendeurs en Tunisie. Tarifs dégressifs, stock disponible, livraison nationale rapide. Découvrez notre histoire et notre engagement.",
  keywords: [
    'Update Design fournisseur',
    'décoration professionnelle tunisie',
    'à propos update design',
    'fournisseur hôtel tunisie',
    'décoration en gros tunisie',
    'partenaire revendeur décoration',
    'architecte décoration tunis',
  ],
  openGraph: {
    title: 'À Propos — Update Design',
    description:
      "Le partenaire décoration des professionnels en Tunisie — hôtels, promoteurs, architectes, revendeurs. Tarifs volume, stock disponible.",
    url: `${siteUrl}/about`,
    siteName: 'Update Design',
    type: 'website',
    locale: 'fr_TN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notre Histoire — Update Design',
    description: "Née à Tunis avec une vision simple : rendre la décoration de qualité accessible à tous.",
  },
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  const content = getAboutContent()
  return <AboutPageContent content={content} />
}
