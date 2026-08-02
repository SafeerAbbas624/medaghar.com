import type { City, Area, SubArea } from '@/content/locations/types'
import punjab from '@/content/locations/punjab'
import sindhBalochistan from '@/content/locations/sindh-balochistan'
import kpkIctNorth from '@/content/locations/kpk-ict-north'
import {
  AREA_ALIASES,
  CITY_ALIASES,
  normalizeText,
  splitStructuredArea,
} from '@/content/locations/aliases'

export type { City, Area, SubArea }

/** All Pakistani cities, merged from the regional datasets, de-duped by slug. */
export const CITIES: City[] = dedupe([...punjab, ...sindhBalochistan, ...kpkIctNorth])

function dedupe(list: City[]): City[] {
  const seen = new Set<string>()
  const out: City[] = []
  for (const c of list) {
    if (seen.has(c.slug)) continue
    seen.add(c.slug)
    out.push(c)
  }
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

export const PROVINCES = Array.from(new Set(CITIES.map((c) => c.province)))

export function getCity(slug: string): City | undefined {
  const s = slug.toLowerCase()
  return CITIES.find((c) => c.slug === s)
}

export function getArea(city: City, areaSlug: string): Area | undefined {
  const s = areaSlug.toLowerCase()
  return city.areas.find((a) => a.slug === s)
}

export function getSubArea(area: Area, subSlug: string): SubArea | undefined {
  const s = subSlug.toLowerCase()
  return area.subAreas?.find((sa) => sa.slug === s)
}

/** Cities that have at least one area (used for area-level static params). */
export function citiesWithAreas(): City[] {
  return CITIES.filter((c) => c.areas.length > 0)
}

export interface FlatArea {
  city: City
  area: Area
}
export interface FlatSubArea {
  city: City
  area: Area
  subArea: SubArea
}

export function allAreas(): FlatArea[] {
  const out: FlatArea[] = []
  for (const city of CITIES) for (const area of city.areas) out.push({ city, area })
  return out
}

export function allSubAreas(): FlatSubArea[] {
  const out: FlatSubArea[] = []
  for (const city of CITIES)
    for (const area of city.areas)
      for (const subArea of area.subAreas || []) out.push({ city, area, subArea })
  return out
}

/** Areas that genuinely have blocks/phases — the only ones with subarea URLs. */
export function areasWithSubAreas(): FlatArea[] {
  return allAreas().filter(({ area }) => (area.subAreas?.length ?? 0) > 0)
}

/** Turn free text into a slug candidate: "DHA Phase 6" -> "dha-phase-6". */
function toSlug(value: string): string {
  return normalizeText(value).replace(/\s+/g, '-')
}

export type MatchQuality = 'exact' | 'alias' | 'pattern' | 'slugify' | 'none'

export interface ResolvedLocation {
  citySlug: string | null
  areaSlug: string | null
  subAreaSlug: string | null
  /** How the *area* was resolved (or how the city failed). */
  matched: MatchQuality
}

/**
 * Map a listing's free-text location onto canonical taxonomy slugs.
 *
 * Resolution order, most to least trustworthy:
 *   1. exact   — the slugified text is already a taxonomy slug
 *   2. alias   — an explicit entry in AREA_ALIASES / CITY_ALIASES
 *   3. pattern — a structural split like "DHA Phase 6" -> dha-defence + phase-6
 *   4. slugify — city resolved but the area is unknown; area slug is dropped
 *   5. none    — the city itself could not be resolved
 *
 * Never throws: unresolvable input yields nulls so callers can decide policy.
 */
export function resolveLocation(input: {
  city?: string | null
  area?: string | null
  subArea?: string | null
}): ResolvedLocation {
  const cityText = (input.city ?? '').trim()
  if (!cityText) return { citySlug: null, areaSlug: null, subAreaSlug: null, matched: 'none' }

  const cityNorm = normalizeText(cityText)
  let city = getCity(toSlug(cityText))
  let cityQuality: MatchQuality = city ? 'exact' : 'none'

  if (!city && CITY_ALIASES[cityNorm]) {
    city = getCity(CITY_ALIASES[cityNorm])
    if (city) cityQuality = 'alias'
  }
  if (!city) return { citySlug: null, areaSlug: null, subAreaSlug: null, matched: 'none' }

  const areaText = (input.area ?? '').trim()
  if (!areaText) {
    return { citySlug: city.slug, areaSlug: null, subAreaSlug: null, matched: cityQuality }
  }

  const areaNorm = normalizeText(areaText)
  const subText = (input.subArea ?? '').trim()

  // 1. exact
  let area = getArea(city, toSlug(areaText))
  let quality: MatchQuality = area ? 'exact' : 'none'
  let subFromArea: string | null = null

  // 2. alias (city-scoped)
  if (!area) {
    const alias = AREA_ALIASES[`${city.slug}:${areaNorm}`]
    if (alias) {
      area = getArea(city, alias.areaSlug)
      if (area) {
        quality = 'alias'
        subFromArea = alias.subAreaSlug ?? null
      }
    }
  }

  // 3. structural pattern ("DHA Phase 6", "F-8 Markaz", "Clifton Block 5")
  if (!area) {
    const split = splitStructuredArea(areaNorm)
    if (split) {
      // The base may itself need an alias ("dha" -> "dha-defence" in Lahore).
      area =
        getArea(city, split.area.replace(/\s+/g, '-')) ??
        (AREA_ALIASES[`${city.slug}:${split.area}`]
          ? getArea(city, AREA_ALIASES[`${city.slug}:${split.area}`].areaSlug)
          : undefined)
      if (area) {
        quality = 'pattern'
        subFromArea = split.sub.replace(/\s+/g, '-')
      }
    }
  }

  if (!area) {
    // City is good, area is not in the taxonomy. Keep the city so the listing
    // still surfaces on city pages rather than vanishing entirely.
    return { citySlug: city.slug, areaSlug: null, subAreaSlug: null, matched: 'slugify' }
  }

  // Resolve the sub-area: explicit input wins, else whatever the area text implied.
  let subAreaSlug: string | null = null
  if (subText) {
    const s = getSubArea(area, toSlug(subText))
    if (s) subAreaSlug = s.slug
  }
  if (!subAreaSlug && subFromArea) {
    const s = getSubArea(area, subFromArea)
    if (s) subAreaSlug = s.slug
  }

  return { citySlug: city.slug, areaSlug: area.slug, subAreaSlug, matched: quality }
}
