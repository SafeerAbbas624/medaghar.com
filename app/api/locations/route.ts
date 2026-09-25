import { NextResponse } from 'next/server'
import { CITIES, cityCoordinates } from '@/lib/locations'

/**
 * The city list for the cascading location picker.
 *
 * Deliberately omits `intro` / `marketNote` / `areas` — those carry long prose
 * per city and would bloat the sell-form bundle. Areas are fetched per-city
 * from /api/locations/[citySlug] once a city is chosen.
 */
export function GET() {
  const cities = CITIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    province: c.province,
    // Lets the listing forms recentre their map on the chosen city.
    ...cityCoordinates(c.slug),
  }))

  return NextResponse.json(
    { cities },
    {
      headers: {
        // Static taxonomy — safe to cache hard.
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    }
  )
}
