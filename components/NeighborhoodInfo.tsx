import {
  FaMosque,
  FaSchool,
  FaUniversity,
  FaHospital,
  FaClinicMedical,
  FaTree,
  FaStore,
  FaShoppingCart,
  FaShoppingBag,
  FaUtensils,
  FaRoad,
  FaBus,
  FaMoneyCheckAlt,
  FaGasPump,
  FaDumbbell,
  FaUsers,
  FaMapMarkerAlt,
  FaShieldAlt,
} from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { parseNearbyPlaces, amenityLabel, amenityIcon, DISTANCE_BANDS } from '@/lib/listingFields'

const ICONS: Record<string, IconType> = {
  mosque: FaMosque,
  school: FaSchool,
  university: FaUniversity,
  hospital: FaHospital,
  pharmacy: FaClinicMedical,
  park: FaTree,
  market: FaStore,
  cart: FaShoppingCart,
  mall: FaShoppingBag,
  food: FaUtensils,
  road: FaRoad,
  bus: FaBus,
  bank: FaMoneyCheckAlt,
  fuel: FaGasPump,
  gym: FaDumbbell,
  community: FaUsers,
  pin: FaMapMarkerAlt,
}

interface Props {
  nearbyPlaces?: string | null
  nearbyLandmark?: string | null
  crimeScore?: string | null
}

/**
 * What is around the property.
 *
 * Replaces the old Walk Score / transit score / school rating panels. Those
 * are US and Canadian services with no Pakistani equivalent, so the columns
 * were never populated for a real listing. Pakistani buyers ask a different
 * question — is the masjid within walking distance, is there a school nearby,
 * how far is the main road — and that is what this shows.
 */
export default function NeighborhoodInfo({ nearbyPlaces, nearbyLandmark, crimeScore }: Props) {
  const places = parseNearbyPlaces(nearbyPlaces)

  if (places.length === 0 && !nearbyLandmark && !crimeScore) return null

  // Walking-distance items first — that is what a buyer scans for.
  const order = new Map<string, number>(DISTANCE_BANDS.map((b, i) => [b as string, i]))
  const sorted = [...places].sort(
    (a, b) => (order.get(a.distance) ?? 99) - (order.get(b.distance) ?? 99)
  )
  const walkable = sorted.filter((p) => p.distance === 'Walking distance')

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">What&apos;s Nearby</h2>
      <p className="text-sm text-gray-500 mb-5">
        {walkable.length > 0
          ? `${walkable.length} ${walkable.length === 1 ? 'amenity' : 'amenities'} within walking distance`
          : 'Amenities around this property'}
      </p>

      {nearbyLandmark && (
        <div className="flex items-start gap-3 bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-5">
          <FaMapMarkerAlt className="text-cyan-700 mt-1 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-gray-900">Landmark</div>
            <div className="text-sm text-gray-700">{nearbyLandmark}</div>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((place, i) => {
            const Icon = ICONS[amenityIcon(place.type)] ?? FaMapMarkerAlt
            const walking = place.distance === 'Walking distance'
            return (
              <div
                key={`${place.type}-${i}`}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  walking ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    walking ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-cyan-700'
                  }`}
                >
                  <Icon className="text-[17px]" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {place.name || amenityLabel(place.type)}
                  </div>
                  {place.name && (
                    <div className="text-xs text-gray-500 truncate">{amenityLabel(place.type)}</div>
                  )}
                  {place.distance && (
                    <div
                      className={`text-xs ${walking ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}
                    >
                      {place.distance}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {crimeScore && (
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-200">
          <FaShieldAlt
            className={
              crimeScore === 'Low'
                ? 'text-emerald-600'
                : crimeScore === 'Medium'
                  ? 'text-amber-600'
                  : 'text-red-600'
            }
          />
          <span className="text-sm text-gray-700">
            Area safety reported as <strong>{crimeScore}</strong> risk by the lister
          </span>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-5">
        Distances are stated by the person listing the property and are not verified by MedaGhar.
      </p>
    </div>
  )
}
