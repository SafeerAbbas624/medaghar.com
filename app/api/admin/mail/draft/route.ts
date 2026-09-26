import { NextRequest, NextResponse } from 'next/server'
import MailComposer from 'nodemailer/lib/mail-composer'
import { mailGuard, mailError, parseRecipients } from '@/lib/mail/api'
import { appendMessage, expungeMessages, folderFor, mailboxAddress, DRAFT_HEADER } from '@/lib/mail/imap'
import { FROM_NAME } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Save the composer to Drafts. Stores what was typed (not the branded,
 * signed, quoted result) plus the composer settings; replaces the previous
 * copy of the same draft.
 */
export async function POST(request: NextRequest) {
  const { error } = await mailGuard(request, 'write')
  if (error) return error
  try {
    const form = await request.formData()
    const lenient = (k: string) => {
      try {
        return parseRecipients(form.get(k), k)
      } catch {
        return String(form.get(k) || '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      }
    }
    const meta = {
      mode: String(form.get('mode') || 'new'),
      sourceFolder: String(form.get('sourceFolder') || ''),
      sourceUid: Number(form.get('sourceUid') || 0),
      signatureId: String(form.get('signatureId') || ''),
      branded: form.get('branded') !== 'false',
      includeQuote: form.get('includeQuote') !== 'false',
    }
    const raw = await new MailComposer({
      from: { name: FROM_NAME, address: mailboxAddress() },
      to: lenient('to'),
      cc: lenient('cc'),
      bcc: lenient('bcc'),
      subject: String(form.get('subject') || ''),
      html: String(form.get('body') || ''),
      headers: { [DRAFT_HEADER]: Buffer.from(JSON.stringify(meta)).toString('base64') },
      keepBcc: true,
    } as ConstructorParameters<typeof MailComposer>[0]).compile().build()

    const drafts = await folderFor('drafts')
    const uid = await appendMessage(drafts, raw, ['\\Draft', '\\Seen'])
    const previous = Number(form.get('draftUid') || 0)
    if (previous) await expungeMessages(drafts, [previous]).catch(() => {})
    return NextResponse.json({ ok: true, uid, savedAt: new Date().toISOString() })
  } catch (e) {
    return mailError(e, 'Could not save the draft')
  }
}
