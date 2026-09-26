import { NextRequest, NextResponse } from 'next/server'
import { mailGuard, mailError, intParam } from '@/lib/mail/api'
import { getMessage } from '@/lib/mail/imap'

export const dynamic = 'force-dynamic'

/** ?folder=INBOX&uid=123&images=1 (show remote images) &peek=1 (do not mark read) */
export async function GET(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  const sp = request.nextUrl.searchParams
  try {
    const message = await getMessage(sp.get('folder') || 'INBOX', intParam(sp.get('uid'), 0), {
      showImages: sp.get('images') === '1',
      markSeen: sp.get('peek') !== '1',
    })
    return NextResponse.json({ message })
  } catch (e) {
    return mailError(e)
  }
}
