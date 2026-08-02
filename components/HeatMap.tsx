'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface HeatMapData {
  city: string
  lat: number
  lng: number
  avgPrice: number
  totalListings: number
  intensity: number
}

interface HeatMapProps {
  data: HeatMapData[]
  metric: 'price' | 'listings'
}

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapController({ data }: { data: HeatMapData[] }) {
  const map = useMap()

  useEffect(() => {
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(d => [d.lat, d.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [data, map])

  return null
}

export default function HeatMap({ data, metric }: HeatMapProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(2)} Lakh`
    }
    return `PKR ${price.toLocaleString()}`
  }

  const getColor = (intensity: number) => {
    // Green color scale based on intensity
    if (intensity >= 80) return '#15803d' // dark green
    if (intensity >= 60) return '#16a34a' // green
    if (intensity >= 40) return '#22c55e' // light green
    if (intensity >= 20) return '#4ade80' // lighter green
    return '#86efac' // very light green
  }

  const getRadius = (intensity: number) => {
    // Radius based on intensity (10-40 pixels)
    return 10 + (intensity / 100) * 30
  }

  // Pakistan center coordinates
  const center: [number, number] = [30.3753, 69.3451]

  return (
    <div className="h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController data={data} />

        {data.map((location, index) => (
          <CircleMarker
            key={index}
            center={[location.lat, location.lng]}
            radius={getRadius(location.intensity)}
            fillColor={getColor(location.intensity)}
            color="#fff"
            weight={2}
            opacity={0.8}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{location.city}</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Average Price:</span>{' '}
                    {formatPrice(location.avgPrice)}
                  </p>
                  <p>
                    <span className="font-medium">Total Listings:</span>{' '}
                    {location.totalListings}
                  </p>
                  <p>
                    <span className="font-medium">Market Intensity:</span>{' '}
                    {location.intensity}%
                  </p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

