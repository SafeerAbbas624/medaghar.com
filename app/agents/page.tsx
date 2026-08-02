'use client'

import { useEffect, useState } from 'react'
import HeroBg from '@/components/HeroBg'
import Image from 'next/image'
import Link from 'next/link'
import { FaStar, FaPhone, FaEnvelope, FaHome, FaSearch, FaFilter } from 'react-icons/fa'

interface Agent {
  id: string
  bio: string
  specialties: string
  yearsExperience: number
  rating: number
  reviewCount: number
  phoneNumber: string
  officeAddress: string
  website: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar: string
  }
  _count: {
    properties: number
  }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    filterAndSortAgents()
  }, [agents, searchQuery, cityFilter, specialtyFilter, minRating, sortBy])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      if (!response.ok) {
        throw new Error('Failed to fetch agents')
      }
      const data = await response.json()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAgents(data)
        setFilteredAgents(data)
      } else {
        console.error('Invalid data format:', data)
        setAgents([])
        setFilteredAgents([])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      setAgents([])
      setFilteredAgents([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortAgents = () => {
    let filtered = [...agents]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        `${agent.user.firstName} ${agent.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // City filter (from office address)
    if (cityFilter) {
      filtered = filtered.filter(agent =>
        agent.officeAddress?.toLowerCase().includes(cityFilter.toLowerCase())
      )
    }

    // Specialty filter
    if (specialtyFilter) {
      filtered = filtered.filter(agent => {
        const specialties = agent.specialties ? JSON.parse(agent.specialties) : []
        return specialties.some((s: string) => s.toLowerCase().includes(specialtyFilter.toLowerCase()))
      })
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(agent => agent.rating >= minRating)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          return b.yearsExperience - a.yearsExperience
        case 'listings':
          return b._count.properties - a._count.properties
        case 'reviews':
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

    setFilteredAgents(filtered)
  }

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan']
  const specialties = ['Residential', 'Commercial', 'Luxury', 'Investment', 'Rental', 'Land']

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-8 md:py-16">
        <HeroBg src="/images/keys-handover.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Find Your Perfect Agent in Pakistan</h1>
          <p className="text-base md:text-xl text-slate-300">
            Connect with experienced real estate professionals across Pakistan
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents by name or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="0">All Ratings</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experience</option>
                <option value="listings">Most Listings</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCityFilter('')
                  setSpecialtyFilter('')
                  setMinRating(0)
                  setSortBy('rating')
                }}
                className="w-full px-4 py-2 bg-slate-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 text-gray-600">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
        </div>

        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No agents found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const specialties = agent.specialties ? JSON.parse(agent.specialties) : []

              return (
                <div key={agent.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  {/* Agent Header */}
                  <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      {agent.user.avatar ? (
                        <Image
                          src={agent.user.avatar}
                          alt={`${agent.user.firstName} ${agent.user.lastName}`}
                          width={80}
                          height={80}
                          className="rounded-full border-4 border-white"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-cyan-600 text-2xl font-bold">
                          {agent.user.firstName[0]}{agent.user.lastName[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold">
                          {agent.user.firstName} {agent.user.lastName}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <FaStar className="text-copper-300" />
                          <span className="font-semibold">{agent.rating.toFixed(1)}</span>
                          <span className="text-slate-300">({agent.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Details */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        {agent.yearsExperience} years experience
                      </div>
                      <p className="text-gray-700 line-clamp-3">{agent.bio}</p>
                    </div>

                    {/* Specialties */}
                    {specialties.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Specialties:</div>
                        <div className="flex flex-wrap gap-2">
                          {specialties.slice(0, 3).map((specialty: string, index: number) => (
                            <span
                              key={index}
                              className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                          {specialties.length > 3 && (
                            <span className="bg-slate-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                              +{specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-2 text-gray-600 mb-4 pb-4 border-b border-gray-200">
                      <FaHome className="text-cyan-600" />
                      <span>{agent._count.properties} active listings</span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaPhone className="text-cyan-600" />
                        {agent.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaEnvelope className="text-cyan-600" />
                        {agent.user.email}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="block w-full bg-cyan-700 text-white text-center py-2 rounded-lg hover:bg-cyan-800 transition font-medium"
                      >
                        View Profile
                      </Link>
                      <a
                        href={`tel:${agent.phoneNumber}`}
                        className="block w-full bg-white border-2 border-cyan-600 text-cyan-600 text-center py-2 rounded-lg hover:bg-cyan-50 transition font-medium"
                      >
                        Call Agent
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

