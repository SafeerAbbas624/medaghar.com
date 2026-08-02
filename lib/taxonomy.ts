/**
 * The URL vocabulary for the purpose-first SEO tree.
 *
 *   /{purpose}/{type}/{city}[/{area}[/{subarea}]]
 *   e.g. /for-sale/house/lahore/dha-defence/phase-6
 *
 * This is the single source of truth for which PropertyType values are
 * reachable by URL and at what depth. Changing a slug here after launch
 * costs a permanent redirect on every URL containing it — get it right first.
 */

import type { PropertyType, ListingType } from '@prisma/client'

export type Purpose = 'for-sale' | 'for-rent' | 'owner'
export type Category = 'residential' | 'commercial'

/**
 * How deep a type may go in the URL tree.
 *  - 'A' → type / city / area / subarea   (high search volume)
 *  - 'B' → type / city only               (lower volume; area depth would
 *                                          manufacture thousands of empty pages)
 *  - 'C' → no URL of its own; filter chip only
 */
export type Tier = 'A' | 'B' | 'C'

export interface TypeDef {
  /** URL segment. */
  slug: string
  /** Singular display label, e.g. "House". */
  label: string
  /** Plural label used in headings/titles, e.g. "Houses". */
  pluralLabel: string
  /** PropertyType enum values this slug covers — may be more than one. */
  types: PropertyType[]
  category: Category
  tier: Tier
}

/**
 * Tier A — full depth. These carry the bulk of Pakistani property search volume.
 *
 * Note `plot` deliberately maps to three enum values: a plot file and a plot
 * form are the same buyer intent as a residential plot, and splitting them
 * would create three thin pages where one strong one belongs.
 */
const TIER_A: TypeDef[] = [
  { slug: 'house',           label: 'House',           pluralLabel: 'Houses',           types: ['HOUSE'],                                        category: 'residential', tier: 'A' },
  { slug: 'flat',            label: 'Flat',            pluralLabel: 'Flats',            types: ['FLAT'],                                         category: 'residential', tier: 'A' },
  { slug: 'plot',            label: 'Plot',            pluralLabel: 'Plots',            types: ['RESIDENTIAL_PLOT', 'PLOT_FILE', 'PLOT_FORM'],   category: 'residential', tier: 'A' },
  { slug: 'upper-portion',   label: 'Upper Portion',   pluralLabel: 'Upper Portions',   types: ['UPPER_PORTION'],                                category: 'residential', tier: 'A' },
  { slug: 'lower-portion',   label: 'Lower Portion',   pluralLabel: 'Lower Portions',   types: ['LOWER_PORTION'],                                category: 'residential', tier: 'A' },
  { slug: 'commercial-plot', label: 'Commercial Plot', pluralLabel: 'Commercial Plots', types: ['COMMERCIAL_PLOT'],                              category: 'commercial',  tier: 'A' },
  { slug: 'office',          label: 'Office',          pluralLabel: 'Offices',          types: ['OFFICE'],                                       category: 'commercial',  tier: 'A' },
  { slug: 'shop',            label: 'Shop',            pluralLabel: 'Shops',            types: ['SHOP'],                                         category: 'commercial',  tier: 'A' },
]

/** Tier B — type + city only. */
const TIER_B: TypeDef[] = [
  { slug: 'farm-house',        label: 'Farm House',        pluralLabel: 'Farm Houses',        types: ['FARM_HOUSE'],        category: 'residential', tier: 'B' },
  { slug: 'penthouse',         label: 'Penthouse',         pluralLabel: 'Penthouses',         types: ['PENTHOUSE'],         category: 'residential', tier: 'B' },
  { slug: 'room',              label: 'Room',              pluralLabel: 'Rooms',              types: ['ROOM'],              category: 'residential', tier: 'B' },
  { slug: 'guest-house',       label: 'Guest House',       pluralLabel: 'Guest Houses',       types: ['GUEST_HOUSE'],       category: 'residential', tier: 'B' },
  { slug: 'hostel',            label: 'Hostel',            pluralLabel: 'Hostels',            types: ['HOSTEL'],            category: 'residential', tier: 'B' },
  { slug: 'basement',          label: 'Basement',          pluralLabel: 'Basements',          types: ['BASEMENT'],          category: 'commercial',  tier: 'B' },
  { slug: 'warehouse',         label: 'Warehouse',         pluralLabel: 'Warehouses',         types: ['WAREHOUSE'],         category: 'commercial',  tier: 'B' },
  { slug: 'factory',           label: 'Factory',           pluralLabel: 'Factories',          types: ['FACTORY'],           category: 'commercial',  tier: 'B' },
  { slug: 'building',          label: 'Building',          pluralLabel: 'Buildings',          types: ['BUILDING'],          category: 'commercial',  tier: 'B' },
  { slug: 'agricultural-land', label: 'Agricultural Land', pluralLabel: 'Agricultural Land',  types: ['AGRICULTURAL_LAND'], category: 'residential', tier: 'B' },
  { slug: 'industrial-land',   label: 'Industrial Land',   pluralLabel: 'Industrial Land',    types: ['INDUSTRIAL_LAND'],   category: 'commercial',  tier: 'B' },
]

