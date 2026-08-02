'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaRocket, FaHome, FaExclamationTriangle, FaCamera, FaTrash } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import PakistaniPhoneInput from '@/components/PakistaniPhoneInput'

interface QuotaInfo {
  currentListings: number
  maxListings: number
  remainingSlots: number
  canCreateListing: boolean
  role: string
  hasUpgradedToAgent: boolean
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage] = useState('')
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [stats, setStats] = useState({
    savedProperties: 0,
    viewedProperties: 0,
    savedSearches: 0,
    reviews: 0,
  })
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    // Agent-specific fields
    bio: '',
    specialties: [] as string[],
    yearsExperience: 0,
    agentPhoneNumber: '',
    officeAddress: '',
    website: '',
  })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [phoneValid, setPhoneValid] = useState(true)
  const [agentPhoneValid, setAgentPhoneValid] = useState(true)
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [agentData, setAgentData] = useState<any>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/profile')
    }
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        phone: session.user.phone || '',
      }))
      fetchStats()
      fetchQuota()
      if (session.user.role === 'AGENT') {
        fetchAgentData()
      }
    }
  }, [status, session, router])

  const fetchAgentData = async () => {
    try {
      const res = await fetch(`/api/agents?userId=${session?.user?.id}`)
      if (res.ok) {
        const agents = await res.json()
        // The API returns an array, get the first (and only) agent for this user
        if (agents && agents.length > 0) {
          const agent = agents[0]
          setAgentData(agent)
          const specialties = agent.specialties ? JSON.parse(agent.specialties) : []
          setFormData(prev => ({
            ...prev,
            bio: agent.bio || '',
            specialties: specialties,
            yearsExperience: agent.yearsExperience || 0,
            agentPhoneNumber: agent.phoneNumber || '',
            officeAddress: agent.officeAddress || '',
            website: agent.website || '',
          }))
        }
      } else {
        console.error('Failed to fetch agent data:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Error fetching agent data:', error)
    }
  }

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/user/listing-quota')
      if (res.ok) {
        const data = await res.json()
        setQuota(data)
      }
    } catch (error) {
      console.error('Error fetching quota:', error)
    }
  }

  const handleUpgradeToAgent = async () => {
    if (!confirm('Are you sure you want to upgrade to Agent? This action cannot be undone.')) {
      return
    }

    setUpgrading(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/upgrade-role', {
        method: 'PUT',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upgrade')
      }

      setMessage('Successfully upgraded to Agent! Please sign out and sign back in for changes to take effect.')
      // Refresh quota
      await fetchQuota()
      // Update session
      await update()
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setUpgrading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [propertiesRes, reviewsRes] = await Promise.all([
        fetch('/api/saved-properties'),
        fetch(`/api/reviews?userId=${session?.user?.id}`),
      ])

      const propertiesData = await propertiesRes.json()
      const reviewsData = await reviewsRes.json()

      setStats({
        savedProperties: propertiesData.savedProperties?.length || 0,
        viewedProperties: 0, // TODO: Implement view history
        savedSearches: 0,
        reviews: reviewsData.reviews?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const addSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }))
      setSpecialtyInput('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setMessage('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be under 5MB')
      return
    }

    setAvatarUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      setMessage('Profile picture updated successfully!')
      await update() // Refresh session
    } catch (error: any) {
      setMessage(error.message || 'Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return

    setAvatarUploading(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/avatar', { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove avatar')
      }

      setMessage('Profile picture removed successfully!')
      await update()
    } catch (error: any) {
      setMessage(error.message || 'Failed to remove avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Prepare data for submission
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        // For agents, use agentPhoneNumber as the main phone
        phone: session?.user?.role === 'AGENT' ? formData.agentPhoneNumber : formData.phone,
        ...(session?.user?.role === 'AGENT' && {
          agentData: {
            bio: formData.bio,
            specialties: JSON.stringify(formData.specialties),
            yearsExperience: parseInt(formData.yearsExperience.toString()),
            phoneNumber: formData.agentPhoneNumber,
            officeAddress: formData.officeAddress,
            website: formData.website,
          }
        })
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Update session
      await update()
      setMessage('Profile updated successfully!')
      setIsEditing(false)

      // Refresh agent data if agent
      if (session?.user?.role === 'AGENT') {
        await fetchAgentData()
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition w-full sm:w-auto"
              >
                <FaEdit />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-6 text-center sm:text-left">
            <div className="relative group">
              {session.user.avatar ? (
                <Image
                  src={session.user.avatar}
                  alt={session.user.name || 'User'}
                  width={100}
                  height={100}
                  className="rounded-full w-20 h-20 md:w-24 md:h-24 object-cover"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 bg-cyan-700 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-semibold flex-shrink-0">
                  {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                </div>
              )}

              {/* Avatar Upload Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer p-2 text-white hover:text-copper-400 transition"
                  title="Upload new photo"
                >
                  {avatarUploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaCamera className="text-xl" />
                  )}
                </label>
                {session.user.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="p-2 text-white hover:text-red-300 transition"
                    title="Remove photo"
                    disabled={avatarUploading}
                  >
                    <FaTrash className="text-lg" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {session.user.firstName} {session.user.lastName}
              </h2>
              <p className="text-gray-600 text-sm md:text-base break-all">{session.user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-cyan-100 text-cyan-700 text-sm font-medium rounded-full">
                {session.user.role}
              </span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('success')
                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={session.user.email || ''}
                    disabled
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-slate-100 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Phone - Only show for non-agents */}
              {session.user.role !== 'AGENT' && (
                <PakistaniPhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  onValidChange={setPhoneValid}
                  disabled={!isEditing}
                  label="Phone Number"
                  showCarrier={true}
                />
              )}

              {/* Agent-specific fields */}
              {session.user.role === 'AGENT' && (
                <>
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h3>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About / Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={5}
                      placeholder="Tell potential clients about yourself, your experience, and what makes you a great agent..."
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      disabled={!isEditing}
                      min="0"
                      max="50"
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Agent Phone Number */}
                  <PakistaniPhoneInput
                    value={formData.agentPhoneNumber}
                    onChange={(value) => setFormData(prev => ({ ...prev, agentPhoneNumber: value }))}
                    onValidChange={setAgentPhoneValid}
                    disabled={!isEditing}
                    label="Agent Phone Number"
                    showCarrier={true}
                  />

                  {/* Office Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Office Address
                    </label>
                    <input
                      type="text"
                      name="officeAddress"
                      value={formData.officeAddress}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., 123 Main Street, Lahore"
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeSpecialty(specialty)}
                              className="text-cyan-600 hover:text-cyan-700"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={specialtyInput}
                          onChange={(e) => setSpecialtyInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                          placeholder="e.g., Residential, Commercial, Luxury Homes"
                          className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addSpecialty}
                          className="px-4 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    const specialties = agentData?.specialties ? JSON.parse(agentData.specialties) : []
                    setFormData({
                      firstName: session.user.firstName || '',
                      lastName: session.user.lastName || '',
                      phone: session.user.phone || '',
                      bio: agentData?.bio || '',
                      specialties: specialties,
                      yearsExperience: agentData?.yearsExperience || 0,
                      agentPhoneNumber: agentData?.phoneNumber || '',
                      officeAddress: agentData?.officeAddress || '',
                      website: agentData?.website || '',
                    })
                    setMessage('')
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Listing Quota */}
        {quota && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaHome className="text-cyan-600" />
              Listing Quota
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quota.currentListings} / {quota.maxListings}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Remaining Slots</p>
                <p className="text-2xl font-bold text-cyan-600">{quota.remainingSlots}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-cyan-700 h-3 rounded-full transition-all"
                style={{ width: `${(quota.currentListings / quota.maxListings) * 100}%` }}
              />
            </div>
            {quota.canCreateListing && (
              <Link
                href="/sell"
                className="mt-4 inline-block bg-cyan-700 text-white px-6 py-2 rounded-lg hover:bg-cyan-800 transition"
              >
                Create New Listing
              </Link>
            )}
          </div>
        )}

        {/* Upgrade to Agent */}
        {quota && session.user.role === 'BUYER' && !quota.hasUpgradedToAgent && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-lg shadow-md p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <FaRocket />
                  Upgrade to Agent
                </h2>
                <p className="text-slate-300 mb-4">
                  Get 10 property listings instead of 2 and access professional features.
                </p>
                <ul className="text-sm text-slate-300 mb-4 space-y-1">
                  <li>✓ Up to 10 active property listings</li>
                  <li>✓ Properties listed in main buy section</li>
                  <li>✓ Professional agent badge</li>
                </ul>
              </div>
              <div className="text-center">
                <button
                  onClick={handleUpgradeToAgent}
                  disabled={upgrading}
                  className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition disabled:opacity-50"
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade Now'}
                </button>
                <p className="text-xs text-slate-400 mt-2">One-time upgrade</p>
              </div>
            </div>
          </div>
        )}

        {/* Already Upgraded Notice */}
        {quota && quota.hasUpgradedToAgent && session.user.role !== 'AGENT' && (
          <div className="bg-copper-50 border border-copper-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-copper-800">
              <FaExclamationTriangle />
              <p>You have already used your one-time upgrade. Please sign out and sign back in if your role hasn't updated.</p>
            </div>
          </div>
        )}

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/saved" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Properties</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.savedProperties}</p>
          </Link>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Viewed Properties</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.viewedProperties}</p>
          </div>
          <Link href="/searches" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Searches</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.savedSearches}</p>
          </Link>
          <Link href="/reviews/my-reviews" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Reviews</h3>
            <p className="text-3xl font-bold text-cyan-600">{stats.reviews}</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

