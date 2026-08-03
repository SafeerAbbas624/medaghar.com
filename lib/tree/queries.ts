/**
 * Listing queries for tree pages.
 *
 * Queries go straight to Prisma (not through /api/properties) because tree
 * pages are server components and the HTML must contain the listings for SEO.
 * The where-shape matches the Phase 1 composite indexes.
 */

import { prisma } from '@/lib/prisma'
import type { TreeDescriptor } from '@/lib/tree/parseSegments'
import { listingTypeForPurpose } from '@/lib/taxonomy'

export const PAGE_SIZE = 24

/** Fields PropertyCard needs — keep in sync with its props interface. */
const CARD_SELECT = {
  id: true,
  slug: true,
  address: true,
  city: true,
  province: true,
  area: true,
  subArea: true,
  price: true,
  bedrooms: true,
  bathrooms: true,
  squareFeet: true,
  marla: true,
  kanal: true,
  propertyType: true,
  listingType: true,
  pkEstimate: true,
  rentEstimate: true,
  isFeatured: true,
  isVerified: true,
  isFSBO: true,
  images: { select: { url: true }, orderBy: { order: 'asc' as const }, take: 1 },
} as const

export function whereForDescriptor(d: TreeDescriptor) {
  const listingType = listingTypeForPurpose(d.purpose)

  const where: Record<string, unknown> = { status: 'ACTIVE' }

  if (listingType) where.listingType = listingType
  if (d.purpose === 'owner') where.isFSBO = true

  if (d.type && d.type.types.length > 0) {
    where.propertyType = d.type.types.length === 1 ? d.type.types[0] : { in: d.type.types }
  }
  if (d.city) where.citySlug = d.city.slug
  if (d.area) where.areaSlug = d.area.slug
  if (d.subArea) where.subAreaSlug = d.subArea.slug

  return where
}

/** One page of listings for a tree node, newest and featured first. */
export async function getListingsForNode(d: TreeDescriptor, page = 1) {
  const where = whereForDescriptor(d)
  const skip = (Math.max(1, page) - 1) * PAGE_SIZE

  try {
    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: CARD_SELECT,
        orderBy: [{ isFeatured: 'desc' }, { listedDate: 'desc' }],
        skip,
        take: PAGE_SIZE,
      }),
      prisma.property.count({ where }),
    ])

    return { listings, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
  } catch (error) {
    console.error('getListingsForNode failed', error)
    return { listings: [], total: 0, page, totalPages: 1 }
  }
}

export type NodeListings = Awaited<ReturnType<typeof getListingsForNode>>
