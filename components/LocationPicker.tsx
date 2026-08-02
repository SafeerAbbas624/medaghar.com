'use client'

import dynamic from 'next/dynamic'

interface LocationPickerProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
  city?: string
}

// Dynamically import the map component to avoid SSR issues
const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
})

export default function LocationPicker({ latitude, longitude, onLocationChange, city }: LocationPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Property Location on Map
      </label>
      <div className="text-xs text-gray-500 mb-2 space-y-1">
        <p>📍 Click on the map to set the exact location of your property.</p>
        <p>🔄 Use the rotation buttons or keyboard shortcuts (Shift + ← / →) to rotate the map.</p>
      </div>
      <LocationPickerMap
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
        city={city}
      />
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label className="block text-xs text-gray-600">Latitude</label>
          <input
            type="text"
            value={latitude.toFixed(6)}
            readOnly
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-slate-50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Longitude</label>
          <input
            type="text"
            value={longitude.toFixed(6)}
            readOnly
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-slate-50"
          />
        </div>
      </div>
    </div>
  )
}

