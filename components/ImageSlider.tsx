'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaExpand, FaCompress, FaVideo, FaTimes } from 'react-icons/fa'

interface ImageSliderProps {
  images: { url: string; caption?: string | null }[]
  videoUrl?: string | null
  autoPlayInterval?: number // milliseconds, default 5000
  showThumbnails?: boolean
  propertyTitle?: string
}

export default function ImageSlider({
  images,
  videoUrl,
  autoPlayInterval = 5000,
  showThumbnails = true,
  propertyTitle = 'Property'
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageOrientations, setImageOrientations] = useState<{ [key: string]: 'portrait' | 'landscape' }>({})

  const allMedia = [
    ...images.map((img, i) => ({ type: 'image' as const, url: img.url, caption: img.caption })),
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl, caption: 'Property Video' }] : [])
  ]

  const totalSlides = allMedia.length

  // Detect image orientation
  useEffect(() => {
    images.forEach((img) => {
      const image = new window.Image()
      image.onload = () => {
        setImageOrientations(prev => ({
          ...prev,
          [img.url]: image.width < image.height ? 'portrait' : 'landscape'
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

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || totalSlides <= 1) return
    
    // Don't auto-advance on video slides
    if (allMedia[currentIndex]?.type === 'video') return
    
    const timer = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isPlaying, autoPlayInterval, nextSlide, currentIndex, allMedia, totalSlides])

  // Touch handlers for swipe gestures
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) nextSlide()
    if (isRightSwipe) prevSlide()
  }

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

  if (totalSlides === 0) {
    return (
      <div className="relative h-[400px] md:h-[500px] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    )
  }

  const currentMedia = allMedia[currentIndex]

  // Determine if current image is portrait
  const isPortrait = currentMedia.type === 'image' && imageOrientations[currentMedia.url] === 'portrait'

  return (
    <>
      <div
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-[400px] md:h-[500px]'} overflow-hidden ${isPortrait ? 'bg-gray-900' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Slide */}
        {currentMedia.type === 'image' ? (
          <Image
            src={currentMedia.url}
            alt={currentMedia.caption || propertyTitle}
            fill
            className={`transition-opacity duration-500 ${isPortrait ? 'object-contain' : 'object-cover'}`}
            priority={currentIndex === 0}
          />
        ) : (
          <video
            src={currentMedia.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Close button for fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors"
            aria-label="Exit fullscreen"
          >
            <FaTimes className="text-white text-xl" />
          </button>
        )}

        {/* Caption */}
        {currentMedia.caption && (
          <div className="absolute bottom-16 left-4 right-4 text-white text-center">
            <p className="text-lg font-medium drop-shadow-lg">{currentMedia.caption}</p>
          </div>
        )}

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 md:p-3 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <FaChevronLeft className="text-white text-lg md:text-xl" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 md:p-3 rounded-full transition-colors"
              aria-label="Next image"
            >
              <FaChevronRight className="text-white text-lg md:text-xl" />
            </button>
          </>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {totalSlides > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
            </button>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <FaCompress className="text-white" /> : <FaExpand className="text-white" />}
          </button>
        </div>
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {media.type === 'video' && (
                <FaVideo className="text-[6px] md:text-[8px]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && totalSlides > 1 && !isFullscreen && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 px-1">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-cyan-600 ring-2 ring-cyan-300'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {media.type === 'image' ? (
                <Image
                  src={media.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <FaVideo className="text-white text-xl" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

