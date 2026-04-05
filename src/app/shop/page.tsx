import type { Metadata } from 'next'
import { getShopList, parseShopListInput } from '@/lib/services/product.service'
import ShopClient from './shop.client'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const input = parseShopListInput(params)

  const isPromo = input.promotions === '1'
  const isNew = input.sort === 'latest' || input.nouveautes === '1'

  const title = isPromo
    ? 'Promotions — Update Design'
    : isNew
      ? 'Nouveautés — Update Design'
      : 'Boutique — Update Design'

  const description = isPromo
    ? 'Profitez des meilleures promotions sur nos produits de décoration en Tunisie.'
    : isNew
      ? 'Découvrez les derniers produits ajoutés à notre boutique.'
      : "Explorez toute notre collection de décoration intérieure et extérieure. Panneaux muraux, gazon artificiel, parasols, néons LED et bien plus."

  return {
    title,
    description,
    alternates: { canonical: '/shop' },
    openGraph: {
      title,
      description,
      url: '/shop',
      siteName: 'Update Design',
      type: 'website',
      locale: 'fr_TN',
    },
  }
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const input = parseShopListInput(params)
  const data = await getShopList(input)

  return <ShopClient data={data} searchParams={params} />
}
