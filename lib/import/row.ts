/**
 * Turn one spreadsheet row into a clean listing, or a list of reasons why not.
 *
 * Pure — no database, no network — so the whole file can be validated before
 * anything is written. Column names follow the Property model (prisma schema)
 * but also accept the everyday headings agents use ("Demand", "Beds",
 * "Google Maps", "Posted on"), matched case- and punctuation-insensitively.
 */

import { PropertyType, ListingType } from '@prisma/client'
import { checkPair, parseLatLngText, parseMapsUrl, isShortMapsLink, type LatLng } from './geo'
import { minImagesFor, MAX_IMAGES } from '@/lib/imageRules'
import { NEARBY_AMENITIES, type NearbyPlace } from '@/lib/listingFields'
import { getCityProvince, CITY_PROVINCES } from '@/lib/constants/cities'
import { validatePakistaniPhone, formatPakistaniPhone, PAKISTAN_LANDLINE_REGEX } from '@/lib/phoneValidation'

export type RawRow = Record<string, unknown>

export interface ImportOptions {
  /** Rows posted longer ago than this are rejected. */
  maxAgeDays: number
  /** Reference "now", injectable for tests. */
  now?: Date
  /** Read 03/04/2026 as March 4 instead of the Pakistani 3 April. */
  monthFirstDates?: boolean
}

export interface CleanContact {
  name: string
  phone: string // +923001234567
  email: string | null
  agency: string | null
  isDealer: boolean
}

export interface CleanRow {
  /** Row's own id column, echoed into the report so it can be joined back. */
  sourceId: string | null
  data: Record<string, unknown> // Property create fields, sans relations/slug
  coords: LatLng | null
  /** Short maps link still to be resolved over the network. */
  pendingMapsLink: string | null
  images: string[]
  minImages: number
  contact: CleanContact
  listedDate: Date
}

export interface RowResult {
  row: CleanRow | null
  errors: string[]
  warnings: string[]
}

// ---------------------------------------------------------------------------
// Column aliases
// ---------------------------------------------------------------------------

