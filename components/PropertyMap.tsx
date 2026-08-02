'use client'

import dynamic from 'next/dynamic'

export interface PropertyMapProps {
  properties: {
    id: string
    address: string
    city: string
    province: string
    area?: string
    price: number
    bedrooms: number
    bathrooms: number
    latitude: number
    longitude: number
    propertyType: string
    listingType: string
    images?: { url: string }[]
  }[]
  center?: [number, number]
  zoom?: number
  height?: string
}

// Dynamically import the actual map implementation to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('./PropertyMapClient'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '500px' }} className="bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
})

export default PropertyMap
