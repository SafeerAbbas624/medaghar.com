/**
 * Generates Property.slug for listings that don't have one.
 *
 *   npx tsx scripts/backfill-listing-slugs.ts --dry
 *   npx tsx scripts/backfill-listing-slugs.ts
 *
 * Existing slugs are never regenerated — a listing URL, once public, is frozen.
 */

import { PrismaClient } from '@prisma/client'
import { buildListingSlug } from '../lib/listingSlug'

const prisma = new PrismaClient()
const DRY = process.argv.includes('--dry')

async function main() {
  const properties = await prisma.property.findMany({
    where: { slug: null },
    select: {
      id: true, title: true, propertyType: true, listingType: true,
      city: true, area: true, subArea: true, marla: true, kanal: true,
    },
  })

  if (properties.length === 0) {
    console.log('Every listing already has a slug.')
    return
  }

  console.log(`${DRY ? '🔍 Dry run — ' : ''}${properties.length} listing(s) without a slug\n`)

  let done = 0
  for (const p of properties) {
    const slug = buildListingSlug(p)
    console.log(`  ${slug}`)
    if (!DRY) {
      try {
        await prisma.property.update({ where: { id: p.id }, data: { slug } })
        done++
      } catch (error: unknown) {
        // Astronomically unlikely, but don't abort the batch for one collision.
        if ((error as { code?: string })?.code === 'P2002') {
          const retry = buildListingSlug(p)
          await prisma.property.update({ where: { id: p.id }, data: { slug: retry } })
          done++
        } else {
          throw error
        }
      }
    }
  }

  console.log(DRY ? '\nDry run complete — nothing written.' : `\n✅ Wrote ${done} slug(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
