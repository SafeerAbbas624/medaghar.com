/**
 * Bulk-import listings from a CSV.
 *
 *   sudo -u deploy -H npx tsx scripts/import-listings.ts data.csv            # dry run: validate + dedupe
 *   sudo -u deploy -H npx tsx scripts/import-listings.ts data.csv --commit   # write
 *   sudo -u deploy -H npx tsx scripts/import-listings.ts --rollback <batch>  # undo a batch
 *
 * Run as `deploy`: photos are written under public/uploads, and the live app
 * (which runs as deploy) must own them.
 *
 * Options
 *   --commit               write to the database (default is a dry run)
 *   --batch NAME           tag for this run (default: file name + date)
 *   --max-age-days N       reject rows posted more than N days ago (default 15)
 *   --month-first          read 03/04/2026 as March 4 (default is day first: 3 April)
 *   --allow-few-photos     import rows short of the photo minimum as hidden, not reject them
 *   --images-dir DIR       folder that relative photo paths are read from
 *   --no-resolve-links     do not follow maps.app.goo.gl short links
 *   --skip FILE            CSV whose `id` column lists rows to leave out (e.g. from a comparison)
 *   --offset N --limit N   import a slice of the file
 *   --concurrency N        rows in flight at once (default 4)
 *   --report FILE          where to write the per-row report (default: <file>.report-<batch>.csv)
 */

import 'dotenv/config'
import { promises as fs, createWriteStream } from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { bumpListingsVersion } from '@/lib/redis'
import { cleanRow, unknownColumns, type RawRow } from '@/lib/import/row'
import { writeRow, rollbackBatch, resetRunState, type WriteResult } from '@/lib/import/importer'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://medaghar.com'

function parseArgs(argv: string[]) {
  const flags: Record<string, string | boolean> = {}
  const positional: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      positional.push(a)
      continue
    }
    const name = a.slice(2)
    const takesValue = ['batch', 'max-age-days', 'images-dir', 'skip', 'offset', 'limit', 'concurrency', 'report', 'rollback']
    if (takesValue.includes(name)) flags[name] = argv[++i]
    else flags[name] = true
  }
  return { flags, positional }
}

