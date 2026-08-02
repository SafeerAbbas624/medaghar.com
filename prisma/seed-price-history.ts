import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding price history...')

  // Get all properties
  const properties = await prisma.property.findMany({
    where: {
      listingType: 'FOR_SALE', // Only add price history for sale properties
    },
    take: 15,
  })

  for (const property of properties) {
    // Generate realistic price history (3-6 months back)
    const monthsBack = Math.floor(Math.random() * 3) + 3 // 3-6 months
    const priceChanges = Math.floor(Math.random() * 2) + 1 // 1-2 price changes

    // Initial listing price (5-15% different from current)
    const initialPriceVariation = (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1)
    const initialPrice = Math.round(property.price * (1 - initialPriceVariation))

    // Create initial listing
    const listingDate = new Date()
    listingDate.setMonth(listingDate.getMonth() - monthsBack)

    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        price: initialPrice,
        eventType: 'Listed',
        eventDate: listingDate,
      },
    })

    console.log(`Created initial listing for: ${property.title} at ${initialPrice}`)

    // Create price changes
    let currentPrice = initialPrice
    for (let i = 0; i < priceChanges; i++) {
      const monthsAgo = monthsBack - Math.floor((monthsBack / (priceChanges + 1)) * (i + 1))
      const changeDate = new Date()
      changeDate.setMonth(changeDate.getMonth() - monthsAgo)

      // Price change (2-8% up or down)
      const priceChangePercent = (Math.random() * 0.06 + 0.02) * (Math.random() > 0.4 ? 1 : -1)
      currentPrice = Math.round(currentPrice * (1 + priceChangePercent))

      await prisma.priceHistory.create({
        data: {
          propertyId: property.id,
          price: currentPrice,
          eventType: 'Price Change',
          eventDate: changeDate,
        },
      })

      console.log(`Created price change for: ${property.title} to ${currentPrice}`)
    }

    // Update current price to match the final price in history
    await prisma.property.update({
      where: { id: property.id },
      data: { price: currentPrice },
    })
  }

  console.log('Price history seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

