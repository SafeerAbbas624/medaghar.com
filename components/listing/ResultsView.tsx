'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaThList, FaTh } from 'react-icons/fa'
import PropertyListItem, { type ListItemProperty } from '@/components/PropertyListItem'
import PropertyCard from '@/components/PropertyCard'

interface Props {
  listings: ListItemProperty[]
  /** Featured listings, pinned above and repeated on every page. */
  featured: ListItemProperty[]
  total: number
  page: number
  totalPages: number
  basePath: string
  /** Query string to preserve across pagination, without `page`. */
  queryString: string
}

const VIEW_KEY = 'medaghar-view-mode'

/**
 * Results area: view toggle, pinned featured block, listings and pagination.
 *
 * Defaults to list view. Featured listings sit above the paginated set and
 * repeat on every page, so a promoted listing is seen regardless of depth.
 */
export default function ResultsView({
  listings,
  featured,
  total,
  page,
  totalPages,
  basePath,
  queryString,
}: Props) {
  const [view, setView] = useState<'list' | 'grid'>('list')

  // Remember the choice, but render list-first so SSR and first paint agree.
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY)
    if (saved === 'grid' || saved === 'list') setView(saved)
  }, [])

  function choose(v: 'list' | 'grid') {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  function pageHref(n: number): string {
    const qs = new URLSearchParams(queryString)
    if (n > 1) qs.set('page', String(n))
    else qs.delete('page')
    const s = qs.toString()
    return basePath + (s ? `?${s}` : '')
  }

  const Grid = ({ items }: { items: ListItemProperty[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[21px]">
      {items.map((p) => (
        <PropertyCard key={p.id} property={p as never} />
      ))}
    </div>
  )

  const List = ({ items }: { items: ListItemProperty[] }) => (
    <div className="space-y-[13px]">
      {items.map((p) => (
        <PropertyListItem key={p.id} property={p} />
      ))}
    </div>
  )

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-[21px]">
        <p className="text-[14px] text-gray-600">
          <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>{' '}
          {total === 1 ? 'property' : 'properties'} found
          {totalPages > 1 && <span className="text-gray-400"> · page {page} of {totalPages}</span>}
        </p>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => choose('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
            className={`p-2 rounded transition ${
              view === 'list' ? 'bg-cyan-700 text-white' : 'text-gray-500 hover:text-cyan-700'
            }`}
          >
            <FaThList className="text-[14px]" />
          </button>
          <button
            onClick={() => choose('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            className={`p-2 rounded transition ${
              view === 'grid' ? 'bg-cyan-700 text-white' : 'text-gray-500 hover:text-cyan-700'
            }`}
          >
            <FaTh className="text-[14px]" />
          </button>
        </div>
      </div>

      {/* Featured — pinned, unaffected by pagination */}
      {featured.length > 0 && (
        <section className="mb-[34px]">
          <div className="flex items-center gap-2 mb-[13px]">
            <span className="bg-copper-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              ★ FEATURED
            </span>
            <span className="text-[13px] text-gray-500">Promoted listings for this search</span>
          </div>
          {view === 'list' ? <List items={featured} /> : <Grid items={featured} />}
        </section>
      )}

      {/* Results */}
      {listings.length > 0 ? (
        view === 'list' ? <List items={listings} /> : <Grid items={listings} />
      ) : (
        featured.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-[55px] text-center">
            <h3 className="text-[18px] font-bold text-gray-900 mb-[8px]">
              No properties match these filters
            </h3>
            <p className="text-[14px] text-gray-600 mb-[21px]">
              Try widening the price range or removing a filter.
            </p>
            <Link
              href={basePath}
              className="inline-block bg-cyan-700 text-white px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition"
            >
              Clear filters
            </Link>
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2 mt-[34px]" aria-label="Pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} rel="prev" className={pageBtn}>← Previous</Link>
          ) : (
            <span className={pageBtnDisabled}>← Previous</span>
          )}

          {pageWindow(page, totalPages).map((n, i) =>
            n === '…' ? (
              <span key={`gap-${i}`} className="px-2 text-gray-400">…</span>
            ) : (
              <Link
                key={n}
                href={pageHref(n as number)}
                aria-current={n === page ? 'page' : undefined}
                className={
                  n === page
                    ? 'px-4 py-2 rounded-lg bg-cyan-700 text-white text-[14px] font-semibold'
                    : pageBtn
                }
              >
                {n}
              </Link>
            )
          )}

          {page < totalPages ? (
            <Link href={pageHref(page + 1)} rel="next" className={pageBtn}>Next →</Link>
          ) : (
            <span className={pageBtnDisabled}>Next →</span>
          )}
        </nav>
      )}
    </div>
  )
}

const pageBtn =
  'px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-[14px] font-medium hover:border-cyan-600 hover:text-cyan-700 transition'
const pageBtnDisabled =
  'px-4 py-2 rounded-lg border border-gray-200 text-gray-300 text-[14px] font-medium cursor-not-allowed'

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const from = Math.max(2, current - 1)
  const to = Math.min(total - 1, current + 1)
  if (from > 2) out.push('…')
  for (let i = from; i <= to; i++) out.push(i)
  if (to < total - 1) out.push('…')
  out.push(total)
  return out
}
