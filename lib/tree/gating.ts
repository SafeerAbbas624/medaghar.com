/**
 * Indexability gating for programmatic location pages.
 *
 * A page with too few listings is thin content. Google penalises mass-published
 * near-empty pages ("doorway pages"), so a page below threshold still *renders*
 * — visitors and crawlers can reach it, and it invites the first listing — but
 * it is marked noindex and excluded from sitemaps and link grids.
 *
 * Pages cross the threshold automatically as inventory arrives; with ISR the
 * flip happens within the revalidate window, no deploy required.
 */

import type { Metadata } from 'next'

export type TreeLevel = 'root' | 'type' | 'city' | 'area' | 'subarea'

/**
 * Minimum ACTIVE listings for a level to be indexable.
 *
 * Deeper pages need more: one listing on a whole-city page is arguably useful,
 * one on a specific block page is not.
 */
export const MIN_LISTINGS: Record<TreeLevel, number> = {
  root: 0, // hubs and type roots are curated navigation, always indexable
  type: 0,
  city: 1,
  area: 3,
  subarea: 5,
}

export function isIndexable(level: TreeLevel, listingCount: number): boolean {
  return listingCount >= MIN_LISTINGS[level]
}

/**
 * The `robots` value for a page at this level.
 *
 * Returns undefined (inherit the site default: index, follow) when indexable,
 * and noindex/follow when not — `follow` matters so link equity still flows
 * through to the listings that *are* on the page.
 */
export function robotsFor(level: TreeLevel, listingCount: number): Metadata['robots'] {
  return isIndexable(level, listingCount) ? undefined : { index: false, follow: true }
}

/** Should this URL appear in a sitemap? Same rule as indexability. */
export function inSitemap(level: TreeLevel, listingCount: number): boolean {
  return isIndexable(level, listingCount)
}
