import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPermission } from '@/lib/admin-auth'
import { getTrafficAnalytics } from '@/lib/analytics'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await verifyAdminPermission(request, 'traffic_analytics', 'read')
    if (error) return error
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || '7d'
    const customStartDate = searchParams.get('startDate')
    const customEndDate = searchParams.get('endDate')

    let startDate: Date
    let endDate: Date = new Date()

    if (filter === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate)
      endDate = new Date(customEndDate)
    } else {
      const now = new Date()
      switch (filter) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }

    const analytics = await getTrafficAnalytics(startDate, endDate)

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: 'view_analytics',
      resource: 'traffic_analytics',
      details: { filter, startDate, endDate },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json(analytics)
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}