import 'server-only'

import { getExcelCatalogueProducts } from '@/lib/catalogue/excel-products'
import type { StaticCatalogueProduct } from '@/components/catalogue/static-category-page'

const CATEGORY_NAMES = {
  accessories: 'ACCESSOIRES',
  marble: 'PVC EFFET MARBRE',
  lampes: 'LAMPE',
  gazon: 'GAZON ARTTIFICIEL',
  moulures: 'MOULURE DECORATIF',
  woodInterior: 'PVC EFFET BOIS',
  woodExterior: 'PVC EFFET BOIS EXTERIEUR',
}

export async function getStaticCatalogueProductsByCategory(
  categoryKey: keyof typeof CATEGORY_NAMES
): Promise<StaticCatalogueProduct[]> {
  const category = CATEGORY_NAMES[categoryKey]
  if (!category) return []

  return getExcelCatalogueProducts(category).map((product) => ({
    code: product.code,
    name: product.name,
      note: product.price > 0 ? `${product.price} DT` : 'Reference catalogue',
    }))
}

export function groupCatalogueProducts(
  products: StaticCatalogueProduct[],
  getGroup: (product: StaticCatalogueProduct) => {
    code: string
    name: string
    note?: string
    variant: string
    image?: string
  }
): StaticCatalogueProduct[] {
  const grouped = new Map<string, StaticCatalogueProduct>()

  for (const product of products) {
    const group = getGroup(product)
    const current = grouped.get(group.code)

    if (current) {
      if (!current.variants?.includes(group.variant)) {
        current.variants = [...(current.variants ?? []), group.variant]
      }
      continue
    }

    grouped.set(group.code, {
      code: group.code,
      name: group.name,
      note: group.note,
      image: group.image ?? product.image,
      variants: [group.variant],
    })
  }

  return Array.from(grouped.values())
}

const ACCESSORY_MATCHERS = {
  marble: (code: string) =>
    code.startsWith('PA') || code.startsWith('PAL'),
  woodInterior: (code: string) =>
    code.startsWith('C25-') || code.startsWith('C35-') || code.startsWith('C43-'),
  woodExterior: (code: string) =>
    code.startsWith('C50-') || code.startsWith('CB50-') || code === 'CLIPS' || code === 'ART2384',
}

export async function getAccessoryProductsForCategory(
  categoryKey: keyof typeof ACCESSORY_MATCHERS
): Promise<StaticCatalogueProduct[]> {
  const matcher = ACCESSORY_MATCHERS[categoryKey]
  if (!matcher) return []

  const products = getExcelCatalogueProducts(CATEGORY_NAMES.accessories)
    .filter((product) => matcher(product.code.trim().toUpperCase()))
    .map((product) => ({
      code: product.code,
      name: product.name,
      note: product.price > 0 ? `${product.price} DT` : 'Accessoire catalogue',
    }))

  if (categoryKey === 'woodInterior') {
    return groupCatalogueProducts(products, (product) => {
      const [type, texture = 'standard'] = product.code.split('-')
      const label =
        type === 'C43' ? 'Cloture 90 PVC effet bois' :
        type === 'C35' ? 'Corniere PVC 35x35' :
        'Corniere PVC 25x25'

      return {
        code: type,
        name: label,
        note: 'Accessoire profil bois',
        variant: texture,
        image: product.image,
      }
    })
  }

  if (categoryKey === 'woodExterior') {
    return groupCatalogueProducts(products, (product) => {
      const code = product.code.toUpperCase()
      const type =
        code === 'CLIPS' ? 'CLIPS' :
        code === 'ART2384' || code.startsWith('C50-') ? 'C50' :
        'CB50'
      const finish = code.includes('-') ? code.split('-')[1] : 'standard'
      const label =
        type === 'CLIPS' ? 'Clips de fixation' :
        type === 'CB50' ? 'Corniere bombee WPC 50x50' :
        'Corniere WPC 50x50'

      return {
        code: type,
        name: label,
        note: 'Accessoire WPC exterieur',
        variant: finish,
        image: product.image,
      }
    })
  }

  return products
}
