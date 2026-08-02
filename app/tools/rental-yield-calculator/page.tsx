import type { Metadata } from 'next'
import HeroBg from '@/components/HeroBg'
import Link from 'next/link'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import RentalYieldCalculator from './Calculator'

export const metadata: Metadata = {
  title: 'Rental Yield Calculator Pakistan — Gross & Net | MedaGhar',
  description:
    'Calculate gross and net rental yield for property in Pakistan. Enter value, monthly rent, maintenance and vacancy to see your true return and how it compares.',
  alternates: { canonical: 'https://medaghar.com/tools/rental-yield-calculator' },
  openGraph: {
    title: 'Rental Yield Calculator Pakistan | MedaGhar',
    description:
      'Work out gross and net rental yield on houses, flats and shops — with vacancy and maintenance factored in.',
    url: 'https://medaghar.com/tools/rental-yield-calculator',
    type: 'website',
  },
}

const FAQS = [
  {
    question: 'What is a good rental yield in Pakistan?',
    answer:
      'Residential property in Pakistani cities typically yields 3–6% gross per year — flats often sit at the higher end and houses in premium areas at the lower end. Commercial property (shops, offices) typically yields 6–9%. Anything above 6% gross for residential is good; below 3% means you are paying mostly for expected capital gains.',
  },
  {
    question: 'How do I calculate rental yield?',
    answer:
      'Gross yield = (monthly rent × 12) ÷ property value × 100. Net yield subtracts real costs first: deduct vacancy (months the property sits empty), annual maintenance and repairs (about 1% of value is a common rule of thumb), property tax and any society or agent charges, then divide by value. Net yield is the honest number to compare against bank deposits or savings certificates.',
  },
  {
    question: 'Why are rental yields in Pakistan so low compared to other countries?',
    answer:
      'Because property prices have historically been driven by capital gains expectations, file trading and parking of wealth rather than rental income. Prices rise faster than rents, compressing yields. This is also why flats — which appreciate more slowly but rent relatively well — often out-yield houses, and why commercial property out-yields both.',
  },
  {
    question: 'Do flats give better rental yields than houses?',
    answer:
      'Usually yes. A flat in Lahore, Karachi or Islamabad commonly yields 4–7% gross because the purchase price is lower relative to achievable rent, while a house in a premium society may yield only 2–4% since land value dominates its price but rent is paid mainly for the covered living space. Houses, however, tend to appreciate faster because of that land component.',
  },
  {
    question: 'Is rental income taxable in Pakistan?',
    answer:
      'Yes. Rental income is taxable under the Income Tax Ordinance at progressive slab rates, and tenants who are companies or government bodies withhold tax on rent payments. Provincial property tax (based on annual rental value) also applies in urban areas. Factor these into the "other costs" field when computing net yield, and confirm current slabs with FBR or a tax adviser.',
  },
]

export default function RentalYieldCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Rental Yield Calculator', path: '/tools/rental-yield-calculator' },
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
            <span>Rental Yield Calculator</span>
          </nav>
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            Rental Yield Calculator Pakistan
          </h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">
            See what a property really earns. Enter the value and monthly rent, factor in vacancy
            and maintenance, and compare the gross and net yield against typical Pakistani returns.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <RentalYieldCalculator />

        <AdSlot className="my-[34px]" />

        {/* SEO content */}
        <div className="guide-content bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
          <h2>What is rental yield and why it matters</h2>
          <p>
            Rental yield is the annual rent a property generates expressed as a percentage of its
            value — the property market&apos;s equivalent of an interest rate. Gross yield uses
            the headline rent; net yield deducts the costs landlords actually face: vacancy
            between tenants, maintenance and repairs, property tax and society charges. Net yield
            is the number to compare against National Savings certificates, bank deposits or
            mutual funds when deciding whether a property earns its keep.
          </p>
          <h2>Why Pakistani investors under-weight yield</h2>
          <p>
            For decades the Pakistani market rewarded buying plots and waiting — capital gains
            dwarfed rental income, and files in new societies traded like shares. The result is a
            market where many investors never compute yield at all. That works while prices climb,
            but in flat or falling markets a property yielding 2% gross quietly loses to
            inflation. Serious investors look at total return: yield plus realistic appreciation,
            net of taxes and transaction costs. A high-yield property also keeps paying you while
            you wait, which a vacant plot never does.
          </p>
          <h2>Houses vs flats vs commercial — typical yields</h2>
          <ul>
            <li><strong>Houses</strong> — usually 2–4% gross. Land value dominates the price, but tenants pay rent for living space, so yields are lowest where land is dearest.</li>
            <li><strong>Flats / apartments</strong> — usually 4–7% gross. Lower entry price relative to rent makes them the yield play in Lahore, Karachi and Islamabad.</li>
            <li><strong>Commercial (shops, offices)</strong> — usually 6–9% gross, with longer leases but higher vacancy risk and bigger tenant-quality swings.</li>
          </ul>
          <p>
            Hunting for an income property? See our guide to the{' '}
            <Link href="/guides/best-areas-to-invest-lahore">best areas to invest in Lahore</Link>{' '}
            and browse current <Link href="/rent">rental listings</Link> to benchmark achievable
            rents before you buy.
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
