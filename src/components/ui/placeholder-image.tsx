/**
 * PlaceholderImage
 * -----------------
 * Branded, fill-style placeholder used across the landing while real
 * photography is being produced. It renders the briefing for the slot
 * (`alt`) directly on the panel so the team knows exactly what to shoot
 * and drop in. Swap each instance for <Image src=... alt={alt} fill /> later;
 * keep the same `alt` text for SEO.
 *
 * Usage: parent must be `relative` with a defined size (or aspect ratio).
 */

const GOLD = '#C4A23E'
const DARK = '#1C1A14'
const CREAM = '#FDFAF5'

type Tone = 'dark' | 'light'

export function PlaceholderImage({
  alt,
  tone = 'dark',
  ratio,
  className = '',
}: {
  /** The real image brief AND the future alt attribute. Be descriptive. */
  alt: string
  tone?: Tone
  /** Optional human hint shown on the panel, e.g. "16:9 · paysage". */
  ratio?: string
  className?: string
}) {
  const isDark = tone === 'dark'
  const fg = isDark ? CREAM : DARK
  const bg = isDark ? DARK : CREAM

  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ background: bg, color: fg }}
    >
      {/* texture: fine gold grid + diagonal hairlines for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: isDark ? 0.1 : 0.14,
          backgroundImage:
            'linear-gradient(rgba(196,162,62,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(196,162,62,.5) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.5,
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0 22px, rgba(196,162,62,.05) 22px 23px)',
        }}
      />

      <div className="relative z-10 flex max-w-[78%] flex-col items-center px-6 text-center">
        {/* minimalist photo glyph */}
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4 opacity-90"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <circle cx="8.5" cy="9" r="1.6" />
          <path d="M21 17l-5.2-5.2a1 1 0 0 0-1.4 0L4 22" />
        </svg>

        <span
          className="mb-2 text-[9px] font-bold uppercase tracking-[0.34em]"
          style={{ color: GOLD }}
        >
          Image à intégrer
        </span>

        <p
          className="text-[12px] font-medium leading-snug md:text-[13px]"
          style={{ color: fg, opacity: 0.82 }}
        >
          {alt}
        </p>

        {ratio && (
          <span
            className="mt-3 text-[9px] font-bold uppercase tracking-[0.22em]"
            style={{ color: fg, opacity: 0.4 }}
          >
            {ratio}
          </span>
        )}
      </div>
    </div>
  )
}

export default PlaceholderImage
