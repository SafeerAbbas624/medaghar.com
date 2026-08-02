'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaBed, FaBath, FaRuler, FaTimes, FaMapMarkerAlt, FaHome, FaCalendar, FaParking, FaSwimmingPool, FaCheck, FaTimes as FaX } from 'react-icons/fa'

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
  yearBuilt?: number
  parkingSpaces?: number
  pool?: boolean
  garage?: boolean
  possession?: string
  furnishing?: string
  facing?: string
  cornerProperty?: boolean
  features?: string
  images: { url: string }[]
  pkEstimate?: number
  rentEstimate?: number
}

export default function ComparePage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComparisonProperties()
  }, [])

  const loadComparisonProperties = async () => {
    try {
      // Get property IDs from localStorage
      const compareIds = JSON.parse(localStorage.getItem('compareProperties') || '[]')
      
      if (compareIds.length === 0) {
        setLoading(false)
        return
      }

      // Fetch properties
      const fetchedProperties = await Promise.all(
        compareIds.map(async (id: string) => {
          const response = await fetch(`/api/properties/${id}`)
          if (response.ok) {
            return await response.json()
          }
          return null
        })
      )

      setProperties(fetchedProperties.filter(p => p !== null))
    } catch (error) {
      console.error('Error loading comparison properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeProperty = (id: string) => {
    // Remove from localStorage
    const compareIds = JSON.parse(localStorage.getItem('compareProperties') || '[]')
    const updatedIds = compareIds.filter((propId: string) => propId !== id)
    localStorage.setItem('compareProperties', JSON.stringify(updatedIds))
    
    // Update state
    setProperties(prev => prev.filter(p => p.id !== id))
    
    // Dispatch event to update other components
    window.dispatchEvent(new Event('compareUpdated'))
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all properties from comparison?')) {
      localStorage.setItem('compareProperties', JSON.stringify([]))
      setProperties([])
      window.dispatchEvent(new Event('compareUpdated'))
    }
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

  const getAreaDisplay = (property: Property) => {
    if (property.kanal) {
      return `${property.kanal} Kanal`
    } else if (property.marla) {
      return `${property.marla} Marla`
    } else if (property.squareFeet) {
      return `${property.squareFeet.toLocaleString()} sqft`
    }
    return 'N/A'
  }

  const parseFeatures = (features?: string) => {
    if (!features) return []
    try {
      return JSON.parse(features)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-12 text-center">
            <FaHome className="text-4xl md:text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">No properties to compare</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Add properties to comparison from the property listings page
            </p>
            <Link
              href="/properties"
              className="inline-block bg-cyan-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-cyan-800 transition text-sm md:text-base"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Compare Properties</h1>
            <p className="text-sm md:text-base text-gray-600">
              Comparing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          <button
            onClick={clearAll}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FaTimes />
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-4 text-left bg-slate-50 sticky left-0 z-10 min-w-[200px]">
                  <span className="text-gray-700 font-semibold">Property Details</span>
                </th>
                {properties.map((property) => (
                  <th key={property.id} className="p-4 min-w-[300px]">
                    <div className="relative">
                      <button
                        onClick={() => removeProperty(property.id)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                        title="Remove from comparison"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                      <Link href={`/properties/${property.id}`}>
                        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden mb-3">
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={property.images[0].url}
                              alt={property.address}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="text-left">
                        <div className="text-xl font-bold text-cyan-600 mb-1">
                          {formatPrice(property.price, property.listingType)}
                        </div>
                        <div className="text-sm text-gray-700 font-medium mb-1">
                          {property.address}
                        </div>
                        <div className="text-xs text-gray-500">
                          {property.area && `${property.area}, `}{property.city}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Basic Details */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaHome className="text-cyan-600" />
                    Property Type
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.propertyType.replace(/_/g, ' ')}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaBed className="text-cyan-600" />
                    Bedrooms
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center font-medium">
                    {property.bedrooms}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaBath className="text-cyan-600" />
                    Bathrooms
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center font-medium">
                    {property.bathrooms}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaRuler className="text-cyan-600" />
                    Area
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center font-medium">
                    {getAreaDisplay(property)}
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-cyan-600" />
                    Location
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    <div className="text-sm">
                      {property.area && <div className="font-medium">{property.area}</div>}
                      <div className="text-gray-600">{property.city}, {property.province}</div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Year Built */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-cyan-600" />
                    Year Built
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.yearBuilt || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Parking */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaParking className="text-cyan-600" />
                    Parking Spaces
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.parkingSpaces || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Garage */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  Garage
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.garage ? (
                      <FaCheck className="text-cyan-600 mx-auto" />
                    ) : (
                      <FaX className="text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Pool */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  <div className="flex items-center gap-2">
                    <FaSwimmingPool className="text-cyan-600" />
                    Swimming Pool
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.pool ? (
                      <FaCheck className="text-cyan-600 mx-auto" />
                    ) : (
                      <FaX className="text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Possession */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  Possession
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.possession || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Furnishing */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  Furnishing
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.furnishing || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Facing */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  Facing
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.facing || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Corner Property */}
              <tr className="border-b border-gray-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                  Corner Property
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-center">
                    {property.cornerProperty ? (
                      <FaCheck className="text-cyan-600 mx-auto" />
                    ) : (
                      <FaX className="text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>

              {/* PK Estimate */}
              {properties.some(p => p.pkEstimate) && (
                <tr className="border-b border-gray-200 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0">
                    Estimated Value
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-4 text-center font-medium text-cyan-600">
                      {property.pkEstimate ? formatPrice(property.pkEstimate, 'FOR_SALE') : 'N/A'}
                    </td>
                  ))}
                </tr>
              )}

              {/* Features */}
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-semibold text-gray-700 bg-slate-50 sticky left-0 align-top">
                  Features
                </td>
                {properties.map((property) => {
                  const features = parseFeatures(property.features)
                  return (
                    <td key={property.id} className="p-4 align-top">
                      {features.length > 0 ? (
                        <ul className="text-sm text-left space-y-1">
                          {features.slice(0, 8).map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <FaCheck className="text-cyan-600 mt-1 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {features.length > 8 && (
                            <li className="text-gray-500 italic">+{features.length - 8} more</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No features listed</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/properties"
            className="bg-cyan-700 text-white px-6 py-3 rounded-lg hover:bg-cyan-800 transition"
          >
            Browse More Properties
          </Link>
        </div>
      </div>
    </div>
  )
}

