import { notFound } from 'next/navigation'
import HeroBg from '@/components/HeroBg'
import Image from 'next/image'
import Link from 'next/link'
import { FaStar, FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaHome, FaAward, FaClock, FaPen } from 'react-icons/fa'
import { prisma } from '@/lib/prisma'
import PropertyCard from '@/components/PropertyCard'

interface AgentPageProps {
  params: Promise<{ id: string }>
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      properties: {
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
        where: {
          status: 'ACTIVE',
        },
        orderBy: { listedDate: 'desc' },
      },
      reviews: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!agent) {
    notFound()
  }

  const specialties = agent.specialties ? JSON.parse(agent.specialties) : []
  const fullName = `${agent.user.firstName} ${agent.user.lastName}`

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = agent.reviews.filter(r => Math.floor(r.rating) === rating).length
    const percentage = agent.reviewCount > 0 ? (count / agent.reviewCount) * 100 : 0
    return { rating, count, percentage }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Agent Header */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <HeroBg src="/images/keys-handover.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
            {/* Agent Photo */}
            <div className="flex-shrink-0">
              {agent.user.avatar ? (
                <Image
                  src={agent.user.avatar}
                  alt={fullName}
                  width={200}
                  height={200}
                  className="rounded-full border-4 md:border-8 border-white shadow-xl w-32 h-32 md:w-48 md:h-48"
                />
              ) : (
                <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full flex items-center justify-center text-cyan-600 text-4xl md:text-6xl font-bold shadow-xl">
                  {agent.user.firstName[0]}{agent.user.lastName[0]}
                </div>
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{fullName}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <FaStar className="text-copper-300 text-lg md:text-xl" />
                  <span className="text-xl md:text-2xl font-bold">{agent.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-300 text-sm md:text-base">({agent.reviewCount} reviews)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-4">
                  <div className="flex items-center justify-center md:justify-start gap-1 md:gap-2 mb-1">
                    <FaClock className="text-slate-400 text-xs md:text-base" />
                    <span className="text-xs md:text-sm text-slate-300 hidden md:inline">Experience</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-center md:text-left">{agent.yearsExperience} <span className="text-xs md:text-base">yrs</span></div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-4">
                  <div className="flex items-center justify-center md:justify-start gap-1 md:gap-2 mb-1">
                    <FaHome className="text-slate-400 text-xs md:text-base" />
                    <span className="text-xs md:text-sm text-slate-300 hidden md:inline">Listings</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-center md:text-left">{agent.properties.length}</div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <a
                  href={`tel:${agent.phoneNumber}`}
                  className="flex items-center gap-2 bg-white text-cyan-600 px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-cyan-50 transition font-medium text-sm md:text-base"
                >
                  <FaPhone />
                  <span className="hidden sm:inline">Call</span> Agent
                </a>
                <Link
                  href={`/messages?userId=${agent.user.id}`}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-white/20 transition font-medium text-sm md:text-base"
                >
                  <FaEnvelope />
                  <span className="hidden sm:inline">Message</span> Agent
                </Link>
                {agent.website && (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-white/20 transition font-medium text-sm md:text-base"
                  >
                    <FaGlobe />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {agent.user.firstName}</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{agent.bio}</p>

              {/* Specialties */}
              {specialties.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty: string, index: number) => (
                      <span
                        key={index}
                        className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Listings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Active Listings ({agent.properties.length})
              </h2>
              {agent.properties.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No active listings at the moment</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agent.properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reviews ({agent.reviewCount})
                </h2>
                <Link
                  href={`/reviews/write?agent=${agent.id}`}
                  className="flex items-center gap-2 bg-cyan-700 text-white px-4 py-2 rounded-lg hover:bg-cyan-800 transition font-medium"
                >
                  <FaPen />
                  Write Review
                </Link>
              </div>

              {/* Rating Summary */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {agent.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 justify-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={star <= agent.rating ? 'text-copper-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{agent.reviewCount} reviews</div>
                  </div>

                  <div className="flex-1">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600 w-12">{rating} star</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-copper-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {agent.reviews.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No reviews yet</p>
                ) : (
                  agent.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        {review.user.avatar ? (
                          <Image
                            src={review.user.avatar}
                            alt={`${review.user.firstName} ${review.user.lastName}`}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">
                            {review.user.firstName[0]}{review.user.lastName[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {review.user.firstName} {review.user.lastName}
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar
                                    key={star}
                                    className={`text-sm ${star <= review.rating ? 'text-copper-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <FaPhone className="text-cyan-600 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <a href={`tel:${agent.phoneNumber}`} className="text-gray-900 font-medium hover:text-cyan-600">
                      {agent.phoneNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaEnvelope className="text-cyan-600 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <a href={`mailto:${agent.user.email}`} className="text-gray-900 font-medium hover:text-cyan-600 break-all">
                      {agent.user.email}
                    </a>
                  </div>
                </div>

                {agent.officeAddress && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-cyan-600 mt-1" />
                    <div>
                      <div className="text-sm text-gray-600">Office</div>
                      <div className="text-gray-900 font-medium">{agent.officeAddress}</div>
                    </div>
                  </div>
                )}

                {agent.website && (
                  <div className="flex items-start gap-3">
                    <FaGlobe className="text-cyan-600 mt-1" />
                    <div>
                      <div className="text-sm text-gray-600">Website</div>
                      <a
                        href={agent.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-cyan-600 break-all"
                      >
                        {agent.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full bg-cyan-700 text-white py-3 rounded-lg hover:bg-cyan-800 transition font-medium mb-3">
                Request a Tour
              </button>
              <button className="w-full bg-white border-2 border-cyan-600 text-cyan-600 py-3 rounded-lg hover:bg-cyan-50 transition font-medium">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

