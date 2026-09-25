import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPermission } from '@/lib/admin-auth'
import { getJob, stopJob, resumeScrape, deleteJob } from '@/lib/scraper-jobs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await verifyAdminPermission(request, 'database_management', 'read')
  if (error) return error
  try {
    const job = await getJob((await params).id)
    return job ? NextResponse.json({ job }) : NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

/** { action: 'stop' | 'resume' } */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await verifyAdminPermission(request, 'database_management', 'write')
  if (error) return error
  const { id } = await params
  const { action } = await request.json().catch(() => ({}))
  try {
    if (action === 'stop') await stopJob(id)
    else if (action === 'resume') await resumeScrape(id)
    else return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await verifyAdminPermission(request, 'database_management', 'write')
  if (error) return error
  try {
    await deleteJob((await params).id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
