import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { processPropertyImage, validateImageFile, deletePropertyImages } from '@/lib/image-processing'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const propertyId = formData.get('propertyId') as string

    // Validate count
    if (files.length < 1) {
      return NextResponse.json(
        { error: 'At least 1 image is required' },
        { status: 400 }
      )
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      )
    }

    // Validate and process each file
    const processedImages = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const validation = validateImageFile({ buffer, mimeType: file.type, originalName: file.name })
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const result = await processPropertyImage({ buffer, mimeType: file.type, originalName: file.name }, propertyId || session.user.id)
      processedImages.push({
        original: result.original.url,
        thumbnail: result.thumbnail.url,
        watermarked: result.watermarked.url,
        width: result.original.width,
        height: result.original.height,
      })
    }

    return NextResponse.json({
      images: processedImages,
      message: `Successfully uploaded ${processedImages.length} image(s)`,
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
    }

    await deletePropertyImages(propertyId)

    return NextResponse.json({ message: 'Images deleted successfully' })
  } catch (error: any) {
    console.error('Image delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete images' },
      { status: 500 }
    )
  }
}

export const maxDuration = 60
export const dynamic = 'force-dynamic'