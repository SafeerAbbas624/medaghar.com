import { NextRequest, NextResponse } from 'next/server'
import { trackPageView } from '@/lib/analytics'
import { getClientIp } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, sessionId, referrer, duration } = body

    if (!page || !sessionId) {
      return NextResponse.json(
        { error: 'Page and sessionId are required' },
        { status: 400 }
      )
    }

    // Track the page view
    await trackPageView({
      page,
      sessionId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      referrer,
      duration,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Track analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