const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Canonical field -> accepted headings (normalised with `key`). */
const ALIASES: Record<string, string[]> = {
  sourceId: ['id', 'sourceid', 'rowid', 'ref', 'refno', 'reference', 'externalid'],
  title: ['title', 'heading', 'listingtitle'],
  description: ['description', 'details', 'desc'],
  listingType: ['listingtype', 'purpose', 'forsaleorrent', 'saleorrent'],
  propertyType: ['propertytype', 'category', 'propertycategory', 'subtype'],
  address: ['address', 'fulladdress', 'location', 'plotno', 'houseno'],
  city: ['city'],
  province: ['province', 'state'],
  area: ['area', 'society', 'locality', 'scheme', 'town'],
  subArea: ['subarea', 'block', 'phase', 'sector', 'phaseblock'],
  zipCode: ['zipcode', 'zip', 'postcode', 'postalcode'],
  latitude: ['latitude', 'lat'],
  longitude: ['longitude', 'lng', 'lon', 'long'],
  coordinates: ['coordinates', 'coords', 'latlng', 'latlong', 'gps', 'pin'],
  mapsUrl: [
    'googlemapsurl', 'googlemapslink', 'googlemaps', 'gmaps', 'gmapslink', 'mapsurl', 'mapslink',
    'maplink', 'mapurl', 'locationurl', 'locationlink', 'map',
  ],
  price: ['price', 'demand', 'rent', 'amount', 'pricepkr', 'demandpkr'],
  bedrooms: ['bedrooms', 'beds', 'bed', 'rooms'],
  bathrooms: ['bathrooms', 'baths', 'bath', 'washrooms'],
  squareFeet: ['squarefeet', 'sqft', 'coveredarea', 'coveredareasqft', 'areasqft'],
  marla: ['marla'],
  kanal: ['kanal'],
  size: ['size', 'plotsize', 'landarea'],
  lotSize: ['lotsize'],
  yearBuilt: ['yearbuilt', 'built', 'constructionyear'],
  features: ['features', 'amenities'],
  nearbyPlaces: ['nearbyplaces', 'nearby', 'nearplaces', 'nearbyamenities'],
  nearbyLandmark: ['nearbylandmark', 'landmark'],
  videoUrl: ['videourl', 'video', 'videolink', 'youtube'],
  virtualTourUrl: ['virtualtoururl', 'virtualtour', 'tour360'],
  images: ['images', 'photos', 'imageurls', 'photourls', 'pictures', 'pics'],
  contactName: ['contactname', 'ownername', 'agentname', 'dealername', 'name', 'contactperson'],
  contactPhone: [
    'contactphone', 'phone', 'mobile', 'whatsapp', 'contact', 'phonenumber', 'contactnumber',
    'cell', 'ownerphone', 'agentphone', 'dealerphone',
  ],
  contactEmail: ['contactemail', 'email', 'owneremail', 'agentemail'],
  agencyName: ['agencyname', 'agency', 'dealeragency', 'company', 'estate'],
  contactType: ['contacttype', 'ownerordealer', 'postedby', 'advertiser', 'sellertype'],
  listedDate: [
    'listeddate', 'posteddate', 'dateposted', 'postedon', 'postedat', 'date', 'createdat',
    'listedon', 'datecollected', 'addedon', 'publishedat',
  ],
  maintenanceFees: ['maintenancefees', 'maintenance', 'societydues'],
  parkingSpaces: ['parkingspaces', 'parking', 'carparking'],
  garage: ['garage'],
  pool: ['pool', 'swimmingpool'],
  possession: ['possession'],
  furnishing: ['furnishing', 'furnished'],
  facing: ['facing'],
  cornerProperty: ['cornerproperty', 'corner'],
  documentType: ['documenttype', 'documents', 'papers'],
  approvalAuthority: ['approvalauthority', 'approvedby', 'authority'],
  nocAvailable: ['nocavailable', 'noc'],
  installmentsAvailable: ['installmentsavailable', 'installments', 'oninstallments'],
  installmentMonths: ['installmentmonths'],
  downPayment: ['downpayment'],
  hasElectricity: ['haselectricity', 'electricity'],
  backupPower: ['backuppower', 'backup', 'solar'],
  hasSuiGas: ['hassuigas', 'suigas', 'gas'],
  waterSource: ['watersource', 'water'],
  advanceMonths: ['advancemonths', 'advance'],
  securityDeposit: ['securitydeposit', 'security', 'deposit'],
  rentIncrementPct: ['rentincrementpct', 'rentincrement', 'increment'],
  tenantPreference: ['tenantpreference', 'tenants'],
  floors: ['floors', 'storeys', 'stories'],
  floorNumber: ['floornumber', 'floor'],
  hasLift: ['haslift', 'lift', 'elevator'],
  plotWidthFt: ['plotwidthft', 'plotwidth', 'width'],
  plotLengthFt: ['plotlengthft', 'plotlength', 'length'],
  roadWidthFt: ['roadwidthft', 'roadwidth'],
  kitchens: ['kitchens'],
  storeRooms: ['storerooms', 'store'],
  drawingRoom: ['drawingroom', 'drawing'],
  tvLounge: ['tvlounge', 'lounge'],
  servantQuarter: ['servantquarter', 'servantquarters', 'servantroom'],
}

/** heading -> field, plus the alias's rank so `listedDate` beats `createdAt`. */
const LOOKUP = new Map<string, { field: string; rank: number }>()
for (const [field, names] of Object.entries(ALIASES)) {
  names.forEach((n, rank) => {
    if (!LOOKUP.has(key(n))) LOOKUP.set(key(n), { field, rank })
  })
}

/** Headings in the file that map to nothing — shown once, before import. */
export function unknownColumns(headers: string[]): string[] {
  return headers.filter((h) => !LOOKUP.has(key(h)) && !/^(image|photo|picture)\d+$/.test(key(h)))
}

