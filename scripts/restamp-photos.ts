/**
 * Re-apply the current watermark to every listing photo, from its private
 * original. Run after changing the watermark in lib/image-processing.ts.
 *
 *   sudo -u deploy -H npx tsx scripts/restamp-photos.ts          # dry run
 *   sudo -u deploy -H npx tsx scripts/restamp-photos.ts --apply
 *
 * Each photo gets a new file name, because /uploads is served with a 30-day
 * immutable cache and browsers would otherwise keep the old stamp. Old files
 * are left in place (they are watermarked too) so pages cached for a few
 * minutes do not show broken images.
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
const stamp = Date.now().toString(36)

async function findOriginal(dir: string, base: string): Promise<string | undefined> {
  const files = await fs.readdir(path.join(PRIV, dir)).catch(() => [] as string[])
  const f = files.find((x) => x === base || x.startsWith(base + '.'))
  return f ? path.join(PRIV, dir, f) : undefined
}

async function main() {
  console.log(APPLY ? 'APPLYING' : 'DRY RUN (use --apply to change anything)')
  const imgs = await prisma.propertyImage.findMany({
    where: { url: { startsWith: '/uploads/watermarked/' } },
    select: { id: true, url: true },
  })
  let done = 0
  let missing = 0
  for (const img of imgs) {
    // wm_<base>.webp or wm_<base>__<stamp>.webp from an earlier re-stamp
    const m = img.url.match(/^\/uploads\/watermarked\/([\w-]+)\/wm_([0-9]+_[a-z0-9]+)(?:__[a-z0-9]+)?\.\w+$/)
    const original = m && (await findOriginal(m[1], m[2]))
    if (!m || !original) {
      missing++
      console.log(`  no original, left as is: ${img.url}`)
      continue
    }
    const [, dir, base] = m
    const name = `${base}__${stamp}`
    const url = `/uploads/watermarked/${dir}/wm_${name}.webp`
    console.log(`  ${img.url} -> ${url}`)
    if (APPLY) {
      const wm = await watermarkToWebp(await fs.readFile(original))
      await fs.writeFile(path.join(PUB, 'watermarked', dir, `wm_${name}.webp`), wm.buffer)
      await fs.mkdir(path.join(PUB, 'thumbnails', dir), { recursive: true })
      await sharp(wm.buffer)
        .resize(400, 300, { fit: 'cover', position: 'center' })
        .webp({ quality: 70 })
        .toFile(path.join(PUB, 'thumbnails', dir, `thumb_${name}.webp`))
      await prisma.propertyImage.update({ where: { id: img.id }, data: { url } })
    }
    done++
  }
  console.log({ restamped: done, withoutOriginal: missing })
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
