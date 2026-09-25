/**
 * Write cleaned rows into the database the same way a seller's post would:
 * canonical location slugs, a keyworded slug, the duplicate hash, photos run
 * through the watermark pipeline, and a contact the listing page can reveal.
 *
 * Every row is tagged `listingSource = IMPORT:<batch>` so a batch can be
 * audited or rolled back as a unit.
 */

import { randomUUID, randomBytes } from 'crypto'
import path from 'path'
import { promises as fs } from 'fs'
import bcrypt from 'bcryptjs'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { resolveLocation } from '@/lib/locations'
import { withUniqueSlug } from '@/lib/listingSlug'
import { normalizeAddress, calculateAddressHash } from '@/lib/addressNormalization'
import { getCityCoordinates, CITY_COORDINATES } from '@/lib/constants/cities'
import { serialiseNearbyPlaces, type NearbyPlace } from '@/lib/listingFields'
import { processPropertyImage, validateImageFile, deletePropertyImages } from '@/lib/image-processing'
import { resolveShortMapsLink, checkPair, type LatLng } from './geo'
import type { CleanRow, CleanContact } from './row'

/** Placeholder accounts for imported contacts. `.invalid` can never receive mail. */
export const IMPORT_EMAIL_DOMAIN = 'imported.medaghar.invalid'

export interface WriteOptions {
  batch: string
  /** Validate and dedupe only; touch nothing. */
  dryRun: boolean
  /** Import rows short of the photo minimum, hidden (OFF_MARKET), instead of rejecting them. */
  allowFewPhotos: boolean
  /** Root for image paths that are not URLs. Paths may not escape it. */
  imagesDir?: string
  /** Follow maps.app.goo.gl links over the network. */
  resolveShortLinks: boolean
}

export type Outcome = 'imported' | 'imported-hidden' | 'would-import' | 'duplicate' | 'rejected'

export interface WriteResult {
  outcome: Outcome
  reasons: string[]
  warnings: string[]
  propertyId?: string
  slug?: string
}

// ---------------------------------------------------------------------------
// Caches shared across one run
// ---------------------------------------------------------------------------

const shortLinkCache = new Map<string, Promise<LatLng | null>>()
const contactCache = new Map<string, Promise<{ userId: string; agentId: string | null }>>()
/** Dedup keys seen earlier in this same file. */
const seenInRun = new Set<string>()

export function resetRunState() {
  shortLinkCache.clear()
  contactCache.clear()
  seenInRun.clear()
}

// ---------------------------------------------------------------------------
// Duplicates
// ---------------------------------------------------------------------------

/**
 * Same address, same kind of property, same size and bedrooms. Price is left
 * out of the key: two dealers quoting one house rarely agree on the demand.
 */
function dedupKey(r: CleanRow, addressHash: string): string {
  const d = r.data
  return [addressHash, d.propertyType, d.listingType, d.bedrooms, d.marla ?? '', d.squareFeet ?? ''].join('|')
}

