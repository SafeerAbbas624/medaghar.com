'use client'

import { useEffect, useState } from 'react'
import HeroBg from '@/components/HeroBg'
import PropertyCard from '@/components/PropertyCard'
import { FaFilter, FaList, FaMap, FaHome, FaUserTie, FaMoneyBillWave, FaHandshake, FaSearch } from 'react-icons/fa'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 rounded-lg flex items-center justify-center">Loading map...</div>,
})

interface Property {
  id: string
  address: string
  city: string
  province: string
  area?: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet?: number
  marla?: number
  kanal?: number
  propertyType: string
  listingType: string
  images: { url: string }[]
  pkEstimate?: number
  rentEstimate?: number
  latitude: number
  longitude: number
}

export default function FSBOPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Filter states
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [area, setArea] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [minMarla, setMinMarla] = useState('')
  const [maxMarla, setMaxMarla] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [listingType, setListingType] = useState('FOR_SALE')

  useEffect(() => {
    loadProperties()
  }, [city, province, area, minPrice, maxPrice, bedrooms, bathrooms, minMarla, maxMarla, propertyType, listingType])

  const loadProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // Always filter for FSBO properties
      params.set('isFSBO', 'true')

      if (city) params.append('city', city)
      if (province) params.append('province', province)
      if (area) params.append('area', area)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (bedrooms) params.append('bedrooms', bedrooms)
      if (bathrooms) params.append('bathrooms', bathrooms)
      if (minMarla) params.append('minMarla', minMarla)
      if (maxMarla) params.append('maxMarla', maxMarla)
      if (propertyType) params.append('propertyType', propertyType)
      if (listingType) params.append('listingType', listingType)

      const response = await fetch(`/api/properties?${params.toString()}`)
      const data = await response.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setCity('')
    setProvince('')
    setArea('')
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('')
    setBathrooms('')
    setMinMarla('')
    setMaxMarla('')
    setPropertyType('')
    setListingType('FOR_SALE')
  }

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad Capital Territory', 'Azad Kashmir', 'Gilgit-Baltistan']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-8 md:py-12">
        <HeroBg src="/images/cities/city-homes-3.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-4">
              For Sale By Owner (FSBO)
            </h1>
            <p className="text-base md:text-xl text-slate-300 mb-4 md:mb-6">
              Buy directly from property owners - No agent commissions!
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-6 md:mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-6 text-center">
              <FaMoneyBillWave className="text-2xl md:text-4xl mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Save Money</h3>
              <p className="text-xs md:text-sm text-slate-300">No agent commission fees</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-6 text-center">
              <FaHandshake className="text-2xl md:text-4xl mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Direct Contact</h3>
              <p className="text-xs md:text-sm text-slate-300">Deal directly with owners</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-6 text-center">
              <FaHome className="text-2xl md:text-4xl mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Better Prices</h3>
              <p className="text-xs md:text-sm text-slate-300">Negotiate directly for best deals</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-6 text-center">
              <FaUserTie className="text-2xl md:text-4xl mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Owner Insights</h3>
              <p className="text-xs md:text-sm text-slate-300">Get firsthand property knowledge</p>
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
                    <option value="FOR_SALE">For Sale</option>
                    <option value="FOR_RENT">For Rent</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="HOUSE">House</option>
                    <option value="FLAT">Flat/Apartment</option>
                    <option value="UPPER_PORTION">Upper Portion</option>
                    <option value="LOWER_PORTION">Lower Portion</option>
                    <option value="FARM_HOUSE">Farm House</option>
                    <option value="RESIDENTIAL_PLOT">Residential Plot</option>
                    <option value="COMMERCIAL_PLOT">Commercial Plot</option>
                    <option value="OFFICE">Office</option>
                    <option value="SHOP">Shop</option>
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

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Area Size (Marla) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area Size (Marla)
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
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${properties.length} FSBO Properties Found`}
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
                  <p className="text-gray-600">Loading FSBO properties...</p>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              properties.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No FSBO properties found</h3>
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

