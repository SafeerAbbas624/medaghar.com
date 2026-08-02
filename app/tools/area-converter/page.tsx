import type { Metadata } from 'next'
import HeroBg from '@/components/HeroBg'
import Link from 'next/link'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import AreaConverter from './Converter'

export const metadata: Metadata = {
  title: 'Marla to Square Feet Converter — Kanal, Gaz, Acre | MedaGhar',
  description:
    'Free area converter for Pakistan: marla to square feet, kanal to marla, square yards (gaz), square metres and acres. Supports both 225 and 272.25 sq ft marla standards.',
  alternates: { canonical: 'https://medaghar.com/tools/area-converter' },
  openGraph: {
    title: 'Marla & Kanal Area Converter | MedaGhar',
    description:
      'Convert marla, kanal, square feet, gaz, square metres and acres instantly — built for Pakistani land units.',
    url: 'https://medaghar.com/tools/area-converter',
    type: 'website',
  },
}

const FAQS = [
  {
    question: 'How many square feet is 1 marla?',
    answer:
      'In modern planned societies (DHA, Bahria Town, LDA/CDA schemes) 1 marla = 225 sq ft. In old city areas, rural revenue records and most of KPK, the traditional marla of 272.25 sq ft applies. This converter supports both standards.',
  },
  {
    question: 'How many marlas are in a kanal?',
    answer: '1 kanal always equals 20 marlas — 4,500 sq ft on the modern standard or 5,445 sq ft on the traditional standard.',
  },
  {
    question: 'How big is a 120 square yard plot in marlas?',
    answer: 'A 120 sq yd (gaz) plot — the standard Karachi cut — is 1,080 sq ft, which is 4.8 marlas on the modern 225 sq ft standard. It is commonly marketed as a "5 marla" equivalent.',
  },
  {
    question: 'How many kanals are in one acre?',
    answer: 'One acre equals 8 kanals or 160 marlas (43,560 sq ft). Large farmland in Punjab is measured in murabbas, where 1 murabba = 25 acres = 200 kanals.',
  },
]

export default function AreaConverterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Area Converter', path: '/tools/area-converter' },
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
            <span>Area Converter</span>
          </nav>
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            Marla, Kanal & Square Feet Converter
          </h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">
            Convert between all Pakistani land units instantly — marla, kanal, square feet, square
            yards (gaz), square metres, acres and murabba.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <AreaConverter />

        <AdSlot className="my-[34px]" />

        <div className="guide-content bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
          <h2>Quick reference: common plot sizes</h2>
          <table>
            <thead>
              <tr><th>Plot</th><th>Square Feet (modern)</th><th>Square Yards</th><th>Typical Dimensions</th></tr>
            </thead>
            <tbody>
              <tr><td>3 marla</td><td>675</td><td>75</td><td>18 × 38 ft</td></tr>
              <tr><td>5 marla</td><td>1,125</td><td>125</td><td>25 × 45 ft</td></tr>
              <tr><td>10 marla</td><td>2,250</td><td>250</td><td>35 × 65 ft</td></tr>
              <tr><td>1 kanal</td><td>4,500</td><td>500</td><td>50 × 90 ft</td></tr>
              <tr><td>2 kanal</td><td>9,000</td><td>1,000</td><td>75 × 120 ft</td></tr>
            </tbody>
          </table>
          <p>
            Why do marla sizes differ between cities? The short answer is history — read our full{' '}
            <Link href="/guides/marla-kanal-explained">marla and kanal guide</Link> to learn which
            standard your society uses and how it changes per-marla pricing. Planning to build?
            Estimate your budget with the{' '}
            <Link href="/tools/construction-cost-calculator">construction cost calculator</Link>.
          </p>
        </div>

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
