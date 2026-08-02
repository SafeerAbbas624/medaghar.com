'use client'

import { useState, useEffect } from 'react'
import ReviewCard from '@/components/ReviewCard'
import { FaStar, FaFilter } from 'react-icons/fa'
import Link from 'next/link'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'properties' | 'agents'>('all')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    // Filter by type
    if (filter === 'properties' && !review.propertyId) return false
    if (filter === 'agents' && !review.agentId) return false
    
    // Filter by rating
    if (ratingFilter !== null && review.rating !== ratingFilter) return false
    
    return true
  })

  const calculateStats = () => {
    const totalReviews = reviews.length
    const propertyReviews = reviews.filter(r => r.propertyId).length
    const agentReviews = reviews.filter(r => r.agentId).length
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
    
    return { totalReviews, propertyReviews, agentReviews, avgRating }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Community Reviews</h1>
          <p className="text-sm md:text-base text-gray-600">
            Read authentic reviews from our community members
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
              <FaStar className="text-3xl text-copper-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
                  <FaStar className="text-2xl text-copper-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Property Reviews</p>
              <p className="text-3xl font-bold text-cyan-600">{stats.propertyReviews}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Agent Reviews</p>
              <p className="text-3xl font-bold text-cyan-600">{stats.agentReviews}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'all'
                      ? 'bg-cyan-700 text-white'
                      : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('properties')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'properties'
                      ? 'bg-cyan-700 text-white'
                      : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setFilter('agents')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'agents'
                      ? 'bg-cyan-700 text-white'
                      : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Agents
                </button>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setRatingFilter(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    ratingFilter === null
                      ? 'bg-cyan-700 text-white'
                      : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating)}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 ${
                      ratingFilter === rating
                        ? 'bg-cyan-700 text-white'
                        : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating}
                    <FaStar className="text-sm text-copper-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or browse properties to write a review
            </p>
            <Link
              href="/properties"
              className="inline-block bg-cyan-700 text-white px-6 py-3 rounded-lg hover:bg-cyan-800 transition font-medium"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-gray-600">
              Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
            </div>
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showProperty={!!review.property}
                  property={review.property}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

