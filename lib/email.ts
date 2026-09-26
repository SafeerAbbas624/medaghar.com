import nodemailer from 'nodemailer'
import MailComposer from 'nodemailer/lib/mail-composer'
import type Mail from 'nodemailer/lib/mailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
}

export interface SendEmailOptions {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  subject: string
  text?: string
  html?: string
  /** Threading headers for replies. */
  inReplyTo?: string
  references?: string | string[]
  attachments?: Mail.Attachment[]
  /** Save a copy to the mailbox's Sent folder (default true). */
  saveToSent?: boolean
}

/** Every email goes out as "MedaGhar <info@medaghar.com>", not a bare address. */
export const FROM_NAME = 'MedaGhar'

// Create email transporter
export function createEmailTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  })
}

const list = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean)

/**
 * Send an email and keep a copy in the Sent folder.
 *
 * SMTP never stores what it sends, so sign-up codes, password resets and
 * replies from the ops console were invisible in the mailbox. The message is
 * built once; that exact message is sent and appended to Sent, so the copy
 * matches what the recipient got, Message-ID included. The Sent copy is
 * best-effort and never delays or fails the send.
 */
export async function sendEmail(config: EmailConfig, options: SendEmailOptions) {
  const transporter = createEmailTransporter(config)

  const mail: Mail.Options = {
    from: { name: FROM_NAME, address: config.user },
    to: list(options.to),
    cc: list(options.cc),
    bcc: list(options.bcc),
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
    inReplyTo: options.inReplyTo,
    references: options.references,
    attachments: options.attachments,
  }

  // Bcc stays out of the message itself: it is delivered via the SMTP envelope
  // below, and a Bcc header would be visible to everyone if a server kept it.
  const raw = await new MailComposer({ ...mail, keepBcc: false } as Mail.Options).compile().build()
  const envelope = {
    from: config.user,
    to: [...list(options.to), ...list(options.cc), ...list(options.bcc)],
  }
  const info = await transporter.sendMail({ envelope, raw })

  if (options.saveToSent !== false) {
    void saveSentCopy(raw).catch((e) => console.error('Could not save to Sent (mail was delivered):', e?.message ?? e))
  }
  return { ...info, raw }
}

async function saveSentCopy(raw: Buffer) {
  // Imported lazily: most callers never need the IMAP client loaded.
  const { appendMessage, folderFor } = await import('@/lib/mail/imap')
  await appendMessage(await folderFor('sent'), raw, ['\\Seen'])
}

// Verify email configuration
export async function verifyEmailConfig(config: EmailConfig): Promise<boolean> {
  try {
    const transporter = createEmailTransporter(config)
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email verification failed:', error)
    return false
  }
}

// Default Hostinger configuration (to be customized)
export const defaultHostingerConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true' || true,
  user: process.env.EMAIL_USER || 'info@medaghar.com',
  password: process.env.EMAIL_PASSWORD || '',
}
