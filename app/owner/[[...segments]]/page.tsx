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
  searchParams: Promise<Record<string, string | undefined>>
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
  const sp = await searchParams
  const pageParam = sp.page
  const result = parseTreeSegments(PURPOSE, segments)

  if (result.kind === 'redirect') permanentRedirect(result.canonical)
  if (result.kind === 'notFound') notFound()

  if (result.descriptor.level === 'root') return <OwnerHub />

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const data = await loadTreePage(result.descriptor, page, {
    minPrice: sp.minPrice,
    maxPrice: sp.maxPrice,
    bedrooms: sp.bedrooms,
    bathrooms: sp.bathrooms,
    minMarla: sp.minMarla,
    maxMarla: sp.maxMarla,
    areaSlug: sp.areaSlug,
  })

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
      <header className="bg-gradient-to-r from-slate-900 via-cyan-900 to-cyan-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
          <span className="inline-flex items-center gap-[8px] bg-white/15 backdrop-blur border border-white/25 text-[13px] font-semibold px-[21px] py-[8px] rounded-full mb-[21px]">
            <FaCheckCircle /> No Commission
          </span>
          <h1 className="text-[34px] lg:text-[55px] font-bold mb-[21px] leading-tight">
            Property for Sale by Owner
          </h1>
          <p className="text-[16px] lg:text-[21px] text-cyan-50 max-w-3xl">
            Deal directly with the owner. No agent in the middle, no commission on either
            side — just the person who owns the property and you.
          </p>
          {total > 0 && (
            <p className="mt-[21px] text-[15px] text-cyan-100">
              {total} owner {total === 1 ? 'listing' : 'listings'} available right now
            </p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] space-y-[34px]">
        {/* Quota: how owners and agents are told apart on the site */}
        <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[16px]">
            How we tell owners and agents apart
          </h2>
          <p className="text-[15px] text-gray-700 leading-relaxed mb-[21px]">
            Every account on MedaGhar is either a personal account or a registered agent account,
            and listings are labelled accordingly. Anything posted from a personal account carries
            the <span className="font-semibold text-emerald-700">✓ No Commission</span> badge, so you
            always know before you call whether you are speaking to the owner or to an agent.
          </p>
          <div className="grid sm:grid-cols-2 gap-[16px]">
            <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-[21px]">
              <p className="font-semibold text-gray-900 mb-[8px]">Personal account (owner)</p>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                Up to <strong>2 active listings for sale</strong> and <strong>2 for rent</strong> at
                a time. The limit keeps this section genuinely owner-only — an agent cannot quietly
                post a hundred listings here. Mark a property sold or rented to free a slot.
              </p>
            </div>
            <div className="border border-cyan-200 bg-cyan-50/60 rounded-xl p-[21px]">
              <p className="font-semibold text-gray-900 mb-[8px]">Registered agent account</p>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                Up to <strong>10 active listings for sale</strong> and <strong>10 for rent</strong>.
                Agent listings appear throughout the main site with the agent&apos;s profile, rating
                and experience shown, but not under this No Commission section.
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

        <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px] flex items-center gap-[13px]">
            <FaHandshake className="text-cyan-600" /> Why buy direct from the owner?
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
                  className="bg-slate-50 hover:bg-cyan-50 border border-gray-200 hover:border-cyan-600 rounded-lg px-[13px] py-[13px] transition group"
                >
                  <span className="block text-[14px] font-medium text-gray-900 group-hover:text-cyan-700">
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
                className="bg-slate-50 hover:bg-cyan-50 border border-gray-200 hover:border-cyan-600 rounded-lg px-[13px] py-[13px] text-[14px] font-medium text-gray-900 hover:text-cyan-700 transition"
              >
                {t.pluralLabel}
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-cyan-700 to-cyan-800 rounded-xl p-[34px] text-center text-white">
          <h2 className="text-[21px] lg:text-[26px] font-bold mb-[13px]">
            Selling your own property?
          </h2>
          <p className="text-[15px] text-cyan-50 mb-[21px] max-w-2xl mx-auto">
            Post it free on MedaGhar and deal with buyers directly. No listing fee, no
            commission, no agent.
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-[8px] bg-white text-cyan-800 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-50 transition"
          >
            <FaPlus className="text-[13px]" /> List Your Property Free
          </Link>
        </section>
      </div>
    </main>
  )
}
