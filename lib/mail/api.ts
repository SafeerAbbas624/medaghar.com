import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPermission } from '@/lib/admin-auth'

/** Permission check shared by every mailbox route. */
export async function mailGuard(request: NextRequest, action: 'read' | 'write' | 'delete' = 'read') {
  return verifyAdminPermission(request, 'email_management', action)
}

/** Turn an IMAP/SMTP failure into a response the mailbox UI can show. */
export function mailError(e: unknown, fallback = 'Mailbox request failed') {
  const msg = (e as Error)?.message || fallback
  console.error('[mail]', msg)
  const status = /not found/i.test(msg) ? 404 : /not configured|auth/i.test(msg) ? 503 : 500
  return NextResponse.json({ error: msg }, { status })
}

export function intParam(v: string | null, dflt: number, min = 1, max = 1_000_000): number {
  const n = parseInt(v ?? '', 10)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt
}

const EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/

/** "a@x.com, Name <b@y.com>" -> ["a@x.com", "Name <b@y.com>"], throwing on anything malformed. */
export function parseRecipients(v: FormDataEntryValue | null, field: string): string[] {
  const out: string[] = []
  for (const part of String(v ?? '').split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const addr = part.match(/<([^>]+)>\s*$/)?.[1] ?? part
    if (!EMAIL_RE.test(addr)) throw new Error(`${field}: "${part}" is not an email address`)
    out.push(part)
  }
  return out
}
