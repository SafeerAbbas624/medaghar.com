'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'
import type { PropertyMapProps } from './PropertyMap'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

type Property = PropertyMapProps['properties'][0]

// Component to update map view when properties change
function MapUpdater({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(
        properties.map(p => [p.latitude, p.longitude] as [number, number])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [properties, map])

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

export default function PropertyMapClient({ properties, center, zoom = 12, height = '500px' }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [bearing, setBearing] = useState(0)

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

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'FOR_RENT') {
      return `PKR ${price.toLocaleString()}/month`
    }
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Crore`
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(2)} Lakh`
    }
    return `PKR ${price.toLocaleString()}`
  }

  // Default center to Pakistan (Lahore)
  const defaultCenter: [number, number] = center || [31.5204, 74.3587]

  // Calculate center from properties if available
  const mapCenter: [number, number] = properties.length > 0 && !center
    ? [
        properties.reduce((sum, p) => sum + p.latitude, 0) / properties.length,
        properties.reduce((sum, p) => sum + p.longitude, 0) / properties.length,
      ]
    : defaultCenter

  if (!isMounted) {
    return (
      <div style={{ height }} className="bg-gray-200 rounded-lg flex items-center justify-center">
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

      <div style={{ height }} className="rounded-lg overflow-hidden shadow-md relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {properties.length > 0 && <MapUpdater properties={properties} />}
          <MapRotator bearing={bearing} />

          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {property.images && property.images.length > 0 && (
                    <img
                      src={property.images[0].url}
                      alt={property.address}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <div className="font-bold text-lg text-cyan-600 mb-1">
                    {formatPrice(property.price, property.listingType)}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {property.address}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {property.area && `${property.area}, `}{property.city}
                  </div>
                  <Link
                    href={`/properties/${property.id}`}
                    className="block text-center bg-cyan-700 text-white px-3 py-1 rounded text-sm hover:bg-cyan-800 transition"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

