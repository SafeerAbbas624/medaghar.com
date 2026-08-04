'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaSearch, FaMapMarkerAlt, FaTimes } from 'react-icons/fa'

interface CityOption { slug: string; name: string; province: string }
interface AreaOption { slug: string; name: string }

const SALE_BANDS = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under 50 Lakh', min: '', max: '5000000' },
  { label: '50 Lakh – 1 Crore', min: '5000000', max: '10000000' },
  { label: '1 – 2 Crore', min: '10000000', max: '20000000' },
  { label: '2 – 5 Crore', min: '20000000', max: '50000000' },
  { label: 'Above 5 Crore', min: '50000000', max: '' },
]
const RENT_BANDS = [
  { label: 'Any rent', min: '', max: '' },
  { label: 'Under 25,000', min: '', max: '25000' },
  { label: '25,000 – 50,000', min: '25000', max: '50000' },
  { label: '50,000 – 1 Lakh', min: '50000', max: '100000' },
  { label: '1 – 2 Lakh', min: '100000', max: '200000' },
  { label: 'Above 2 Lakh', min: '200000', max: '' },
]

const TYPES = [
  { slug: '', label: 'All types' },
  { slug: 'house', label: 'Houses' },
  { slug: 'flat', label: 'Flats' },
  { slug: 'plot', label: 'Plots' },
  { slug: 'upper-portion', label: 'Upper Portions' },
  { slug: 'shop', label: 'Shops' },
  { slug: 'office', label: 'Offices' },
]

/**
 * Hero search.
 *
 * Routes to a real tree page whenever the chosen filters map to one — a city
 * goes to that city's page rather than a database search — and only falls back
 * to free-text search on /properties when the visitor has typed something the
 * taxonomy cannot express.
 */
