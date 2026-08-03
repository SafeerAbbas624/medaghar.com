import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp, getRateLimiters } from '@/lib/rate-limiter'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Returns the agent's or owner's phone number for a listing — signed-in
 * callers only.
 *
 * Numbers are served here rather than rendered into the page so they never
 * appear in the HTML or RSC payload for anonymous visitors, which is what
 * scrapers read. Rate limited so an authenticated account cannot be used to
 * harvest the whole database.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Sign in to view contact details' },
        { status: 401 }
      )
    }

    const { apiRateLimiter } = getRateLimiters()
    const rl = await checkRateLimit(apiRateLimiter, `contact:${session.user.id}`)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
      )
    }

    const { id } = await params
    const party = request.nextUrl.searchParams.get('party') === 'owner' ? 'owner' : 'agent'

    const property = await prisma.property.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: {
        id: true,
        agent: { select: { phoneNumber: true } },
        owner: { select: { phone: true } },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const phone =
      party === 'owner' ? property.owner?.phone ?? null : property.agent?.phoneNumber ?? null

    if (!phone) {
      return NextResponse.json(
        { error: 'No phone number on file — use the message button instead' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { phone },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    console.error('Contact reveal error:', error)
    return NextResponse.json({ error: 'Could not load contact details' }, { status: 500 })
  }
}
