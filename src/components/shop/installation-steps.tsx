import Image from 'next/image'

const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const GOLD = '#C4A23E'
const DARK = '#14130F'
const CREAM = '#F7F2E8'

const SOTUMA_BASE = 'https://www.sotuma.tn'

const METHODS = [
  {
    eyebrow: 'Methode 1',
    title: 'Fixation directe au clou',
    images: [
      `${SOTUMA_BASE}/web/image/161080/Inst-meth1-2.png`,
      `${SOTUMA_BASE}/web/image/161079/Inst-meth1-1.png`,
    ],
    points: [
      "Enfoncer le clou en diagonale dans la surface dure.",
      "Le clou peut etre recouvert par la planche suivante qui se clipse.",
      "La fixation reste propre et n'affecte pas l'esthetique.",
      "Verifier l'alignement de chaque lame avant de passer a la suivante.",
    ],
  },
  {
    eyebrow: 'Methode 2',
    title: 'Fixation avec attache sur quille',
    images: [
      `${SOTUMA_BASE}/web/image/161082/Inst-meth2-1.png`,
      `${SOTUMA_BASE}/web/image/161084/Inst-meth2-2.png`,
    ],
    points: [
      "Inserer l'attache dans le bas du bord du panneau mural.",
      'Fixer avec des vis auto-taraudeuses et des attaches en acier inoxydable.',
      "Installer sur un mur lisse ou sur une quille en bois pour niveler la surface.",
      'La pose peut etre demontee et reutilisee.',
    ],
  },
]

export default function InstallationSteps() {
  return (
    <section
      aria-labelledby="installation-steps-heading"
      className="relative overflow-hidden px-5 py-16 md:px-10 md:py-20"
      style={{ background: DARK, color: CREAM }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(90deg,#C4A23E 1px,transparent 1px),linear-gradient(#C4A23E 1px,transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-10 max-w-3xl">
          <p
            style={{
              fontFamily: BODY,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: 10,
            }}
          >
            Profil mural effet bois
          </p>
          <h2
            id="installation-steps-heading"
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(2.1rem, 4vw, 4.2rem)',
              fontWeight: 400,
              lineHeight: 0.98,
              color: CREAM,
              margin: 0,
            }}
          >
            Installation propre, sans colle obligatoire
          </h2>
          <p
            className="mt-5 max-w-2xl"
            style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.8, color: 'rgba(247,242,232,0.68)' }}
          >
            Les profils se posent par clouage diagonal, par attache murale ou sur quille en bois selon l'etat du mur et
            le niveau de finition recherche.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {METHODS.map((method, index) => (
            <article
              key={method.title}
              className="group flex h-full flex-col border border-[#C4A23E]/20 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-[#C4A23E]/45 hover:bg-white/[0.07]"
            >
              <div className="relative border-b border-[#C4A23E]/18 bg-white p-4">
                {method.images.length > 1 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {method.images.map((image) => (
                      <div key={image} className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white">
                        <Image
                          src={image}
                          alt={method.title}
                          fill
                          className="object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white">
                    <Image
                      src={method.images[0]}
                      alt={method.title}
                      fill
                      className="object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                )}
                <span
                  className="absolute left-4 top-4 border border-[#C4A23E]/30 bg-[#14130F] px-3 py-1.5"
                  style={{
                    fontFamily: BODY,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: GOLD,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5 md:p-6">
                <p
                  style={{
                    fontFamily: BODY,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: GOLD,
                    marginBottom: 10,
                  }}
                >
                  {method.eyebrow}
                </p>
                <h3
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: '1.55rem',
                    fontWeight: 400,
                    lineHeight: 1.05,
                    color: CREAM,
                    marginBottom: 18,
                  }}
                >
                  {method.title}
                </h3>
                <ul className="mt-auto space-y-3">
                  {method.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: GOLD }}
                        aria-hidden="true"
                      />
                      <span style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.65, color: 'rgba(247,242,232,0.72)' }}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
