import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import { existsSync } from 'fs'

// Set FFmpeg path - try multiple locations
const ffmpegPaths = [
  'C:\\ffmpeg\\ffmpeg-8.0.1-essentials_build\\bin\\ffmpeg.exe',
  'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
  'ffmpeg' // System PATH
]

const ffmpegPath = ffmpegPaths.find(p => {
  try {
    return existsSync(p) || p === 'ffmpeg'
  } catch {
    return false
  }
})

if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

export async function POST(request: Request) {
  let tempFilePath: string | null = null
  let outputFilePath: string | null = null

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const video = formData.get('video') as File

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Validate format
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(video.type)) {
      return NextResponse.json(
        { error: 'Invalid video format. Only MP4, WebM, MOV, and AVI are allowed.' },
        { status: 400 }
      )
    }

    // Validate size (max 100MB)
    const maxSize = 100 * 1024 * 1024
    if (video.size > maxSize) {
      return NextResponse.json(
        { error: 'Video must be under 100MB' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await video.arrayBuffer())

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos')
    await mkdir(uploadDir, { recursive: true })

    // Generate filename
    const outputFilename = `${Date.now()}-${randomUUID().slice(0, 8)}.mp4`
    const finalFilePath = path.join(uploadDir, outputFilename)

    // Try to compress with FFmpeg if available, otherwise save original
    let compressionSuccess = false

    try {
      // Save original file temporarily
      const tempFilename = `temp-${Date.now()}-${randomUUID().slice(0, 8)}.${video.type.split('/')[1]}`
      tempFilePath = path.join(uploadDir, tempFilename)
      await writeFile(tempFilePath, buffer)

      outputFilePath = finalFilePath

      // Prepare watermark path
      const watermarkPath = path.join(process.cwd(), 'app', 'icon.png')

      // Compress video with watermark using FFmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempFilePath!)
          .outputOptions([
            '-c:v libx264',           // Use H.264 codec
            '-crf 28',                // Constant Rate Factor (18-28 is good, higher = more compression)
            '-preset medium',         // Encoding speed/compression ratio
            '-c:a aac',               // Audio codec
            '-b:a 128k',              // Audio bitrate
            '-movflags +faststart',   // Enable streaming
          ])
          .complexFilter([
            // Scale video to max 1920px width
            '[0:v]scale=1920:-2[scaled]',
            // Add watermark in center with 20% opacity
            `[scaled]movie=${watermarkPath.replace(/\\/g, '/')}:loop=0,setpts=N/(FRAME_RATE*TB),format=rgba,colorchannelmixer=aa=0.2[watermark]`,
            '[scaled][watermark]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
          ])
          .output(outputFilePath!)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run()
      })

      // Delete temporary file
      if (tempFilePath) {
        await unlink(tempFilePath).catch(() => {})
        tempFilePath = null
      }

      compressionSuccess = true
    } catch (error) {
      console.warn('FFmpeg compression failed, saving original video:', error)

      // Clean up temp file if it exists
      if (tempFilePath) {
        await unlink(tempFilePath).catch(() => {})
        tempFilePath = null
      }

      // Save original video without compression
      await writeFile(finalFilePath, buffer)
    }

    const videoUrl = `/uploads/videos/${outputFilename}`

    return NextResponse.json({
      url: videoUrl,
      message: 'Video uploaded and compressed successfully'
    })
  } catch (error: any) {
    console.error('Video upload error:', error)

    // Clean up temporary files on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {})
    }
    if (outputFilePath) {
      await unlink(outputFilePath).catch(() => {})
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    )
  }
}