function canonicalise(raw: RawRow): { fields: Record<string, string>; imageCols: string[] } {
  const fields: Record<string, string> = {}
  const ranks: Record<string, number> = {}
  const imageCols: [number, string][] = []
  for (const [heading, value] of Object.entries(raw)) {
    const v = value === null || value === undefined ? '' : String(value).trim()
    const k = key(heading)
    const numbered = k.match(/^(?:image|photo|picture)(\d+)$/)
    if (numbered) {
      if (v) imageCols.push([parseInt(numbered[1]), v])
      continue
    }
    const hit = LOOKUP.get(k)
    // When two headings alias one field, the more specific heading wins.
    if (hit && v && (ranks[hit.field] === undefined || hit.rank < ranks[hit.field])) {
      fields[hit.field] = v
      ranks[hit.field] = hit.rank
    }
  }
  imageCols.sort((a, b) => a[0] - b[0])
  return { fields, imageCols: imageCols.map(([, v]) => v) }
}

// ---------------------------------------------------------------------------
// Value parsers
// ---------------------------------------------------------------------------

/** "4,50,00,000", "4.5 crore", "45 lakh", "PKR 85,000" -> number. */
export function parsePrice(text: string): number | null {
  const t = text.toLowerCase().replace(/pkr|rs\.?|rupees/g, '').trim()
  const unit = t.match(/(arab|crore|cr|lakh|lac|lakhs|thousand|k)\b/)
  const n = parseFloat(t.replace(/,/g, '').replace(/[^\d.]/g, ''))
  if (!Number.isFinite(n)) return null
  const mult: Record<string, number> = {
    arab: 1e9, crore: 1e7, cr: 1e7, lakh: 1e5, lac: 1e5, lakhs: 1e5, thousand: 1e3, k: 1e3,
  }
  return unit ? n * mult[unit[1]] : n
}

function parseNum(text: string | undefined): number | null {
  if (!text) return null
  const n = parseFloat(text.replace(/,/g, '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

function parseIntOrNull(text: string | undefined): number | null {
  const n = parseNum(text)
  return n === null ? null : Math.round(n)
}

const TRUE = new Set(['yes', 'y', 'true', '1', 'ha', 'haan', 'available', 'yes available'])
const FALSE = new Set(['no', 'n', 'false', '0', 'nahi', 'not available', 'none'])

function parseBool(text: string | undefined): boolean | null {
  if (!text) return null
  const t = text.toLowerCase().trim()
  if (TRUE.has(t)) return true
  if (FALSE.has(t)) return false
  return null
}

/** "10 marla", "1 kanal", "120 sq yd", "2,000 sqft" */
export function parseSize(text: string): { marla?: number; kanal?: number; squareFeet?: number } | null {
  const t = text.toLowerCase().replace(/,/g, '')
  const n = parseFloat(t)
  if (!Number.isFinite(n)) return null
  if (/kanal/.test(t)) return { kanal: n, marla: n * 20 }
  if (/marla/.test(t)) return n >= 20 ? { marla: n, kanal: n / 20 } : { marla: n }
  if (/(sq\.?\s*y|square\s*y|gaz|yard)/.test(t)) return { squareFeet: Math.round(n * 9) }
  if (/(sq\.?\s*f|sqft|square\s*f|ft)/.test(t)) return { squareFeet: Math.round(n) }
  return null
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/**
 * Dates as they appear in collected sheets: ISO, 14/06/2026 (day first — the
 * Pakistani convention), 14-Jun-2026, "Jun 14, 2026", or an Excel serial
 * number when the sheet was saved without date formatting.
 */
export function parseDate(text: string, monthFirst = false): Date | null {
  const t = text.trim()
  if (!t) return null

  if (/^\d{5}(\.\d+)?$/.test(t)) {
    const serial = parseFloat(t)
    if (serial > 30000 && serial < 80000) {
      // Excel's day 0 is 1899-12-30 once its 1900 leap-year bug is accounted for.
      return new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
    }
  }

  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (m) {
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0)))
    return valid(d, +m[2], +m[3])
  }

  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/)
  if (m) {
    let [a, b] = [+m[1], +m[2]]
    if (monthFirst) [a, b] = [b, a]
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]
    return valid(new Date(Date.UTC(y, b - 1, a)), b, a)
  }

  m = t.match(/^(\d{1,2})[\s/-]+([a-z]{3,})[a-z]*[\s/,-]+(\d{2,4})/i)
  if (m) {
    const mon = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase())
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]
    if (mon >= 0) return valid(new Date(Date.UTC(y, mon, +m[1])), mon + 1, +m[1])
  }

  m = t.match(/^([a-z]{3,})[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i)
  if (m) {
    const mon = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase())
    if (mon >= 0) return valid(new Date(Date.UTC(+m[3], mon, +m[2])), mon + 1, +m[2])
  }

  return null
}

