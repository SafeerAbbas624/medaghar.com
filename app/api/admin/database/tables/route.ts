import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all table names and counts
    const tables = [
      { name: 'User', count: await prisma.user.count() },
      { name: 'Property', count: await prisma.property.count() },
      { name: 'Agent', count: await prisma.agent.count() },
      { name: 'Review', count: await prisma.review.count() },
      { name: 'Message', count: await prisma.message.count() },
      { name: 'TourRequest', count: await prisma.tourRequest.count() },
      { name: 'SavedProperty', count: await prisma.savedProperty.count() },
      { name: 'ViewHistory', count: await prisma.viewHistory.count() },
      { name: 'PriceHistory', count: await prisma.priceHistory.count() },
      { name: 'AdminUser', count: await prisma.adminUser.count() },
      { name: 'AdminRole', count: await prisma.adminRole.count() },
      { name: 'AuditLog', count: await prisma.auditLog.count() },
      { name: 'PageView', count: await prisma.pageView.count() },
      { name: 'LoginHistory', count: await prisma.loginHistory.count() },
      { name: 'Contact', count: await prisma.contact.count() },
    ]

    return NextResponse.json({ tables })
  } catch (error: any) {
    console.error('Database tables API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

