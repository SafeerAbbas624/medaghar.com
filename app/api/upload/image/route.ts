import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { processPropertyImage, validateImageFile } from '@/lib/image-processing'
import { checkRateLimit, getRateLimiters } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { uploadRateLimiter } = getRateLimiters()
    const rl = await checkRateLimit(uploadRateLimiter, `image:${session.user.id}`)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('images').filter((f): f is File => f instanceof File)

    if (files.length < 1) {
      return NextResponse.json({ error: 'At least 1 image is required' }, { status: 400 })
    }
    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
    }

    // Files are stored under the uploader's own id. A client-supplied id would
    // be joined into a filesystem path, which allows traversal outside uploads/.
    const processedImages = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const validation = validateImageFile({ buffer, mimeType: file.type, originalName: file.name })
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const result = await processPropertyImage(
        { buffer, mimeType: file.type, originalName: file.name },
        session.user.id
      )
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
      urls: processedImages.map((img) => img.watermarked),
      message: `Successfully uploaded ${processedImages.length} image(s)`,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 })
  }
}

export const maxDuration = 60
export const dynamic = 'force-dynamic'
