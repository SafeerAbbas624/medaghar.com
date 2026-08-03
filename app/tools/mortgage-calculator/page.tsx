import type { Metadata } from 'next'
import HeroBg from '@/components/HeroBg'
import Link from 'next/link'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import MortgageCalculator from './Calculator'

export const metadata: Metadata = {
  title: 'Home Loan Calculator Pakistan — Monthly Installment Calculator | MedaGhar',
  description:
    'Free home loan installment calculator for Pakistan. Calculate monthly payments for bank house financing including Meezan, HBL, Bank Alfalah and HBFC plans.',
  alternates: { canonical: 'https://medaghar.com/tools/mortgage-calculator' },
  openGraph: {
    title: 'Home Loan Calculator Pakistan | MedaGhar',
    description:
      'Calculate your monthly home financing installment — built for Pakistani banks, KIBOR-linked rates and Islamic financing.',
    url: 'https://medaghar.com/tools/mortgage-calculator',
    type: 'website',
  },
}

const FAQS = [
  {
    question: 'How is a home loan installment calculated in Pakistan?',
    answer:
      'Banks use standard amortization: the financing amount, the annual markup or profit rate (usually KIBOR plus a bank spread of 2–4%), and the tenure in months determine a fixed monthly installment. Early installments are mostly markup; later ones are mostly principal. Islamic banks reach a similar installment through diminishing musharakah (joint ownership with monthly rent and unit purchase).',
  },
  {
    question: 'How much down payment do I need for house financing in Pakistan?',
    answer:
      'Most banks finance 70–85% of the property value, so you need 15–30% as down payment plus transaction costs (transfer fees and taxes, typically another 5–8% of the price). A larger down payment lowers both your installment and the total markup you pay.',
  },
  {
    question: 'What income do I need to qualify for a home loan?',
    answer:
      'Banks generally cap your total monthly debt obligations at 40–50% of net verified income. As a rule of thumb, your net monthly income should be at least double the expected installment. Salaried applicants need salary slips and bank statements; self-employed applicants need business bank statements and tax returns.',
  },
  {
    question: 'Is Islamic home financing cheaper than a conventional home loan?',
    answer:
      'Not automatically — Islamic and conventional products are usually priced similarly because both reference KIBOR. The difference is structural: in diminishing musharakah the bank co-owns the property and you buy its share over time while paying rent on the remaining share. Compare the total payable amount and fees of specific offers rather than assuming either is cheaper.',
  },
  {
    question: 'Can overseas Pakistanis get home financing?',
    answer:
      'Yes. Several banks offer non-resident home financing, and the Roshan Apna Ghar scheme through Roshan Digital Accounts was designed specifically for overseas Pakistanis, covering both ready and under-construction property.',
  },
]

export default function MortgageCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Home Loan Calculator', path: '/tools/mortgage-calculator' },
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
            <span>Home Loan Calculator</span>
          </nav>
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            Home Loan Calculator Pakistan
          </h1>
          <p className="text-[16px] text-slate-300 max-w-3xl">
            Estimate your monthly installment for bank house financing — conventional or Islamic.
            Adjust the price, down payment, rate and tenure to see what fits your budget.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <MortgageCalculator />

        <AdSlot className="my-[34px]" />

        {/* SEO content */}
        <div className="guide-content bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
          <h2>How home financing works in Pakistan</h2>
          <p>
            Pakistani banks finance houses, flats and construction through two main structures.
            Conventional banks charge markup linked to KIBOR (the Karachi Interbank Offered Rate)
            plus a spread, while Islamic banks — led by Meezan Bank&apos;s Easy Home — use
            diminishing musharakah, where the bank and customer jointly own the property and the
            customer gradually buys out the bank&apos;s share. In both cases you pay a monthly
            installment over a tenure of typically 3 to 25 years.
          </p>
          <p>
            Because rates follow the State Bank&apos;s policy rate, your quoted rate can change at
            each reset period (commonly every 6 or 12 months). When budgeting, test your
            installment at a couple of percentage points above today&apos;s rate to make sure you
            can absorb a rise.
          </p>
          <h2>Major home financing providers</h2>
          <ul>
            <li><strong>Meezan Bank (Easy Home)</strong> — the largest Islamic housing portfolio in the country.</li>
            <li><strong>HBL (HomeValue)</strong>, <strong>Bank Alfalah</strong>, <strong>MCB</strong>, <strong>UBL</strong> — major conventional and Islamic-window options.</li>
            <li><strong>Faysal Bank</strong> — fully Islamic financing products.</li>
            <li><strong>HBFC (House Building Finance Company)</strong> — the specialist state-owned housing financier, often relevant for lower-income segments.</li>
          </ul>
          <p>
            For a full walkthrough of eligibility, documents and hidden costs, read our{' '}
            <Link href="/guides/home-loan-pakistan-guide">complete home loan guide for Pakistan</Link>{' '}
            or compare banks on our <Link href="/home-loans">home financing page</Link>. When
            you&apos;re ready, <Link href="/residential-for-sale">browse properties for sale</Link> and use this
            calculator on any listing you like.
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
