import Imap from 'imap'
import { simpleParser } from 'mailparser'

export interface EmailConfig {
  host: string
  port: number
  user: string
  password: string
  tls: boolean
}

export interface Email {
  id: string
  from: string
  to: string[]
  subject: string
  date: Date
  text?: string
  html?: string
  attachments: Array<{
    filename: string
    contentType: string
    size: number
  }>
  flags: string[]
}

// Fetch emails from a specific folder
export async function fetchEmails(
  config: EmailConfig,
  folder: string = 'INBOX',
  limit: number = 50
): Promise<Email[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
    })

    const emails: Email[] = []

    imap.once('ready', () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          imap.end()
          return reject(err)
        }

        const totalMessages = box.messages.total
        if (totalMessages === 0) {
          imap.end()
          return resolve([])
        }

        // Fetch the most recent emails
        const start = Math.max(1, totalMessages - limit + 1)
        const end = totalMessages

        const fetch = imap.seq.fetch(`${start}:${end}`, {
          bodies: '',
          struct: true,
        })

        fetch.on('message', (msg, seqno) => {
          let buffer = ''
          let attributes: any = null

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8')
            })
          })

          msg.once('attributes', (attrs) => {
            attributes = attrs
          })

          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(buffer)

              emails.push({
                id: `${seqno}`,
                from: parsed.from?.text || 'Unknown',
                to: Array.isArray(parsed.to) ? parsed.to.map(t => t.text) : (parsed.to?.text ? [parsed.to.text] : []),
                subject: parsed.subject || '(No Subject)',
                date: parsed.date || new Date(),
                text: parsed.text,
                html: parsed.html || undefined,
                attachments: (parsed.attachments || []).map((att) => ({
                  filename: att.filename || 'unnamed',
                  contentType: att.contentType || 'application/octet-stream',
                  size: att.size || 0,
                })),
                flags: attributes?.flags || [],
              })
            } catch (error) {
              console.error('Error parsing email:', error)
            }
          })
        })

        fetch.once('error', (err) => {
          imap.end()
          reject(err)
        })

        fetch.once('end', () => {
          imap.end()
        })
      })
    })

    imap.once('error', (err) => {
      reject(err)
    })

    imap.once('end', () => {
      // Sort by date descending (newest first)
      emails.sort((a, b) => b.date.getTime() - a.date.getTime())
      resolve(emails)
    })

    imap.connect()
  })
}

// Get list of available folders
export async function getFolders(config: EmailConfig): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
    })

    imap.once('ready', () => {
      imap.getBoxes((err, boxes) => {
        imap.end()
        if (err) return reject(err)
        
        const folderNames = Object.keys(boxes)
        resolve(folderNames)
      })
    })

    imap.once('error', reject)
    imap.connect()
  })
}

