/**
 * Shared data-loading for the three tree routes (for-sale, for-rent, owner).
 *
 * Keeping this in one place means the three `page.tsx` files stay thin and
 * their metadata/gating logic can never drift apart.
 */

import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { statsFor, areasWithInventory, subAreasWithInventory, citiesWithInventory, countFor } from '@/lib/listingCounts'
import { getListingsForNode } from '@/lib/tree/queries'
import { robotsFor } from '@/lib/tree/gating'
import { buildTreeUrl } from '@/lib/tree/urls'
import { metaDescription, pageTitle } from '@/lib/tree/copy'
import { getCity, CITIES } from '@/lib/locations'
import {
  hubFor,
  listingTypeForPurpose,
  typesForCategory,
  ALL_TYPES_SLUG,
  PURPOSE_LABEL,
  type Purpose,
} from '@/lib/taxonomy'
import type { TreeDescriptor } from '@/lib/tree/parseSegments'
import type { Crumb } from '@/components/tree/Breadcrumbs'
import type { LocationLink } from '@/components/tree/LocationLinkGrid'

/** Canonical path for a descriptor. */
export function canonicalFor(d: TreeDescriptor): string {
  return buildTreeUrl({
    purpose: d.purpose,
    typeSlug: d.type?.slug,
    citySlug: d.city?.slug,
    areaSlug: d.area?.slug,
    subAreaSlug: d.subArea?.slug,
  })
}

