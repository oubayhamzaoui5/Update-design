"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[]
  productName: string
}) {
  const [currentImage, setCurrentImage] = useState(0)

  const safeImages = Array.isArray(images) && images.length ? images : ["/aboutimg.webp"]
  const hasMultipleImages = safeImages.length > 1

  // Manual image selection
  const handleSelectImage = (index: number) => {
    if (index === currentImage) return
    setCurrentImage(index)
  }

  const handlePreviousImage = () => {
    if (!hasMultipleImages) return
    setCurrentImage((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    if (!hasMultipleImages) return
    setCurrentImage((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
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
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePreviousImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-sm transition hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-sm transition hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
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
