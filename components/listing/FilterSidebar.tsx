'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaFilter, FaTimes, FaChevronDown, FaSearch } from 'react-icons/fa'

export interface FilterState {
  purpose: 'for-sale' | 'for-rent'
  typeSlug: string
  citySlug: string
  areaSlug: string
  subAreaSlug: string
  minPrice: string
  maxPrice: string
  bedrooms: string
  bathrooms: string
  minMarla: string
  maxMarla: string
  fsboOnly: boolean
}

export const EMPTY_FILTERS: FilterState = {
  purpose: 'for-sale',
  typeSlug: '',
  citySlug: '',
  areaSlug: '',
  subAreaSlug: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  minMarla: '',
  maxMarla: '',
  fsboOnly: false,
}

interface TypeOption {
  slug: string
  label: string
  category: 'residential' | 'commercial'
  hasAreaDepth: boolean
}

interface CityOption { slug: string; name: string }
interface AreaOption { slug: string; name: string; subAreas: { slug: string; name: string }[] }

/** Price presets in PKR — the brackets Pakistanis actually search in. */
const SALE_PRICES = [
  { label: 'Under 50 Lakh', min: '', max: '5000000' },
  { label: '50 Lakh – 1 Crore', min: '5000000', max: '10000000' },
  { label: '1 – 2 Crore', min: '10000000', max: '20000000' },
  { label: '2 – 5 Crore', min: '20000000', max: '50000000' },
  { label: 'Above 5 Crore', min: '50000000', max: '' },
]
const RENT_PRICES = [
  { label: 'Under 25,000', min: '', max: '25000' },
  { label: '25,000 – 50,000', min: '25000', max: '50000' },
  { label: '50,000 – 1 Lakh', min: '50000', max: '100000' },
  { label: '1 – 2 Lakh', min: '100000', max: '200000' },
  { label: 'Above 2 Lakh', min: '200000', max: '' },
]

interface Props {
  types: TypeOption[]
  initial: Partial<FilterState>
}

/**
 * Filter sidebar with SEO-aware routing.
 *
 * Location and type choices resolve to a real tree URL where one exists, so a
 * filtered view is a crawlable page rather than a query string. Filters with
 * no page of their own (price, beds, size) ride along as query params on the
 * closest tree page, which keeps the canonical URL intact.
 */
