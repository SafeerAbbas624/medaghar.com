'use client'

import { useState, useEffect } from 'react'
import HeroBg from '@/components/HeroBg'
import PropertyCard from '@/components/PropertyCard'
import { FaMap, FaList, FaFilter, FaSearch } from 'react-icons/fa'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 rounded-lg flex items-center justify-center">Loading map...</div>,
})

export default function PlotsPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  // Filters
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [area, setArea] = useState('')
  const [plotType, setPlotType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minMarla, setMinMarla] = useState('')
  const [maxMarla, setMaxMarla] = useState('')
  const [possession, setPossession] = useState('')
  const [cornerProperty, setCornerProperty] = useState<string>('')
  const [facing, setFacing] = useState('')

  useEffect(() => {
    loadProperties()
  }, [city, province, area, plotType, minPrice, maxPrice, minMarla, maxMarla, possession, cornerProperty, facing])

  const loadProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Plot types filter
      const plotTypes = ['RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT', 'AGRICULTURAL_LAND', 'INDUSTRIAL_LAND', 'PLOT_FILE', 'PLOT_FORM']
      
      if (plotType) {
        params.append('propertyType', plotType)
      }
      
      if (city) params.append('city', city)
      if (province) params.append('province', province)
      if (area) params.append('area', area)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (minMarla) params.append('minMarla', minMarla)
      if (maxMarla) params.append('maxMarla', maxMarla)

      const response = await fetch(`/api/properties?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        
        // Filter for plot types only
        let filteredProperties = data.properties.filter((p: any) => 
          plotTypes.includes(p.propertyType)
        )
        
        // Apply additional filters
        if (possession) {
          filteredProperties = filteredProperties.filter((p: any) => p.possession === possession)
        }
        if (cornerProperty === 'true') {
          filteredProperties = filteredProperties.filter((p: any) => p.cornerProperty === true)
        }
        if (facing) {
          filteredProperties = filteredProperties.filter((p: any) => p.facing === facing)
        }
        
        setProperties(filteredProperties)
      }
    } catch (error) {
      console.error('Error loading plots:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setCity('')
    setProvince('')
    setArea('')
    setPlotType('')
    setMinPrice('')
    setMaxPrice('')
    setMinMarla('')
    setMaxMarla('')
    setPossession('')
    setCornerProperty('')
    setFacing('')
  }

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad Capital Territory', 'Azad Kashmir', 'Gilgit-Baltistan']
  const plotTypes = [
    { value: 'RESIDENTIAL_PLOT', label: 'Residential Plot' },
    { value: 'COMMERCIAL_PLOT', label: 'Commercial Plot' },
    { value: 'AGRICULTURAL_LAND', label: 'Agricultural Land' },
    { value: 'INDUSTRIAL_LAND', label: 'Industrial Land' },
    { value: 'PLOT_FILE', label: 'Plot File' },
    { value: 'PLOT_FORM', label: 'Plot Form' },
  ]
  const possessionOptions = ['Ready', 'Under Construction', 'On Installments', 'Possession Available']
  const facingOptions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-8 md:py-16">
        <HeroBg src="/images/cities/city-homes-1.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Plots & Land for Sale in Pakistan</h1>
          <p className="text-base md:text-xl text-slate-300">
            Find the perfect plot to build your dream home or invest in prime land
          </p>
          <div className="mt-4 md:mt-6 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2">
              <span className="text-xl md:text-2xl font-bold">{properties.length}</span>
              <span className="ml-2 text-sm md:text-base">Plots Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaFilter />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {/* Plot Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Type
                  </label>
                  <select
                    value={plotType}
                    onChange={(e) => setPlotType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {plotTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Provinces</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., DHA, Bahria Town"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (PKR)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Plot Size (Marla) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Size (Marla)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minMarla}
                      onChange={(e) => setMinMarla(e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={maxMarla}
                      onChange={(e) => setMaxMarla(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Possession */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Possession
                  </label>
                  <select
                    value={possession}
                    onChange={(e) => setPossession(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {possessionOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Facing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facing
                  </label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {facingOptions.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Corner Property */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={cornerProperty === 'true'}
                      onChange={(e) => setCornerProperty(e.target.checked ? 'true' : '')}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Corner Plot Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${properties.length} Plots Found`}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewMode === 'list'
                      ? 'bg-cyan-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-slate-100'
                  }`}
                >
                  <FaList className="inline mr-2" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewMode === 'map'
                      ? 'bg-cyan-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-slate-100'
                  }`}
                >
                  <FaMap className="inline mr-2" />
                  Map
                </button>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
                  <p className="text-gray-600">Loading plots...</p>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              properties.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No plots found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                  <button
                    onClick={clearFilters}
                    className="bg-cyan-700 text-white px-6 py-3 rounded-lg hover:bg-cyan-800 transition font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
                <PropertyMap properties={properties} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

