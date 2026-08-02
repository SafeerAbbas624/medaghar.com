'use client'

import { useState } from 'react'
import { FaCube, FaVideo, FaTimes, FaExpand, FaCompress } from 'react-icons/fa'

interface VirtualTourProps {
  virtualTourUrl?: string | null
  video3DTour?: string | null
  videoUrl?: string | null
  propertyTitle: string
}

export default function VirtualTour({ virtualTourUrl, video3DTour, videoUrl, propertyTitle }: VirtualTourProps) {
  // Use video3DTour if available, otherwise fall back to videoUrl
  const effectiveVideoUrl = video3DTour || videoUrl
  const [activeTab, setActiveTab] = useState<'virtual' | 'video'>(virtualTourUrl ? 'virtual' : 'video')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // If no tour type is available, don't render anything
  if (!virtualTourUrl && !effectiveVideoUrl) {
    return null
  }

  const getEmbedUrl = (url: string, type: 'virtual' | 'video') => {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
    }

    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }

    // Handle Matterport URLs
    if (url.includes('matterport.com')) {
      if (url.includes('/show/')) {
        return url.replace('/show/', '/showcase.html?m=')
      }
      return url
    }

    // Handle Kuula URLs (360 virtual tours)
    if (url.includes('kuula.co')) {
      return url
    }

    // For other URLs, assume they're already embed-ready
    return url
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with Tabs */}
      <div className="bg-slate-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {virtualTourUrl && (
              <button
                onClick={() => setActiveTab('virtual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === 'virtual'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-slate-100'
                }`}
              >
                <FaCube />
                <span className="font-medium">3D Virtual Tour</span>
              </button>
            )}
            {effectiveVideoUrl && (
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === 'video'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-slate-100'
                }`}
              >
                <FaVideo />
                <span className="font-medium">Video Tour</span>
              </button>
            )}
          </div>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-slate-100 transition"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Tour Content */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition"
          >
            <FaTimes className="text-xl" />
          </button>
        )}

        <div className={`${isFullscreen ? 'h-screen' : 'h-[500px] md:h-[600px]'}`}>
          {activeTab === 'virtual' && virtualTourUrl && (
            <iframe
              src={getEmbedUrl(virtualTourUrl, 'virtual')}
              title={`Virtual Tour - ${propertyTitle}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; vr"
              allowFullScreen
            />
          )}

          {activeTab === 'video' && effectiveVideoUrl && (
            <iframe
              src={getEmbedUrl(effectiveVideoUrl, 'video')}
              title={`Video Tour - ${propertyTitle}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-slate-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {activeTab === 'virtual' ? (
              <FaCube className="text-cyan-600 text-xl" />
            ) : (
              <FaVideo className="text-cyan-600 text-xl" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              {activeTab === 'virtual' ? '3D Virtual Tour' : 'Video Tour'}
            </h4>
            <p className="text-sm text-gray-600">
              {activeTab === 'virtual' 
                ? 'Explore this property in immersive 3D. Click and drag to look around, use arrow keys or click on navigation points to move through the space.'
                : 'Watch a guided video tour of this property. See all the key features and get a feel for the space from the comfort of your home.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

