import Link from 'next/link'

export default function HomeWoodProfileSection() {
  return (
    <section className="bg-white py-12 lg:py-18">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 lg:gap-6 lg:flex-row">
        <div className="flex w-full flex-1 justify-center p-2 lg:justify-start lg:p-0">
          <img
            alt="Profile mural effet bois"
            className="w-full max-w-xl rounded-2xl"
            src="/pvc_bois.webp"
          />
        </div>

        <div className="flex-1 px-4 lg:px-0">
          <h2 className="mb-4 text-2xl font-bold lg:text-4xl">Profile Effet Bois</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-600 lg:text-lg">
            Le profile effet bois apporte chaleur et caractere a votre interieur avec un rendu
            naturel et contemporain. Il valorise les murs, les cloisons et les zones decoratives
            tout en restant leger et facile a integrer dans tous les styles.
          </p>
          <p className="mb-6 text-sm leading-relaxed text-slate-600 lg:text-lg">
            Concu pour une installation propre et rapide, il offre une excellente resistance dans le
            temps et un entretien simple au quotidien. C est une solution ideale pour creer une
            ambiance elegante, cosy et moderne sans gros travaux.
          </p>

          <Link
            href="/shop"
            className="relative isolate mb-6 inline-block cursor-pointer overflow-hidden rounded-lg bg-[#c19a2f] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-white transition-transform duration-300 before:absolute before:inset-y-0 before:left-[-40%] before:w-[35%] before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-180%] before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-[420%] hover:scale-[1.01] active:scale-95 lg:px-6 lg:text-sm lg:tracking-widest"
          >
            Decouvrir
          </Link>

          <div className="grid grid-cols-3 gap-8 border-t border-[#c19a2f]/20 pt-4">
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">Naturel</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">
                Rendu bois
              </p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">Rapide</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:text-xs">
                Installation
              </p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-[#c19a2f] lg:text-3xl">Propre</p>
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

