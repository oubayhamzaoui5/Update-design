export default function HomeHeritageSection() {
  return (
    <section className="bg-white py-12 lg:py-18">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 lg:gap-6 lg:flex-row">
        <div className="flex w-full flex-1 justify-center lg:justify-start  p-2 lg:p-0">
          <img
            alt="Artisan polissant un luminaire"
            className="w-full max-w-xl rounded-2xl shadow-2xl "
            src="/aboutimg.webp"
          />
        </div>
        <div className="flex-1 px-4 lg:px-0">
          <h2 className="mb-4 text-2xl font-bold lg:text-4xl">UPDATE DESIGN – Votre Spécialiste en Revêtements Muraux en Tunisie</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-600 lg:text-lg">
Chez <span className="font-bold text-accent"> UPDATE DESIGN</span>, nous sommes fiers d’être un spécialiste de référence en Tunisie dans le domaine des panneaux muraux haut de gamme. Notre objectif est simple : permettre à chacun de rénover facilement son salon, sa chambre, sa cuisine et même sa salle de bain. Grâce à notre large gamme de <span className="font-bold">panneaux muraux en PVC , et Sheboard mural</span> , nous proposons des solutions modernes, esthétiques et accessibles.          </p>
          <p className="mb-6 text-sm leading-relaxed text-slate-600 lg:text-lg">
Avec <span className="font-bold text-accent">UPDATE DESIGN</span>, chacun peut donner un nouveau souffle à ses murs tout en maîtrisant son budget. Nos panneaux sont conçus pour être posés directement sur les supports existants, sans gros travaux ni interventions complexes. Résistants à l’humidité, élégants et durables, ils représentent la solution idéale pour moderniser rapidement et à moindre coût toutes les pièces de votre intérieur en Tunisie.          </p>
          <div className="grid grid-cols-3 gap-8 border-t border-[#c19a2f]/20 pt-4">
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">20+</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">Ans d experience</p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">150+</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">Designs uniques</p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">5k+</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">Clients satisfaits</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
