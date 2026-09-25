import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { limitsForRole, ACTIVE_STATUSES } from '@/lib/quota'


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, hasUpgradedToAgent: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Count active sell listings (not SOLD or OFF_MARKET)
    const activeSellListingsCount = await prisma.property.count({
      where: {
        ownerId: session.user.id,
        listingType: 'FOR_SALE',
        status: { in: [...ACTIVE_STATUSES] },
      },
    })

    // Count active rent listings
    const activeRentListingsCount = await prisma.property.count({
      where: {
        ownerId: session.user.id,
        listingType: 'FOR_RENT',
        status: { in: [...ACTIVE_STATUSES] },
      },
    })

    const quotaLimits = limitsForRole(user.role)
    const maxSellListings = quotaLimits.sell
    const maxRentListings = quotaLimits.rent
    const remainingSellSlots = Math.max(0, maxSellListings - activeSellListingsCount)
    const remainingRentSlots = Math.max(0, maxRentListings - activeRentListingsCount)

    return NextResponse.json({
      // Legacy fields for backward compatibility
      currentListings: activeSellListingsCount,
      maxListings: maxSellListings,
      remainingSlots: remainingSellSlots,
      canCreateListing: remainingSellSlots > 0,

      // New separate quota fields
      sell: {
        currentListings: activeSellListingsCount,
        maxListings: maxSellListings,
        remainingSlots: remainingSellSlots,
        canCreateListing: remainingSellSlots > 0,
      },
      rent: {
        currentListings: activeRentListingsCount,
        maxListings: maxRentListings,
        remainingSlots: remainingRentSlots,
        canCreateListing: remainingRentSlots > 0,
      },

      role: user.role,
      hasUpgradedToAgent: user.hasUpgradedToAgent,
    })
  } catch (error: any) {
    console.error('Listing quota error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

