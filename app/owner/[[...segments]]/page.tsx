import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import TreePage from '@/components/tree/TreePage'
import { parseTreeSegments } from '@/lib/tree/parseSegments'
import { loadTreePage, metadataFor, seedStaticParams } from '@/lib/tree/render'
import { absoluteUrl } from '@/lib/seo'
import { countFor, citiesWithInventory } from '@/lib/listingCounts'
import { getTypeDef, typesForCategory, ALL_TYPES_SLUG } from '@/lib/taxonomy'
import { buildTreeUrl } from '@/lib/tree/urls'
import { CITIES } from '@/lib/locations'
import { FaCheckCircle, FaHandshake, FaPlus } from 'react-icons/fa'

const PURPOSE = 'owner' as const

interface Props {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<{ page?: string }>
}

export function generateStaticParams() {
  return seedStaticParams(PURPOSE)
}

export const revalidate = 900

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params
  const result = parseTreeSegments(PURPOSE, segments)
  if (result.kind !== 'ok') return {}

  if (result.descriptor.level === 'root') {
    const title = 'Property for Sale by Owner in Pakistan — No Commission | MedaGhar'
    const description =
      'Buy directly from property owners across Pakistan. No agent, no commission, no middleman — contact owners directly on MedaGhar.'
    return {
      title,
      description,
      alternates: { canonical: absoluteUrl('/owner') },
      openGraph: { title, description, url: absoluteUrl('/owner'), type: 'website', siteName: 'MedaGhar' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  return metadataFor(result.descriptor)
}

export default async function OwnerTreePage({ params, searchParams }: Props) {
  const { segments } = await params
  const { page: pageParam } = await searchParams
  const result = parseTreeSegments(PURPOSE, segments)

  if (result.kind === 'redirect') permanentRedirect(result.canonical)
  if (result.kind === 'notFound') notFound()

  if (result.descriptor.level === 'root') return <OwnerHub />

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const data = await loadTreePage(result.descriptor, page)

  return <TreePage descriptor={result.descriptor} {...data} />
}

/**
 * The /owner hub. Distinct keyword space from the main tree — targets
 * "no commission" / "direct owner" searches that agent-led competitors
 * cannot rank for.
 */
async function OwnerHub() {
  const allTypes = getTypeDef(ALL_TYPES_SLUG)!
  const total = await countFor({ types: allTypes.types, fsboOnly: true })
  const cityCounts = await citiesWithInventory(allTypes, null, true)

  const cities = CITIES.map((c) => ({ city: c, count: cityCounts.get(c.slug) ?? 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)

  const types = [...typesForCategory('residential'), ...typesForCategory('commercial')].filter(
    (t) => t.tier === 'A'
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
          <span className="inline-flex items-center gap-[8px] bg-white/15 backdrop-blur border border-white/25 text-[13px] font-semibold px-[21px] py-[8px] rounded-full mb-[21px]">
            <FaCheckCircle /> No Commission
          </span>
          <h1 className="text-[34px] lg:text-[55px] font-bold mb-[21px] leading-tight">
            Property for Sale by Owner
          </h1>
          <p className="text-[16px] lg:text-[21px] text-emerald-50 max-w-3xl">
            Deal directly with the owner. No agent in the middle, no commission on either
            side — just the person who owns the property and you.
          </p>
          {total > 0 && (
            <p className="mt-[21px] text-[15px] text-emerald-100">
              {total} owner {total === 1 ? 'listing' : 'listings'} available right now
            </p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] space-y-[34px]">
        <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px] flex items-center gap-[13px]">
            <FaHandshake className="text-emerald-600" /> Why buy direct from the owner?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[21px] text-[15px] text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-[5px]">No commission</p>
              <p>Agents in Pakistan typically charge 1–2% from each side. Dealing direct removes that entirely.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-[5px]">Straight answers</p>
              <p>The owner knows the property&apos;s history, the paperwork and the neighbours — nothing is second-hand.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-[5px]">Room to negotiate</p>
              <p>With no commission built into the asking price, there is usually more flexibility on the final number.</p>
            </div>
          </div>
        </section>

        {cities.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
              Owner listings by city
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[13px]">
              {cities.map(({ city, count }) => (
                <Link
                  key={city.slug}
                  href={buildTreeUrl({ purpose: 'owner', typeSlug: ALL_TYPES_SLUG, citySlug: city.slug })}
                  className="bg-slate-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-600 rounded-lg px-[13px] py-[13px] transition group"
                >
                  <span className="block text-[14px] font-medium text-gray-900 group-hover:text-emerald-700">
                    {city.name}
                  </span>
                  <span className="block text-[12px] text-gray-500">
                    {count} {count === 1 ? 'listing' : 'listings'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Browse owner listings by type
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[13px]">
            {types.map((t) => (
              <Link
                key={t.slug}
                href={buildTreeUrl({ purpose: 'owner', typeSlug: t.slug })}
                className="bg-slate-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-600 rounded-lg px-[13px] py-[13px] text-[14px] font-medium text-gray-900 hover:text-emerald-700 transition"
              >
                {t.pluralLabel}
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-xl p-[34px] text-center text-white">
          <h2 className="text-[21px] lg:text-[26px] font-bold mb-[13px]">
            Selling your own property?
          </h2>
          <p className="text-[15px] text-emerald-50 mb-[21px] max-w-2xl mx-auto">
            Post it free on MedaGhar and deal with buyers directly. No listing fee, no
            commission, no agent.
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-[8px] bg-white text-emerald-800 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-emerald-50 transition"
          >
            <FaPlus className="text-[13px]" /> List Your Property Free
          </Link>
        </section>
      </div>
    </main>
  )
}
