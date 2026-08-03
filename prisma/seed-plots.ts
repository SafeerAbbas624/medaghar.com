import { PrismaClient } from '@prisma/client'
// NOTE: this seeder writes free-text city/area/subArea and no slug. After
// running it, populate the canonical fields with:
//   npx tsx scripts/backfill-location-slugs.ts
//   npx tsx scripts/backfill-listing-slugs.ts
// Listings without citySlug are invisible to the SEO tree pages.

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding additional plots...')

  // Get an agent
  const agent = await prisma.agent.findFirst()

  if (!agent) {
    console.log('No agent found. Please seed agents first.')
    return
  }

  const plots = [
    // Residential Plots
    {
      address: 'Plot 123, Block C, Sector D',
      city: 'Lahore',
      province: 'Punjab',
      area: 'DHA Phase 9',
      country: 'Pakistan',
      latitude: 31.4697,
      longitude: 74.4085,
      price: 18000000, // PKR 1.8 Crore
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 10,
      kanal: 0.5,
      propertyType: 'RESIDENTIAL_PLOT',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: true,
      isVerified: true,
      title: '10 Marla Corner Plot in DHA Phase 9',
      description: 'Prime corner plot in DHA Phase 9 Prism. Ideal location for building your dream home. All utilities available including gas, electricity, and water. Wide roads and excellent development.',
      features: JSON.stringify([
        'Corner Plot',
        'Park Facing',
        'All Utilities Available',
        'Wide Road',
        'Possession Ready',
        'Clear Title',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      facing: 'North',
      cornerProperty: true,
      nearbyPlaces: JSON.stringify([
        { name: 'DHA Phase 9 Park', distance: '0.2 km', type: 'Park' },
        { name: 'Roots Millennium School', distance: '1.5 km', type: 'School' },
        { name: 'Shaukat Khanum Hospital', distance: '3 km', type: 'Hospital' },
      ]),
    },
    {
      address: 'Plot 456, Block E, Overseas',
      city: 'Lahore',
      province: 'Punjab',
      area: 'Bahria Town',
      country: 'Pakistan',
      latitude: 31.3700,
      longitude: 74.1900,
      price: 25000000, // PKR 2.5 Crore
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 20,
      kanal: 1,
      propertyType: 'RESIDENTIAL_PLOT',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: true,
      isVerified: true,
      title: '1 Kanal Plot in Bahria Town Overseas Block',
      description: 'Spacious 1 kanal plot in prime location of Bahria Town. Perfect for constructing a luxury villa. Surrounded by beautiful houses and excellent infrastructure.',
      features: JSON.stringify([
        '1 Kanal',
        'Main Boulevard',
        'Possession Available',
        'Developed Area',
        'Security 24/7',
        'Gated Community',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      facing: 'South',
      cornerProperty: false,
      nearbyPlaces: JSON.stringify([
        { name: 'Bahria Grand Mosque', distance: '1 km', type: 'Mosque' },
        { name: 'Eiffel Tower Replica', distance: '2 km', type: 'Landmark' },
        { name: 'Bahria International Hospital', distance: '2.5 km', type: 'Hospital' },
      ]),
    },
    {
      address: 'Plot 789, Block F, Sector G-13',
      city: 'Islamabad',
      province: 'Islamabad Capital Territory',
      area: 'G-13',
      country: 'Pakistan',
      latitude: 33.6518,
      longitude: 73.0560,
      price: 15000000, // PKR 1.5 Crore
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 8,
      kanal: 0.4,
      propertyType: 'RESIDENTIAL_PLOT',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: false,
      isVerified: true,
      title: '8 Marla Plot in G-13 Islamabad',
      description: 'Well-located 8 marla plot in G-13. Peaceful residential area with all modern facilities. Ideal for building a comfortable family home.',
      features: JSON.stringify([
        '8 Marla',
        'Peaceful Area',
        'All Utilities',
        'Near Park',
        'Clear Title',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      facing: 'East',
      cornerProperty: false,
    },
    // Commercial Plots
    {
      address: 'Commercial Plot, Main GT Road',
      city: 'Rawalpindi',
      province: 'Punjab',
      area: 'Saddar',
      country: 'Pakistan',
      latitude: 33.5972,
      longitude: 73.0479,
      price: 50000000, // PKR 5 Crore
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 15,
      kanal: 0.75,
      propertyType: 'COMMERCIAL_PLOT',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: true,
      isVerified: true,
      title: '15 Marla Commercial Plot on GT Road',
      description: 'Prime commercial plot on main GT Road. Excellent for building a plaza, showroom, or commercial complex. High traffic area with great business potential.',
      features: JSON.stringify([
        'Main Road',
        'High Traffic',
        'Commercial Zone',
        'Wide Frontage',
        'All Utilities',
        'Investment Opportunity',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      facing: 'North',
      cornerProperty: true,
    },
    {
      address: 'Plot 321, Commercial Area, Phase 6',
      city: 'Karachi',
      province: 'Sindh',
      area: 'DHA Phase 6',
      country: 'Pakistan',
      latitude: 24.8263,
      longitude: 67.0684,
      price: 120000000, // PKR 12 Crore
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 30,
      kanal: 1.5,
      propertyType: 'COMMERCIAL_PLOT',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: true,
      isVerified: true,
      title: '1.5 Kanal Commercial Plot in DHA Phase 6',
      description: 'Massive commercial plot in DHA Phase 6. Perfect for building a shopping mall, hotel, or corporate office. Prime location with excellent ROI potential.',
      features: JSON.stringify([
        '1.5 Kanal',
        'Corner Plot',
        'Main Boulevard',
        'Commercial Zone',
        'High ROI',
        'Premium Location',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      facing: 'West',
      cornerProperty: true,
    },
    // Agricultural Land
    {
      address: 'Agricultural Land, Manga Mandi Road',
      city: 'Lahore',
      province: 'Punjab',
      area: 'Manga Mandi',
      country: 'Pakistan',
      latitude: 31.4000,
      longitude: 74.2000,
      price: 80000000, // PKR 8 Crore
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 400,
      kanal: 20,
      propertyType: 'AGRICULTURAL_LAND',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: false,
      isVerified: true,
      title: '20 Kanal Agricultural Land near Manga Mandi',
      description: 'Fertile agricultural land perfect for farming. Water available through tube well. Good soil quality and easy access from main road.',
      features: JSON.stringify([
        '20 Kanal',
        'Fertile Soil',
        'Tube Well',
        'Main Road Access',
        'Clear Title',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      facing: 'South',
      cornerProperty: false,
    },
    // Industrial Land
    {
      address: 'Industrial Plot, Sundar Industrial Estate',
      city: 'Lahore',
      province: 'Punjab',
      area: 'Sundar',
      country: 'Pakistan',
      latitude: 31.4200,
      longitude: 74.2500,
      price: 60000000, // PKR 6 Crore
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 50,
      kanal: 2.5,
      propertyType: 'INDUSTRIAL_LAND',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: false,
      isVerified: true,
      title: '2.5 Kanal Industrial Plot in Sundar',
      description: 'Industrial plot in established industrial estate. Ideal for factory or warehouse. All utilities available including three-phase electricity.',
      features: JSON.stringify([
        '2.5 Kanal',
        'Industrial Zone',
        'Three Phase Electricity',
        'Wide Road',
        'Security',
      ]),
      agentId: agent.id,
      possession: 'Ready',
      facing: 'East',
      cornerProperty: false,
    },
    // Plot Files
    {
      address: 'Plot File, Sector M, Block A',
      city: 'Islamabad',
      province: 'Islamabad Capital Territory',
      area: 'Blue World City',
      country: 'Pakistan',
      latitude: 33.6000,
      longitude: 73.1000,
      price: 3500000, // PKR 35 Lakh
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      marla: 5,
      kanal: 0.25,
      propertyType: 'PLOT_FILE',
      listingType: 'FOR_SALE',
      status: 'ACTIVE',
      isFeatured: false,
      isVerified: false,
      title: '5 Marla Plot File in Blue World City',
      description: 'Affordable plot file in Blue World City. Good investment opportunity with development in progress. Easy installment plan available.',
      features: JSON.stringify([
        '5 Marla',
        'Installment Available',
        'Developing Area',
        'Investment Opportunity',
      ]),
      agentId: agent.id,
      possession: 'On Installments',
      facing: 'North',
      cornerProperty: false,
    },
  ]

  for (const plot of plots) {
    try {
      const createdPlot = await prisma.property.create({
        data: plot,
      })
      console.log(`Created plot: ${createdPlot.title}`)

      // Add images
      await prisma.propertyImage.create({
        data: {
          propertyId: createdPlot.id,
          url: `https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80`,
          caption: 'Plot View',
          order: 0,
        },
      })
    } catch (error) {
      console.error(`Error creating plot: ${plot.title}`, error)
    }
  }

  console.log('Plots seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

