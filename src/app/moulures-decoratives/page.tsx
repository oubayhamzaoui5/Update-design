import type { Metadata } from 'next'

import MouluresShowcase from '@/components/catalogue/moulures-showcase'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'
import { getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'

export const metadata: Metadata = {
  title: 'Moulures Decoratives | Catalogue Update Design Tunisie',
  description: 'Catalogue statique des moulures decoratives Update Design: bombage central 20mm, 40mm et plinthe centrale 100mm.',
  alternates: { canonical: '/moulures-decoratives' },
}

const fallbackProducts = [
  { code: 'MD240-20C', name: 'Moulures bombage central 20mm', note: 'Profil central' },
  { code: 'MD240-20L', name: 'Moulures bombage central 20mm', note: 'Profil lineaire' },
  { code: 'MD240-20C', name: 'Moulures bombage central 40mm', note: 'Relief plus visible' },
  { code: 'MD240-20L', name: 'Moulures bombage central 40mm', note: 'Profil lineaire' },
  { code: 'MD240-100', name: 'Moulures plinthe central 100mm', note: 'Plinthe decorative' },
]

const models = [
  { code: '20MM', name: 'Bombage central 20mm', note: 'Relief fin pour cadres muraux discrets', image: '/categories/moulures/profil-bombage-20mm.png' },
  { code: '40MM', name: 'Bombage central 40mm', note: 'Relief plus present pour composition marquee', image: '/categories/moulures/profil-bombage-40mm.png' },
  { code: '100MM', name: 'Plinthe centrale 100mm', note: 'Base decorative pour finition basse', image: '/categories/moulures/profil-plinthe-100mm.png' },
]

export default async function MouluresDecorativesPage() {
  const products = await getStaticCatalogueProductsByCategory('moulures')
  const sourceProducts = products.length > 0 ? products : fallbackProducts
  const fallbackAccessories = [
    { name: 'Colle de montage', text: 'Fixation adaptee aux supports interieurs prepares.', image: '/categories/moulures/accessoire-colle-montage.png', tag: 'Pose' },
    { name: 'Mastic de finition', text: 'Traitement des joints, angles et raccords avant peinture.', image: '/categories/moulures/accessoire-mastic-finition.png', tag: 'Joint' },
    { name: 'Coupes d angle', text: 'Accessoires et consommables pour jonctions nettes.', image: '/categories/moulures/accessoire-angles.png', tag: 'Angle' },
    { name: 'Primaire peinture', text: 'Preparation de surface selon finition souhaitee.', image: '/categories/moulures/accessoire-primaire-peinture.png', tag: 'Peinture' },
  ]
  const editable = await getEditableCatalogueContent('moulures-decoratives', { models, products: [], accessories: fallbackAccessories })

  return <MouluresShowcase accessories={editable.accessories} referenceCount={sourceProducts.length} />
}
