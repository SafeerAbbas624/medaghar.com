import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import LeadForm from '@/components/LeadForm'
import { FaCalculator, FaArrowRight, FaUniversity } from 'react-icons/fa'

export const metadata: Metadata = {
  title: 'Home Loans in Pakistan — Compare Bank House Financing | MedaGhar',
  description:
    'Compare home financing from Meezan, HBL, Bank Alfalah, MCB, Faysal and HBFC. Islamic and conventional plans, eligibility, documents and a free installment calculator.',
  alternates: { canonical: 'https://medaghar.com/home-loans' },
  openGraph: {
    title: 'Home Loans in Pakistan — Compare Bank House Financing | MedaGhar',
    description:
      'Compare Islamic and conventional home financing options in Pakistan and calculate your monthly installment free.',
    url: 'https://medaghar.com/home-loans',
    type: 'website',
  },
}

const BANKS = [
  {
    name: 'Meezan Bank — Easy Home',
    type: 'Islamic (Diminishing Musharakah)',
    highlights: 'Largest Islamic housing portfolio in Pakistan; buy, build, renovate and balance-transfer options; tenors up to 25 years.',
  },
  {
    name: 'HBL — HomeValue',
    type: 'Conventional & Islamic window',
    highlights: 'Wide branch network; financing for purchase, construction and renovation; salaried and self-employed programs.',
  },
  {
    name: 'Bank Alfalah — Home Finance',
    type: 'Conventional & Islamic',
    highlights: 'Competitive KIBOR-linked pricing; balance transfer facility; quick processing for salaried applicants.',
  },
  {
    name: 'MCB — Home Loans',
    type: 'Conventional',
    highlights: 'Purchase, construction and renovation products with flexible tenors and top-up options.',
  },
  {
    name: 'Faysal Bank — Islamic Housing',
    type: 'Fully Islamic',
    highlights: 'Shariah-compliant housing finance across purchase, construction and BTF after full Islamic conversion.',
  },
  {
    name: 'HBFC — House Building Finance Company',
    type: 'Specialist housing financier',
    highlights: 'State-backed specialist lender, historically focused on smaller loans and lower-income segments including Ghar Pakistan schemes.',
  },
]

const FAQS = [
  {
    question: 'Which bank gives the best home loan in Pakistan?',
    answer:
      'There is no single best bank — pricing is KIBOR-linked and similar across major banks. Compare the effective rate (KIBOR + spread), processing fee, insurance/takaful costs, early settlement charges and approval speed for your profile. Meezan leads in Islamic financing volume, while HBL, Bank Alfalah and MCB are strong conventional options.',
  },
  {
    question: 'What is the minimum salary for a home loan in Pakistan?',
    answer:
      'Most banks expect a net monthly income of at least PKR 75,000–150,000 depending on the city and loan size, and your total monthly installments must stay within roughly 40–50% of net income. Higher income or a co-applicant increases the amount you can borrow.',
  },
  {
    question: 'How much loan can I get on my salary?',
    answer:
      'As a rule of thumb banks allow installments up to 40–50% of net income. For example, at a 45% debt ratio and PKR 200,000 net salary, you could support an installment of about PKR 90,000 — roughly PKR 60–70 lakh of financing over 20 years at typical rates. Use our calculator to model your own numbers.',
  },
  {
    question: 'Can I get house financing without being a tax filer?',
    answer:
      'Banks strongly prefer filers, and the buying process itself is more expensive for non-filers because FBR advance tax on the purchase is several times higher. Becoming a filer before applying usually pays for itself.',
  },
]

