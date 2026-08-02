'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaBed, FaBath, FaRuler, FaHeart, FaRegHeart, FaExchangeAlt } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { buildPropertyUrl } from '@/lib/propertyUrl'

interface PropertyCardProps {
  property: {
    id: string
    slug?: string | null
    address: string
    city: string
    province: string
    area?: string | null
    subArea?: string | null
    price: number
    bedrooms: number
    bathrooms: number
    squareFeet?: number | null
    marla?: number | null
    kanal?: number | null
    propertyType: string
    listingType: string
    images: { url: string }[]
    pkEstimate?: number | null
    rentEstimate?: number | null
    isFeatured?: boolean | null
    isVerified?: boolean | null
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInCompare, setIsInCompare] = useState(false)

  useEffect(() => {
    if (session?.user) {
      checkIfSaved()
    }
    checkIfInCompare()

    // Listen for compare updates
    const handleCompareUpdate = () => {
      checkIfInCompare()
    }
    window.addEventListener('compareUpdated', handleCompareUpdate)
    return () => window.removeEventListener('compareUpdated', handleCompareUpdate)
  }, [session, property.id])

  const checkIfInCompare = () => {
    const compareIds = JSON.parse(localStorage.getItem('compareProperties') || '[]')
    setIsInCompare(compareIds.includes(property.id))
  }

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/saved-properties/check?propertyId=${property.id}`)
      const data = await response.json()
      setIsSaved(data.isSaved)
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const formatPrice = (price: number) => {
    if (property.listingType === 'FOR_RENT') {
      return `PKR ${price.toLocaleString()}/month`
    }
    // Format in Crores and Lakhs
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Crore`
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(2)} Lakh`
    }
    return `PKR ${price.toLocaleString()}`
  }

  const getAreaDisplay = () => {
    if (property.kanal) {
      return `${property.kanal} Kanal`
    } else if (property.marla) {
      return `${property.marla} Marla`
    } else if (property.squareFeet) {
      return `${property.squareFeet.toLocaleString()} sqft`
    }
    return null
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (!session?.user) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-properties?propertyId=${property.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setIsSaved(false)
        } else {
          alert('Failed to remove property from saved list')
        }
      } else {
        // Save
        const response = await fetch('/api/saved-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId: property.id }),
        })

        if (response.ok) {
          setIsSaved(true)
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to save property')
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()

    const compareIds = JSON.parse(localStorage.getItem('compareProperties') || '[]')

    if (isInCompare) {
      // Remove from compare
      const updatedIds = compareIds.filter((id: string) => id !== property.id)
      localStorage.setItem('compareProperties', JSON.stringify(updatedIds))
      setIsInCompare(false)
    } else {
      // Add to compare (max 4 properties)
      if (compareIds.length >= 4) {
        alert('You can compare up to 4 properties at a time')
        return
      }
      compareIds.push(property.id)
      localStorage.setItem('compareProperties', JSON.stringify(compareIds))
      setIsInCompare(true)
    }

    // Dispatch event to update other components
    window.dispatchEvent(new Event('compareUpdated'))
  }

  // Hierarchical canonical URL: /{residential|commercial}/{city}/{area}/{subarea?}/{slug}
  const propertyUrl = buildPropertyUrl(property)

  return (
    <Link href={propertyUrl} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="relative h-64 bg-gray-200">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0].url}
              alt={property.address}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-cyan-700/40">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mb-1">
                <path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8z" />
              </svg>
              <span className="text-xs font-medium text-gray-400">Photos coming soon</span>
            </div>
          )}
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition disabled:opacity-50"
            title={isSaved ? 'Remove from saved' : 'Save property'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            ) : isSaved ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-700 text-xl" />
            )}
          </button>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            className={`absolute top-3 right-14 p-2 rounded-full shadow-md transition ${
              isInCompare
                ? 'bg-cyan-700 text-white hover:bg-cyan-800'
                : 'bg-white text-gray-700 hover:bg-slate-100'
            }`}
            title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            <FaExchangeAlt className="text-xl" />
          </button>

          {/* Listing Type Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <div className="bg-cyan-700 text-white px-3 py-1 rounded-full text-sm font-medium">
              {property.listingType === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
            </div>
            {property.isFeatured && (
              <div className="bg-copper-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                ★ Featured
              </div>
            )}
            {property.isVerified && (
              <div className="bg-white text-slate-900 border border-cyan-600 px-3 py-1 rounded-full text-xs font-semibold shadow">
                ✓ Verified
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatPrice(property.price)}
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 text-gray-600 mb-3">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <FaBed />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <FaBath />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {getAreaDisplay() && (
              <div className="flex items-center gap-1">
                <FaRuler />
                <span>{getAreaDisplay()}</span>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="text-gray-700 mb-2">
            {property.address}
          </div>
          <div className="text-gray-500 text-sm">
            {property.area && `${property.area}, `}{property.city}, {property.province}
          </div>

          {/* PK Estimate */}
          {property.pkEstimate && property.listingType === 'FOR_SALE' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Est. Value: <span className="font-semibold">{formatPrice(property.pkEstimate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

