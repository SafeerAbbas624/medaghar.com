import type { ListingType } from '@prisma/client'

/**
 * Listing allowance per role.
 *
 * Sale and rent are counted separately: a personal account may hold 2 active
 * sale listings *and* 2 active rentals at the same time, not 2 in total.
 *
 * This lives in one place because the allowance is quoted in three others —
 * the sell form, the quota endpoint and the /owner page copy — and they had
 * already drifted apart once, with the form offering rent slots that the
 * create endpoint then refused.
 */

export interface QuotaLimit {
  sell: number
  rent: number
}

const LIMITS: Record<string, QuotaLimit> = {
  BUYER: { sell: 2, rent: 2 },
  SELLER: { sell: 2, rent: 2 },
  LANDLORD: { sell: 2, rent: 2 },
  TENANT: { sell: 2, rent: 2 },
  AGENT: { sell: 10, rent: 10 },
  ADMIN: { sell: 100, rent: 100 },
}

const DEFAULT_LIMIT: QuotaLimit = { sell: 2, rent: 2 }

/** Statuses that occupy a slot. A sold or withdrawn listing frees one. */
export const ACTIVE_STATUSES = ['ACTIVE', 'PENDING', 'UNDER_CONTRACT'] as const

export function limitsForRole(role: string | undefined | null): QuotaLimit {
  if (!role) return DEFAULT_LIMIT
  return LIMITS[role] ?? DEFAULT_LIMIT
}

/** The allowance that applies to the listing type being created. */
export function limitFor(role: string | undefined | null, listingType: ListingType | string): number {
  const limits = limitsForRole(role)
  return listingType === 'FOR_RENT' ? limits.rent : limits.sell
}
