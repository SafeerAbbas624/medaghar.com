import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { GUIDES, GUIDE_CATEGORIES } from '@/content/guides'
import { getGuideCover } from '@/lib/images'
import { breadcrumbJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import { FaBookOpen, FaArrowRight, FaClock } from 'react-icons/fa'

export const metadata: Metadata = {
  title: 'Pakistan Property Guides — Buying, Selling, Taxes & Investment | MedaGhar',
  description:
    'Free expert guides on Pakistani real estate: how to verify documents, property taxes, home loans, construction costs, best areas to invest and more.',
  alternates: { canonical: 'https://medaghar.com/guides' },
  openGraph: {
    title: 'Pakistan Property Guides | MedaGhar',
    description:
      'Free expert guides on buying, selling, renting and investing in Pakistani real estate.',
    url: 'https://medaghar.com/guides',
    type: 'website',
  },
}

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
        ])}
      />

      {/* Hero with photo */}
      <div className="relative text-white overflow-hidden">
        <Image
          src="/images/hero-home.jpg"
          alt="Pakistan property guides"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-800/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px]">
          <div className="flex items-center gap-[13px] mb-[13px]">
            <FaBookOpen className="text-[34px]" />
            <h1 className="text-[26px] lg:text-[34px] font-bold">Pakistan Property Guides</h1>
          </div>
          <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl">
            Practical, expert-written guides for buying, selling, renting and investing in
            Pakistani real estate — from verifying documents to calculating taxes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        {GUIDE_CATEGORIES.map((category) => {
          const guides = GUIDES.filter((g) => g.category === category)
          if (guides.length === 0) return null
          return (
            <section key={category} className="mb-[55px]">
              <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
                {guides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col group"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={getGuideCover(guide.slug, guide.category)}
                        alt={guide.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-[13px] left-[13px] bg-white/90 backdrop-blur text-cyan-700 text-[12px] font-bold px-[13px] py-[5px] rounded-full shadow">
                        {guide.category}
                      </span>
                    </div>
                    <div className="p-[21px] flex flex-col flex-grow">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-[8px] group-hover:text-cyan-700 transition leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-[13px] text-gray-600 mb-[13px] flex-grow line-clamp-2">
                        {guide.description}
                      </p>
                      <div className="flex items-center justify-between text-[13px] text-gray-500">
                        <span className="flex items-center gap-[5px]">
                          <FaClock /> {guide.readTimeMinutes} min read
                        </span>
                        <span className="flex items-center gap-[5px] text-cyan-600 font-semibold group-hover:gap-[8px] transition-all">
                          Read <FaArrowRight />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        <AdSlot className="my-[34px]" />

        {/* Tools CTA */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl p-[34px] text-white text-center">
          <h2 className="text-[21px] lg:text-[26px] font-bold mb-[13px]">
            Put the Numbers to Work
          </h2>
          <p className="text-slate-300 mb-[21px] max-w-2xl mx-auto">
            Use our free calculators — home loan instalments, marla conversions, construction
            costs and property taxes — built for the Pakistani market.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-[8px] bg-white text-slate-900 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-50 transition"
          >
            Explore Free Tools <FaArrowRight />
          </Link>
        </div>
      </div>
    </main>
  )
}
