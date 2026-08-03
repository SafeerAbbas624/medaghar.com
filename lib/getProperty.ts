import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Shared include shape for the property detail view.
 *
 * Contact details (agent.phoneNumber, owner.phone/email) are deliberately NOT
 * selected: anything fetched here is serialised into the RSC payload and is
 * therefore readable in the page source by anyone, signed in or not. The
 * numbers are served on demand from /api/properties/[id]/contact instead.
 */
const detailInclude = {
  images: { orderBy: { order: 'asc' as const } },
  priceHistory: { orderBy: { eventDate: 'asc' as const } },
  agent: {
    select: {
      id: true,
      bio: true,
      specialties: true,
      yearsExperience: true,
      rating: true,
      reviewCount: true,
      officeAddress: true,
      website: true,
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    },
  },
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  },
}

/** Fetch a property by slug, then by id (backward compatibility). Cached per request. */
export const getPropertyBySlugOrId = cache(async (slugOrId: string) => {
  return (
    (await prisma.property.findUnique({ where: { slug: slugOrId }, include: detailInclude })) ??
    (await prisma.property.findUnique({ where: { id: slugOrId }, include: detailInclude }))
  )
})

export type PropertyDetail = NonNullable<Awaited<ReturnType<typeof getPropertyBySlugOrId>>>
