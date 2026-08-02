import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventName, eventData, sessionId, path } = body

    if (!eventName || !sessionId) {
      return NextResponse.json(
        { error: 'Event name and sessionId are required' },
        { status: 400 }
      )
    }

    // Store custom event (you can create a CustomEvent model if needed)
    // For now, we'll just log it
    console.log('Custom event tracked:', {
      eventName,
      eventData,
      sessionId,
      path,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics event error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

