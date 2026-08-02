'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense, Fragment } from 'react'
import HeroBg from '@/components/HeroBg'
import { useSearchParams, useRouter } from 'next/navigation'
import PropertyCard from '@/components/PropertyCard'
import AdSlot from '@/components/AdSlot'
import { FaFilter, FaList, FaMap, FaSave, FaSearch, FaPlus } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import nextDynamic from 'next/dynamic'

const PropertyMap = nextDynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 rounded-lg flex items-center justify-center">Loading map...</div>,
})

interface Property {
  id: string
  address: string
  city: string
  province: string
  area?: string
  zipCode?: string
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
  latitude: number
  longitude: number
}

function PropertiesPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [alertFrequency, setAlertFrequency] = useState('never')
  const [savingSearch, setSavingSearch] = useState(false)

  // Filter states
  const [city, setCity] = useState(searchParams.get('city') || searchParams.get('q') || '')
  const [province, setProvince] = useState(searchParams.get('province') || '')
  const [area, setArea] = useState(searchParams.get('area') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [minMarla, setMinMarla] = useState('')
  const [maxMarla, setMaxMarla] = useState('')
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '')
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'FOR_SALE')
  const [isFSBO, setIsFSBO] = useState(searchParams.get('isFSBO') || '')
  const [availableCities, setAvailableCities] = useState<string[]>([])

  useEffect(() => {
    loadCities()
    // Automatic location detection removed - users can manually select city filter
  }, [])

  useEffect(() => {
    loadProperties()
  }, [city, province, area, minPrice, maxPrice, bedrooms, bathrooms, minMarla, maxMarla, propertyType, listingType, isFSBO])

  const loadCities = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      setAvailableCities(data.cities || [])
    } catch (error) {
      console.error('Error fetching cities:', error)
      // Fallback to default cities if API fails
      setAvailableCities(['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'])
    }
  }

  const handleCityChange = (newCity: string) => {
    setCity(newCity)
  }

  const loadProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

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
      if (isFSBO) params.append('isFSBO', isFSBO)

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
    setIsFSBO('')
  }

  const handleSaveSearch = async () => {
    if (!session?.user) {
      router.push('/signin?callbackUrl=/properties')
      return
    }

    if (!searchName.trim()) {
      alert('Please enter a name for this search')
      return
    }

    setSavingSearch(true)
    try {
      const filters = { city, province, area, minPrice, maxPrice, bedrooms, bathrooms, minMarla, maxMarla, propertyType, listingType, isFSBO }
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: searchName,
          criteria: filters,
          frequency: alertFrequency,
        }),
      })

      if (response.ok) {
        alert('Search saved successfully!')
        setShowSaveSearch(false)
        setSearchName('')
        setAlertFrequency('never')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save search')
      }
    } catch (error) {
      console.error('Error saving search:', error)
      alert('An error occurred')
    } finally {
      setSavingSearch(false)
    }
  }

  const hasActiveFilters = () => {
    return city || province || area || minPrice || maxPrice || bedrooms || bathrooms || minMarla || maxMarla || propertyType || isFSBO
  }

  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad Capital Territory', 'Azad Kashmir', 'Gilgit-Baltistan']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-8 md:py-16">
        <HeroBg src="/images/hero-home.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
            {listingType === 'FOR_SALE'
              ? `Properties for Sale in ${city || 'Pakistan'}`
              : `Properties for Rent in ${city || 'Pakistan'}`}
          </h1>
          <p className="text-base md:text-xl text-slate-300">
            Find your dream home from thousands of verified listings {city ? `in ${city}` : 'across Pakistan'}
          </p>
          <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-3 md:gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2">
              <span className="text-xl md:text-2xl font-bold">{properties.length}</span>
              <span className="ml-2 text-sm md:text-base">Properties Available</span>
            </div>

            {/* Post for Rent Button - Only show when viewing rental listings */}
            {listingType === 'FOR_RENT' && (
              <button
                onClick={() => {
                  if (!session?.user) {
                    router.push('/signin?callbackUrl=/post-rent')
                  } else {
                    router.push('/post-rent')
                  }
                }}
                className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-cyan-50 transition font-medium"
              >
                <FaPlus />
                <span className="hidden sm:inline">Post for Rent</span>
              </button>
            )}

            {/* Save Search Button */}
            {hasActiveFilters() && (
              <button
                onClick={() => setShowSaveSearch(!showSaveSearch)}
                className="flex items-center gap-2 bg-cyan-700 text-white px-4 py-2 rounded-lg hover:bg-cyan-800 transition"
              >
                <FaSave />
                <span className="hidden sm:inline">Save Search</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveSearch && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save This Search</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name *
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="e.g., DHA Lahore Houses"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Alert Frequency
                </label>
                <select
                  value={alertFrequency}
                  onChange={(e) => setAlertFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="never">No Alerts</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Get notified when new properties match your search criteria
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveSearch}
                  disabled={savingSearch}
                  className="bg-cyan-700 text-white px-6 py-2 rounded-lg hover:bg-cyan-800 transition disabled:opacity-50"
                >
                  {savingSearch ? 'Saving...' : 'Save Search'}
                </button>
                <button
                  onClick={() => setShowSaveSearch(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <optgroup label="Residential">
                      <option value="HOUSE">House</option>
                      <option value="FLAT">Flat/Apartment</option>
                      <option value="UPPER_PORTION">Upper Portion</option>
                      <option value="LOWER_PORTION">Lower Portion</option>
                      <option value="FARM_HOUSE">Farm House</option>
                      <option value="PENTHOUSE">Penthouse</option>
                    </optgroup>
                    <optgroup label="Plots">
                      <option value="RESIDENTIAL_PLOT">Residential Plot</option>
                      <option value="COMMERCIAL_PLOT">Commercial Plot</option>
                    </optgroup>
                    <optgroup label="Commercial">
                      <option value="OFFICE">Office</option>
                      <option value="SHOP">Shop</option>
                      <option value="WAREHOUSE">Warehouse</option>
                    </optgroup>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {availableCities.map((c) => (
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

                {/* FSBO / Rent by Owner Only */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isFSBO === 'true'}
                      onChange={(e) => setIsFSBO(e.target.checked ? 'true' : '')}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {listingType === 'FOR_RENT' ? 'Rent by Owner Only' : 'For Sale By Owner Only'}
                    </span>
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
                  <p className="text-gray-600">Loading properties...</p>
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
                  {properties.map((property, index) => (
                    <Fragment key={property.id}>
                      <PropertyCard property={property} />
                      {index === 5 && (
                        <div className="md:col-span-2">
                          <AdSlot />
                        </div>
                      )}
                    </Fragment>
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

export default function PropertiesPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700"></div></div>}>
      <PropertiesPage />
    </Suspense>
  )
}
