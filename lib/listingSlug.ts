/**
 * Listing slug generation.
 *
 * The listing URL is flat (/properties/{slug}) and the slug is frozen at
 * creation, so it survives status, listingType and location edits. That means
 * the keywords have to live in the slug itself rather than the path:
 *
 *   5-marla-house-for-sale-in-dha-phase-6-lahore-k3f9
 *
 * A short random suffix makes collisions effectively impossible, which avoids
 * the read-then-write loop that previously raced under concurrent creates.
 */

import { slugify } from '@/lib/slugify'

export interface SlugInput {
  title?: string | null
  propertyType?: string | null
  listingType?: string | null
  city?: string | null
  area?: string | null
  subArea?: string | null
  marla?: number | string | null
  kanal?: number | string | null
}

/** 4 chars of base36 — ~1.7M combinations per identical descriptor. */
function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}

function num(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Trim a slug to a sane length without cutting a word in half. */
function truncate(slug: string, max = 90): string {
  if (slug.length <= max) return slug
  const cut = slug.slice(0, max)
  const lastDash = cut.lastIndexOf('-')
  return lastDash > 40 ? cut.slice(0, lastDash) : cut
}

/**
 * Build a descriptive, unique listing slug.
 *
 * Falls back to the title (and ultimately to "property") when the structured
 * fields are missing, so this never returns an empty string.
 */
export function buildListingSlug(input: SlugInput): string {
  const parts: string[] = []

  // Prefer whichever unit reads naturally: Pakistanis say "10 marla", not
  // "0.5 kanal". Below 1 kanal, express the size in marla instead.
  const kanal = num(input.kanal)
  const marla = num(input.marla)
  if (kanal && kanal >= 1) parts.push(`${trimNumber(kanal)}-kanal`)
  else if (marla) parts.push(`${trimNumber(marla)}-marla`)
  else if (kanal) parts.push(`${trimNumber(kanal * 20)}-marla`)

  if (input.propertyType) {
    parts.push(input.propertyType.toLowerCase().replace(/_/g, '-'))
  }

  if (input.listingType === 'FOR_RENT') parts.push('for-rent')
  else if (input.listingType === 'FOR_SALE') parts.push('for-sale')

  const place = [input.subArea, input.area, input.city].filter(Boolean).join(' ')
  if (place) parts.push('in', slugify(place))

  let base = slugify(parts.join(' '))

  // No structured data to work with — fall back to the title.
  if (!base) base = slugify(input.title ?? '')
  if (!base) base = 'property'

  return `${truncate(base)}-${randomSuffix()}`
}

function trimNumber(n: number): string {
  // 10 -> "10", 2.5 -> "2-5" (decimal point is not slug-safe)
  return String(n).replace(/\./g, '-')
}

/**
 * Retry wrapper for the unique constraint on Property.slug.
 *
 * A collision means the random suffix repeated for an identical descriptor;
 * regenerating is enough. Three attempts is far beyond what the odds require.
 */
export async function withUniqueSlug<T>(
  input: SlugInput,
  create: (slug: string) => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await create(buildListingSlug(input))
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code
      if (code !== 'P2002') throw error
      lastError = error
    }
  }
  throw lastError
}
