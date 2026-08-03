export const BASE_URL = 'https://medaghar.com'
export const SITE_NAME = 'MedaGhar'

/** Format a PKR amount the way Pakistanis read it (crore / lakh). */
export function formatPkr(price: number, forRent = false): string {
  if (forRent) return `PKR ${price.toLocaleString()}/month`
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`
  return `PKR ${price.toLocaleString()}`
}

export function absoluteUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Organization JSON-LD used site-wide. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: absoluteUrl('/logo.png'),
    email: 'info@medaghar.com',
    description:
      'Free property listings in Pakistan. Buy, sell and rent houses, flats, plots and commercial properties across Lahore, Karachi, Islamabad and more.',
    areaServed: { '@type': 'Country', name: 'Pakistan' },
  }
}

/** WebSite JSON-LD with SearchAction so Google can show a sitelinks search box. */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/properties?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function articleJsonLd(args: {
  title: string
  description: string
  path: string
  publishedAt: string
  updatedAt: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.title,
    description: args.description,
    mainEntityOfPage: absoluteUrl(args.path),
    datePublished: args.publishedAt,
    dateModified: args.updatedAt,
    author: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
  }
}

interface PropertyForJsonLd {
  id: string
  slug?: string | null
  title?: string | null
  description?: string | null
  address: string
  city: string
  province: string
  area?: string | null
  zipCode?: string | null
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet?: number | null
  latitude?: number | null
  longitude?: number | null
  listingType: string
  propertyType: string
  images: { url: string }[]
}

export function propertyJsonLd(property: PropertyForJsonLd) {
  const path = `/properties/${property.slug || property.id}`
  const isRent = property.listingType === 'FOR_RENT'
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title || `${property.propertyType} in ${property.area || property.city}`,
    description: property.description?.slice(0, 500) || undefined,
    url: absoluteUrl(path),
    image: property.images.map((img) =>
      img.url.startsWith('http') ? img.url : absoluteUrl(img.url)
    ),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
      ...(isRent ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: property.price, priceCurrency: 'PKR', unitText: 'MONTH' } } : {}),
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.province,
      postalCode: property.zipCode || undefined,
      addressCountry: 'PK',
    },
    ...(property.latitude && property.longitude
      ? { geo: { '@type': 'GeoCoordinates', latitude: property.latitude, longitude: property.longitude } }
      : {}),
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize: property.squareFeet
      ? { '@type': 'QuantitativeValue', value: property.squareFeet, unitCode: 'FTK' }
      : undefined,
  }
}

/**
 * CollectionPage JSON-LD for a category / location listing page.
 * Tells search engines the page is a curated set rather than a single item.
 */
export function collectionPageJsonLd(args: {
  name: string
  description: string
  path: string
  itemCount: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: args.name,
    description: args.description,
    url: absoluteUrl(args.path),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: args.itemCount,
    },
  }
}

/**
 * ItemList of listings shown on a category page, so each result can surface
 * independently in search. Positions are 1-based and page-aware.
 */
export function itemListJsonLd(
  properties: PropertyForJsonLd[],
  startPosition = 1
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: properties.length,
    itemListElement: properties.map((p, i) => ({
      '@type': 'ListItem',
      position: startPosition + i,
      url: absoluteUrl(`/properties/${p.slug || p.id}`),
      name: p.title || `${p.propertyType} in ${p.area || p.city}`,
    })),
  }
}
