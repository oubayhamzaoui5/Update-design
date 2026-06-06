'use client'

import { useState } from 'react'
import Image from 'next/image'

const GOLD = '#C4A23E'
const INK = '#25231C'
const CREAM = '#F7F2E8'
const PAPER = '#E9DDC9'
const BODY = "'DM Sans', 'Outfit', system-ui, sans-serif"
const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"

type Model = { ref: string; src: string }
type Texture = { name: string; src: string }

type Props = {
  models: Model[]
  textures: Texture[]
  texturesLabel?: string
}

export default function ModelTextureSelector({ models, textures, texturesLabel }: Props) {
  const [selectedModel, setSelectedModel] = useState(0)

  const model = models[selectedModel]

  return (
    <div style={{ fontFamily: BODY, color: INK }}>

      {/* Model selector row */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 mb-10">
        {models.map((m, i) => {
          const active = i === selectedModel
          return (
            <button
              key={m.ref}
              onClick={() => setSelectedModel(i)}
              className="group flex flex-col items-center gap-0 focus:outline-none"
            >
              <div
                className="relative w-full overflow-hidden transition-all duration-200"
                style={{
                  aspectRatio: '1 / 1',
                  background: '#D8CCB7',
                  outline: active ? `2px solid ${GOLD}` : '2px solid transparent',
                  outlineOffset: '0px',
                }}
              >
                <Image
                  src={m.src}
                  alt={`Profil ${m.ref}`}
                  fill
                  sizes="(max-width:640px) 33vw, 16vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <p
                className="mt-2 text-[11px] font-bold uppercase tracking-[0.22em] transition-colors"
                style={{ color: active ? GOLD : `${INK}66` }}
              >
                {m.ref}
              </p>
            </button>
          )
        })}
      </div>

      {/* Main panel: left = large model, right = textures */}
      <div className="grid gap-0 md:grid-cols-[0.48fr_1fr]" style={{ border: `1px solid ${GOLD}22` }}>

        {/* Left: selected model */}
        <div className="flex flex-col" style={{ background: PAPER, borderRight: `1px solid ${GOLD}22` }}>
          <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
            <Image
              key={model.ref}
              src={model.src}
              alt={`Profil ${model.ref}`}
              fill
              sizes="(max-width:768px) 100vw, 40vw"
              className="object-contain p-8"
              priority
            />
          </div>
          <div className="border-t px-6 py-5" style={{ borderColor: `${GOLD}22` }}>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ color: GOLD }}
            >
              Modele
            </p>
            <p
              className="mt-1"
              style={{ fontFamily: DISPLAY, fontSize: '2.2rem', lineHeight: 1, fontWeight: 400 }}
            >
              {model.ref}
            </p>
          </div>
        </div>

        {/* Right: textures grid */}
        <div className="p-6 md:p-8" style={{ background: CREAM }}>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
            {texturesLabel ?? 'References de texture disponibles'}
          </p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {textures.map((t) => (
              <div key={t.name} className="flex flex-col items-center gap-2">
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: '1 / 1', border: `1px solid ${GOLD}33` }}
                >
                  <Image
                    src={t.src}
                    alt={`Texture ${t.name}`}
                    fill
                    sizes="(max-width:640px) 22vw,(max-width:1024px) 14vw,10vw"
                    className="object-cover"
                  />
                </div>
                <p
                  className="text-[9px] uppercase tracking-[0.14em] text-center"
                  style={{ color: `${INK}66` }}
                >
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
