import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { GUIDES, getGuide, getRelatedGuides } from '@/content/guides'
import { getGuideCover } from '@/lib/images'
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import { FaClock, FaArrowRight, FaCalendarAlt } from 'react-icons/fa'

interface GuidePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}
  const url = absoluteUrl(`/guides/${guide.slug}`)
  return {
    title: `${guide.title} | MedaGhar`,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: 'article',
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      siteName: 'MedaGhar',
      images: [{ url: absoluteUrl(getGuideCover(guide.slug, guide.category)), width: 800, height: 450, alt: guide.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      images: [absoluteUrl(getGuideCover(guide.slug, guide.category))],
    },
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const related = getRelatedGuides(guide)

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          articleJsonLd({
            title: guide.title,
            description: guide.description,
            path: `/guides/${guide.slug}`,
            publishedAt: guide.publishedAt,
            updatedAt: guide.updatedAt,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
          ...(guide.faqs.length > 0 ? [faqJsonLd(guide.faqs)] : []),
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        {/* Breadcrumbs */}
        <nav className="text-[13px] text-gray-500 mb-[21px]">
          <Link href="/" className="hover:text-cyan-600">Home</Link>
          <span className="mx-[8px]">/</span>
          <Link href="/guides" className="hover:text-cyan-600">Guides</Link>
          <span className="mx-[8px]">/</span>
          <span className="text-gray-700">{guide.category}</span>
        </nav>

        {/* Header */}
        <header className="mb-[34px]">
          <span className="inline-block bg-cyan-100 text-cyan-700 text-[13px] font-semibold px-[13px] py-[5px] rounded-full mb-[13px]">
            {guide.category}
          </span>
          <h1 className="text-[26px] lg:text-[34px] font-bold text-gray-900 leading-tight mb-[13px]">
            {guide.title}
          </h1>
          <p className="text-[16px] text-gray-600 mb-[13px]">{guide.description}</p>
          <div className="flex items-center gap-[21px] text-[13px] text-gray-500 mb-[21px]">
            <span className="flex items-center gap-[5px]">
              <FaCalendarAlt /> Updated {new Date(guide.updatedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-[5px]">
              <FaClock /> {guide.readTimeMinutes} min read
            </span>
          </div>
          <div className="relative w-full h-[220px] sm:h-[320px] lg:h-[420px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={getGuideCover(guide.slug, guide.category)}
              alt={guide.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </header>

        <AdSlot className="mb-[34px]" layout="in-article" format="fluid" />

        {/* Body */}
        <div
          className="guide-content bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]"
          dangerouslySetInnerHTML={{ __html: guide.html }}
        />

        <AdSlot className="my-[34px]" layout="in-article" format="fluid" />

        {/* FAQs */}
        {guide.faqs.length > 0 && (
          <section className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px] mt-[34px]">
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
              Frequently Asked Questions
            </h2>
            <div className="space-y-[21px]">
              {guide.faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 pb-[21px] last:border-0 last:pb-0">
                  <h3 className="text-[16px] font-semibold text-gray-900 mb-[8px]">
                    {faq.question}
                  </h3>
                  <p className="text-[16px] text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related guides */}
        {related.length > 0 && (
          <section className="mt-[34px]">
            <h2 className="text-[21px] font-bold text-gray-900 mb-[21px]">Related Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[21px]">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/guides/${r.slug}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
                >
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={getGuideCover(r.slug, r.category)}
                      alt={r.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-[21px]">
                    <span className="text-[13px] font-semibold text-cyan-600">{r.category}</span>
                    <h3 className="text-[16px] font-bold text-gray-900 mt-[8px] group-hover:text-cyan-700 transition leading-snug">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-[34px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl p-[34px] text-white text-center">
          <h2 className="text-[21px] font-bold mb-[13px]">Ready to Find Your Property?</h2>
          <p className="text-slate-300 mb-[21px]">
            Browse thousands of houses, flats and plots across Pakistan — listing is 100% free.
          </p>
          <div className="flex flex-wrap justify-center gap-[13px]">
            <Link
              href="/properties"
              className="inline-flex items-center gap-[8px] bg-white text-slate-900 px-[21px] py-[13px] rounded-xl font-semibold hover:bg-cyan-50 transition"
            >
              Browse Properties <FaArrowRight />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-[8px] bg-cyan-700 text-white px-[21px] py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition"
            >
              Free Calculators
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
