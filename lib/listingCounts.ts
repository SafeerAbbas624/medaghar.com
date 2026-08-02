/**
 * Aggregated ACTIVE-listing counts and price stats, keyed by location.
 *
 * This is the module the gate depends on: tree pages consult it to decide
 * indexability, link grids use it to prune zero-inventory children, and
 * sitemaps use it to emit only URLs that pass the threshold.
 *
 * Everything is computed in a handful of groupBy queries and cached, so a page
 * render costs a cache read rather than its own aggregate query.
 */

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { ListingType, PropertyType } from '@prisma/client'
import type { TypeDef } from '@/lib/taxonomy'

/** Cache lifetime. Matches the tree pages' revalidate window. */
const TTL_SECONDS = 600

export interface LocationStats {
  count: number
  minPrice: number | null
  maxPrice: number | null
  avgPrice: number | null
}

interface CountRow {
  listingType: ListingType
  propertyType: PropertyType
  citySlug: string | null
  areaSlug: string | null
  subAreaSlug: string | null
  isFSBO: boolean
  count: number
  minPrice: number | null
  maxPrice: number | null
  sumPrice: number
}

/**
 * One pass over ACTIVE listings, grouped to the finest granularity we ever
 * need. Coarser figures are derived by summing in memory, which keeps this to
 * a single query rather than one per level.
 */
async function queryRows(): Promise<CountRow[]> {
  try {
    const grouped = await prisma.property.groupBy({
      by: ['listingType', 'propertyType', 'citySlug', 'areaSlug', 'subAreaSlug', 'isFSBO'],
      where: { status: 'ACTIVE', citySlug: { not: null } },
      _count: { _all: true },
      _min: { price: true },
      _max: { price: true },
      _sum: { price: true },
    })

    return grouped.map((g) => ({
      listingType: g.listingType,
      propertyType: g.propertyType,
      citySlug: g.citySlug,
      areaSlug: g.areaSlug,
      subAreaSlug: g.subAreaSlug,
      isFSBO: g.isFSBO,
      count: g._count._all,
      minPrice: g._min.price ?? null,
      maxPrice: g._max.price ?? null,
      sumPrice: g._sum.price ?? 0,
    }))
  } catch (error) {
    // Never let a stats failure take down a page — degrade to "no inventory".
    console.error('listingCounts: groupBy failed', error)
    return []
  }
}

const cachedRows = unstable_cache(queryRows, ['listing-counts-v1'], {
  revalidate: TTL_SECONDS,
  tags: ['listing-counts'],
})

/**
 * unstable_cache needs Next's request context, which scripts and tests do not
 * have. Fall back to an uncached query there rather than throwing.
 */
async function loadRows(): Promise<CountRow[]> {
  try {
    return await cachedRows()
  } catch (error) {
    if (error instanceof Error && /incrementalCache/i.test(error.message)) {
      return queryRows()
    }
    throw error
  }
}

export interface CountQuery {
  listingType?: ListingType | null
  /** PropertyType values covered by the requested type slug. */
  types?: PropertyType[]
  citySlug?: string
  areaSlug?: string
  subAreaSlug?: string
  /** Restrict to for-sale-by-owner listings. */
  fsboOnly?: boolean
}

function matches(row: CountRow, q: CountQuery): boolean {
  if (q.listingType && row.listingType !== q.listingType) return false
  if (q.types && q.types.length > 0 && !q.types.includes(row.propertyType)) return false
  if (q.citySlug && row.citySlug !== q.citySlug) return false
  if (q.areaSlug && row.areaSlug !== q.areaSlug) return false
  if (q.subAreaSlug && row.subAreaSlug !== q.subAreaSlug) return false
  if (q.fsboOnly && !row.isFSBO) return false
  return true
}

/** Number of ACTIVE listings matching a query. */
export async function countFor(q: CountQuery): Promise<number> {
  const rows = await loadRows()
  let total = 0
  for (const row of rows) if (matches(row, q)) total += row.count
  return total
}

/** Count plus price range, for the data-driven copy on location pages. */
export async function statsFor(q: CountQuery): Promise<LocationStats> {
  const rows = await loadRows()
  let count = 0
  let sum = 0
  let min: number | null = null
  let max: number | null = null

  for (const row of rows) {
    if (!matches(row, q)) continue
    count += row.count
    sum += row.sumPrice
    if (row.minPrice !== null && (min === null || row.minPrice < min)) min = row.minPrice
    if (row.maxPrice !== null && (max === null || row.maxPrice > max)) max = row.maxPrice
  }

  return {
    count,
    minPrice: min,
    maxPrice: max,
    avgPrice: count > 0 ? Math.round(sum / count) : null,
  }
}

/** City slugs that have inventory for a type+purpose — used to prune link grids. */
export async function citiesWithInventory(
  type: TypeDef,
  listingType: ListingType | null,
  fsboOnly = false
): Promise<Map<string, number>> {
  const rows = await loadRows()
  const out = new Map<string, number>()
  for (const row of rows) {
    if (!matches(row, { listingType, types: type.types, fsboOnly })) continue
    if (!row.citySlug) continue
    out.set(row.citySlug, (out.get(row.citySlug) ?? 0) + row.count)
  }
  return out
}

/** Area slugs within a city that have inventory, with their counts. */
export async function areasWithInventory(
  citySlug: string,
  type: TypeDef,
  listingType: ListingType | null
): Promise<Map<string, number>> {
  const rows = await loadRows()
  const out = new Map<string, number>()
  for (const row of rows) {
    if (!matches(row, { listingType, types: type.types, citySlug })) continue
    if (!row.areaSlug) continue
    out.set(row.areaSlug, (out.get(row.areaSlug) ?? 0) + row.count)
  }
  return out
}

/** Sub-area slugs within an area that have inventory, with their counts. */
export async function subAreasWithInventory(
  citySlug: string,
  areaSlug: string,
  type: TypeDef,
  listingType: ListingType | null
): Promise<Map<string, number>> {
  const rows = await loadRows()
  const out = new Map<string, number>()
  for (const row of rows) {
    if (!matches(row, { listingType, types: type.types, citySlug, areaSlug })) continue
    if (!row.subAreaSlug) continue
    out.set(row.subAreaSlug, (out.get(row.subAreaSlug) ?? 0) + row.count)
  }
  return out
}
