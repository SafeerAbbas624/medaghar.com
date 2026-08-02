'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationPickerMapProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
  city?: string
}

// Component to handle map clicks
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Component to update map center when coordinates change
function MapUpdater({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom())
  }, [latitude, longitude, map])

  return null
}

// Component to handle map rotation
function MapRotator({ bearing }: { bearing: number }) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const panes = container.querySelector('.leaflet-map-pane') as HTMLElement
    if (panes) {
      panes.style.transform = `translate3d(0px, 0px, 0px) rotateZ(${bearing}deg)`
      panes.style.transition = 'transform 0.3s ease'
    }
  }, [bearing, map])

  return null
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange, city }: LocationPickerMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [bearing, setBearing] = useState(0)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Add keyboard shortcuts for rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        rotateLeft()
      } else if (e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault()
        rotateRight()
      } else if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault()
        resetRotation()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bearing])

  const rotateLeft = () => {
    setBearing(prev => prev - 15)
  }

  const rotateRight = () => {
    setBearing(prev => prev + 15)
  }

  const resetRotation = () => {
    setBearing(0)
  }

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Rotation Controls */}
      <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1 bg-white rounded-lg shadow-lg p-1">
        <button
          type="button"
          onClick={rotateLeft}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          title="Rotate Left (Shift + ←)"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={resetRotation}
          className="p-2 hover:bg-slate-100 rounded transition-colors text-xs font-semibold text-gray-700"
          title="Reset Rotation"
        >
          {bearing}°
        </button>
        <button
          type="button"
          onClick={rotateRight}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          title="Rotate Right (Shift + →)"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onLocationChange={onLocationChange} />
          <MapUpdater latitude={latitude} longitude={longitude} />
          <MapRotator bearing={bearing} />

          <Marker position={[latitude, longitude]} />
        </MapContainer>
      </div>
    </div>
  )
}

