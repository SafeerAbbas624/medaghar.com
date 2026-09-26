import { NextRequest, NextResponse } from 'next/server'
import { mailGuard, mailError, intParam } from '@/lib/mail/api'
import { listMessages } from '@/lib/mail/imap'

export const dynamic = 'force-dynamic'

/** ?folder=INBOX&page=1&q=search&unread=1 */
export async function GET(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  const sp = request.nextUrl.searchParams
  try {
    const res = await listMessages(sp.get('folder') || 'INBOX', {
      page: intParam(sp.get('page'), 1),
      pageSize: intParam(sp.get('pageSize'), 50, 10, 100),
      query: (sp.get('q') || '').slice(0, 200),
      unreadOnly: sp.get('unread') === '1',
    })
    return NextResponse.json(res)
  } catch (e) {
    return mailError(e)
  }
}
