import { NextRequest, NextResponse } from 'next/server'
import { mailGuard, mailError } from '@/lib/mail/api'
import { syncState } from '@/lib/mail/imap'

export const dynamic = 'force-dynamic'

/** Polled every ~30s by the mailbox for new mail and unread counts. */
export async function GET(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  try {
    return NextResponse.json(await syncState())
  } catch (e) {
    return mailError(e)
  }
}