/** Reject 31/02 and friends, which Date silently rolls into March. */
function valid(d: Date, month: number, day: number): Date | null {
  if (isNaN(d.getTime())) return null
  if (d.getUTCMonth() + 1 !== month || d.getUTCDate() !== day) return null
  return d
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

const PROPERTY_TYPE_ALIASES: Record<string, PropertyType> = {
  house: 'HOUSE', home: 'HOUSE', villa: 'HOUSE', bungalow: 'HOUSE', kothi: 'HOUSE',
  flat: 'FLAT', apartment: 'FLAT',
  upperportion: 'UPPER_PORTION', lowerportion: 'LOWER_PORTION',
  farmhouse: 'FARM_HOUSE', room: 'ROOM', penthouse: 'PENTHOUSE', basement: 'BASEMENT',
  hostel: 'HOSTEL', guesthouse: 'GUEST_HOUSE', hotelsuites: 'HOTEL_SUITES', beachhut: 'BEACH_HUT',
  plot: 'RESIDENTIAL_PLOT', residentialplot: 'RESIDENTIAL_PLOT',
  commercialplot: 'COMMERCIAL_PLOT',
  agriculturalland: 'AGRICULTURAL_LAND', agricultureland: 'AGRICULTURAL_LAND',
  industrialland: 'INDUSTRIAL_LAND',
  plotfile: 'PLOT_FILE', file: 'PLOT_FILE', plotform: 'PLOT_FORM',
  office: 'OFFICE', shop: 'SHOP', warehouse: 'WAREHOUSE', factory: 'FACTORY',
  building: 'BUILDING', other: 'OTHER',
}

export function parsePropertyType(text: string): PropertyType | null {
  const k = key(text)
  if (PROPERTY_TYPE_ALIASES[k]) return PROPERTY_TYPE_ALIASES[k]
  const upper = text.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_')
  return (Object.values(PropertyType) as string[]).includes(upper) ? (upper as PropertyType) : null
}

export function parseListingType(text: string): ListingType | null {
  const k = key(text)
  if (['forsale', 'sale', 'sell', 'buy'].includes(k)) return 'FOR_SALE'
  if (['forrent', 'rent', 'rental', 'tolet', 'lease'].includes(k)) return 'FOR_RENT'
  return null
}

const LAND_TYPES = new Set<PropertyType>([
  'RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT', 'AGRICULTURAL_LAND', 'INDUSTRIAL_LAND', 'PLOT_FILE', 'PLOT_FORM',
])

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

function splitList(text: string): string[] {
  const t = text.trim()
  if (t.startsWith('[')) {
    try {
      const arr = JSON.parse(t)
      if (Array.isArray(arr)) return arr.map((x) => (typeof x === 'string' ? x : x?.url ?? '')).filter(Boolean)
    } catch {
      /* fall through */
    }
  }
  // Prefer separators URLs never contain; fall back to commas.
  const sep = /[|\n;]/.test(t) ? /[|\n;]+/ : /,\s*/
  return t.split(sep).map((s) => s.trim()).filter(Boolean)
}

const AMENITY_KEYS = new Map<string, string>()
for (const a of NEARBY_AMENITIES) {
  AMENITY_KEYS.set(key(a.key), a.key)
  for (const part of a.label.split('/')) AMENITY_KEYS.set(key(part), a.key)
}
Object.entries({
  mosque: 'masjid', college: 'university', clinic: 'hospital', medicalstore: 'pharmacy',
  playground: 'park', bazaar: 'market', grocery: 'superstore', metro: 'transport',
  busstop: 'transport', atm: 'bank', cng: 'petrol', club: 'community', boulevard: 'mainroad',
}).forEach(([k, v]) => AMENITY_KEYS.set(k, v))

/**
 * Stored JSON, or a readable list: "Masjid (walking distance) | School - 5 min".
 * Places outside the site's vocabulary are dropped with a warning, since the
 * listing page can only render known amenity types.
 */
function parseNearby(text: string, warnings: string[]): NearbyPlace[] {
  const t = text.trim()
  if (t.startsWith('[')) {
    try {
      const arr = JSON.parse(t)
      if (Array.isArray(arr)) {
        return arr
          .map((e) => (typeof e === 'string' ? { type: e, distance: '' } : e))
          .map((e) => ({ ...e, type: AMENITY_KEYS.get(key(String(e.type ?? e.name ?? ''))) ?? e.type }))
      }
    } catch {
      /* fall through */
    }
  }
  const out: NearbyPlace[] = []
  const dropped: string[] = []
  for (const item of t.split(/[|\n;,]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = item.match(/^([^(\-:]+?)\s*(?:[(\-:]\s*(.+?)\)?)?$/)
    const label = (m?.[1] ?? item).trim()
    const type = AMENITY_KEYS.get(key(label))
    if (type) out.push({ type, distance: (m?.[2] ?? '').trim() })
    else dropped.push(label)
  }
  if (dropped.length) warnings.push(`nearby places not recognised, skipped: ${dropped.join(', ')}`)
  return out
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

const KNOWN_CITIES = new Map(Object.keys(CITY_PROVINCES).map((c) => [c.toLowerCase(), c]))

export function cleanRow(raw: RawRow, opts: ImportOptions): RowResult {
  const errors: string[] = []
  const warnings: string[] = []
  const { fields: f, imageCols } = canonicalise(raw)
  const now = opts.now ?? new Date()

  // --- Purpose and type ------------------------------------------------------
  const listingType = f.listingType ? parseListingType(f.listingType) : null
  if (!listingType) errors.push(`listing type "${f.listingType ?? ''}" must be For Sale or For Rent`)
  const propertyType = f.propertyType ? parsePropertyType(f.propertyType) : null
  if (!propertyType) errors.push(`property type "${f.propertyType ?? ''}" is not a site category`)

  // --- Date: only fresh listings are wanted --------------------------------
  const listedDate = f.listedDate ? parseDate(f.listedDate, opts.monthFirstDates) : null
  if (!f.listedDate) errors.push('posted date is missing')
  else if (!listedDate) errors.push(`posted date "${f.listedDate}" is not a date`)
  else {
    const ageDays = (now.getTime() - listedDate.getTime()) / 86400000
    if (ageDays > opts.maxAgeDays) {
      errors.push(`posted ${Math.floor(ageDays)} days ago (limit ${opts.maxAgeDays})`)
    } else if (ageDays < -1) {
      errors.push(`posted date ${f.listedDate} is in the future`)
    }
  }

  // --- Location ---------------------------------------------------------------
  const city = f.city ? KNOWN_CITIES.get(f.city.toLowerCase()) ?? f.city : ''
  if (!city) errors.push('city is missing')
  const province = f.province || (city && KNOWN_CITIES.has(city.toLowerCase()) ? getCityProvince(city) : '')
  if (city && !province) errors.push(`province is missing and "${city}" is not a known city`)
  const address = f.address || [f.subArea, f.area].filter(Boolean).join(', ')
  if (!address) errors.push('address is missing')

  let coords: LatLng | null = null
  let pendingMapsLink: string | null = null
  const lat = parseNum(f.latitude)
  const lng = parseNum(f.longitude)
  if (lat !== null && lng !== null) {
    const ok = checkPair(lat, lng)
    if (!ok) errors.push(`coordinates ${lat}, ${lng} are outside Pakistan`)
    else {
      coords = ok.point
      if (ok.swapped) warnings.push('latitude and longitude were swapped; corrected')
    }
  }
  if (!coords && f.coordinates) {
    const p = parseLatLngText(f.coordinates) ?? parseMapsUrl(f.coordinates)
    const ok = p && checkPair(p.lat, p.lng)
    if (ok) coords = ok.point
    else errors.push(`coordinates "${f.coordinates}" could not be read`)
  }
  if (!coords && f.mapsUrl) {
    const p = parseMapsUrl(f.mapsUrl)
    const ok = p && checkPair(p.lat, p.lng)
    if (ok) coords = ok.point
    else if (isShortMapsLink(f.mapsUrl)) pendingMapsLink = f.mapsUrl
    else if (p) errors.push('Google Maps link points outside Pakistan')
    else warnings.push('Google Maps link has no pin coordinates; using city centre')
  }

  // --- Money and size -------------------------------------------------------
  const price = f.price ? parsePrice(f.price) : null
  if (!price || price <= 0) errors.push(`price "${f.price ?? ''}" is not a number`)

  let marla = parseNum(f.marla)
  let kanal = parseNum(f.kanal)
  let squareFeet = parseIntOrNull(f.squareFeet)
  if (f.size && marla === null && kanal === null && squareFeet === null) {
    const s = parseSize(f.size)
    if (s) {
      marla = s.marla ?? null
      kanal = s.kanal ?? null
      squareFeet = s.squareFeet ?? null
    } else warnings.push(`size "${f.size}" has no recognised unit`)
  }
  if (kanal !== null && marla === null) marla = kanal * 20

  const land = propertyType ? LAND_TYPES.has(propertyType) : false
  const bedrooms = parseIntOrNull(f.bedrooms) ?? (land ? 0 : null)
  const bathrooms = parseNum(f.bathrooms) ?? (land ? 0 : null)
  if (bedrooms === null) errors.push('bedrooms is missing')
  if (bathrooms === null) errors.push('bathrooms is missing')

  // --- Contact --------------------------------------------------------------
  const phoneRaw = (f.contactPhone ?? '').replace(/[\s\-()]/g, '').replace(/^0092/, '+92').replace(/^92(?=3)/, '+92')
  let phone = ''
  if (!phoneRaw) errors.push('contact phone is missing')
  else if (validatePakistaniPhone(phoneRaw) || PAKISTAN_LANDLINE_REGEX.test(phoneRaw)) {
    phone = formatPakistaniPhone(phoneRaw)
  } else errors.push(`contact phone "${f.contactPhone}" is not a Pakistani number`)

  const contactType = (f.contactType ?? '').toLowerCase()
  const isDealer = /dealer|agent|agency|broker|estate/.test(contactType) || (!!f.agencyName && !/owner/.test(contactType))
  const contact: CleanContact = {
    name: f.contactName || f.agencyName || 'Property Owner',
    phone,
    email: f.contactEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.contactEmail) ? f.contactEmail.toLowerCase() : null,
    agency: f.agencyName || null,
    isDealer,
  }

  // --- Media ----------------------------------------------------------------
  let images = [...(f.images ? splitList(f.images) : []), ...imageCols]
  images = Array.from(new Set(images))
  if (images.length > MAX_IMAGES) {
    warnings.push(`${images.length} photos given; only the first ${MAX_IMAGES} are used`)
    images = images.slice(0, MAX_IMAGES)
  }
  const minImages = minImagesFor(propertyType ?? undefined)

  // --- Extras ---------------------------------------------------------------
  const features = f.features ? JSON.stringify(splitList(f.features)) : null
  const nearbyPlaces = f.nearbyPlaces ? parseNearby(f.nearbyPlaces, warnings) : []

  if (errors.length) return { row: null, errors, warnings }

  // --- Generated copy when the sheet has none ------------------------------
  const sizeText = kanal && kanal >= 1 ? `${trim(kanal)} Kanal` : marla ? `${trim(marla)} Marla` : squareFeet ? `${squareFeet} Sq Ft` : ''
  const typeText = labelFor(propertyType!)
  const where = [f.subArea, f.area, city].filter(Boolean).join(', ')
  const purpose = listingType === 'FOR_RENT' ? 'for Rent' : 'for Sale'
  let title = f.title
  if (!title) {
    title = [sizeText, typeText, purpose, 'in', where].filter(Boolean).join(' ')
    warnings.push('title generated')
  }
  let description = f.description
  if (!description) {
    const facts = [
      sizeText && `${sizeText} ${typeText.toLowerCase()}`,
      !land && bedrooms ? `${bedrooms} bedrooms` : '',
      !land && bathrooms ? `${bathrooms} bathrooms` : '',
    ].filter(Boolean)
    description = `${facts.join(', ')} ${purpose.toLowerCase()} in ${where}.${
      f.nearbyLandmark ? ` Near ${f.nearbyLandmark}.` : ''
    } Contact ${contact.isDealer ? 'the dealer' : 'the owner'} for details and a visit.`
    warnings.push('description generated')
  }

  const forRent = listingType === 'FOR_RENT'
  const data: Record<string, unknown> = {
    title,
    description,
    address,
    city,
    province,
    area: f.area || null,
    subArea: f.subArea || null,
    zipCode: f.zipCode || null,
    price,
    bedrooms,
    bathrooms,
    squareFeet,
    marla,
    kanal,
    lotSize: parseNum(f.lotSize),
    yearBuilt: parseIntOrNull(f.yearBuilt),
    propertyType,
    listingType,
    features,
    videoUrl: f.videoUrl || null,
    virtualTourUrl: f.virtualTourUrl || null,
    maintenanceFees: parseNum(f.maintenanceFees),
    parkingSpaces: parseIntOrNull(f.parkingSpaces),
    garage: parseBool(f.garage) ?? false,
    pool: parseBool(f.pool) ?? false,
    possession: f.possession || null,
    furnishing: f.furnishing || null,
    facing: f.facing || null,
    cornerProperty: parseBool(f.cornerProperty) ?? false,
    pricePerMarla: marla ? price! / marla : null,
    pricePerSqft: squareFeet ? price! / squareFeet : null,

    documentType: f.documentType || null,
    approvalAuthority: f.approvalAuthority || null,
    nocAvailable: parseBool(f.nocAvailable),
    installmentsAvailable: parseBool(f.installmentsAvailable) ?? false,
    installmentMonths: parseIntOrNull(f.installmentMonths),
    downPayment: parseNum(f.downPayment) ?? (f.downPayment ? parsePrice(f.downPayment) : null),
    hasElectricity: parseBool(f.hasElectricity),
    backupPower: f.backupPower && parseBool(f.backupPower) === null ? f.backupPower : null,
    hasSuiGas: parseBool(f.hasSuiGas),
    waterSource: f.waterSource || null,
    advanceMonths: forRent ? parseIntOrNull(f.advanceMonths) : null,
    securityDeposit: forRent && f.securityDeposit ? parsePrice(f.securityDeposit) : null,
    rentIncrementPct: forRent ? parseNum(f.rentIncrementPct) : null,
    tenantPreference: forRent ? f.tenantPreference || null : null,
    floors: parseIntOrNull(f.floors),
    floorNumber: parseIntOrNull(f.floorNumber),
    hasLift: parseBool(f.hasLift),
    plotWidthFt: parseNum(f.plotWidthFt),
    plotLengthFt: parseNum(f.plotLengthFt),
    roadWidthFt: parseNum(f.roadWidthFt),
    kitchens: parseIntOrNull(f.kitchens),
    storeRooms: parseIntOrNull(f.storeRooms),
    drawingRoom: parseBool(f.drawingRoom) ?? false,
    tvLounge: parseBool(f.tvLounge) ?? false,
    servantQuarter: parseBool(f.servantQuarter) ?? false,
    nearbyLandmark: f.nearbyLandmark || null,
    nearbyPlaces,
  }

  return {
    row: {
      sourceId: f.sourceId || null,
      data,
      coords,
      pendingMapsLink,
      images,
      minImages,
      contact,
      listedDate: listedDate!,
    },
    errors,
    warnings,
  }
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function labelFor(t: PropertyType): string {
  return t
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}
