import 'server-only'

import type { EditableCatalogueContent, EditableCatalogueKey } from '@/lib/catalogue/editable-catalogue'
import { groupCatalogueProducts, getAccessoryProductsForCategory, getStaticCatalogueProductsByCategory } from '@/lib/services/static-catalogue-products.service'

const marbleModels = [
  { code: '1220x2900', name: 'Panneau 1220x2900mm', note: 'Grand panneau pour habillage mural large', image: '/categories/int-marbre.png' },
  { code: '1220x2440', name: 'Panneau 1220x2440mm', note: 'Format vertical pour murs et niches', image: '/categories/int-marbre.png' },
]

const profileModels = [
  { code: 'L24', name: 'L24', note: 'Largeur 168 mm, relief 24 mm', image: '/sotuma/model-details/l24.png' },
  { code: 'L18', name: 'L18', note: 'Largeur 170 mm, relief 18 mm', image: '/sotuma/model-details/l18.png' },
  { code: 'R15', name: 'R15', note: 'Largeur 157 mm, relief 15 mm', image: '/sotuma/model-details/r15.png' },
  { code: 'U12', name: 'U12', note: 'Profil rainure U', image: '/sotuma/model-details/u12.png' },
  { code: 'O15', name: 'O15', note: 'Profil onde O', image: '/sotuma/model-details/o15.png' },
  { code: 'P40', name: 'P40', note: 'Profil profond', image: '/sotuma/model-details/p40.png' },
]

const gazonModels = [
  { code: '10MM', name: 'Gazon 10mm', note: 'Zones decoratives et evenements', image: '/categories/ext-gazon.png' },
  { code: '25MM', name: 'Gazon 25mm', note: 'Equilibre budget et confort', image: '/categories/ext-gazon.png' },
  { code: '35-45MM', name: 'Gazon premium', note: 'Densite plus haute', image: '/categories/ext-gazon.png' },
]

const lampeModels = [
  { code: '60CM', name: 'Tube LED 60cm', note: 'Format compact', image: '/categories/lampes/tube-led-60cm.png' },
  { code: '90CM', name: 'Tube LED 90cm', note: 'Format intermediaire', image: '/categories/lampes/tube-led-90cm.png' },
  { code: '120-150CM', name: 'Tube LED grand format', note: 'Lignes continues', image: '/categories/lampes/tube-led-120cm.png' },
]

const moulureModels = [
  { code: '20MM', name: 'Bombage central 20mm', note: 'Relief fin', image: '/categories/moulures/profil-bombage-20mm.png' },
  { code: '40MM', name: 'Bombage central 40mm', note: 'Relief marque', image: '/categories/moulures/profil-bombage-40mm.png' },
  { code: '100MM', name: 'Plinthe centrale 100mm', note: 'Finition basse', image: '/categories/moulures/profil-plinthe-100mm.png' },
]

const exteriorModels = [
  { code: 'EX01', name: 'Lame de bardage 150mm', note: 'Lame lineaire facade', image: '/categories/ext-profiles.png' },
  { code: 'EX04', name: 'Profile WPC bicolore', note: 'Contraste black', image: '/categories/ext-profiles.png' },
  { code: 'EX05', name: 'Profile WPC plein ton', note: 'Finitions unies', image: '/categories/ext-profiles.png' },
]

const gazonAccessories = [
  { name: 'Bande de jonction', text: 'Pour raccorder deux lez et garder une surface propre.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80', tag: 'Jonction' },
  { name: 'Colle gazon', text: 'Fixation des jonctions ou zones exposees au deplacement.', image: 'https://images.unsplash.com/photo-1604762512526-b6ce1b9e8ef6?auto=format&fit=crop&w=700&q=80', tag: 'Fixation' },
  { name: 'Clous et agrafes', text: 'Maintien peripherique sur support adapte.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80', tag: 'Maintien' },
  { name: 'Sable de lestage', text: 'Aide au maintien et au redressement selon le type de gazon.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80', tag: 'Stabilite' },
]