async function readCsv(file: string): Promise<{ rows: RawRow[]; headers: string[]; misaligned: Set<number> }> {
  let text = await fs.readFile(file, 'utf8')
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1) // Excel's BOM
  const parsed = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: 'greedy', dynamicTyping: false })
  const fatal = parsed.errors.filter((e) => e.type !== 'FieldMismatch')
  if (fatal.length) {
    console.error('CSV could not be read:', fatal.slice(0, 5))
    process.exit(1)
  }
  // A row with extra cells has shifted columns (usually an unquoted comma in
  // an address or maps link), so every value after the comma is misread.
  const misaligned = new Set(
    parsed.errors.filter((e) => e.code === 'TooManyFields').map((e) => e.row).filter((r): r is number => r !== undefined)
  )
  return { rows: parsed.data, headers: parsed.meta.fields ?? [], misaligned }
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2))

  if (flags.rollback) {
    const n = await rollbackBatch(String(flags.rollback))
    await bumpListingsVersion()
    console.log(`Rolled back ${n} listings from batch ${flags.rollback}.`)
    return
  }

  const file = positional[0]
  if (!file) {
    console.error('Usage: npx tsx scripts/import-listings.ts <file.csv> [--commit] [options]')
    process.exit(1)
  }

  const dryRun = !flags.commit
  const today = new Date().toISOString().slice(0, 10)
  const batch = String(flags.batch || `${path.basename(file, path.extname(file))}-${today}`).replace(/[^\w.-]+/g, '-')
  const maxAgeDays = flags['max-age-days'] ? Number(flags['max-age-days']) : 15
  const concurrency = Math.max(1, Number(flags.concurrency || 4))
  const offset = Number(flags.offset || 0)
  const limit = flags.limit ? Number(flags.limit) : Infinity
  const reportPath = String(flags.report || `${file.replace(/\.csv$/i, '')}.report-${batch}${dryRun ? '-dryrun' : ''}.csv`)

  const { rows, headers, misaligned } = await readCsv(file)
  const unknown = unknownColumns(headers)
  if (unknown.length) console.log(`Ignoring columns: ${unknown.join(', ')}`)

  let skip = new Set<string>()
  if (flags.skip) {
    const { rows: s } = await readCsv(String(flags.skip))
    skip = new Set(s.map((r) => String(r.id ?? r.sourceId ?? '').trim()).filter(Boolean))
    console.log(`Skip list: ${skip.size} ids`)
  }

  const slice = rows.slice(offset, offset + limit)
  console.log(
    `${dryRun ? 'DRY RUN' : 'IMPORTING'} ${slice.length} of ${rows.length} rows · batch ${batch} · posted within ${maxAgeDays} days`
  )

  const report = createWriteStream(reportPath)
  report.write(Papa.unparse([['row', 'id', 'outcome', 'reasons', 'warnings', 'url']]) + '\n')

  resetRunState()
  const counts: Record<string, number> = {}
  const reasonCounts: Record<string, number> = {}
  let done = 0
  const started = Date.now()

  const opts = {
    batch,
    dryRun,
    allowFewPhotos: !!flags['allow-few-photos'],
    imagesDir: flags['images-dir'] ? String(flags['images-dir']) : undefined,
    resolveShortLinks: !flags['no-resolve-links'],
  }

  async function handle(raw: RawRow, rowNo: number, index: number) {
    const cleaned = cleanRow(raw, { maxAgeDays, monthFirstDates: !!flags['month-first'] })
    let result: WriteResult
    const sourceId = cleaned.row?.sourceId ?? String((raw as Record<string, unknown>).id ?? '')
    if (misaligned.has(index)) {
      result = { outcome: 'rejected', reasons: ['more cells than headings; a comma in a value is not quoted'], warnings: [] }
    } else if (sourceId && skip.has(sourceId)) {
      result = { outcome: 'rejected', reasons: ['on the skip list'], warnings: [] }
    } else if (!cleaned.row) {
      result = { outcome: 'rejected', reasons: cleaned.errors, warnings: cleaned.warnings }
    } else {
      try {
        result = await writeRow(cleaned.row, opts, cleaned.warnings)
      } catch (e) {
        result = { outcome: 'rejected', reasons: [`database error: ${(e as Error).message.split('\n').pop()}`], warnings: cleaned.warnings }
      }
    }

    counts[result.outcome] = (counts[result.outcome] ?? 0) + 1
    for (const r of result.reasons) {
      // Group "posted 23 days ago" etc. under one heading in the summary.
      const g = r.replace(/"[^"]*"/g, '…').replace(/\d+/g, 'N')
      reasonCounts[g] = (reasonCounts[g] ?? 0) + 1
    }
    report.write(
      Papa.unparse([[
        rowNo,
        sourceId,
        result.outcome,
        result.reasons.join('; '),
        result.warnings.join('; '),
        result.slug ? `${SITE}/properties/${result.slug}` : '',
      ]]) + '\n'
    )

    done++
    if (done % 500 === 0 || done === slice.length) {
      const rate = done / ((Date.now() - started) / 1000)
      const eta = Math.round((slice.length - done) / Math.max(rate, 0.01) / 60)
      console.log(`  ${done}/${slice.length}  ${JSON.stringify(counts)}  ~${eta} min left`)
    }
  }

  // Small worker pool: photo downloads dominate, so a few rows in parallel.
  let next = 0
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < slice.length) {
        const i = next++
        // +2: header line, and spreadsheet rows count from 1.
        await handle(slice[i], offset + i + 2, offset + i)
      }
    })
  )

  await new Promise((r) => report.end(r))
  if (!dryRun) await bumpListingsVersion()

  console.log('\nResult:', counts)
  const top = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 12)
  if (top.length) {
    console.log('Most common reasons:')
    for (const [r, n] of top) console.log(`  ${String(n).padStart(7)}  ${r}`)
  }
  console.log(`Report: ${reportPath}`)
  if (dryRun) console.log('Nothing was written. Re-run with --commit to import.')
  else console.log(`Undo with: npx tsx scripts/import-listings.ts --rollback ${batch}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit()
  })
