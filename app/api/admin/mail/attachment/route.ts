import { NextRequest, NextResponse } from 'next/server'
import { mailGuard, mailError, intParam } from '@/lib/mail/api'
import { getAttachment } from '@/lib/mail/imap'

export const dynamic = 'force-dynamic'

/** ?folder=INBOX&uid=123&i=0 — downloads, never renders inline (attachments are untrusted). */
export async function GET(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  const sp = request.nextUrl.searchParams
  try {
    const a = await getAttachment(sp.get('folder') || 'INBOX', intParam(sp.get('uid'), 0), intParam(sp.get('i'), 0, 0))
    const name = a.filename.replace(/[^\w.\- ()]/g, '_')
    return new NextResponse(new Uint8Array(a.content), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(a.filename)}`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e) {
    return mailError(e)
  }
}
