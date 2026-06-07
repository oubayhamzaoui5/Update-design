import type { Metadata } from 'next'

import StaticCataloguePage from '@/components/catalogue/static-category-page'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'
import { groupCatalogueProducts, getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'

export const metadata: Metadata = {
  title: 'Gazon Artificiel | Catalogue Update Design Tunisie',
  description: 'Catalogue statique du gazon artificiel Update Design: 10mm, 25mm, 35mm premium et 45mm premium en largeurs 2m et 4m.',
  alternates: { canonical: '/gazon-artificiel' },
}

const fallbackProducts = [
  { code: 'GAZ10/4M', name: 'GAZON ARTIFICIEL 10MM/4M', note: 'Rouleau largeur 4m' },
  { code: 'GAZ25/2M', name: 'GAZON ARTIFICIEL 25MM/2M', note: 'Rouleau largeur 2m' },
  { code: 'GAZ25/4M', name: 'GAZON ARTIFICIEL 25MM/4M', note: 'Rouleau largeur 4m' },
  { code: 'GAZ10/2M', name: 'GAZON ARTIFICIEL 2M/10MM', note: 'Rouleau largeur 2m' },
  { code: 'GAZ35/2M', name: 'GAZON ARTIFICIEL 35MM/2M', note: 'Hauteur 35mm' },
  { code: 'GAZ35P/2M', name: 'GAZON ARTIFICIEL 35MM/2M PREMIUM', note: 'Premium 2m' },
  { code: 'GAZ35P/4M', name: 'GAZON ARTIFICIEL 35MM/4M PREMIUM', note: 'Premium 4m' },
  { code: 'GAZ45P/2M', name: 'GAZON ARTIFICIEL 45MM/2M PREMIUM', note: 'Premium 45mm' },
  { code: 'GAZ45P/4M', name: 'GAZON ARTIFICIEL 45MM/4M PREMIUM', note: 'Premium 4m' },
]

const models = [
  { code: '10MM', name: 'Gazon 10mm', note: 'Pratique pour zones decoratives et evenements', image: '/categories/ext-gazon.png' },
  { code: '25MM', name: 'Gazon 25mm', note: 'Equilibre budget, confort et surface visible', image: '/categories/ext-gazon.png' },
  { code: '35-45MM', name: 'Gazon premium', note: 'Densite plus haute pour jardins, piscines et terrasses', image: '/categories/ext-gazon.png' },
]

export default async function GazonArtificielPage() {
  const products = await getStaticCatalogueProductsByCategory('gazon')
  const sourceProducts = products.length > 0 ? products : fallbackProducts
  const catalogueProducts = groupCatalogueProducts(sourceProducts, (product) => {
    const height = product.name.match(/(\d+)\s*MM/i)?.[1] ?? product.code.match(/GAZ(\d+)/i)?.[1] ?? product.code
    const premium = /premium|GAZ\d+P/i.test(`${product.name} ${product.code}`)
    const width = product.code.includes('/4M') ? 'Largeur 4m' : 'Largeur 2m'

    return {
      code: `${height}${premium ? 'P' : ''}`,
      name: `Gazon ${height}mm${premium ? ' premium' : ''}`,
      note: premium ? 'Texture dense premium' : 'Texture standard',
      variant: width,
      image: product.image,
    }
  })
  const editable = await getEditableCatalogueContent('gazon-artificiel', {
    models,
    products: catalogueProducts,
    accessories: [
      { name: 'Bande de jonction', text: 'Pour raccorder deux lez et garder une surface propre.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80', tag: 'Jonction' },
      { name: 'Colle gazon', text: 'Fixation des jonctions ou zones exposees au deplacement.', image: 'https://images.unsplash.com/photo-1604762512526-b6ce1b9e8ef6?auto=format&fit=crop&w=700&q=80', tag: 'Fixation' },
      { name: 'Clous et agrafes', text: 'Maintien peripherique sur support adapte.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80', tag: 'Maintien' },
      { name: 'Sable de lestage', text: 'Aide au maintien et au redressement selon le type de gazon.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80', tag: 'Stabilite' },
    ],
  })

  return (
    <StaticCataloguePage
      eyebrow="Exterieur & jardin"
      title="Gazon"
      italic="pret a poser."
      intro="Rouleaux de gazon artificiel pour terrasses, jardins, bords de piscine, evenements, showrooms et espaces professionnels sans entretien lourd."
      image="https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Surface de gazon vert en exterieur"
      productImage="/categories/ext-gazon.png"
      productImageAlt="rouleau de gazon artificiel"
      stats={[
        { value: String(sourceProducts.length), label: 'references gazon' },
        { value: '10-45', label: 'hauteurs mm' },
        { value: '2/4m', label: 'largeurs' },
      ]}
      models={editable.models}
      products={editable.products}
      features={[
        { title: 'Plusieurs hauteurs', text: 'Du 10mm pratique au 45mm premium pour ajuster confort, densite et budget.' },
        { title: 'Largeurs chantier', text: 'Formats 2m et 4m pour reduire les joints selon la surface.' },
        { title: 'Usage exterieur', text: 'Solution decorative pour zones de passage, terrasses et espaces de presentation.' },
      ]}
      accessories={editable.accessories}
      application={[
        'Mesurer largeur et longueur utiles avant choix 2m ou 4m.',
        'Prevoir evacuation d eau et support stable avant pose.',
        'Choisir une hauteur plus dense pour zones visibles et premium.',
      ]}
    />
  )
}
