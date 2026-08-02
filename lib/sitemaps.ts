import { prisma } from '@/lib/prisma'
import { BASE_URL } from '@/lib/seo'
import { CITIES, allAreas, allSubAreas } from '@/lib/locations'
import { buildCategoryUrl, buildPropertyUrl } from '@/lib/propertyUrl'
import { GUIDES } from '@/content/guides'

export interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/** No single sitemap file may exceed this many URLs. */
export const MAX_PER_SITEMAP = 500

interface Section {
  /** Base name for the section; sharded names append `-1`, `-2`, … when >1 chunk. */
  name: string
  /** Lazily-built entries (DB sections wrap their query in try/catch). */
  build: () => Promise<SitemapEntry[]> | SitemapEntry[]
}

const TOOL_SLUGS = [
  'mortgage-calculator',
  'area-converter',
  'construction-cost-calculator',
  'property-tax-calculator',
  'rental-yield-calculator',
]

function staticSection(now: Date): SitemapEntry[] {
  const pages: Array<{ path: string; freq: SitemapEntry['changeFrequency']; priority: number }> = [
    { path: '/', freq: 'daily', priority: 1.0 },
    { path: '/buy', freq: 'daily', priority: 0.9 },
    { path: '/rent', freq: 'daily', priority: 0.9 },
    { path: '/properties', freq: 'daily', priority: 0.9 },
    { path: '/sell', freq: 'weekly', priority: 0.8 },
    { path: '/post-rent', freq: 'weekly', priority: 0.6 },
    { path: '/plots', freq: 'daily', priority: 0.8 },
    { path: '/commercial', freq: 'daily', priority: 0.8 },
    { path: '/fsbo', freq: 'weekly', priority: 0.7 },
    { path: '/agents', freq: 'weekly', priority: 0.7 },
    { path: '/market-insights', freq: 'weekly', priority: 0.7 },
    { path: '/reviews', freq: 'weekly', priority: 0.6 },
    { path: '/pricing', freq: 'monthly', priority: 0.7 },
    { path: '/home-loans', freq: 'monthly', priority: 0.7 },
    { path: '/contact', freq: 'monthly', priority: 0.5 },
    { path: '/about', freq: 'monthly', priority: 0.5 },
    { path: '/privacy', freq: 'yearly', priority: 0.5 },
    { path: '/terms', freq: 'yearly', priority: 0.5 },
    { path: '/residential', freq: 'daily', priority: 0.9 },
    { path: '/commercial', freq: 'daily', priority: 0.9 },
    { path: '/guides', freq: 'weekly', priority: 0.8 },
    { path: '/tools', freq: 'monthly', priority: 0.8 },
    ...TOOL_SLUGS.map((slug) => ({
      path: `/tools/${slug}`,
      freq: 'monthly' as const,
      priority: 0.7,
    })),
  ]
  // /commercial appears twice above (the dedicated category landing + the static list);
  // de-dupe by path so we never emit duplicate <loc> entries.
  const seen = new Set<string>()
  const out: SitemapEntry[] = []
  for (const p of pages) {
    if (seen.has(p.path)) continue
    seen.add(p.path)
    out.push({
      url: `${BASE_URL}${p.path === '/' ? '/' : p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    })
  }
  return out
}

function guidesSection(now: Date): SitemapEntry[] {
  return [
    { url: `${BASE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...GUIDES.map((g) => ({
      url: `${BASE_URL}/guides/${g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}

function citiesSection(cat: 'residential' | 'commercial', now: Date): SitemapEntry[] {
  return CITIES.map((city) => ({
    url: `${BASE_URL}${buildCategoryUrl(cat, city.slug)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))
}

function areasSection(cat: 'residential' | 'commercial', now: Date): SitemapEntry[] {
  return allAreas().map(({ city, area }) => ({
    url: `${BASE_URL}${buildCategoryUrl(cat, city.slug, area.slug)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))
}

function subAreasSection(cat: 'residential' | 'commercial', now: Date): SitemapEntry[] {
  return allSubAreas().map(({ city, area, subArea }) => ({
    url: `${BASE_URL}${buildCategoryUrl(cat, city.slug, area.slug, subArea.slug)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
}

async function propertiesSection(
  listingType: 'FOR_SALE' | 'FOR_RENT'
): Promise<SitemapEntry[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE', listingType },
      select: {
        id: true,
        slug: true,
        city: true,
        area: true,
        subArea: true,
        propertyType: true,
        updatedAt: true,
      },
    })
    return properties.map((p) => ({
      url: `${BASE_URL}${buildPropertyUrl(p)}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    return []
  }
}

/** The ordered list of logical sections. Each is sharded into <=500 chunks. */
function sections(): Section[] {
  const now = new Date()
  return [
    { name: 'static', build: () => staticSection(now) },
    { name: 'guides', build: () => guidesSection(now) },
    { name: 'residential-cities', build: () => citiesSection('residential', now) },
    { name: 'commercial-cities', build: () => citiesSection('commercial', now) },
    { name: 'residential-areas', build: () => areasSection('residential', now) },
    { name: 'commercial-areas', build: () => areasSection('commercial', now) },
    { name: 'residential-subareas', build: () => subAreasSection('residential', now) },
    { name: 'commercial-subareas', build: () => subAreasSection('commercial', now) },
    { name: 'properties-sale', build: () => propertiesSection('FOR_SALE') },
    { name: 'properties-rent', build: () => propertiesSection('FOR_RENT') },
  ]
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Build every section, shard each into <=MAX_PER_SITEMAP chunks, and return named shards.
 * A single-chunk section keeps its base name (e.g. `static`); multi-chunk sections are
 * suffixed `-1`, `-2`, … (e.g. `residential-areas-1`, `properties-sale-2`).
 * Because property counts are dynamic, this is computed at request time.
 */
export async function getAllShards(): Promise<{ name: string; entries: SitemapEntry[] }[]> {
  const shards: { name: string; entries: SitemapEntry[] }[] = []
  for (const section of sections()) {
    const entries = await section.build()
    if (entries.length === 0) continue
    const chunks = chunk(entries, MAX_PER_SITEMAP)
    if (chunks.length === 1) {
      shards.push({ name: section.name, entries: chunks[0] })
    } else {
      chunks.forEach((c, i) => {
        shards.push({ name: `${section.name}-${i + 1}`, entries: c })
      })
    }
  }
  return shards
}

/** Shard names for the sitemap index (computed at request time). */
export async function getSitemapIndexEntries(): Promise<string[]> {
  const shards = await getAllShards()
  return shards.map((s) => s.name)
}

/** Entries for a single shard by name (`.xml` already stripped). Empty array if unknown. */
export async function getShardEntries(name: string): Promise<SitemapEntry[]> {
  const shards = await getAllShards()
  return shards.find((s) => s.name === name)?.entries ?? []
}

export function buildSitemapIndexXml(names: string[]): string {
  const now = new Date().toISOString()
  const items = names
    .map(
      (name) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemaps/${name}.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const items = entries
    .map((e) => {
      const lastmod = e.lastModified
        ? `\n    <lastmod>${new Date(e.lastModified).toISOString()}</lastmod>`
        : ''
      const freq = e.changeFrequency ? `\n    <changefreq>${e.changeFrequency}</changefreq>` : ''
      const priority = e.priority !== undefined ? `\n    <priority>${e.priority}</priority>` : ''
      return `  <url>\n    <loc>${e.url}</loc>${lastmod}${freq}${priority}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`
}
