import type { Metadata } from 'next'

import StaticCataloguePage from '@/components/catalogue/static-category-page'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'
import { groupCatalogueProducts, getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'

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
  { code: '20MM', name: 'Bombage central 20mm', note: 'Relief fin pour cadres muraux discrets', image: '/categories/int-moulures.png' },
  { code: '40MM', name: 'Bombage central 40mm', note: 'Relief plus present pour composition marquee', image: '/categories/int-moulures.png' },
  { code: '100MM', name: 'Plinthe centrale 100mm', note: 'Base decorative pour finition basse', image: '/categories/int-moulures.png' },
]

export default async function MouluresDecorativesPage() {
  const products = await getStaticCatalogueProductsByCategory('moulures')
  const sourceProducts = products.length > 0 ? products : fallbackProducts
  const catalogueProducts = groupCatalogueProducts(sourceProducts, (product) => {
    const size = product.name.match(/(\d+)\s*mm/i)?.[1] ?? product.code.match(/-(\d+)/)?.[1] ?? product.code
    const plinthe = /plinthe/i.test(product.name)
    const profile = product.code.endsWith('L') ? 'lineaire' : 'central'

    return {
      code: plinthe ? 'PLINTHE' : 'BOMBAGE',
      name: plinthe ? 'Plinthe centrale' : 'Bombage central',
      note: plinthe ? 'Finition basse decorative' : 'Relief mural decoratif',
      variant: `${size}mm ${plinthe ? 'plinthe' : profile}`,
      image: product.image,
    }
  })
  const fallbackAccessories = [
    { name: 'Colle de montage', text: 'Fixation adaptee aux supports interieurs prepares.', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=700&q=80', tag: 'Pose' },
    { name: 'Mastic de finition', text: 'Traitement des joints, angles et raccords avant peinture.', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=80', tag: 'Joint' },
    { name: 'Coupes d angle', text: 'Accessoires et consommables pour jonctions nettes.', image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=80', tag: 'Angle' },
    { name: 'Primaire peinture', text: 'Preparation de surface selon finition souhaitee.', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=80', tag: 'Peinture' },
  ]
  const editable = await getEditableCatalogueContent('moulures-decoratives', { models, products: catalogueProducts, accessories: fallbackAccessories })

  return (
    <StaticCataloguePage
      eyebrow="Finitions interieures"
      title="Moulures"
      italic="decoratives."
      intro="Moulures et plinthes decoratives pour structurer murs, plafonds, encadrements et projets interieurs avec un relief net."
      image="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Interieur avec details muraux decoratifs"
      productImage="/categories/int-moulures.png"
      productImageAlt="detail de mur interieur avec moulures"
      stats={[
        { value: String(sourceProducts.length), label: 'references' },
        { value: '20/40', label: 'reliefs mm' },
        { value: '100', label: 'plinthe mm' },
      ]}
      models={editable.models}
      products={editable.products}
      features={[
        { title: 'Relief propre', text: 'Profils pour creer une ligne decorative sans surcharge visuelle.' },
        { title: 'Pose interieure', text: 'Adapte aux murs, tetes de lit, salons, halls et espaces commerciaux.' },
        { title: 'Peinture possible', text: 'Finition personnalisable selon ambiance et couleur du projet.' },
      ]}
      accessories={editable.accessories}
      application={[
        'Tracer les axes avant pose pour garder des alignements reguliers.',
        'Prevoir coupes d angle pour cadres muraux et plinthes.',
        'Finir joints et raccords avant peinture finale.',
      ]}
    />
  )
}
