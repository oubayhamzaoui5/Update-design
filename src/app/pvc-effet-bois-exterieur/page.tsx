import type { Metadata } from 'next'

import ExterieurShowcase from '@/components/catalogue/exterieur-showcase'
import { getEditableCatalogueContent } from '@/lib/services/editable-catalogue.service'
import { getAccessoryProductsForCategory } from '@/lib/services/static-catalogue-products.service'

export const metadata: Metadata = {
  title: 'PVC Effet Bois Exterieur | Catalogue Update Design Tunisie',
  description: 'Catalogue des lames et profiles WPC exterieur effet bois Update Design: lame de bardage EX01 150mm et profiles EX04 / EX05 219mm, finitions teck, brun, noir, blanc, gris, cafe et bicolore.',
  alternates: { canonical: '/pvc-effet-bois-exterieur' },
}

// ── Real catalogue (source: Liste des produits.xlsx, "PVC EFFET BOIS EXTERIEUR")
//    3 models × finish tones = 16 SKUs.
const MODELS = [
  { code: 'EX01', name: 'Lame de bardage', format: '150 × 2900 mm', note: 'Lame linéaire pour façade et habillage mural complet.' },
  { code: 'EX04', name: 'Profilé bicolore', format: '219 × 2900 mm', note: 'Effet bois avec arête noire (bicolore) ou plein ton.' },
  { code: 'EX05', name: 'Profilé plein ton', format: '219 × 2900 mm', note: 'Teck, brun, noir, blanc et beige unis.' },
]

const FINISHES = [
  { code: 'TEAK', name: 'Teck', color: '#9C6B3F', items: [{ model: 'EX01', sku: 'EX01-TEAK' }, { model: 'EX05', sku: 'EX05-TK' }] },
  { code: 'BLACK', name: 'Noir', color: '#1C1B19', items: [{ model: 'EX01', sku: 'EX01-BK' }, { model: 'EX04', sku: 'EX04-BK' }, { model: 'EX05', sku: 'EX05-BK' }] },
  { code: 'WHITE', name: 'Blanc', color: '#E7E2D7', items: [{ model: 'EX04', sku: 'EX04-WT' }, { model: 'EX05', sku: 'EX05-WT' }] },
  { code: 'GREY', name: 'Gris', color: '#878781', items: [{ model: 'EX01', sku: 'EX01-GRAY' }] },
  { code: 'COFFEE', name: 'Café', color: '#4A3527', items: [{ model: 'EX01', sku: 'EX01-COFFE' }] },
  { code: 'MC', name: 'Taupe MC', color: '#6E6256', items: [{ model: 'EX01', sku: 'EX01-D2' }] },
  { code: 'AT', name: 'Beige naturel', color: '#B19A7B', items: [{ model: 'EX05', sku: 'EX05-AT' }] },
  { code: 'BRAWN', name: 'Brun bois', color: '#6E4A30', items: [{ model: 'EX05', sku: 'EX05-RW' }] },
  { code: 'RW/BK', name: 'Bicolore brun / noir', color: '#6E4A30', bicolore: true, items: [{ model: 'EX04', sku: 'EX04-RW/BK' }] },
  { code: 'WT/BK', name: 'Bicolore blanc / noir', color: '#E7E2D7', bicolore: true, items: [{ model: 'EX04', sku: 'EX04-WT/BK' }] },
  { code: 'TK/BK', name: 'Bicolore teck / noir', color: '#9C6B3F', bicolore: true, items: [{ model: 'EX04', sku: 'EX04-TK/BK' }] },
  { code: 'AT/BK', name: 'Bicolore beige / noir', color: '#B19A7B', bicolore: true, items: [{ model: 'EX04', sku: 'EX04-AT/BK' }] },
]

const REFERENCE_COUNT = FINISHES.reduce((n, f) => n + f.items.length, 0)

export default async function PvcEffetBoisExterieurPage() {
  const accessoryProducts = await getAccessoryProductsForCategory('woodExterior')
  const editable = await getEditableCatalogueContent('pvc-effet-bois-exterieur', {
    models: MODELS,
    products: [],
    accessories: accessoryProducts.map((product) => ({
      name: product.name,
      text: product.note ?? 'Accessoire WPC extérieur',
      image: product.image ?? '/categories/int-accessoires.png',
      tag: `Ref. ${product.code}`,
      variants: product.variants,
    })),
  })

  return (
    <ExterieurShowcase
      models={MODELS}
      finishes={FINISHES}
      accessories={editable.accessories}
      referenceCount={REFERENCE_COUNT}
    />
  )
}
