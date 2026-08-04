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

export const PAGE_SIZE = 50

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
  description: true,
  listedDate: true,
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

/**
 * Extra query filters coming from the URL, for combinations the tree path
 * cannot express (price band, bedrooms, size).
 */
export interface ExtraFilters {
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  bathrooms?: string
  minMarla?: string
  maxMarla?: string
  areaSlug?: string
}

export function applyExtraFilters(
  where: Record<string, unknown>,
  extra: ExtraFilters
): Record<string, unknown> {
  const out = { ...where }
  const price: Record<string, number> = {}
  if (extra.minPrice) price.gte = parseFloat(extra.minPrice)
  if (extra.maxPrice) price.lte = parseFloat(extra.maxPrice)
  if (Object.keys(price).length) out.price = price

  const marla: Record<string, number> = {}
  if (extra.minMarla) marla.gte = parseFloat(extra.minMarla)
  if (extra.maxMarla) marla.lte = parseFloat(extra.maxMarla)
  if (Object.keys(marla).length) out.marla = marla

  if (extra.bedrooms) out.bedrooms = { gte: parseInt(extra.bedrooms, 10) }
  if (extra.bathrooms) out.bathrooms = { gte: parseFloat(extra.bathrooms) }
  // Only applied when the path could not carry it (Tier-B type, or /owner).
  if (extra.areaSlug && !out.areaSlug) out.areaSlug = extra.areaSlug

  return out
}

/** One page of listings, honouring both the tree node and any query filters. */
export async function getFilteredListings(
  d: TreeDescriptor,
  page = 1,
  extra: ExtraFilters = {}
) {
  const where = applyExtraFilters(whereForDescriptor(d), extra)
  const skip = (Math.max(1, page) - 1) * PAGE_SIZE

  try {
    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: CARD_SELECT,
        // Featured are pinned separately above, so order here is purely recency.
        orderBy: [{ listedDate: 'desc' }],
        skip,
        take: PAGE_SIZE,
      }),
      prisma.property.count({ where }),
    ])
    return { listings, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
  } catch (error) {
    console.error('getFilteredListings failed', error)
    return { listings: [], total: 0, page, totalPages: 1 }
  }
}

/**
 * Featured listings for the current filter set.
 *
 * Pinned above the results and repeated on every page, so promotion is not
 * diluted by pagination depth.
 */
export async function getFeaturedForNode(
  d: TreeDescriptor,
  extra: ExtraFilters = {},
  take = 3
) {
  const where = { ...applyExtraFilters(whereForDescriptor(d), extra), isFeatured: true }
  try {
    return await prisma.property.findMany({
      where,
      select: CARD_SELECT,
      orderBy: [{ listedDate: 'desc' }],
      take,
    })
  } catch (error) {
    console.error('getFeaturedForNode failed', error)
    return []
  }
}
