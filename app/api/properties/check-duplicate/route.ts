import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  normalizeAddress, 
  calculateAddressHash, 
  areAddressesDuplicates 
} from '@/lib/addressNormalization'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { address, city, area, excludePropertyId } = body

    if (!address || !city) {
      return NextResponse.json(
        { error: 'Address and city are required' },
        { status: 400 }
      )
    }

    // Normalize and hash the address
    const normalized = normalizeAddress(address, city, area)
    const hash = calculateAddressHash(normalized)

    // First, try exact hash match (fastest)
    const exactMatch = await prisma.property.findFirst({
      where: {
        addressHash: hash,
        id: excludePropertyId ? { not: excludePropertyId } : undefined,
        status: { not: 'SOLD' } // Only check active listings
      },
      select: {
        id: true,
        address: true,
        city: true,
        area: true,
        title: true,
        price: true
      }
    })

    if (exactMatch) {
      return NextResponse.json({
        isDuplicate: true,
        matchType: 'exact',
        existingProperty: exactMatch,
        message: 'A property at this exact address already exists'
      })
    }

    // If no exact match, check for fuzzy matches in the same city
    const sameCity = await prisma.property.findMany({
      where: {
        city: { equals: city, mode: 'insensitive' },
        id: excludePropertyId ? { not: excludePropertyId } : undefined,
        status: { not: 'SOLD' }
      },
      select: {
        id: true,
        address: true,
        city: true,
        area: true,
        title: true,
        price: true
      },
      take: 100 // Limit for performance
    })

    // Check each property for similarity
    for (const property of sameCity) {
      const isSimilar = areAddressesDuplicates(
        { address, city, area },
        { address: property.address, city: property.city, area: property.area },
        85 // 85% similarity threshold
      )

      if (isSimilar) {
        return NextResponse.json({
          isDuplicate: true,
          matchType: 'similar',
          existingProperty: property,
          message: 'A similar property address already exists'
        })
      }
    }

    // No duplicates found
    return NextResponse.json({
      isDuplicate: false,
      matchType: null,
      existingProperty: null,
      normalizedAddress: normalized,
      addressHash: hash
    })
  } catch (error: any) {
    console.error('Duplicate check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check for duplicates' },
      { status: 500 }
    )
  }
}

