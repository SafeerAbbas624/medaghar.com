import { slugify } from '@/lib/slugify'

export type PropertyCategory = 'residential' | 'commercial'

/** PropertyType enum values that belong to the commercial side. Everything else is residential. */
const COMMERCIAL_TYPES = new Set([
  'COMMERCIAL_PLOT',
  'INDUSTRIAL_LAND',
  'OFFICE',
  'SHOP',
  'WAREHOUSE',
  'FACTORY',
  'BUILDING',
])

export function propertyCategory(propertyType: string): PropertyCategory {
  return COMMERCIAL_TYPES.has(propertyType) ? 'commercial' : 'residential'
}

interface PropertyForUrl {
  slug?: string | null
  id: string
  city: string
  area?: string | null
  subArea?: string | null
  propertyType: string
}

/**
 * Canonical hierarchical URL for a property:
 *   /{residential|commercial}/{city}/{area}/{subarea?}/{slug}
 * Falls back gracefully when area / subarea are missing.
 */
export function buildPropertyUrl(p: PropertyForUrl): string {
  const cat = propertyCategory(p.propertyType)
  const city = slugify(p.city || 'pakistan')
  const area = slugify(p.area || 'other')
  const sub = p.subArea ? slugify(p.subArea) : null
  const slug = p.slug || p.id
  return sub
    ? `/${cat}/${city}/${area}/${sub}/${slug}`
    : `/${cat}/${city}/${area}/${slug}`
}

/** URL for a category landing page (city / area / subarea). */
export function buildCategoryUrl(
  cat: PropertyCategory,
  citySlug: string,
  areaSlug?: string,
  subAreaSlug?: string
): string {
  let url = `/${cat}/${citySlug}`
  if (areaSlug) url += `/${areaSlug}`
  if (subAreaSlug) url += `/${subAreaSlug}`
  return url
}

/** Prisma `propertyType in [...]` filter for a category. */
export const RESIDENTIAL_TYPES = [
  'HOUSE', 'FLAT', 'UPPER_PORTION', 'LOWER_PORTION', 'FARM_HOUSE', 'ROOM',
  'PENTHOUSE', 'BASEMENT', 'HOSTEL', 'GUEST_HOUSE', 'HOTEL_SUITES', 'BEACH_HUT',
  'RESIDENTIAL_PLOT', 'AGRICULTURAL_LAND', 'PLOT_FILE', 'PLOT_FORM', 'OTHER',
]
export const COMMERCIAL_TYPE_LIST = Array.from(COMMERCIAL_TYPES)

export function categoryTypeFilter(cat: PropertyCategory): string[] {
  return cat === 'commercial' ? COMMERCIAL_TYPE_LIST : RESIDENTIAL_TYPES
}

export const CATEGORY_LABEL: Record<PropertyCategory, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
}
