/**
 * Vocabulary for the Pakistan-specific listing fields.
 *
 * Kept in one place so the sell form, the edit form and the detail view all
 * offer and render the same options — and so a label change never leaves the
 * database holding a value nothing displays.
 */

export const DOCUMENT_TYPES = [
  'Registry',
  'Allotment Letter',
  'Fard / Intiqal',
  'File',
  'Power of Attorney',
  'Lease (99 years)',
  'Other',
] as const

export const APPROVAL_AUTHORITIES = [
  'LDA (Lahore)',
  'CDA (Islamabad)',
  'RDA (Rawalpindi)',
  'DHA',
  'MDA (Multan)',
  'KDA (Karachi)',
  'SBCA (Sindh)',
  'PDA (Peshawar)',
  'QDA (Quetta)',
  'FDA (Faisalabad)',
  'GDA (Gujranwala)',
  'Other authority',
  'Not approved',
] as const

export const BACKUP_POWER = [
  'None',
  'Generator',
  'UPS',
  'Solar',
  'Generator + Solar',
  'Solar + UPS',
] as const

export const WATER_SOURCES = [
  'Government Supply',
  'Boring',
  'Motor / Submersible',
  'Tanker',
  'Government Supply + Boring',
] as const

export const TENANT_PREFERENCES = ['Any', 'Family Only', 'Bachelors Allowed', 'Office Use'] as const

/** Types where plot dimensions and road width are the meaningful measurements. */
const LAND_TYPES = new Set([
  'RESIDENTIAL_PLOT',
  'COMMERCIAL_PLOT',
  'AGRICULTURAL_LAND',
  'INDUSTRIAL_LAND',
  'PLOT_FILE',
  'PLOT_FORM',
])

/** Types that sit on a floor of a larger building. */
const UNIT_TYPES = new Set([
  'FLAT',
  'PENTHOUSE',
  'OFFICE',
  'ROOM',
  'UPPER_PORTION',
  'LOWER_PORTION',
  'BASEMENT',
])

export function isLandType(type: string): boolean {
  return LAND_TYPES.has(type)
}

/** Whether to ask which floor the unit is on, and about a lift. */
export function asksFloorNumber(type: string): boolean {
  return UNIT_TYPES.has(type)
}

/** Whether to ask about internal rooms — meaningless for a bare plot. */
export function asksRoomCounts(type: string): boolean {
  return !LAND_TYPES.has(type)
}

/** Whether to ask about utilities — a plot file has no connections. */
export function asksUtilities(type: string): boolean {
  return type !== 'PLOT_FILE' && type !== 'PLOT_FORM'
}

/** Render "30 x 60 ft" from the stored dimensions, or null. */
export function plotDimensions(width?: number | null, length?: number | null): string | null {
  if (!width || !length) return null
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
  return `${fmt(width)} x ${fmt(length)} ft`
}

// ---------------------------------------------------------------------------
// Nearby amenities
//
// Walk Score, transit score and school ratings are US/Canada services with no
// Pakistani equivalent, so those columns were always null. What actually moves
// a property here is what a buyer can reach on foot: the masjid, the school,
// the commercial market, the main road. Pakistani listings on Zameen and
// Graana describe exactly these, usually as "walking distance".
// ---------------------------------------------------------------------------

export interface NearbyAmenityDef {
  /** Stored value. Never rename — it is persisted in the nearbyPlaces JSON. */
  key: string
  label: string
  /** react-icons name, resolved by the display component. */
  icon: string
}

export const NEARBY_AMENITIES: NearbyAmenityDef[] = [
  { key: 'masjid', label: 'Masjid', icon: 'mosque' },
  { key: 'school', label: 'School', icon: 'school' },
  { key: 'university', label: 'College / University', icon: 'university' },
  { key: 'hospital', label: 'Hospital / Clinic', icon: 'hospital' },
  { key: 'pharmacy', label: 'Pharmacy / Medical Store', icon: 'pharmacy' },
  { key: 'park', label: 'Park / Playground', icon: 'park' },
  { key: 'market', label: 'Commercial Market / Bazaar', icon: 'market' },
  { key: 'superstore', label: 'Superstore / Grocery', icon: 'cart' },
  { key: 'mall', label: 'Shopping Mall', icon: 'mall' },
  { key: 'restaurant', label: 'Restaurants / Food Street', icon: 'food' },
  { key: 'mainroad', label: 'Main Road / Boulevard', icon: 'road' },
  { key: 'transport', label: 'Metro / Bus Stop', icon: 'bus' },
  { key: 'bank', label: 'Bank / ATM', icon: 'bank' },
  { key: 'petrol', label: 'Petrol Pump / CNG', icon: 'fuel' },
  { key: 'gym', label: 'Gym / Sports Complex', icon: 'gym' },
  { key: 'community', label: 'Community Centre / Club', icon: 'community' },
]

