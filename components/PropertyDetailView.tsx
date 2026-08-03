import Image from 'next/image'
import Link from 'next/link'
import { FaBed, FaBath, FaRuler, FaCar, FaSwimmingPool, FaCalendar, FaMapMarkerAlt, FaHeart, FaStar, FaPen } from 'react-icons/fa'
import PropertyMap from '@/components/PropertyMap'
import SavePropertyButton from '@/components/SavePropertyButton'
import VirtualTour from '@/components/VirtualTour'
import NeighborhoodInfo from '@/components/NeighborhoodInfo'
import PriceHistoryChart from '@/components/PriceHistoryChart'
import RevealPhone from '@/components/RevealPhone'
import ImageSlider from '@/components/ImageSlider'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import LeadForm from '@/components/LeadForm'
import { absoluteUrl, breadcrumbJsonLd, formatPkr, propertyJsonLd } from '@/lib/seo'
import type { PropertyDetail } from '@/lib/getProperty'
import Breadcrumbs from '@/components/tree/Breadcrumbs'
import { getTypeDef, hubFor, typeSlugForEnum, PURPOSE_LABEL } from '@/lib/taxonomy'
import { buildTreeUrl } from '@/lib/tree/urls'

export default function PropertyDetailView({ property }: { property: PropertyDetail }) {
  // Handle features - could be JSON array or comma-separated string
  let features: string[] = []
  if (property.features) {
    try {
      features = JSON.parse(property.features)
    } catch {
      // If not valid JSON, treat as comma-separated string
      features = property.features.split(',').map((f: string) => f.trim()).filter(Boolean)
    }
  }

  // Handle nearbyPlaces - could be JSON array or comma-separated string
  let nearbyPlaces: string[] = []
  if (property.nearbyPlaces) {
    try {
      nearbyPlaces = JSON.parse(property.nearbyPlaces)
    } catch {
      nearbyPlaces = property.nearbyPlaces.split(',').map((p: string) => p.trim()).filter(Boolean)
    }
  }

  const formatPrice = (price: number) => {
    if (property.listingType === 'FOR_RENT') {
      return `PKR ${price.toLocaleString()}/month`
    }
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Crore`
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(2)} Lakh`
    }
    return `PKR ${price.toLocaleString()}`
  }

  const getAreaDisplay = () => {
    const parts = []
    if (property.kanal) parts.push(`${property.kanal} Kanal`)
    if (property.marla) parts.push(`${property.marla} Marla`)
    if (property.squareFeet) parts.push(`${property.squareFeet.toLocaleString()} sqft`)
    return parts.join(' • ') || 'N/A'
  }

  // Breadcrumb chain into the tree: Home > Hub > Type > City > Area > listing.
  const purpose = property.listingType === 'FOR_RENT' ? 'for-rent' : 'for-sale'
  const typeSlug = typeSlugForEnum(property.propertyType as never)
  const typeDef = typeSlug ? getTypeDef(typeSlug) : null

  const crumbs: { name: string; path: string }[] = [{ name: 'Home', path: '/' }]
  if (typeDef) {
    const hub = hubFor(typeDef.category, purpose)
    crumbs.push({ name: hub.title.replace(' in Pakistan', ''), path: hub.path })
    crumbs.push({
      name: `${typeDef.pluralLabel} ${PURPOSE_LABEL[purpose]}`,
      path: buildTreeUrl({ purpose, typeSlug: typeDef.slug }),
    })
    if (property.citySlug) {
      crumbs.push({
        name: property.city,
        path: buildTreeUrl({ purpose, typeSlug: typeDef.slug, citySlug: property.citySlug }),
      })
      if (property.areaSlug && property.area) {
        crumbs.push({
          name: property.area,
          path: buildTreeUrl({
            purpose,
            typeSlug: typeDef.slug,
            citySlug: property.citySlug,
            areaSlug: property.areaSlug,
          }),
        })
      }
    }
  }
  crumbs.push({
    name: property.title || property.address,
    path: `/properties/${property.slug || property.id}`,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={[propertyJsonLd(property), breadcrumbJsonLd(crumbs)]} />

      {/* Visible trail, mirroring the JSON-LD above. Listing URLs are flat, so
          this is how the hierarchy is communicated to search engines. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={crumbs} />
      </div>
      {/* Image Slider */}
      {property.images && property.images.length > 0 && (
        <div className="bg-white pt-14 md:pt-24 lg:pt-28">
          <div className="max-w-7xl mx-auto">
            <ImageSlider
              images={property.images.map(img => ({ url: img.url, caption: img.caption }))}
              videoUrl={property.videoUrl}
              autoPlayInterval={5000}
              showThumbnails={true}
              propertyTitle={property.title}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Price and Address */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-lg md:text-xl text-gray-700 mb-1">
                    {property.address}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 flex items-center gap-2">
                    <FaMapMarkerAlt />
                    {property.area && `${property.area}, `}{property.city}, {property.province}
                  </div>
                  {property.isFeatured && (
                    <div className="mt-2 inline-block mr-2">
                      <span className="bg-copper-100 text-copper-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                        ★ Featured
                      </span>
                    </div>
                  )}
                  {property.isFSBO && (
                    <div className="mt-2">
                      <span className="bg-copper-100 text-copper-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                        For Sale By Owner
                      </span>
                    </div>
                  )}
                  {property.isVerified && (
                    <div className="mt-2">
                      <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                        ✓ Verified Property
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <SavePropertyButton propertyId={property.id} size="lg" />
                </div>
              </div>

              {/* Key Details */}
              <div className="flex flex-wrap gap-3 md:gap-6 pt-4 border-t border-gray-200">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <FaBed className="text-lg md:text-xl text-cyan-600" />
                    <span className="font-semibold">{property.bedrooms}</span> Beds
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <FaBath className="text-lg md:text-xl text-cyan-600" />
                    <span className="font-semibold">{property.bathrooms}</span> Baths
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                  <FaRuler className="text-lg md:text-xl text-cyan-600" />
                  <span className="font-semibold">{getAreaDisplay()}</span>
                </div>
                {property.parkingSpaces && property.parkingSpaces > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCar className="text-xl text-cyan-600" />
                    <span className="font-semibold">{property.parkingSpaces}</span> Parking
                  </div>
                )}
                {property.pool && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaSwimmingPool className="text-xl text-cyan-600" />
                    Pool
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Home</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            <AdSlot className="mb-6" />

            {/* Virtual Tour */}
            {(property.virtualTourUrl || property.video3DTour || property.videoUrl) && (
              <div className="mb-6">
                <VirtualTour
                  virtualTourUrl={property.virtualTourUrl}
                  video3DTour={property.video3DTour}
                  videoUrl={property.videoUrl}
                  propertyTitle={property.title}
                />
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-cyan-700 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-semibold">{property.propertyType.replace(/_/g, ' ')}</span>
                </div>
                {property.yearBuilt && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Year Built</span>
                    <span className="font-semibold">{property.yearBuilt}</span>
                  </div>
                )}
                {property.possession && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Possession</span>
                    <span className="font-semibold">{property.possession}</span>
                  </div>
                )}
                {property.furnishing && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Furnishing</span>
                    <span className="font-semibold">{property.furnishing}</span>
                  </div>
                )}
                {property.facing && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Facing</span>
                    <span className="font-semibold">{property.facing}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Corner Property</span>
                  <span className="font-semibold">{property.cornerProperty ? 'Yes' : 'No'}</span>
                </div>
                {property.maintenanceFees && property.maintenanceFees > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Maintenance Fees</span>
                    <span className="font-semibold">PKR {property.maintenanceFees.toLocaleString()}/month</span>
                  </div>
                )}
                {property.garage && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Garage</span>
                    <span className="font-semibold">Yes</span>
                  </div>
                )}
                {property.mlsNumber && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">MLS Number</span>
                    <span className="font-semibold">{property.mlsNumber}</span>
                  </div>
                )}
              </div>
            </div>



            {/* Price history — renders nothing when there is no history */}
            {property.priceHistory && property.priceHistory.length > 0 && (
              <div className="mb-6">
                <PriceHistoryChart
                  priceHistory={property.priceHistory}
                  currentPrice={property.price}
                  listingType={property.listingType}
                />
              </div>
            )}

            {/* Neighborhood Data */}
            <NeighborhoodInfo
              walkScore={property.walkScore}
              transitScore={property.transitScore}
              crimeScore={property.crimeScore}
              schoolRating={property.schoolRating}
              nearbyPlaces={property.nearbyPlaces}
            />

            {/* Map Location */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="mb-4 text-gray-700">
                <FaMapMarkerAlt className="inline mr-2 text-cyan-600" />
                {property.area && `${property.area}, `}{property.city}, {property.province}
              </div>
              <PropertyMap
                properties={[{
                  id: property.id,
                  address: property.address,
                  city: property.city,
                  province: property.province,
                  area: property.area || undefined,
                  price: property.price,
                  bedrooms: property.bedrooms,
                  bathrooms: property.bathrooms,
                  latitude: property.latitude,
                  longitude: property.longitude,
                  propertyType: property.propertyType,
                  listingType: property.listingType,
                  images: property.images.map(img => ({ url: img.url })),
                }]}
                center={[property.latitude, property.longitude]}
                zoom={15}
                height="400px"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agent Card */}
            {property.agent && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Agent</h3>
                <div className="flex items-center gap-4 mb-4">
                  {property.agent.user.avatar && (
                    <Image
                      src={property.agent.user.avatar}
                      alt={`${property.agent.user.firstName} ${property.agent.user.lastName}`}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-lg">
                      {property.agent.user.firstName} {property.agent.user.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      ⭐ {property.agent.rating} ({property.agent.reviewCount} reviews)
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    href={`/messages?userId=${property.agent.user.id}&propertyId=${property.id}&message=${encodeURIComponent(`Hi, I'm interested in scheduling a tour for ${property.address}. When would be a good time?`)}`}
                    className="block w-full bg-cyan-700 text-white py-3 rounded-lg hover:bg-cyan-800 transition font-medium text-center"
                  >
                    Request a Tour
                  </Link>
                  <Link
                    href={`/messages?userId=${property.agent.user.id}&propertyId=${property.id}`}
                    className="block w-full bg-white border-2 border-cyan-600 text-cyan-600 py-3 rounded-lg hover:bg-cyan-50 transition font-medium text-center"
                  >
                    Contact Agent
                  </Link>
                  <RevealPhone propertyId={property.id} party="agent" label="Show Agent Phone" />
                </div>
              </div>
            )}

            {/* Owner Card (FSBO - For Sale By Owner) */}
            {!property.agent && property.owner && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Owner</h3>
                <div className="flex items-center gap-4 mb-4">
                  {property.owner.avatar ? (
                    <Image
                      src={property.owner.avatar}
                      alt={`${property.owner.firstName} ${property.owner.lastName}`}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xl font-bold">
                      {property.owner.firstName[0]}{property.owner.lastName[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-lg">
                      {property.owner.firstName} {property.owner.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      Property Owner
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    href={`/messages?userId=${property.owner.id}&propertyId=${property.id}&message=${encodeURIComponent(`Hi, I'm interested in scheduling a tour for ${property.address}. When would be a good time?`)}`}
                    className="block w-full bg-cyan-700 text-white py-3 rounded-lg hover:bg-cyan-800 transition font-medium text-center"
                  >
                    Request a Tour
                  </Link>
                  <Link
                    href={`/messages?userId=${property.owner.id}&propertyId=${property.id}`}
                    className="block w-full bg-white border-2 border-cyan-600 text-cyan-600 py-3 rounded-lg hover:bg-cyan-50 transition font-medium text-center"
                  >
                    Contact Owner
                  </Link>
                  <RevealPhone propertyId={property.id} party="owner" label="Show Owner Phone" />
                </div>
              </div>
            )}

            {/* Lead capture */}
            <div className="mb-6">
              <LeadForm
                propertyId={property.id}
                intent={property.listingType === 'FOR_RENT' ? 'renting' : 'buying'}
              />
            </div>

            {/* Mortgage Calculator Preview */}
            {property.listingType === 'FOR_SALE' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Payment</h3>
                <div className="text-3xl font-bold text-cyan-600 mb-2">
                  PKR {Math.round(property.price * 0.008).toLocaleString()}/month
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Est. with 20% down, 15% APR
                </div>
                <Link
                  href="/tools/mortgage-calculator"
                  className="block w-full bg-slate-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-center"
                >
                  Calculate Your Payment
                </Link>
                <Link
                  href="/home-loans"
                  className="block w-full mt-2 text-cyan-700 text-sm text-center hover:underline"
                >
                  Compare bank home loans →
                </Link>
              </div>
            )}

            <AdSlot format="vertical" />
          </div>
        </div>
      </div>
    </div>
  )
}
