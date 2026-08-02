import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Image must be under 5MB' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `avatar-${session.user.id}-${Date.now()}-${randomUUID().slice(0, 8)}.webp`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    
    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true })
    
    const filepath = path.join(uploadDir, filename)

    // Compress and resize to 200x200 with sharp
    await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(filepath)

    const avatarUrl = `/uploads/avatars/${filename}`

    // Get current user to check for old avatar
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true }
    })

    // Delete old avatar if it exists and is a local file
    if (user?.avatar?.startsWith('/uploads/avatars/')) {
      try {
        const oldPath = path.join(process.cwd(), 'public', user.avatar)
        await unlink(oldPath)
      } catch (err) {
        // Ignore errors if file doesn't exist
        console.log('Could not delete old avatar:', err)
      }
    }

    // Update user with new avatar
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl }
    })

    return NextResponse.json({ 
      avatar: avatarUrl,
      message: 'Profile picture updated successfully'
    })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove avatar
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true }
    })

    // Delete old avatar file if it's a local file
    if (user?.avatar?.startsWith('/uploads/avatars/')) {
      try {
        const oldPath = path.join(process.cwd(), 'public', user.avatar)
        await unlink(oldPath)
      } catch (err) {
        console.log('Could not delete avatar file:', err)
      }
    }

    // Remove avatar from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null }
    })

    return NextResponse.json({ message: 'Avatar removed successfully' })
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove avatar' },
      { status: 500 }
    )
  }
}

