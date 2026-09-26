/**
 * Company mailbox (info@medaghar.com) over IMAP, for the ops console.
 *
 * One connection per server process is reused across requests. Logging in to
 * Hostinger takes about a second, and doing that on every click made the old
 * inbox feel broken. The connection is dropped after a few idle minutes and
 * re-opened on demand. Messages are addressed by UID; sequence numbers shift
 * whenever mail arrives or is deleted.
 */

import { ImapFlow, type FetchMessageObject, type MessageStructureObject } from 'imapflow'
import { simpleParser, type AddressObject } from 'mailparser'

const IDLE_CLOSE_MS = 4 * 60 * 1000

function config() {
  return {
    host: process.env.EMAIL_IMAP_HOST || 'imap.hostinger.com',
    port: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
    secure: true,
    auth: { user: process.env.EMAIL_USER || '', pass: process.env.EMAIL_PASSWORD || '' },
    logger: false as const,
    emitLogs: false,
  }
}

export function mailboxAddress(): string {
  return process.env.EMAIL_USER || 'info@medaghar.com'
}

let client: ImapFlow | null = null
let connecting: Promise<ImapFlow> | null = null
let idleTimer: NodeJS.Timeout | null = null

function touch() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    const c = client
    client = null
    c?.logout().catch(() => c.close())
  }, IDLE_CLOSE_MS)
  idleTimer.unref?.()
}

async function getClient(): Promise<ImapFlow> {
  if (client?.usable) {
    touch()
    return client
  }
  if (!connecting) {
    connecting = (async () => {
      const cfg = config()
      if (!cfg.auth.user || !cfg.auth.pass) throw new Error('Mailbox is not configured (EMAIL_USER / EMAIL_PASSWORD)')
      const c = new ImapFlow(cfg)
      c.on('error', () => {
        if (client === c) client = null
      })
      c.on('close', () => {
        if (client === c) client = null
      })
      await c.connect()
      client = c
      touch()
      return c
    })().finally(() => {
      connecting = null
    })
  }
  return connecting
}

/** Run `fn` with `path` selected, holding the mailbox lock. Retries once on a dropped connection. */
async function withMailbox<T>(path: string, fn: (c: ImapFlow) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const c = await getClient()
    try {
      const lock = await c.getMailboxLock(path)
      try {
        return await fn(c)
      } finally {
        lock.release()
      }
    } catch (e) {
      const dropped = !c.usable
      if (dropped && attempt === 0) {
        client = null
        continue
      }
      throw e
    }
  }
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export type FolderRole = 'inbox' | 'sent' | 'drafts' | 'junk' | 'trash' | 'archive' | null

export interface Folder {
  path: string
  name: string
  role: FolderRole
  total: number
  unseen: number
}

const ROLE_ORDER: FolderRole[] = ['inbox', 'drafts', 'sent', 'archive', 'junk', 'trash']
const ROLE_BY_USE: Record<string, FolderRole> = {
  '\\Inbox': 'inbox',
  '\\Sent': 'sent',
  '\\Drafts': 'drafts',
  '\\Junk': 'junk',
  '\\Trash': 'trash',
  '\\Archive': 'archive',
}
const ROLE_LABEL: Record<string, string> = {
  inbox: 'Inbox',
  sent: 'Sent',
  drafts: 'Drafts',
  junk: 'Spam',
  trash: 'Trash',
  archive: 'Archive',
}

let roleCache: Partial<Record<Exclude<FolderRole, null>, string>> | null = null

