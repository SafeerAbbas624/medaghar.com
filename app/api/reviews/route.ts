import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      propertyId,
      agentId,
      rating,
      title,
      comment,
      pros,
      cons,
      wouldRecommend,
    } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      )
    }

    if (!propertyId && !agentId) {
      return NextResponse.json(
        { error: 'Either propertyId or agentId is required' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this property/agent
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        ...(propertyId ? { propertyId } : {}),
        ...(agentId ? { agentId } : {}),
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this ' + (propertyId ? 'property' : 'agent') },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        propertyId: propertyId || null,
        agentId: agentId || null,
        rating,
        title: title || null,
        comment,
        pros: pros || null,
        cons: cons || null,
        wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('propertyId')
    const agentId = searchParams.get('agentId')
    const userId = searchParams.get('userId')

    const where: any = {}

    if (propertyId) {
      where.propertyId = propertyId
    }

    if (agentId) {
      where.agentId = agentId
    }

    if (userId) {
      where.userId = userId
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        property: propertyId ? {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
          },
        } : undefined,
        agent: agentId ? {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        } : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

