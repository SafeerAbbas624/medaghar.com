'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaStar, FaThumbsUp, FaThumbsDown, FaCheckCircle } from 'react-icons/fa'
import Link from 'next/link'

function WriteReviewForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const propertyId = searchParams.get('property')
  const agentId = searchParams.get('agent')
  
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [pros, setPros] = useState<string[]>([''])
  const [cons, setCons] = useState<string[]>([''])
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [propertyInfo, setPropertyInfo] = useState<any>(null)
  const [agentInfo, setAgentInfo] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/signin?callbackUrl=/reviews/write?property=${propertyId || ''}&agent=${agentId || ''}`)
    }
  }, [status, router, propertyId, agentId])

  useEffect(() => {
    if (propertyId) {
      loadPropertyInfo()
    }
    if (agentId) {
      loadAgentInfo()
    }
  }, [propertyId, agentId])

  const loadPropertyInfo = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setPropertyInfo(data.property)
      }
    } catch (error) {
      console.error('Error loading property:', error)
    }
  }

  const loadAgentInfo = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setAgentInfo(data.agent)
      }
    } catch (error) {
      console.error('Error loading agent:', error)
    }
  }

  const addPro = () => {
    setPros([...pros, ''])
  }

  const addCon = () => {
    setCons([...cons, ''])
  }

  const updatePro = (index: number, value: string) => {
    const newPros = [...pros]
    newPros[index] = value
    setPros(newPros)
  }

  const updateCon = (index: number, value: string) => {
    const newCons = [...cons]
    newCons[index] = value
    setCons(newCons)
  }

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index))
  }

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: propertyId || null,
          agentId: agentId || null,
          rating,
          title,
          comment,
          pros: JSON.stringify(pros.filter(p => p.trim())),
          cons: JSON.stringify(cons.filter(c => c.trim())),
          wouldRecommend,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to the property or agent page
        if (propertyId) {
          router.push(`/properties/${propertyId}`)
        } else if (agentId) {
          router.push(`/agents/${agentId}`)
        } else {
          router.push('/profile')
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit review')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
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
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
          <p className="text-sm md:text-base text-gray-600">Share your experience to help others make informed decisions</p>
        </div>

        {/* Review Subject */}
        {(propertyInfo || agentInfo) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviewing:</h2>
            {propertyInfo && (
              <div>
                <p className="font-medium text-gray-900">{propertyInfo.title}</p>
                <p className="text-sm text-gray-600">{propertyInfo.address}, {propertyInfo.city}</p>
              </div>
            )}
            {agentInfo && (
              <div>
                <p className="font-medium text-gray-900">
                  {agentInfo.user.firstName} {agentInfo.user.lastName}
                </p>
                <p className="text-sm text-gray-600">{agentInfo.specialty} - {agentInfo.city}</p>
              </div>
            )}
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`text-3xl transition ${
                      star <= (hoverRating || rating)
                        ? 'text-copper-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-gray-600">
                {rating} {rating === 1 ? 'star' : 'stars'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience..."
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              maxLength={2000}
            />
            <p className="text-sm text-gray-500 mt-1">{comment.length}/2000 characters</p>
          </div>

          {/* Pros */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaThumbsUp className="inline mr-2 text-cyan-600" />
              What did you like?
            </label>
            {pros.map((pro, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => updatePro(index, e.target.value)}
                  placeholder="e.g., Great location, Modern amenities"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {pros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePro(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPro}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              + Add another pro
            </button>
          </div>

          {/* Cons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaThumbsDown className="inline mr-2 text-red-600" />
              What could be improved?
            </label>
            {cons.map((con, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={con}
                  onChange={(e) => updateCon(index, e.target.value)}
                  placeholder="e.g., Needs renovation, Limited parking"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {cons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCon(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCon}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              + Add another con
            </button>
          </div>

          {/* Would Recommend */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span className="ml-3 text-gray-700">
                <FaCheckCircle className="inline text-cyan-600 mr-2" />
                I would recommend this {propertyId ? 'property' : 'agent'} to others
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="flex-1 bg-cyan-700 text-white py-3 rounded-lg hover:bg-cyan-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <Link
              href={propertyId ? `/properties/${propertyId}` : agentId ? `/agents/${agentId}` : '/'}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <WriteReviewForm />
    </Suspense>
  )
}

