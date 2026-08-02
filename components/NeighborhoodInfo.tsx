'use client'

import { FaWalking, FaBus, FaShieldAlt, FaGraduationCap, FaMapMarkerAlt, FaHospital, FaShoppingCart, FaMosque, FaUtensils, FaTree, FaSubway, FaParking } from 'react-icons/fa'

interface NearbyPlace {
  name: string
  distance: string
  type: string
}

interface NeighborhoodInfoProps {
  walkScore?: number | null
  transitScore?: number | null
  crimeScore?: string | null
  schoolRating?: number | null
  nearbyPlaces?: string | null
}

export default function NeighborhoodInfo({
  walkScore,
  transitScore,
  crimeScore,
  schoolRating,
  nearbyPlaces,
}: NeighborhoodInfoProps) {
  const places: NearbyPlace[] = nearbyPlaces ? JSON.parse(nearbyPlaces) : []

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cyan-600'
    if (score >= 60) return 'text-copper-600'
    return 'text-copper-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Limited'
  }

  const getCrimeColor = (crime: string) => {
    if (crime === 'Low') return 'text-cyan-600'
    if (crime === 'Medium') return 'text-copper-600'
    return 'text-red-600'
  }

  const getCrimeBgColor = (crime: string) => {
    if (crime === 'Low') return 'bg-cyan-50'
    if (crime === 'Medium') return 'bg-copper-50'
    return 'bg-red-50'
  }

  const getPlaceIcon = (type: string | null | undefined) => {
    if (!type) return <FaMapMarkerAlt className="text-gray-500" />
    const lowerType = type.toLowerCase()
    if (lowerType.includes('hospital') || lowerType.includes('clinic')) return <FaHospital className="text-red-500" />
    if (lowerType.includes('school') || lowerType.includes('university') || lowerType.includes('college')) return <FaGraduationCap className="text-cyan-500" />
    if (lowerType.includes('mosque') || lowerType.includes('masjid')) return <FaMosque className="text-cyan-500" />
    if (lowerType.includes('shopping') || lowerType.includes('mall') || lowerType.includes('market')) return <FaShoppingCart className="text-cyan-700" />
    if (lowerType.includes('restaurant') || lowerType.includes('food')) return <FaUtensils className="text-copper-500" />
    if (lowerType.includes('park') || lowerType.includes('garden')) return <FaTree className="text-cyan-600" />
    if (lowerType.includes('metro') || lowerType.includes('station')) return <FaSubway className="text-cyan-600" />
    if (lowerType.includes('parking')) return <FaParking className="text-gray-600" />
    return <FaMapMarkerAlt className="text-gray-500" />
  }

  // Don't render if no data
  if (!walkScore && !transitScore && !crimeScore && !schoolRating && places.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Neighborhood & Amenities</h2>

      {/* Scores Grid */}
      {(walkScore || transitScore || schoolRating || crimeScore) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Walk Score */}
          {walkScore && (
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 sm:p-6 border border-cyan-200">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <FaWalking className="text-2xl sm:text-3xl text-cyan-600" />
                <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(walkScore)}`}>
                  {walkScore}
                </div>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Walk Score</div>
              <div className="text-xs text-gray-600">{getScoreLabel(walkScore)} Walkability</div>
              <div className="mt-2 sm:mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${walkScore >= 80 ? 'bg-cyan-700' : walkScore >= 60 ? 'bg-copper-500' : 'bg-copper-500'}`}
                  style={{ width: `${walkScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Transit Score */}
          {transitScore && (
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <FaBus className="text-3xl text-cyan-600" />
                <div className={`text-3xl font-bold ${getScoreColor(transitScore)}`}>
                  {transitScore}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Transit Score</div>
              <div className="text-xs text-gray-600">{getScoreLabel(transitScore)} Transit</div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${transitScore >= 80 ? 'bg-cyan-700' : transitScore >= 60 ? 'bg-copper-500' : 'bg-copper-500'}`}
                  style={{ width: `${transitScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* School Rating */}
          {schoolRating && (
            <div className="bg-gradient-to-br from-copper-50 to-slate-100 rounded-lg p-6 border border-copper-200">
              <div className="flex items-center justify-between mb-3">
                <FaGraduationCap className="text-3xl text-cyan-700" />
                <div className="text-3xl font-bold text-cyan-700">
                  {schoolRating.toFixed(1)}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">School Rating</div>
              <div className="text-xs text-gray-600">Out of 5.0</div>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`h-2 flex-1 rounded ${
                      star <= Math.round(schoolRating) ? 'bg-copper-500' : 'bg-gray-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Crime Score */}
          {crimeScore && (
            <div className={`bg-gradient-to-br ${getCrimeBgColor(crimeScore)} rounded-lg p-6 border ${crimeScore === 'Low' ? 'border-cyan-200' : crimeScore === 'Medium' ? 'border-copper-200' : 'border-red-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <FaShieldAlt className={`text-3xl ${getCrimeColor(crimeScore)}`} />
                <div className={`text-2xl font-bold ${getCrimeColor(crimeScore)}`}>
                  {crimeScore}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Safety Rating</div>
              <div className="text-xs text-gray-600">
                {crimeScore === 'Low' ? 'Very Safe Area' : crimeScore === 'Medium' ? 'Moderately Safe' : 'Exercise Caution'}
              </div>
              <div className="mt-3 flex gap-1">
                {['Low', 'Medium', 'High'].map((level, index) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${
                      (crimeScore === 'Low' && index === 0) ||
                      (crimeScore === 'Medium' && index <= 1) ||
                      (crimeScore === 'High' && index <= 2)
                        ? crimeScore === 'Low'
                          ? 'bg-cyan-700'
                          : crimeScore === 'Medium'
                          ? 'bg-copper-500'
                          : 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nearby Places */}
      {places.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-cyan-600" />
            Nearby Places & Amenities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {places.map((place, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="mt-1">
                  {getPlaceIcon(place.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{place.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <span className="text-cyan-600 font-semibold">{place.distance}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{place.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Explanations */}
      {(walkScore || transitScore) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {walkScore && (
              <div>
                <div className="font-semibold text-gray-700 mb-1">Walk Score®</div>
                <p className="text-xs">
                  Measures walkability on a scale of 0-100 based on walking routes to nearby amenities.
                </p>
              </div>
            )}
            {transitScore && (
              <div>
                <div className="font-semibold text-gray-700 mb-1">Transit Score®</div>
                <p className="text-xs">
                  Measures access to public transportation on a scale of 0-100.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

