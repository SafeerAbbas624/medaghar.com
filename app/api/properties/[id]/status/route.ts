import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['ACTIVE', 'PENDING', 'SOLD', 'OFF_MARKET', 'UNDER_CONTRACT']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Get the property
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        agentId: true,
        status: true,
        title: true,
        price: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check authorization - must be owner or admin
    const isOwner = property.ownerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    // Also check if user is the agent
    let isAgent = false
    if (property.agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: property.agentId },
        select: { userId: true }
      })
      isAgent = agent?.userId === session.user.id
    }

    if (!isOwner && !isAdmin && !isAgent) {
      return NextResponse.json(
        { error: 'You do not have permission to update this property' },
        { status: 403 }
      )
    }

    // Update the property status
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    })

    // If marking as SOLD, add to price history
    if (status === 'SOLD') {
      await prisma.priceHistory.create({
        data: {
          propertyId: id,
          price: property.price,
          eventType: 'Sold',
          eventDate: new Date()
        }
      })
    }

    return NextResponse.json({
      property: updatedProperty,
      message: `Property status updated to ${status}`
    })
  } catch (error: any) {
    console.error('Update property status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update property status' },
      { status: 500 }
    )
  }
}

// GET endpoint to get current status
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        title: true,
        updatedAt: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ property })
  } catch (error: any) {
    console.error('Get property status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get property status' },
      { status: 500 }
    )
  }
}

