import type { Metadata } from 'next'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { QuoteCartPanel } from '@/components/catalogue/quote-cart'

export const metadata: Metadata = {
  title: 'Demande de devis | Update Design',
  description: 'Ajoutez des references catalogue et envoyez une demande de devis Update Design.',
  alternates: { canonical: '/devis' },
}

export default function DevisPage() {
  return (
    <div>
      <Navbar reserveSpace />
      <QuoteCartPanel />
      <Footer />
    </div>
  )
}
