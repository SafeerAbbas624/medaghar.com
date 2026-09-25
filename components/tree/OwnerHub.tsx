import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import Breadcrumbs from '@/components/tree/Breadcrumbs'
import LocationLinkGrid, { type LocationLink } from '@/components/tree/LocationLinkGrid'
import FilterSidebar from '@/components/listing/FilterSidebar'
import ResultsView from '@/components/listing/ResultsView'
import PostPropertyCta from '@/components/listing/PostPropertyCta'
import FaqSection from '@/components/listing/FaqSection'
import { collectionPageJsonLd, itemListJsonLd } from '@/lib/seo'
import { formatPkr } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { citiesWithInventory } from '@/lib/listingCounts'
import { typesForCategory, supportsAreaDepth, getTypeDef, ALL_TYPES_SLUG } from '@/lib/taxonomy'
import { buildTreeUrl } from '@/lib/tree/urls'
import { CITIES } from '@/lib/locations'
import { FaCheckCircle } from 'react-icons/fa'

const PAGE_SIZE = 50
const PATH = '/owner'

const SELECT = {
  id: true, slug: true, title: true, address: true, city: true, province: true,
  area: true, subArea: true, price: true, bedrooms: true, bathrooms: true,
  squareFeet: true, marla: true, kanal: true, propertyType: true, listingType: true,
  description: true, listedDate: true, isFeatured: true, isVerified: true, isFSBO: true,
  pkEstimate: true, rentEstimate: true,
  images: { select: { url: true }, orderBy: { order: 'asc' as const }, take: 1 },
} as const

const TITLE = 'Property for Sale by Owner in Pakistan — No Commission'
const INTRO =
  'Buy and rent directly from property owners across Pakistan. Every listing in this section is posted by the person who owns the property — no agent in the middle, and no commission on either side.'

/**
 * The /owner hub.
 *
 * Uses the same filters/results/CTA/copy/FAQ layout as every other listing
 * page, so a visitor lands on real inventory instead of a link grid. The
 * owner-specific material — the No Commission promise and the posting quota
 * that keeps this section genuinely owner-only — sits between the results and
 * the FAQ.
 */
