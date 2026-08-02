import type { Metadata } from 'next'
import HeroBg from '@/components/HeroBg'
import Link from 'next/link'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import ConstructionCostCalculator from './Calculator'

export const metadata: Metadata = {
  title: 'House Construction Cost Calculator Pakistan | MedaGhar',
  description:
    'Estimate the cost to build a house in Pakistan — grey structure and finishing rates per sq ft for 3, 5, 7, 10 marla and kanal plots, single or double storey.',
  alternates: { canonical: 'https://medaghar.com/tools/construction-cost-calculator' },
  openGraph: {
    title: 'House Construction Cost Calculator Pakistan | MedaGhar',
    description:
      'Calculate grey structure and finishing costs for your house — with editable per-sq-ft rates and a stage-wise breakdown.',
    url: 'https://medaghar.com/tools/construction-cost-calculator',
    type: 'website',
  },
}

const FAQS = [
  {
    question: 'How much does it cost to build a 5 marla house in Pakistan?',
    answer:
      'At indicative early-2026 rates, a 5 marla (1,125 sq ft plot) double-storey house with roughly 1,900 sq ft of covered area costs around PKR 1.05 crore with standard finishing — about PKR 60 lakh for grey structure and PKR 44 lakh for finishing. Premium or luxury finishes can push the total to PKR 1.3–1.7 crore. Actual cost depends on your city, design and material choices.',
  },
  {
    question: 'What is the construction cost per square foot in Pakistan in 2026?',
    answer:
      'Indicative with-material contractor rates are around PKR 3,000–3,500 per sq ft for grey structure and PKR 2,300–5,500 per sq ft for finishing depending on quality — roughly PKR 5,500–9,000 per sq ft all-in. Rates differ between cities and move with steel, cement and labour prices, so always confirm current local quotations.',
  },
  {
    question: 'What is included in grey structure?',
    answer:
      'Grey structure covers everything up to a weatherproof shell: excavation and foundation, RCC columns, beams, slabs and roof, brickwork, plaster, electrical conduits and plumbing rough-in, and door and window frames. It excludes tiles, paint, fittings, woodwork, kitchen and bathroom finishes — those fall under finishing.',
  },
  {
    question: 'Is it cheaper to build single storey or double storey?',
    answer:
      'Per square foot, a double storey is usually slightly cheaper because the foundation, roof and land cost are shared across more covered area. In absolute terms it costs more because you build roughly twice the area. Most 3–10 marla owners in Pakistan build double storey to maximise living space on small plots.',
  },
  {
    question: 'How long does it take to build a house in Pakistan?',
    answer:
      'A typical 5–10 marla house takes 4–6 months for grey structure and another 4–8 months for finishing — about 8–14 months in total. Kanal-sized houses, custom designs and material delays can stretch this to 18 months or more. Building in stages as funds allow is common and this calculator helps budget each stage.',
  },
]

export default function ConstructionCostCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Construction Cost Calculator', path: '/tools/construction-cost-calculator' },
          ]),
          faqJsonLd(FAQS),
        ]}
      />

      <div className="relative overflow-hidden bg-slate-900 text-white">
        <HeroBg src="/images/home-loans-hero.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] lg:py-[55px]">
          <nav className="text-[13px] text-slate-400 mb-[13px]">
            <Link href="/tools" className="hover:text-white">Tools</Link>
            <span className="mx-[8px]">/</span>
            <span>Construction Cost Calculator</span>
          </nav>
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            House Construction Cost Calculator Pakistan
          </h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">
            Estimate the cost to build your house — grey structure plus finishing — for 3 marla to
            2 kanal plots. Edit the per-square-foot rates to match quotes from your city.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <ConstructionCostCalculator />

        <AdSlot className="my-[34px]" />

        {/* SEO content */}
        <div className="guide-content bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
          <h2>What drives house construction cost in Pakistan</h2>
          <p>
            Three factors dominate your final bill: covered area, structure choices and finishing
            quality. Covered area — not plot size — is what you actually pay for: a double-storey
            house on a 5 marla plot can have more covered area than a single-storey on 10 marla.
            Material prices are the wild card; steel and cement together make up a large share of
            grey structure cost, so rates quoted six months ago can be badly out of date. Labour
            rates also differ between cities — Lahore, Karachi and Islamabad typically cost more
            than smaller cities.
          </p>
          <h2>Grey structure vs finishing — where the money goes</h2>
          <p>
            Pakistani contractors split a build into two phases. <strong>Grey structure</strong>{' '}
            takes the house to a weatherproof brick-and-concrete shell: foundation, RCC frame and
            roof, brickwork, plaster, electrical conduits and plumbing rough-in, plus door and
            window frames. <strong>Finishing</strong> is everything that makes it livable — tiles
            or marble, paint, woodwork, kitchen, bathrooms, electrical fittings and fixtures.
            Grey structure cost is fairly predictable per square foot; finishing is where budgets
            blow up, because the gap between local and imported materials can easily double the
            per-sq-ft rate. Many families build the grey structure first and finish room by room
            as funds allow.
          </p>
          <p>
            For city-wise rates and a marla-by-marla cost table, read our{' '}
            <Link href="/guides/construction-cost-per-marla">construction cost per marla guide</Link>.
            Not sure how big your plot is in square feet? Convert it with the{' '}
            <Link href="/tools/area-converter">marla and kanal area converter</Link> first.
          </p>
        </div>

        {/* FAQ visible section */}
        <section className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px] mt-[34px]">
          <h2 className="text-[21px] font-bold text-gray-900 mb-[21px]">Frequently Asked Questions</h2>
          <div className="space-y-[21px]">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-[21px] last:border-0 last:pb-0">
                <h3 className="text-[16px] font-semibold text-gray-900 mb-[8px]">{faq.question}</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