async function findExisting(r: CleanRow, addressHash: string) {
  const d = r.data
  return prisma.property.findFirst({
    where: {
      addressHash,
      propertyType: d.propertyType as never,
      listingType: d.listingType as never,
      bedrooms: d.bedrooms as number,
      marla: (d.marla as number | null) ?? null,
      squareFeet: (d.squareFeet as number | null) ?? null,
      status: { in: ['ACTIVE', 'PENDING', 'UNDER_CONTRACT', 'OFF_MARKET'] },
    },
    select: { id: true, slug: true, listingSource: true },
  })
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

/**
 * One account per phone number. Existing real accounts are linked but never
 * modified; new contacts get a placeholder account with an unusable password
 * and an undeliverable address, so nothing is ever emailed to them.
 */
function contactFor(c: CleanContact): Promise<{ userId: string; agentId: string | null }> {
  let p = contactCache.get(c.phone)
  if (!p) {
    p = upsertContact(c)
    contactCache.set(c.phone, p)
    p.catch(() => contactCache.delete(c.phone))
  }
  return p
}

async function upsertContact(c: CleanContact) {
  const local = c.phone.replace(/^\+92/, '0')
  const existing = await prisma.user.findFirst({
    where: { phone: { in: [c.phone, local, c.phone.slice(1)] } },
    select: { id: true, email: true, agentProfile: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  })
  if (existing) {
    let agentId = existing.agentProfile?.id ?? null
    // Only give an agent profile to an account this importer created.
    if (!agentId && c.isDealer && existing.email.endsWith(`@${IMPORT_EMAIL_DOMAIN}`)) {
      agentId = (await createAgent(existing.id, c)).id
    }
    return { userId: existing.id, agentId }
  }

  const [firstName, ...rest] = c.name.trim().split(/\s+/)
  const user = await prisma.user.create({
    data: {
      email: `${c.phone.replace(/\D/g, '')}@${IMPORT_EMAIL_DOMAIN}`,
      password: await bcrypt.hash(randomBytes(24).toString('hex'), 10),
      firstName: firstName || 'Property',
      lastName: rest.join(' '),
      phone: c.phone,
      role: c.isDealer ? 'AGENT' : 'SELLER',
    },
    select: { id: true },
  })
  const agentId = c.isDealer ? (await createAgent(user.id, c)).id : null
  return { userId: user.id, agentId }
}

function createAgent(userId: string, c: CleanContact) {
  return prisma.agent.create({
    data: {
      userId,
      phoneNumber: c.phone,
      yearsExperience: 0,
      bio: c.agency ? `${c.agency}` : null,
      officeAddress: null,
    },
    select: { id: true },
  })
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

const MAX_IMAGE_BYTES = 15 * 1024 * 1024

async function loadImage(
  src: string,
  imagesDir: string | undefined
): Promise<{ buffer: Buffer; mimeType: string; originalName: string }> {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0 (MedaGhar listing import)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const mimeType = (res.headers.get('content-type') ?? '').split(';')[0].trim()
    const len = Number(res.headers.get('content-length') ?? 0)
    if (len > MAX_IMAGE_BYTES) throw new Error('larger than 15 MB')
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length > MAX_IMAGE_BYTES) throw new Error('larger than 15 MB')
    const name = path.basename(new URL(src).pathname) || 'photo.jpg'
    return { buffer, mimeType: sniffMime(buffer) ?? (mimeType || mimeFromName(name)), originalName: name }
  }

  if (!imagesDir) throw new Error('local path given but no images folder set')
  const root = path.resolve(imagesDir)
  const full = path.resolve(root, src)
  if (full !== root && !full.startsWith(root + path.sep)) throw new Error('path escapes the images folder')
  const buffer = await fs.readFile(full)
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error('larger than 15 MB')
  return { buffer, mimeType: sniffMime(buffer) ?? mimeFromName(full), originalName: path.basename(full) }
}

/** Hosts often send image/jpg or octet-stream; trust the bytes instead. */
function sniffMime(b: Buffer): string | null {
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg'
  if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return 'image/png'
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

function mimeFromName(name: string): string {
  const ext = path.extname(name).toLowerCase()
  return (
    { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] ??
    'application/octet-stream'
  )
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

export async function writeRow(r: CleanRow, opts: WriteOptions, warnings: string[]): Promise<WriteResult> {
  const d = r.data

  // Coordinates: explicit, then short link, then the city centre.
  let coords = r.coords
  if (!coords && r.pendingMapsLink) {
    if (opts.resolveShortLinks) {
      let p = shortLinkCache.get(r.pendingMapsLink)
      if (!p) {
        p = resolveShortMapsLink(r.pendingMapsLink)
        shortLinkCache.set(r.pendingMapsLink, p)
      }
      const found = await p
      const ok = found && checkPair(found.lat, found.lng)
      if (ok) coords = ok.point
      else warnings.push('short Google Maps link has no pin coordinates; using city centre')
    } else {
      warnings.push('short Google Maps link not resolved (offline run); using city centre')
    }
  }
  if (!coords) {
    if (!CITY_COORDINATES[d.city as string]) {
      return { outcome: 'rejected', reasons: [`no coordinates and no known centre for city "${d.city}"`], warnings }
    }
    const c = getCityCoordinates(d.city as string)
    coords = { lat: c.lat, lng: c.lng }
    if (!r.pendingMapsLink) warnings.push('no coordinates; placed at city centre')
  }

  const normalizedAddress = normalizeAddress(d.address as string, d.city as string, (d.area as string) || '')
  const addressHash = calculateAddressHash(normalizedAddress)

  const k = dedupKey(r, addressHash)
  if (seenInRun.has(k)) {
    return { outcome: 'duplicate', reasons: ['same property appears earlier in this file'], warnings }
  }
  seenInRun.add(k)

  const existing = await findExisting(r, addressHash)
  if (existing) {
    return {
      outcome: 'duplicate',
      reasons: [
        existing.listingSource?.startsWith('IMPORT:')
          ? `already imported (${existing.listingSource})`
          : 'already listed on the site',
      ],
      warnings,
      propertyId: existing.id,
      slug: existing.slug ?? undefined,
    }
  }

  if (r.images.length < r.minImages && !opts.allowFewPhotos) {
    return {
      outcome: 'rejected',
      reasons: [`${r.images.length} photos, this type needs at least ${r.minImages}`],
      warnings,
    }
  }

  if (opts.dryRun) return { outcome: 'would-import', reasons: [], warnings }

  // --- Commit -----------------------------------------------------------------
  const id = randomUUID()
  const imageUrls: string[] = []
  for (const src of r.images) {
    try {
      const file = await loadImage(src, opts.imagesDir)
      const check = validateImageFile(file)
      if (!check.valid) throw new Error(check.error)
      const out = await processPropertyImage(file, id)
      imageUrls.push(out.watermarked.url)
    } catch (e) {
      warnings.push(`photo skipped (${src.slice(0, 80)}): ${(e as Error).message}`)
    }
  }
  const hidden = imageUrls.length < r.minImages
  if (hidden && !opts.allowFewPhotos) {
    await deletePropertyImages(id).catch(() => {})
    seenInRun.delete(k)
    return {
      outcome: 'rejected',
      reasons: [`only ${imageUrls.length} of ${r.images.length} photos loaded, this type needs ${r.minImages}`],
      warnings,
    }
  }

  const contact = await contactFor(r.contact)
  const resolved = resolveLocation({
    city: d.city as string,
    area: d.area as string | null,
    subArea: d.subArea as string | null,
  })
  if (resolved.matched === 'none' || (d.area && !resolved.areaSlug)) {
    warnings.push('area not in the site taxonomy; listing will not appear on area pages')
  }

  const { nearbyPlaces, ...fields } = d
  const property = await withUniqueSlug(
    {
      title: d.title as string,
      propertyType: d.propertyType as string,
      listingType: d.listingType as string,
      city: d.city as string,
      area: d.area as string | null,
      subArea: d.subArea as string | null,
      marla: d.marla as number | null,
      kanal: d.kanal as number | null,
    },
    (slug) =>
      prisma.property.create({
        data: {
          ...(fields as Record<string, unknown>),
          id,
          slug,
          country: 'Pakistan',
          latitude: coords!.lat,
          longitude: coords!.lng,
          citySlug: resolved.citySlug,
          areaSlug: resolved.areaSlug,
          subAreaSlug: resolved.subAreaSlug,
          normalizedAddress,
          addressHash,
          nearbyPlaces: serialiseNearbyPlaces(nearbyPlaces as NearbyPlace[]),
          status: hidden ? 'OFF_MARKET' : 'ACTIVE',
          isFSBO: !r.contact.isDealer,
          ownerId: contact.userId,
          agentId: contact.agentId,
          listedDate: r.listedDate,
          listingSource: `IMPORT:${opts.batch}`,
          images: {
            create: imageUrls.map((url, order) => ({ url, order })),
          },
          priceHistory: {
            create: [{ price: d.price as number, eventType: 'Listed', eventDate: r.listedDate }],
          },
        } as Prisma.PropertyUncheckedCreateInput,
        select: { id: true, slug: true },
      })
  )

  if (hidden) warnings.push(`hidden until it has ${r.minImages} photos (has ${imageUrls.length})`)
  return {
    outcome: hidden ? 'imported-hidden' : 'imported',
    reasons: [],
    warnings,
    propertyId: property.id,
    slug: property.slug ?? undefined,
  }
}

/** Remove every listing a batch created, with its photos. Contacts are kept. */
export async function rollbackBatch(batch: string): Promise<number> {
  const rows = await prisma.property.findMany({
    where: { listingSource: `IMPORT:${batch}` },
    select: { id: true },
  })
  for (const { id } of rows) await deletePropertyImages(id).catch(() => {})
  const { count } = await prisma.property.deleteMany({ where: { listingSource: `IMPORT:${batch}` } })
  return count
}