export async function listFolders(): Promise<Folder[]> {
  const c = await getClient()
  const list = await c.list({ statusQuery: { messages: true, unseen: true } })
  const roles: Partial<Record<Exclude<FolderRole, null>, string>> = {}
  const folders = list
    .filter((f) => !f.flags?.has('\\Noselect'))
    .map((f): Folder => {
      const role = f.path.toUpperCase() === 'INBOX' ? 'inbox' : ROLE_BY_USE[f.specialUse ?? ''] ?? null
      if (role) roles[role] = f.path
      return {
        path: f.path,
        name: role ? ROLE_LABEL[role] : f.name,
        role,
        total: f.status?.messages ?? 0,
        unseen: f.status?.unseen ?? 0,
      }
    })
  roleCache = roles
  return folders.sort((a, b) => {
    const ra = a.role ? ROLE_ORDER.indexOf(a.role) : 99
    const rb = b.role ? ROLE_ORDER.indexOf(b.role) : 99
    return ra - rb || a.name.localeCompare(b.name)
  })
}

/** Path of a special folder (Sent, Trash…), creating Archive on first use. */
export async function folderFor(role: Exclude<FolderRole, null>): Promise<string> {
  if (!roleCache?.[role]) await listFolders()
  const found = roleCache?.[role]
  if (found) return found
  const fallback: Record<string, string> = {
    inbox: 'INBOX',
    sent: 'INBOX.Sent',
    drafts: 'INBOX.Drafts',
    junk: 'INBOX.Junk',
    trash: 'INBOX.Trash',
    archive: 'INBOX.Archive',
  }
  if (role === 'archive') {
    const c = await getClient()
    await c.mailboxCreate(fallback.archive).catch(() => {})
    roleCache = { ...roleCache, archive: fallback.archive }
  }
  return fallback[role]
}

// ---------------------------------------------------------------------------
// Message lists
// ---------------------------------------------------------------------------

export interface Addr {
  name: string
  address: string
}

export interface MessageSummary {
  uid: number
  subject: string
  from: Addr | null
  to: Addr[]
  date: string
  seen: boolean
  flagged: boolean
  answered: boolean
  draft: boolean
  hasAttachments: boolean
  size: number
}

