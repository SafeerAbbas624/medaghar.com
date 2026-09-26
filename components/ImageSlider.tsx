'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaExpand, FaVideo, FaTimes } from 'react-icons/fa'

interface ImageSliderProps {
  images: { url: string; caption?: string | null }[]
  videoUrl?: string | null
  autoPlayInterval?: number // milliseconds, default 5000
  showThumbnails?: boolean
  propertyTitle?: string
}

type Media = { type: 'image' | 'video'; url: string; caption?: string | null }

const MIN_SWIPE = 50

/** Swipe left/right on touch screens. */
function useSwipe(onNext: () => void, onPrev: () => void) {
  const start = useRef<number | null>(null)
  const end = useRef<number | null>(null)
  return {
    onTouchStart: (e: React.TouchEvent) => {
      end.current = null
      start.current = e.targetTouches[0].clientX
    },
    onTouchMove: (e: React.TouchEvent) => {
      end.current = e.targetTouches[0].clientX
    },
    onTouchEnd: () => {
      if (start.current === null || end.current === null) return
      const d = start.current - end.current
      if (d > MIN_SWIPE) onNext()
      if (d < -MIN_SWIPE) onPrev()
    },
  }
}

// Controls are at least 44px on phones so they are easy to hit with a thumb.
const ROUND_BTN =
  'flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-full bg-black/55 hover:bg-black/75 text-white transition-colors'

function Slide({ media, alt, contain, priority }: { media: Media; alt: string; contain: boolean; priority?: boolean }) {
  if (media.type === 'video') {
    return (
      <video
        src={media.url}
        autoPlay
        muted
        loop
        playsInline
        controls
        className={`w-full h-full ${contain ? 'object-contain' : 'object-cover'}`}
      />
    )
  }
  return (
    <Image
      src={media.url}
      alt={alt}
      fill
      sizes="100vw"
      className={contain ? 'object-contain' : 'object-cover'}
      priority={priority}
    />
  )
}

export default function ImageSlider({
  images,
  videoUrl,
  autoPlayInterval = 5000,
  showThumbnails = true,
  propertyTitle = 'Property',
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [imageOrientations, setImageOrientations] = useState<{ [key: string]: 'portrait' | 'landscape' }>({})

  const allMedia = useMemo<Media[]>(
    () => [
      ...images.map((img) => ({ type: 'image' as const, url: img.url, caption: img.caption })),
      ...(videoUrl ? [{ type: 'video' as const, url: videoUrl, caption: 'Property Video' }] : []),
    ],
    [images, videoUrl]
  )
  const totalSlides = allMedia.length

  // The fullscreen view is portalled to <body>; that needs the DOM.
  useEffect(() => setMounted(true), [])

  // Detect image orientation (portrait photos are shown whole, not cropped).
  useEffect(() => {
    images.forEach((img) => {
      const image = new window.Image()
      image.onload = () => {
        setImageOrientations((prev) => ({
          ...prev,
          [img.url]: image.width < image.height ? 'portrait' : 'landscape',
        }))
      }
      image.src = img.url
    })
  }, [images])

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Auto-play. Never advances off a video, and pauses while in fullscreen so
  // the photo someone is studying does not change under them.
  const onVideo = allMedia[currentIndex]?.type === 'video'
  useEffect(() => {
    if (!isPlaying || isFullscreen || totalSlides <= 1 || onVideo) return
    const timer = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isPlaying, isFullscreen, autoPlayInterval, nextSlide, totalSlides, onVideo])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Lock page scroll behind the fullscreen view.
  useEffect(() => {
    if (!isFullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isFullscreen])

  const swipe = useSwipe(nextSlide, prevSlide)

  if (totalSlides === 0) {
    return (
      <div className="relative h-[400px] md:h-[500px] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    )
  }

  const currentMedia = allMedia[currentIndex]
  const alt = currentMedia.caption || propertyTitle
  const isPortrait = currentMedia.type === 'image' && imageOrientations[currentMedia.url] === 'portrait'

  const arrows =
    totalSlides > 1 ? (
      <>
        <button
          type="button"
          onClick={prevSlide}
          className={`${ROUND_BTN} absolute left-2 md:left-4 top-1/2 -translate-y-1/2`}
          aria-label="Previous image"
        >
          <FaChevronLeft className="text-lg" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className={`${ROUND_BTN} absolute right-2 md:right-4 top-1/2 -translate-y-1/2`}
          aria-label="Next image"
        >
          <FaChevronRight className="text-lg" />
        </button>
      </>
    ) : null

  const fullscreen =
    isFullscreen && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[1000] bg-black flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`${propertyTitle} photos`}
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-3 md:px-5 py-2 text-white">
              <span className="text-sm md:text-base tabular-nums">
                {currentIndex + 1} / {totalSlides}
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className={ROUND_BTN}
                aria-label="Close fullscreen"
                autoFocus
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Photo */}
            <div className="relative flex-1 min-h-0" {...swipe}>
              <Slide media={currentMedia} alt={alt} contain />
              {arrows}
            </div>

            {currentMedia.caption && (
              <p className="px-4 py-2 text-center text-white text-sm md:text-base">{currentMedia.caption}</p>
            )}
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div
        className={`relative h-[400px] md:h-[500px] overflow-hidden ${isPortrait ? 'bg-gray-900' : ''}`}
        {...swipe}
      >
        <Slide media={currentMedia} alt={alt} contain={isPortrait} priority={currentIndex === 0} />

        {/* Gradient overlay (does not block taps) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Caption */}
        {currentMedia.caption && (
          <div className="pointer-events-none absolute bottom-16 left-4 right-4 text-white text-center">
            <p className="text-lg font-medium drop-shadow-lg">{currentMedia.caption}</p>
          </div>
        )}

        {arrows}

        {/* Controls */}
        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex gap-3">
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className={ROUND_BTN}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className={ROUND_BTN}
            aria-label="Enter fullscreen"
          >
            <FaExpand />
          </button>
        </div>

        {/* Slide indicators: small dots, hidden on phones where they crowd the controls */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden sm:flex gap-2">
          {allMedia.map((media, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {media.type === 'video' && <FaVideo className="text-[6px] md:text-[8px]" />}
            </button>
          ))}
        </div>

        {/* Counter on phones, in place of the dots */}
        <div className="pointer-events-none absolute bottom-4 left-3 sm:hidden rounded-full bg-black/55 px-2.5 py-1 text-xs text-white tabular-nums">
          {currentIndex + 1} / {totalSlides}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && totalSlides > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 px-1">
          {allMedia.map((media, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-cyan-600 ring-2 ring-cyan-300' : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`Show photo ${index + 1}`}
            >
              {media.type === 'image' ? (
                <Image src={media.url} alt={`Thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <FaVideo className="text-white text-xl" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {fullscreen}
    </>
  )
}