/**
 * The head term: "property for sale in Lahore". Covers every URL-reachable
 * type, so it is the natural parent of the whole tree for a given location.
 */
export const ALL_TYPES_SLUG = 'property'

const ALL_TYPES: TypeDef = {
  slug: ALL_TYPES_SLUG,
  label: 'Property',
  pluralLabel: 'Properties',
  types: [...TIER_A, ...TIER_B].flatMap((t) => t.types),
  category: 'residential', // nominal; the head term spans both
  tier: 'A',
}

/** Types with no URL of their own — reachable only as a filter. */
export const TIER_C_TYPES: PropertyType[] = ['HOTEL_SUITES', 'BEACH_HUT', 'OTHER']

export const TYPE_DEFS: TypeDef[] = [ALL_TYPES, ...TIER_A, ...TIER_B]

const BY_SLUG = new Map(TYPE_DEFS.map((t) => [t.slug, t]))

/** Old or pluralised spellings that should 301 to the canonical slug. */
export const TYPE_ALIASES: Record<string, string> = {
  apartment: 'flat',
  apartments: 'flat',
  flats: 'flat',
  home: 'house',
  homes: 'house',
  houses: 'house',
  plots: 'plot',
  'residential-plot': 'plot',
  'commercial-plots': 'commercial-plot',
  shops: 'shop',
  offices: 'office',
  properties: ALL_TYPES_SLUG,
}

/** Resolve a URL segment to its type definition. Returns null if unknown. */
export function getTypeDef(slug: string): TypeDef | null {
  return BY_SLUG.get(slug.toLowerCase()) ?? null
}

/** The canonical slug for an alias, or null when the input is already canonical/unknown. */
export function resolveTypeAlias(slug: string): string | null {
  return TYPE_ALIASES[slug.toLowerCase()] ?? null
}

/** The URL slug that best represents a stored PropertyType (for breadcrumbs). */
export function typeSlugForEnum(type: PropertyType): string | null {
  for (const def of [...TIER_A, ...TIER_B]) {
    if (def.types.includes(type)) return def.slug
  }
  return null // Tier C
}

/** Does this type slug support /{area} and /{subarea} depth? */
export function supportsAreaDepth(def: TypeDef): boolean {
  return def.tier === 'A'
}

export const PURPOSES: Purpose[] = ['for-sale', 'for-rent', 'owner']

/** The ListingType a purpose filters on. `owner` spans both, filtered by isFSBO. */
export function listingTypeForPurpose(purpose: Purpose): ListingType | null {
  if (purpose === 'for-sale') return 'FOR_SALE'
  if (purpose === 'for-rent') return 'FOR_RENT'
  return null
}

/** Human label for a purpose, used in titles: "Houses for Sale in Lahore". */
export const PURPOSE_LABEL: Record<Purpose, string> = {
  'for-sale': 'for Sale',
  'for-rent': 'for Rent',
  owner: 'for Sale by Owner',
}

export interface HubDef {
  path: string
  title: string
  category: Category
  listingType: ListingType
}

/** The four indexable category hubs — the only hub-level pages. */
export const HUBS: HubDef[] = [
  { path: '/residential-for-sale', title: 'Residential Property for Sale in Pakistan', category: 'residential', listingType: 'FOR_SALE' },
  { path: '/residential-for-rent', title: 'Residential Property for Rent in Pakistan', category: 'residential', listingType: 'FOR_RENT' },
  { path: '/commercial-for-sale',  title: 'Commercial Property for Sale in Pakistan',  category: 'commercial',  listingType: 'FOR_SALE' },
  { path: '/commercial-for-rent',  title: 'Commercial Property for Rent in Pakistan',  category: 'commercial',  listingType: 'FOR_RENT' },
]

/** The hub a tree page belongs under — used for the breadcrumb parent. */
export function hubFor(category: Category, purpose: Purpose): HubDef {
  const listingType: ListingType = purpose === 'for-rent' ? 'FOR_RENT' : 'FOR_SALE'
  return (
    HUBS.find((h) => h.category === category && h.listingType === listingType) ?? HUBS[0]
  )
}

/** Type slugs offered under a given category, for link grids. */
export function typesForCategory(category: Category): TypeDef[] {
  return [...TIER_A, ...TIER_B].filter((t) => t.category === category)
}
