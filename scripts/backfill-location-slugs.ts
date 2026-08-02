/**
 * Populates Property.citySlug / areaSlug / subAreaSlug from the free-text
 * city / area / subArea values, using the taxonomy resolver.
 *
 *   npx tsx scripts/backfill-location-slugs.ts --dry     # report only
 *   npx tsx scripts/backfill-location-slugs.ts           # apply
 *   npx tsx scripts/backfill-location-slugs.ts --force   # also redo resolved rows
 *
 * Idempotent: rows that already have a citySlug are skipped unless --force.
 */

import { PrismaClient } from '@prisma/client'
import { resolveLocation, type MatchQuality } from '../lib/locations'

const prisma = new PrismaClient()

const DRY = process.argv.includes('--dry')
const FORCE = process.argv.includes('--force')
const BATCH = 500

async function main() {
  console.log(DRY ? '🔍 Dry run — no writes\n' : '✍️  Applying backfill\n')

  const properties = await prisma.property.findMany({
    where: FORCE ? {} : { citySlug: null },
    select: { id: true, city: true, area: true, subArea: true },
  })

  if (properties.length === 0) {
    console.log('Nothing to do — every row already has a citySlug.')
    return
  }

  console.log(`Examining ${properties.length} listings…\n`)

  const byQuality: Record<MatchQuality, number> = {
    exact: 0, alias: 0, pattern: 0, slugify: 0, none: 0,
  }
  /** Unresolved "city | area" pairs, counted so the worst offenders surface first. */
  const unresolved = new Map<string, number>()
  const updates: { id: string; citySlug: string; areaSlug: string | null; subAreaSlug: string | null }[] = []

  for (const p of properties) {
    const r = resolveLocation({ city: p.city, area: p.area, subArea: p.subArea })
    byQuality[r.matched]++

    if (!r.citySlug) {
      bump(unresolved, `CITY  ${p.city}`)
      continue
    }
    if (p.area && !r.areaSlug) {
      bump(unresolved, `AREA  ${p.city} | ${p.area}`)
    }

    updates.push({
      id: p.id,
      citySlug: r.citySlug,
      areaSlug: r.areaSlug,
      subAreaSlug: r.subAreaSlug,
    })
  }

  const total = properties.length
  const cityOk = updates.length
  const areaOk = updates.filter((u) => u.areaSlug).length
  const withArea = properties.filter((p) => p.area).length

  console.log('Match quality:')
  for (const [k, v] of Object.entries(byQuality)) {
    if (v > 0) console.log(`  ${k.padEnd(8)} ${v}`)
  }
  console.log()
  console.log(`City resolved: ${cityOk}/${total} (${pct(cityOk, total)}%)`)
  console.log(`Area resolved: ${areaOk}/${withArea} (${pct(areaOk, withArea)}%) of rows that have an area`)

  if (unresolved.size > 0) {
    console.log(`\n⚠️  ${unresolved.size} unresolved value(s), most frequent first:`)
    for (const [key, n] of [...unresolved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)) {
      console.log(`  ${String(n).padStart(4)}×  ${key}`)
    }
    console.log('\n  Fix by adding to content/locations/aliases.ts or the city taxonomy.')
  }

  if (DRY) {
    console.log('\nDry run complete — nothing written.')
    return
  }

  console.log(`\nWriting ${updates.length} rows…`)
  let done = 0
  for (let i = 0; i < updates.length; i += BATCH) {
    const slice = updates.slice(i, i + BATCH)
    await prisma.$transaction(
      slice.map((u) =>
        prisma.property.update({
          where: { id: u.id },
          data: { citySlug: u.citySlug, areaSlug: u.areaSlug, subAreaSlug: u.subAreaSlug },
        })
      )
    )
    done += slice.length
    console.log(`  ${done}/${updates.length}`)
  }
  console.log('\n✅ Backfill complete.')
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function pct(n: number, d: number): number {
  return d === 0 ? 100 : Math.round((n / d) * 100)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
