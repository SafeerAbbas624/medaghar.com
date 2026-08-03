import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/tree/Breadcrumbs'
import LocationLinkGrid, { type LocationLink } from '@/components/tree/LocationLinkGrid'
import { absoluteUrl, collectionPageJsonLd } from '@/lib/seo'
import { citiesWithInventory, countFor } from '@/lib/listingCounts'
import { typesForCategory, PURPOSE_LABEL, type Category, type Purpose } from '@/lib/taxonomy'
import { buildTreeUrl } from '@/lib/tree/urls'
import { CITIES } from '@/lib/locations'
import type { ListingType } from '@prisma/client'

interface Props {
  category: Category
  purpose: Purpose
  listingType: ListingType
  title: string
  intro: string
  path: string
}

/**
 * A category hub: /residential-for-sale, /commercial-for-rent, etc.
 *
 * These are the four indexable hub-level pages. They rank for the broad
 * umbrella terms and pass authority down into the type/city tree.
 */
export default async function CategoryHub({
  category,
  purpose,
  listingType,
  title,
  intro,
  path,
}: Props) {
  const types = typesForCategory(category)

  // Count per type, and gather the cities with inventory across the category.
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
      href: buildTreeUrl({
        purpose,
        typeSlug: types[0]?.slug ?? 'house',
        citySlug: c.slug,
      }),
    }))
    .sort((a, b) => b.count - a.count)

  const total = typeLinks.reduce((n, t) => n + t.count, 0)

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={collectionPageJsonLd({ name: title, description: intro, path, itemCount: total })}
      />

      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] lg:py-[55px]">
          <div className="mb-[21px] [&_a]:text-slate-300 [&_a:hover]:text-white [&_span]:text-white">
            <Breadcrumbs
              items={[
                { name: 'Home', path: '/' },
                { name: title.replace(' in Pakistan', ''), path },
              ]}
            />
          </div>
          <h1 className="text-[26px] lg:text-[40px] font-bold mb-[13px] leading-tight">{title}</h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">{intro}</p>
          {total > 0 && (
            <p className="mt-[13px] text-[15px] text-slate-300">
              {total} {total === 1 ? 'listing' : 'listings'} available
            </p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] space-y-[34px]">
        {typeLinks.length > 0 ? (
          <LocationLinkGrid title="Browse by property type" links={typeLinks} />
        ) : (
          <section className="bg-white rounded-xl shadow-sm p-[34px] text-center">
            <h2 className="text-[21px] font-bold text-gray-900 mb-[8px]">No listings yet</h2>
            <p className="text-[15px] text-gray-600 mb-[21px]">
              Be the first to post a {category} property {PURPOSE_LABEL[purpose].toLowerCase()}.
            </p>
            <Link
              href={purpose === 'for-rent' ? '/post-rent' : '/sell'}
              className="inline-block bg-cyan-700 text-white px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition"
            >
              Post Your Listing Free
            </Link>
          </section>
        )}

        <LocationLinkGrid title="Browse by city" links={cityLinks} />

        {/* Cross-link to the opposite purpose */}
        <p className="text-[14px] text-gray-600">
          Looking to {purpose === 'for-sale' ? 'rent' : 'buy'} instead?{' '}
          <Link
            href={
              category === 'residential'
                ? purpose === 'for-sale'
                  ? '/residential-for-rent'
                  : '/residential-for-sale'
                : purpose === 'for-sale'
                  ? '/commercial-for-rent'
                  : '/commercial-for-sale'
            }
            className="text-cyan-700 hover:underline font-medium"
          >
            Browse {category} property {purpose === 'for-sale' ? 'for rent' : 'for sale'} →
          </Link>
        </p>
      </div>
    </main>
  )
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
