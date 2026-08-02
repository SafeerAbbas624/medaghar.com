/**
 * Parses the catch-all segments of a tree route into a validated descriptor.
 *
 *   /for-sale                            -> root
 *   /for-sale/house                      -> type
 *   /for-sale/house/lahore               -> city
 *   /for-sale/house/lahore/dha-defence   -> area
 *   /for-sale/house/lahore/dha-defence/phase-6 -> subarea
 *
 * Segments are validated positionally against their own vocabulary, so a slug
 * that exists in two vocabularies (e.g. `cantt` is an area in several cities)
 * is never ambiguous.
 *
 * Anything that does not validate returns null, which callers turn into a hard
 * 404. That distinction matters: an unknown slug is a real 404, whereas a valid
 * location with no listings is a rendered page that happens to be noindex.
 */

import { getArea, getCity, getSubArea, type Area, type City, type SubArea } from '@/lib/locations'
import {
  getTypeDef,
  resolveTypeAlias,
  supportsAreaDepth,
  type Purpose,
  type TypeDef,
} from '@/lib/taxonomy'
import type { TreeLevel } from '@/lib/tree/gating'

export interface TreeDescriptor {
  purpose: Purpose
  level: TreeLevel
  type?: TypeDef
  city?: City
  area?: Area
  subArea?: SubArea
}

export type ParseResult =
  | { kind: 'ok'; descriptor: TreeDescriptor }
  /** The first segment was a type alias; caller should 301 to `canonical`. */
  | { kind: 'redirect'; canonical: string }
  | { kind: 'notFound' }

/**
 * @param purpose  which tree we are in
 * @param segments the catch-all segments (undefined at the tree root)
 */
export function parseTreeSegments(
  purpose: Purpose,
  segments?: string[]
): ParseResult {
  const parts = (segments ?? []).filter(Boolean).map((s) => s.toLowerCase())

  if (parts.length === 0) {
    return { kind: 'ok', descriptor: { purpose, level: 'root' } }
  }

  // Deeper than /purpose/type/city/area/subarea is never valid.
  if (parts.length > 4) return { kind: 'notFound' }

  // --- 1. type -------------------------------------------------------------
  const [typeSlug, citySlug, areaSlug, subAreaSlug] = parts

  const alias = resolveTypeAlias(typeSlug)
  if (alias) {
    const rest = parts.slice(1)
    return {
      kind: 'redirect',
      canonical: '/' + [purpose, alias, ...rest].join('/'),
    }
  }

  const type = getTypeDef(typeSlug)
  if (!type) return { kind: 'notFound' }

  if (parts.length === 1) {
    return { kind: 'ok', descriptor: { purpose, level: 'type', type } }
  }

  // --- 2. city -------------------------------------------------------------
  const city = getCity(citySlug)
  if (!city) return { kind: 'notFound' }

  if (parts.length === 2) {
    return { kind: 'ok', descriptor: { purpose, level: 'city', type, city } }
  }

  // Tier B types stop at city; the FSBO tree stops at city as well, since a
  // deeper /owner/ mirror would near-duplicate the main tree.
  if (!supportsAreaDepth(type) || purpose === 'owner') return { kind: 'notFound' }

  // --- 3. area -------------------------------------------------------------
  const area = getArea(city, areaSlug)
  if (!area) return { kind: 'notFound' }

  if (parts.length === 3) {
    return { kind: 'ok', descriptor: { purpose, level: 'area', type, city, area } }
  }

  // --- 4. subarea ----------------------------------------------------------
  // Only the ~30 areas that genuinely have blocks/phases accept this level.
  const subArea = getSubArea(area, subAreaSlug)
  if (!subArea) return { kind: 'notFound' }

  return { kind: 'ok', descriptor: { purpose, level: 'subarea', type, city, area, subArea } }
}
