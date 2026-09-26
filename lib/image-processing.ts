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
/**
 * Clean, un-watermarked originals. Deliberately outside public/: nginx serves
 * everything under public/uploads, and a public original would let anyone
 * download the photo without the watermark.
 */
const ORIGINALS_DIR = path.join(process.cwd(), 'storage', 'uploads-originals')
const LOGO_PATH = path.join(process.cwd(), 'public', 'logo.png')
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1080
const THUMBNAIL_WIDTH = 400
const THUMBNAIL_HEIGHT = 300
const QUALITY = 80

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

let logoDataUri: Promise<string> | null = null

/** The site logo, trimmed of its transparent margin, as a data URI for SVG. */
function getLogo(): Promise<string> {
  if (!logoDataUri) {
    logoDataUri = sharp(LOGO_PATH)
      .trim()
      .resize(800, 800, { fit: 'inside' })
      .png()
      .toBuffer()
      .then((b) => `data:image/png;base64,${b.toString('base64')}`)
  }
  return logoDataUri
}

/**
 * Watermark layer for a W×H photo: a large, faint logo + "MedaGhar.com" in the
 * centre (hard to crop or clone out) and a small, solid one in the bottom-right
 * corner for branding. Sized from the photo so it reads the same on any image.
 */
async function watermarkSvg(w: number, h: number): Promise<Buffer> {
  const logo = await getLogo()
  const short = Math.min(w, h)

  // Centre mark
  const cW = Math.round(short * 0.42)
  const cH = Math.round(cW * 0.65)
  const cFont = Math.round(cW * 0.14)
  const cX = Math.round((w - cW) / 2)
  const cY = Math.round((h - cH - cFont * 1.4) / 2)

  // Corner mark
  const k = Math.round(short * 0.16)
  const kH = Math.round(k * 0.65)
  const kFont = Math.max(12, Math.round(k * 0.2))
  const pad = Math.round(short * 0.025)
  const kX = w - k - pad // logo and text both end at the right padding
  const kY = h - kH - kFont * 1.3 - pad

  const text = (x: number, y: number, size: number, opacity: number, anchor = 'middle') =>
    `<text x="${x}" y="${y}" font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif" font-weight="700"
       font-size="${size}" text-anchor="${anchor}" fill="#ffffff" fill-opacity="${opacity}"
       stroke="#0f172a" stroke-opacity="${opacity * 0.6}" stroke-width="${Math.max(1, size / 18)}"
       paint-order="stroke">MedaGhar.com</text>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}">
    <image href="${logo}" xlink:href="${logo}" x="${cX}" y="${cY}" width="${cW}" height="${cH}"
       preserveAspectRatio="xMidYMid meet" opacity="0.32"/>
    ${text(w / 2, cY + cH + cFont * 1.1, cFont, 0.42)}
    <image href="${logo}" xlink:href="${logo}" x="${kX}" y="${kY}" width="${k}" height="${kH}"
       preserveAspectRatio="xMidYMid meet" opacity="0.9"/>
    ${text(w - pad, kY + kH + kFont * 1.05, kFont, 0.9, 'end')}
  </svg>`
  return Buffer.from(svg)
}

/**
 * Resize to the site's maximum, stamp the watermark and encode as WebP.
 * Used for every photo shown on the site, and to re-stamp older uploads.
 */
export async function watermarkToWebp(input: Buffer): Promise<{ buffer: Buffer; width: number; height: number }> {
  // rotate() applies the phone's EXIF orientation before anything else.
  const base = await sharp(input)
    .rotate()
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true })
  const { width, height } = base.info
  const buffer = await sharp(base.data)
    .composite([{ input: await watermarkSvg(width, height), top: 0, left: 0 }])
    .webp({ quality: QUALITY })
    .toBuffer()
  return { buffer, width, height }
}

// ---------------------------------------------------------------------------
// Property photos
// ---------------------------------------------------------------------------

function generateBase(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
}

/**
 * Save an uploaded property photo:
 *   watermarked  public, WebP, the image the site shows
 *   thumbnail    public, WebP, cut from the watermarked image
 *   original     private (storage/), untouched, for re-processing later
 */
export async function processPropertyImage(
  file: UploadedFile,
  propertyId: string
): Promise<{
  original: ProcessedImageResult
  thumbnail: ProcessedImageResult
  watermarked: ProcessedImageResult
}> {
  const base = generateBase()
  const ext = (path.extname(file.originalName).toLowerCase() || '.jpg').replace(/[^.a-z0-9]/g, '')

  // 1. Private original, byte-for-byte.
  const originalPath = path.join(ORIGINALS_DIR, propertyId, `${base}${ext}`)
  await fs.mkdir(path.dirname(originalPath), { recursive: true })
  await fs.writeFile(originalPath, file.buffer)
  const originalMeta = await sharp(file.buffer).metadata()

  // 2. Watermarked WebP.
  const wm = await watermarkToWebp(file.buffer)
  const watermarkedFilename = `wm_${base}.webp`
  const watermarkedPath = path.join(UPLOAD_DIR, 'watermarked', propertyId, watermarkedFilename)
  await fs.mkdir(path.dirname(watermarkedPath), { recursive: true })
  await fs.writeFile(watermarkedPath, wm.buffer)

  // 3. Thumbnail from the watermarked image, so no clean copy is ever public.
  const thumbFilename = `thumb_${base}.webp`
  const thumbPath = path.join(UPLOAD_DIR, 'thumbnails', propertyId, thumbFilename)
  await fs.mkdir(path.dirname(thumbPath), { recursive: true })
  const thumbInfo = await sharp(wm.buffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: 'cover', position: 'center' })
    .webp({ quality: 70 })
    .toFile(thumbPath)

  return {
    original: {
      filename: path.basename(originalPath),
      path: originalPath,
      url: '', // never served
      width: originalMeta.width ?? wm.width,
      height: originalMeta.height ?? wm.height,
      size: file.buffer.length,
    },
    thumbnail: {
      filename: thumbFilename,
      path: thumbPath,
      url: `/uploads/thumbnails/${propertyId}/${thumbFilename}`,
      width: thumbInfo.width,
      height: thumbInfo.height,
      size: thumbInfo.size,
    },
    watermarked: {
      filename: watermarkedFilename,
      path: watermarkedPath,
      url: `/uploads/watermarked/${propertyId}/${watermarkedFilename}`,
      width: wm.width,
      height: wm.height,
      size: wm.buffer.length,
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
  const filename = `avatar_${generateBase()}.webp`
  const avatarDir = path.join(UPLOAD_DIR, 'avatars', userId)
  await fs.mkdir(avatarDir, { recursive: true })

  const outputPath = path.join(avatarDir, filename)

  const metadata = await sharp(file.buffer)
    .rotate()
    .resize(300, 300, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
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
    path.join(ORIGINALS_DIR, propertyId),
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
