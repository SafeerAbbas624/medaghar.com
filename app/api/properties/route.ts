import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { normalizeAddress, calculateAddressHash } from '@/lib/addressNormalization'
import { slugify } from '@/lib/slugify'
import { getCityCoordinates, getCityProvince } from '@/lib/constants/cities'

// Quota limits by role
const QUOTA_LIMITS = {
  BUYER: 2,
  SELLER: 2,
  LANDLORD: 2,
  TENANT: 2,
  AGENT: 10,
  ADMIN: 100,
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract query parameters
    const city = searchParams.get('city')
    const province = searchParams.get('province')
    const area = searchParams.get('area')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const minMarla = searchParams.get('minMarla')
    const maxMarla = searchParams.get('maxMarla')
    const propertyType = searchParams.get('propertyType')
    const listingType = searchParams.get('listingType')
    const isFSBO = searchParams.get('isFSBO')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    }

    // PostgreSQL `contains` is case-sensitive by default, so `?city=lahore`
    // would not match a stored "Lahore" without mode: 'insensitive'.
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (province) where.province = { contains: province, mode: 'insensitive' }
    if (area) where.area = { contains: area, mode: 'insensitive' }
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) }
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) }
    if (bathrooms) where.bathrooms = { gte: parseFloat(bathrooms) }
    if (minMarla) where.marla = { ...where.marla, gte: parseFloat(minMarla) }
    if (maxMarla) where.marla = { ...where.marla, lte: parseFloat(maxMarla) }
    if (propertyType) where.propertyType = propertyType
    if (listingType) where.listingType = listingType
    if (isFSBO === 'true') where.isFSBO = true
    
    // Get total count
    const total = await prisma.property.count({ where })
    
    // Get properties with pagination
    const properties = await prisma.property.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        agent: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { listedDate: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    })
    
    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's role to determine quota
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check quota
    const activeListingsCount = await prisma.property.count({
      where: {
        ownerId: session.user.id,
        status: {
          in: ['ACTIVE', 'PENDING', 'UNDER_CONTRACT'],
        },
      },
    })

    const maxListings = QUOTA_LIMITS[user.role as keyof typeof QUOTA_LIMITS] || 2
    if (activeListingsCount >= maxListings) {
      return NextResponse.json(
        {
          error: `You have reached your maximum listing limit of ${maxListings}. Mark a property as SOLD to free up a slot.`,
          quotaExceeded: true,
          currentListings: activeListingsCount,
          maxListings,
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'address', 'city', 'province', 'price', 'bedrooms', 'bathrooms', 'propertyType', 'listingType', 'description']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Determine if FSBO based on user role
    const isFSBO = user.role !== 'AGENT'

    // Calculate normalized address and hash for duplicate detection
    const normalizedAddr = normalizeAddress(body.address, body.city, body.area || '')
    const addressHash = calculateAddressHash(normalizedAddr)

    // Check for duplicate listings
    const existingProperty = await prisma.property.findFirst({
      where: {
        addressHash,
        status: { in: ['ACTIVE', 'PENDING', 'UNDER_CONTRACT'] },
      },
      select: { id: true, title: true, address: true },
    })

    if (existingProperty) {
      return NextResponse.json(
        {
          error: 'A property with this address already exists',
          isDuplicate: true,
          existingProperty,
        },
        { status: 409 }
      )
    }

    // Generate unique slug from title
    const baseSlug = slugify(body.title)
    let slug = baseSlug
    let counter = 1

    // Check if slug already exists and make it unique
    while (await prisma.property.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Get coordinates from city if not provided
    const cityCoords = getCityCoordinates(body.city)
    const latitude = body.latitude || cityCoords.lat
    const longitude = body.longitude || cityCoords.lng

    // Create property
    const property = await prisma.property.create({
      data: {
        title: body.title,
        slug,
        address: body.address,
        city: body.city,
        province: body.province,
        area: body.area || null,
        subArea: body.subArea || null,
        zipCode: body.zipCode || null,
        country: 'Pakistan',
        latitude,
        longitude,
        price: parseFloat(body.price),
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseFloat(body.bathrooms),
        squareFeet: body.squareFeet ? parseInt(body.squareFeet) : null,
        marla: body.marla ? parseFloat(body.marla) : null,
        kanal: body.kanal ? parseFloat(body.kanal) : null,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : null,
        propertyType: body.propertyType,
        listingType: body.listingType,
        status: 'ACTIVE',
        isFSBO,
        description: body.description,
        features: body.features || null,
        virtualTourUrl: body.virtualTourUrl || null,
        videoUrl: body.videoUrl || null,
        parkingSpaces: body.parkingSpaces ? parseInt(body.parkingSpaces) : null,
        garage: body.garage || false,
        pool: body.pool || false,
        possession: body.possession || null,
        furnishing: body.furnishing || null,
        facing: body.facing || null,
        cornerProperty: body.cornerProperty || false,
        ownerId: session.user.id,
        pricePerMarla: body.marla ? parseFloat(body.price) / parseFloat(body.marla) : null,
        normalizedAddress: normalizedAddr,
        addressHash,
      },
      include: {
        images: true,
      },
    })

    // Create images if provided
    if (body.images && Array.isArray(body.images)) {
      for (let i = 0; i < body.images.length; i++) {
        await prisma.propertyImage.create({
          data: {
            propertyId: property.id,
            url: body.images[i].url,
            caption: body.images[i].caption || null,
            order: i,
          },
        })
      }
    }

    // Fetch the created property with images
    const createdProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: { images: true },
    })

    return NextResponse.json({
      message: 'Property listed successfully',
      property: createdProperty,
      isFSBO,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}

