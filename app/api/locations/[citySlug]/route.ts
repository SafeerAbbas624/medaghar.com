import { NextResponse } from 'next/server'
import { getCity } from '@/lib/locations'

interface Props {
  params: Promise<{ citySlug: string }>
}

/** Areas (and their blocks/phases) for one city, for the cascading picker. */
export async function GET(_request: Request, { params }: Props) {
  const { citySlug } = await params
  const city = getCity(citySlug)

  if (!city) {
    return NextResponse.json({ error: 'Unknown city' }, { status: 404 })
  }

  const areas = city.areas.map((a) => ({
    slug: a.slug,
    name: a.name,
    subAreas: (a.subAreas ?? []).map((s) => ({ slug: s.slug, name: s.name })),
  }))

  return NextResponse.json(
    { city: { slug: city.slug, name: city.name, province: city.province }, areas },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    }
  )
}
