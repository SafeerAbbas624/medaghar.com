import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/** Shared include shape for the property detail view. */
const detailInclude = {
  images: { orderBy: { order: 'asc' as const } },
  priceHistory: { orderBy: { eventDate: 'asc' as const } },
  agent: { include: { user: true } },
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
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
