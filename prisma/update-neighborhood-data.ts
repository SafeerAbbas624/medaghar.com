import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating neighborhood data...')

  // Get all properties
  const properties = await prisma.property.findMany({
    take: 10,
  })

  for (const property of properties) {
    // Generate realistic neighborhood data based on location
    const updates: any = {}

    // Walk Score (higher in urban areas)
    if (property.city === 'Karachi' || property.city === 'Lahore' || property.city === 'Islamabad') {
      updates.walkScore = Math.floor(Math.random() * 30) + 60 // 60-90
    } else {
      updates.walkScore = Math.floor(Math.random() * 40) + 40 // 40-80
    }

    // Transit Score (higher in major cities)
    if (property.city === 'Karachi' || property.city === 'Lahore') {
      updates.transitScore = Math.floor(Math.random() * 30) + 60 // 60-90
    } else if (property.city === 'Islamabad') {
      updates.transitScore = Math.floor(Math.random() * 20) + 50 // 50-70
    } else {
      updates.transitScore = Math.floor(Math.random() * 30) + 30 // 30-60
    }

    // Crime Score (mostly low in good areas)
    const crimeRand = Math.random()
    if (property.area?.includes('DHA') || property.area?.includes('Bahria') || property.area?.includes('Gulberg')) {
      updates.crimeScore = 'Low'
    } else if (crimeRand > 0.7) {
      updates.crimeScore = 'Medium'
    } else {
      updates.crimeScore = 'Low'
    }

    // School Rating
    updates.schoolRating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)) // 3.5-5.0

    // Nearby Places with proper structure
    const nearbyPlaces = []

    // Add schools
    if (property.city === 'Lahore') {
      nearbyPlaces.push({
        name: 'Beaconhouse School System',
        distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
        type: 'School',
      })
    } else if (property.city === 'Karachi') {
      nearbyPlaces.push({
        name: 'Karachi Grammar School',
        distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
        type: 'School',
      })
    } else if (property.city === 'Islamabad') {
      nearbyPlaces.push({
        name: 'Roots Millennium School',
        distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
        type: 'School',
      })
    }

    // Add hospitals
    if (property.city === 'Lahore') {
      nearbyPlaces.push({
        name: 'Shaukat Khanum Hospital',
        distance: `${(Math.random() * 3 + 1).toFixed(1)} km`,
        type: 'Hospital',
      })
    } else if (property.city === 'Karachi') {
      nearbyPlaces.push({
        name: 'Aga Khan University Hospital',
        distance: `${(Math.random() * 3 + 1).toFixed(1)} km`,
        type: 'Hospital',
      })
    } else if (property.city === 'Islamabad') {
      nearbyPlaces.push({
        name: 'PIMS Hospital',
        distance: `${(Math.random() * 3 + 1).toFixed(1)} km`,
        type: 'Hospital',
      })
    }

    // Add shopping
    if (property.city === 'Lahore') {
      nearbyPlaces.push({
        name: 'Packages Mall',
        distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
        type: 'Shopping',
      })
    } else if (property.city === 'Karachi') {
      nearbyPlaces.push({
        name: 'Dolmen Mall',
        distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
        type: 'Shopping',
      })
    } else if (property.city === 'Islamabad') {
      nearbyPlaces.push({
        name: 'Centaurus Mall',
        distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
        type: 'Shopping',
      })
    }

    // Add mosque
    nearbyPlaces.push({
      name: 'Central Mosque',
      distance: `${(Math.random() * 1 + 0.2).toFixed(1)} km`,
      type: 'Mosque',
    })

    // Add park
    nearbyPlaces.push({
      name: property.city === 'Lahore' ? 'Jilani Park' : property.city === 'Karachi' ? 'Hill Park' : 'F-9 Park',
      distance: `${(Math.random() * 1.5 + 0.3).toFixed(1)} km`,
      type: 'Park',
    })

    // Add restaurant
    nearbyPlaces.push({
      name: 'Food Street',
      distance: `${(Math.random() * 1 + 0.5).toFixed(1)} km`,
      type: 'Restaurant',
    })

    updates.nearbyPlaces = JSON.stringify(nearbyPlaces)

    // Update the property
    await prisma.property.update({
      where: { id: property.id },
      data: updates,
    })

    console.log(`Updated neighborhood data for: ${property.title}`)
  }

  console.log('Neighborhood data updated successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

