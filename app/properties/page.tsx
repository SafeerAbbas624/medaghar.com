import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import FilterSidebar from '@/components/listing/FilterSidebar'
import ResultsView from '@/components/listing/ResultsView'
import PostPropertyCta from '@/components/listing/PostPropertyCta'
import FaqSection from '@/components/listing/FaqSection'
import Breadcrumbs from '@/components/tree/Breadcrumbs'
import { typesForCategory, supportsAreaDepth } from '@/lib/taxonomy'
import { formatPkr } from '@/lib/format'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Search Property in Pakistan | MedaGhar',
  description:
    'Search every property listed on MedaGhar — houses, flats, plots, shops and offices for sale and rent across Pakistan. Free listings, no commission.',
  // Duplicates the SEO tree, so it stays out of the index while still
  // passing link equity through to the listings it shows.
  robots: { index: false, follow: true },
}

const PAGE_SIZE = 50

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

function filterTypes() {
  return [...typesForCategory('residential'), ...typesForCategory('commercial')].map((t) => ({
    slug: t.slug,
    label: t.pluralLabel,
    category: t.category,
    hasAreaDepth: supportsAreaDepth(t),
  }))
}

const SELECT = {
  id: true, slug: true, title: true, address: true, city: true, province: true,
  area: true, subArea: true, price: true, bedrooms: true, bathrooms: true,
  squareFeet: true, marla: true, kanal: true, propertyType: true, listingType: true,
  description: true, listedDate: true, isFeatured: true, isVerified: true, isFSBO: true,
  pkEstimate: true, rentEstimate: true,
  images: { select: { url: true }, orderBy: { order: 'asc' as const }, take: 1 },
} as const

/**
 * The in-app faceted search.
 *
 * Server-rendered: it previously fetched client-side, so the HTML contained
 * zero listings — invisible to crawlers and blank on slow connections. Kept
 * noindex because it duplicates the tree, but it is the SearchAction target
 * and the saved-search destination, so it has to work properly.
 */
export default async function PropertiesPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const where: Record<string, unknown> = { status: 'ACTIVE' }
  if (sp.citySlug) where.citySlug = sp.citySlug
  if (sp.areaSlug) where.areaSlug = sp.areaSlug
  if (sp.subAreaSlug) where.subAreaSlug = sp.subAreaSlug
  if (sp.city) where.city = { contains: sp.city, mode: 'insensitive' }
  if (sp.listingType) where.listingType = sp.listingType
  if (sp.isFSBO === 'true') where.isFSBO = true
  if (sp.propertyType) where.propertyType = sp.propertyType
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

  // Free-text search across the fields a visitor would type into the hero box.
  if (sp.search || sp.q) {
    const term = (sp.search || sp.q)!.trim()
    if (term) {
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
        { area: { contains: term, mode: 'insensitive' } },
        { subArea: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ]
    }
  }

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

  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) if (v && k !== 'page') qs.set(k, v)

  const forRent = sp.listingType === 'FOR_RENT'
  const priced = listings.filter((l) => l.price > 0).map((l) => l.price)
  const low = priced.length ? Math.min(...priced) : null
  const high = priced.length ? Math.max(...priced) : null

  const faqs = [
    {
      question: 'How do I search for property on MedaGhar?',
      answer:
        'Use the filters on the left to narrow by purpose, property type, city, area, price and size. Every filter that has its own page — like houses for sale in Lahore — takes you to that page, so you can bookmark or share the result.',
    },
    {
      question: 'Does MedaGhar charge any fee or commission?',
      answer:
        'No. Searching is free, posting a listing is free, and we take no commission from either side of a transaction. You deal directly with the owner or their agent.',
    },
    {
      question: 'How many properties can I list?',
      answer:
        'A personal account can keep 2 active listings for sale and 2 for rent at a time. Agent accounts can keep 10 of each. Marking a property sold or rented frees the slot again.',
    },
    {
      question: 'How do I contact the seller or landlord?',
      answer:
        'Open any listing and use the message button to reach the poster through the site, or sign in to reveal their phone number. Numbers are hidden from signed-out visitors to protect owners from spam.',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[26px] lg:py-[34px]">
          <div className="mb-[16px] [&_a]:text-slate-300 [&_a:hover]:text-white [&_span]:text-white [&_.text-gray-600]:text-slate-300">
            <Breadcrumbs
              items={[
                { name: 'Home', path: '/' },
                { name: 'Search Property', path: '/properties' },
              ]}
            />
          </div>
          <h1 className="text-[24px] lg:text-[34px] font-bold leading-tight">
            Search Property in Pakistan
          </h1>
          <p className="text-[15px] text-slate-300 mt-[8px]">
            {total > 0
              ? `${total.toLocaleString()} ${total === 1 ? 'listing' : 'listings'} match your search`
              : 'No listings match your search'}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-[26px]">
          <div>
            <FilterSidebar
              types={filterTypes()}
              initial={{
                purpose: forRent ? 'for-rent' : 'for-sale',
                citySlug: sp.citySlug ?? '',
                areaSlug: sp.areaSlug ?? '',
                subAreaSlug: sp.subAreaSlug ?? '',
                minPrice: sp.minPrice ?? '',
                maxPrice: sp.maxPrice ?? '',
                bedrooms: sp.bedrooms ?? '',
                bathrooms: sp.bathrooms ?? '',
                fsboOnly: sp.isFSBO === 'true',
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
              basePath="/properties"
              queryString={qs.toString()}
            />

            <PostPropertyCta forRent={forRent} />

            <section className="bg-white rounded-2xl shadow-sm p-[21px] lg:p-[34px]">
              <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[16px]">
                About searching property on MedaGhar
              </h2>
              <div className="space-y-[13px] text-[15px] text-gray-700 leading-relaxed">
                <p>
                  MedaGhar lists houses, flats, upper and lower portions, plots, shops, offices,
                  warehouses and farm houses for sale and rent across {' '}
                  <Link href="/residential-for-sale" className="text-cyan-700 hover:underline">
                    every major Pakistani city
                  </Link>
                  . {total > 0 && low && high && (
                    <>
                      The listings on this page range from {formatPkr(low, forRent)} to{' '}
                      {formatPkr(high, forRent)}.
                    </>
                  )}
                </p>
                <p>
                  Filter by city, area and block or phase to narrow to the exact locality — DHA
                  Phase 6 in Lahore, Clifton Block 2 in Karachi, or F-11 Markaz in Islamabad. Sizes
                  are quoted in marla and kanal as they are locally, and prices in lakh and crore.
                </p>
                <p>
                  Before you commit, verify the title documents, confirm development charges and
                  utility dues are clear, and complete the transfer through the society office or
                  sub-registrar. Our{' '}
                  <Link href="/guides" className="text-cyan-700 hover:underline">
                    property guides
                  </Link>{' '}
                  cover transfer procedure, taxes and how to spot a scam, and the{' '}
                  <Link href="/tools" className="text-cyan-700 hover:underline">
                    free calculators
                  </Link>{' '}
                  work out instalments, taxes and rental yield.
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
