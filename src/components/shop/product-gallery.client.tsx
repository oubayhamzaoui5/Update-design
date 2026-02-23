"use client"

import { useState } from "react"
import Image from "next/image"

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[]
  productName: string
}) {
  const [currentImage, setCurrentImage] = useState(0)

  const safeImages = Array.isArray(images) && images.length ? images : ["/placeholder-square.png"]

  // Manual image selection
  const handleSelectImage = (index: number) => {
    if (index === currentImage) return
    setCurrentImage(index)
  }

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative bg-muted rounded-2xl overflow-hidden aspect-square">
        <Image
          src={safeImages[currentImage]}
          alt={productName}
          fill
          unoptimized
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {safeImages.map((img, i) => (
            <button
              key={img + i}
              onClick={() => handleSelectImage(i)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentImage === i
                  ? "border-accent scale-105"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} view ${i + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
