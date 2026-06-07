import type { Metadata } from 'next'

import StaticCataloguePage from '@/components/catalogue/static-category-page'
import { groupCatalogueProducts, getAccessoryProductsForCategory, getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'

export const metadata: Metadata = {
  title: 'PVC Effet Bois Exterieur | Catalogue Update Design Tunisie',
  description: 'Catalogue statique des profiles et lames WPC exterieur effet bois Update Design: EX01, EX04 et EX05 en finitions black, white, teak, grey et coffee.',
  alternates: { canonical: '/pvc-effet-bois-exterieur' },
}

const fallbackProducts = [
  { code: 'EX04-RW/BK', name: 'PROFILET EXT EN WPC 219*2900mm BRAW BLACK', note: 'Bicolore' },
  { code: 'EX04-WT/BK', name: 'PROFILET EXT EN WPC 219*2900mm WHITE BLACK', note: 'Bicolore' },
  { code: 'EX04-TK/BK', name: 'PROFILET EXT EN WPC 219*2900mm TEAK BLACK', note: 'Bicolore' },
  { code: 'EX05-RW', name: 'PROFILET EXT EN WPC 219*2900mm BRAWN', note: 'Finition bois' },
  { code: 'EX05-AT', name: 'PROFILET EXT EN WPC 219*2900mm AT', note: 'Finition AT' },
  { code: 'EX04-AT/BK', name: 'PROFILET EXT EN WPC 219*2900mm AT-BLACK', note: 'Bicolore' },
  { code: 'EX05-BK', name: 'PROFILET EXT EN WPC 219*2900mm BLACK', note: 'Noir' },
  { code: 'EX05-WT', name: 'PROFILET EXT EN WPC 219*2900mm WHITE', note: 'Blanc' },
  { code: 'EX04-BK', name: 'PROFILET EXT EN WPC 219*2900mm BLACK', note: 'Noir' },
  { code: 'EX05-TK', name: 'PROFILET EXT EN WPC 219*2900mm TEAK', note: 'Teck' },
  { code: 'EX04-WT', name: 'PROFILET EXT EN WPC 219*2900mm WHITE', note: 'Blanc' },
  { code: 'EX01-GRAY', name: 'LAME DE BARDAGE EN WPC 150*2900mm GREY', note: 'Lame 150mm' },
  { code: 'EX01-BK', name: 'LAME DE BARDAGE EN WPC 150*2900mm BLACK', note: 'Lame 150mm' },
  { code: 'EX01-COFFE', name: 'LAME DE BARDAGE EN WPC 150*2900mm COFFE', note: 'Lame 150mm' },
  { code: 'EX01-D2', name: 'LAME DE BARDAGE EN WPC 150*2900mm MC', note: 'Lame 150mm' },
  { code: 'EX01-TEAK', name: 'LAME DE BARDAGE EN WPC 150*2900mm TEAK', note: 'Lame 150mm' },
]

const models = [
  { code: 'EX01', name: 'Lame de bardage 150mm', note: 'Lame lineaire pour facade et habillage mural', image: '/categories/ext-profiles.png' },
  { code: 'EX04', name: 'Profile WPC bicolore', note: 'Effet bois avec contraste black selon finition', image: '/categories/ext-profiles.png' },
  { code: 'EX05', name: 'Profile WPC plein ton', note: 'Teak, black, white, brawn et finitions unies', image: '/categories/ext-profiles.png' },
]

export default async function PvcEffetBoisExterieurPage() {
  const products = await getStaticCatalogueProductsByCategory('woodExterior')
  const accessoryProducts = await getAccessoryProductsForCategory('woodExterior')
  const sourceProducts = products.length > 0 ? products : fallbackProducts
  const catalogueProducts = groupCatalogueProducts(sourceProducts, (product) => {
    const code = product.code.toUpperCase()
    const finish =
      code.includes('/BK') ? 'bicolore black' :
      code.includes('TEAK') || code.endsWith('-TK') ? 'teak' :
      code.includes('COFFE') || code.endsWith('-RW') ? 'coffee' :
      code.includes('GRAY') || code.endsWith('-GR') ? 'grey' :
      code.endsWith('-WT') ? 'white' :
      code.endsWith('-BK') ? 'black' :
      code.endsWith('-AT') ? 'AT' :
      code.endsWith('-D2') ? 'MC' :
      product.note ?? product.code
    const family =
      code.startsWith('EX01') ? 'Lame 150x2900mm' :
      code.startsWith('EX04') ? 'Profile 219x2900mm bicolore' :
      'Profile 219x2900mm'

    return {
      code: finish.toUpperCase(),
      name: `Finition ${finish}`,
      note: 'Texture WPC exterieur',
      variant: family,
      image: product.image,
    }
  })

  return (
    <StaticCataloguePage
      eyebrow="Bardage exterieur WPC"
      title="Bois"
      italic="pour facade."
      intro="Profiles et lames WPC effet bois pour habillage exterieur, murs techniques, facades commerciales, terrasses couvertes et projets qui demandent un rendu bois durable."
      image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Maison moderne avec habillage exterieur"
      productImage="/categories/ext-profiles.png"
      productImageAlt="lames effet bois exterieur"
      stats={[
        { value: String(sourceProducts.length), label: 'references WPC' },
        { value: '150', label: 'lames mm' },
        { value: '219', label: 'profiles mm' },
      ]}
      models={models}
      products={catalogueProducts}
      accessoryProducts={accessoryProducts}
      features={[
        { title: 'Usage facade', text: 'Profiles et lames prevus pour habiller des surfaces exterieures et zones semi-exposees.' },
        { title: 'Finitions bois', text: 'Teak, coffee, grey, black et white pour composer une facade sobre ou contrastee.' },
        { title: 'Longueur projet', text: 'Formats 2900mm pour couvrir rapidement de grandes surfaces.' },
      ]}
      accessories={[
        { name: 'Clips de fixation', text: 'Maintien des lames WPC avec jeu regulier et finition propre.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80', tag: 'Fixation' },
        { name: 'Rails et tasseaux', text: 'Support de pose pour ventilation et alignement du bardage.', image: '/sotuma/profiles/2403-l24.jpg', tag: 'Support' },
        { name: 'Profils de rive', text: 'Finitions laterales, angles sortants et arrets de facade.', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=700&q=80', tag: 'Rive' },
        { name: 'Visserie inox', text: 'Fixation adaptee aux contraintes exterieures.', image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=700&q=80', tag: 'Inox' },
      ]}
      application={[
        'Prevoir un support stable, ventile et aligne avant pose.',
        'Choisir les profils de rive avec la couleur des lames.',
        'Calculer les pertes selon coupes, angles et ouvertures.',
      ]}
    />
  )
}
