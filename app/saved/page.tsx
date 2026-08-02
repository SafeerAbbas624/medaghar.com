'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaBed, FaBath, FaRuler, FaTrash, FaHeart, FaMapMarkerAlt } from 'react-icons/fa'

interface SavedProperty {
  id: string
  notes: string | null
  createdAt: string
  property: {
    id: string
    address: string
    city: string
    province: string
    area: string | null
    price: number
    bedrooms: number
    bathrooms: number
    squareFeet: number | null
    marla: number | null
    kanal: number | null
    propertyType: string
    listingType: string
    images: { url: string }[]
    pkEstimate: number | null
  }
}

export default function SavedPropertiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/saved')
    } else if (status === 'authenticated') {
      fetchSavedProperties()
    }
  }, [status, router])

  const fetchSavedProperties = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/saved-properties')
      const data = await response.json()
      setSavedProperties(data.savedProperties || [])
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (propertyId: string) => {
    if (!confirm('Are you sure you want to remove this property from your saved list?')) {
      return
    }

    setDeletingId(propertyId)
    try {
      const response = await fetch(`/api/saved-properties?propertyId=${propertyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedProperties(prev => prev.filter(sp => sp.property.id !== propertyId))
      } else {
        alert('Failed to remove property')
      }
    } catch (error) {
      console.error('Error removing property:', error)
      alert('An error occurred')
    } finally {
      setDeletingId(null)
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

  const getAreaDisplay = (property: SavedProperty['property']) => {
    if (property.kanal && property.kanal > 0) {
      return `${property.kanal} Kanal`
    }
    if (property.marla && property.marla > 0) {
      return `${property.marla} Marla`
    }
    if (property.squareFeet && property.squareFeet > 0) {
      return `${property.squareFeet.toLocaleString()} sqft`
    }
    return null
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved properties...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <FaHeart className="text-2xl md:text-3xl text-cyan-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Saved Properties</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">
            You have {savedProperties.length} saved {savedProperties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Empty State */}
        {savedProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-12 text-center">
            <FaHeart className="text-4xl md:text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">No saved properties yet</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Start saving properties you're interested in to view them here
            </p>
            <Link
              href="/properties"
              className="inline-block bg-cyan-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-cyan-800 transition text-sm md:text-base"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          /* Properties Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {savedProperties.map((savedProperty) => (
              <div key={savedProperty.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image */}
                <Link href={`/properties/${savedProperty.property.id}`}>
                  <div className="relative h-64 bg-gray-200">
                    {savedProperty.property.images && savedProperty.property.images.length > 0 ? (
                      <Image
                        src={savedProperty.property.images[0].url}
                        alt={savedProperty.property.address}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    
                    {/* Listing Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-cyan-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {savedProperty.property.listingType === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemove(savedProperty.property.id)
                      }}
                      disabled={deletingId === savedProperty.property.id}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition disabled:opacity-50"
                      title="Remove from saved"
                    >
                      {deletingId === savedProperty.property.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaTrash className="text-red-600" />
                      )}
                    </button>
                  </div>
                </Link>

                {/* Content */}
                <Link href={`/properties/${savedProperty.property.id}`}>
                  <div className="p-4">
                    {/* Price */}
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {formatPrice(savedProperty.property.price, savedProperty.property.listingType)}
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      {savedProperty.property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <FaBed />
                          <span>{savedProperty.property.bedrooms}</span>
                        </div>
                      )}
                      {savedProperty.property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <FaBath />
                          <span>{savedProperty.property.bathrooms}</span>
                        </div>
                      )}
                      {getAreaDisplay(savedProperty.property) && (
                        <div className="flex items-center gap-1">
                          <FaRuler />
                          <span>{getAreaDisplay(savedProperty.property)}</span>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 text-gray-700 mb-2">
                      <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-cyan-600" />
                      <div>
                        <div>{savedProperty.property.address}</div>
                        <div className="text-gray-500 text-sm">
                          {savedProperty.property.area && `${savedProperty.property.area}, `}
                          {savedProperty.property.city}, {savedProperty.property.province}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {savedProperty.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 italic">
                          Note: {savedProperty.notes}
                        </p>
                      </div>
                    )}

                    {/* Saved Date */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Saved on {new Date(savedProperty.createdAt).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

