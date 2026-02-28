import Link from 'next/link'

export default function HomeMarblePanelSection() {
  return (
    <section className="bg-white py-12 lg:py-18">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 lg:gap-6 lg:flex-row-reverse">
        <div className="flex w-full flex-1 justify-center p-2 lg:justify-start lg:p-0">
          <div className="relative w-full max-w-xl">
            <img
              alt="Panneau mural effet marbre"
              className="w-full"
              src="/pvc_marbre.webp"
            />
       
          </div>
        </div>

        <div className="flex-1 px-4 lg:px-0">
          <h2 className="mb-4 text-2xl font-bold lg:text-4xl">Panneau Effet Marbre</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-600 lg:text-lg">
            Le panneau effet marbre apporte une finition elegante et moderne a vos murs, sans les
            contraintes du marbre naturel. Il reproduit l aspect noble de la pierre tout en restant
            plus leger, plus simple a manipuler et rapide a poser.
          </p>
          <p className="mb-6 text-sm leading-relaxed text-slate-600 lg:text-lg">
            Ideal pour salon, chambre, cuisine ou espace commercial, ce panneau PVC combine style
            haut de gamme et praticite au quotidien. Il resiste a l humidite, se nettoie facilement
            et transforme votre interieur avec un rendu visuel premium.
          </p>

          <Link
            href="/shop"
            className="relative isolate mb-6 inline-block cursor-pointer overflow-hidden rounded-lg bg-[#c19a2f] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-white transition-transform duration-300 before:absolute before:inset-y-0 before:left-[-40%] before:w-[35%] before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-180%] before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-[420%] hover:scale-[1.01] active:scale-95 lg:px-6 lg:text-sm lg:tracking-widest"
          >
            Decouvrir
          </Link>

          <div className="grid grid-cols-3 gap-8 border-t border-[#c19a2f]/20 pt-4">
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">100%</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">
                Effet premium
              </p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">Facile</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">
                Pose rapide
              </p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">Durable</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">
                Entretien simple
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