const lampAccessories = [
  { name: 'Supports de fixation', text: 'Clips et supports adaptes aux longueurs de tubes pour une pose droite.', image: '/categories/lampes/accessoire-supports-fixation.png', tag: 'Pose' },
  { name: 'Connecteurs electriques', text: 'Raccords et bornes pour installation propre par l electricien.', image: '/categories/lampes/accessoire-connecteurs-electriques.png', tag: 'Raccord' },
  { name: 'Goulottes', text: 'Passage de cable discret sur murs, plafonds ou arriere-boutiques.', image: '/categories/lampes/accessoire-goulottes.png', tag: 'Cable' },
  { name: 'Consommables chantier', text: 'Visserie et petites fournitures prevues selon support existant.', image: '/categories/lampes/accessoire-consommables-chantier.png', tag: 'Finition' },
]

const moulureAccessories = [
  { name: 'Colle de montage', text: 'Fixation adaptee aux supports interieurs prepares.', image: '/categories/moulures/accessoire-colle-montage.png', tag: 'Pose' },
  { name: 'Mastic de finition', text: 'Traitement des joints, angles et raccords avant peinture.', image: '/categories/moulures/accessoire-mastic-finition.png', tag: 'Joint' },
  { name: 'Coupes d angle', text: 'Accessoires et consommables pour jonctions nettes.', image: '/categories/moulures/accessoire-angles.png', tag: 'Angle' },
  { name: 'Primaire peinture', text: 'Preparation de surface selon finition souhaitee.', image: '/categories/moulures/accessoire-primaire-peinture.png', tag: 'Peinture' },
]

function toAccessories(products: Awaited<ReturnType<typeof getAccessoryProductsForCategory>>) {
  return products.map((product) => ({
    name: product.name,
    text: product.note ?? 'Accessoire catalogue',
    image: product.image ?? '/categories/int-accessoires.png',
    tag: `Ref. ${product.code}`,
    variants: product.variants,
  }))
}

function marbleProducts(products: Awaited<ReturnType<typeof getStaticCatalogueProductsByCategory>>) {
  return groupCatalogueProducts(products, (product) => {
    const [baseRef, sizeCode] = product.code.split('/')
    return {
      code: baseRef.trim().toUpperCase(),
      name: baseRef.trim().toUpperCase(),
      note: 'Texture effet marbre',
      variant: sizeCode === '244' ? '1220x2440mm' : '1220x2900mm',
      image: product.image ?? '/categories/int-marbre.png',
    }
  })
}

function gazonProducts(products: Awaited<ReturnType<typeof getStaticCatalogueProductsByCategory>>) {
  return groupCatalogueProducts(products, (product) => {
    const height = product.name.match(/(\d+)\s*MM/i)?.[1] ?? product.code.match(/GAZ(\d+)/i)?.[1] ?? product.code
    const premium = /premium|GAZ\d+P/i.test(`${product.name} ${product.code}`)
    return {
      code: `${height}${premium ? 'P' : ''}`,
      name: `Gazon ${height}mm${premium ? ' premium' : ''}`,
      note: premium ? 'Texture dense premium' : 'Texture standard',
      variant: product.code.includes('/4M') ? 'Largeur 4m' : 'Largeur 2m',
      image: '/categories/ext-gazon.png',
    }
  })
}

function lampProducts(products: Awaited<ReturnType<typeof getStaticCatalogueProductsByCategory>>) {
  return groupCatalogueProducts(products, (product) => {
    const temp = product.name.match(/(\d{4}K)/i)?.[1] ?? '8000K'
    const power = product.name.match(/(\d+)\s*W/i)?.[1]
    const size = product.name.match(/(\d+)\s*(?:mm|cm)/i)?.[1] ?? product.code.replace(/^TN/i, '')
    return {
      code: temp,
      name: `Lumiere ${temp}`,
      note: temp === '4000K' ? 'Blanc neutre' : 'Blanc froid',
      variant: `${size}cm${power ? ` - ${power}W` : ''}`,
      image: size === '60' ? '/categories/lampes/tube-led-60cm.png' : size === '90' ? '/categories/lampes/tube-led-90cm.png' : size === '150' ? '/categories/lampes/tube-led-150cm.png' : '/categories/lampes/tube-led-120cm.png',
    }
  })
}

