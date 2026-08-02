import type { City, Area, SubArea } from '@/content/locations/types'
import punjab from '@/content/locations/punjab'
import sindhBalochistan from '@/content/locations/sindh-balochistan'
import kpkIctNorth from '@/content/locations/kpk-ict-north'

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
