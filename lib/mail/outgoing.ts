/**
 * Turn the composer's form into a ready-to-send message: recipients,
 * branded HTML with signature and quoted original, plain text, reply
 * threading headers, and attachments (uploads plus a forwarded message's own).
 */

import type Mail from 'nodemailer/lib/mailer'
import { prisma } from '@/lib/prisma'
import { parseRecipients } from '@/lib/mail/api'
import { getMessage, getAttachment } from '@/lib/mail/imap'
import { buildOutgoingHtml, htmlToText, quoteBlock } from '@/lib/mail/compose'

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024

export type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward'

export interface Outgoing {
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  html: string
  text: string
  inReplyTo?: string
  references?: string[]
  attachments: Mail.Attachment[]
  /** Original message to flag as answered once sent. */
  answered?: { folder: string; uid: number }
}

export async function buildOutgoing(form: FormData, { requireRecipients }: { requireRecipients: boolean }): Promise<Outgoing> {
  const to = parseRecipients(form.get('to'), 'To')
  const cc = parseRecipients(form.get('cc'), 'Cc')
  const bcc = parseRecipients(form.get('bcc'), 'Bcc')
  if (requireRecipients && !to.length && !cc.length && !bcc.length) throw new Error('Add at least one recipient')
  if (to.length + cc.length + bcc.length > 50) throw new Error('At most 50 recipients per message')

  const subject = String(form.get('subject') || '').trim().slice(0, 300)
  const bodyHtml = String(form.get('body') || '')
  const branded = form.get('branded') !== 'false'
  const mode = (String(form.get('mode') || 'new') as ComposeMode)
  const includeQuote = form.get('includeQuote') !== 'false'

  const sigId = String(form.get('signatureId') || '')
  const signature = sigId ? await prisma.emailSignature.findUnique({ where: { id: sigId } }) : null

  // Reply / forward: quote the original and thread the reply to it.
  let quotedHtml: string | null = null
  let inReplyTo: string | undefined
  let references: string[] | undefined
  let answered: Outgoing['answered']
  const attachments: Mail.Attachment[] = []
  const srcFolder = String(form.get('sourceFolder') || '')
  const srcUid = Number(form.get('sourceUid') || 0)
  if (mode !== 'new' && srcFolder && srcUid) {
    const orig = await getMessage(srcFolder, srcUid, { showImages: true, markSeen: false })
    const from = orig.from ? (orig.from.name ? `${orig.from.name} <${orig.from.address}>` : orig.from.address) : 'unknown sender'
    if (includeQuote) quotedHtml = quoteBlock({ date: orig.date, from, html: orig.html, text: orig.text })
    if (mode === 'forward') {
      for (const a of orig.attachments) {
        const full = await getAttachment(srcFolder, srcUid, a.index)
        attachments.push({ filename: full.filename, content: full.content, contentType: full.contentType })
      }
    } else if (orig.messageId) {
      inReplyTo = orig.messageId
      references = [...orig.references, orig.messageId]
      answered = { folder: srcFolder, uid: srcUid }
    }
  }

  for (const f of form.getAll('files')) {
    if (typeof f === 'string' || !f.size) continue
    attachments.push({ filename: f.name, content: Buffer.from(await f.arrayBuffer()), contentType: f.type || undefined })
  }
  const bytes = attachments.reduce((n, a) => n + (Buffer.isBuffer(a.content) ? a.content.length : 0), 0)
  if (bytes > MAX_ATTACHMENT_BYTES) throw new Error('Attachments are larger than 20 MB in total')

  const html = buildOutgoingHtml({ subject: subject || '(no subject)', bodyHtml, signatureHtml: signature?.html, quotedHtml, branded })
  return { to, cc, bcc, subject, html, text: htmlToText(html), inReplyTo, references, attachments, answered }
}
