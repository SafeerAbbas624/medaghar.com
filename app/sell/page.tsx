'use client'

import { useState, useEffect, useRef } from 'react'
import HeroBg from '@/components/HeroBg'
import LocationSelect from '@/components/LocationSelect'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaHome, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined,
  FaParking, FaSwimmingPool, FaCheckCircle, FaExclamationTriangle,
  FaUpload, FaTimes, FaSpinner, FaVideo, FaCloudUploadAlt, FaImage
} from 'react-icons/fa'
import LocationPicker from '@/components/LocationPicker'

interface QuotaInfo {
  currentListings: number
  maxListings: number
  remainingSlots: number
  canCreateListing: boolean
  role: string
}

interface PropertyForm {
  title: string
  address: string
  city: string
  province: string
  area: string
  subArea: string
  // Canonical taxonomy slugs, set by LocationSelect. Null when the seller used
  // the manual escape hatch; the server resolves those on submit.
  citySlug: string | null
  areaSlug: string | null
  subAreaSlug: string | null
  zipCode: string
  latitude: number
  longitude: number
  price: string
  bedrooms: string
  bathrooms: string
  marla: string
  kanal: string
  squareFeet: string
  squareYards: string
  yearBuilt: string
  propertyType: string
  listingType: string
  description: string
  features: string[]
  possession: string
  furnishing: string
  facing: string
  parkingSpaces: string
  garage: boolean
  pool: boolean
  cornerProperty: boolean
  images: { url: string; caption: string }[]
  videoUrl: string
  virtualTourUrl: string
}

const PROPERTY_TYPES = [
  'HOUSE', 'FLAT', 'UPPER_PORTION', 'LOWER_PORTION', 'FARM_HOUSE',
  'ROOM', 'PENTHOUSE', 'BASEMENT', 'RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT',
  'OFFICE', 'SHOP', 'WAREHOUSE', 'BUILDING', 'OTHER'
]

const LISTING_TYPES = ['FOR_SALE', 'FOR_RENT']


const POSSESSION_OPTIONS = ['Ready', 'Under Construction', 'Planned']

const FURNISHING_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished']

const FACING_OPTIONS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']

// City coordinates for updating map when city changes
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Lahore': { lat: 31.5204, lng: 74.3587 },
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Islamabad': { lat: 33.6844, lng: 73.0479 },
  'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
  'Faisalabad': { lat: 31.4504, lng: 73.1350 },
  'Multan': { lat: 30.1575, lng: 71.5249 },
  'Peshawar': { lat: 34.0151, lng: 71.5249 },
  'Quetta': { lat: 30.1798, lng: 66.9750 },
  'Sialkot': { lat: 32.4945, lng: 74.5229 },
  'Gujranwala': { lat: 32.1617, lng: 74.1883 },
}

