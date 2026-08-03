import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'
import JsonLd from '@/components/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'

export interface Crumb {
  name: string
  path: string
}

/**
 * Visible breadcrumb trail plus BreadcrumbList JSON-LD.
 *
 * Because listing URLs are flat, this is how search engines learn the
 * hierarchy — so every tree and detail page should render it.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            return (
              <li key={item.path} className="flex items-center gap-2">
                {isLast ? (
                  <span className="text-gray-900 font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-cyan-700 transition">
                      {item.name}
                    </Link>
                    <FaChevronRight className="text-[9px] text-gray-400" aria-hidden />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
