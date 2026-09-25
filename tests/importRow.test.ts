import { describe, it, expect } from 'vitest'
import { cleanRow, parseDate, parsePrice, parseSize, parsePropertyType } from '@/lib/import/row'

const NOW = new Date('2026-09-24T12:00:00Z')
const opts = { maxAgeDays: 15, now: NOW }

const base = {
  id: 'A-1',
  listingType: 'For Sale',
  propertyType: 'House',
  city: 'Lahore',
  area: 'DHA Defence',
  subArea: 'Phase 6',
  address: 'Plot 123, Street 7',
  price: '4.5 crore',
  bedrooms: '5',
  bathrooms: '6',
  marla: '10',
  contactName: 'Malik Imran',
  contactPhone: '0300-1234567',
  listedDate: '20/09/2026',
  images: 'https://x.test/1.jpg | https://x.test/2.jpg',
}

describe('values', () => {
  it('parses Pakistani prices', () => {
    expect(parsePrice('4,50,00,000')).toBe(45000000)
    expect(parsePrice('4.5 crore')).toBe(45000000)
    expect(parsePrice('45 lakh')).toBe(4500000)
    expect(parsePrice('PKR 85,000')).toBe(85000)
  })

  it('parses sizes', () => {
    expect(parseSize('1 kanal')).toEqual({ kanal: 1, marla: 20 })
    expect(parseSize('10 marla')).toEqual({ marla: 10 })
    expect(parseSize('120 sq yd')).toEqual({ squareFeet: 1080 })
    expect(parseSize('2,000 sqft')).toEqual({ squareFeet: 2000 })
  })

  it('reads dates day-first, ISO, named-month and Excel serial', () => {
    expect(parseDate('03/04/2026')!.toISOString().slice(0, 10)).toBe('2026-04-03')
    expect(parseDate('03/04/2026', true)!.toISOString().slice(0, 10)).toBe('2026-03-04')
    expect(parseDate('2026-09-20')!.toISOString().slice(0, 10)).toBe('2026-09-20')
    expect(parseDate('14-Jun-2026')!.toISOString().slice(0, 10)).toBe('2026-06-14')
    expect(parseDate('Sep 14, 2026')!.toISOString().slice(0, 10)).toBe('2026-09-14')
    expect(parseDate('46280')!.toISOString().slice(0, 10)).toBe('2026-09-15')
    expect(parseDate('31/02/2026')).toBeNull()
  })

  it('maps everyday type names onto the enum', () => {
    expect(parsePropertyType('Apartment')).toBe('FLAT')
    expect(parsePropertyType('Upper Portion')).toBe('UPPER_PORTION')
    expect(parsePropertyType('RESIDENTIAL_PLOT')).toBe('RESIDENTIAL_PLOT')
    expect(parsePropertyType('castle')).toBeNull()
  })
})

describe('cleanRow', () => {
  it('accepts a complete fresh row', () => {
    const r = cleanRow(base, opts)
    expect(r.errors).toEqual([])
    expect(r.row!.data.price).toBe(45000000)
    expect(r.row!.data.province).toBe('Punjab')
    expect(r.row!.contact.phone).toBe('+923001234567')
    expect(r.row!.images).toHaveLength(2)
    expect(r.row!.sourceId).toBe('A-1')
  })

  it('rejects rows posted more than 15 days ago', () => {
    const r = cleanRow({ ...base, listedDate: '01/09/2026' }, opts)
    expect(r.row).toBeNull()
    expect(r.errors.join()).toMatch(/posted 23 days ago \(limit 15\)/)
  })

  it('rejects rows with no posted date', () => {
    const { listedDate: _omit, ...rest } = base
    void _omit
    expect(cleanRow(rest, opts).errors).toContain('posted date is missing')
  })

  it('prefers listedDate over createdAt regardless of column order', () => {
    const r = cleanRow({ createdAt: '2026-01-01', ...base }, opts)
    expect(r.row!.listedDate.toISOString().slice(0, 10)).toBe('2026-09-20')
  })

  it('takes coordinates from a Google Maps link', () => {
    const r = cleanRow({ ...base, googleMapsUrl: 'https://maps.google.com/?q=31.4812,74.4661' }, opts)
    expect(r.row!.coords).toEqual({ lat: 31.4812, lng: 74.4661 })
  })

  it('defers short maps links to the network step', () => {
    const r = cleanRow({ ...base, 'Google Maps': 'https://maps.app.goo.gl/AbC123' }, opts)
    expect(r.row!.coords).toBeNull()
    expect(r.row!.pendingMapsLink).toBe('https://maps.app.goo.gl/AbC123')
  })

  it('explicit coordinates win over the link', () => {
    const r = cleanRow({ ...base, latitude: '31.5', longitude: '74.3', mapsUrl: 'https://maps.google.com/?q=33,73' }, opts)
    expect(r.row!.coords).toEqual({ lat: 31.5, lng: 74.3 })
  })

  it('rejects coordinates outside Pakistan', () => {
    expect(cleanRow({ ...base, latitude: '51.5', longitude: '-0.1' }, opts).errors.join()).toMatch(/outside Pakistan/)
  })

  it('rejects a bad phone number', () => {
    expect(cleanRow({ ...base, contactPhone: '12345' }, opts).errors.join()).toMatch(/not a Pakistani number/)
  })

  it('treats an agency as a dealer', () => {
    expect(cleanRow({ ...base, agencyName: 'Imran Estate' }, opts).row!.contact.isDealer).toBe(true)
  })

  it('defaults plot bedrooms to zero and generates copy', () => {
    const { bedrooms: _b, bathrooms: _ba, ...rest } = base
    void _b
    void _ba
    const r = cleanRow({ ...rest, propertyType: 'Plot', title: '', description: '' }, opts)
    expect(r.errors).toEqual([])
    expect(r.row!.data.bedrooms).toBe(0)
    expect(r.row!.data.title).toBe('10 Marla Residential Plot for Sale in Phase 6, DHA Defence, Lahore')
  })

  it('reads numbered image columns and nearby places', () => {
    const { images: _i, ...rest } = base
    void _i
    const r = cleanRow(
      { ...rest, image1: 'a.jpg', image2: 'b.jpg', nearbyPlaces: 'Masjid (Walking distance) | School - 5 min | Zoo' },
      opts
    )
    expect(r.row!.images).toEqual(['a.jpg', 'b.jpg'])
    expect(r.row!.data.nearbyPlaces).toEqual([
      { type: 'masjid', distance: 'Walking distance' },
      { type: 'school', distance: '5 min' },
    ])
    expect(r.warnings.join()).toMatch(/Zoo/)
  })
})
