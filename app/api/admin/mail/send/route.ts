import { NextRequest, NextResponse } from 'next/server'
import { mailGuard, mailError } from '@/lib/mail/api'
import { buildOutgoing } from '@/lib/mail/outgoing'
import { sendEmail, defaultHostingerConfig } from '@/lib/email'
import { setFlags, expungeMessages, folderFor } from '@/lib/mail/imap'
import { createAuditLog } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/** Multipart form from the composer. The sent copy lands in Sent via sendEmail. */
export async function POST(request: NextRequest) {
  const { session, error } = await mailGuard(request, 'write')
  if (error) return error
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Could not read the message' }, { status: 400 })
  }

  let out
  try {
    out = await buildOutgoing(form, { requireRecipients: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  try {
    const info = await sendEmail(defaultHostingerConfig, {
      to: out.to,
      cc: out.cc,
      bcc: out.bcc,
      subject: out.subject || '(no subject)',
      html: out.html,
      text: out.text,
      inReplyTo: out.inReplyTo,
      references: out.references,
      attachments: out.attachments,
    })

    // Housekeeping never fails the send.
    if (out.answered) await setFlags(out.answered.folder, [out.answered.uid], ['\\Answered'], true).catch(() => {})
    const draftUid = Number(form.get('draftUid') || 0)
    if (draftUid) await expungeMessages(await folderFor('drafts'), [draftUid]).catch(() => {})

    await createAuditLog({
      adminUserId: session!.id,
      action: 'send_email',
      resource: 'email',
      details: { to: out.to, cc: out.cc, bcc: out.bcc.length, subject: out.subject, messageId: info.messageId },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    }).catch(() => {})

    return NextResponse.json({ ok: true, messageId: info.messageId })
  } catch (e) {
    return mailError(e, 'Sending failed')
  }
}
