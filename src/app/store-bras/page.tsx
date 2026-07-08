import type { Metadata } from 'next'

import StoreBrasShowcase from '@/components/catalogue/store-bras-showcase'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Store Bras Invisible Sur Mesure | Update Design Tunisie',
  description:
    'Stores a bras invisibles pour villas, restaurants, hotels, terrasses et commerces. Composez modele, toile, lambrequin et fixation puis recevez un devis.',
  alternates: { canonical: '/store-bras' },
}

export default function StoreBrasPage() {
  return <StoreBrasShowcase />
}
