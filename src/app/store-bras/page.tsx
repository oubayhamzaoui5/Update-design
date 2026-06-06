import type { Metadata } from 'next'

import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import LeadShowcasePage from '@/components/catalogue/lead-showcase-page'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Store Bras Invisible Sur Mesure | Update Design Tunisie',
  description:
    'Stores a bras invisibles pour villas, restaurants, hotels, terrasses et commerces. Configurez dimensions, toile, fixation et options pour recevoir un devis.',
  alternates: { canonical: '/store-bras' },
}

export default function StoreBrasPage() {
  return (
    <div>
      <Navbar reserveSpace />
      <LeadShowcasePage
        eyebrow="Store bras invisible"
        title="L ombre,"
        italic="sans alourdir la facade."
        intro="Un store sur mesure pour transformer une terrasse, une vitrine ou une facade en espace exploitable, confortable et coherent avec l architecture."
        heroImage="/editorial/awning-cafe.jpg"
        heroAlt="Facade de cafe avec store banne"
        ctaHref="/tinda"
        ctaLabel="Configurer mon store"
        models={[
          { name: 'Pragua', text: 'Une base robuste pour les facades simples, villas, commerces et terrasses regulieres.', image: '/store/pragua-droit.webp', tag: 'Robuste' },
          { name: 'Valancia', text: 'Une ligne plus nette, ideale pour les projets ou le store doit rester discret une fois ferme.', image: '/store/valancia-droit.webp', tag: 'Premium' },
          { name: 'Fixation facade', text: 'Pose murale pour terrasses, vitrines et ouvertures exposees.', image: '/fixation-facade.webp', tag: 'Pose' },
          { name: 'Toiles & options', text: 'Coloris, lambrequin, motorisation et capteurs selon usage et budget.', image: '/fabrics/SA2826_Champagne.png', tag: 'Sur mesure' },
        ]}
        proof={[
          'Dimensions, avancee et type de fixation confirmes avant devis.',
          'Choix de toile selon couleur, exposition et rendu de facade.',
          'Motorisation, capteur vent et options possibles selon projet.',
          'Accompagnement pour commerces, restaurants, villas et hotels.',
        ]}
        steps={[
          'Largeur et avancee souhaitees.',
          'Type de pose: facade, plafond ou cas particulier.',
          'Toile, lambrequin, motorisation et accessoires.',
          'Ville, delai souhaite et photo de la facade si disponible.',
        ]}
        formTitle="Configurez votre store en quelques minutes."
        formText="Le formulaire store bras invisible remplace le panier classique: il nous donne les cotes, le support et les options afin de revenir avec une proposition realiste."
        secondaryImage="/editorial/terrace-dining.jpg"
        secondaryAlt="Terrasse de restaurant moderne"
      />
      <Footer />
    </div>
  )
}
