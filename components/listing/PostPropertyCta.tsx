import Link from 'next/link'
import { FaPlus, FaCheckCircle } from 'react-icons/fa'

/**
 * End-of-results conversion block. Sits after the listings and pagination,
 * before the SEO copy and FAQ.
 */
export default function PostPropertyCta({ forRent = false }: { forRent?: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-800 via-cyan-700 to-teal-700 text-white">
      {/* Subtle house motif, decorative only */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute -right-6 -bottom-8 w-56 h-56 text-white/10 pointer-events-none"
      >
        <path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8z" />
      </svg>

      <div className="relative p-[34px] lg:p-[55px] max-w-3xl">
        <h2 className="text-[24px] lg:text-[34px] font-bold mb-[13px] leading-tight">
          {forRent ? 'Have a property to rent out?' : 'Want to sell your property?'}
        </h2>
        <p className="text-[15px] lg:text-[16px] text-cyan-50 mb-[21px] leading-relaxed">
          Post it on MedaGhar in a few minutes and reach buyers and tenants across Pakistan.
          Listing is free, and we never take commission — enquiries come straight to you.
        </p>

        <ul className="grid sm:grid-cols-3 gap-[13px] mb-[34px] text-[14px]">
          {['Free to list', 'No commission, ever', 'Direct buyer contact'].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <FaCheckCircle className="text-cyan-200 flex-shrink-0" /> {t}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-[13px]">
          <Link
            href={forRent ? '/post-rent' : '/sell'}
            className="inline-flex items-center gap-2 bg-white text-cyan-800 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-50 transition shadow-lg"
          >
            <FaPlus className="text-[13px]" />
            {forRent ? 'Post Your Rental Free' : 'Post Your Property Free'}
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border-2 border-white/40 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-white/10 transition"
          >
            See featured options
          </Link>
        </div>
      </div>
    </section>
  )
}