export default function FilterSidebar({ types, initial }: Props) {
  const router = useRouter()
  const [f, setF] = useState<FilterState>({ ...EMPTY_FILTERS, ...initial })
  const [cities, setCities] = useState<CityOption[]>([])
  const [areas, setAreas] = useState<AreaOption[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setCities([]))
  }, [])

  useEffect(() => {
    if (!f.citySlug) { setAreas([]); return }
    fetch(`/api/locations/${f.citySlug}`)
      .then((r) => r.json())
      .then((d) => setAreas(d.areas ?? []))
      .catch(() => setAreas([]))
  }, [f.citySlug])

  const selectedArea = areas.find((a) => a.slug === f.areaSlug)
  const priceBands = f.purpose === 'for-rent' ? RENT_PRICES : SALE_PRICES
  const selectedType = types.find((t) => t.slug === f.typeSlug)

  const activeCount = useMemo(() => {
    let n = 0
    if (f.typeSlug) n++
    if (f.citySlug) n++
    if (f.areaSlug) n++
    if (f.subAreaSlug) n++
    if (f.minPrice || f.maxPrice) n++
    if (f.bedrooms) n++
    if (f.bathrooms) n++
    if (f.minMarla || f.maxMarla) n++
    if (f.fsboOnly) n++
    return n
  }, [f])

  /**
   * Build the destination.
   *
   * Path segments are used for everything the tree can express; anything else
   * becomes a query param on that same path.
   */
  function buildUrl(state: FilterState): string {
    const purpose = state.fsboOnly ? 'owner' : state.purpose
    const segments: string[] = [purpose]

    // A type is required before a city can appear in the path.
    if (state.typeSlug) {
      segments.push(state.typeSlug)
      if (state.citySlug) {
        segments.push(state.citySlug)
        const typeDef = types.find((t) => t.slug === state.typeSlug)
        // Only Tier-A types have area/subarea pages, and /owner stops at city.
        if (typeDef?.hasAreaDepth && purpose !== 'owner' && state.areaSlug) {
          segments.push(state.areaSlug)
          if (state.subAreaSlug) segments.push(state.subAreaSlug)
        }
      }
    } else if (state.citySlug) {
      // No type chosen: use the head term so the city still gets a real page.
      segments.push('property', state.citySlug)
    }

    const qs = new URLSearchParams()
    if (state.minPrice) qs.set('minPrice', state.minPrice)
    if (state.maxPrice) qs.set('maxPrice', state.maxPrice)
    if (state.bedrooms) qs.set('bedrooms', state.bedrooms)
    if (state.bathrooms) qs.set('bathrooms', state.bathrooms)
    if (state.minMarla) qs.set('minMarla', state.minMarla)
    if (state.maxMarla) qs.set('maxMarla', state.maxMarla)

    // Filters the path could not express but that the tree page ignored
    // (area on a Tier-B type) still need to reach the query.
    const typeDef = types.find((t) => t.slug === state.typeSlug)
    if (state.areaSlug && (!typeDef?.hasAreaDepth || purpose === 'owner')) {
      qs.set('areaSlug', state.areaSlug)
    }

    const query = qs.toString()
    return '/' + segments.join('/') + (query ? `?${query}` : '')
  }

  function apply(next: FilterState) {
    setF(next)
    router.push(buildUrl(next))
    setOpen(false)
  }

  function reset() {
    setF({ ...EMPTY_FILTERS, purpose: f.purpose })
    router.push(f.purpose === 'for-rent' ? '/for-rent/property' : '/for-sale/property')
  }

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'

  const body = (
    <div className="space-y-[21px]">
      {/* Purpose */}
      <Section title="I want to">
        <div className="grid grid-cols-2 gap-2">
          {(['for-sale', 'for-rent'] as const).map((p) => (
            <button
              key={p}
              onClick={() => apply({ ...f, purpose: p, minPrice: '', maxPrice: '' })}
              className={`py-2 rounded-lg text-[13px] font-semibold border transition ${
                f.purpose === p
                  ? 'bg-cyan-700 text-white border-cyan-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
              }`}
            >
              {p === 'for-sale' ? 'Buy' : 'Rent'}
            </button>
          ))}
        </div>
      </Section>

      {/* Property type */}
      <Section title="Property type">
        <select
          value={f.typeSlug}
          onChange={(e) => apply({ ...f, typeSlug: e.target.value, areaSlug: '', subAreaSlug: '' })}
          className={inputCls}
        >
          <option value="">All types</option>
          <optgroup label="Residential">
            {types.filter((t) => t.category === 'residential').map((t) => (
              <option key={t.slug} value={t.slug}>{t.label}</option>
            ))}
          </optgroup>
          <optgroup label="Commercial">
            {types.filter((t) => t.category === 'commercial').map((t) => (
              <option key={t.slug} value={t.slug}>{t.label}</option>
            ))}
          </optgroup>
        </select>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="space-y-2">
          <select
            value={f.citySlug}
            onChange={(e) => apply({ ...f, citySlug: e.target.value, areaSlug: '', subAreaSlug: '' })}
            className={inputCls}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={f.areaSlug}
            onChange={(e) => apply({ ...f, areaSlug: e.target.value, subAreaSlug: '' })}
            className={inputCls}
            disabled={!f.citySlug || areas.length === 0}
          >
            <option value="">{f.citySlug ? 'All areas' : 'Choose a city first'}</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>{a.name}</option>
            ))}
          </select>

          {(selectedArea?.subAreas.length ?? 0) > 0 && (
            <select
              value={f.subAreaSlug}
              onChange={(e) => apply({ ...f, subAreaSlug: e.target.value })}
              className={inputCls}
            >
              <option value="">All blocks / phases</option>
              {selectedArea!.subAreas.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
      </Section>

      {/* Price */}
      <Section title={f.purpose === 'for-rent' ? 'Monthly rent (PKR)' : 'Price (PKR)'}>
        <div className="space-y-2">
          {priceBands.map((b) => {
            const on = f.minPrice === b.min && f.maxPrice === b.max
            return (
              <label key={b.label} className="flex items-center gap-2 cursor-pointer text-[13px]">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    apply({ ...f, minPrice: on ? '' : b.min, maxPrice: on ? '' : b.max })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className={on ? 'text-cyan-700 font-medium' : 'text-gray-700'}>{b.label}</span>
              </label>
            )
          })}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              type="number" inputMode="numeric" placeholder="Min"
              value={f.minPrice}
              onChange={(e) => setF({ ...f, minPrice: e.target.value })}
              className={inputCls}
            />
            <input
              type="number" inputMode="numeric" placeholder="Max"
              value={f.maxPrice}
              onChange={(e) => setF({ ...f, maxPrice: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      {/* Beds / baths — irrelevant for plots and land */}
      {selectedType?.category !== 'commercial' && (
        <>
          <Section title="Bedrooms">
            <div className="flex flex-wrap gap-2">
              {['1', '2', '3', '4', '5'].map((n) => (
                <button
                  key={n}
                  onClick={() => apply({ ...f, bedrooms: f.bedrooms === n ? '' : n })}
                  className={`px-3 py-1.5 rounded-lg text-[13px] border transition ${
                    f.bedrooms === n
                      ? 'bg-cyan-700 text-white border-cyan-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                  }`}
                >
                  {n}+
                </button>
              ))}
            </div>
          </Section>

          <Section title="Bathrooms">
            <div className="flex flex-wrap gap-2">
              {['1', '2', '3', '4'].map((n) => (
                <button
                  key={n}
                  onClick={() => apply({ ...f, bathrooms: f.bathrooms === n ? '' : n })}
                  className={`px-3 py-1.5 rounded-lg text-[13px] border transition ${
                    f.bathrooms === n
                      ? 'bg-cyan-700 text-white border-cyan-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                  }`}
                >
                  {n}+
                </button>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* Area size */}
      <Section title="Area size (Marla)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" inputMode="numeric" placeholder="Min"
            value={f.minMarla}
            onChange={(e) => setF({ ...f, minMarla: e.target.value })}
            className={inputCls}
          />
          <input
            type="number" inputMode="numeric" placeholder="Max"
            value={f.maxMarla}
            onChange={(e) => setF({ ...f, maxMarla: e.target.value })}
            className={inputCls}
          />
        </div>
      </Section>

      {/* FSBO */}
      <Section title="Listed by">
        <label className="flex items-center gap-2 cursor-pointer text-[13px]">
          <input
            type="checkbox"
            checked={f.fsboOnly}
            onChange={(e) => apply({ ...f, fsboOnly: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className={f.fsboOnly ? 'text-emerald-700 font-medium' : 'text-gray-700'}>
            Owner only — no commission
          </span>
        </label>
      </Section>

      <button
        onClick={() => apply(f)}
        className="w-full bg-cyan-700 text-white py-3 rounded-xl font-semibold hover:bg-cyan-800 transition flex items-center justify-center gap-2"
      >
        <FaSearch className="text-[13px]" /> Apply filters
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl py-3 font-semibold text-gray-700 mb-[21px]"
      >
        <FaFilter className="text-cyan-700" /> Filters
        {activeCount > 0 && (
          <span className="bg-cyan-700 text-white text-[11px] px-2 py-0.5 rounded-full">{activeCount}</span>
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block bg-white rounded-xl shadow-sm p-[21px] sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="flex items-center justify-between mb-[21px]">
          <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
            <FaFilter className="text-cyan-700 text-[13px]" /> Filters
          </h2>
          {activeCount > 0 && (
            <button onClick={reset} className="text-[12px] text-cyan-700 hover:underline font-medium">
              Clear all ({activeCount})
            </button>
          )}
        </div>
        {body}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-[88%] max-w-sm bg-white h-full overflow-y-auto p-[21px]">
            <div className="flex items-center justify-between mb-[21px]">
              <h2 className="text-[16px] font-bold text-gray-900">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close filters">
                <FaTimes className="text-gray-500 text-xl" />
              </button>
            </div>
            {body}
            {activeCount > 0 && (
              <button onClick={reset} className="w-full mt-3 text-[13px] text-cyan-700 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-[21px] last:border-0">
      <h3 className="text-[13px] font-semibold text-gray-900 mb-[13px] uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  )
}
