import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

export interface UploadedFile {
  buffer: Buffer
  originalName: string
  mimeType: string
}

export interface ProcessedImageResult {
  filename: string
  path: string
  url: string
  width: number
  height: number
  size: number
}

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const WATERMARK_PATH = path.join(process.cwd(), 'public', 'watermark.png')
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1080
const THUMBNAIL_WIDTH = 400
const THUMBNAIL_HEIGHT = 300
const QUALITY = 80
const WATERMARK_OPACITY = 0.15

// Ensure upload directories exist
async function ensureUploadDirs() {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'properties'),
    path.join(UPLOAD_DIR, 'thumbnails'),
    path.join(UPLOAD_DIR, 'watermarked'),
  ]

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true })
  }
}

// Create default watermark if it doesn't exist
async function ensureWatermark() {
  try {
    await fs.access(WATERMARK_PATH)
  } catch {
    // Create a simple text watermark
    const svg = `
      <svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
        <text x="150" y="55" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#3B82F6" text-anchor="middle" opacity="0.8">MedaGhar</text>
        <text x="150" y="80" font-family="Arial, sans-serif" font-size="12" fill="#6B7280" text-anchor="middle" opacity="0.6">medaghar.com</text>
      </svg>
    `
    await sharp(Buffer.from(svg))
      .resize(300, 100)
      .png()
      .toFile(WATERMARK_PATH)
  }
}

function generateFilename(originalName: string, prefix: string = ''): string {
  const ext = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `${prefix}${timestamp}_${random}${ext}`
}

/**
 * Process and save uploaded image with resizing, optimization, and watermarking
 */
export async function processPropertyImage(
  file: UploadedFile,
  propertyId: string
): Promise<{
  original: ProcessedImageResult
  thumbnail: ProcessedImageResult
  watermarked: ProcessedImageResult
}> {
  await ensureUploadDirs()
  await ensureWatermark()

  const baseFilename = generateFilename(file.originalName)
  const propertyDir = path.join(UPLOAD_DIR, 'properties', propertyId)
  await fs.mkdir(propertyDir, { recursive: true })

  // 1. Process original (resize if too large, optimize)
  const originalPath = path.join(propertyDir, baseFilename)
  const originalMetadata = await sharp(file.buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: QUALITY, progressive: true })
    .toFile(originalPath)

  // 2. Create thumbnail
  const thumbFilename = `thumb_${baseFilename}`
  const thumbPath = path.join(UPLOAD_DIR, 'thumbnails', propertyId, thumbFilename)
  await fs.mkdir(path.dirname(thumbPath), { recursive: true })

  const thumbMetadata = await sharp(file.buffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 70 })
    .toFile(thumbPath)

  // 3. Create watermarked version
  const watermarkedFilename = `wm_${baseFilename}`
  const watermarkedPath = path.join(UPLOAD_DIR, 'watermarked', propertyId, watermarkedFilename)
  await fs.mkdir(path.dirname(watermarkedPath), { recursive: true })

  const watermarkedMetadata = await sharp(file.buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .composite([
      {
        input: WATERMARK_PATH,
        tile: true,
        gravity: 'southeast',
        blend: 'over',
      },
    ])
    .jpeg({ quality: QUALITY, progressive: true })
    .toFile(watermarkedPath)

  const baseUrl = `/uploads/properties/${propertyId}`

  return {
    original: {
      filename: baseFilename,
      path: originalPath,
      url: `${baseUrl}/${baseFilename}`,
      width: originalMetadata.width,
      height: originalMetadata.height,
      size: (await fs.stat(originalPath)).size,
    },
    thumbnail: {
      filename: thumbFilename,
      path: thumbPath,
      url: `/uploads/thumbnails/${propertyId}/${thumbFilename}`,
      width: thumbMetadata.width,
      height: thumbMetadata.height,
      size: (await fs.stat(thumbPath)).size,
    },
    watermarked: {
      filename: watermarkedFilename,
      path: watermarkedPath,
      url: `/uploads/watermarked/${propertyId}/${watermarkedFilename}`,
      width: watermarkedMetadata.width,
      height: watermarkedMetadata.height,
      size: (await fs.stat(watermarkedPath)).size,
    },
  }
}

/**
 * Process agent/agency logo or avatar
 */
export async function processProfileImage(
  file: UploadedFile,
  userId: string
): Promise<ProcessedImageResult> {
  await ensureUploadDirs()

  const filename = generateFilename(file.originalName, 'avatar_')
  const avatarDir = path.join(UPLOAD_DIR, 'avatars', userId)
  await fs.mkdir(avatarDir, { recursive: true })

  const outputPath = path.join(avatarDir, filename)

  const metadata = await sharp(file.buffer)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath)

  return {
    filename,
    path: outputPath,
    url: `/uploads/avatars/${userId}/${filename}`,
    width: metadata.width,
    height: metadata.height,
    size: (await fs.stat(outputPath)).size,
  }
}

/**
 * Delete all images for a property
 */
export async function deletePropertyImages(propertyId: string): Promise<void> {
  const dirs = [
    path.join(UPLOAD_DIR, 'properties', propertyId),
    path.join(UPLOAD_DIR, 'thumbnails', propertyId),
    path.join(UPLOAD_DIR, 'watermarked', propertyId),
  ]

  for (const dir of dirs) {
    try {
      await fs.rm(dir, { recursive: true, force: true })
    } catch {
      // Directory might not exist
    }
  }
}

/**
 * Validate uploaded file
 */
export function validateImageFile(file: UploadedFile): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.mimeType)) {
    return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC' }
  }

  if (file.buffer.length > maxSize) {
    return { valid: false, error: 'File too large. Maximum size: 10MB' }
  }

  return { valid: true }
}

/**
 * Get image info without loading full image
 */
export async function getImageInfo(filePath: string): Promise<{
  width: number
  height: number
  format: string
  size: number
}> {
  const stats = await fs.stat(filePath)
  const metadata = await sharp(filePath).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: stats.size,
  }
}