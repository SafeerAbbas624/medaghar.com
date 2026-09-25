import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found | MedaGhar',
  robots: { index: false, follow: true },
}

const links = [
  { href: '/residential-for-sale', label: 'Homes for sale' },
  { href: '/residential-for-rent', label: 'Homes for rent' },
  { href: '/for-sale/plot', label: 'Plots' },
  { href: '/commercial-for-sale', label: 'Commercial' },
]

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-slate-50 flex items-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px] text-center">
        <p className="text-[16px] font-semibold text-cyan-600 mb-[13px]">404</p>
        <h1 className="text-[34px] sm:text-[55px] font-bold text-slate-900 mb-[21px]">
          This page isn&apos;t here
        </h1>
        <p className="text-[16px] lg:text-[21px] text-slate-600 mb-[34px]">
          The listing may have been sold, rented or removed, or the link may be wrong.
        </p>
        <div className="flex flex-col sm:flex-row gap-[13px] justify-center mb-[34px]">
          <Link
            href="/"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-[34px] py-[13px] rounded-lg transition"
          >
            Go to homepage
          </Link>
          <Link
            href="/contact"
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold px-[34px] py-[13px] rounded-lg transition"
          >
            Contact us
          </Link>
        </div>
        <nav aria-label="Popular searches" className="flex flex-wrap gap-[13px] justify-center">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-cyan-600 hover:text-cyan-700 hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
