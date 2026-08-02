import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Quota limits by role - separate for sell and rent
const QUOTA_LIMITS = {
  BUYER: { sell: 2, rent: 2 },
  SELLER: { sell: 2, rent: 2 },
  LANDLORD: { sell: 2, rent: 2 },
  TENANT: { sell: 2, rent: 2 },
  AGENT: { sell: 10, rent: 10 },
  ADMIN: { sell: 100, rent: 100 },
}

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
        status: {
          in: ['ACTIVE', 'PENDING', 'UNDER_CONTRACT'],
        },
      },
    })

    // Count active rent listings
    const activeRentListingsCount = await prisma.property.count({
      where: {
        ownerId: session.user.id,
        listingType: 'FOR_RENT',
        status: {
          in: ['ACTIVE', 'PENDING', 'UNDER_CONTRACT'],
        },
      },
    })

    const quotaLimits = QUOTA_LIMITS[user.role as keyof typeof QUOTA_LIMITS] || { sell: 2, rent: 2 }
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

