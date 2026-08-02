import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Starting Pakistan Real Estate Database Seeding...');

  // Insert-only variant: no deletions, safe to run on the live database

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Buyers
    prisma.user.create({
      data: {
        email: 'ahmed.khan@gmail.com',
        password: hashedPassword,
        firstName: 'Ahmed',
        lastName: 'Khan',
        phone: '+92-300-1234567',
        avatar: 'https://i.pravatar.cc/150?img=11',
        role: 'BUYER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'fatima.ali@gmail.com',
        password: hashedPassword,
        firstName: 'Fatima',
        lastName: 'Ali',
        phone: '+92-321-9876543',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'BUYER',
      },
    }),
    // Agents
    prisma.user.create({
      data: {
        email: 'usman.realty@medaghar.com',
        password: hashedPassword,
        firstName: 'Usman',
        lastName: 'Malik',
        phone: '+92-300-5551234',
        avatar: 'https://i.pravatar.cc/150?img=12',
        role: 'AGENT',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ayesha.properties@graana.com',
        password: hashedPassword,
        firstName: 'Ayesha',
        lastName: 'Siddiqui',
        phone: '+92-321-5559876',
        avatar: 'https://i.pravatar.cc/150?img=9',
        role: 'AGENT',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bilal.homes@lamudi.pk',
        password: hashedPassword,
        firstName: 'Bilal',
        lastName: 'Ahmed',
        phone: '+92-333-5554321',
        avatar: 'https://i.pravatar.cc/150?img=13',
        role: 'AGENT',
      },
    }),
  ]);

  console.log('✅ Created 5 users');

  // Create Agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        userId: users[2].id,
        licenseNumber: 'PK-REA-2018-001234',
        bio: 'Top-rated real estate agent in Lahore with 12+ years of experience. Specializing in DHA, Bahria Town, and luxury properties.',
        specialties: JSON.stringify(['DHA Properties', 'Bahria Town', 'Luxury Homes', 'Investment Properties']),
        yearsExperience: 12,
        rating: 4.9,
        reviewCount: 245,
        phoneNumber: '+92-300-5551234',
        officeAddress: 'Office 301, Tricon Tower, Main Boulevard, Gulberg III, Lahore',
        website: 'www.usmanmalik-realty.pk',
      },
    }),
    prisma.agent.create({
      data: {
        userId: users[3].id,
        licenseNumber: 'PK-REA-2019-005678',
        bio: 'Experienced property consultant in Karachi. Expert in Clifton, DHA, and Bahria Town Karachi properties.',
        specialties: JSON.stringify(['Clifton', 'DHA Karachi', 'Bahria Town Karachi', 'Commercial Properties']),
        yearsExperience: 8,
        rating: 4.8,
        reviewCount: 189,
        phoneNumber: '+92-321-5559876',
        officeAddress: 'Suite 12, Dolmen Mall, Clifton, Karachi',
        website: 'www.ayesha-properties.pk',
      },
    }),
    prisma.agent.create({
      data: {
        userId: users[4].id,
        licenseNumber: 'PK-REA-2020-009012',
        bio: 'Islamabad and Rawalpindi property specialist. Helping clients find their dream homes in the twin cities.',
        specialties: JSON.stringify(['Bahria Town Islamabad', 'DHA Islamabad', 'Blue Area', 'Residential Plots']),
        yearsExperience: 6,
        rating: 4.7,
        reviewCount: 134,
        phoneNumber: '+92-333-5554321',
        officeAddress: 'Plaza 45, Blue Area, Islamabad',
        website: null,
      },
    }),
  ]);

  console.log('✅ Created 3 agents');

  // Create Properties - Lahore
  const properties = [];

  // Property 1: DHA Lahore Luxury House
  properties.push(
    await prisma.property.create({
      data: {
        address: 'House 123, Street 5, Phase 6',
        city: 'Lahore',
        province: 'Punjab',
        area: 'DHA Phase 6',
        country: 'Pakistan',
        latitude: 31.4697,
        longitude: 74.3973,
        price: 125000000, // PKR 12.5 Crore
        bedrooms: 5,
        bathrooms: 6,
        squareFeet: 5500,
        marla: 20,
        kanal: 1,
        yearBuilt: 2021,
        propertyType: 'HOUSE',
        listingType: 'FOR_SALE',
        status: 'ACTIVE',
        isFeatured: true,
        isVerified: true,
        isFSBO: false,
        title: 'Luxurious 1 Kanal House in DHA Phase 6',
        description: 'Brand new 1 kanal house in the heart of DHA Phase 6, Lahore. This stunning property features modern architecture, spacious rooms, Italian marble flooring, and a beautiful lawn. Perfect for families looking for luxury living.',
        features: JSON.stringify([
          'Italian Marble Flooring',
          'Central Air Conditioning',
          'Servant Quarter',
          'Drawing Room',
          'Dining Room',
          'TV Lounge',
          'Study Room',
          'Powder Room',
          'Store Room',
          'Laundry Room',
          'Kitchen with Breakfast Area',
          'Balconies',
          'Lawn',
          'Car Parking for 3 Cars',
        ]),
        possession: 'Ready',
        furnishing: 'Unfurnished',
        facing: 'South',
        cornerProperty: true,
        walkScore: 85,
        transitScore: 70,
        crimeScore: 'Low',
        schoolRating: 4.5,
        nearbyPlaces: JSON.stringify([
          'DHA Golf Club - 2 km',
          'Packages Mall - 3 km',
          'Lahore Grammar School - 1.5 km',
          'Shaukat Khanum Hospital - 4 km',
        ]),
        pkEstimate: 130000000,
        pkEstimateChange: 5000000,
        rentEstimate: 350000,
        pricePerMarla: 6250000,
        maintenanceFees: 15000,
        parkingSpaces: 3,
        garage: true,
        pool: false,
        agentId: agents[0].id,
        views: 1250,
      },
    })
  );

  // Property 2: Bahria Town Lahore Apartment
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Apartment 405, Jasmine Block',
        city: 'Lahore',
        province: 'Punjab',
        area: 'Bahria Town',
        country: 'Pakistan',
        latitude: 31.3426,
        longitude: 74.1816,
        price: 18500000, // PKR 1.85 Crore
        bedrooms: 3,
        bathrooms: 3,
        squareFeet: 1850,
        marla: null,
        kanal: null,
        yearBuilt: 2020,
        propertyType: 'FLAT',
        listingType: 'FOR_SALE',
        status: 'ACTIVE',
        isFeatured: true,
        isVerified: true,
        isFSBO: false,
        title: 'Modern 3 Bed Apartment in Bahria Town',
        description: 'Spacious 3-bedroom apartment in Bahria Town, Lahore. Features include modern kitchen, attached bathrooms, and beautiful views. Located in a secure gated community with all amenities.',
        features: JSON.stringify([
          'Elevator',
          'Security',
          'Backup Generator',
          'Gym',
          'Swimming Pool',
          'Community Park',
          'Mosque',
          'Shopping Area',
          'Balcony',
          'Tiled Flooring',
        ]),
        possession: 'Ready',
        furnishing: 'Semi-Furnished',
        facing: 'East',
        cornerProperty: false,
        walkScore: 90,
        transitScore: 75,
        crimeScore: 'Low',
        schoolRating: 4.3,
        nearbyPlaces: JSON.stringify([
          'Eiffel Tower Replica - 1 km',
          'Grand Jamia Mosque - 2 km',
          'Bahria International Hospital - 1.5 km',
        ]),
        pkEstimate: 19000000,
        pkEstimateChange: 500000,
        rentEstimate: 75000,
        pricePerSqft: 10000,
        maintenanceFees: 8000,
        parkingSpaces: 2,
        garage: false,
        pool: true,
        agentId: agents[0].id,
        views: 890,
      },
    })
  );

  // Property 3: Karachi Clifton Penthouse
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Penthouse, Sea View Apartments, Block 8',
        city: 'Karachi',
        province: 'Sindh',
        area: 'Clifton',
        country: 'Pakistan',
        latitude: 24.8138,
        longitude: 67.0299,
        price: 95000000, // PKR 9.5 Crore
        bedrooms: 4,
        bathrooms: 5,
        squareFeet: 4200,
        marla: null,
        kanal: null,
        yearBuilt: 2022,
        propertyType: 'PENTHOUSE',
        listingType: 'FOR_SALE',
        status: 'ACTIVE',
        isFeatured: true,
        isVerified: true,
        isFSBO: false,
        title: 'Luxury Sea-Facing Penthouse in Clifton',
        description: 'Exclusive penthouse with breathtaking Arabian Sea views. Features include private terrace, jacuzzi, home theater, and premium finishes throughout. Located in the most prestigious area of Karachi.',
        features: JSON.stringify([
          'Sea View',
          'Private Terrace',
          'Jacuzzi',
          'Home Theater',
          'Smart Home System',
          'Italian Kitchen',
          'Marble Flooring',
          'Central AC',
          'Servant Quarters',
          '24/7 Security',
          'Concierge Service',
          'Private Elevator',
        ]),
        possession: 'Ready',
        furnishing: 'Fully Furnished',
        facing: 'South',
        cornerProperty: true,
        walkScore: 88,
        transitScore: 65,
        crimeScore: 'Low',
        schoolRating: 4.7,
        nearbyPlaces: JSON.stringify([
          'Sea View Beach - 500m',
          'Dolmen Mall - 2 km',
          'Aga Khan Hospital - 3 km',
          'Karachi Grammar School - 2.5 km',
        ]),
        pkEstimate: 98000000,
        pkEstimateChange: 3000000,
        rentEstimate: 450000,
        pricePerSqft: 22619,
        maintenanceFees: 25000,
        parkingSpaces: 3,
        garage: true,
        pool: true,
        agentId: agents[1].id,
        views: 2100,
      },
    })
  );

  // Property 4: Islamabad Bahria Town House
  properties.push(
    await prisma.property.create({
      data: {
        address: 'House 456, Sector C, Phase 8',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        area: 'Bahria Town Phase 8',
        country: 'Pakistan',
        latitude: 33.5651,
        longitude: 73.1363,
        price: 55000000, // PKR 5.5 Crore
        bedrooms: 4,
        bathrooms: 4,
        squareFeet: 3200,
        marla: 10,
        kanal: 0.5,
        yearBuilt: 2019,
        propertyType: 'HOUSE',
        listingType: 'FOR_SALE',
        status: 'ACTIVE',
        isFeatured: true,
        isVerified: true,
        isFSBO: false,
        title: '10 Marla Beautiful House in Bahria Town Islamabad',
        description: 'Well-maintained 10 marla house in Bahria Town Phase 8. Features modern design, spacious rooms, and a beautiful garden. Ideal for families.',
        features: JSON.stringify([
          'Tiled Flooring',
          'Drawing Room',
          'Dining Room',
          'Kitchen',
          'Bedrooms with Attached Baths',
          'Powder Room',
          'Lawn',
          'Car Porch',
          'Boundary Wall',
          'Nearby Park',
          'Mosque',
        ]),
        possession: 'Ready',
        furnishing: 'Unfurnished',
        facing: 'West',
        cornerProperty: false,
        walkScore: 82,
        transitScore: 68,
        crimeScore: 'Low',
        schoolRating: 4.4,
        nearbyPlaces: JSON.stringify([
          'Bahria Enclave - 3 km',
          'Centaurus Mall - 15 km',
          'Shifa International Hospital - 12 km',
        ]),
        pkEstimate: 57000000,
        pkEstimateChange: 2000000,
        rentEstimate: 180000,
        pricePerMarla: 5500000,
        maintenanceFees: 5000,
        parkingSpaces: 2,
        garage: false,
        pool: false,
        agentId: agents[2].id,
        views: 750,
      },
    })
  );

  // Property 5: Rental Apartment in Gulberg, Lahore
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Flat 302, Block M, Main Boulevard',
        city: 'Lahore',
        province: 'Punjab',
        area: 'Gulberg III',
        country: 'Pakistan',
        latitude: 31.5081,
        longitude: 74.3473,
        price: 85000, // PKR 85,000 per month
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        marla: null,
        kanal: null,
        yearBuilt: 2018,
        propertyType: 'FLAT',
        listingType: 'FOR_RENT',
        status: 'ACTIVE',
        isFeatured: false,
        isVerified: true,
        isFSBO: false,
        title: '2 Bed Apartment for Rent in Gulberg',
        description: 'Spacious 2-bedroom apartment available for rent in Gulberg III. Prime location with easy access to restaurants, shopping, and offices.',
        features: JSON.stringify([
          'Elevator',
          'Security Guard',
          'Backup Generator',
          'Car Parking',
          'Balcony',
          'Tiled Flooring',
          'Attached Bathrooms',
        ]),
        possession: 'Ready',
        furnishing: 'Semi-Furnished',
        facing: 'North',
        cornerProperty: false,
        walkScore: 95,
        transitScore: 85,
        crimeScore: 'Low',
        schoolRating: 4.6,
        nearbyPlaces: JSON.stringify([
          'MM Alam Road - 1 km',
          'Liberty Market - 2 km',
          'Packages Mall - 3 km',
        ]),
        pkEstimate: 15000000,
        pkEstimateChange: 0,
        rentEstimate: 85000,
        pricePerSqft: 12500,
        maintenanceFees: 5000,
        parkingSpaces: 1,
        garage: false,
        pool: false,
        agentId: agents[0].id,
        views: 450,
      },
    })
  );

  // Property 6: Commercial Plot in DHA Karachi
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Commercial Plot, Phase 7, Main Boulevard',
        city: 'Karachi',
        province: 'Sindh',
        area: 'DHA Phase 7',
        country: 'Pakistan',
        latitude: 24.8263,
        longitude: 67.0684,
        price: 75000000, // PKR 7.5 Crore
        bedrooms: 0,
        bathrooms: 0,
        squareFeet: 0,
        marla: 20,
        kanal: 1,
        yearBuilt: null,
        propertyType: 'COMMERCIAL_PLOT',
        listingType: 'FOR_SALE',
        status: 'ACTIVE',
        isFeatured: true,
        isVerified: true,
        isFSBO: false,
        title: '1 Kanal Commercial Plot in DHA Phase 7',
        description: 'Prime commercial plot on main boulevard in DHA Phase 7. Ideal for building a plaza, showroom, or commercial complex. Excellent investment opportunity.',
        features: JSON.stringify([
          'Main Boulevard Location',
          'Corner Plot',
          'Wide Road',
          'All Utilities Available',
          'Clear Title',
          'NOC Available',
        ]),
        possession: 'Ready',
        furnishing: null,
        facing: 'East',
        cornerProperty: true,
        walkScore: 75,
        transitScore: 80,
        crimeScore: 'Low',
        schoolRating: null,
        nearbyPlaces: JSON.stringify([
          'DHA Golf Club - 2 km',
          'Dolmen Mall Clifton - 5 km',
        ]),
        pkEstimate: 78000000,
        pkEstimateChange: 3000000,
        rentEstimate: null,
        pricePerMarla: 3750000,
        maintenanceFees: 0,
        parkingSpaces: 0,
        garage: false,
        pool: false,
        agentId: agents[1].id,
        views: 980,
      },
    })
  );

  // Property 7: Residential Plot in Bahria Orchard Lahore
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Plot 789, Block A, Overseas',
        city: 'Lahore',
        province: 'Punjab',
        area: 'Bahria Orchard',
        country: 'Pakistan',
        latitude: 31.3700,
        longitude: 74.1900,
        price: 12500000, // PKR 1.25 Crore
        bedrooms: 0,
        bathrooms: 0,
        squareFeet: 0,
        marla: 10,
        kanal: 0.5,
        yearBuilt: null,
        propertyType: 'RESIDENTIAL_PLOT',
        listingType: 'FOR_SALE',
        status: 'ACTIVE',
        isFeatured: false,
        isVerified: true,
        isFSBO: true, // For Sale By Owner
        title: '10 Marla Plot in Bahria Orchard Overseas Block',
        description: 'Well-located 10 marla residential plot in Bahria Orchard. Ideal for building your dream home. Peaceful environment with all modern facilities.',
        features: JSON.stringify([
          'Possession Available',
          'All Utilities',
          'Park Facing',
          'Wide Street',
          'Gated Community',
          'Security',
        ]),
        possession: 'Ready',
        furnishing: null,
        facing: 'South',
        cornerProperty: false,
        walkScore: 70,
        transitScore: 60,
        crimeScore: 'Low',
        schoolRating: 4.2,
        nearbyPlaces: JSON.stringify([
          'Bahria Town - 5 km',
          'Ring Road - 2 km',
        ]),
        pkEstimate: 13000000,
        pkEstimateChange: 500000,
        rentEstimate: null,
        pricePerMarla: 1250000,
        maintenanceFees: 0,
        parkingSpaces: 0,
        garage: false,
        pool: false,
        agentId: null, // FSBO
        views: 320,
      },
    })
  );

  // Property 8: Upper Portion for Rent in Model Town Lahore
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Upper Portion, House 234, Block J',
        city: 'Lahore',
        province: 'Punjab',
        area: 'Model Town',
        country: 'Pakistan',
        latitude: 31.4814,
        longitude: 74.3160,
        price: 65000, // PKR 65,000 per month
        bedrooms: 3,
        bathrooms: 3,
        squareFeet: 1800,
        marla: 5,
        kanal: 0.25,
        yearBuilt: 2015,
        propertyType: 'UPPER_PORTION',
        listingType: 'FOR_RENT',
        status: 'ACTIVE',
        isFeatured: false,
        isVerified: true,
        isFSBO: false,
        title: '3 Bed Upper Portion in Model Town',
        description: 'Spacious upper portion available for rent in Model Town. Features 3 bedrooms with attached bathrooms, drawing room, and kitchen.',
        features: JSON.stringify([
          'Separate Entrance',
          'Drawing Room',
          'Dining Room',
          'Kitchen',
          'Attached Bathrooms',
          'Balcony',
          'Car Parking',
        ]),
        possession: 'Ready',
        furnishing: 'Unfurnished',
        facing: 'East',
        cornerProperty: false,
        walkScore: 88,
        transitScore: 78,
        crimeScore: 'Low',
        schoolRating: 4.5,
        nearbyPlaces: JSON.stringify([
          'Model Town Park - 500m',
          'Barkat Market - 1 km',
        ]),
        pkEstimate: 12000000,
        pkEstimateChange: 0,
        rentEstimate: 65000,
        pricePerSqft: 6667,
        maintenanceFees: 3000,
        parkingSpaces: 1,
        garage: false,
        pool: false,
        agentId: agents[0].id,
        views: 280,
      },
    })
  );

  // Property 9: Farm House in Islamabad
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Farm House, Simly Dam Road',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        area: 'Simly Dam',
        country: 'Pakistan',
        latitude: 33.7294,
        longitude: 73.1931,
        price: 85000000, // PKR 8.5 Crore
        bedrooms: 6,
        bathrooms: 7,
        squareFeet: 8000,
        marla: 80,
        kanal: 4,
        yearBuilt: 2020,
        propertyType: 'FARM_HOUSE',
        listingType: 'FOR_SALE',
        status: 'ACTIVE',
        isFeatured: true,
        isVerified: true,
        isFSBO: false,
        title: 'Luxury 4 Kanal Farm House near Simly Dam',
        description: 'Stunning farm house on 4 kanals with breathtaking views of Margalla Hills. Features include swimming pool, lawn, fruit orchard, and modern amenities. Perfect weekend getaway.',
        features: JSON.stringify([
          'Swimming Pool',
          'Fruit Orchard',
          'Lawn',
          'BBQ Area',
          'Servant Quarters',
          'Tube Well',
          'Generator',
          'Boundary Wall',
          'Security',
          'Mountain Views',
        ]),
        possession: 'Ready',
        furnishing: 'Fully Furnished',
        facing: 'North',
        cornerProperty: false,
        walkScore: 40,
        transitScore: 30,
        crimeScore: 'Low',
        schoolRating: null,
        nearbyPlaces: JSON.stringify([
          'Simly Dam - 2 km',
          'Margalla Hills - 5 km',
        ]),
        pkEstimate: 88000000,
        pkEstimateChange: 3000000,
        rentEstimate: 300000,
        pricePerMarla: 1062500,
        maintenanceFees: 20000,
        parkingSpaces: 5,
        garage: true,
        pool: true,
        agentId: agents[2].id,
        views: 1450,
      },
    })
  );

  // Property 10: Office Space in Blue Area Islamabad
  properties.push(
    await prisma.property.create({
      data: {
        address: 'Office 501, Evacuee Trust Complex',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        area: 'Blue Area',
        country: 'Pakistan',
        latitude: 33.7077,
        longitude: 73.0563,
        price: 150000, // PKR 150,000 per month
        bedrooms: 0,
        bathrooms: 2,
        squareFeet: 2500,
        marla: null,
        kanal: null,
        yearBuilt: 2017,
        propertyType: 'OFFICE',
        listingType: 'FOR_RENT',
        status: 'ACTIVE',
        isFeatured: false,
        isVerified: true,
        isFSBO: false,
        title: 'Premium Office Space in Blue Area',
        description: 'Modern office space in the heart of Blue Area, Islamabad. Ideal for corporate offices, IT companies, or consultancy firms. Includes parking and 24/7 security.',
        features: JSON.stringify([
          'Central AC',
          'Elevator',
          'Backup Generator',
          'Security',
          'Parking',
          'Reception Area',
          'Conference Room',
          'Pantry',
        ]),
        possession: 'Ready',
        furnishing: 'Unfurnished',
        facing: 'South',
        cornerProperty: false,
        walkScore: 92,
        transitScore: 88,
        crimeScore: 'Low',
        schoolRating: null,
        nearbyPlaces: JSON.stringify([
          'Centaurus Mall - 1 km',
          'Jinnah Super Market - 2 km',
          'Serena Hotel - 1.5 km',
        ]),
        pkEstimate: 35000000,
        pkEstimateChange: 0,
        rentEstimate: 150000,
        pricePerSqft: 14000,
        maintenanceFees: 10000,
        parkingSpaces: 3,
        garage: false,
        pool: false,
        agentId: agents[2].id,
        views: 620,
      },
    })
  );

  console.log('✅ Created 10 properties');

  // Create Property Images
  const propertyImages = [];
  const imageUrls = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // Modern house
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', // Luxury house
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', // Apartment
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', // Living room
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', // Kitchen
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', // Bedroom
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800', // Bathroom
    'https://images.unsplash.com/photo-1600607688960-e095ff8d5f6e?w=800', // Garden
  ];

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    // Add 5 images per property
    for (let j = 0; j < 5; j++) {
      propertyImages.push(
        await prisma.propertyImage.create({
          data: {
            propertyId: property.id,
            url: imageUrls[j % imageUrls.length],
            caption: j === 0 ? 'Main View' : `View ${j + 1}`,
            order: j,
          },
        })
      );
    }
  }

  console.log(`✅ Created ${propertyImages.length} property images`);

  // Create Reviews for Agents
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[0].id,
        agentId: agents[0].id,
        rating: 5,
        comment: 'Usman was extremely helpful in finding our dream home in DHA. Very professional and knowledgeable about the area. Highly recommended!',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        agentId: agents[0].id,
        rating: 5,
        comment: 'Excellent service! Made the entire buying process smooth and stress-free. Will definitely work with him again.',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[0].id,
        agentId: agents[1].id,
        rating: 5,
        comment: 'Ayesha helped us find the perfect apartment in Clifton. Very responsive and professional. Thank you!',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        agentId: agents[2].id,
        rating: 4,
        comment: 'Good experience overall. Bilal was helpful and showed us several properties in Bahria Town.',
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // Create Saved Properties
  const savedProperties = await Promise.all([
    prisma.savedProperty.create({
      data: {
        userId: users[0].id,
        propertyId: properties[0].id,
        notes: 'Love the location and size. Need to discuss price.',
      },
    }),
    prisma.savedProperty.create({
      data: {
        userId: users[0].id,
        propertyId: properties[2].id,
        notes: 'Beautiful sea view. Interested in viewing.',
      },
    }),
    prisma.savedProperty.create({
      data: {
        userId: users[1].id,
        propertyId: properties[1].id,
        notes: 'Perfect for our family. Will schedule a visit.',
      },
    }),
  ]);

  console.log(`✅ Created ${savedProperties.length} saved properties`);

  // Create View History
  const viewHistory = [];
  for (let i = 0; i < 20; i++) {
    viewHistory.push(
      await prisma.viewHistory.create({
        data: {
          userId: users[i % 2].id,
          propertyId: properties[i % properties.length].id,
        },
      })
    );
  }

  console.log(`✅ Created ${viewHistory.length} view history entries`);

  // Create Saved Searches
  const savedSearches = await Promise.all([
    prisma.savedSearch.create({
      data: {
        userId: users[0].id,
        name: 'DHA Lahore Houses',
        criteria: JSON.stringify({
          city: 'Lahore',
          area: 'DHA',
          propertyType: 'HOUSE',
          minPrice: 50000000,
          maxPrice: 150000000,
        }),
        frequency: 'daily',
      },
    }),
    prisma.savedSearch.create({
      data: {
        userId: users[1].id,
        name: 'Karachi Apartments',
        criteria: JSON.stringify({
          city: 'Karachi',
          propertyType: 'FLAT',
          listingType: 'FOR_SALE',
          minPrice: 10000000,
          maxPrice: 30000000,
        }),
        frequency: 'weekly',
      },
    }),
  ]);

  console.log(`✅ Created ${savedSearches.length} saved searches`);

  // Create Tour Requests
  const tourRequests = await Promise.all([
    prisma.tourRequest.create({
      data: {
        userId: users[0].id,
        propertyId: properties[0].id,
        agentId: agents[0].id,
        tourType: 'IN_PERSON',
        preferredDate: new Date('2025-11-05'),
        preferredTime: '10:00 AM',
        status: 'CONFIRMED',
        message: 'Looking forward to viewing this property.',
      },
    }),
    prisma.tourRequest.create({
      data: {
        userId: users[1].id,
        propertyId: properties[2].id,
        agentId: agents[1].id,
        tourType: 'VIRTUAL_3D',
        preferredDate: new Date('2025-11-06'),
        preferredTime: '2:00 PM',
        status: 'PENDING',
        message: 'Would like a virtual tour first.',
      },
    }),
  ]);

  console.log(`✅ Created ${tourRequests.length} tour requests`);

  // Create Price History
  const priceHistory = await Promise.all([
    prisma.priceHistory.create({
      data: {
        propertyId: properties[0].id,
        price: 120000000,
        eventType: 'Listed',
        eventDate: new Date('2025-09-01'),
      },
    }),
    prisma.priceHistory.create({
      data: {
        propertyId: properties[0].id,
        price: 125000000,
        eventType: 'Price Change',
        eventDate: new Date('2025-10-01'),
      },
    }),
    prisma.priceHistory.create({
      data: {
        propertyId: properties[2].id,
        price: 92000000,
        eventType: 'Listed',
        eventDate: new Date('2025-08-15'),
      },
    }),
    prisma.priceHistory.create({
      data: {
        propertyId: properties[2].id,
        price: 95000000,
        eventType: 'Price Change',
        eventDate: new Date('2025-09-20'),
      },
    }),
  ]);

  console.log(`✅ Created ${priceHistory.length} price history entries`);

  console.log('🎉 Pakistan Real Estate Database Seeding Complete!');
  console.log(`
  📊 Summary:
  - ${users.length} Users
  - ${agents.length} Agents
  - ${properties.length} Properties
  - ${propertyImages.length} Property Images
  - ${reviews.length} Reviews
  - ${savedProperties.length} Saved Properties
  - ${viewHistory.length} View History Entries
  - ${savedSearches.length} Saved Searches
  - ${tourRequests.length} Tour Requests
  - ${priceHistory.length} Price History Entries
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

