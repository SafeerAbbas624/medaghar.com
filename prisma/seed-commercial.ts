import { PrismaClient, PropertyType, ListingType, PropertyStatus } from '@prisma/client'
// NOTE: this seeder writes free-text city/area/subArea and no slug. After
// running it, populate the canonical fields with:
//   npx tsx scripts/backfill-location-slugs.ts
//   npx tsx scripts/backfill-listing-slugs.ts
// Listings without citySlug are invisible to the SEO tree pages.

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding commercial properties...')

  // Get an agent
  const agent = await prisma.agent.findFirst()

  if (!agent) {
    console.log('No agent found. Please seed agents first.')
    return
  }

  const commercialProperties: Array<{
    propertyType: PropertyType
    listingType: ListingType
    status: PropertyStatus
    [key: string]: any
  }> = [
    // Offices
    {
      address: 'Office 301, Centaurus Mall',
      city: 'Islamabad',
      province: 'Islamabad Capital Territory',
      area: 'F-8 Markaz',
      country: 'Pakistan',
      latitude: 33.7077,
      longitude: 73.0563,
      price: 200000, // PKR 200,000 per month
      bedrooms: 0,
      bathrooms: 2,
      squareFeet: 3000,
      marla: null,
      kanal: null,
      yearBuilt: 2013,
      propertyType: PropertyType.OFFICE,
      listingType: ListingType.FOR_RENT,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isVerified: true,
      title: 'Premium Office Space in Centaurus Mall',
      description: 'Luxurious office space in the iconic Centaurus Mall. Perfect for corporate offices, IT companies, or consultancy firms. Includes dedicated parking, 24/7 security, and backup power.',
      features: JSON.stringify([
        'Prime Location',
        'Dedicated Parking',
        '24/7 Security',
        'Backup Generator',
        'Central AC',
        'High-Speed Internet',
        'Conference Room',
        'Pantry',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Furnished',
      parkingSpaces: 5,
      nearbyPlaces: JSON.stringify([
        { name: 'Jinnah Super Market', distance: '1 km', type: 'Shopping' },
        { name: 'PIMS Hospital', distance: '2 km', type: 'Hospital' },
        { name: 'Islamabad Club', distance: '1.5 km', type: 'Recreation' },
      ]),
    },
    {
      address: 'Office 12, Arfa Software Technology Park',
      city: 'Lahore',
      province: 'Punjab',
      area: 'Ferozepur Road',
      country: 'Pakistan',
      latitude: 31.4697,
      longitude: 74.2728,
      price: 35000000, // PKR 3.5 Crore
      bedrooms: 0,
      bathrooms: 3,
      squareFeet: 5000,
      marla: null,
      kanal: null,
      yearBuilt: 2012,
      propertyType: PropertyType.OFFICE,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isVerified: true,
      title: 'IT Office Space in Arfa Tower',
      description: 'Modern office space in Pakistan\'s first IT tower. Ideal for tech companies and startups. State-of-the-art infrastructure with fiber optic connectivity.',
      features: JSON.stringify([
        'IT Tower',
        'Fiber Optic',
        'Backup Power',
        'Cafeteria',
        'Prayer Area',
        'Ample Parking',
        'Security',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Semi-Furnished',
      parkingSpaces: 10,
    },
    // Shops
    {
      address: 'Shop 45, Liberty Market',
      city: 'Lahore',
      province: 'Punjab',
      area: 'Gulberg',
      country: 'Pakistan',
      latitude: 31.5204,
      longitude: 74.3587,
      price: 80000, // PKR 80,000 per month
      bedrooms: 0,
      bathrooms: 1,
      squareFeet: 400,
      marla: null,
      kanal: null,
      yearBuilt: 1995,
      propertyType: PropertyType.SHOP,
      listingType: ListingType.FOR_RENT,
      status: PropertyStatus.ACTIVE,
      isFeatured: false,
      isVerified: true,
      title: 'Retail Shop in Liberty Market',
      description: 'Prime retail space in the heart of Liberty Market. High foot traffic area perfect for clothing, accessories, or food business.',
      features: JSON.stringify([
        'High Foot Traffic',
        'Prime Location',
        'Main Market',
        'Electricity',
        'Water',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Unfurnished',
      parkingSpaces: 0,
    },
    {
      address: 'Shop 12-14, Dolmen Mall Clifton',
      city: 'Karachi',
      province: 'Sindh',
      area: 'Clifton',
      country: 'Pakistan',
      latitude: 24.8138,
      longitude: 67.0299,
      price: 25000000, // PKR 2.5 Crore
      bedrooms: 0,
      bathrooms: 2,
      squareFeet: 1200,
      marla: null,
      kanal: null,
      yearBuilt: 2005,
      propertyType: PropertyType.SHOP,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isVerified: true,
      title: 'Premium Shop in Dolmen Mall',
      description: 'Spacious retail space in Dolmen Mall Clifton. Perfect for branded stores, restaurants, or showrooms. Excellent ROI potential.',
      features: JSON.stringify([
        'Mall Location',
        'High Traffic',
        'AC',
        'Parking Available',
        'Security',
        'Maintenance',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Unfurnished',
      parkingSpaces: 3,
    },
    // Warehouses
    {
      address: 'Warehouse, Manga Raiwind Road',
      city: 'Lahore',
      province: 'Punjab',
      area: 'Manga Mandi',
      country: 'Pakistan',
      latitude: 31.4000,
      longitude: 74.2000,
      price: 150000, // PKR 150,000 per month
      bedrooms: 0,
      bathrooms: 2,
      squareFeet: 10000,
      marla: null,
      kanal: null,
      yearBuilt: 2015,
      propertyType: PropertyType.WAREHOUSE,
      listingType: ListingType.FOR_RENT,
      status: PropertyStatus.ACTIVE,
      isFeatured: false,
      isVerified: true,
      title: '10,000 Sq Ft Warehouse on Raiwind Road',
      description: 'Large warehouse facility perfect for storage, distribution, or logistics. Easy access from main road with loading dock.',
      features: JSON.stringify([
        'Loading Dock',
        'High Ceiling',
        'Three Phase Electricity',
        'Security',
        'Wide Entrance',
        'Office Space',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Unfurnished',
      parkingSpaces: 8,
    },
    {
      address: 'Warehouse Complex, Port Qasim',
      city: 'Karachi',
      province: 'Sindh',
      area: 'Port Qasim',
      country: 'Pakistan',
      latitude: 24.7833,
      longitude: 67.3500,
      price: 80000000, // PKR 8 Crore
      bedrooms: 0,
      bathrooms: 4,
      squareFeet: 25000,
      marla: null,
      kanal: null,
      yearBuilt: 2018,
      propertyType: PropertyType.WAREHOUSE,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isVerified: true,
      title: 'Large Warehouse Complex near Port',
      description: 'Massive warehouse facility near Port Qasim. Ideal for import/export businesses, logistics companies, or manufacturing. Includes office space and worker facilities.',
      features: JSON.stringify([
        'Near Port',
        'Multiple Loading Docks',
        'Office Space',
        'Worker Facilities',
        'Security',
        'Backup Power',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Unfurnished',
      parkingSpaces: 20,
    },
    // Factory
    {
      address: 'Factory Unit, Sundar Industrial Estate',
      city: 'Lahore',
      province: 'Punjab',
      area: 'Sundar',
      country: 'Pakistan',
      latitude: 31.4200,
      longitude: 74.2500,
      price: 45000000, // PKR 4.5 Crore
      bedrooms: 0,
      bathrooms: 4,
      squareFeet: 15000,
      marla: null,
      kanal: null,
      yearBuilt: 2010,
      propertyType: PropertyType.FACTORY,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.ACTIVE,
      isFeatured: false,
      isVerified: true,
      title: 'Industrial Factory in Sundar Estate',
      description: 'Fully functional factory unit in established industrial estate. Suitable for manufacturing, processing, or assembly operations. Includes machinery shed and office block.',
      features: JSON.stringify([
        'Industrial Zone',
        'Three Phase Electricity',
        'High Ceiling',
        'Loading Area',
        'Office Block',
        'Worker Facilities',
        'Security',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Unfurnished',
      parkingSpaces: 15,
    },
    // Building
    {
      address: 'Commercial Building, Main Boulevard',
      city: 'Islamabad',
      province: 'Islamabad Capital Territory',
      area: 'G-11 Markaz',
      country: 'Pakistan',
      latitude: 33.6700,
      longitude: 73.0700,
      price: 250000000, // PKR 25 Crore
      bedrooms: 0,
      bathrooms: 10,
      squareFeet: 20000,
      marla: null,
      kanal: null,
      yearBuilt: 2016,
      propertyType: PropertyType.BUILDING,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isVerified: true,
      title: '5-Story Commercial Building in G-11',
      description: 'Complete commercial building with 5 floors. Currently generating rental income. Excellent investment opportunity with high ROI. Includes basement parking.',
      features: JSON.stringify([
        '5 Floors',
        'Basement Parking',
        'Elevator',
        'Generator',
        'Water Tank',
        'Rental Income',
        'Prime Location',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      furnishing: 'Semi-Furnished',
      parkingSpaces: 25,
    },
  ]

  for (const property of commercialProperties) {
    try {
      const createdProperty = await prisma.property.create({
        data: property,
      })
      console.log(`Created commercial property: ${createdProperty.title}`)

      // Add images
      const imageUrl = property.propertyType === PropertyType.OFFICE 
        ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
        : property.propertyType === PropertyType.SHOP
        ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
        : property.propertyType === PropertyType.WAREHOUSE
        ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'
        : property.propertyType === PropertyType.FACTORY
        ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80'
        : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'

      await prisma.propertyImage.create({
        data: {
          propertyId: createdProperty.id,
          url: imageUrl,
          caption: `${property.propertyType} View`,
          order: 0,
        },
      })
    } catch (error) {
      console.error(`Error creating property: ${property.title}`, error)
    }
  }

  console.log('Commercial properties seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

