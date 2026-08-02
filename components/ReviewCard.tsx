'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaStar, FaThumbsUp, FaCheckCircle, FaThumbsDown } from 'react-icons/fa'

interface Review {
  id: string
  rating: number
  title?: string
  comment: string
  pros?: string
  cons?: string
  wouldRecommend: boolean
  verified: boolean
  helpfulCount: number
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface ReviewCardProps {
  review: Review
  showProperty?: boolean
  property?: {
    id: string
    title: string
    address: string
    city: string
  }
}

export default function ReviewCard({ review, showProperty, property }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount)
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) return

    try {
      const response = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: 'POST',
      })

      if (response.ok) {
        setHelpfulCount(helpfulCount + 1)
        setHasMarkedHelpful(true)
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    }
  }

  const parsePros = () => {
    try {
      return review.pros ? JSON.parse(review.pros) : []
    } catch {
      return []
    }
  }

  const parseCons = () => {
    try {
      return review.cons ? JSON.parse(review.cons) : []
    } catch {
      return []
    }
  }

  const pros = parsePros()
  const cons = parseCons()

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {review.user.avatar ? (
            <Image
              src={review.user.avatar}
              alt={`${review.user.firstName} ${review.user.lastName}`}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-semibold">
              {review.user.firstName[0]}{review.user.lastName[0]}
            </div>
          )}
        </div>

        {/* User Info and Rating */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-gray-900">
                {review.user.firstName} {review.user.lastName}
                {review.verified && (
                  <FaCheckCircle className="inline ml-2 text-cyan-600 text-sm" title="Verified Transaction" />
                )}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-sm ${
                      star <= review.rating ? 'text-copper-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Property Info (if showing) */}
      {showProperty && property && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-gray-600">Reviewed:</p>
          <p className="font-medium text-gray-900">{property.title}</p>
          <p className="text-sm text-gray-600">{property.address}, {property.city}</p>
        </div>
      )}

      {/* Review Title */}
      {review.title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {review.title}
        </h4>
      )}

      {/* Review Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {review.comment}
      </p>

      {/* Pros and Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Pros */}
          {pros.length > 0 && (
            <div className="bg-cyan-50 rounded-lg p-4">
              <h5 className="font-semibold text-cyan-700 mb-2 flex items-center">
                <FaThumbsUp className="mr-2" />
                Pros
              </h5>
              <ul className="space-y-1">
                {pros.map((pro: string, index: number) => (
                  <li key={index} className="text-sm text-cyan-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {cons.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-semibold text-red-800 mb-2 flex items-center">
                <FaThumbsDown className="mr-2" />
                Cons
              </h5>
              <ul className="space-y-1">
                {cons.map((con: string, index: number) => (
                  <li key={index} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Would Recommend */}
      {review.wouldRecommend && (
        <div className="mb-4 flex items-center text-cyan-600">
          <FaCheckCircle className="mr-2" />
          <span className="text-sm font-medium">Would recommend</span>
        </div>
      )}

      {/* Footer - Helpful Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            hasMarkedHelpful
              ? 'bg-cyan-100 text-cyan-700 cursor-not-allowed'
              : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaThumbsUp className={hasMarkedHelpful ? 'text-cyan-600' : ''} />
          <span className="text-sm font-medium">
            {hasMarkedHelpful ? 'Marked as helpful' : 'Helpful'}
          </span>
          {helpfulCount > 0 && (
            <span className="text-sm">({helpfulCount})</span>
          )}
        </button>
      </div>
    </div>
  )
}

