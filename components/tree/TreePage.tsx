import Link from 'next/link'
import PropertyCard from '@/components/PropertyCard'
import AdSlot from '@/components/AdSlot'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs, { type Crumb } from '@/components/tree/Breadcrumbs'
import LocationLinkGrid, { type LocationLink } from '@/components/tree/LocationLinkGrid'
import { collectionPageJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/seo'
import type { TreeDescriptor } from '@/lib/tree/parseSegments'
import type { NodeListings } from '@/lib/tree/queries'
import { PAGE_SIZE } from '@/lib/tree/queries'
import { introParagraph, nodeFaqs, nodeHeading, metaDescription } from '@/lib/tree/copy'
import { buildTreeUrl } from '@/lib/tree/urls'
import { hubFor, typesForCategory, PURPOSE_LABEL } from '@/lib/taxonomy'
import type { LocationStats } from '@/lib/listingCounts'
import { FaPlus, FaSearch } from 'react-icons/fa'

interface Props {
  descriptor: TreeDescriptor
  stats: LocationStats
  listings: NodeListings
  breadcrumbs: Crumb[]
  childLinks: LocationLink[]
  childTitle: string
  siblingTypes: { name: string; href: string; count: number }[]
  canonicalPath: string
}

/**
 * The shared renderer for every node of the tree, from `/for-sale/house`
 * down to `/for-sale/house/lahore/dha-defence/phase-6`.
 *
 * Server component: the listings must be in the HTML for SEO, so nothing here
 * is client-rendered except the PropertyCard leaves.
 */
export default function TreePage({
  descriptor: d,
  stats,
  listings,
  breadcrumbs,
  childLinks,
  childTitle,
  siblingTypes,
  canonicalPath,
}: Props) {
  const heading = nodeHeading(d)
  const intro = introParagraph(d, stats)
  const faqs = nodeFaqs(d, stats)
  const hub = d.type ? hubFor(d.type.category, d.purpose) : null

  // Counterpart in the opposite purpose, e.g. for-sale <-> for-rent.
  const counterpart =
    d.purpose === 'owner'
      ? null
      : {
          label: d.purpose === 'for-sale' ? 'View rentals here' : 'View properties for sale here',
          href: buildTreeUrl({
            purpose: d.purpose === 'for-sale' ? 'for-rent' : 'for-sale',
            typeSlug: d.type?.slug,
            citySlug: d.city?.slug,
            areaSlug: d.area?.slug,
            subAreaSlug: d.subArea?.slug,
          }),
        }

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: heading,
            description: metaDescription(d, stats),
            path: canonicalPath,
            itemCount: stats.count,
          }),
          ...(listings.listings.length > 0
            ? [itemListJsonLd(listings.listings as never, (listings.page - 1) * PAGE_SIZE + 1)]
            : []),
          ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
        ]}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] lg:py-[55px]">
          <div className="mb-[21px] [&_a]:text-slate-300 [&_a:hover]:text-white [&_span]:text-white [&_.text-gray-600]:text-slate-300">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <h1 className="text-[26px] lg:text-[40px] font-bold mb-[13px] leading-tight">{heading}</h1>
          <p className="text-[16px] text-slate-300">
            {stats.count > 0
              ? `${stats.count} ${stats.count === 1 ? 'listing' : 'listings'} available`
              : 'No listings here yet'}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] space-y-[34px]">
        {/* Intro copy */}
        {intro && (
          <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
            <p className="text-[16px] text-gray-700 leading-relaxed">{intro}</p>
            {counterpart && (
              <p className="mt-[13px] text-[14px]">
                <Link href={counterpart.href} className="text-cyan-700 hover:underline font-medium">
                  {counterpart.label} →
                </Link>
              </p>
            )}
          </section>
        )}

        {/* Listings */}
        {listings.listings.length > 0 ? (
          <section>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
              Available {d.type?.pluralLabel ?? 'Properties'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
              {listings.listings.map((p) => (
                <PropertyCard key={p.id} property={p as never} />
              ))}
            </div>

            {listings.totalPages > 1 && (
              <Pagination
                page={listings.page}
                totalPages={listings.totalPages}
                basePath={canonicalPath}
              />
            )}
          </section>
        ) : (
          <section className="bg-white rounded-xl shadow-sm p-[34px] lg:p-[55px] text-center">
            <FaSearch className="text-[42px] text-gray-300 mx-auto mb-[21px]" />
            <h2 className="text-[21px] font-bold text-gray-900 mb-[8px]">
              No listings here yet
            </h2>
            <p className="text-[15px] text-gray-600 mb-[21px] max-w-lg mx-auto">
              Nobody has posted a {d.type?.label.toLowerCase() ?? 'property'}{' '}
              {PURPOSE_LABEL[d.purpose].toLowerCase()} here yet. Listing on MedaGhar is free
              — be the first.
            </p>
            <Link
              href={d.purpose === 'for-rent' ? '/post-rent' : '/sell'}
              className="inline-flex items-center gap-[8px] bg-cyan-700 text-white px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition"
            >
              <FaPlus className="text-[13px]" /> Post Your Listing Free
            </Link>
          </section>
        )}

        <AdSlot />

        {/* Child locations */}
        <LocationLinkGrid title={childTitle} links={childLinks} />

        {/* Sibling types in the same location */}
        {siblingTypes.length > 0 && (
          <LocationLinkGrid
            title={`Other property types${d.city ? ` in ${d.city.name}` : ''}`}
            links={siblingTypes}
          />
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
              Frequently asked questions
            </h2>
            <dl className="space-y-[21px]">
              {faqs.map((f) => (
                <div key={f.question}>
                  <dt className="font-semibold text-gray-900 mb-[5px] text-[16px]">{f.question}</dt>
                  <dd className="text-[15px] text-gray-700 leading-relaxed">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Back up to the hub */}
        {hub && (
          <p className="text-[14px] text-gray-600">
            Browse all{' '}
            <Link href={hub.path} className="text-cyan-700 hover:underline font-medium">
              {hub.title.toLowerCase()}
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}

function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number
  totalPages: number
  basePath: string
}) {
  const prev = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
  const next = page < totalPages ? `${basePath}?page=${page + 1}` : null

  return (
    <nav className="flex items-center justify-center gap-[13px] mt-[34px]" aria-label="Pagination">
      {prev ? (
        <Link
          href={prev}
          rel="prev"
          className="px-[21px] py-[10px] rounded-lg border border-gray-300 bg-white hover:bg-slate-50 text-[14px] font-medium transition"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-[21px] py-[10px] rounded-lg border border-gray-200 text-gray-400 text-[14px]">
          ← Previous
        </span>
      )}

      <span className="text-[14px] text-gray-600">
        Page {page} of {totalPages}
      </span>

      {next ? (
        <Link
          href={next}
          rel="next"
          className="px-[21px] py-[10px] rounded-lg border border-gray-300 bg-white hover:bg-slate-50 text-[14px] font-medium transition"
        >
          Next →
        </Link>
      ) : (
        <span className="px-[21px] py-[10px] rounded-lg border border-gray-200 text-gray-400 text-[14px]">
          Next →
        </span>
      )}
    </nav>
  )
}
