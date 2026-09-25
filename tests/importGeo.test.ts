import { describe, it, expect } from 'vitest'
import { parseMapsUrl, parseLatLngText, checkPair, isShortMapsLink } from '@/lib/import/geo'

describe('Google Maps links', () => {
  it('prefers the dropped pin over the viewport centre', () => {
    const url =
      'https://www.google.com/maps/place/DHA+Phase+6/@31.4700,74.4500,15z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d31.4812!4d74.4661'
    expect(parseMapsUrl(url)).toEqual({ lat: 31.4812, lng: 74.4661 })
  })

  it('reads the viewport when there is no pin', () => {
    expect(parseMapsUrl('https://www.google.com/maps/@33.6844,73.0479,15z')).toEqual({ lat: 33.6844, lng: 73.0479 })
  })

  it('reads q= / query= / ll= parameters', () => {
    expect(parseMapsUrl('https://maps.google.com/?q=24.8607,67.0011')).toEqual({ lat: 24.8607, lng: 67.0011 })
    expect(parseMapsUrl('https://www.google.com/maps/search/?api=1&query=31.52%2C74.35')).toEqual({ lat: 31.52, lng: 74.35 })
    expect(parseMapsUrl('https://maps.google.com/maps?ll=33.7,73.1&z=14')).toEqual({ lat: 33.7, lng: 73.1 })
  })

  it('reads /place/lat,lng and /search/lat,+lng paths', () => {
    expect(parseMapsUrl('https://www.google.com/maps/place/31.5204,74.3587')).toEqual({ lat: 31.5204, lng: 74.3587 })
    expect(parseMapsUrl('https://www.google.com/maps/search/31.5204,+74.3587')).toEqual({ lat: 31.5204, lng: 74.3587 })
  })

  it('reads degrees-minutes-seconds pins', () => {
    const p = parseMapsUrl(`https://www.google.com/maps/place/33°41'03.8"N+73°02'52.4"E`)!
    expect(p.lat).toBeCloseTo(33.6844, 3)
    expect(p.lng).toBeCloseTo(73.0479, 3)
  })

  it('reads geo: URIs and bare pairs', () => {
    expect(parseMapsUrl('geo:31.5,74.3')).toEqual({ lat: 31.5, lng: 74.3 })
    expect(parseLatLngText('31.5204, 74.3587')).toEqual({ lat: 31.5204, lng: 74.3587 })
  })

  it('returns null for a place name with no coordinates', () => {
    expect(parseMapsUrl('https://www.google.com/maps/place/Emporium+Mall')).toBeNull()
  })

  it('recognises short share links', () => {
    expect(isShortMapsLink('https://maps.app.goo.gl/AbC123')).toBe(true)
    expect(isShortMapsLink('https://goo.gl/maps/xyz')).toBe(true)
    expect(isShortMapsLink('https://www.google.com/maps/@31,74,15z')).toBe(false)
  })
})

describe('coordinate sanity', () => {
  it('accepts Pakistan and un-swaps reversed columns', () => {
    expect(checkPair(31.5, 74.3)).toEqual({ point: { lat: 31.5, lng: 74.3 }, swapped: false })
    expect(checkPair(74.3, 31.5)).toEqual({ point: { lat: 31.5, lng: 74.3 }, swapped: true })
  })

  it('rejects points outside Pakistan', () => {
    expect(checkPair(51.5, -0.12)).toBeNull()
    expect(checkPair(0, 0)).toBeNull()
  })
})
