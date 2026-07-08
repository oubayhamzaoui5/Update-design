'use client'

import { useState, type ComponentType } from 'react'
import Image from 'next/image'
import { Check, Copy, Image as ImageIcon } from 'lucide-react'

const GOLD = '#C4A23E'
const DARK = '#14130F'
const OK = '#3E7A38'

/* ----------------------------------------------------------------------------
   ImageSlot — shared catalogue image cell.

   • src set      → renders the real photo (next/image, alt preserved).
   • src empty    → renders a labelled placeholder carrying the French `alt`,
                    a ready-to-paste ChatGPT image prompt (click to copy) and
                    an aspect-ratio badge. The box already holds the final
                    aspect ratio so layout matches the future photo.

   Slot order on a page == the order the prompts are listed, so images
   generated "in order" map 1:1 by index.
---------------------------------------------------------------------------- */
export function ImageSlot({
  alt,
  prompt,
  ar,
  label,
  src,
  accent = GOLD,
  Icon = ImageIcon,
  dark = false,
  imgClassName = 'object-cover',
  sizes = '(max-width:768px) 100vw, 60vw',
}: {
  alt: string
  prompt: string
  ar: string
  label?: string
  src?: string
  accent?: string
  Icon?: ComponentType<{ className?: string; style?: React.CSSProperties }>
  dark?: boolean
  imgClassName?: string
  sizes?: string
}) {
  const [copied, setCopied] = useState(false)
  const [w, h] = ar.split(':').map(Number)

  if (src) {
    return (
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${w} / ${h}` }}>
        <Image src={src} alt={alt} fill sizes={sizes} className={imgClassName} />
      </div>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard blocked — prompt still visible to copy manually */
    }
  }

  const fg = dark ? 'rgba(247,242,232,0.86)' : 'rgba(20,19,15,0.82)'
  const sub = dark ? 'rgba(247,242,232,0.45)' : 'rgba(20,19,15,0.45)'
  const bg = dark
    ? 'repeating-linear-gradient(135deg,#1c1b16 0 14px,#211f19 14px 28px)'
    : 'repeating-linear-gradient(135deg,#efe7d6 0 14px,#e7dcc6 14px 28px)'
  const border = dark ? 'rgba(196,162,62,0.32)' : 'rgba(20,19,15,0.16)'

  return (
    <figure
      className="group relative flex h-full w-full flex-col justify-between overflow-hidden border"
      style={{ aspectRatio: `${w} / ${h}`, background: bg, borderColor: border, borderStyle: 'dashed' }}
      data-image-alt={alt}
      data-image-prompt={prompt}
      data-image-ar={ar}
      aria-label={alt}
    >
      <div className="flex items-start justify-between gap-2 p-3">
        <span
          className="inline-flex items-center gap-2 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ background: dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)', color: fg }}
        >
          <Icon className="h-3 w-3" style={{ color: accent }} />
          {label ?? 'Image'}
        </span>
        <span className="px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]" style={{ background: accent, color: DARK }}>
          AR {ar}
        </span>
      </div>

      <figcaption className="px-5 text-center text-[11px] font-semibold leading-5" style={{ color: fg }}>
        {alt}
      </figcaption>

      <button
        type="button"
        onClick={copy}
        className="m-3 flex items-start gap-2 border px-3 py-2 text-left transition"
        style={{ background: dark ? 'rgba(0,0,0,0.34)' : 'rgba(255,255,255,0.78)', borderColor: border, color: sub }}
        title="Copier le prompt ChatGPT"
      >
        {copied ? <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color: OK }} /> : <Copy className="mt-0.5 h-3 w-3 shrink-0" style={{ color: accent }} />}
        <span className="line-clamp-3 text-[10px] leading-4">
          <span className="font-bold" style={{ color: fg }}>{copied ? 'Copié ✓ ' : 'Prompt ChatGPT — '}</span>
          {prompt}
        </span>
      </button>
    </figure>
  )
}
