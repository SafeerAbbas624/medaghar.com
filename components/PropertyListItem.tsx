'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaRegClock } from 'react-icons/fa'
import { formatPkr } from '@/lib/format'

export interface ListItemProperty {
  id: string
  slug?: string | null
  title?: string | null
  address: string
  city: string
  area?: string | null
  subArea?: string | null
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet?: number | null
  marla?: number | null
  kanal?: number | null
  propertyType: string
  listingType: string
  images: { url: string }[]
  isFeatured?: boolean | null
  isVerified?: boolean | null
  isFSBO?: boolean | null
  listedDate?: string | Date | null
  description?: string | null
}

/** "10 Marla" / "1 Kanal" / "1,200 sq ft" — whichever the listing actually has. */
function sizeLabel(p: ListItemProperty): string | null {
  if (p.kanal && p.kanal >= 1) return `${p.kanal} Kanal`
  if (p.marla) return `${p.marla} Marla`
  if (p.squareFeet) return `${p.squareFeet.toLocaleString()} sq ft`
  return null
}

function timeAgo(date?: string | Date | null): string | null {
  if (!date) return null
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

/**
 * Horizontal list row: image left, details right.
 *
 * Contact numbers are deliberately absent — they are revealed only on the
 * detail page, to signed-in users, via the authenticated contact endpoint.
 */
export default function PropertyListItem({ property }: { property: ListItemProperty }) {
  const href = `/properties/${property.slug || property.id}`
  const forRent = property.listingType === 'FOR_RENT'
  const size = sizeLabel(property)
  const posted = timeAgo(property.listedDate)
  const location = [property.subArea, property.area, property.city].filter(Boolean).join(', ')
  const typeLabel = property.propertyType.replace(/_/g, ' ').toLowerCase()

  return (
    <Link
      href={href}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-cyan-200 transition overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-[280px] h-[200px] sm:h-[210px] flex-shrink-0 bg-slate-100">
          {property.images?.[0]?.url ? (
            <Image
              src={property.images[0].url}
              alt={property.title || property.address}
              fill
              sizes="(max-width: 640px) 100vw, 280px"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-cyan-700/30">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mb-1">
                <path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8z" />
              </svg>
              <span className="text-[11px] font-medium text-gray-400">Photos coming soon</span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span className="bg-cyan-700 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">
              {forRent ? 'For Rent' : 'For Sale'}
            </span>
            {property.isFeatured && (
              <span className="bg-copper-500 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold shadow">
                ★ Featured
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-[21px] flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-[8px]">
            <div className="text-[21px] lg:text-[24px] font-bold text-cyan-800 leading-tight">
              {formatPkr(property.price, forRent)}
            </div>
            <div className="flex flex-col gap-1 items-end flex-shrink-0">
              {property.isVerified && (
                <span className="text-[10px] font-semibold text-cyan-700 border border-cyan-300 bg-cyan-50 px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
              {property.isFSBO && (
                <span className="text-[10px] font-semibold text-emerald-700 border border-emerald-300 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ✓ No Commission
                </span>
              )}
            </div>
          </div>

          <h3 className="text-[16px] font-semibold text-gray-900 mb-[5px] line-clamp-1 group-hover:text-cyan-700 transition">
            {property.title || `${size ? size + ' ' : ''}${typeLabel} in ${property.area || property.city}`}
          </h3>

          <p className="flex items-center gap-1.5 text-[13px] text-gray-600 mb-[13px]">
            <FaMapMarkerAlt className="text-gray-400 text-[11px] flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </p>

          <div className="flex flex-wrap items-center gap-x-[21px] gap-y-[8px] text-[13px] text-gray-700 mb-[13px]">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <FaBed className="text-gray-400" /> {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <FaBath className="text-gray-400" /> {property.bathrooms} Baths
              </span>
            )}
            {size && (
              <span className="flex items-center gap-1.5">
                <FaRulerCombined className="text-gray-400" /> {size}
              </span>
            )}
            <span className="capitalize text-gray-500">{typeLabel}</span>
          </div>

          {property.description && (
            <p className="text-[13px] text-gray-500 line-clamp-2 mb-[13px]">{property.description}</p>
          )}

          <div className="mt-auto flex items-center justify-between">
            {posted && (
              <span className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <FaRegClock /> {posted}
              </span>
            )}
            <span className="text-[13px] font-semibold text-cyan-700 group-hover:underline">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
