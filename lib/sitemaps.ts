import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { BASE_URL } from '@/lib/seo'
import { GUIDES } from '@/content/guides'
import { CITIES } from '@/lib/locations'
import { countsByLevel } from '@/lib/listingCounts'
import { inSitemap } from '@/lib/tree/gating'
import { buildTreeUrl } from '@/lib/tree/urls'
import {
  HUBS,
  typesForCategory,
  ALL_TYPES_SLUG,
  getTypeDef,
  listingTypeForPurpose,
  type Purpose,
} from '@/lib/taxonomy'

export interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * No single sitemap file may exceed this many URLs.
 *
 * Well under Google's real 50,000 limit — smaller shards make it far easier
 * to see which segment is under-indexed in Search Console.
 */
export const MAX_PER_SITEMAP = 400

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
    // The four category hubs, plus the FSBO hub.
    ...HUBS.map((h) => ({ path: h.path, freq: 'daily' as const, priority: 0.9 })),
    { path: '/owner', freq: 'daily', priority: 0.8 },
    { path: '/sell', freq: 'weekly', priority: 0.8 },
    { path: '/agents', freq: 'weekly', priority: 0.7 },
    { path: '/sitemap-page', freq: 'weekly', priority: 0.6 },
    { path: '/market-insights', freq: 'weekly', priority: 0.7 },
    { path: '/reviews', freq: 'weekly', priority: 0.6 },
    { path: '/pricing', freq: 'monthly', priority: 0.7 },
    { path: '/home-loans', freq: 'monthly', priority: 0.7 },
    { path: '/contact', freq: 'monthly', priority: 0.5 },
    { path: '/about', freq: 'monthly', priority: 0.5 },
    { path: '/privacy', freq: 'yearly', priority: 0.5 },
    { path: '/terms', freq: 'yearly', priority: 0.5 },
  ]
  // De-dupe by path so we never emit duplicate <loc> entries.
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

async function propertiesSection(
  listingType: 'FOR_SALE' | 'FOR_RENT'
): Promise<SitemapEntry[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE', listingType },
      select: { id: true, slug: true, updatedAt: true },
    })
    return properties.map((p) => ({
      url: `${BASE_URL}/properties/${p.slug || p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    return []
  }
}


/**
 * Location URLs for one purpose, emitted ONLY where the gate passes.
 *
 * A sitemap must never advertise a page we mark noindex — that wastes crawl
 * budget and sends a contradictory signal. Pages appear here automatically as
 * inventory crosses the threshold.
 */
async function locationsSection(purpose: Purpose, now: Date): Promise<SitemapEntry[]> {
  try {
    const listingType = listingTypeForPurpose(purpose)
    const fsboOnly = purpose === 'owner'
    const out: SitemapEntry[] = []

    const types = [
      getTypeDef(ALL_TYPES_SLUG)!,
      ...typesForCategory('residential'),
      ...typesForCategory('commercial'),
    ]

    // Resolve counts for every level in one pass per type, rather than a
    // countFor() call per city/area/subarea — that was ~1,600 awaits and
    // timed out the build.
    for (const type of types) {
      const [cityCounts, areaCounts, subCounts] = await Promise.all([
        countsByLevel({ listingType, types: type.types, fsboOnly }, 'city'),
        purpose === 'owner' || type.tier !== 'A'
          ? Promise.resolve(new Map<string, number>())
          : countsByLevel({ listingType, types: type.types }, 'area'),
        purpose === 'owner' || type.tier !== 'A'
          ? Promise.resolve(new Map<string, number>())
          : countsByLevel({ listingType, types: type.types }, 'subarea'),
      ])

      // Type root — curated navigation, always included.
      out.push({
        url: `${BASE_URL}${buildTreeUrl({ purpose, typeSlug: type.slug })}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })

      for (const city of CITIES) {
        if (!inSitemap('city', cityCounts.get(city.slug) ?? 0)) continue

        out.push({
          url: `${BASE_URL}${buildTreeUrl({ purpose, typeSlug: type.slug, citySlug: city.slug })}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.7,
        })

        if (purpose === 'owner' || type.tier !== 'A') continue

        for (const area of city.areas) {
          if (!inSitemap('area', areaCounts.get(`${city.slug}/${area.slug}`) ?? 0)) continue

          out.push({
            url: `${BASE_URL}${buildTreeUrl({
              purpose,
              typeSlug: type.slug,
              citySlug: city.slug,
              areaSlug: area.slug,
            })}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.6,
          })

          for (const sub of area.subAreas ?? []) {
            const key = `${city.slug}/${area.slug}/${sub.slug}`
            if (!inSitemap('subarea', subCounts.get(key) ?? 0)) continue

            out.push({
              url: `${BASE_URL}${buildTreeUrl({
                purpose,
                typeSlug: type.slug,
                citySlug: city.slug,
                areaSlug: area.slug,
                subAreaSlug: sub.slug,
              })}`,
              lastModified: now,
              changeFrequency: 'weekly',
              priority: 0.5,
            })
          }
        }
      }
    }

    return out
  } catch (error) {
    console.error('locationsSection failed', error)
    return []
  }
}

function toolsSection(now: Date): SitemapEntry[] {
  return [
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...TOOL_SLUGS.map((slug) => ({
      url: `${BASE_URL}/tools/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}

/**
 * The ordered list of logical sections. Each is sharded into
 * <=MAX_PER_SITEMAP chunks, suffixed -1, -2, … when it spans more than one.
 *
 * Empty sections are skipped entirely, so with no inventory the index holds
 * only pages/guides/tools. That is correct, not a bug.
 */
function sections(): Section[] {
  const now = new Date()
  return [
    { name: 'pages', build: () => staticSection(now) },
    { name: 'guides', build: () => guidesSection(now) },
    { name: 'tools', build: () => toolsSection(now) },
    { name: 'for-sale-locations', build: () => locationsSection('for-sale', now) },
    { name: 'for-rent-locations', build: () => locationsSection('for-rent', now) },
    { name: 'owner-locations', build: () => locationsSection('owner', now) },
    { name: 'listings-sale', build: () => propertiesSection('FOR_SALE') },
    { name: 'listings-rent', build: () => propertiesSection('FOR_RENT') },
  ]
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function computeShards(): Promise<{ name: string; entries: SitemapEntry[] }[]> {
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

/**
 * Build every section, shard each into <=MAX_PER_SITEMAP chunks, and return
 * named shards. A single-chunk section keeps its base name (`guides`);
 * multi-chunk sections are suffixed `-1`, `-2`, …
 *
 * Cached: this was previously recomputed on every shard request AND again by
 * getShardEntries, so one sitemap fetch ran the full location sweep twice.
 *
 * Cache is time-based rather than push-invalidated because PM2 runs in cluster
 * mode — revalidateTag would only reach the process that served the request.
 */
export const getAllShards = unstable_cache(computeShards, ['sitemap-shards-v2'], {
  revalidate: 600,
  tags: ['sitemaps'],
})

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
