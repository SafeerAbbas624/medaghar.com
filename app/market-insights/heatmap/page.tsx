'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { FaArrowLeft, FaHome, FaChartLine } from 'react-icons/fa'
import Link from 'next/link'

// Dynamically import map component to avoid SSR issues
const HeatMap = dynamic(() => import('@/components/HeatMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-slate-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
        <p className="text-gray-600">Loading heat map...</p>
      </div>
    </div>
  ),
})

interface HeatMapData {
  city: string
  lat: number
  lng: number
  avgPrice: number
  totalListings: number
  intensity: number
}

export default function HeatMapPage() {
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'listings'>('price')

  useEffect(() => {
    loadHeatMapData()
  }, [])

  const loadHeatMapData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/market-insights/heatmap')
      if (response.ok) {
        const data = await response.json()
        setHeatMapData(data.heatMapData || [])
      }
    } catch (error) {
      console.error('Error loading heat map data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(2)} Lakh`
    }
    return `PKR ${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/market-insights"
            className="inline-flex items-center text-cyan-600 hover:text-cyan-700 mb-4 text-sm md:text-base"
          >
            <FaArrowLeft className="mr-2" />
            Back to Market Insights
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Property Market Heat Map</h1>
          <p className="text-sm md:text-base text-gray-600">
            Visualize property prices and demand intensity across major cities in Pakistan
          </p>
        </div>

        {/* Metric Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Show heat map by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('price')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedMetric === 'price'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Average Price
              </button>
              <button
                onClick={() => setSelectedMetric('listings')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedMetric === 'listings'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaHome className="inline mr-2" />
                Total Listings
              </button>
            </div>
          </div>
        </div>

        {/* Heat Map */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
                <p className="text-gray-600">Loading heat map data...</p>
              </div>
            </div>
          ) : (
            <HeatMap data={heatMapData} metric={selectedMetric} />
          )}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Heat Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Color Intensity</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-cyan-200"></div>
                <span className="text-sm text-gray-600">Low {selectedMetric === 'price' ? 'prices' : 'demand'}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-cyan-400"></div>
                <span className="text-sm text-gray-600">Medium {selectedMetric === 'price' ? 'prices' : 'demand'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-cyan-700"></div>
                <span className="text-sm text-gray-600">High {selectedMetric === 'price' ? 'prices' : 'demand'}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">How to Use</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click on markers to see detailed city information</li>
                <li>• Darker colors indicate higher {selectedMetric === 'price' ? 'average prices' : 'listing counts'}</li>
                <li>• Zoom in/out to explore different areas</li>
                <li>• Switch between metrics using the buttons above</li>
              </ul>
            </div>
          </div>
        </div>

        {/* City Data Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">City Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Average Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Listings</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Market Intensity</th>
                </tr>
              </thead>
              <tbody>
                {heatMapData
                  .sort((a, b) => b.intensity - a.intensity)
                  .map((city, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-slate-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{city.city}</td>
                      <td className="py-4 px-4 text-gray-700">{formatPrice(city.avgPrice)}</td>
                      <td className="py-4 px-4 text-gray-700">{city.totalListings}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-cyan-700 h-2 rounded-full"
                              style={{ width: `${city.intensity}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{city.intensity}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

