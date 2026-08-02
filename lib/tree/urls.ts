/**
 * URL construction for the purpose-first SEO tree.
 *
 *   /{purpose}/{type}/{city}[/{area}[/{subarea}]]
 *
 * All segments are expected to be canonical slugs already (from lib/taxonomy
 * and content/locations), so nothing is slugified here — passing display text
 * is a caller bug, not something to paper over.
 */

import type { Purpose } from '@/lib/taxonomy'
import { hubFor, type Category } from '@/lib/taxonomy'

export interface TreeUrlParts {
  purpose: Purpose
  typeSlug?: string
  citySlug?: string
  areaSlug?: string
  subAreaSlug?: string
}

/**
 * Build a tree URL. Deeper segments are ignored when a shallower one is absent
 * (an area without a city is meaningless), so partial input degrades safely.
 */
export function buildTreeUrl(parts: TreeUrlParts): string {
  const segments: string[] = [parts.purpose]

  if (parts.typeSlug) {
    segments.push(parts.typeSlug)
    if (parts.citySlug) {
      segments.push(parts.citySlug)
      if (parts.areaSlug) {
        segments.push(parts.areaSlug)
        if (parts.subAreaSlug) segments.push(parts.subAreaSlug)
      }
    }
  }

  return '/' + segments.join('/')
}

/** The hub page for a category + purpose, e.g. /residential-for-sale. */
export function buildHubUrl(category: Category, purpose: Purpose): string {
  return hubFor(category, purpose).path
}

/** The FSBO counterpart of a location, e.g. /owner/house/lahore. */
export function buildOwnerUrl(typeSlug?: string, citySlug?: string): string {
  return buildTreeUrl({ purpose: 'owner', typeSlug, citySlug })
}

/** Canonical detail URL for a listing. Flat and stable across status changes. */
export function buildListingUrl(p: { slug?: string | null; id: string }): string {
  return `/properties/${p.slug || p.id}`
}
