import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPropertyBySlugOrId } from '@/lib/getProperty'
import PropertyDetailView from '@/components/PropertyDetailView'
import { absoluteUrl, formatPkr } from '@/lib/seo'

interface Props { params: Promise<{ id: string }> }

/** A v4 UUID — used to tell "this is an id" from "this is a slug". */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Human summary used for <title> and meta description. */
function describe(p: {
  title?: string | null
  propertyType: string
  city: string
  area?: string | null
  price: number
  listingType: string
  bedrooms: number
  marla?: number | null
  kanal?: number | null
}) {
  const forRent = p.listingType === 'FOR_RENT'
  const type = p.propertyType.replace(/_/g, ' ').toLowerCase()
  const where = p.area ? `${p.area}, ${p.city}` : p.city
  const size = p.kanal ? `${p.kanal} Kanal ` : p.marla ? `${p.marla} Marla ` : ''
  const beds = p.bedrooms > 0 ? `${p.bedrooms} bed ` : ''

  const title = p.title || `${size}${type} for ${forRent ? 'rent' : 'sale'} in ${where}`
  const description =
    `${size}${beds}${type} for ${forRent ? 'rent' : 'sale'} in ${where}. ` +
    `${formatPkr(p.price, forRent)}. View photos, location and contact the ${forRent ? 'landlord' : 'seller'} directly on MedaGhar.`

  return { title, description }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const property = await getPropertyBySlugOrId(id)
  if (!property) return {}

  const { title, description } = describe(property)
  const url = absoluteUrl(`/properties/${property.slug || property.id}`)
  const image = property.images?.[0]?.url
  const ogImage = image
    ? (image.startsWith('http') ? image : absoluteUrl(image))
    : absoluteUrl('/og-default.jpg')

  // Listings that are no longer live stay reachable (never 404 a sold listing —
  // that is a soft-404 pattern) but drop out of the index.
  const isLive = property.status === 'ACTIVE'

  return {
    title: `${title} | MedaGhar`,
    description,
    alternates: { canonical: url },
    robots: isLive ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'MedaGhar',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params
  const property = await getPropertyBySlugOrId(id)
  if (!property) notFound()

  // Canonicalise: /properties/{uuid} -> /properties/{slug} when a slug exists.
  // Permanent (308) so search engines consolidate on the slug URL.
  if (UUID_RE.test(id) && property.slug) {
    permanentRedirect(`/properties/${property.slug}`)
  }

  return <PropertyDetailView property={property} />
}