export default function HeroSearch() {
  const router = useRouter()
  const [purpose, setPurpose] = useState<'for-sale' | 'for-rent'>('for-sale')
  const [term, setTerm] = useState('')
  const [typeSlug, setTypeSlug] = useState('')
  const [citySlug, setCitySlug] = useState('')
  const [band, setBand] = useState(0)
  const [cities, setCities] = useState<CityOption[]>([])
  const [areas, setAreas] = useState<AreaOption[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const bands = purpose === 'for-rent' ? RENT_BANDS : SALE_BANDS

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setCities([]))
  }, [])

  // Load areas for the selected city so typed text can match an area too.
  useEffect(() => {
    if (!citySlug) { setAreas([]); return }
    fetch(`/api/locations/${citySlug}`)
      .then((r) => r.json())
      .then((d) => setAreas((d.areas ?? []).map((a: AreaOption) => ({ slug: a.slug, name: a.name }))))
      .catch(() => setAreas([]))
  }, [citySlug])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setSuggestOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  /** Cities whose name matches what has been typed. */
  const suggestions = term.trim().length >= 2
    ? cities.filter((c) => c.name.toLowerCase().includes(term.trim().toLowerCase())).slice(0, 6)
    : []

  function go(overrides?: { citySlug?: string; term?: string }) {
    const city = overrides?.citySlug ?? citySlug
    const text = (overrides?.term ?? term).trim()
    const b = bands[band]

    const qs = new URLSearchParams()
    if (b.min) qs.set('minPrice', b.min)
    if (b.max) qs.set('maxPrice', b.max)

    // A typed term that isn't a known city can only be answered by search.
    const typedCity = cities.find((c) => c.name.toLowerCase() === text.toLowerCase())
    const typedArea = areas.find((a) => a.name.toLowerCase() === text.toLowerCase())

    if (text && !typedCity && !typedArea) {
      qs.set('search', text)
      if (city) qs.set('citySlug', city)
      if (typeSlug) qs.set('typeSlug', typeSlug)
      qs.set('listingType', purpose === 'for-rent' ? 'FOR_RENT' : 'FOR_SALE')
      router.push(`/properties?${qs.toString()}`)
      return
    }

    // Otherwise build the tree path: /{purpose}/{type}/{city}[/{area}]
    const resolvedCity = typedCity?.slug ?? city
    const segments = [purpose, typeSlug || 'property']
    if (resolvedCity) {
      segments.push(resolvedCity)
      if (typedArea) segments.push(typedArea.slug)
    }

    const query = qs.toString()
    router.push('/' + segments.join('/') + (query ? `?${query}` : ''))
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-[21px] lg:p-[26px] max-w-4xl">
      {/* Buy / Rent */}
      <div className="flex gap-[8px] mb-[16px]">
        {(['for-sale', 'for-rent'] as const).map((p) => (
          <button
            key={p}
            onClick={() => { setPurpose(p); setBand(0) }}
            className={`px-[26px] py-[10px] rounded-lg font-semibold text-[15px] transition ${
              purpose === p
                ? 'bg-cyan-700 text-white shadow'
                : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
            }`}
          >
            {p === 'for-sale' ? 'Buy' : 'Rent'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-[13px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[13px]">
          {/* Free text */}
          <div className="sm:col-span-3 lg:col-span-1 relative" ref={boxRef}>
            <FaSearch className="absolute left-[16px] top-1/2 -translate-y-1/2 text-gray-400 text-[14px] pointer-events-none" />
            <input
              type="text"
              value={term}
              onChange={(e) => { setTerm(e.target.value); setSuggestOpen(true) }}
              onKeyDown={(e) => { if (e.key === 'Enter') go() }}
              placeholder="City, area or society…"
              aria-label="Search by city, area or society"
              className="w-full pl-[42px] pr-[36px] py-[13px] border border-gray-300 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            {term && (
              <button
                onClick={() => { setTerm(''); setSuggestOpen(false) }}
                aria-label="Clear search"
                className="absolute right-[13px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-[13px]" />
              </button>
            )}

            {suggestOpen && suggestions.length > 0 && (
              <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((c) => (
                  <li key={c.slug}>
                    <button
                      onClick={() => { setTerm(c.name); setCitySlug(c.slug); setSuggestOpen(false); go({ citySlug: c.slug, term: c.name }) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[14px] hover:bg-cyan-50"
                    >
                      <FaMapMarkerAlt className="text-gray-400 text-[12px]" />
                      <span className="text-gray-900">{c.name}</span>
                      <span className="text-gray-400 text-[12px] ml-auto">{c.province}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* City */}
          <select
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            aria-label="City"
            className="w-full px-[16px] py-[13px] border border-gray-300 rounded-xl text-[15px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={typeSlug}
            onChange={(e) => setTypeSlug(e.target.value)}
            aria-label="Property type"
            className="w-full px-[16px] py-[13px] border border-gray-300 rounded-xl text-[15px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {TYPES.map((t) => (
              <option key={t.slug} value={t.slug}>{t.label}</option>
            ))}
          </select>

          {/* Price */}
          <select
            value={band}
            onChange={(e) => setBand(Number(e.target.value))}
            aria-label={purpose === 'for-rent' ? 'Monthly rent range' : 'Price range'}
            className="w-full px-[16px] py-[13px] border border-gray-300 rounded-xl text-[15px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:col-span-2 lg:col-span-1"
          >
            {bands.map((b, i) => (
              <option key={b.label} value={i}>{b.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => go()}
          className="bg-cyan-700 text-white px-[42px] py-[13px] rounded-xl hover:bg-cyan-800 transition font-semibold text-[16px] flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FaSearch className="text-[14px]" /> Search
        </button>
      </div>

      {/* Popular shortcuts */}
      <div className="flex flex-wrap items-center gap-[8px] mt-[16px] text-[13px]">
        <span className="text-gray-500">Popular:</span>
        {[
          { label: 'Houses in Lahore', href: '/for-sale/house/lahore' },
          { label: 'Flats in Karachi', href: '/for-sale/flat/karachi' },
          { label: 'Plots in Islamabad', href: '/for-sale/plot/islamabad' },
          { label: 'Rentals in Rawalpindi', href: '/for-rent/property/rawalpindi' },
        ].map((s) => (
          <button
            key={s.href}
            onClick={() => router.push(s.href)}
            className="px-[13px] py-[5px] rounded-full bg-slate-100 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
