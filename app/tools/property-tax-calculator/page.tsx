import type { Metadata } from 'next'
import HeroBg from '@/components/HeroBg'
import Link from 'next/link'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import PropertyTaxCalculator from './Calculator'

export const metadata: Metadata = {
  title: 'Property Tax Calculator Pakistan — Buyer & Seller Taxes',
  description:
    'Estimate property purchase and sale taxes in Pakistan: advance tax u/s 236K and 236C, stamp duty by province, filer vs non-filer rates — FY2025-26 indicative.',
  alternates: { canonical: 'https://medaghar.com/tools/property-tax-calculator' },
  openGraph: {
    title: 'Property Tax Calculator Pakistan | MedaGhar',
    description:
      'Itemised buyer and seller taxes on property transactions — 236K, 236C and stamp duty with editable filer and non-filer rates.',
    url: 'https://medaghar.com/tools/property-tax-calculator',
    type: 'website',
  },
}

const FAQS = [
  {
    question: 'What taxes does a property buyer pay in Pakistan?',
    answer:
      'A buyer pays federal advance tax under section 236K (indicatively 3% for filers, 6% for late filers and 10.5% for non-filers in FY2025-26, with higher rates possible on high-value properties) plus provincial stamp duty (roughly 1–2% depending on province) and a registration fee. Housing societies and authorities like DHA also charge their own transfer and membership fees on top.',
  },
  {
    question: 'What taxes does a property seller pay in Pakistan?',
    answer:
      'A seller pays advance tax under section 236C at the time of transfer — indicatively 3% for filers, 6% for late filers and 10% for non-filers in FY2025-26. This is adjustable against capital gains tax on the sale, which is assessed separately in the seller’s income tax return. Rates change with each Finance Act, so verify current figures with FBR.',
  },
  {
    question: 'What is the difference between FBR value and DC rate?',
    answer:
      'The DC (deputy commissioner) rate is the provincial valuation used for stamp duty and registration, while the FBR valuation table sets the minimum value for federal taxes like 236K and 236C. Both are usually below actual market price. Tax is charged on the higher of the declared price and the applicable official valuation — you cannot reduce tax by declaring a lower price.',
  },
  {
    question: 'How much extra tax do non-filers pay on property?',
    answer:
      'Substantially more. On a purchase, a non-filer indicatively pays 10.5% advance tax versus 3% for a filer — on a PKR 1.5 crore property that is roughly PKR 15.75 lakh versus PKR 4.5 lakh. On higher-value properties non-filer rates can be even higher. Filing your income tax return and appearing on the Active Taxpayer List before the transaction usually saves far more than the cost of filing.',
  },
  {
    question: 'Is advance tax on property adjustable or a final tax?',
    answer:
      'Advance tax under 236K (buyer) and 236C (seller) is generally adjustable for filers — it counts towards your income tax liability for the year and can be claimed in your return. For non-filers the higher withholding effectively becomes a penalty. Treatment can change between Finance Acts, so confirm the current rules with a tax adviser.',
  },
]

export default function PropertyTaxCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Property Tax Calculator', path: '/tools/property-tax-calculator' },
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
            <span>Property Tax Calculator</span>
          </nav>
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            Property Tax Calculator Pakistan — Buyer &amp; Seller Taxes
          </h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">
            Estimate the federal advance tax and provincial stamp duty on your property purchase
            or sale — with editable filer, late-filer and non-filer rates for every province.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <PropertyTaxCalculator />

        <AdSlot className="my-[34px]" />

        {/* SEO content */}
        <div className="guide-content bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
          <h2>Understanding 236K and 236C — the advance taxes on property</h2>
          <p>
            Every registered property transaction in Pakistan triggers federal withholding taxes
            under the Income Tax Ordinance. The <strong>buyer</strong> pays advance tax under{' '}
            <strong>section 236K</strong> and the <strong>seller</strong> pays under{' '}
            <strong>section 236C</strong>, both collected by the registrar or transferring
            authority at the time of transfer and calculated on the higher of the declared price
            and the official valuation. For filers these amounts are adjustable against the
            year&apos;s income tax; for non-filers the much higher rates act as a penalty for
            staying outside the tax net.
          </p>
          <h2>Filer vs late filer vs non-filer</h2>
          <p>
            Your rate depends on your status on FBR&apos;s Active Taxpayer List (ATL) on the
            transaction date. A <strong>filer</strong> filed last year&apos;s return on time; a{' '}
            <strong>late filer</strong> filed after the deadline and pays roughly double; a{' '}
            <strong>non-filer</strong> is not on the ATL at all and pays the steepest rates —
            and on higher-value properties the Finance Act applies progressively higher non-filer
            tiers than the headline rate shown here. If you are planning a transaction, becoming
            a filer beforehand is usually the single biggest tax saving available.
          </p>
          <h2>FBR valuation tables vs DC rate</h2>
          <p>
            Two official valuations matter: the provincial <strong>DC rate</strong> (used for
            stamp duty and registration fee) and the federal <strong>FBR valuation table</strong>{' '}
            (the floor for 236K/236C). Both are periodically revised and differ area by area.
            Stamp duty itself is a provincial levy, which is why Punjab, Sindh, KPK, Balochistan
            and Islamabad ICT all charge different rates — and provinces add registration,
            mutation and town fees on top.
          </p>
          <p>
            For the full picture including capital gains tax and society transfer fees, read our{' '}
            <Link href="/guides/property-taxes-pakistan">property taxes in Pakistan guide</Link>,
            and see the step-by-step{' '}
            <Link href="/guides/property-transfer-procedure-pakistan">property transfer procedure</Link>{' '}
            before you book an appointment with the registrar.
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
