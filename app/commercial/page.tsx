'use client'

import { useState, useEffect } from 'react'
import HeroBg from '@/components/HeroBg'
import PropertyCard from '@/components/PropertyCard'
import { FaMap, FaList, FaFilter, FaSearch, FaBuilding } from 'react-icons/fa'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 rounded-lg flex items-center justify-center">Loading map...</div>,
})

export default function CommercialPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  // Filters
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [area, setArea] = useState('')
  const [commercialType, setCommercialType] = useState('')
  const [listingType, setListingType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minArea, setMinArea] = useState('')
  const [maxArea, setMaxArea] = useState('')
  const [parkingSpaces, setParkingSpaces] = useState('')
  const [furnishing, setFurnishing] = useState('')

  useEffect(() => {
    loadProperties()
  }, [city, province, area, commercialType, listingType, minPrice, maxPrice, minArea, maxArea, parkingSpaces, furnishing])

  const loadProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Commercial types filter
      const commercialTypes = ['OFFICE', 'SHOP', 'WAREHOUSE', 'FACTORY', 'BUILDING', 'COMMERCIAL_PLOT']
      
      if (commercialType) {
        params.append('propertyType', commercialType)
      }
      
      if (city) params.append('city', city)
      if (province) params.append('province', province)
      if (area) params.append('area', area)
      if (listingType) params.append('listingType', listingType)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)

      const response = await fetch(`/api/properties?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        
        // Filter for commercial types only
        let filteredProperties = data.properties.filter((p: any) => 
          commercialTypes.includes(p.propertyType)
        )
        
        // Apply additional filters
        if (minArea) {
          filteredProperties = filteredProperties.filter((p: any) => {
            const area = p.squareFeet || (p.marla ? p.marla * 272.25 : 0)
            return area >= parseFloat(minArea)
          })
        }
        if (maxArea) {
          filteredProperties = filteredProperties.filter((p: any) => {
            const area = p.squareFeet || (p.marla ? p.marla * 272.25 : 0)
            return area <= parseFloat(maxArea)
          })
        }
        if (parkingSpaces) {
          filteredProperties = filteredProperties.filter((p: any) => 
            p.parkingSpaces >= parseInt(parkingSpaces)
          )
        }
        if (furnishing) {
          filteredProperties = filteredProperties.filter((p: any) => p.furnishing === furnishing)
        }
        
        setProperties(filteredProperties)
      }
    } catch (error) {
      console.error('Error loading commercial properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setCity('')
    setProvince('')
    setArea('')
    setCommercialType('')
    setListingType('')
    setMinPrice('')
    setMaxPrice('')
    setMinArea('')
    setMaxArea('')
    setParkingSpaces('')
    setFurnishing('')
  }

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad Capital Territory', 'Azad Kashmir', 'Gilgit-Baltistan']
  const commercialTypes = [
    { value: 'OFFICE', label: 'Office' },
    { value: 'SHOP', label: 'Shop' },
    { value: 'WAREHOUSE', label: 'Warehouse' },
    { value: 'FACTORY', label: 'Factory' },
    { value: 'BUILDING', label: 'Building' },
    { value: 'COMMERCIAL_PLOT', label: 'Commercial Plot' },
  ]
  const listingTypes = [
    { value: 'FOR_SALE', label: 'For Sale' },
    { value: 'FOR_RENT', label: 'For Rent' },
  ]
  const furnishingOptions = ['Furnished', 'Semi-Furnished', 'Unfurnished']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-8 md:py-16">
        <HeroBg src="/images/cities/city-skyline-1.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Commercial Properties in Pakistan</h1>
          <p className="text-base md:text-xl text-slate-300">
            Find the perfect space for your business - offices, shops, warehouses & more
          </p>
          <div className="mt-4 md:mt-6 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2">
              <span className="text-xl md:text-2xl font-bold">{properties.length}</span>
              <span className="ml-2 text-sm md:text-base">Properties Available</span>
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
                {/* Commercial Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={commercialType}
                    onChange={(e) => setCommercialType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {commercialTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Type
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    {listingTypes.map((type) => (
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
                    placeholder="e.g., Blue Area, Saddar"
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

                {/* Area Size (Sq Ft) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area Size (Sq Ft)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Parking Spaces */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Parking Spaces
                  </label>
                  <input
                    type="number"
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(e.target.value)}
                    placeholder="e.g., 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {furnishingOptions.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${properties.length} Properties Found`}
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
                  <p className="text-gray-600">Loading commercial properties...</p>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              properties.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
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

