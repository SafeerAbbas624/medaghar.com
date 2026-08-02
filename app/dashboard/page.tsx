'use client'

import { useSession } from 'next-auth/react'
import HeroBg from '@/components/HeroBg'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaHome, FaHeart, FaEnvelope, FaStar, FaEye,
  FaChartLine, FaUsers, FaCalendarAlt, FaBell, FaArrowRight,
  FaEdit, FaCheckCircle, FaTimesCircle, FaSpinner
} from 'react-icons/fa'

interface DashboardStats {
  savedProperties: number
  messages: number
  reviews: number
  listings?: number
  leads?: number
  tourRequests?: number
}

interface QuotaInfo {
  sell: {
    currentListings: number
    maxListings: number
    remainingSlots: number
    canCreateListing: boolean
  }
  rent: {
    currentListings: number
    maxListings: number
    remainingSlots: number
    canCreateListing: boolean
  }
  role: string
  // Legacy fields for backward compatibility
  currentListings?: number
  maxListings?: number
  remainingSlots?: number
  canCreateListing?: boolean
}

interface RecentActivity {
  id: string
  type: 'property_viewed' | 'property_saved' | 'message_received' | 'review_posted'
  description: string
  timestamp: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    savedProperties: 0,
    messages: 0,
    reviews: 0,
    listings: 0,
    leads: 0,
    tourRequests: 0,
  })
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [recentProperties, setRecentProperties] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [listingsStats, setListingsStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/dashboard')
    }
    if (session?.user) {
      fetchDashboardData()
    }
  }, [status, session, router])

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, messagesRes, reviewsRes, quotaRes, myListingsRes] = await Promise.all([
        fetch('/api/saved-properties'),
        fetch('/api/messages/inbox'),
        fetch(`/api/reviews?userId=${session?.user?.id}`),
        fetch('/api/user/listing-quota'),
        fetch('/api/user/properties?limit=6'),
      ])

      const propertiesData = await propertiesRes.json()
      const messagesData = await messagesRes.json()
      const reviewsData = await reviewsRes.json()

      if (quotaRes.ok) {
        const quotaData = await quotaRes.json()
        setQuota(quotaData)
      }

      if (myListingsRes.ok) {
        const listingsData = await myListingsRes.json()
        setMyListings(listingsData.properties || [])
        setListingsStats(listingsData.statistics || null)
      }

      setStats({
        savedProperties: propertiesData.savedProperties?.length || 0,
        messages: messagesData.messages?.filter((m: any) => !m.isRead).length || 0,
        reviews: reviewsData.reviews?.length || 0,
        listings: 0,
        leads: 0,
        tourRequests: 0,
      })

      // Get recent saved properties
      setRecentProperties(propertiesData.savedProperties?.slice(0, 4) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    setUpdatingStatus(propertyId)
    try {
      const res = await fetch(`/api/properties/${propertyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        // Refresh listings
        const listingsRes = await fetch('/api/user/properties?limit=6')
        if (listingsRes.ok) {
          const data = await listingsRes.json()
          setMyListings(data.properties || [])
          setListingsStats(data.statistics || null)
        }
        // Refresh quota
        const quotaRes = await fetch('/api/user/listing-quota')
        if (quotaRes.ok) {
          const quotaData = await quotaRes.json()
          setQuota(quotaData)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAgent = session.user.isAgent || session.user.role === 'AGENT'

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-slate-900 rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 text-white">
          <HeroBg src="/images/cities/city-skyline-2.jpg" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
                Welcome back, {session.user.firstName}!
              </h1>
              <p className="text-slate-300 text-sm md:text-base">
                {isAgent
                  ? "Manage your listings and connect with clients"
                  : "Track your property search and saved homes"}
              </p>
            </div>
            <div className="hidden md:block">
              {session.user.avatar ? (
                <Image
                  src={session.user.avatar}
                  alt={session.user.name || 'User'}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white/30"
                />
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Link href="/saved" className="bg-white rounded-xl shadow-md p-3 md:p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Saved Properties</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.savedProperties}</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaHeart className="text-sm md:text-xl text-red-500" />
              </div>
            </div>
          </Link>

          <Link href="/messages" className="bg-white rounded-xl shadow-md p-3 md:p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Unread Messages</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.messages}</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <FaEnvelope className="text-sm md:text-xl text-cyan-500" />
              </div>
            </div>
          </Link>

          <Link href="/reviews/my-reviews" className="bg-white rounded-xl shadow-md p-3 md:p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">My Reviews</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.reviews}</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-copper-100 rounded-full flex items-center justify-center">
                <FaStar className="text-sm md:text-xl text-copper-500" />
              </div>
            </div>
          </Link>
        </div>

        {/* Listing Quota Card */}
        {quota && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">My Listing Quotas</h3>
                <p className="text-sm text-gray-500">
                  Manage your property listings
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                quota.role === 'AGENT' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-gray-700'
              }`}>
                {quota.role}
              </span>
            </div>

            {/* Sell Listings Quota */}
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">For Sale Listings</h4>
                  <p className="text-sm text-gray-500">
                    {quota.sell.currentListings} active of {quota.sell.maxListings} allowed
                  </p>
                </div>
                {quota.sell.canCreateListing && (
                  <Link
                    href="/sell"
                    className="bg-cyan-700 text-white px-4 py-2 rounded-lg hover:bg-cyan-800 transition text-sm font-medium"
                  >
                    Post for Sale
                  </Link>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    quota.sell.remainingSlots === 0 ? 'bg-red-500' : 'bg-cyan-700'
                  }`}
                  style={{ width: `${(quota.sell.currentListings / quota.sell.maxListings) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {quota.sell.remainingSlots > 0
                  ? `${quota.sell.remainingSlots} slot${quota.sell.remainingSlots > 1 ? 's' : ''} available`
                  : 'No slots available - mark a property as SOLD to free up space'}
              </p>
            </div>

            {/* Rent Listings Quota */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">For Rent Listings</h4>
                  <p className="text-sm text-gray-500">
                    {quota.rent.currentListings} active of {quota.rent.maxListings} allowed
                  </p>
                </div>
                {quota.rent.canCreateListing && (
                  <Link
                    href="/post-rent"
                    className="bg-cyan-700 text-white px-4 py-2 rounded-lg hover:bg-cyan-800 transition text-sm font-medium"
                  >
                    Post for Rent
                  </Link>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    quota.rent.remainingSlots === 0 ? 'bg-red-500' : 'bg-cyan-700'
                  }`}
                  style={{ width: `${(quota.rent.currentListings / quota.rent.maxListings) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {quota.rent.remainingSlots > 0
                  ? `${quota.rent.remainingSlots} slot${quota.rent.remainingSlots > 1 ? 's' : ''} available`
                  : 'No slots available - mark a property as INACTIVE to free up space'}
              </p>
            </div>
          </div>
        )}

        {/* My Listings Section */}
        {myListings.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
                {listingsStats && (
                  <p className="text-sm text-gray-500">
                    {listingsStats.active} active • {listingsStats.pending} pending • {listingsStats.sold} sold
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link href="/sell" className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm font-medium">
                  Add Sale <FaArrowRight />
                </Link>
                <Link href="/post-rent" className="text-cyan-700 hover:text-cyan-700 flex items-center gap-1 text-sm font-medium">
                  Add Rent <FaArrowRight />
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((property: any) => {
                const propertyUrl = property.slug ? `/properties/${property.slug}` : `/properties/${property.id}`
                return (
                <div key={property.id} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                  <Link href={propertyUrl}>
                    <div className="relative h-32">
                      <Image
                        src={property.images?.[0]?.url || '/placeholder-property.jpg'}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          property.status === 'ACTIVE' ? 'bg-cyan-700 text-white' :
                          property.status === 'PENDING' ? 'bg-copper-500 text-white' :
                          property.status === 'SOLD' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {property.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          property.listingType === 'FOR_RENT' ? 'bg-cyan-700 text-white' : 'bg-slate-700 text-white'
                        }`}>
                          {property.listingType === 'FOR_RENT' ? 'RENT' : 'SALE'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 truncate">{property.title}</p>
                      <p className="text-cyan-600 font-bold">
                        Rs. {property.price?.toLocaleString()}
                        {property.listingType === 'FOR_RENT' && <span className="text-sm text-gray-500">/mo</span>}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{property.city}</p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 flex gap-2">
                    <Link
                      href={`/properties/${property.id}/edit`}
                      className="flex-1 text-center py-1 text-sm border border-gray-300 rounded hover:bg-slate-50 flex items-center justify-center gap-1"
                    >
                      <FaEdit className="text-xs" /> Edit
                    </Link>
                    {property.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange(property.id, property.listingType === 'FOR_RENT' ? 'INACTIVE' : 'SOLD')}
                        disabled={updatingStatus === property.id}
                        className="flex-1 text-center py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {updatingStatus === property.id ? (
                          <FaSpinner className="animate-spin text-xs" />
                        ) : (
                          <FaCheckCircle className="text-xs" />
                        )}
                        {property.listingType === 'FOR_RENT' ? 'Deactivate' : 'Mark Sold'}
                      </button>
                    )}
                    {(property.status === 'SOLD' || property.status === 'INACTIVE') && (
                      <button
                        onClick={() => handleStatusChange(property.id, 'ACTIVE')}
                        disabled={updatingStatus === property.id}
                        className="flex-1 text-center py-1 text-sm border border-cyan-600 text-cyan-600 rounded hover:bg-cyan-50 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {updatingStatus === property.id ? (
                          <FaSpinner className="animate-spin text-xs" />
                        ) : (
                          <FaTimesCircle className="text-xs" />
                        )}
                        Relist
                      </button>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Saved Properties */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recently Saved Properties</h2>
                <Link href="/saved" className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm font-medium">
                  View All <FaArrowRight />
                </Link>
              </div>

              {recentProperties.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {recentProperties.map((saved: any) => (
                    <Link
                      key={saved.id}
                      href={`/properties/${saved.property?.id}`}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition"
                    >
                      <div className="relative h-32">
                        <Image
                          src={saved.property?.images?.[0]?.url || '/placeholder-property.jpg'}
                          alt={saved.property?.title || 'Property'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 truncate">{saved.property?.title}</p>
                        <p className="text-cyan-600 font-bold">
                          Rs. {saved.property?.price?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {saved.property?.city}, {saved.property?.state}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaHeart className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>No saved properties yet</p>
                  <Link href="/buy" className="text-cyan-600 hover:underline mt-2 inline-block">
                    Browse Properties
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/buy"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <FaHome className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Browse Properties</p>
                    <p className="text-xs text-gray-500">Find your dream home</p>
                  </div>
                </Link>

                <Link
                  href="/agents"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <FaUsers className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Find Agents</p>
                    <p className="text-xs text-gray-500">Connect with professionals</p>
                  </div>
                </Link>

                <Link
                  href="/tools/mortgage-calculator"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <FaChartLine className="text-cyan-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mortgage Calculator</p>
                    <p className="text-xs text-gray-500">Estimate your payments</p>
                  </div>
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center gap-3 p-3 rounded-lg bg-copper-50 hover:bg-copper-100 transition border border-copper-200"
                >
                  <div className="w-10 h-10 bg-copper-100 rounded-full flex items-center justify-center">
                    <span className="text-copper-600 font-bold">★</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Feature Your Listing</p>
                    <p className="text-xs text-gray-500">Get up to 5× more views</p>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="w-10 h-10 bg-copper-100 rounded-full flex items-center justify-center">
                    <FaCalendarAlt className="text-copper-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Profile</p>
                    <p className="text-xs text-gray-500">Manage your account</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-gray-900">{session.user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900 truncate ml-2">{session.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{session.user.phone || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

