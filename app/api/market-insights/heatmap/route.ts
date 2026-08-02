import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CITY_COORDINATES } from '@/lib/constants/cities'

export async function GET() {
  try {
    // Get all active properties
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        city: true,
        price: true,
        latitude: true,
        longitude: true,
      },
    })

    // Group properties by city
    const cityData: { [key: string]: any } = {}

    properties.forEach(property => {
      if (!cityData[property.city]) {
        cityData[property.city] = {
          city: property.city,
          totalPrice: 0,
          count: 0,
          lat: property.latitude || CITY_COORDINATES[property.city]?.lat || 0,
          lng: property.longitude || CITY_COORDINATES[property.city]?.lng || 0,
        }
      }

      cityData[property.city].totalPrice += property.price
      cityData[property.city].count += 1
    })

    // Calculate heat map data
    const maxListings = Math.max(...Object.values(cityData).map((d: any) => d.count))
    const maxAvgPrice = Math.max(
      ...Object.values(cityData).map((d: any) => d.count > 0 ? d.totalPrice / d.count : 0)
    )

    const heatMapData = Object.values(cityData).map((data: any) => {
      const avgPrice = data.count > 0 ? data.totalPrice / data.count : 0
      
      // Calculate intensity based on both price and listings
      const priceIntensity = (avgPrice / maxAvgPrice) * 100
      const listingIntensity = (data.count / maxListings) * 100
      const intensity = Math.round((priceIntensity + listingIntensity) / 2)

      return {
        city: data.city,
        lat: data.lat,
        lng: data.lng,
        avgPrice: Math.round(avgPrice),
        totalListings: data.count,
        intensity: Math.min(100, intensity),
      }
    })

    // Filter out cities without coordinates
    const validHeatMapData = heatMapData.filter(d => d.lat !== 0 && d.lng !== 0)

    return NextResponse.json({
      heatMapData: validHeatMapData,
    })
  } catch (error) {
    console.error('Error fetching heat map data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heat map data' },
      { status: 500 }
    )
  }
}

