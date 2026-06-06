import type { NavCategory } from '@/components/mega-menu'

const CATALOGUE_PAGE_BY_SLUG: Record<string, string> = {
  'profil-bois': '/profil-mural-effet-bois',
  'profil-mural-effet-bois': '/profil-mural-effet-bois',
  'panneaux-effet-marbre': '/panneaux-effet-marbre',
  'effet-marbre': '/panneaux-effet-marbre',
  'pvc-effet-bois-exterieur': '/pvc-effet-bois-exterieur',
  'effet-bois-exterieur': '/pvc-effet-bois-exterieur',
  'gazon-artificiel': '/gazon-artificiel',
  gazon: '/gazon-artificiel',
  'moulures-decoratives': '/moulures-decoratives',
  'moulure-decoratif': '/moulures-decoratives',
  lampes: '/lampes',
  lampe: '/lampes',
  stores: '/store-bras',
  store: '/store-bras',
  'store-bras': '/store-bras',
  parasols: '/parasols',
  parasol: '/parasols',
}

const CATALOGUE_PAGE_BY_NAME: Record<string, string> = {
  'profil bois': '/profil-mural-effet-bois',
  'profil mural effet bois': '/profil-mural-effet-bois',
  'effet marbre': '/panneaux-effet-marbre',
  'panneaux effet marbre': '/panneaux-effet-marbre',
  'panneau mural effet marbre': '/panneaux-effet-marbre',
  'pvc effet bois exterieur': '/pvc-effet-bois-exterieur',
  'effet bois exterieur': '/pvc-effet-bois-exterieur',
  'gazon artificiel': '/gazon-artificiel',
  'gazon arttificiel': '/gazon-artificiel',
  'moulure decoratif': '/moulures-decoratives',
  'moulures decoratives': '/moulures-decoratives',
  lampes: '/lampes',
  lampe: '/lampes',
  stores: '/store-bras',
  store: '/store-bras',
  'store bras': '/store-bras',
  'store a bras invisibles': '/store-bras',
  parasols: '/parasols',
  parasol: '/parasols',
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function getCatalogueCategoryHref(category: Pick<NavCategory, 'slug' | 'name'>) {
  const slug = category.slug?.trim().toLowerCase()
  if (slug && CATALOGUE_PAGE_BY_SLUG[slug]) return CATALOGUE_PAGE_BY_SLUG[slug]

  const normalizedName = normalize(category.name ?? '')
  if (normalizedName && CATALOGUE_PAGE_BY_NAME[normalizedName]) {
    return CATALOGUE_PAGE_BY_NAME[normalizedName]
  }

  return `/boutique/${category.slug}`
}
