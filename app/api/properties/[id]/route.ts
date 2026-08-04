import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCityCoordinates } from '@/lib/constants/cities'
import { resolveLocation } from '@/lib/locations'
import { bumpListingsVersion } from '@/lib/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        // Explicit select — `include` would return Agent.phoneNumber, and
        // user.email/phone are contact details. Those are served only from
        // the authenticated /api/properties/[id]/contact endpoint.
        agent: {
          select: {
            id: true,
            bio: true,
            rating: true,
            reviewCount: true,
            yearsExperience: true,
            officeAddress: true,
            website: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        priceHistory: {
          orderBy: { eventDate: 'desc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// PATCH - Update a property
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get the property to check ownership
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, ownerId: true, agentId: true },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check if user owns the property or is the agent
    const isOwner = property.ownerId === session.user.id
    const isAgent = property.agentId === session.user.id
    if (!isOwner && !isAgent) {
      return NextResponse.json({ error: 'You do not have permission to edit this property' }, { status: 403 })
    }

    // Get coordinates from city if not provided
    const cityCoords = getCityCoordinates(body.city)
    const latitude = body.latitude || cityCoords.lat
    const longitude = body.longitude || cityCoords.lng

    // Re-resolve taxonomy slugs so an edited location moves the listing to the
    // right tree pages. The listing `slug` itself is deliberately NOT touched —
    // it is frozen at creation so the URL never breaks.
    const resolved = resolveLocation({
      city: body.city,
      area: body.area,
      subArea: body.subArea,
    })

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title: body.title,
        address: body.address,
        city: body.city,
        province: body.province,
        area: body.area || null,
        subArea: body.subArea || null,
        citySlug: body.citySlug || resolved.citySlug,
        areaSlug: body.areaSlug || resolved.areaSlug,
        subAreaSlug: body.subAreaSlug || resolved.subAreaSlug,
        zipCode: body.zipCode || null,
        latitude,
        longitude,
        price: body.price ? parseFloat(body.price) : undefined,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? parseFloat(body.bathrooms) : undefined,
        squareFeet: body.squareFeet ? parseInt(body.squareFeet) : null,
        marla: body.marla ? parseFloat(body.marla) : null,
        kanal: body.kanal ? parseFloat(body.kanal) : null,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : null,
        propertyType: body.propertyType,
        listingType: body.listingType,
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
        pricePerMarla: body.marla && body.price ? parseFloat(body.price) / parseFloat(body.marla) : null,
      },
    })

    // Update images if provided
    if (body.images && Array.isArray(body.images)) {
      // Delete existing images
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } })

      // Create new images
      for (let i = 0; i < body.images.length; i++) {
        if (body.images[i].url) {
          await prisma.propertyImage.create({
            data: {
              propertyId: id,
              url: body.images[i].url,
              caption: body.images[i].caption || null,
              order: i,
            },
          })
        }
      }
    }

    // Fetch updated property with images
    const result = await prisma.property.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    })

    // Edited location/price/type changes what searches return.
    await bumpListingsVersion()

    return NextResponse.json({ message: 'Property updated successfully', property: result })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}
