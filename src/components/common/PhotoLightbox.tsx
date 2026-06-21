import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Photo } from '@/types/api'

interface Props {
  photos: Photo[]
  initialIndex: number
  title?: string
  onClose: () => void
}

export function PhotoLightbox({ photos, initialIndex, title, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex((i) => (i + 1) % photos.length)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85"
      onClick={onClose}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return
        const dx = e.changedTouches[0].clientX - touchStartX.current
        if (dx > 50) prev()
        else if (dx < -50) next()
        touchStartX.current = null
      }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        {title ? (
          <span className="text-sm font-medium text-white">{title}</span>
        ) : (
          <span />
        )}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white"
          onClick={(e) => { e.stopPropagation(); prev() }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={photos[index].signedUrl ?? ''}
        alt=""
        className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {photos.length > 1 && (
        <button
          className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white"
          onClick={(e) => { e.stopPropagation(); next() }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>,
    document.body
  )
}
