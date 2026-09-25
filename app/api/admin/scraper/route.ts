import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPermission } from '@/lib/admin-auth'
import { createAuditLog } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'
import { listJobs, startScrape, startCompare, SCRAPER_SITES, type ScrapeParams } from '@/lib/scraper-jobs'

export const dynamic = 'force-dynamic'

const clamp = (v: unknown, min: number, max: number, dflt: number) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt
}
const list = (v: unknown) =>
  (Array.isArray(v) ? v : String(v ?? '').split(/[,\n]/)).map((s) => String(s).trim()).filter(Boolean)

export async function GET(request: NextRequest) {
  const { error } = await verifyAdminPermission(request, 'database_management', 'read')
  if (error) return error
  return NextResponse.json({ jobs: await listJobs(), sites: SCRAPER_SITES })
}

/** Start a scrape (JSON body) or a comparison (multipart, with your CSV). */
export async function POST(request: NextRequest) {
  const { session, error } = await verifyAdminPermission(request, 'database_management', 'write')
  if (error) return error

  try {
    let id: string
    let details: unknown
    if ((request.headers.get('content-type') ?? '').startsWith('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('mine') as File | null
      if (!file) return NextResponse.json({ error: 'Choose your listings CSV' }, { status: 400 })
      const params = {
        scrapeJobs: list(form.get('scrapeJobs')).filter((s) => /^[a-z0-9-]{8,64}$/.test(s)),
        minSites: clamp(form.get('minSites'), 1, 6, 3),
        photos: clamp(form.get('photos'), 0, 5, 2),
        countMirrors: form.get('countMirrors') === 'true',
        mineName: file.name.slice(0, 80),
      }
      id = await startCompare(params, Buffer.from(await file.arrayBuffer()))
      details = params
    } else {
      const b = await request.json()
      const cities = list(b.cities)
      if (!cities.length || cities.some((c) => !/^[A-Za-z][A-Za-z .'-]{1,40}$/.test(c))) {
        return NextResponse.json({ error: 'Cities: names separated by commas, letters only' }, { status: 400 })
      }
      const sites = list(b.sites).filter((s) => (SCRAPER_SITES as readonly string[]).includes(s))
      if (!sites.length) return NextResponse.json({ error: 'Pick at least one site' }, { status: 400 })
      const cityIds = list(b.cityIds)
      if (cityIds.some((c) => !/^[A-Za-z][A-Za-z .'-]{1,40}=\d{1,7}$/.test(c))) {
        return NextResponse.json({ error: 'City ids look like Sialkot=480' }, { status: 400 })
      }
      const olxUrls = list(b.olxUrls)
      if (olxUrls.some((u) => !/^https:\/\/(www\.)?olx\.com\.pk\/\S+$/.test(u))) {
        return NextResponse.json({ error: 'OLX URLs must start with https://www.olx.com.pk/' }, { status: 400 })
      }
      const params: ScrapeParams = {
        cities,
        sites,
        days: clamp(b.days, 1, 90, 15),
        delay: clamp(b.delay, 1, 60, 3),
        photos: clamp(b.photos, 0, 5, 1),
        photoDelay: clamp(b.photoDelay, 0.1, 10, 0.5),
        maxPages: clamp(b.maxPages, 1, 5000, 2000),
        limit: clamp(b.limit, 0, 1_000_000, 0),
        cityIds,
        olxUrls,
      }
      id = await startScrape(params)
      details = params
    }

    await createAuditLog({
      adminUserId: session!.id,
      action: 'scraper_start',
      resource: 'scraper',
      details: { id, ...(details as object) },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })
    return NextResponse.json({ id })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
