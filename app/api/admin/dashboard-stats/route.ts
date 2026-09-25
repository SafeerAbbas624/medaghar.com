import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'
import { getTrafficAnalytics } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || '7d'
    const now = new Date()
    let startDate: Date
    switch (filter) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    const [
      analytics,
      propertiesTotal,
      propertiesFeatured,
      propertiesPending,
      propertiesUnverified,
      usersTotal,
      agentsTotal,
      contactsOpen,
      contactsRecent,
      pendingListings,
    ] = await Promise.all([
      getTrafficAnalytics(startDate, now),
      prisma.property.count(),
      prisma.property.count({ where: { isFeatured: true } }),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.property.count({ where: { isVerified: false } }),
      prisma.user.count(),
      prisma.agent.count(),
      prisma.contact.count({ where: { isRead: false } }),
      prisma.contact.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          createdAt: true,
        },
      }),
      prisma.property.findMany({
        where: {
          OR: [{ status: 'PENDING' }, { isVerified: false }],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          city: true,
          status: true,
          isVerified: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({
      filter,
      analytics: {
        totalViews: analytics.totalViews,
        uniqueVisitors: analytics.uniqueVisitors,
        avgDuration: analytics.avgDuration,
        pageViews: analytics.pageViews
          .slice()
          .sort((a, b) => b.views - a.views)
          .slice(0, 8),
      },
      counts: {
        propertiesTotal,
        propertiesFeatured,
        propertiesPending,
        propertiesUnverified,
        usersTotal,
        agentsTotal,
        contactsOpen,
      },
      queues: {
        contacts: contactsRecent,
        moderation: pendingListings,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
