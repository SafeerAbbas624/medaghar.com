'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaImage, FaArrowLeft, FaSpinner, FaSave, FaVideo, FaCloudUploadAlt, FaTrash } from 'react-icons/fa'
import LocationPicker from '@/components/LocationPicker'

interface PropertyForm {
  title: string
  address: string
  city: string
  province: string
  area: string
  zipCode: string
  latitude: number
  longitude: number
  price: string
  bedrooms: string
  bathrooms: string
  marla: string
  kanal: string
  squareFeet: string
  yearBuilt: string
  propertyType: string
  listingType: string
  description: string
  features: string
  possession: string
  furnishing: string
  facing: string
  parkingSpaces: string
  garage: boolean
  pool: boolean
  cornerProperty: boolean
  images: { url: string; caption: string }[]
  videoUrl: string
}

const PROPERTY_TYPES = [
  'HOUSE', 'FLAT', 'UPPER_PORTION', 'LOWER_PORTION', 'FARM_HOUSE',
  'ROOM', 'PENTHOUSE', 'BASEMENT', 'RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT',
  'OFFICE', 'SHOP', 'WAREHOUSE', 'BUILDING', 'OTHER'
]

const LISTING_TYPES = ['FOR_SALE', 'FOR_RENT']

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

export default function EditPropertyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [formData, setFormData] = useState<PropertyForm>({
    title: '', address: '', city: '', province: '', area: '', zipCode: '',
    latitude: 31.5204, longitude: 74.3587, // Default to Lahore
    price: '', bedrooms: '', bathrooms: '', marla: '', kanal: '', squareFeet: '',
    yearBuilt: '', propertyType: 'HOUSE', listingType: 'FOR_SALE', description: '',
    features: '', possession: 'Ready', furnishing: 'Unfurnished', facing: '',
    parkingSpaces: '', garage: false, pool: false, cornerProperty: false, images: [], videoUrl: '',
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (propertyId) {
      fetchProperty()
    }
  }, [status, propertyId])

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`)
      if (!res.ok) throw new Error('Failed to fetch property')
      const data = await res.json()
      
      // Check ownership
      if (data.ownerId !== session?.user?.id && data.agentId !== session?.user?.id) {
        setError('You do not have permission to edit this property')
        return
      }

      setFormData({
        title: data.title || '',
        address: data.address || '',
        city: data.city || '',
        province: data.province || '',
        area: data.area || '',
        zipCode: data.zipCode || '',
        latitude: data.latitude || 31.5204,
        longitude: data.longitude || 74.3587,
        price: data.price?.toString() || '',
        bedrooms: data.bedrooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        marla: data.marla?.toString() || '',
        kanal: data.kanal?.toString() || '',
        squareFeet: data.squareFeet?.toString() || '',
        yearBuilt: data.yearBuilt?.toString() || '',
        propertyType: data.propertyType || 'HOUSE',
        listingType: data.listingType || 'FOR_SALE',
        description: data.description || '',
        features: data.features || '',
        possession: data.possession || 'Ready',
        furnishing: data.furnishing || 'Unfurnished',
        facing: data.facing || '',
        parkingSpaces: data.parkingSpaces?.toString() || '',
        garage: data.garage || false,
        pool: data.pool || false,
        cornerProperty: data.cornerProperty || false,
        images: data.images?.map((img: { url: string; caption: string }) => ({ url: img.url, caption: img.caption || '' })) || [],
        videoUrl: data.videoUrl || '',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (formData.images.length + files.length > 7) { setError('Maximum 7 images allowed'); return }
    setUploadingImages(true); setError('')
    try {
      const uploadFormData = new FormData()
      Array.from(files).forEach(file => uploadFormData.append('images', file))
      const res = await fetch('/api/upload/image', { method: 'POST', body: uploadFormData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload images')
      const newImages = data.urls.map((url: string) => ({ url, caption: '' }))
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
    } catch (err: any) { setError(err.message) }
    finally { setUploadingImages(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVideo(true); setError('')
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('video', file)
      const res = await fetch('/api/upload/video', { method: 'POST', body: uploadFormData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload video')
      setFormData(prev => ({ ...prev, videoUrl: data.url }))
    } catch (err: any) { setError(err.message) }
    finally { setUploadingVideo(false); if (videoInputRef.current) videoInputRef.current.value = '' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, images: formData.images.filter(img => img.url.trim() !== '') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update property')
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-cyan-600" />
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
            <p className="text-xl font-semibold mb-4">{error}</p>
            <Link href="/dashboard" className="text-cyan-600 hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6">
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Property</h1>

        {success && (
          <div className="bg-cyan-50 text-cyan-600 p-4 rounded-lg mb-6">
            Property updated successfully! Redirecting...
          </div>
        )}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {['Location', 'Details', 'Features', 'Media'].map((label, i) => (
            <button key={label} onClick={() => setStep(i + 1)} className={`flex-1 text-center py-2 border-b-2 ${step === i + 1 ? 'border-cyan-600 text-cyan-600' : 'border-gray-200 text-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaMapMarkerAlt className="text-cyan-600" />Location</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                  <select name="province" value={formData.province} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required>
                    <option value="">Select Province</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="KPK">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad">Islamabad Capital Territory</option>
                    <option value="AJK">Azad Jammu & Kashmir</option>
                    <option value="GB">Gilgit-Baltistan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area/Sector</label>
                  <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" />
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

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaHome className="text-cyan-600" />Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
                  <select name="listingType" value={formData.listingType} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required>
                    {LISTING_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
                <div className="relative">
                  <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label><input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label><input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="0" step="0.5" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Parking Spaces</label><input type="number" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleChange} min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Marla</label><input type="number" name="marla" value={formData.marla} onChange={handleChange} min="0" step="0.1" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kanal</label><input type="number" name="kanal" value={formData.kanal} onChange={handleChange} min="0" step="0.1" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sq Feet</label><input type="number" name="squareFeet" value={formData.squareFeet} onChange={handleChange} min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label><input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} min="1900" max={new Date().getFullYear()} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" required /></div>
            </div>
          )}

          {/* Step 3: Features */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Features & Amenities</h2>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Possession</label><select name="possession" value={formData.possession} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"><option value="Ready">Ready</option><option value="Under Construction">Under Construction</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label><select name="furnishing" value={formData.furnishing} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"><option value="Unfurnished">Unfurnished</option><option value="Semi-Furnished">Semi-Furnished</option><option value="Furnished">Furnished</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Facing</label><input type="text" name="facing" value={formData.facing} onChange={handleChange} placeholder="e.g., North" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" /></div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2"><input type="checkbox" name="garage" checked={formData.garage} onChange={handleChange} className="h-5 w-5 text-cyan-600" />Garage</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="pool" checked={formData.pool} onChange={handleChange} className="h-5 w-5 text-cyan-600" />Pool</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="cornerProperty" checked={formData.cornerProperty} onChange={handleChange} className="h-5 w-5 text-cyan-600" />Corner</label>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label><textarea name="features" value={formData.features} onChange={handleChange} rows={3} placeholder="e.g., Central AC, Lawn, Servant Quarters" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500" /></div>
            </div>
          )}

          {/* Step 4: Media */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaImage className="text-cyan-600" />Media</h2>

              {/* Current Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <Image src={img.url} alt={`Image ${idx + 1}`} width={200} height={150} className="w-full h-32 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"><FaTrash /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 transition">
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {uploadingImages ? <FaSpinner className="animate-spin text-4xl text-cyan-600 mx-auto" /> : <><FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-2" /><span className="text-gray-600">Click to upload images (max 7)</span></>}
                </label>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video (optional)</label>
                {formData.videoUrl ? (
                  <div className="flex items-center gap-4">
                    <span className="text-cyan-600">✓ Video uploaded</span>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))} className="text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 transition">
                    <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} className="hidden" id="video-upload" />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      {uploadingVideo ? <FaSpinner className="animate-spin text-4xl text-cyan-600 mx-auto" /> : <><FaVideo className="text-4xl text-gray-400 mx-auto mb-2" /><span className="text-gray-600">Click to upload video (max 100MB)</span></>}
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 border rounded-lg hover:bg-slate-50">Previous</button>}
            <div className="ml-auto">
              {step < 4 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-3 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800">Next</button>
              ) : (
                <button type="submit" disabled={submitting} className="px-8 py-3 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 disabled:opacity-50 flex items-center gap-2">
                  {submitting ? <><FaSpinner className="animate-spin" />Saving...</> : <><FaSave />Save Changes</>}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

