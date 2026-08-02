import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { breadcrumbJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'
import { FaCalculator, FaRulerCombined, FaHardHat, FaFileInvoiceDollar, FaChartLine, FaArrowRight } from 'react-icons/fa'

export const metadata: Metadata = {
  title: 'Free Property Calculators & Tools for Pakistan | MedaGhar',
  description:
    'Free Pakistani real estate tools: home loan installment calculator, marla to square feet converter, construction cost estimator, property tax calculator and rental yield calculator.',
  alternates: { canonical: 'https://medaghar.com/tools' },
  openGraph: {
    title: 'Free Property Calculators & Tools for Pakistan | MedaGhar',
    description:
      'Home loan calculator, marla converter, construction cost estimator, property tax and rental yield calculators — built for Pakistan.',
    url: 'https://medaghar.com/tools',
    type: 'website',
  },
}

const TOOLS = [
  {
    href: '/tools/mortgage-calculator',
    icon: FaCalculator,
    title: 'Home Loan Calculator',
    description:
      'Calculate your monthly installment for bank home financing — works for conventional markup and Islamic diminishing musharakah plans.',
  },
  {
    href: '/tools/area-converter',
    icon: FaRulerCombined,
    title: 'Marla & Kanal Converter',
    description:
      'Convert between marla, kanal, square feet, square yards (gaz), square metres and acres — supports both 225 and 272.25 sq ft marla standards.',
  },
  {
    href: '/tools/construction-cost-calculator',
    icon: FaHardHat,
    title: 'Construction Cost Calculator',
    description:
      'Estimate the cost of building your house in Pakistan — grey structure and finishing, from 3 marla to 2 kanal.',
  },
  {
    href: '/tools/property-tax-calculator',
    icon: FaFileInvoiceDollar,
    title: 'Property Tax Calculator',
    description:
      'Estimate buying and selling taxes: FBR advance tax (236K/236C), stamp duty and registration — with filer and non-filer rates.',
  },
  {
    href: '/tools/rental-yield-calculator',
    icon: FaChartLine,
    title: 'Rental Yield Calculator',
    description:
      'Work out gross and net rental yield on any property to compare investment options like a professional.',
  },
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
        ])}
      />

      <div className="relative text-white overflow-hidden">
        <Image
          src="/images/home-loans-hero.jpg"
          alt="Property calculators for Pakistan"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-800/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px]">
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            Free Property Tools & Calculators
          </h1>
          <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl">
            Built for the Pakistani market — marlas, kanals, PKR lakh/crore amounts, FBR taxes and
            bank financing, all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-[34px] group"
            >
              <tool.icon className="text-[34px] text-cyan-600 mb-[13px] group-hover:scale-110 transition-transform" />
              <h2 className="text-[19px] font-bold text-gray-900 mb-[8px] group-hover:text-cyan-700 transition">
                {tool.title}
              </h2>
              <p className="text-[14px] text-gray-600 mb-[13px]">{tool.description}</p>
              <span className="inline-flex items-center gap-[8px] text-cyan-600 font-semibold text-[14px] group-hover:gap-[13px] transition-all">
                Open Calculator <FaArrowRight />
              </span>
            </Link>
          ))}
        </div>

        <AdSlot className="my-[34px]" />

        <div className="bg-white rounded-2xl shadow-md p-[34px]">
          <h2 className="text-[21px] font-bold text-gray-900 mb-[13px]">
            Why use MedaGhar property tools?
          </h2>
          <p className="text-gray-600 mb-[13px]">
            Most online calculators are built for Western markets — they assume dollar amounts,
            square footage and US-style mortgages. Our tools speak the language of Pakistani real
            estate: prices in lakhs and crores, plots in marlas and kanals, financing based on how
            Pakistani banks actually structure home loans, and taxes based on FBR and provincial
            rules.
          </p>
          <p className="text-gray-600">
            Want the background knowledge too? Read our free{' '}
            <Link href="/guides" className="text-cyan-600 underline hover:text-cyan-700">
              Pakistan property guides
            </Link>{' '}
            covering buying, selling, taxes, financing and investment.
          </p>
        </div>
      </div>
    </main>
  )
}
