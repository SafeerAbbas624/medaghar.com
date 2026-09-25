import { describe, it, expect } from 'vitest'
import { CITIES, getCity, resolveLocation, cityCoordinates } from '@/lib/locations'

describe('city coverage', () => {
  it('covers every city with a centre for the form map', () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(204)
    for (const c of CITIES) expect(cityCoordinates(c.slug), c.slug).toBeDefined()
  })

  it('has unique city slugs and unique area slugs within each city', () => {
    const slugs = CITIES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const c of CITIES) {
      const a = c.areas.map((x) => x.slug)
      expect(new Set(a).size, c.slug).toBe(a.length)
    }
  })

  it('gives Murree its own pages instead of folding it into Rawalpindi', () => {
    expect(resolveLocation({ city: 'Murree' }).citySlug).toBe('murree')
    expect(resolveLocation({ city: 'Murree', area: 'Mall Road' }).areaSlug).toBe('mall-road')
  })

  it('resolves common spellings of the new towns', () => {
    expect(resolveLocation({ city: 'Hasan Abdal' }).citySlug).toBe('hassan-abdal')
    expect(resolveLocation({ city: 'Dunyapur' }).citySlug).toBe('duniya-pur')
    expect(resolveLocation({ city: 'TMK' }).citySlug).toBe('tando-muhammad-khan')
    expect(resolveLocation({ city: 'Kot Adu' }).citySlug).toBe('kot-addu')
  })

  it('uses full province names', () => {
    expect(getCity('taxila')?.province).toBe('Punjab')
    expect(getCity('balakot')?.province).toBe('Khyber Pakhtunkhwa')
    expect(getCity('jamshoro')?.province).toBe('Sindh')
  })
})
