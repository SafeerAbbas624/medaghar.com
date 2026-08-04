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

/**
 * Longer-form SEO/AEO body copy, rendered after the listings and before the
 * FAQ. Built from live figures plus the city's hand-written note, so no two
 * pages carry the same paragraphs.
 */
export function seoBodyParagraphs(d: TreeDescriptor, stats: LocationStats): string[] {
  const plural = (d.type?.pluralLabel ?? 'properties').toLowerCase()
  const singular = (d.type?.label ?? 'property').toLowerCase()
  const purpose = PURPOSE_LABEL[d.purpose].toLowerCase()
  const place = placeName(d) || 'Pakistan'
  const cityName = d.city?.name ?? 'Pakistan'
  const forRent = d.purpose === 'for-rent'
  const out: string[] = []

  // 1. What is on the page, with real numbers.
  if (stats.count > 0) {
    const range =
      stats.minPrice && stats.maxPrice && stats.minPrice !== stats.maxPrice
        ? ` Asking prices currently run between ${formatPkr(stats.minPrice, forRent)} and ${formatPkr(stats.maxPrice, forRent)}${
            stats.avgPrice ? `, with the average around ${formatPkr(stats.avgPrice, forRent)}` : ''
          }.`
        : ''
    out.push(
      `MedaGhar lists ${stats.count} ${stats.count === 1 ? singular : plural} ${purpose} in ${place}.${range} Every listing is posted free by the owner or their agent, and you contact them directly — MedaGhar charges no commission on either side of the deal.`
    )
  } else {
    out.push(
      `No ${plural} are listed ${purpose} in ${place} at the moment. Listing on MedaGhar is free, so if you have a ${singular} here you can be the first to post it — or browse the nearby areas linked above.`
    )
  }

  // 2. Local market context — the city's hand-written note.
  if (d.city?.marketNote) out.push(d.city.marketNote)

  // 3. Practical buying/renting guidance, tailored to purpose.
  if (forRent) {
    out.push(
      `When renting in ${cityName}, expect to pay an advance of two to three months' rent plus a security deposit, and agree the annual increment in writing before you sign. Ask whether the rent includes society maintenance, and confirm the electricity and gas meters are in the landlord's name with no outstanding dues. A written rent agreement registered with the police station protects both sides.`
    )
  } else {
    out.push(
      `Before you commit to a ${singular} in ${cityName}, verify the title documents — ask for the registry or allotment letter, a fresh fard (record of rights) and an NOC from the society or development authority. Confirm there are no outstanding development charges or utility dues, and always transfer through the society office or sub-registrar rather than on a plain-paper agreement.`
    )
  }

  // 4. How to use the page.
  out.push(
    `Use the filters on this page to narrow by price, size in marla or kanal, and number of bedrooms. Featured listings appear at the top of every page of results. Save the searches you return to, and use the free calculators to work out your instalments, transfer taxes and expected rental yield before you make an offer.`
  )

  return out
}

/**
 * Longer FAQ set for listing pages — questions Pakistani buyers and renters
 * actually ask, answered with this page's live numbers where relevant.
 */
export function listingPageFaqs(
  d: TreeDescriptor,
  stats: LocationStats
): { question: string; answer: string }[] {
  const plural = (d.type?.pluralLabel ?? 'properties').toLowerCase()
  const singular = (d.type?.label ?? 'property').toLowerCase()
  const purpose = PURPOSE_LABEL[d.purpose].toLowerCase()
  const place = placeName(d) || 'Pakistan'
  const cityName = d.city?.name ?? 'Pakistan'
  const forRent = d.purpose === 'for-rent'

  const faqs = nodeFaqs(d, stats)

  if (forRent) {
    faqs.push({
      question: `How much advance is normally required to rent in ${cityName}?`,
      answer:
        'Landlords in Pakistan typically ask for two to three months of rent as advance, sometimes with a separate refundable security deposit. The amount is negotiable, and it should be written into the rent agreement along with the yearly increment — commonly 10% per year.',
    })
    faqs.push({
      question: `What should a rent agreement include?`,
      answer:
        'Names and CNIC numbers of both parties, the monthly rent and advance, the lease period and annual increment, who pays utilities and society maintenance, and the notice period for vacating. Register it at the local police station — it is inexpensive and protects both tenant and landlord if a dispute arises.',
    })
  } else {
    faqs.push({
      question: `What documents should I check before buying a ${singular} in ${cityName}?`,
      answer:
        'Ask for the registry or allotment letter, a recent fard (record of rights) from the revenue office, an NOC from the society or development authority, and receipts showing development charges and utility bills are clear. Verify the seller\'s CNIC matches the title, and complete the transfer at the society office or sub-registrar — never on a plain-paper agreement.',
    })
    faqs.push({
      question: `What taxes apply when buying property in Pakistan?`,
      answer:
        'Buyers pay advance tax under section 236K, plus provincial stamp duty and registration fees that vary by province. Filers pay a significantly lower rate than non-filers, so being on the FBR active taxpayer list before the transaction is worth arranging. Our property tax calculator estimates the total for your province.',
    })
  }

  faqs.push({
    question: `Can I contact the owner directly, without an agent?`,
    answer:
      'Yes. Listings marked "No Commission" are posted by the owner themselves, and you deal with them directly. On every listing you can message the poster through the site, or sign in to reveal their phone number. MedaGhar takes no commission whichever route you use.',
  })

  faqs.push({
    question: `Is it free to post a ${singular} on MedaGhar?`,
    answer:
      'Yes. Posting is free for everyone. A personal account can keep 2 active listings for sale and 2 for rent at a time; agent accounts can keep 10 of each. Marking a property as sold or rented frees the slot up again.',
  })

  return faqs
}
