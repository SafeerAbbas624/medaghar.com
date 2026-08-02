import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all unique cities from properties
    const cities = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        city: {
          not: '',
        },
      },
      select: {
        city: true,
      },
      distinct: ['city'],
      orderBy: {
        city: 'asc',
      },
    })

    // Extract city names and filter out empty strings
    const cityNames = cities
      .map(p => p.city)
      .filter(city => city && city.trim().length > 0)
      .sort()

    return NextResponse.json({ cities: cityNames })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}

