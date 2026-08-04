import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import Breadcrumbs from '@/components/tree/Breadcrumbs'
import LocationLinkGrid, { type LocationLink } from '@/components/tree/LocationLinkGrid'
import FilterSidebar from '@/components/listing/FilterSidebar'
import ResultsView from '@/components/listing/ResultsView'
import PostPropertyCta from '@/components/listing/PostPropertyCta'
import FaqSection from '@/components/listing/FaqSection'
import { absoluteUrl, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo'
import { formatPkr } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { citiesWithInventory, countFor } from '@/lib/listingCounts'
import {
  typesForCategory,
  supportsAreaDepth,
  PURPOSE_LABEL,
  type Category,
  type Purpose,
} from '@/lib/taxonomy'
import { buildTreeUrl } from '@/lib/tree/urls'
import { CITIES } from '@/lib/locations'
import type { ListingType } from '@prisma/client'

const PAGE_SIZE = 50

const SELECT = {
  id: true, slug: true, title: true, address: true, city: true, province: true,
  area: true, subArea: true, price: true, bedrooms: true, bathrooms: true,
  squareFeet: true, marla: true, kanal: true, propertyType: true, listingType: true,
  description: true, listedDate: true, isFeatured: true, isVerified: true, isFSBO: true,
  pkEstimate: true, rentEstimate: true,
  images: { select: { url: true }, orderBy: { order: 'asc' as const }, take: 1 },
} as const

interface Props {
  category: Category
  purpose: Purpose
  listingType: ListingType
  title: string
  intro: string
  path: string
  searchParams: Record<string, string | undefined>
}

/**
 * A category hub: /residential-for-sale, /commercial-for-rent, etc.
 *
 * Uses the same filters/results/CTA/copy/FAQ layout as every other listing
 * page — it previously showed only link grids and no listings at all.
 */
export default async function CategoryHub({
  category,
  purpose,
  listingType,
  title,
  intro,
  path,
  searchParams: sp,
}: Props) {
  const types = typesForCategory(category)
  const typeEnums = types.flatMap((t) => t.types)
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  // Every listing in this category, plus any query-string refinements.
  const where: Record<string, unknown> = {
    status: 'ACTIVE',
    listingType,
    propertyType: { in: typeEnums },
  }
  if (sp.citySlug) where.citySlug = sp.citySlug
  if (sp.areaSlug) where.areaSlug = sp.areaSlug
  if (sp.subAreaSlug) where.subAreaSlug = sp.subAreaSlug
  if (sp.bedrooms) where.bedrooms = { gte: parseInt(sp.bedrooms, 10) }
  if (sp.bathrooms) where.bathrooms = { gte: parseFloat(sp.bathrooms) }

  const price: Record<string, number> = {}
  if (sp.minPrice) price.gte = parseFloat(sp.minPrice)
  if (sp.maxPrice) price.lte = parseFloat(sp.maxPrice)
  if (Object.keys(price).length) where.price = price

  const marla: Record<string, number> = {}
  if (sp.minMarla) marla.gte = parseFloat(sp.minMarla)
  if (sp.maxMarla) marla.lte = parseFloat(sp.maxMarla)
  if (Object.keys(marla).length) where.marla = marla

  const [listings, total, featured] = await Promise.all([
    prisma.property.findMany({
      where,
      select: SELECT,
      orderBy: [{ listedDate: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.property.count({ where }),
    prisma.property.findMany({
      where: { ...where, isFeatured: true },
      select: SELECT,
      orderBy: [{ listedDate: 'desc' }],
      take: 3,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Type and city link grids, pruned to those with inventory.
  const typeLinks: LocationLink[] = []
  const cityTotals = new Map<string, number>()

  for (const t of types) {
    const count = await countFor({ listingType, types: t.types })
    if (count > 0) {
      typeLinks.push({
        name: `${t.pluralLabel} ${PURPOSE_LABEL[purpose]}`,
        count,
        href: buildTreeUrl({ purpose, typeSlug: t.slug }),
      })
    }
    const cities = await citiesWithInventory(t, listingType)
    for (const [slug, n] of cities) cityTotals.set(slug, (cityTotals.get(slug) ?? 0) + n)
  }
  typeLinks.sort((a, b) => b.count - a.count)

  const cityLinks: LocationLink[] = CITIES.filter((c) => (cityTotals.get(c.slug) ?? 0) > 0)
    .map((c) => ({
      name: c.name,
      count: cityTotals.get(c.slug)!,
      href: buildTreeUrl({ purpose, typeSlug: 'property', citySlug: c.slug }),
    }))
    .sort((a, b) => b.count - a.count)

  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) if (v && k !== 'page') qs.set(k, v)

  const forRent = purpose === 'for-rent'
  const priced = listings.filter((l) => l.price > 0).map((l) => l.price)
  const low = priced.length ? Math.min(...priced) : null
  const high = priced.length ? Math.max(...priced) : null
  const other =
    category === 'residential'
      ? forRent ? '/residential-for-sale' : '/residential-for-rent'
      : forRent ? '/commercial-for-sale' : '/commercial-for-rent'

  const faqs = buildFaqs(category, purpose, total, low, high, forRent)

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          collectionPageJsonLd({ name: title, description: intro, path, itemCount: total }),
          ...(listings.length > 0
            ? [itemListJsonLd(listings as never, (page - 1) * PAGE_SIZE + 1)]
            : []),
        ]}
      />

      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[26px] lg:py-[34px]">
          <div className="mb-[16px] [&_a]:text-slate-300 [&_a:hover]:text-white [&_span]:text-white [&_.text-gray-600]:text-slate-300">
            <Breadcrumbs
              items={[
                { name: 'Home', path: '/' },
                { name: title.replace(' in Pakistan', ''), path },
              ]}
            />
          </div>
          <h1 className="text-[24px] lg:text-[34px] font-bold leading-tight">{title}</h1>
          <p className="text-[15px] text-slate-300 mt-[8px]">
            {total > 0
              ? `${total.toLocaleString()} ${total === 1 ? 'listing' : 'listings'} available`
              : 'No listings here yet'}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-[26px]">
          <div>
            <FilterSidebar
              types={[...typesForCategory('residential'), ...typesForCategory('commercial')].map((t) => ({
                slug: t.slug,
                label: t.pluralLabel,
                category: t.category,
                hasAreaDepth: supportsAreaDepth(t),
              }))}
              initial={{
                purpose: forRent ? 'for-rent' : 'for-sale',
                citySlug: sp.citySlug ?? '',
                areaSlug: sp.areaSlug ?? '',
                minPrice: sp.minPrice ?? '',
                maxPrice: sp.maxPrice ?? '',
                bedrooms: sp.bedrooms ?? '',
                bathrooms: sp.bathrooms ?? '',
              }}
            />
          </div>

          <div className="min-w-0 space-y-[34px]">
            <ResultsView
              listings={listings as never}
              featured={featured as never}
              total={total}
              page={page}
              totalPages={totalPages}
              basePath={path}
              queryString={qs.toString()}
            />

            <AdSlot />

            <LocationLinkGrid title="Browse by property type" links={typeLinks} />
            <LocationLinkGrid title="Browse by city" links={cityLinks} />

            <PostPropertyCta forRent={forRent} />

            <section className="bg-white rounded-2xl shadow-sm p-[21px] lg:p-[34px]">
              <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[16px]">
                About {title.toLowerCase()}
              </h2>
              <div className="space-y-[13px] text-[15px] text-gray-700 leading-relaxed">
                <p>
                  {intro}
                  {total > 0 && low && high && (
                    <> Listings currently range from {formatPkr(low, forRent)} to {formatPkr(high, forRent)}.</>
                  )}
                </p>
                {category === 'residential' ? (
                  <p>
                    Residential property in Pakistan is quoted per marla for plots and houses, and
                    per square foot for apartments. One kanal is twenty marla, and a marla is
                    commonly 225 or 272.25 square feet depending on the city — our{' '}
                    <Link href="/tools/area-converter" className="text-cyan-700 hover:underline">
                      area converter
                    </Link>{' '}
                    handles both. Established addresses like DHA, Bahria Town and Gulberg carry a
                    premium over newer schemes, but newer sectors often appreciate faster.
                  </p>
                ) : (
                  <p>
                    Commercial property is valued on footfall, frontage and approved use. Shops on a
                    main commercial avenue command far more per square foot than a side lane, and an
                    approved ground-plus-four plot is worth more than one restricted to two floors.
                    Confirm the approved building height and commercial NOC with the development
                    authority before you commit.
                  </p>
                )}
                <p>
                  {forRent
                    ? 'Expect to pay two to three months’ rent in advance plus a security deposit, and agree the annual increment in writing. Confirm whether society maintenance and utilities are included, and register the rent agreement at the local police station.'
                    : 'Before buying, ask for the registry or allotment letter, a fresh fard from the revenue office, and an NOC confirming development charges are clear. Complete the transfer at the society office or sub-registrar, never on a plain-paper agreement.'}{' '}
                  Our{' '}
                  <Link href="/guides" className="text-cyan-700 hover:underline">
                    property guides
                  </Link>{' '}
                  cover the full procedure.
                </p>
                <p>
                  Looking to {forRent ? 'buy' : 'rent'} instead?{' '}
                  <Link href={other} className="text-cyan-700 hover:underline font-medium">
                    Browse {category} property {forRent ? 'for sale' : 'for rent'} →
                  </Link>
                </p>
              </div>
            </section>

            <FaqSection faqs={faqs} />
          </div>
        </div>
      </div>
    </main>
  )
}

function buildFaqs(
  category: Category,
  purpose: Purpose,
  total: number,
  low: number | null,
  high: number | null,
  forRent: boolean
) {
  const label = category === 'residential' ? 'residential' : 'commercial'
  const faqs: { question: string; answer: string }[] = [
    {
      question: `How many ${label} properties are listed ${PURPOSE_LABEL[purpose].toLowerCase()} on MedaGhar?`,
      answer:
        total > 0
          ? `There are ${total} ${label} ${total === 1 ? 'property' : 'properties'} listed ${PURPOSE_LABEL[purpose].toLowerCase()} right now${
              low && high ? `, ranging from ${formatPkr(low, forRent)} to ${formatPkr(high, forRent)}` : ''
            }. New listings are added daily by owners and agents.`
          : `No ${label} properties are listed ${PURPOSE_LABEL[purpose].toLowerCase()} yet. Posting is free — you can be the first.`,
    },
  ]

  if (category === 'residential') {
    faqs.push({
      question: 'What is the difference between marla and kanal?',
      answer:
        'One kanal equals 20 marla. A marla is 225 square feet under the older standard used in most of Punjab, or 272.25 square feet under the newer one — always confirm which applies in the society you are buying in. A 10 marla plot is half a kanal, and a 1 kanal plot is the most common upper-middle-class house size.',
    })
    faqs.push({
      question: forRent
        ? 'What is the difference between an upper portion and a full house?'
        : 'Should I buy a plot or a built house?',
      answer: forRent
        ? 'An upper or lower portion is one floor of a house rented separately, usually with its own entrance and utility meters. It costs considerably less than renting the whole house and is the most common rental arrangement for small families in Pakistani cities.'
        : 'A plot costs less up front and lets you build to your own requirement, but construction takes 12–18 months and costs are rising. A built house gives immediate possession and rental income. Plots in developing sectors tend to appreciate faster; built houses in established areas hold value more reliably.',
    })
  } else {
    faqs.push({
      question: 'What should I check before buying commercial property?',
      answer:
        'Confirm the approved use and permitted building height with the development authority, check the commercial NOC, and verify there are no outstanding commercialisation fees. Frontage and footfall drive value far more than total area — a small shop on a main boulevard often out-earns a larger one in a side lane.',
    })
    faqs.push({
      question: 'What rental yield is normal for commercial property in Pakistan?',
      answer:
        'Commercial property typically yields 5–8% gross annually, noticeably higher than residential, which usually sits around 3–5%. Yields vary widely by location and tenant quality — use our rental yield calculator to work out the net figure after maintenance and vacancy.',
    })
  }

  faqs.push({
    question: 'Does MedaGhar charge commission?',
    answer:
      'No. Listing is free and we take no commission from either side. You contact the owner or agent directly. A personal account can keep 2 active listings for sale and 2 for rent; agent accounts can keep 10 of each.',
  })

  return faqs
}

/** Shared metadata builder for the four hubs. */
export function hubMetadata(title: string, intro: string, path: string) {
  return {
    title: `${title} | MedaGhar`,
    description: intro,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description: intro,
      url: absoluteUrl(path),
      type: 'website' as const,
      siteName: 'MedaGhar',
    },
    twitter: { card: 'summary_large_image' as const, title, description: intro },
  }
}
