import type { Metadata } from 'next'

import StaticCataloguePage from '@/components/catalogue/static-category-page'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'
import { groupCatalogueProducts, getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'

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
  { code: '60CM', name: 'Tube LED 60cm', note: 'Format compact pour zones secondaires', image: '/categories/led-neon-t8.png' },
  { code: '90CM', name: 'Tube LED 90cm', note: 'Format intermediaire pour ateliers et reserves', image: '/categories/led-neon-t8.png' },
  { code: '120-150CM', name: 'Tube LED grand format', note: 'Lignes continues pour bureaux, boutiques et chantiers', image: '/categories/led-neon-t8.png' },
]

export default async function LampesPage() {
  const products = await getStaticCatalogueProductsByCategory('lampes')
  const sourceProducts = products.length > 0 ? products : fallbackProducts
  const catalogueProducts = groupCatalogueProducts(sourceProducts, (product) => {
    const temp = product.name.match(/(\d{4}K)/i)?.[1] ?? '8000K'
    const power = product.name.match(/(\d+)\s*W/i)?.[1]
    const size = product.name.match(/(\d+)\s*(?:mm|cm)/i)?.[1] ?? product.code.replace(/^TN/i, '')

    return {
      code: temp,
      name: `Lumiere ${temp}`,
      note: temp === '4000K' ? 'Blanc neutre' : 'Blanc froid',
      variant: `${size}cm${power ? ` - ${power}W` : ''}`,
      image: product.image,
    }
  })
  const fallbackAccessories = [
    { name: 'Supports de fixation', text: 'Clips et supports adaptes aux longueurs de tubes pour une pose droite.', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=80', tag: 'Pose' },
    { name: 'Connecteurs electriques', text: 'Raccords et bornes pour installation propre par l electricien.', image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=700&q=80', tag: 'Raccord' },
    { name: 'Goulottes', text: 'Passage de cable discret sur murs, plafonds ou arriere-boutiques.', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=700&q=80', tag: 'Cable' },
    { name: 'Consommables chantier', text: 'Visserie et petites fournitures prevues selon support existant.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80', tag: 'Finition' },
  ]
  const editable = await getEditableCatalogueContent('lampes', { models, products: catalogueProducts, accessories: fallbackAccessories })

  return (
    <StaticCataloguePage
      eyebrow="Eclairage technique"
      title="Lampes"
      italic="pour chantiers propres."
      intro="Tubes neon LED pour boutiques, reserves, ateliers, bureaux et espaces professionnels qui demandent une lumiere reguliere et simple a remplacer."
      image="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Luminaire suspendu dans un interieur professionnel"
      productImage="/categories/led-neon-t8.png"
      productImageAlt="tube led et eclairage lineaire"
      stats={[
        { value: String(sourceProducts.length), label: 'references LED' },
        { value: '60-150', label: 'formats cm' },
        { value: '4000K', label: 'a 8000K' },
      ]}
      models={editable.models}
      products={editable.products}
      features={[
        { title: 'Formats utiles', text: 'Une selection courte pour couvrir les longueurs les plus demandees en installation interieure.' },
        { title: 'Lumiere claire', text: 'References 4000K et 8000K pour choisir entre rendu neutre et blanc froid.' },
        { title: 'Pose rapide', text: 'Produits simples a integrer dans les projets de renovation ou de remise a niveau.' },
      ]}
      accessories={editable.accessories}
      application={[
        'Selectionner la temperature de couleur selon usage: accueil, stock, atelier ou showroom.',
        'Prevoir les longueurs par zone pour limiter les raccords visibles.',
        'Faire valider l alimentation et la protection electrique avant installation.',
      ]}
    />
  )
}
