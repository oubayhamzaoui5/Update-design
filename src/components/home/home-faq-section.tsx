import { Plus } from 'lucide-react'

const faqItems = [
  {
    question: 'Quels sont vos delais de livraison ?',
    answer:
      'Nos delais de livraison standards sont de 2 a 4 jours . Pour les pieces volumineuses ou sur commande, le delai peut varier entre une et deux semaines.',
  },
  {
    question: "Proposez-vous un service d'installation ?",
    answer:
      "Oui, nous collaborons avec un reseau d'installateurs qualifies partout dans le Grand Tunis . Vous pouvez selectionner l'option d'installation lors de la validation de votre panier.",
  },
  {
    question: 'Quelle est votre politique de retour ?',
    answer:
      "Vous disposez d'un delai de 14 jours apres reception de votre commande pour demander un retour. Les articles doivent etre retournes dans leur emballage d'origine et en parfait etat.",
  },
  {
    question: 'Les ampoules sont-elles incluses avec les luminaires ?',
    answer:
      'Sauf indication contraire dans la fiche produit, les ampoules ne sont pas fournies. Cependant, nous indiquons systematiquement le type de culot recommande pour chaque luminaire.',
  },
]

export default function HomeFaqSection() {
  return (
    <section id="faq" className="bg-white px-6 py-4 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 lg:mb-16 text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Questions frequentes
        </h2>

        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <div key={item.question} className="border-b border-slate-100">
              <div className="flex items-center justify-between py-2 lg:py-5">
                <p className="text-sm lg:text-base font-bold text-slate-900">{item.question}</p>
                <Plus className="ml-4 h-5 w-5 shrink-0 text-[#c19a2f]" />
              </div>
              <div className="pb-6 text-sm leading-relaxed text-slate-600 sm:text-base">
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
