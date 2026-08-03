'use client'

import { useEffect, useState } from 'react'

export interface LocationValue {
  city: string
  province: string
  area: string
  subArea: string
  citySlug: string | null
  areaSlug: string | null
  subAreaSlug: string | null
}

interface CityOption {
  slug: string
  name: string
  province: string
}

interface AreaOption {
  slug: string
  name: string
  subAreas: { slug: string; name: string }[]
}

interface Props {
  value: LocationValue
  onChange: (value: LocationValue) => void
  /** Marks the city field required in the UI. */
  required?: boolean
}

const EMPTY: Omit<LocationValue, 'city' | 'province'> = {
  area: '',
  subArea: '',
  citySlug: null,
  areaSlug: null,
  subAreaSlug: null,
}

/**
 * Cascading City → Area → Block/Phase picker backed by the location taxonomy.
 *
 * Picking from the lists guarantees the listing lands on a real location page.
 * When a location genuinely isn't in the taxonomy yet, "Not listed?" reveals
 * free-text inputs — a submission must never be blocked by a taxonomy gap.
 */
export default function LocationSelect({ value, onChange, required }: Props) {
  const [cities, setCities] = useState<CityOption[]>([])
  const [areas, setAreas] = useState<AreaOption[]>([])
  const [manual, setManual] = useState(false)
  const [loadingCities, setLoadingCities] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setCities(d.cities ?? [])
      })
      .catch(() => {
        // Taxonomy unreachable — fall back to free text rather than trapping the user.
        if (!cancelled) setManual(true)
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Load areas whenever a canonical city is selected.
  useEffect(() => {
    if (!value.citySlug) {
      setAreas([])
      return
    }
    let cancelled = false
    fetch(`/api/locations/${value.citySlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setAreas(d.areas ?? [])
      })
      .catch(() => {
        if (!cancelled) setAreas([])
      })
    return () => {
      cancelled = true
    }
  }, [value.citySlug])

  const selectedArea = areas.find((a) => a.slug === value.areaSlug)
  const subAreas = selectedArea?.subAreas ?? []

  function pickCity(slug: string) {
    const city = cities.find((c) => c.slug === slug)
    if (!city) return
    // Province comes from the taxonomy, so it can never disagree with the city.
    onChange({ ...EMPTY, city: city.name, province: city.province, citySlug: city.slug })
  }

  function pickArea(slug: string) {
    const area = areas.find((a) => a.slug === slug)
    onChange({
      ...value,
      area: area?.name ?? '',
      areaSlug: area?.slug ?? null,
      subArea: '',
      subAreaSlug: null,
    })
  }

  function pickSubArea(slug: string) {
    const sub = subAreas.find((s) => s.slug === slug)
    onChange({ ...value, subArea: sub?.name ?? '', subAreaSlug: sub?.slug ?? null })
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent'

  if (manual) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City {required && '*'}
            </label>
            <input
              type="text"
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value, citySlug: null })}
              placeholder="e.g., Lahore"
              className={inputClass}
              required={required}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area / Society</label>
            <input
              type="text"
              value={value.area}
              onChange={(e) => onChange({ ...value, area: e.target.value, areaSlug: null })}
              placeholder="e.g., DHA Defence"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Block / Phase / Sector
          </label>
          <input
            type="text"
            value={value.subArea}
            onChange={(e) => onChange({ ...value, subArea: e.target.value, subAreaSlug: null })}
            placeholder="e.g., Phase 6"
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={() => setManual(false)}
          className="text-sm text-cyan-700 hover:underline"
        >
          ← Choose from the list instead
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City {required && '*'}
          </label>
          <select
            value={value.citySlug ?? ''}
            onChange={(e) => pickCity(e.target.value)}
            className={inputClass}
            required={required}
            disabled={loadingCities}
          >
            <option value="">{loadingCities ? 'Loading cities…' : 'Select City'}</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area / Society</label>
          <select
            value={value.areaSlug ?? ''}
            onChange={(e) => pickArea(e.target.value)}
            className={inputClass}
            disabled={!value.citySlug || areas.length === 0}
          >
            <option value="">{value.citySlug ? 'Select Area' : 'Choose a city first'}</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Only shown for areas that genuinely have blocks or phases. */}
      {subAreas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Block / Phase / Sector
          </label>
          <select
            value={value.subAreaSlug ?? ''}
            onChange={(e) => pickSubArea(e.target.value)}
            className={inputClass}
          >
            <option value="">Select Block / Phase</option>
            {subAreas.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.province && (
        <p className="text-xs text-gray-500">
          Province: <span className="font-medium text-gray-700">{value.province}</span>
        </p>
      )}

      <button
        type="button"
        onClick={() => setManual(true)}
        className="text-sm text-cyan-700 hover:underline"
      >
        My area isn&apos;t listed — enter it manually
      </button>
    </div>
  )
}
