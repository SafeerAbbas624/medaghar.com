import type { PropertyType } from '@prisma/client'

/**
 * Minimum photo counts per property category.
 *
 * A bare plot genuinely has little to photograph — demanding five shots of an
 * empty piece of ground would only push sellers to pad with duplicates. A
 * house or a flat, by contrast, is not a serious listing without the rooms,
 * so the floor is higher there.
 *
 * Enforced in both the sell form and the API: the form gives the seller a
 * useful message, the API stops anything that bypasses it.
 */

export const MAX_IMAGES = 7

const MINIMUMS: Partial<Record<PropertyType, number>> = {
  // Built residential — buyers expect to see inside.
  HOUSE: 5,
  FLAT: 4,
  UPPER_PORTION: 4,
  LOWER_PORTION: 4,
  FARM_HOUSE: 5,
  PENTHOUSE: 5,
  ROOM: 2,
  GUEST_HOUSE: 4,
  HOSTEL: 3,
  BASEMENT: 2,

  // Land — the plot, the approach road, and the surroundings.
  RESIDENTIAL_PLOT: 2,
  COMMERCIAL_PLOT: 2,
  AGRICULTURAL_LAND: 2,
  INDUSTRIAL_LAND: 2,
  PLOT_FILE: 1,
  PLOT_FORM: 1,

  // Commercial — frontage plus the interior.
  SHOP: 3,
  OFFICE: 4,
  WAREHOUSE: 3,
  FACTORY: 4,
  BUILDING: 4,
}

const DEFAULT_MIN = 3

/** Minimum number of photos required for a property of this type. */
export function minImagesFor(type: PropertyType | string | undefined): number {
  if (!type) return DEFAULT_MIN
  return MINIMUMS[type as PropertyType] ?? DEFAULT_MIN
}

/**
 * What to show a seller who has not uploaded enough photos yet.
 * Returns null once the minimum is met.
 */
export function imageCountError(
  type: PropertyType | string | undefined,
  count: number
): string | null {
  const min = minImagesFor(type)
  if (count >= min) return null
  const short = min - count
  return `Please upload at least ${min} photos for this property type — ${short} more ${
    short === 1 ? 'is' : 'are'
  } needed. Listings with more photos get significantly more enquiries.`
}

/** Guidance on what the photos should show, by category. */
export function photoHint(type: PropertyType | string | undefined): string {
  switch (type) {
    case 'RESIDENTIAL_PLOT':
    case 'COMMERCIAL_PLOT':
    case 'AGRICULTURAL_LAND':
    case 'INDUSTRIAL_LAND':
      return 'Show the plot itself, the approach road, and the surrounding development.'
    case 'PLOT_FILE':
    case 'PLOT_FORM':
      return 'A photo of the file or form, with the number and personal details covered.'
    case 'SHOP':
      return 'Show the frontage from the road, the inside, and the surrounding market.'
    case 'OFFICE':
    case 'WAREHOUSE':
    case 'FACTORY':
    case 'BUILDING':
      return 'Show the entrance, the interior space, and the parking or loading area.'
    default:
      return 'Show the front elevation, drawing room, bedrooms, kitchen, bathrooms and any outdoor space.'
  }
}
