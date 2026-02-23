"use client"

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) {
        setProgress(0)
        return
      }

      const next = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100))
      setProgress(next)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-zinc-200/60 backdrop-blur dark:bg-zinc-800/60">
      <div className="h-full bg-blue-600 transition-[width] duration-100" style={{ width: `${progress}%` }} />
    </div>
  )
}

