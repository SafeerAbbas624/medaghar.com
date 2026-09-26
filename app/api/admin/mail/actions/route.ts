import { NextRequest, NextResponse } from 'next/server'
import { mailGuard, mailError } from '@/lib/mail/api'
import { setFlags, moveMessages, deleteMessages, folderFor } from '@/lib/mail/imap'

export const dynamic = 'force-dynamic'

type Action = 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive' | 'spam' | 'notspam' | 'move'

/** { folder, uids: number[], action, dest? } */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const action = body.action as Action
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  const folder = String(body.folder || 'INBOX')
  const uids = (Array.isArray(body.uids) ? body.uids : []).map(Number).filter((n: number) => Number.isInteger(n) && n > 0)
  if (!uids.length) return NextResponse.json({ error: 'No messages selected' }, { status: 400 })
  try {
    switch (action) {
      case 'read':
      case 'unread':
        await setFlags(folder, uids, ['\\Seen'], action === 'read')
        break
      case 'star':
      case 'unstar':
        await setFlags(folder, uids, ['\\Flagged'], action === 'star')
        break
      case 'delete':
        await deleteMessages(folder, uids)
        break
      case 'archive':
        await moveMessages(folder, uids, await folderFor('archive'))
        break
      case 'spam':
        await moveMessages(folder, uids, await folderFor('junk'))
        break
      case 'notspam':
        await moveMessages(folder, uids, await folderFor('inbox'))
        break
      case 'move':
        if (!body.dest) return NextResponse.json({ error: 'No destination folder' }, { status: 400 })
        await moveMessages(folder, uids, String(body.dest))
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return mailError(e)
  }
}
