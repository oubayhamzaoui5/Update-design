import type { Metadata } from 'next'

import LampesShowcase from '@/components/catalogue/lampes-showcase'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'
import { getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'

export const metadata: Metadata = {
  title: 'Lampes & Tubes Neon LED | Update Design Tunisie',
  description: 'Catalogue statique des tubes neon LED Update Design: formats 60cm, 90cm, 120cm et 150cm en 4000K et 8000K.',
  alternates: { canonical: '/lampes' },
}

const fallbackProducts = [
  { code: 'TN150PRIMA', name: 'TUBE NEON LED 30W 8000K 150mm', note: 'Tube LED grand format' },
  { code: 'TN120PRIMA-8', name: 'TUBE NEON LED 30W 8000K 120mm', note: 'Blanc froid' },
  { code: 'TN120PRIMA-4', name: 'TUBE NEON LED 30W 4000K 120mm', note: 'Blanc neutre' },
  { code: 'TN60PRIMA', name: 'TUBE NEON LED 14W 8000K 60mm', note: 'Format compact' },
  { code: 'TN90PRIMA', name: 'TUBE NEON LED 20W 8000K 90cm', note: 'Format intermediaire' },
]

const models = [
  { code: '60CM', name: 'Tube LED 60cm', note: 'Format compact pour zones secondaires', image: '/categories/lampes/tube-led-60cm.png' },
  { code: '90CM', name: 'Tube LED 90cm', note: 'Format intermediaire pour ateliers et reserves', image: '/categories/lampes/tube-led-90cm.png' },
  { code: '120-150CM', name: 'Tube LED grand format', note: 'Lignes continues pour bureaux, boutiques et chantiers', image: '/categories/lampes/tube-led-120cm.png' },
]

export default async function LampesPage() {
  const products = await getStaticCatalogueProductsByCategory('lampes')
  const sourceProducts = products.length > 0 ? products : fallbackProducts
  const fallbackAccessories = [
    { name: 'Supports de fixation', text: 'Clips et supports adaptes aux longueurs de tubes pour une pose droite.', image: '/categories/lampes/accessoire-supports-fixation.png', tag: 'Pose' },
    { name: 'Connecteurs electriques', text: 'Raccords et bornes pour installation propre par l electricien.', image: '/categories/lampes/accessoire-connecteurs-electriques.png', tag: 'Raccord' },
    { name: 'Goulottes', text: 'Passage de cable discret sur murs, plafonds ou arriere-boutiques.', image: '/categories/lampes/accessoire-goulottes.png', tag: 'Cable' },
    { name: 'Consommables chantier', text: 'Visserie et petites fournitures prevues selon support existant.', image: '/categories/lampes/accessoire-consommables-chantier.png', tag: 'Finition' },
  ]
  const editable = await getEditableCatalogueContent('lampes', { models, products: [], accessories: fallbackAccessories })

  return <LampesShowcase accessories={editable.accessories} referenceCount={sourceProducts.length} />
}