export default function HomeLoansPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Home Loans', path: '/home-loans' },
          ]),
          faqJsonLd(FAQS),
        ]}
      />

      {/* Hero with photo */}
      <div className="relative text-white overflow-hidden">
        <Image
          src="/images/home-loans-hero.jpg"
          alt="Home financing in Pakistan"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-800/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px]">
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            Home Loans & House Financing in Pakistan
          </h1>
          <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl mb-[21px]">
            Compare Islamic and conventional home financing from Pakistan&apos;s major banks, check
            your eligibility, and calculate your monthly installment — free.
          </p>
          <Link
            href="/tools/mortgage-calculator"
            className="inline-flex items-center gap-[8px] bg-white text-slate-900 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-50 transition"
          >
            <FaCalculator /> Installment Calculator
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[34px]">
          {/* Banks list */}
          <div className="lg:col-span-2">
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
              Major Home Financing Providers
            </h2>
            <div className="space-y-[13px]">
              {BANKS.map((bank) => (
                <div key={bank.name} className="bg-white rounded-xl shadow-md p-[21px]">
                  <div className="flex items-start gap-[13px]">
                    <FaUniversity className="text-[26px] text-cyan-600 mt-[3px] flex-shrink-0" />
                    <div>
                      <h3 className="text-[16px] font-bold text-gray-900">{bank.name}</h3>
                      <span className="inline-block bg-cyan-50 text-cyan-700 text-[12px] font-semibold px-[8px] py-[3px] rounded-full my-[5px]">
                        {bank.type}
                      </span>
                      <p className="text-[14px] text-gray-600">{bank.highlights}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-gray-400 mt-[13px]">
              Information is indicative; products, rates and eligibility change frequently. Confirm
              directly with each bank before applying. MedaGhar is not a lender.
            </p>

            <AdSlot className="my-[34px]" />

            <div className="guide-content bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
              <h2>Before you apply: a 4-step checklist</h2>
              <ol>
                <li><strong>Become a tax filer.</strong> It cuts your purchase taxes sharply and improves approval odds.</li>
                <li><strong>Check your debt ratio.</strong> Keep existing loan installments low — banks cap total obligations near 40–50% of net income.</li>
                <li><strong>Prepare documents early.</strong> CNIC, salary slips or business proofs, 12-month bank statements and the property file move your case fastest.</li>
                <li><strong>Budget beyond the installment.</strong> Processing fees, valuation, takaful/insurance and transfer taxes add several lakh on a typical purchase — estimate them with our <Link href="/tools/property-tax-calculator">property tax calculator</Link>.</li>
              </ol>
              <p>
                For the complete picture — eligibility, Islamic vs conventional structures and
                provider comparison — read the{' '}
                <Link href="/guides/home-loan-pakistan-guide">full home loan guide</Link>.
              </p>
            </div>

            {/* FAQ */}
            <section className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px] mt-[34px]">
              <h2 className="text-[21px] font-bold text-gray-900 mb-[21px]">
                Frequently Asked Questions
              </h2>
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-[21px]">
              <LeadForm
                propertyId=""
                intent="home-loan"
                title="Get Free Financing Help"
                subtitle="Tell us your budget and city — we will connect you with the right financing option, free."
              />
              <div className="bg-white rounded-xl shadow-md p-[21px]">
                <h3 className="text-[16px] font-bold text-gray-900 mb-[13px]">Quick Tools</h3>
                <div className="space-y-[8px]">
                  <Link href="/tools/mortgage-calculator" className="flex items-center justify-between text-[14px] text-cyan-700 hover:text-cyan-700 font-medium py-[5px]">
                    Installment Calculator <FaArrowRight className="text-[12px]" />
                  </Link>
                  <Link href="/tools/property-tax-calculator" className="flex items-center justify-between text-[14px] text-cyan-700 hover:text-cyan-700 font-medium py-[5px]">
                    Property Tax Calculator <FaArrowRight className="text-[12px]" />
                  </Link>
                  <Link href="/guides/home-loan-pakistan-guide" className="flex items-center justify-between text-[14px] text-cyan-700 hover:text-cyan-700 font-medium py-[5px]">
                    Home Loan Guide <FaArrowRight className="text-[12px]" />
                  </Link>
                  <Link href="/buy" className="flex items-center justify-between text-[14px] text-cyan-700 hover:text-cyan-700 font-medium py-[5px]">
                    Browse Houses for Sale <FaArrowRight className="text-[12px]" />
                  </Link>
                </div>
              </div>
              <AdSlot format="vertical" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
