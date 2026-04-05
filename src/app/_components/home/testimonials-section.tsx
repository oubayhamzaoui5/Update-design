const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarra B.",
    location: "Tunis",
    rating: 5,
    quote: "Livraison rapide, produits conformes aux photos. Les panneaux muraux effet marbre ont transformé notre salon — qualité remarquable.",
  },
  {
    id: 2,
    name: "Mehdi K.",
    location: "Sfax",
    rating: 5,
    quote: "Fournisseur sérieux pour nos projets hôteliers. Les parasols déportés Ibiza sont robustes et esthétiques. Je recommande vivement.",
  },
  {
    id: 3,
    name: "Nour A.",
    location: "Sousse",
    rating: 5,
    quote: "Le store à bras invisibles installé sur notre terrasse est parfait — mécanisme silencieux et toile de qualité. Équipe réactive.",
  },
  {
    id: 4,
    name: "Rami H.",
    location: "Monastir",
    rating: 5,
    quote: "Partenaire de confiance depuis deux ans pour nos résidences. Tarifs compétitifs, stock disponible, livraison en 48h. Rien à redire.",
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" style={{ color: i < rating ? GOLD : 'rgba(28,26,20,0.12)' }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section style={{ background: CREAM }} className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 text-center">
          <p
            style={{
              fontFamily: BODY,
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: GOLD,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Ils nous font confiance
          </p>
          <h2
            style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 400,
              color: DARK,
              letterSpacing: '-0.01em',
            }}
          >
            Avis de nos clients
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ border: `1px solid rgba(196,162,62,0.14)`, background: '#fff' }}
            >
              <Stars rating={t.rating} />
              <blockquote
                style={{
                  fontFamily: BODY,
                  fontSize: '0.85rem',
                  color: 'rgba(28,26,20,0.65)',
                  lineHeight: 1.65,
                  flex: 1,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-sm font-bold"
                  style={{
                    background: `rgba(196,162,62,0.1)`,
                    border: `1px solid rgba(196,162,62,0.3)`,
                    color: GOLD,
                    fontFamily: BODY,
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, color: DARK }}>{t.name}</p>
                  <p style={{ fontFamily: BODY, fontSize: '0.75rem', color: 'rgba(28,26,20,0.4)' }}>{t.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
