import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (but keep admin data)
  await prisma.priceHistory.deleteMany()
  await prisma.message.deleteMany()
  await prisma.tourRequest.deleteMany()
  await prisma.review.deleteMany()
  await prisma.viewHistory.deleteMany()
  await prisma.savedProperty.deleteMany()
  await prisma.propertyImage.deleteMany()
  await prisma.property.deleteMany()
  await prisma.agent.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const buyer1 = await prisma.user.create({
    data: {
      email: 'john.doe@email.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-0101',
      role: 'BUYER',
    },
  })

  const buyer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@email.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '555-0102',
      role: 'BUYER',
    },
  })

  const agentUser1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@realty.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '555-0201',
      role: 'AGENT',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
  })

  const agentUser2 = await prisma.user.create({
    data: {
      email: 'michael.brown@realty.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '555-0202',
      role: 'AGENT',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
  })

  const agentUser3 = await prisma.user.create({
    data: {
      email: 'emily.davis@realty.com',
      password: hashedPassword,
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '555-0203',
      role: 'AGENT',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  })

  // Create Agent Profiles
  const agent1 = await prisma.agent.create({
    data: {
      userId: agentUser1.id,
      bio: 'Experienced real estate agent with 15+ years in luxury homes. Specializing in waterfront properties and high-end estates.',
      specialties: JSON.stringify(['Luxury Homes', 'Waterfront', 'Investment Properties']),
      yearsExperience: 15,
      rating: 4.9,
      reviewCount: 127,
      phoneNumber: '555-0201',
      officeAddress: '123 Main St, San Francisco, CA 94102',
      website: 'www.sarahjohnsonrealty.com',
    },
  })

  const agent2 = await prisma.agent.create({
    data: {
      userId: agentUser2.id,
      bio: 'Dedicated to helping first-time homebuyers find their dream home. Expert in residential properties and condos.',
      specialties: JSON.stringify(['First-Time Buyers', 'Condos', 'Residential']),
      yearsExperience: 8,
      rating: 4.8,
      reviewCount: 89,
      phoneNumber: '555-0202',
      officeAddress: '456 Oak Ave, Los Angeles, CA 90001',
    },
  })

  const agent3 = await prisma.agent.create({
    data: {
      userId: agentUser3.id,
      bio: 'Commercial and residential expert. Helping clients maximize their real estate investments.',
      specialties: JSON.stringify(['Commercial', 'Investment', 'Multi-Family']),
      yearsExperience: 12,
      rating: 4.7,
      reviewCount: 156,
      phoneNumber: '555-0203',
      officeAddress: '789 Pine St, San Diego, CA 92101',
    },
  })

  console.log('✅ Created users and agents')

  // Create Properties with realistic Pakistan data
  const properties = [
    {
      address: 'Main Boulevard, DHA Phase 5',
      city: 'Lahore',
      province: 'PUNJAB',
      zipCode: '54000',
      area: 'DHA Phase 5',
      latitude: 31.4697,
      longitude: 74.3895,
      price: 85000000, // 8.5 Crore PKR
      bedrooms: 5,
      bathrooms: 6,
      squareFeet: 5000,
      kanal: 1,
      marla: null,
      lotSize: 0.15,
      yearBuilt: 2020,
      propertyType: 'HOUSE',
      listingType: 'FOR_SALE',
      title: 'Luxurious 1 Kanal House in DHA Phase 5',
      description: 'Brand new 1 Kanal house in the heart of DHA Phase 5 Lahore. Features modern architecture, Italian marble flooring, imported fixtures, spacious rooms, servant quarters, and beautifully landscaped lawn. Prime location near parks and commercial areas.',
      features: JSON.stringify(['Marble Flooring', 'Imported Fixtures', 'Servant Quarter', 'Lawn', 'Parking', 'Security', 'Generator', 'Water Filtration']),
      pkEstimate: 87000000,
      pkEstimateChange: 2000000,
      rentEstimate: 350000,
      maintenanceFees: 0,
      taxAmount: 850000,
      parkingSpaces: 3,
      garage: true,
      pool: false,
      possession: 'READY',
      furnishing: 'UNFURNISHED',
      facing: 'SOUTH',
      cornerProperty: true,
      agentId: agent1.id,
    },
    {
      address: 'Clifton Block 2, Sea View Apartment',
      city: 'Karachi',
      province: 'SINDH',
      zipCode: '75600',
      area: 'Clifton Block 2',
      latitude: 24.8138,
      longitude: 67.0299,
      price: 45000000, // 4.5 Crore PKR
      bedrooms: 3,
      bathrooms: 4,
      squareFeet: 2500,
      kanal: null,
      marla: null,
      lotSize: null,
      yearBuilt: 2021,
      propertyType: 'FLAT',
      listingType: 'FOR_SALE',
      title: 'Sea View Luxury Apartment in Clifton',
      description: 'Stunning 3-bedroom apartment with breathtaking Arabian Sea views. Located in prime Clifton Block 2, features imported kitchen, marble flooring, central AC, and 24/7 security. Building amenities include gym, swimming pool, and backup generator.',
      features: JSON.stringify(['Sea View', 'Imported Kitchen', 'Marble Flooring', 'Central AC', 'Gym', 'Swimming Pool', 'Security', 'Generator', 'Elevator']),
      pkEstimate: 46000000,
      pkEstimateChange: 1000000,
      rentEstimate: 200000,
      maintenanceFees: 15000,
      taxAmount: 450000,
      parkingSpaces: 2,
      garage: true,
      pool: true,
      possession: 'READY',
      furnishing: 'SEMI_FURNISHED',
      facing: 'WEST',
      cornerProperty: false,
      agentId: agent1.id,
    },
    {
      address: 'F-7 Markaz, Modern Flat',
      city: 'Islamabad',
      province: 'ICT',
      zipCode: '44000',
      area: 'F-7',
      latitude: 33.7215,
      longitude: 73.0433,
      price: 32000000, // 3.2 Crore PKR
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 1800,
      kanal: null,
      marla: null,
      lotSize: null,
      yearBuilt: 2019,
      propertyType: 'FLAT',
      listingType: 'FOR_SALE',
      title: 'Modern 3-Bed Flat in F-7 Markaz',
      description: 'Beautiful 3-bedroom flat in the heart of F-7 Markaz, Islamabad. Walking distance to supermarkets, restaurants, and parks. Features include wooden flooring, modern kitchen, and spacious balconies. Ideal for families.',
      features: JSON.stringify(['Wooden Flooring', 'Modern Kitchen', 'Balconies', 'Parking', 'Security', 'Elevator', 'Backup Generator', 'Water Filtration']),
      pkEstimate: 33000000,
      pkEstimateChange: 1000000,
      rentEstimate: 150000,
      maintenanceFees: 8000,
      taxAmount: 320000,
      parkingSpaces: 2,
      garage: true,
      pool: false,
      possession: 'READY',
      furnishing: 'UNFURNISHED',
      facing: 'NORTH',
      cornerProperty: false,
      agentId: agent2.id,
    },
    {
      address: 'Bahria Town Phase 4, 10 Marla House',
      city: 'Lahore',
      province: 'PUNJAB',
      zipCode: '53720',
      area: 'Bahria Town Phase 4',
      latitude: 31.3426,
      longitude: 74.1816,
      price: 42000000, // 4.2 Crore PKR
      bedrooms: 4,
      bathrooms: 5,
      squareFeet: 2250,
      kanal: null,
      marla: 10,
      lotSize: 0.08,
      yearBuilt: 2018,
      propertyType: 'HOUSE',
      listingType: 'FOR_SALE',
      title: 'Beautiful 10 Marla House in Bahria Town',
      description: 'Well-maintained 10 Marla house in Bahria Town Phase 4. Features include tiled flooring, modern kitchen, spacious bedrooms, servant quarter, and beautiful lawn. Excellent location near schools, parks, and commercial areas.',
      features: JSON.stringify(['Tiled Flooring', 'Modern Kitchen', 'Servant Quarter', 'Lawn', 'Parking', 'Security', 'Nearby Schools', 'Parks']),
      pkEstimate: 43000000,
      pkEstimateChange: 1000000,
      rentEstimate: 120000,
      maintenanceFees: 0,
      taxAmount: 420000,
      parkingSpaces: 2,
      garage: true,
      pool: false,
      possession: 'READY',
      furnishing: 'UNFURNISHED',
      facing: 'EAST',
      cornerProperty: false,
      agentId: agent2.id,
    },
    {
      address: 'DHA Phase 6, 5 Marla House',
      city: 'Karachi',
      province: 'SINDH',
      zipCode: '75500',
      area: 'DHA Phase 6',
      latitude: 24.8050,
      longitude: 67.0631,
      price: 28000000, // 2.8 Crore PKR
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 1362,
      kanal: null,
      marla: 5,
      lotSize: 0.04,
      yearBuilt: 2019,
      propertyType: 'HOUSE',
      listingType: 'FOR_SALE',
      title: 'Modern 5 Marla House in DHA Karachi',
      description: 'Contemporary 5 Marla house in DHA Phase 6, Karachi. Features include modern kitchen, tiled flooring, 3 spacious bedrooms, and covered parking. Excellent location near commercial areas and schools.',
      features: JSON.stringify(['Modern Kitchen', 'Tiled Flooring', 'Covered Parking', 'Security', 'Nearby Schools', 'Commercial Area', 'Generator']),
      pkEstimate: 29000000,
      pkEstimateChange: 1000000,
      rentEstimate: 100000,
      maintenanceFees: 0,
      taxAmount: 280000,
      parkingSpaces: 2,
      garage: true,
      pool: false,
      possession: 'READY',
      furnishing: 'UNFURNISHED',
      facing: 'NORTH',
      cornerProperty: false,
      agentId: agent1.id,
    },
    {
      address: 'E-11, 2 Kanal Farm House',
      city: 'Islamabad',
      province: 'ICT',
      zipCode: '44000',
      area: 'E-11',
      latitude: 33.6573,
      longitude: 73.0742,
      price: 120000000, // 12 Crore PKR
      bedrooms: 6,
      bathrooms: 7,
      squareFeet: 10000,
      kanal: 2,
      marla: null,
      lotSize: 0.3,
      yearBuilt: 2017,
      propertyType: 'FARM_HOUSE',
      listingType: 'FOR_SALE',
      title: 'Luxury 2 Kanal Farm House in E-11',
      description: 'Magnificent 2 Kanal farm house in E-11, Islamabad. Features include swimming pool, lush green lawns, servant quarters, modern kitchen, and stunning Margalla Hills views. Perfect for luxury living and entertaining.',
      features: JSON.stringify(['Swimming Pool', 'Margalla Views', 'Servant Quarters', 'Modern Kitchen', 'Lawn', 'Security', 'Generator', 'Water Bore']),
      pkEstimate: 125000000,
      pkEstimateChange: 5000000,
      rentEstimate: 500000,
      maintenanceFees: 0,
      taxAmount: 1200000,
      parkingSpaces: 6,
      garage: true,
      pool: true,
      possession: 'READY',
      furnishing: 'SEMI_FURNISHED',
      facing: 'NORTH',
      cornerProperty: true,
      agentId: agent3.id,
    },
    {
      address: 'Gulberg III, Commercial Plaza',
      city: 'Lahore',
      province: 'PUNJAB',
      zipCode: '54660',
      area: 'Gulberg III',
      latitude: 31.5089,
      longitude: 74.3461,
      price: 18000000, // 1.8 Crore PKR
      bedrooms: 0,
      bathrooms: 2,
      squareFeet: 1200,
      kanal: null,
      marla: null,
      lotSize: null,
      yearBuilt: 2020,
      propertyType: 'OFFICE',
      listingType: 'FOR_SALE',
      title: 'Modern Office Space in Gulberg III',
      description: 'Prime commercial office space in Gulberg III, Lahore. Features include modern fit-out, central AC, elevator access, and dedicated parking. Ideal for corporate offices, IT companies, or professional services.',
      features: JSON.stringify(['Modern Fit-out', 'Central AC', 'Elevator', 'Parking', 'Security', 'Generator', 'High-Speed Internet']),
      pkEstimate: 19000000,
      pkEstimateChange: 1000000,
      rentEstimate: 150000,
      maintenanceFees: 10000,
      taxAmount: 180000,
      parkingSpaces: 3,
      garage: true,
      pool: false,
      possession: 'READY',
      furnishing: 'FURNISHED',
      facing: 'SOUTH',
      cornerProperty: false,
      agentId: agent3.id,
    },
    {
      address: 'Johar Town, 7 Marla House',
      city: 'Lahore',
      province: 'PUNJAB',
      zipCode: '54782',
      area: 'Johar Town',
      latitude: 31.4697,
      longitude: 74.2728,
      price: 35000000, // 3.5 Crore PKR
      bedrooms: 4,
      bathrooms: 4,
      squareFeet: 1890,
      kanal: null,
      marla: 7,
      lotSize: 0.06,
      yearBuilt: 2018,
      propertyType: 'HOUSE',
      listingType: 'FOR_SALE',
      title: 'Well-Maintained 7 Marla House in Johar Town',
      description: 'Beautiful 7 Marla house in Johar Town, Lahore. Features include tiled flooring, modern kitchen, spacious bedrooms, and covered parking. Excellent location near schools, parks, and commercial areas.',
      features: JSON.stringify(['Tiled Flooring', 'Modern Kitchen', 'Covered Parking', 'Security', 'Nearby Schools', 'Parks', 'Generator']),
      pkEstimate: 36000000,
      pkEstimateChange: 1000000,
      rentEstimate: 110000,
      maintenanceFees: 0,
      taxAmount: 350000,
      parkingSpaces: 2,
      garage: true,
      pool: false,
      possession: 'READY',
      furnishing: 'UNFURNISHED',
      facing: 'EAST',
      cornerProperty: false,
      agentId: agent2.id,
    },
    {
      address: 'Bahria Town Phase 7, 2-Bed Apartment',
      city: 'Rawalpindi',
      province: 'PUNJAB',
      zipCode: '46000',
      area: 'Bahria Town Phase 7',
      latitude: 33.5651,
      longitude: 73.0169,
      price: 80000, // PKR 80,000/month
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1100,
      kanal: null,
      marla: null,
      lotSize: null,
      yearBuilt: 2019,
      propertyType: 'FLAT',
      listingType: 'FOR_RENT',
      title: 'Modern 2-Bed Apartment for Rent',
      description: 'Spacious 2-bedroom apartment for rent in Bahria Town Phase 7, Rawalpindi. Features include modern kitchen, tiled flooring, and covered parking. Building amenities include security, elevator, and backup generator.',
      features: JSON.stringify(['Modern Kitchen', 'Tiled Flooring', 'Parking', 'Security', 'Elevator', 'Generator', 'Water Filtration']),
      pkEstimate: 15000000,
      pkEstimateChange: 0,
      rentEstimate: 80000,
      maintenanceFees: 5000,
      taxAmount: 0,
      parkingSpaces: 1,
      garage: true,
      pool: false,
      possession: 'READY',
      furnishing: 'SEMI_FURNISHED',
      facing: 'WEST',
      cornerProperty: false,
      agentId: agent3.id,
    },
    {
      address: 'Bahria Town Phase 8, 1 Kanal Plot',
      city: 'Islamabad',
      province: 'ICT',
      zipCode: '44000',
      area: 'Bahria Town Phase 8',
      latitude: 33.5320,
      longitude: 73.1177,
      price: 55000000, // 5.5 Crore PKR
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 5445,
      kanal: 1,
      marla: null,
      lotSize: 0.15,
      yearBuilt: null,
      propertyType: 'RESIDENTIAL_PLOT',
      listingType: 'FOR_SALE',
      title: '1 Kanal Residential Plot in Bahria Town',
      description: 'Prime 1 Kanal residential plot in Bahria Town Phase 8, Islamabad. Excellent location on main boulevard with all utilities available. Ideal for building your dream home. Clear title and possession available.',
      features: JSON.stringify(['Main Boulevard', 'Corner Plot', 'All Utilities', 'Clear Title', 'Possession Available', 'Developed Area']),
      pkEstimate: 57000000,
      pkEstimateChange: 2000000,
      rentEstimate: null,
      maintenanceFees: 0,
      taxAmount: 550000,
      parkingSpaces: 0,
      garage: false,
      pool: false,
      possession: 'READY',
      furnishing: null,
      facing: 'NORTH',
      cornerProperty: true,
      agentId: agent1.id,
    },
  ]

  console.log('📦 Creating properties...')

  for (const propertyData of properties) {
    const property = await prisma.property.create({
      data: propertyData,
    })

    // Add images for each property
    const imageUrls = [
      `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800`,
      `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800`,
      `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800`,
      `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800`,
      `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800`,
    ]

    for (let i = 0; i < imageUrls.length; i++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: imageUrls[i],
          caption: i === 0 ? 'Main View' : `View ${i + 1}`,
          order: i,
        },
      })
    }

    // Add price history
    const daysAgo = Math.floor(Math.random() * 60) + 30
    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        price: propertyData.price,
        eventType: 'Listed',
        eventDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('✅ Created properties with images and price history')



  // Get all properties for creating relationships
  const allProperties = await prisma.property.findMany()

  // Create saved properties
  await prisma.savedProperty.create({
    data: {
      userId: buyer1.id,
      propertyId: allProperties[0].id,
      notes: 'Love the bay views! Need to schedule a tour.',
    },
  })

  await prisma.savedProperty.create({
    data: {
      userId: buyer1.id,
      propertyId: allProperties[2].id,
      notes: 'Great location for work commute.',
    },
  })

  await prisma.savedProperty.create({
    data: {
      userId: buyer2.id,
      propertyId: allProperties[1].id,
      notes: 'Dream home! Checking financing options.',
    },
  })

  // Create view history
  for (let i = 0; i < 5; i++) {
    await prisma.viewHistory.create({
      data: {
        userId: buyer1.id,
        propertyId: allProperties[i].id,
        viewedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Create reviews
  await prisma.review.create({
    data: {
      userId: buyer1.id,
      agentId: agent1.id,
      rating: 5,
      comment: 'Sarah was absolutely amazing! She helped us find our dream home and made the entire process smooth and stress-free. Highly recommend!',
    },
  })

  await prisma.review.create({
    data: {
      userId: buyer2.id,
      agentId: agent2.id,
      rating: 5,
      comment: 'Michael is very knowledgeable and patient. He took the time to understand what we were looking for and showed us perfect properties.',
    },
  })

  // Create tour requests
  await prisma.tourRequest.create({
    data: {
      userId: buyer1.id,
      propertyId: allProperties[0].id,
      agentId: agent1.id,
      tourType: 'IN_PERSON',
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      preferredTime: '2:00 PM',
      status: 'CONFIRMED',
      message: 'Looking forward to seeing this beautiful home!',
    },
  })

  await prisma.tourRequest.create({
    data: {
      userId: buyer2.id,
      propertyId: allProperties[1].id,
      agentId: agent1.id,
      tourType: 'VIDEO_CHAT',
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      preferredTime: '10:00 AM',
      status: 'PENDING',
      message: 'Would love a virtual tour first.',
    },
  })

  console.log('✅ Created user interactions (saved properties, reviews, tours)')
  console.log('🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Users: ${await prisma.user.count()}`)
  console.log(`   - Agents: ${await prisma.agent.count()}`)
  console.log(`   - Properties: ${await prisma.property.count()}`)
  console.log(`   - Property Images: ${await prisma.propertyImage.count()}`)
  console.log(`   - Saved Properties: ${await prisma.savedProperty.count()}`)
  console.log(`   - Reviews: ${await prisma.review.count()}`)
  console.log(`   - Tour Requests: ${await prisma.tourRequest.count()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
