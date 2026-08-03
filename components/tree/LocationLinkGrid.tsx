import Link from 'next/link'

export interface LocationLink {
  name: string
  href: string
  count: number
}

/**
 * Grid of child-location links (areas within a city, phases within an area).
 *
 * Only locations with inventory are passed in — linking to gated pages would
 * spend crawl budget on URLs that are noindex anyway.
 */
export default function LocationLinkGrid({
  title,
  links,
}: {
  title: string
  links: LocationLink[]
}) {
  if (links.length === 0) return null

  return (
    <section className="bg-white rounded-xl shadow-sm p-[21px] lg:p-[34px]">
      <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[13px]">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-slate-50 hover:bg-cyan-50 border border-gray-200 hover:border-cyan-600 rounded-lg px-[13px] py-[13px] transition group"
          >
            <span className="block text-[14px] font-medium text-gray-900 group-hover:text-cyan-700 transition">
              {l.name}
            </span>
            <span className="block text-[12px] text-gray-500">
              {l.count} {l.count === 1 ? 'listing' : 'listings'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
