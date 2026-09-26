/**
 * One-off (2026-09-26): bring photos uploaded before the WebP + logo
 * watermark pipeline in line with it.
 *
 *   sudo -u deploy -H npx tsx scripts/secure-existing-photos.ts          # dry run
 *   sudo -u deploy -H npx tsx scripts/secure-existing-photos.ts --apply
 *
 * 1. Every listing photo still on an old /uploads/watermarked/…/wm_*.jpg is
 *    re-stamped from its clean original as WebP, and its URL is updated.
 * 2. Clean originals move from public/uploads/properties (downloadable by
 *    anyone who strips "wm_" from a photo URL) to storage/uploads-originals.
 * 3. Clean public thumbnails (thumb_*.jpg) are deleted; thumbnails are now
 *    cut from the watermarked image.
 */

import 'dotenv/config'
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { watermarkToWebp } from '@/lib/image-processing'

const APPLY = process.argv.includes('--apply')
const PUB = path.join(process.cwd(), 'public', 'uploads')
const PRIV = path.join(process.cwd(), 'storage', 'uploads-originals')

async function exists(p: string) {
  return fs.stat(p).then(() => true, () => false)
}

async function main() {
  console.log(APPLY ? 'APPLYING' : 'DRY RUN (use --apply to change anything)')

  // 1. Re-stamp listing photos.
  const imgs = await prisma.propertyImage.findMany({
    where: { url: { startsWith: '/uploads/watermarked/' }, NOT: { url: { endsWith: '.webp' } } },
    select: { id: true, url: true },
  })
  let restamped = 0
  for (const img of imgs) {
    const m = img.url.match(/^\/uploads\/watermarked\/([\w-]+)\/wm_([\w-]+)\.\w+$/)
    if (!m) {
      console.log(`  skip (unexpected url): ${img.url}`)
      continue
    }
    const [, dir, base] = m
    const candidates = ['.jpg', '.jpeg', '.png', '.webp', ''].flatMap((e) => [
      path.join(PUB, 'properties', dir, base + e),
      path.join(PRIV, dir, base + e),
    ])
    let original: string | undefined
    for (const c of candidates) if (await exists(c)) { original = c; break }
    if (!original) {
      console.log(`  no clean original for ${img.url}; left as is`)
      continue
    }
    const url = `/uploads/watermarked/${dir}/wm_${base}.webp`
    console.log(`  ${img.url} -> ${url}`)
    if (APPLY) {
      const wm = await watermarkToWebp(await fs.readFile(original))
      await fs.writeFile(path.join(PUB, 'watermarked', dir, `wm_${base}.webp`), wm.buffer)
      await fs.mkdir(path.join(PUB, 'thumbnails', dir), { recursive: true })
      await sharp(wm.buffer)
        .resize(400, 300, { fit: 'cover', position: 'center' })
        .webp({ quality: 70 })
        .toFile(path.join(PUB, 'thumbnails', dir, `thumb_${base}.webp`))
      await prisma.propertyImage.update({ where: { id: img.id }, data: { url } })
    }
    restamped++
  }

  // 2. Move clean originals out of public/.
  let moved = 0
  const propDir = path.join(PUB, 'properties')
  for (const dir of (await exists(propDir)) ? await fs.readdir(propDir) : []) {
    for (const f of await fs.readdir(path.join(propDir, dir))) {
      moved++
      if (APPLY) {
        await fs.mkdir(path.join(PRIV, dir), { recursive: true })
        await fs.rename(path.join(propDir, dir, f), path.join(PRIV, dir, f))
      }
    }
    if (APPLY) await fs.rmdir(path.join(propDir, dir)).catch(() => {})
  }

  // 3. Delete clean thumbnails (old .jpg ones; new .webp ones are watermarked).
  let thumbs = 0
  const thumbDir = path.join(PUB, 'thumbnails')
  for (const dir of (await exists(thumbDir)) ? await fs.readdir(thumbDir) : []) {
    for (const f of await fs.readdir(path.join(thumbDir, dir))) {
      if (f.endsWith('.webp')) continue
      thumbs++
      if (APPLY) await fs.rm(path.join(thumbDir, dir, f))
    }
  }

  console.log({ restamped, originalsMovedToPrivate: moved, cleanThumbnailsDeleted: thumbs })
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
