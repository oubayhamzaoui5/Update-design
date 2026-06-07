import type { StaticCatalogueAccessory, StaticCatalogueProduct } from '@/components/catalogue/static-category-page'

export const EDITABLE_CATALOGUE_KEYS = [
  'panneaux-effet-marbre',
  'profil-mural-effet-bois',
  'gazon-artificiel',
  'lampes',
  'moulures-decoratives',
  'pvc-effet-bois-exterieur',
] as const

export type EditableCatalogueKey = (typeof EDITABLE_CATALOGUE_KEYS)[number]

export type EditableCatalogueContent = {
  models: StaticCatalogueProduct[]
  products: StaticCatalogueProduct[]
  accessories: StaticCatalogueAccessory[]
}

export type EditableCatalogueMeta = {
  key: EditableCatalogueKey
  title: string
  href: string
  productLabel: string
}

export const EDITABLE_CATALOGUE_META: Record<EditableCatalogueKey, EditableCatalogueMeta> = {
  'panneaux-effet-marbre': {
    key: 'panneaux-effet-marbre',
    title: 'Panneaux effet marbre',
    href: '/panneaux-effet-marbre',
    productLabel: 'Textures',
  },
  'profil-mural-effet-bois': {
    key: 'profil-mural-effet-bois',
    title: 'Profil mural effet bois',
    href: '/profil-mural-effet-bois',
    productLabel: 'Textures',
  },
  'gazon-artificiel': {
    key: 'gazon-artificiel',
    title: 'Gazon artificiel',
    href: '/gazon-artificiel',
    productLabel: 'Textures',
  },
  lampes: {
    key: 'lampes',
    title: 'Lampes',
    href: '/lampes',
    productLabel: 'Temperatures',
  },
  'moulures-decoratives': {
    key: 'moulures-decoratives',
    title: 'Moulures decoratives',
    href: '/moulures-decoratives',
    productLabel: 'Familles',
  },
  'pvc-effet-bois-exterieur': {
    key: 'pvc-effet-bois-exterieur',
    title: 'PVC effet bois exterieur',
    href: '/pvc-effet-bois-exterieur',
    productLabel: 'Finitions',
  },
}

export function emptyEditableCatalogueContent(): EditableCatalogueContent {
  return { models: [], products: [], accessories: [] }
}

export function normalizeEditableCatalogueContent(value: unknown): EditableCatalogueContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyEditableCatalogueContent()
  }

  const data = value as Partial<EditableCatalogueContent>
  return {
    models: Array.isArray(data.models) ? data.models : [],
    products: Array.isArray(data.products) ? data.products : [],
    accessories: Array.isArray(data.accessories) ? data.accessories : [],
  }
}
