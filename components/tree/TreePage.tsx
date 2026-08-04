import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import Breadcrumbs, { type Crumb } from '@/components/tree/Breadcrumbs'
import LocationLinkGrid, { type LocationLink } from '@/components/tree/LocationLinkGrid'
import FilterSidebar from '@/components/listing/FilterSidebar'
import ResultsView from '@/components/listing/ResultsView'
import PostPropertyCta from '@/components/listing/PostPropertyCta'
import FaqSection from '@/components/listing/FaqSection'
import { collectionPageJsonLd, itemListJsonLd } from '@/lib/seo'
import type { TreeDescriptor } from '@/lib/tree/parseSegments'
import type { NodeListings } from '@/lib/tree/queries'
import { PAGE_SIZE } from '@/lib/tree/queries'
import {
  nodeHeading,
  metaDescription,
  seoBodyParagraphs,
  listingPageFaqs,
} from '@/lib/tree/copy'
import { hubFor, typesForCategory, supportsAreaDepth } from '@/lib/taxonomy'
import type { LocationStats } from '@/lib/listingCounts'
import type { ListItemProperty } from '@/components/PropertyListItem'

interface Props {
  descriptor: TreeDescriptor
  stats: LocationStats
  listings: NodeListings
  featured: ListItemProperty[]
  breadcrumbs: Crumb[]
  childLinks: LocationLink[]
  childTitle: string
  canonicalPath: string
  queryString: string
}

/** Type options for the filter sidebar, derived from the taxonomy. */
function filterTypes() {
  return [...typesForCategory('residential'), ...typesForCategory('commercial')].map((t) => ({
    slug: t.slug,
    label: t.pluralLabel,
    category: t.category,
    hasAreaDepth: supportsAreaDepth(t),
  }))
}

/**
 * Shared renderer for every node of the tree.
 *
 * Layout: filters left, results right; then the conversion CTA, the SEO body
 * copy, and the FAQ last before the footer.
 */
export default function TreePage({
  descriptor: d,
  stats,
  listings,
  featured,
  breadcrumbs,
  childLinks,
  childTitle,
  canonicalPath,
  queryString,
}: Props) {
  const heading = nodeHeading(d)
  const paragraphs = seoBodyParagraphs(d, stats)
  const faqs = listingPageFaqs(d, stats)
  const hub = d.type ? hubFor(d.type.category, d.purpose) : null
  const forRent = d.purpose === 'for-rent'

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
        ]}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[26px] lg:py-[34px]">
          <div className="mb-[16px] [&_a]:text-slate-300 [&_a:hover]:text-white [&_span]:text-white [&_.text-gray-600]:text-slate-300">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <h1 className="text-[24px] lg:text-[34px] font-bold leading-tight">{heading}</h1>
          <p className="text-[15px] text-slate-300 mt-[8px]">
            {stats.count > 0
              ? `${stats.count} ${stats.count === 1 ? 'listing' : 'listings'} available`
              : 'No listings here yet'}
          </p>
        </div>
      </header>

      {/* Filters + results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-[26px]">
          <div>
            <FilterSidebar
              types={filterTypes()}
              initial={{
                purpose: forRent ? 'for-rent' : 'for-sale',
                typeSlug: d.type?.slug ?? '',
                citySlug: d.city?.slug ?? '',
                areaSlug: d.area?.slug ?? '',
                subAreaSlug: d.subArea?.slug ?? '',
                fsboOnly: d.purpose === 'owner',
              }}
            />
          </div>

          <div className="min-w-0 space-y-[34px]">
            <ResultsView
              listings={listings.listings as never}
              featured={featured}
              total={stats.count}
              page={listings.page}
              totalPages={listings.totalPages}
              basePath={canonicalPath}
              queryString={queryString}
            />

            <AdSlot />

            <LocationLinkGrid title={childTitle} links={childLinks} />

            <PostPropertyCta forRent={forRent} />

            {/* SEO / AEO body copy — after the listings, before the FAQ */}
            {paragraphs.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm p-[21px] lg:p-[34px]">
                <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[16px]">
                  About {heading.toLowerCase()}
                </h2>
                <div className="space-y-[13px]">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] text-gray-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {hub && (
                  <p className="mt-[21px] text-[14px] text-gray-600">
                    Browse all{' '}
                    <Link href={hub.path} className="text-cyan-700 hover:underline font-medium">
                      {hub.title.toLowerCase()}
                    </Link>
                  </p>
                )}
              </section>
            )}

            {/* FAQ — last block before the footer */}
            <FaqSection faqs={faqs} />
          </div>
        </div>
      </div>
    </main>
  )
}