export default async function OwnerHub({
  searchParams: sp,
}: {
  searchParams: Record<string, string | undefined>
}) {
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const allTypes = getTypeDef(ALL_TYPES_SLUG)!

  const where: Record<string, unknown> = { status: 'ACTIVE', isFSBO: true }
  if (sp.listingType === 'FOR_RENT' || sp.listingType === 'FOR_SALE') {
    where.listingType = sp.listingType
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

  const [listings, total, featured, cityCounts] = await Promise.all([
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
    citiesWithInventory(allTypes, null, true),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const cityLinks: LocationLink[] = CITIES.filter((c) => (cityCounts.get(c.slug) ?? 0) > 0)
    .map((c) => ({
      name: c.name,
      count: cityCounts.get(c.slug)!,
      href: buildTreeUrl({ purpose: 'owner', typeSlug: ALL_TYPES_SLUG, citySlug: c.slug }),
    }))
    .sort((a, b) => b.count - a.count)

  const types = [...typesForCategory('residential'), ...typesForCategory('commercial')].filter(
    (t) => t.tier === 'A'
  )
  const typeLinks: LocationLink[] = types.map((t) => ({
    name: t.pluralLabel,
    count: 0,
    href: buildTreeUrl({ purpose: 'owner', typeSlug: t.slug }),
  }))

  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) if (v && k !== 'page') qs.set(k, v)

  const forRent = sp.listingType === 'FOR_RENT'
  const priced = listings.filter((l) => l.price > 0).map((l) => l.price)
  const low = priced.length ? Math.min(...priced) : null
  const high = priced.length ? Math.max(...priced) : null

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          collectionPageJsonLd({ name: TITLE, description: INTRO, path: PATH, itemCount: total }),
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
                { name: 'By Owner', path: PATH },
              ]}
            />
          </div>
          <span className="inline-flex items-center gap-[8px] bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-[12px] font-semibold px-[13px] py-[5px] rounded-full mb-[13px]">
            <FaCheckCircle className="text-[11px]" /> No Commission
          </span>
          <h1 className="text-[24px] lg:text-[34px] font-bold leading-tight">
            Property for Sale by Owner in Pakistan
          </h1>
          <p className="text-[15px] text-slate-300 mt-[8px]">
            {total > 0
              ? `${total.toLocaleString()} owner ${total === 1 ? 'listing' : 'listings'} available`
              : 'No owner listings here yet'}
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
                fsboOnly: true,
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
              basePath={PATH}
              queryString={qs.toString()}
            />

            <AdSlot />

            {cityLinks.length > 0 && (
              <LocationLinkGrid title="Owner listings by city" links={cityLinks} />
            )}
            <LocationLinkGrid title="Owner listings by property type" links={typeLinks} />

            <PostPropertyCta forRent={forRent} />

            {/* Owner-specific: the quota that keeps this section owner-only. */}
            <section className="bg-white rounded-2xl shadow-sm p-[21px] lg:p-[34px]">
              <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[16px]">
                How we tell owners and agents apart
              </h2>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-[21px]">
                Every account on MedaGhar is either a personal account or a registered agent
                account, and listings are labelled accordingly. Anything posted from a personal
                account carries the{' '}
                <span className="font-semibold text-emerald-700">✓ No Commission</span> badge, so
                you always know before you call whether you are speaking to the owner or to an
                agent.
              </p>
              <div className="grid sm:grid-cols-2 gap-[16px]">
                <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-[21px]">
                  <p className="font-semibold text-gray-900 mb-[8px]">Personal account (owner)</p>
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    Up to <strong>2 active listings for sale</strong> and{' '}
                    <strong>2 for rent</strong> at a time. The limit keeps this section genuinely
                    owner-only — an agent cannot quietly post a hundred listings here. Mark a
                    property sold or rented to free a slot.
                  </p>
                </div>
                <div className="border border-cyan-200 bg-cyan-50/60 rounded-xl p-[21px]">
                  <p className="font-semibold text-gray-900 mb-[8px]">Registered agent account</p>
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    Up to <strong>10 active listings for sale</strong> and{' '}
                    <strong>10 for rent</strong>. Agent listings appear throughout the main site
                    with the agent&apos;s profile, rating and experience shown, but not under this
                    No Commission section.
                  </p>
                </div>
              </div>
              <p className="text-[14px] text-gray-600 mt-[16px]">
                Selling more than a couple of properties?{' '}
                <Link href="/pricing" className="text-cyan-700 hover:underline font-medium">
                  Upgrade to an agent account
                </Link>
                .
              </p>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-[21px] lg:p-[34px]">
              <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[16px]">
                About buying property direct from the owner
              </h2>
              <div className="space-y-[13px] text-[15px] text-gray-700 leading-relaxed">
                <p>
                  {INTRO}
                  {total > 0 && low && high && (
                    <> Listings currently range from {formatPkr(low, forRent)} to {formatPkr(high, forRent)}.</>
                  )}
                </p>
                <p>
                  Estate agents in Pakistan customarily charge one to two percent from the buyer and
                  the same again from the seller, so a one crore transaction can carry two to four
                  lakh in commission before a single document is signed. Dealing direct removes that
                  cost entirely, and because it was never built into the asking price there is
                  usually more room to negotiate the final number.
                </p>
                <p>
                  You also get straight answers. The owner knows why the house was built the way it
                  was, which neighbours are settled, whether the society has outstanding development
                  charges, and where the original file is — none of it second-hand. Ask to see the{' '}
                  <strong>fard</strong> from the revenue office, the registry or allotment letter,
                  and an NOC confirming dues are clear before you pay any token amount.
                </p>
                <p>
                  Do the paperwork properly even when you trust the seller. Complete the transfer at
                  the society office or sub-registrar, never on a plain-paper agreement, and budget
                  for stamp duty, transfer fee and the advance tax that applies on transactions
                  above the filer threshold. Our{' '}
                  <Link href="/guides" className="text-cyan-700 hover:underline">
                    property guides
                  </Link>{' '}
                  walk through the full procedure step by step.
                </p>
                <p>
                  Selling your own property?{' '}
                  <Link href="/sell" className="text-cyan-700 hover:underline font-medium">
                    Post it free →
                  </Link>{' '}
                  Two active sale listings and two rentals are included on a personal account, with
                  no listing fee and no commission on the sale.
                </p>
              </div>
            </section>

            <FaqSection faqs={buildFaqs(total, low, high, forRent)} />
          </div>
        </div>
      </div>
    </main>
  )
}

function buildFaqs(total: number, low: number | null, high: number | null, forRent: boolean) {
  return [
    {
      question: 'How many owner listings are on MedaGhar right now?',
      answer:
        total > 0
          ? `There are ${total} ${total === 1 ? 'property' : 'properties'} listed directly by their owners${
              low && high ? `, ranging from ${formatPkr(low, forRent)} to ${formatPkr(high, forRent)}` : ''
            }. New owner listings are added daily.`
          : 'No owner listings are live yet. Posting is free on a personal account — you can be the first.',
    },
    {
      question: 'How many properties can I list on a personal account?',
      answer:
        'A personal account can keep 2 active listings for sale and 2 for rent at the same time. Marking a property sold or rented frees the slot immediately. Registered agent accounts can keep 10 active listings for sale and 10 for rent, and their listings appear across the main site rather than in this No Commission section.',
    },
    {
      question: 'Does MedaGhar charge commission on an owner sale?',
      answer:
        'No. Listing is free and we take nothing from either side. Buyers contact the owner directly through the listing page — we are not party to the transaction and never handle the money.',
    },
    {
      question: 'How do I know a listing is really from the owner?',
      answer:
        'Owner listings carry the green ✓ No Commission badge, which is applied automatically to anything posted from a personal account rather than a registered agent account. The posting quota on personal accounts makes it impractical for an agent to operate at scale under one. Still verify ownership from the fard and registry before paying anything.',
    },
    {
      question: 'What should I check before buying without an agent?',
      answer:
        'Get a fresh fard from the revenue office in the seller’s name, confirm the registry or allotment letter matches their CNIC, obtain an NOC from the society showing development charges are clear, and check there is no litigation or bank mortgage on the property. Complete the transfer at the sub-registrar or society office, and take a lawyer along if the amount is significant — it costs far less than the commission you have saved.',
    },
  ]
}