function moulureProducts(products: Awaited<ReturnType<typeof getStaticCatalogueProductsByCategory>>) {
  return groupCatalogueProducts(products, (product) => {
    const size = product.name.match(/(\d+)\s*mm/i)?.[1] ?? product.code.match(/-(\d+)/)?.[1] ?? product.code
    const plinthe = /plinthe/i.test(product.name)
    return {
      code: plinthe ? 'PLINTHE' : 'BOMBAGE',
      name: plinthe ? 'Plinthe centrale' : 'Bombage central',
      note: plinthe ? 'Finition basse decorative' : 'Relief mural decoratif',
      variant: `${size}mm ${plinthe ? 'plinthe' : product.code.endsWith('L') ? 'lineaire' : 'central'}`,
      image: plinthe ? '/categories/moulures/profil-plinthe-100mm.png' : size === '40' ? '/categories/moulures/profil-bombage-40mm.png' : '/categories/moulures/profil-bombage-20mm.png',
    }
  })
}

function exteriorProducts(products: Awaited<ReturnType<typeof getStaticCatalogueProductsByCategory>>) {
  return groupCatalogueProducts(products, (product) => {
    const code = product.code.toUpperCase()
    const finish = code.includes('/BK') ? 'bicolore black' : code.includes('TEAK') || code.endsWith('-TK') ? 'teak' : code.includes('COFFE') || code.endsWith('-RW') ? 'coffee' : code.includes('GRAY') || code.endsWith('-GR') ? 'grey' : code.endsWith('-WT') ? 'white' : code.endsWith('-BK') ? 'black' : code.endsWith('-AT') ? 'AT' : code.endsWith('-D2') ? 'MC' : product.note ?? product.code
    const family = code.startsWith('EX01') ? 'Lame 150x2900mm' : code.startsWith('EX04') ? 'Profile 219x2900mm bicolore' : 'Profile 219x2900mm'
    return { code: finish.toUpperCase(), name: `Finition ${finish}`, note: 'Texture WPC exterieur', variant: family, image: '/categories/ext-profiles.png' }
  })
}

export async function getDefaultEditableCatalogueContent(key: EditableCatalogueKey): Promise<EditableCatalogueContent> {
  if (key === 'panneaux-effet-marbre') {
    return {
      models: marbleModels,
      products: marbleProducts(await getStaticCatalogueProductsByCategory('marble')),
      accessories: [
        { name: 'Type I', text: 'Jonction droite entre deux panneaux.', image: '/accessories/type-i-gold.png', tag: 'Jonction', variants: ['Gold', 'Bronze', 'Black', 'Brown'] },
        { name: 'Type T', text: 'Raccord visible pour une finition nette.', image: '/accessories/type-t-gold.png', tag: 'Raccord', variants: ['Gold', 'Bronze', 'Black', 'Brown'] },
        { name: 'Type U', text: 'Encadrement et finition de bord.', image: '/accessories/type-u-gold.png', tag: 'Bord', variants: ['Gold', 'Bronze', 'Black', 'Brown'] },
        { name: 'Type L', text: 'Angles et bordures propres.', image: '/accessories/type-l-gold.png', tag: 'Angle', variants: ['Black', 'Purple', 'Gold', 'Silver', 'Grey', 'White'] },
      ],
    }
  }

  if (key === 'profil-mural-effet-bois') {
    return {
      models: profileModels,
      products: [],
      accessories: toAccessories(await getAccessoryProductsForCategory('woodInterior')),
    }
  }

  if (key === 'gazon-artificiel') return { models: gazonModels, products: gazonProducts(await getStaticCatalogueProductsByCategory('gazon')), accessories: gazonAccessories }
  if (key === 'lampes') return { models: lampeModels, products: lampProducts(await getStaticCatalogueProductsByCategory('lampes')), accessories: lampAccessories }
  if (key === 'moulures-decoratives') return { models: moulureModels, products: moulureProducts(await getStaticCatalogueProductsByCategory('moulures')), accessories: moulureAccessories }

  return {
    models: exteriorModels,
    products: exteriorProducts(await getStaticCatalogueProductsByCategory('woodExterior')),
    accessories: toAccessories(await getAccessoryProductsForCategory('woodExterior')),
  }
}
