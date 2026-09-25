import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { verifyAdminPermission } from '@/lib/admin-auth'
import { openJobFile } from '@/lib/scraper-jobs'

export const dynamic = 'force-dynamic'

/** ?file=competitors.csv | mine.matched.csv | mine.skip-ids.csv | log.txt */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await verifyAdminPermission(request, 'database_management', 'read')
  if (error) return error
  const { id } = await params
  const name = request.nextUrl.searchParams.get('file') ?? ''
  let stream
  try {
    stream = openJobFile(id, name)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!stream) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      'Content-Type': name.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${id}-${name}"`,
      'Cache-Control': 'no-store',
    },
  })
}
