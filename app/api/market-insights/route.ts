import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city') || 'All Cities'
    const propertyType = searchParams.get('propertyType') || 'All Types'

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    }

    if (city !== 'All Cities') {
      where.city = city
    }

    if (propertyType !== 'All Types') {
      where.propertyType = propertyType.toUpperCase().replace(' ', '_')
    }

    // Get all properties matching criteria
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        city: true,
        price: true,
        marla: true,
        propertyType: true,
        createdAt: true,
      },
    })

    // Calculate city-wise market data
    const cityData: { [key: string]: any } = {}

    properties.forEach(property => {
      if (!cityData[property.city]) {
        cityData[property.city] = {
          city: property.city,
          totalPrice: 0,
          totalPricePerMarla: 0,
          count: 0,
          marlaCount: 0,
        }
      }

      cityData[property.city].totalPrice += property.price
      cityData[property.city].count += 1

      if (property.marla && property.marla > 0) {
        cityData[property.city].totalPricePerMarla += property.price / property.marla
        cityData[property.city].marlaCount += 1
      }
    })

    // Format market data
    const marketData = Object.values(cityData).map((data: any) => {
      const avgPrice = data.count > 0 ? data.totalPrice / data.count : 0
      const avgPricePerMarla = data.marlaCount > 0 ? data.totalPricePerMarla / data.marlaCount : 0
      
      // Simulate price change (in real app, this would come from historical data)
      const priceChange = (Math.random() * 20) - 5 // Random between -5% and +15%
      
      // Determine market hotness based on listings count and price
      let hotness: 'Hot' | 'Moderate' | 'Cool' = 'Moderate'
      if (data.count > 15 && avgPrice > 50000000) {
        hotness = 'Hot'
      } else if (data.count < 5 || avgPrice < 10000000) {
        hotness = 'Cool'
      }

      // Demand level (0-100)
      const demandLevel = Math.min(100, (data.count / 30) * 100)

      return {
        city: data.city,
        avgPrice: Math.round(avgPrice),
        priceChange: parseFloat(priceChange.toFixed(2)),
        totalListings: data.count,
        avgPricePerMarla: Math.round(avgPricePerMarla),
        hotness,
        demandLevel: Math.round(demandLevel),
      }
    })

    // Sort by total listings descending
    marketData.sort((a, b) => b.totalListings - a.totalListings)

    // Generate price trends for last 12 months
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    const currentMonth = new Date().getMonth()
    const priceTrends = []
    
    // Calculate average price across all properties
    const totalAvgPrice = properties.length > 0 
      ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length 
      : 0

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const month = months[monthIndex]
      
      // Simulate historical prices (in real app, this would come from historical data)
      // Prices gradually increase over time with some variation
      const variation = (Math.random() * 0.1) - 0.05 // ±5% variation
      const growthFactor = 1 + (i * 0.01) // 1% growth per month
      const avgPrice = totalAvgPrice * growthFactor * (1 + variation)
      
      // Simulate listing count variation
      const listingVariation = Math.floor(Math.random() * 20) - 10
      const listings = Math.max(1, properties.length + listingVariation)

      priceTrends.push({
        month,
        avgPrice: Math.round(avgPrice),
        listings,
      })
    }

    return NextResponse.json({
      marketData,
      priceTrends,
    })
  } catch (error) {
    console.error('Error fetching market insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market insights' },
      { status: 500 }
    )
  }
}

