/**
 * Page copy for tree nodes.
 *
 * Area and sub-area entries in the taxonomy carry only slug + name, so their
 * pages would otherwise be boilerplate. Uniqueness comes from live data —
 * counts, price ranges, per-marla figures — which differ per page and change
 * over time. City pages additionally have hand-written intro/marketNote.
 */

import { formatPkr } from '@/lib/seo'
import type { LocationStats } from '@/lib/listingCounts'
import type { TreeDescriptor } from '@/lib/tree/parseSegments'
import { PURPOSE_LABEL } from '@/lib/taxonomy'

/** "Houses for Sale in DHA Defence, Lahore" */
export function nodeHeading(d: TreeDescriptor): string {
  const label = d.type?.pluralLabel ?? 'Property'
  const purpose = PURPOSE_LABEL[d.purpose]
  const place = placeName(d)
  return place ? `${label} ${purpose} in ${place}` : `${label} ${purpose} in Pakistan`
}

/** "Phase 6, DHA Defence, Lahore" — most specific first. */
export function placeName(d: TreeDescriptor): string {
  return [d.subArea?.name, d.area?.name, d.city?.name].filter(Boolean).join(', ')
}

/** Shorter form for titles: "DHA Defence, Lahore". */
export function shortPlaceName(d: TreeDescriptor): string {
  if (d.subArea && d.area) return `${d.subArea.name}, ${d.area.name}`
  if (d.area && d.city) return `${d.area.name}, ${d.city.name}`
  return d.city?.name ?? 'Pakistan'
}

/**
 * Meta description. Leads with the live count and price range so every page
 * differs from its siblings even before any hand-written copy exists.
 */
export function metaDescription(d: TreeDescriptor, stats: LocationStats): string {
  const plural = (d.type?.pluralLabel ?? 'properties').toLowerCase()
  const label = stats.count === 1 ? (d.type?.label ?? 'property').toLowerCase() : plural
  const purpose = PURPOSE_LABEL[d.purpose].toLowerCase()
  const place = placeName(d) || 'Pakistan'
  const forRent = d.purpose === 'for-rent'

  if (stats.count === 0) {
    return `Browse ${plural} ${purpose} in ${place} on MedaGhar. Free listings, direct contact with owners and agents, no commission.`
  }

  const range =
    stats.minPrice && stats.maxPrice && stats.minPrice !== stats.maxPrice
      ? ` from ${formatPkr(stats.minPrice, forRent)} to ${formatPkr(stats.maxPrice, forRent)}`
      : stats.minPrice
        ? ` from ${formatPkr(stats.minPrice, forRent)}`
        : ''

  return `${stats.count} ${label} ${purpose} in ${place}${range}. Compare prices, view photos and contact owners directly on MedaGhar — free listings, no commission.`
}

/** Page <title>. The layout template is "%s", so include the suffix. */
export function pageTitle(d: TreeDescriptor, stats: LocationStats): string {
  // "1 House for Sale", not "1 Houses for Sale".
  const label =
    stats.count === 1 ? (d.type?.label ?? 'Property') : (d.type?.pluralLabel ?? 'Property')
  const purpose = PURPOSE_LABEL[d.purpose]
  const place = placeName(d)
  const prefix = stats.count > 0 ? `${stats.count} ` : ''
  return place
    ? `${prefix}${label} ${purpose} in ${place} | MedaGhar`
    : `${d.type?.pluralLabel ?? 'Property'} ${purpose} in Pakistan | MedaGhar`
}

/**
 * The intro paragraph. City pages get their hand-written copy; deeper pages
 * get a sentence built from live figures, which is genuinely distinct per page.
 */
export function introParagraph(d: TreeDescriptor, stats: LocationStats): string {
  if (d.level === 'city' && d.city) return d.city.intro
  if (d.level === 'type' || d.level === 'root') return ''

  const plural = (d.type?.pluralLabel ?? 'properties').toLowerCase()
  const label = stats.count === 1 ? (d.type?.label ?? 'property').toLowerCase() : plural
  const purpose = PURPOSE_LABEL[d.purpose].toLowerCase()
  const place = placeName(d)
  const forRent = d.purpose === 'for-rent'

  if (stats.count === 0) {
    return `There are no ${plural} ${purpose} listed in ${place} yet. Listings here are free — be the first to post one, or browse nearby areas below.`
  }

  const bits: string[] = [
    `MedaGhar currently lists ${stats.count} ${label} ${purpose} in ${place}.`,
  ]

  if (stats.minPrice && stats.maxPrice && stats.minPrice !== stats.maxPrice) {
    bits.push(
      `Asking prices run from ${formatPkr(stats.minPrice, forRent)} to ${formatPkr(stats.maxPrice, forRent)}`
    )
    if (stats.avgPrice) bits.push(`with an average around ${formatPkr(stats.avgPrice, forRent)}.`)
    else bits.push('.')
  }

  if (d.city?.marketNote && d.level !== 'city') bits.push(d.city.marketNote)

  return bits.join(' ').replace(/ \./g, '.')
}

/** FAQ entries whose answers embed live numbers, so they aren't boilerplate. */
export function nodeFaqs(
  d: TreeDescriptor,
  stats: LocationStats
): { question: string; answer: string }[] {
  const label = (d.type?.pluralLabel ?? 'properties').toLowerCase()
  const singular = (d.type?.label ?? 'property').toLowerCase()
  const purpose = PURPOSE_LABEL[d.purpose].toLowerCase()
  const place = placeName(d) || 'Pakistan'
  const forRent = d.purpose === 'for-rent'

  const faqs: { question: string; answer: string }[] = []

  faqs.push({
    question: `How many ${label} are ${purpose} in ${place}?`,
    answer:
      stats.count > 0
        ? `MedaGhar lists ${stats.count} ${label} ${purpose} in ${place} right now. Listings update as owners and agents post, so check back for new additions.`
        : `There are no ${label} ${purpose} in ${place} on MedaGhar yet. Posting a listing is free.`,
  })

  if (stats.minPrice && stats.maxPrice) {
    faqs.push({
      question: `What is the price of a ${singular} ${purpose} in ${place}?`,
      answer: `Listed ${label} in ${place} range from ${formatPkr(stats.minPrice, forRent)} to ${formatPkr(stats.maxPrice, forRent)}${
        stats.avgPrice ? `, averaging about ${formatPkr(stats.avgPrice, forRent)}` : ''
      }. Actual prices depend on plot size, condition and exact location.`,
    })
  }

  faqs.push({
    question: `Does MedaGhar charge commission on ${place} listings?`,
    answer:
      'No. MedaGhar is free for both owners and buyers — you contact the owner or agent directly and we take no commission on any transaction.',
  })

  return faqs
}