function hasAttachment(node?: MessageStructureObject): boolean {
  if (!node) return false
  if (node.disposition === 'attachment') return true
  if (node.type && !/^(text|multipart)\//.test(node.type) && node.disposition !== 'inline') return true
  return (node.childNodes ?? []).some(hasAttachment)
}

function toSummary(m: FetchMessageObject): MessageSummary {
  const env = m.envelope
  const a = (x?: { name?: string; address?: string }): Addr => ({ name: x?.name ?? '', address: x?.address ?? '' })
  const flags = m.flags ?? new Set<string>()
  return {
    uid: m.uid,
    subject: env?.subject || '(no subject)',
    from: env?.from?.[0] ? a(env.from[0]) : null,
    to: (env?.to ?? []).map(a),
    date: (env?.date ?? m.internalDate ?? new Date()).toString() === 'Invalid Date'
      ? new Date().toISOString()
      : new Date((env?.date ?? m.internalDate) as Date).toISOString(),
    seen: flags.has('\\Seen'),
    flagged: flags.has('\\Flagged'),
    answered: flags.has('\\Answered'),
    draft: flags.has('\\Draft'),
    hasAttachments: hasAttachment(m.bodyStructure),
    size: m.size ?? 0,
  }
}

const SUMMARY_QUERY = { uid: true, flags: true, envelope: true, bodyStructure: true, size: true, internalDate: true }

/**
 * One page of a folder, newest first. With `query`, searches subject, sender,
 * recipients and body on the server.
 */
export async function listMessages(
  path: string,
  { page = 1, pageSize = 50, query = '', unreadOnly = false }: { page?: number; pageSize?: number; query?: string; unreadOnly?: boolean }
): Promise<{ total: number; messages: MessageSummary[] }> {
  return withMailbox(path, async (c) => {
    const box = c.mailbox
    const exists = box && typeof box !== 'boolean' ? box.exists : 0
    if (!exists) return { total: 0, messages: [] }

    let uids: number[] | null = null
    if (query.trim() || unreadOnly) {
      const q = query.trim()
      const criteria: Record<string, unknown> = q
        ? { or: [{ subject: q }, { from: q }, { to: q }, { body: q }] }
        : {}
      if (unreadOnly) criteria.seen = false
      const found = await c.search(Object.keys(criteria).length ? criteria : { all: true }, { uid: true })
      uids = (found || []).sort((a, b) => b - a)
    }

    let range: string
    let total: number
    if (uids) {
      total = uids.length
      const slice = uids.slice((page - 1) * pageSize, page * pageSize)
      if (!slice.length) return { total, messages: [] }
      range = slice.join(',')
    } else {
      total = exists
      const end = exists - (page - 1) * pageSize
      if (end < 1) return { total, messages: [] }
      const start = Math.max(1, end - pageSize + 1)
      range = `${start}:${end}`
    }

    const out: MessageSummary[] = []
    for await (const m of c.fetch(range, SUMMARY_QUERY, { uid: !!uids })) out.push(toSummary(m))
    out.sort((a, b) => b.uid - a.uid)
    return { total, messages: out }
  })
}

// ---------------------------------------------------------------------------
// One message
// ---------------------------------------------------------------------------

/** Composer settings saved with a draft, so reopening it restores the composer exactly. */
export const DRAFT_HEADER = 'X-MedaGhar-Draft'
export interface DraftMeta {
  mode: 'new' | 'reply' | 'replyAll' | 'forward'
  sourceFolder: string
  sourceUid: number
  signatureId: string
  branded: boolean
  includeQuote: boolean
}

export interface FullMessage extends MessageSummary {
  cc: Addr[]
  bcc: Addr[]
  replyTo: Addr[]
  messageId: string | null
  references: string[]
  html: string | null
  text: string | null
  blockedImages: number
  draftMeta: DraftMeta | null
  attachments: { index: number; filename: string; contentType: string; size: number }[]
}

function addrs(v?: AddressObject | AddressObject[]): Addr[] {
  const list = Array.isArray(v) ? v : v ? [v] : []
  return list.flatMap((o) => o.value.map((x) => ({ name: x.name || '', address: x.address || '' })))
}

/**
 * Remote images are swapped out unless asked for: they let senders see when
 * and where a message was opened. Inline (cid:) images arrive as data: URIs
 * from the parser and are always shown.
 */
function blockRemoteImages(html: string): { html: string; blocked: number } {
  let blocked = 0
  const out = html
    .replace(/(<img\b[^>]*?)\ssrc\s*=\s*(["'])(https?:\/\/[^"']*)\2/gi, (_m, pre, q, url) => {
      blocked++
      return `${pre} src=${q}data:image/gif;base64,R0lGODlhAQABAAAAACw=${q} data-blocked-src=${q}${url}${q}`
    })
    .replace(/url\(\s*(["']?)https?:\/\/[^)]*\)/gi, () => {
      blocked++
      return 'none'
    })
  return { html: out, blocked }
}

async function fetchSource(c: ImapFlow, uid: number): Promise<{ source: Buffer; flags: Set<string>; msg: FetchMessageObject }> {
  const msg = await c.fetchOne(String(uid), { uid: true, source: true, flags: true, envelope: true, bodyStructure: true, size: true, internalDate: true }, { uid: true })
  if (!msg || !msg.source) throw new Error('Message not found')
  return { source: msg.source, flags: msg.flags ?? new Set(), msg }
}

export async function getMessage(path: string, uid: number, { showImages = false, markSeen = true } = {}): Promise<FullMessage> {
  return withMailbox(path, async (c) => {
    const { source, msg } = await fetchSource(c, uid)
    const p = await simpleParser(source)
    if (markSeen && !msg.flags?.has('\\Seen')) {
      await c.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true })
      msg.flags?.add('\\Seen')
    }
    let html = typeof p.html === 'string' ? p.html : null
    let blocked = 0
    if (html && !showImages) {
      const r = blockRemoteImages(html)
      html = r.html
      blocked = r.blocked
    }
    const refs = Array.isArray(p.references) ? p.references : p.references ? [p.references] : []
    let draftMeta: DraftMeta | null = null
    const dh = p.headers.get(DRAFT_HEADER.toLowerCase())
    if (typeof dh === 'string') {
      try {
        draftMeta = JSON.parse(Buffer.from(dh, 'base64').toString('utf8'))
      } catch {
        /* not ours */
      }
    }
    return {
      ...toSummary(msg),
      subject: p.subject || '(no subject)',
      cc: addrs(p.cc),
      bcc: addrs(p.bcc),
      replyTo: addrs(p.replyTo),
      messageId: p.messageId ?? null,
      references: refs,
      html,
      text: p.text ?? null,
      blockedImages: blocked,
      draftMeta,
      attachments: p.attachments
        .map((a, index) => ({ index, filename: a.filename || `attachment-${index + 1}`, contentType: a.contentType, size: a.size, related: a.related }))
        .filter((a) => !a.related)
        .map(({ related: _r, ...a }) => a),
    }
  })
}

export async function getAttachment(path: string, uid: number, index: number) {
  return withMailbox(path, async (c) => {
    const { source } = await fetchSource(c, uid)
    const p = await simpleParser(source)
    const a = p.attachments[index]
    if (!a) throw new Error('Attachment not found')
    return { filename: a.filename || `attachment-${index + 1}`, contentType: a.contentType, content: a.content }
  })
}

/** Full RFC 822 source, for forwarding with attachments. */
export async function getRawMessage(path: string, uid: number): Promise<Buffer> {
  return withMailbox(path, async (c) => (await fetchSource(c, uid)).source)
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function setFlags(path: string, uids: number[], flags: string[], add: boolean) {
  if (!uids.length) return
  return withMailbox(path, (c) =>
    add
      ? c.messageFlagsAdd(uids.join(','), flags, { uid: true })
      : c.messageFlagsRemove(uids.join(','), flags, { uid: true })
  )
}

export async function moveMessages(path: string, uids: number[], dest: string) {
  if (!uids.length || path === dest) return
  return withMailbox(path, (c) => c.messageMove(uids.join(','), dest, { uid: true }))
}

/** Delete = move to Trash; deleting from Trash (or Spam) removes it for good. */
export async function deleteMessages(path: string, uids: number[]) {
  if (!uids.length) return
  const trash = await folderFor('trash')
  const junk = await folderFor('junk')
  if (path === trash || path === junk) {
    return withMailbox(path, (c) => c.messageDelete(uids.join(','), { uid: true }))
  }
  return moveMessages(path, uids, trash)
}

/** Remove for good, bypassing Trash (used for superseded drafts). */
export async function expungeMessages(path: string, uids: number[]) {
  if (!uids.length) return
  return withMailbox(path, (c) => c.messageDelete(uids.join(','), { uid: true }))
}

/** Store a message (a sent copy or a draft). Returns the new UID when the server reports it. */
export async function appendMessage(path: string, raw: Buffer | string, flags: string[]): Promise<number | null> {
  const c = await getClient()
  const res = await c.append(path, raw, flags)
  return res && typeof res === 'object' && 'uid' in res ? (res.uid as number) ?? null : null
}

/** Cheap poll for auto-sync: unread count per folder plus the inbox's next UID. */
export async function syncState(): Promise<{ folders: Record<string, number>; inboxUidNext: number; inboxTotal: number }> {
  const c = await getClient()
  const list = await c.list({ statusQuery: { unseen: true } })
  const inbox = await c.status('INBOX', { uidNext: true, messages: true })
  const folders: Record<string, number> = {}
  for (const f of list) folders[f.path] = f.status?.unseen ?? 0
  return { folders, inboxUidNext: inbox.uidNext ?? 0, inboxTotal: inbox.messages ?? 0 }
}
