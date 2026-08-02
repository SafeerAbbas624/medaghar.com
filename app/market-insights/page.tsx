'use client'

import { useState, useEffect } from 'react'
import HeroBg from '@/components/HeroBg'
import { FaChartLine, FaMapMarkedAlt, FaHome, FaArrowUp, FaArrowDown, FaBuilding, FaStore } from 'react-icons/fa'
import Link from 'next/link'

interface MarketData {
  city: string
  avgPrice: number
  priceChange: number
  totalListings: number
  avgPricePerMarla: number
  hotness: 'Hot' | 'Moderate' | 'Cool'
  demandLevel: number
}

interface PriceTrend {
  month: string
  avgPrice: number
  listings: number
}

export default function MarketInsightsPage() {
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedPropertyType, setSelectedPropertyType] = useState('All Types')
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([])
  const [loading, setLoading] = useState(true)

  const cities = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']
  const propertyTypes = ['All Types', 'House', 'Flat', 'Plot', 'Commercial']

  useEffect(() => {
    loadMarketData()
  }, [selectedCity, selectedPropertyType])

  const loadMarketData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/market-insights?city=${selectedCity}&propertyType=${selectedPropertyType}`)
      if (response.ok) {
        const data = await response.json()
        setMarketData(data.marketData || [])
        setPriceTrends(data.priceTrends || [])
      }
    } catch (error) {
      console.error('Error loading market data:', error)
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

  const getHotnessColor = (hotness: string) => {
    switch (hotness) {
      case 'Hot': return 'bg-red-100 text-red-700'
      case 'Moderate': return 'bg-copper-100 text-copper-700'
      case 'Cool': return 'bg-cyan-100 text-cyan-700'
      default: return 'bg-slate-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <HeroBg src="/images/cities/city-skyline-1.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] lg:py-[55px]">
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[8px]">Market Insights</h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">Real-time property market trends and analysis across Pakistan</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading market data...</p>
          </div>
        ) : (
          <>
            {/* Market Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <FaHome className="text-3xl text-cyan-600" />
                  <span className="text-sm text-gray-500">Total Listings</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {marketData.reduce((sum, city) => sum + city.totalListings, 0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">Active properties</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <FaChartLine className="text-3xl text-cyan-600" />
                  <span className="text-sm text-gray-500">Avg Price</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(marketData.reduce((sum, city) => sum + city.avgPrice, 0) / (marketData.length || 1))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Across all cities</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <FaBuilding className="text-3xl text-cyan-700" />
                  <span className="text-sm text-gray-500">Hot Markets</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {marketData.filter(city => city.hotness === 'Hot').length}
                </div>
                <p className="text-sm text-gray-600 mt-2">Cities with high demand</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <FaStore className="text-3xl text-copper-600" />
                  <span className="text-sm text-gray-500">Avg Growth</span>
                </div>
                <div className="text-3xl font-bold text-cyan-600">
                  +{(marketData.reduce((sum, city) => sum + city.priceChange, 0) / (marketData.length || 1)).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Year over year</p>
              </div>
            </div>

            {/* City-wise Market Data */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">City-wise Market Analysis</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price/Marla</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Change</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Listings</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Market</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Demand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((city, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{city.city}</td>
                        <td className="py-4 px-4 text-gray-700">{formatPrice(city.avgPrice)}</td>
                        <td className="py-4 px-4 text-gray-700">{formatPrice(city.avgPricePerMarla)}</td>
                        <td className="py-4 px-4">
                          <span className={`flex items-center gap-1 ${city.priceChange >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>
                            {city.priceChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                            {Math.abs(city.priceChange).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">{city.totalListings}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHotnessColor(city.hotness)}`}>
                            {city.hotness}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-cyan-700 h-2 rounded-full"
                              style={{ width: `${city.demandLevel}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Trends Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Price Trends (Last 12 Months)</h2>
              <div className="h-64 flex items-end justify-between gap-2">
                {priceTrends.map((trend, index) => {
                  const maxPrice = Math.max(...priceTrends.map(t => t.avgPrice))
                  const height = (trend.avgPrice / maxPrice) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-cyan-700 rounded-t hover:bg-cyan-800 transition relative group" style={{ height: `${height}%` }}>
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {formatPrice(trend.avgPrice)}
                          <br />
                          {trend.listings} listings
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                        {trend.month}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Heat Map Link */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-lg shadow-md p-8 text-center text-white">
              <FaMapMarkedAlt className="text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Interactive Heat Map</h2>
              <p className="mb-6 text-slate-300">
                Visualize property prices and demand across Pakistan with our interactive heat map
              </p>
              <Link
                href="/market-insights/heatmap"
                className="inline-block bg-white text-cyan-600 px-8 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition"
              >
                View Heat Map
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

