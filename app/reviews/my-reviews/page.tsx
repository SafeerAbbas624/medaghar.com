'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ReviewCard from '@/components/ReviewCard'
import { FaStar, FaPen } from 'react-icons/fa'
import Link from 'next/link'

export default function MyReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/reviews/my-reviews')
    } else if (status === 'authenticated') {
      loadReviews()
    }
  }, [status, router])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reviews?userId=${session?.user?.id}`)
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage all the reviews you've written
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <FaPen className="text-xl md:text-3xl text-cyan-600 hidden md:block" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Avg Rating</p>
                <div className="flex items-center gap-1 md:gap-2">
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{calculateAverageRating()}</p>
                  <FaStar className="text-lg md:text-2xl text-copper-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Helpful</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">
                  {reviews.reduce((acc, review) => acc + review.helpfulCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-12 text-center">
            <FaStar className="text-4xl md:text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Start sharing your experiences by writing your first review
            </p>
            <Link
              href="/properties"
              className="inline-block bg-cyan-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-cyan-800 transition font-medium text-sm md:text-base"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showProperty={!!review.property}
                property={review.property}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

