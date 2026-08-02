import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminPermission } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const { session, error } = await verifyAdminPermission(request, 'database_management', 'read')
  if (error) return error
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const search = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || 'all' // all | featured | verified | unverified
  const pageSize = 20

  const where = {
    ...(search
      ? {
          OR: [
            { address: { contains: search } },
            { city: { contains: search } },
            { title: { contains: search } },
          ],
        }
      : {}),
    ...(filter === 'featured' ? { isFeatured: true } : {}),
    ...(filter === 'verified' ? { isVerified: true } : {}),
    ...(filter === 'unverified' ? { isVerified: false } : {}),
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        price: true,
        listingType: true,
        status: true,
        isFeatured: true,
        isVerified: true,
        createdAt: true,
        owner: { select: { firstName: true, lastName: true, email: true } },
        agent: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ])

  return NextResponse.json({
    properties,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  })
}