/** How Pakistani listings actually express proximity. */
export const DISTANCE_BANDS = [
  'Walking distance',
  'Under 5 min drive',
  '5-10 min drive',
  '10-20 min drive',
] as const

export type DistanceBand = (typeof DISTANCE_BANDS)[number]

export interface NearbyPlace {
  type: string
  distance: string
  /** Optional specific name, e.g. "Jamia Masjid Al-Noor". */
  name?: string
}

const AMENITY_BY_KEY = new Map(NEARBY_AMENITIES.map((a) => [a.key, a]))

export function amenityLabel(key: string): string {
  return AMENITY_BY_KEY.get(key)?.label ?? key
}

export function amenityIcon(key: string): string {
  return AMENITY_BY_KEY.get(key)?.icon ?? 'pin'
}

/**
 * Read the stored nearbyPlaces JSON.
 *
 * Tolerates the older shapes still in the database — a bare array of strings,
 * or objects keyed on `name` rather than `type` — so an old listing renders
 * rather than throwing.
 */
export function parseNearbyPlaces(raw: string | null | undefined): NearbyPlace[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry): NearbyPlace | null => {
        if (typeof entry === 'string') return { type: entry, distance: '' }
        if (entry && typeof entry === 'object') {
          const type = entry.type ?? entry.key ?? entry.name
          if (!type) return null
          return {
            type: String(type),
            distance: String(entry.distance ?? ''),
            name: entry.name && entry.name !== type ? String(entry.name) : undefined,
          }
        }
        return null
      })
      .filter((p): p is NearbyPlace => p !== null)
  } catch {
    // Very old rows stored a comma-separated string.
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((type) => ({ type, distance: '' }))
  }
}

/** Serialise for storage, dropping anything not in the vocabulary. */
export function serialiseNearbyPlaces(places: NearbyPlace[]): string | null {
  const clean = places.filter((p) => AMENITY_BY_KEY.has(p.type))
  return clean.length ? JSON.stringify(clean) : null
}

/**
 * Map a request body onto the Pakistan-specific columns.
 *
 * Shared by the create and edit endpoints so the two cannot drift — an edit
 * that silently dropped half these fields would be worse than never having
 * collected them.
 */
export function pakistanFieldsFrom(body: Record<string, unknown>) {
  const num = (v: unknown) => {
    if (v === undefined || v === null || v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const int = (v: unknown) => {
    const n = num(v)
    return n === null ? null : Math.round(n)
  }
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const bool = (v: unknown) => (typeof v === 'boolean' ? v : null)

  return {
    documentType: str(body.documentType),
    approvalAuthority: str(body.approvalAuthority),
    nocAvailable: bool(body.nocAvailable),
    installmentsAvailable: body.installmentsAvailable === true,
    installmentMonths: int(body.installmentMonths),
    downPayment: num(body.downPayment),

    hasElectricity: bool(body.hasElectricity),
    backupPower: str(body.backupPower),
    hasSuiGas: bool(body.hasSuiGas),
    waterSource: str(body.waterSource),

    // Rental terms only mean anything on a letting.
    advanceMonths: body.listingType === 'FOR_RENT' ? int(body.advanceMonths) : null,
    securityDeposit: body.listingType === 'FOR_RENT' ? num(body.securityDeposit) : null,
    rentIncrementPct: body.listingType === 'FOR_RENT' ? num(body.rentIncrementPct) : null,
    tenantPreference: body.listingType === 'FOR_RENT' ? str(body.tenantPreference) : null,

    floors: int(body.floors),
    floorNumber: int(body.floorNumber),
    hasLift: bool(body.hasLift),
    plotWidthFt: num(body.plotWidthFt),
    plotLengthFt: num(body.plotLengthFt),
    roadWidthFt: num(body.roadWidthFt),
    kitchens: int(body.kitchens),
    storeRooms: int(body.storeRooms),
    drawingRoom: body.drawingRoom === true,
    tvLounge: body.tvLounge === true,
    servantQuarter: body.servantQuarter === true,

    nearbyLandmark: str(body.nearbyLandmark),
    nearbyPlaces: Array.isArray(body.nearbyPlaces)
      ? serialiseNearbyPlaces(body.nearbyPlaces as NearbyPlace[])
      : null,
  }
}