export default function SellPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    address: '',
    city: '',
    province: '',
    area: '',
    subArea: '',
    citySlug: null,
    areaSlug: null,
    subAreaSlug: null,
    zipCode: '',
    latitude: 31.5204, // Default to Lahore
    longitude: 74.3587,
    price: '',
    bedrooms: '',
    bathrooms: '',
    marla: '',
    kanal: '',
    squareFeet: '',
    squareYards: '',
    yearBuilt: '',
    propertyType: 'HOUSE',
    listingType: 'FOR_SALE',
    description: '',
    features: [],
    possession: 'Ready',
    furnishing: 'Unfurnished',
    facing: '',
    parkingSpaces: '',
    garage: false,
    pool: false,
    cornerProperty: false,
    images: [],
    videoUrl: '',
    virtualTourUrl: '',
  })

  // State for features input
  const [featureInput, setFeatureInput] = useState('')

  // File upload states
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingVirtualTour, setUploadingVirtualTour] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const virtualTourInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/sell')
    }
  }, [status, router])

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const res = await fetch('/api/user/listing-quota')
        if (res.ok) {
          const data = await res.json()
          setQuota(data)
        }
      } catch (err) {
        console.error('Error fetching quota:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchQuota()
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value }

        // Update coordinates when city changes
        if (name === 'city' && CITY_COORDINATES[value]) {
          updated.latitude = CITY_COORDINATES[value].lat
          updated.longitude = CITY_COORDINATES[value].lng
        }

        return updated
      })

      // Auto-calculate property sizes
      if (name === 'marla' || name === 'kanal' || name === 'squareFeet' || name === 'squareYards') {
        handleSizeCalculation(name, value)
      }
    }
  }

  // Auto-calculate property sizes based on Pakistan conversion formulas
  const handleSizeCalculation = (changedField: string, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      // Clear other fields if invalid input
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          marla: '',
          kanal: '',
          squareFeet: '',
          squareYards: ''
        }))
      }
      return
    }

    let marla = 0, kanal = 0, squareFeet = 0, squareYards = 0

    // Conversion formulas for Pakistan:
    // 1 Kanal = 20 Marla
    // 1 Marla = 272.25 Square Feet
    // 1 Marla = 30.25 Square Yards
    // 1 Square Yard = 9 Square Feet

    switch (changedField) {
      case 'marla':
        marla = numValue
        kanal = marla / 20
        squareFeet = marla * 272.25
        squareYards = marla * 30.25
        break
      case 'kanal':
        kanal = numValue
        marla = kanal * 20
        squareFeet = marla * 272.25
        squareYards = marla * 30.25
        break
      case 'squareFeet':
        squareFeet = numValue
        marla = squareFeet / 272.25
        kanal = marla / 20
        squareYards = squareFeet / 9
        break
      case 'squareYards':
        squareYards = numValue
        squareFeet = squareYards * 9
        marla = squareFeet / 272.25
        kanal = marla / 20
        break
    }

    setFormData(prev => ({
      ...prev,
      marla: changedField === 'marla' ? value : marla.toFixed(2),
      kanal: changedField === 'kanal' ? value : kanal.toFixed(2),
      squareFeet: changedField === 'squareFeet' ? value : squareFeet.toFixed(2),
      squareYards: changedField === 'squareYards' ? value : squareYards.toFixed(2)
    }))
  }

  // Handle features tag input
  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmedFeature = featureInput.trim()
      if (trimmedFeature && !formData.features.includes(trimmedFeature)) {
        setFormData(prev => ({
          ...prev,
          features: [...prev.features, trimmedFeature]
        }))
        setFeatureInput('')
      }
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', caption: '' }]
    }))
  }

  const updateImage = (index: number, field: 'url' | 'caption', value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, [field]: value } : img
      )
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Handle file upload for images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check max images limit
    if (formData.images.length + files.length > 7) {
      setError('Maximum 7 images allowed')
      return
    }

    setUploadingImages(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      Array.from(files).forEach(file => {
        uploadFormData.append('images', file)
      })

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload images')
      }

      // Add uploaded URLs to form
      const newImages = data.urls.map((url: string) => ({ url, caption: '' }))
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('video', file)

      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload video')
      }

      setFormData(prev => ({ ...prev, videoUrl: data.url }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
    }
  }

  // Handle virtual tour upload
  const handleVirtualTourUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVirtualTour(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('video', file)

      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload virtual tour')
      }

      setFormData(prev => ({ ...prev, virtualTourUrl: data.url }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingVirtualTour(false)
      if (virtualTourInputRef.current) {
        virtualTourInputRef.current.value = ''
      }
    }
  }

  // Check for duplicate listings
  const checkDuplicate = async () => {
    if (!formData.address || !formData.city) return

    setCheckingDuplicate(true)
    setDuplicateWarning(null)

    try {
      const res = await fetch('/api/properties/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
          area: formData.area,
        }),
      })

      const data = await res.json()

      if (data.isDuplicate) {
        setDuplicateWarning(
          `Warning: ${data.message}. Property: "${data.existingProperty.title}" at ${data.existingProperty.address}`
        )
      }
    } catch (err) {
      console.error('Duplicate check error:', err)
    } finally {
      setCheckingDuplicate(false)
    }
  }

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return !!(formData.title && formData.address && formData.city && formData.province)
      case 2:
        return !!(formData.propertyType && formData.bedrooms && formData.bathrooms)
      case 3:
        return !!(formData.price && formData.listingType)
      case 4:
        return !!(formData.description)
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that we're on step 5 before submitting
    if (step !== 5) {
      setError('Please complete all steps before submitting')
      return
    }

    // Validate at least 1 image
    if (formData.images.length < 1) {
      setError('Please upload at least 1 image')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.join(', '), // Convert array back to comma-separated string for API
          images: formData.images.filter(img => img.url.trim() !== ''),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create listing')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(data.isFSBO ? '/owner' : '/residential-for-sale')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-cyan-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <FaCheckCircle className="text-6xl text-cyan-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Listed Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your property has been submitted and is now live. Redirecting...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-8 md:py-12">
        <HeroBg src="/images/keys-handover.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">List Your Property</h1>
          <p className="text-base md:text-xl text-slate-300">
            {quota?.role === 'AGENT' ? 'Create a professional listing' : 'Sell your home directly to buyers (FSBO)'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quota Info Card */}
        {quota && (
          <div className={`mb-6 p-4 rounded-lg ${quota.canCreateListing ? 'bg-cyan-50 border border-cyan-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                {quota.canCreateListing ? (
                  <FaCheckCircle className="text-cyan-500 text-xl flex-shrink-0 mt-1 sm:mt-0" />
                ) : (
                  <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0 mt-1 sm:mt-0" />
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm md:text-base">
                    Listing Quota: {quota.currentListings} / {quota.maxListings}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    {quota.canCreateListing
                      ? `You can create ${quota.remainingSlots} more listing${quota.remainingSlots > 1 ? 's' : ''}`
                      : 'Mark a property as SOLD to free up a slot'}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  quota.role === 'AGENT' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-gray-700'
                }`}>
                  {quota.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quota Exceeded Warning */}
        {quota && !quota.canCreateListing && (
          <div className="bg-red-100 border border-red-300 p-6 rounded-lg mb-6 text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Listing Limit Reached</h3>
            <p className="text-red-700 mb-4">
              You have reached your maximum of {quota.maxListings} active listings.
              {quota.role !== 'AGENT' && ' Consider upgrading to Agent for 10 listings.'}
            </p>
            {quota.role !== 'AGENT' && (
              <Link
                href="/profile"
                className="inline-block bg-cyan-700 text-white px-6 py-2 rounded-lg hover:bg-cyan-800 transition"
              >
                Upgrade to Agent
              </Link>
            )}
          </div>
        )}

        {/* Step Progress */}
        {quota?.canCreateListing && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 mx-0.5 md:mx-1 rounded-full ${s <= step ? 'bg-cyan-700' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs md:text-sm text-gray-600">
              <span>Location</span>
              <span>Details</span>
              <span>Pricing</span>
              <span>Desc</span>
              <span>Photos</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Property Form */}
        {quota?.canCreateListing && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
            {/* Step 1: Location Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-cyan-600" />
                  Location Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                  <div className="mb-2 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <p className="text-sm text-cyan-700">
                      <strong>💡 Tip:</strong> Use a descriptive title with location details for better visibility in search results.
                      <br />
                      <span className="text-xs text-cyan-700">Example: "3 Bedroom House for Sale in DHA Phase 5 Lahore"</span>
                    </p>
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Beautiful 3 Bedroom House in DHA Phase 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={checkDuplicate}
                    placeholder="e.g., House #123, Street 5, Block A"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                  {checkingDuplicate && (
                    <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                      <FaSpinner className="animate-spin" /> Checking for duplicates...
                    </p>
                  )}
                  {duplicateWarning && (
                    <div className="mt-2 p-3 bg-copper-50 border border-copper-200 rounded-lg text-copper-800 text-sm flex items-start gap-2">
                      <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                      <span>{duplicateWarning}</span>
                    </div>
                  )}
                </div>

                <LocationSelect
                  required
                  value={{
                    city: formData.city,
                    province: formData.province,
                    area: formData.area,
                    subArea: formData.subArea,
                    citySlug: formData.citySlug,
                    areaSlug: formData.areaSlug,
                    subAreaSlug: formData.subAreaSlug,
                  }}
                  onChange={(loc) => setFormData((prev) => ({ ...prev, ...loc }))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="e.g., 54000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location Picker Map */}
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng) => {
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
                  }}
                  city={formData.city}
                />
              </div>
            )}

            {/* Step 2: Property Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaHome className="text-cyan-600" />
                  Property Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
                    <div className="relative">
                      <FaBed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
                    <div className="relative">
                      <FaBath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marla</label>
                    <div className="relative">
                      <FaRulerCombined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="marla"
                        value={formData.marla}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kanal</label>
                    <input
                      type="number"
                      name="kanal"
                      value={formData.kanal}
                      onChange={handleChange}
                      min="0"
                      step="0.25"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 italic">
                    💡 Enter any one size field - others will auto-calculate
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                    <input
                      type="number"
                      name="squareFeet"
                      value={formData.squareFeet}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Square Yards</label>
                    <input
                      type="number"
                      name="squareYards"
                      value={formData.squareYards}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={formData.yearBuilt}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spaces</label>
                    <div className="relative">
                      <FaParking className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="parkingSpaces"
                        value={formData.parkingSpaces}
                        onChange={handleChange}
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Possession</label>
                    <select
                      name="possession"
                      value={formData.possession}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                      {POSSESSION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                    <select
                      name="furnishing"
                      value={formData.furnishing}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                      {FURNISHING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                    <select
                      name="facing"
                      value={formData.facing}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select</option>
                      {FACING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="garage"
                      checked={formData.garage}
                      onChange={handleChange}
                      className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
                    />
                    <span>Garage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="pool"
                      checked={formData.pool}
                      onChange={handleChange}
                      className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
                    />
                    <FaSwimmingPool className="text-cyan-500" />
                    <span>Swimming Pool</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="cornerProperty"
                      checked={formData.cornerProperty}
                      onChange={handleChange}
                      className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
                    />
                    <span>Corner Property</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Pricing Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    {LISTING_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (PKR) * {formData.listingType === 'FOR_RENT' && '/ month'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs.</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 15000000"
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  {formData.price && (
                    <p className="mt-2 text-sm text-gray-500">
                      ≈ Rs. {parseFloat(formData.price).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-cyan-700">
                    <strong>Tip:</strong> Properties priced competitively based on market rates typically sell 20% faster.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Description */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Property Description</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe your property in detail. Include key features, nearby amenities, and what makes it special..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">{formData.description.length} characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <p className="text-xs text-gray-500 mb-2">Type a feature and press Enter to add it</p>

                  {/* Feature Tags Display */}
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 border border-gray-200 rounded-lg">
                      {formData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-1 text-cyan-600 hover:text-cyan-700 focus:outline-none"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Feature Input */}
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    placeholder="e.g., Modern kitchen, Marble flooring, CCTV..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Photos & Video */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaUpload className="text-cyan-600" />
                  Property Photos & Video
                </h2>

                <p className="text-gray-600">
                  Upload 1-7 high-quality images. Images will be automatically compressed and optimized.
                </p>

                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadingImages ? (
                      <div className="flex flex-col items-center gap-2">
                        <FaSpinner className="animate-spin text-4xl text-cyan-600" />
                        <span className="text-gray-600">Uploading images...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FaCloudUploadAlt className="text-4xl text-gray-400" />
                        <span className="text-gray-600">Click to upload images or drag and drop</span>
                        <span className="text-sm text-gray-400">JPEG, PNG, WebP, GIF (max 10MB each)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Image Count */}
                <div className="flex items-center justify-between text-sm">
                  <span className={formData.images.length < 1 ? 'text-red-500' : 'text-gray-600'}>
                    {formData.images.length}/7 images uploaded
                  </span>
                  {formData.images.length < 1 && (
                    <span className="text-red-500">At least 1 image required</span>
                  )}
                </div>

                {/* Uploaded Images Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.filter(img => img.url.trim() !== '').map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-slate-100">
                          <Image
                            src={img.url}
                            alt={img.caption || `Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => updateImage(index, 'caption', e.target.value)}
                          placeholder="Caption"
                          className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Or add URL manually */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Or add image URL manually:</p>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    disabled={formData.images.length >= 7}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-cyan-500 hover:text-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaImage /> Add Image URL
                  </button>
                </div>

                {/* Video Upload */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaVideo className="text-cyan-600" />
                    Property Video (Optional)
                  </h3>

                  {formData.videoUrl ? (
                    <div className="relative">
                      <video
                        src={formData.videoUrl}
                        controls
                        className="w-full max-h-64 rounded-lg bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 transition">
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        {uploadingVideo ? (
                          <div className="flex flex-col items-center gap-2">
                            <FaSpinner className="animate-spin text-4xl text-cyan-600" />
                            <span className="text-gray-600">Uploading video...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <FaVideo className="text-4xl text-gray-400" />
                            <span className="text-gray-600">Click to upload a property video</span>
                            <span className="text-sm text-gray-400">MP4, WebM, MOV (max 100MB)</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Virtual Tour Upload */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaVideo className="text-cyan-600" />
                    Virtual Tour (Optional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload a 360° virtual tour or walkthrough video to give buyers an immersive experience
                  </p>

                  {formData.virtualTourUrl ? (
                    <div className="relative">
                      <video
                        src={formData.virtualTourUrl}
                        controls
                        className="w-full max-h-64 rounded-lg bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, virtualTourUrl: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 transition">
                      <input
                        ref={virtualTourInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVirtualTourUpload}
                        className="hidden"
                        id="virtual-tour-upload"
                      />
                      <label htmlFor="virtual-tour-upload" className="cursor-pointer">
                        {uploadingVirtualTour ? (
                          <div className="flex flex-col items-center gap-2">
                            <FaSpinner className="animate-spin text-4xl text-cyan-600" />
                            <span className="text-gray-600">Uploading virtual tour...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <FaVideo className="text-4xl text-gray-400" />
                            <span className="text-gray-600">Click to upload a virtual tour</span>
                            <span className="text-sm text-gray-400">MP4, WebM, MOV (max 100MB)</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-gray-700 bg-slate-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => validateStep(step) && setStep(step + 1)}
                  disabled={!validateStep(step)}
                  className="px-6 py-3 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'List Property'
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

