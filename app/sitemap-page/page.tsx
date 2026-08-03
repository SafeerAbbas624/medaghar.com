import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/seo'
import { CITIES } from '@/lib/locations'
import { GUIDES } from '@/content/guides'
import { HUBS, typesForCategory, ALL_TYPES_SLUG } from '@/lib/taxonomy'
import { buildTreeUrl } from '@/lib/tree/urls'

export const metadata: Metadata = {
  title: 'Sitemap — Browse Every Section of MedaGhar | MedaGhar',
  description:
    'Full index of MedaGhar: property for sale and rent by city and type across Pakistan, plus guides, calculators and company pages.',
  alternates: { canonical: absoluteUrl('/sitemap-page') },
}

export const revalidate = 3600

const TOOLS = [
  { href: '/tools/mortgage-calculator', label: 'Home Loan Calculator' },
  { href: '/tools/area-converter', label: 'Marla / Kanal Converter' },
  { href: '/tools/construction-cost-calculator', label: 'Construction Cost Calculator' },
  { href: '/tools/property-tax-calculator', label: 'Property Tax Calculator' },
  { href: '/tools/rental-yield-calculator', label: 'Rental Yield Calculator' },
]

const COMPANY = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/pricing', label: 'Pricing & Featured Listings' },
  { href: '/agents', label: 'Find an Agent' },
  { href: '/market-insights', label: 'Market Insights' },
  { href: '/home-loans', label: 'Home Loans' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

/**
 * HTML sitemap — the crawl seed for the whole tree.
 *
 * With thousands of programmatic URLs, this page is how a crawler reaches the
 * deep ones in few hops. It was previously blocked by a Disallow in
 * robots.txt; that line has been removed.
 */
export default function SitemapPage() {
  const residentialTypes = typesForCategory('residential')
  const commercialTypes = typesForCategory('commercial')

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] lg:py-[55px]">
          <h1 className="text-[26px] lg:text-[40px] font-bold mb-[13px]">Sitemap</h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">
            Every section of MedaGhar in one place — property for sale and rent across{' '}
            {CITIES.length} Pakistani cities, plus guides, calculators and company pages.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] space-y-[34px]">
        <Section title="Main sections">
          <LinkList
            links={[
              { href: '/', label: 'Home' },
              ...HUBS.map((h) => ({ href: h.path, label: h.title })),
              { href: '/owner', label: 'Property by Owner — No Commission' },
              { href: '/sell', label: 'Sell Your Property' },
              { href: '/properties', label: 'Search All Listings' },
            ]}
          />
        </Section>

        <Section title="Residential property for sale">
          <LinkList
            links={residentialTypes.map((t) => ({
              href: buildTreeUrl({ purpose: 'for-sale', typeSlug: t.slug }),
              label: `${t.pluralLabel} for Sale`,
            }))}
          />
        </Section>

        <Section title="Residential property for rent">
          <LinkList
            links={residentialTypes.map((t) => ({
              href: buildTreeUrl({ purpose: 'for-rent', typeSlug: t.slug }),
              label: `${t.pluralLabel} for Rent`,
            }))}
          />
        </Section>

        <Section title="Commercial property">
          <LinkList
            links={[
              ...commercialTypes.map((t) => ({
                href: buildTreeUrl({ purpose: 'for-sale', typeSlug: t.slug }),
                label: `${t.pluralLabel} for Sale`,
              })),
              ...commercialTypes.map((t) => ({
                href: buildTreeUrl({ purpose: 'for-rent', typeSlug: t.slug }),
                label: `${t.pluralLabel} for Rent`,
              })),
            ]}
          />
        </Section>

        {/* The widest fan-out, and the main reason this page exists. */}
        <Section title={`Property by city (${CITIES.length} cities)`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[21px] gap-y-[8px]">
            {CITIES.map((c) => (
              <p key={c.slug} className="text-[14px]">
                <Link
                  href={buildTreeUrl({
                    purpose: 'for-sale',
                    typeSlug: ALL_TYPES_SLUG,
                    citySlug: c.slug,
                  })}
                  className="text-gray-700 hover:text-cyan-700 transition"
                >
                  Property for sale in {c.name}
                </Link>
                <span className="text-gray-400 mx-1.5">·</span>
                <Link
                  href={buildTreeUrl({
                    purpose: 'for-rent',
                    typeSlug: ALL_TYPES_SLUG,
                    citySlug: c.slug,
                  })}
                  className="text-gray-700 hover:text-cyan-700 transition"
                >
                  rent
                </Link>
              </p>
            ))}
          </div>
        </Section>

        <Section title="Guides">
          <LinkList links={GUIDES.map((g) => ({ href: `/guides/${g.slug}`, label: g.title }))} />
        </Section>

        <Section title="Free tools">
          <LinkList links={TOOLS} />
        </Section>

        <Section title="Company">
          <LinkList links={COMPANY} />
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
      <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">{title}</h2>
      {children}
    </section>
  )
}

function LinkList({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[21px] gap-y-[8px]">
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-[14px] text-gray-700 hover:text-cyan-700 transition">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