/** Metadata: canonical, robots (gated on live counts), OG/Twitter. */
export async function metadataFor(d: TreeDescriptor): Promise<Metadata> {
  const listingType = listingTypeForPurpose(d.purpose)
  const stats = await statsFor({
    listingType,
    types: d.type?.types,
    citySlug: d.city?.slug,
    areaSlug: d.area?.slug,
    subAreaSlug: d.subArea?.slug,
    fsboOnly: d.purpose === 'owner',
  })

  const path = canonicalFor(d)
  const url = absoluteUrl(path)
  const title = pageTitle(d, stats)
  const description = metaDescription(d, stats)

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: robotsFor(d.level, stats.count),
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'MedaGhar',
      images: [{ url: absoluteUrl('/og-default.jpg'), width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export interface TreePageData {
  stats: Awaited<ReturnType<typeof statsFor>>
  listings: Awaited<ReturnType<typeof getListingsForNode>>
  breadcrumbs: Crumb[]
  childLinks: LocationLink[]
  childTitle: string
  siblingTypes: LocationLink[]
  canonicalPath: string
}

/** Everything TreePage needs, in one call. */
export async function loadTreePage(d: TreeDescriptor, page = 1): Promise<TreePageData> {
  const listingType = listingTypeForPurpose(d.purpose)
  const fsboOnly = d.purpose === 'owner'

  const [stats, listings] = await Promise.all([
    statsFor({
      listingType,
      types: d.type?.types,
      citySlug: d.city?.slug,
      areaSlug: d.area?.slug,
      subAreaSlug: d.subArea?.slug,
      fsboOnly,
    }),
    getListingsForNode(d, page),
  ])

  const { childLinks, childTitle } = await loadChildren(d)
  const siblingTypes = await loadSiblingTypes(d)

  return {
    stats,
    listings,
    breadcrumbs: buildCrumbs(d),
    childLinks,
    childTitle,
    siblingTypes,
    canonicalPath: canonicalFor(d),
  }
}

/** Child locations that actually have inventory (gated pages aren't linked). */
async function loadChildren(
  d: TreeDescriptor
): Promise<{ childLinks: LocationLink[]; childTitle: string }> {
  const listingType = listingTypeForPurpose(d.purpose)
  if (!d.type) return { childLinks: [], childTitle: '' }

  // Type root -> cities
  if (d.level === 'type') {
    const counts = await citiesWithInventory(d.type, listingType, d.purpose === 'owner')
    const links: LocationLink[] = []
    for (const city of CITIES) {
      const count = counts.get(city.slug) ?? 0
      if (count === 0) continue
      links.push({
        name: city.name,
        count,
        href: buildTreeUrl({ purpose: d.purpose, typeSlug: d.type.slug, citySlug: city.slug }),
      })
    }
    links.sort((a, b) => b.count - a.count)
    return { childLinks: links, childTitle: `${d.type.pluralLabel} by city` }
  }

  // City -> areas (only for types that support area depth, and not in /owner)
  if (d.level === 'city' && d.city && d.type.tier === 'A' && d.purpose !== 'owner') {
    const counts = await areasWithInventory(d.city.slug, d.type, listingType)
    const links: LocationLink[] = []
    for (const area of d.city.areas) {
      const count = counts.get(area.slug) ?? 0
      if (count === 0) continue
      links.push({
        name: area.name,
        count,
        href: buildTreeUrl({
          purpose: d.purpose,
          typeSlug: d.type.slug,
          citySlug: d.city.slug,
          areaSlug: area.slug,
        }),
      })
    }
    links.sort((a, b) => b.count - a.count)
    return { childLinks: links, childTitle: `Areas in ${d.city.name}` }
  }

  // Area -> sub-areas
  if (d.level === 'area' && d.city && d.area) {
    const counts = await subAreasWithInventory(d.city.slug, d.area.slug, d.type, listingType)
    const links: LocationLink[] = []
    for (const sub of d.area.subAreas ?? []) {
      const count = counts.get(sub.slug) ?? 0
      if (count === 0) continue
      links.push({
        name: sub.name,
        count,
        href: buildTreeUrl({
          purpose: d.purpose,
          typeSlug: d.type.slug,
          citySlug: d.city.slug,
          areaSlug: d.area.slug,
          subAreaSlug: sub.slug,
        }),
      })
    }
    links.sort((a, b) => b.count - a.count)
    return { childLinks: links, childTitle: `Blocks and phases in ${d.area.name}` }
  }

  return { childLinks: [], childTitle: '' }
}

/** Other property types available in the same location. */
async function loadSiblingTypes(d: TreeDescriptor): Promise<LocationLink[]> {
  if (!d.city || !d.type) return []
  const listingType = listingTypeForPurpose(d.purpose)

  const candidates = [
    ...typesForCategory('residential'),
    ...typesForCategory('commercial'),
  ].filter((t) => t.slug !== d.type!.slug)

  const links: LocationLink[] = []
  for (const t of candidates) {
    const count = await countFor({
      listingType,
      types: t.types,
      citySlug: d.city.slug,
      fsboOnly: d.purpose === 'owner',
    })
    if (count === 0) continue
    links.push({
      name: `${t.pluralLabel} in ${d.city.name}`,
      count,
      href: buildTreeUrl({ purpose: d.purpose, typeSlug: t.slug, citySlug: d.city.slug }),
    })
  }
  links.sort((a, b) => b.count - a.count)
  return links.slice(0, 8)
}

/** Home > Hub > Type > City > Area > Sub-area */
function buildCrumbs(d: TreeDescriptor): Crumb[] {
  const crumbs: Crumb[] = [{ name: 'Home', path: '/' }]

  if (d.type) {
    const hub = hubFor(d.type.category, d.purpose)
    crumbs.push({ name: hub.title.replace(' in Pakistan', ''), path: hub.path })
    crumbs.push({
      name: `${d.type.pluralLabel} ${PURPOSE_LABEL[d.purpose]}`,
      path: buildTreeUrl({ purpose: d.purpose, typeSlug: d.type.slug }),
    })
  }

  if (d.city && d.type) {
    crumbs.push({
      name: d.city.name,
      path: buildTreeUrl({ purpose: d.purpose, typeSlug: d.type.slug, citySlug: d.city.slug }),
    })
  }
  if (d.area && d.city && d.type) {
    crumbs.push({
      name: d.area.name,
      path: buildTreeUrl({
        purpose: d.purpose,
        typeSlug: d.type.slug,
        citySlug: d.city.slug,
        areaSlug: d.area.slug,
      }),
    })
  }
  if (d.subArea && d.area && d.city && d.type) {
    crumbs.push({
      name: d.subArea.name,
      path: buildTreeUrl({
        purpose: d.purpose,
        typeSlug: d.type.slug,
        citySlug: d.city.slug,
        areaSlug: d.area.slug,
        subAreaSlug: d.subArea.slug,
      }),
    })
  }

  return crumbs
}

/**
 * Seed paths to prerender at build. Deliberately small: the tree has ~11k
 * possible pages and most are empty today, so the rest render on demand.
 */
export function seedStaticParams(purpose: Purpose): { segments: string[] }[] {
  const topCities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan']
  const topTypes = purpose === 'owner' ? ['house', 'flat', 'plot'] : ['house', 'flat', 'plot', 'shop']

  const out: { segments: string[] }[] = [{ segments: [ALL_TYPES_SLUG] }]
  for (const t of topTypes) {
    out.push({ segments: [t] })
    for (const c of topCities) {
      if (getCity(c)) out.push({ segments: [t, c] })
    }
  }
  return out
}
