import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // ACTIVE, SOLD, PENDING, etc.
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const whereClause: any = {
      ownerId: session.user.id
    }

    if (status) {
      whereClause.status = status
    }

    // Get total count
    const total = await prisma.property.count({ where: whereClause })

    // Get properties
    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        images: {
          take: 1,
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            savedBy: true,
            reviews: true,
            viewHistory: true,
            messages: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Calculate statistics
    const stats = await prisma.property.aggregate({
      where: { ownerId: session.user.id },
      _count: { id: true },
      _sum: { views: true }
    })

    const activeCount = await prisma.property.count({
      where: { ownerId: session.user.id, status: 'ACTIVE' }
    })

    const soldCount = await prisma.property.count({
      where: { ownerId: session.user.id, status: 'SOLD' }
    })

    const pendingCount = await prisma.property.count({
      where: { ownerId: session.user.id, status: 'PENDING' }
    })

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        totalListings: stats._count.id || 0,
        totalViews: stats._sum.views || 0,
        activeListings: activeCount,
        soldListings: soldCount,
        pendingListings: pendingCount
      }
    })
  } catch (error: any) {
    console.error('Get user properties error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

