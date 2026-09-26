import { NextRequest, NextResponse } from 'next/server'
import { mailGuard, mailError } from '@/lib/mail/api'
import { listFolders, mailboxAddress } from '@/lib/mail/imap'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  try {
    return NextResponse.json({ folders: await listFolders(), address: mailboxAddress() })
  } catch (e) {
    return mailError(e)
  }
}
