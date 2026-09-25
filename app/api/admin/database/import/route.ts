import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPermission } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'
import { bumpListingsVersion } from '@/lib/redis'
import { cleanRow, unknownColumns, type RawRow } from '@/lib/import/row'
import { writeRow, resetRunState, type WriteResult } from '@/lib/import/importer'
import Papa from 'papaparse'

/**
 * Listings go through the full import pipeline (validation, 15-day freshness,
 * coordinates from Google Maps links, dedupe, photos, contacts). A browser
 * upload is capped; large files belong to scripts/import-listings.ts.
 */
const MAX_LISTING_ROWS = 300

/** Tables a raw CSV may never be written into. */
const BLOCKED_TABLES = new Set(['adminuser', 'adminrole', 'adminpermission', 'auditlog', 'user', 'loginhistory'])

export async function POST(request: NextRequest) {
  const { session, error } = await verifyAdminPermission(request, 'database_management', 'write')
  if (error) return error

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const table = String(formData.get('table') ?? '')
    const commit = formData.get('commit') === 'true'

    if (!file || !table) {
      return NextResponse.json({ error: 'File and table name required' }, { status: 400 })
    }
    if (formData.get('mode') === 'replace') {
      // Replace ran deleteMany() on the whole table before inserting.
      return NextResponse.json({ error: 'Replace mode has been removed; imports only append' }, { status: 400 })
    }

    let text = await file.text()
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
    const parsed = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: 'greedy', dynamicTyping: false })
    const fatal = parsed.errors.filter((e) => e.type !== 'FieldMismatch')
    if (fatal.length) {
      return NextResponse.json({ error: 'CSV parsing error', details: fatal.slice(0, 10) }, { status: 400 })
    }
    const records = parsed.data
    if (records.length === 0) {
      return NextResponse.json({ error: 'No records found in CSV' }, { status: 400 })
    }

    const misaligned = parsed.errors.filter((e) => e.code === 'TooManyFields').map((e) => (e.row ?? 0) + 2)
    if (misaligned.length) {
      return NextResponse.json(
        {
          error: `Rows ${misaligned.slice(0, 10).join(', ')}${misaligned.length > 10 ? '…' : ''} have more cells than headings. A comma inside an address or maps link is not quoted; re-export the sheet as CSV from Excel/Sheets.`,
        },
        { status: 400 }
      )
    }

    const isListings = table.toLowerCase() === 'property'
    const result = isListings
      ? await importListings(records, parsed.meta.fields ?? [], commit, file.name)
      : await importGeneric(
          table,
          // Other tables keep typed values (numbers, booleans) as before.
          Papa.parse<RawRow>(text, { header: true, skipEmptyLines: 'greedy', dynamicTyping: true }).data,
          commit
        )
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 })

    await createAuditLog({
      adminUserId: session!.id,
      action: 'import_data',
      resource: table,
      details: { commit, totalRecords: records.length, counts: result.counts },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({ success: true, dryRun: !commit, totalRecords: records.length, ...result })
  } catch (err: unknown) {
    console.error('Import error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function importListings(records: RawRow[], headers: string[], commit: boolean, fileName: string) {
  if (records.length > MAX_LISTING_ROWS) {
    return {
      error: `${records.length} rows is too many for a browser upload (max ${MAX_LISTING_ROWS}). Use scripts/import-listings.ts on the server.`,
    }
  }
  const batch = `${fileName.replace(/\.csv$/i, '').replace(/[^\w.-]+/g, '-')}-${new Date().toISOString().slice(0, 10)}`
  resetRunState()
  const counts: Record<string, number> = {}
  const rows: { row: number; id: string; outcome: string; reasons: string; warnings: string; slug?: string }[] = []

  for (let i = 0; i < records.length; i++) {
    const cleaned = cleanRow(records[i], { maxAgeDays: 15 })
    let r: WriteResult
    if (!cleaned.row) r = { outcome: 'rejected', reasons: cleaned.errors, warnings: cleaned.warnings }
    else {
      try {
        r = await writeRow(
          cleaned.row,
          { batch, dryRun: !commit, allowFewPhotos: false, resolveShortLinks: true },
          cleaned.warnings
        )
      } catch (e) {
        r = { outcome: 'rejected', reasons: [`database error: ${(e as Error).message.split('\n').pop()}`], warnings: [] }
      }
    }
    counts[r.outcome] = (counts[r.outcome] ?? 0) + 1
    rows.push({
      row: i + 2,
      id: cleaned.row?.sourceId ?? '',
      outcome: r.outcome,
      reasons: r.reasons.join('; '),
      warnings: r.warnings.join('; '),
      slug: r.slug,
    })
  }
  if (commit) await bumpListingsVersion()
  return { batch, counts, ignoredColumns: unknownColumns(headers), rows }
}

/** Plain append into another table, validated by Prisma, all-or-nothing. */
async function importGeneric(table: string, records: RawRow[], commit: boolean) {
  if (BLOCKED_TABLES.has(table.toLowerCase())) return { error: `Importing into ${table} is not allowed` }
  const delegate = (prisma as unknown as Record<string, { createMany?: (a: unknown) => Promise<{ count: number }> }>)[
    table.charAt(0).toLowerCase() + table.slice(1)
  ]
  if (!delegate?.createMany) return { error: 'Invalid table name' }

  const data = records.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...rest } = r as Record<string, unknown>
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v === '' ? null : v]))
  })
  if (!commit) return { counts: { 'would-import': data.length } }
  try {
    const { count } = await delegate.createMany({ data })
    return { counts: { imported: count } }
  } catch (e) {
    return { error: `Nothing imported: ${(e as Error).message.split('\n').slice(-2).join(' ')}` }
  }
}

export const maxDuration = 300
export const dynamic = 'force-dynamic'
