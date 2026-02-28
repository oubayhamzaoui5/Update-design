import Image from 'next/image'

const STEPS = [
  {
    image: '/step1.webp',
    title: 'Découpez le panneau à la dimension souhaitée',
    text: "Mesurez la surface à couvrir puis découpez le panneau à l'aide d'une scie adaptée ou d'un cutter selon le matériau. L'installation ne nécessite aucun outil professionnel.",
  },
  {
    image: '/step2.webp',
    title: 'Appliquez la colle PL500',
    text: 'Appliquez la colle PL500 en lignes ou en points réguliers au dos du panneau afin d’assurer une fixation solide et durable sur tous types de murs propres et secs.',
  },
  {
    image: '/step3.webp',
    title: 'Positionnez et fixez au mur',
    text: 'Placez le panneau contre le mur, ajustez si nécessaire, puis appuyez fermement pendant quelques minutes pour garantir une adhérence parfaite.',
  },
]

export default function InstallationSteps() {
  return (
    <section aria-labelledby="installation-steps-heading" className="mx-auto max-w-7xl px-4 py-10">
      <h2 id="installation-steps-heading" className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        {'Installation Facile en 3 Étapes'}
      </h2>

      {/* 1. The grid now handles the row alignment for children via subgrid */}
      <ol className="grid grid-cols-1 gap-10 lg:grid-cols-3">
  {STEPS.map((step, index) => (
    <li key={step.title} className="flex flex-col h-full">
      <article className="flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card">
        
        {/* 1. Image stays fixed aspect ratio */}
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={step.image}
            alt={`Étape ${index + 1} - ${step.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </div>

        <div className="flex flex-col flex-grow p-6">
          {/* 2. Step Label */}
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-accent">
            Étape {index + 1}
          </p>

          {/* 3. Title with min-height forces alignment of the text below */}
          {/* min-h-[3.5rem] is roughly 2 lines of text. Adjust as needed. */}
          <h3 className="mb-2 min-h-[2rem] text-lg font-semibold leading-tight">
            {step.title}
          </h3>

          {/* 4. Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {step.text}
          </p>
        </div>

      </article>
    </li>
  ))}
</ol>
    </section>
  )
}