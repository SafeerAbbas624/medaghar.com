'use client'

import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types mirrored from lib/mail/imap.ts (client-safe copies)
// ---------------------------------------------------------------------------

export type FolderRole = 'inbox' | 'sent' | 'drafts' | 'junk' | 'trash' | 'archive' | null
export interface Folder {
  path: string
  name: string
  role: FolderRole
  total: number
  unseen: number
}
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
export interface DraftMeta {
  mode: ComposeMode
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
  html: string | null
  text: string | null
  blockedImages: number
  draftMeta: DraftMeta | null
  attachments: { index: number; filename: string; contentType: string; size: number }[]
}
export interface Signature {
  id: string
  name: string
  html: string
  isDefault: boolean
}
export interface Template {
  id: string
  name: string
  category: string
  subject: string | null
  html: string
}
export type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data as T
}

export function addrLabel(a: Addr | null | undefined): string {
  if (!a) return '(unknown)'
  return a.name || a.address
}

export function addrFull(a: Addr): string {
  return a.name ? `${a.name} <${a.address}>` : a.address
}

/** "14:05" today, "Tue" this week, "12 Sep" this year, else "12/09/25". */
export function shortDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const days = (now.getTime() - d.getTime()) / 86400000
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (days < 6) return d.toLocaleDateString('en-GB', { weekday: 'short' })
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })
}

export function fileSize(n: number): string {
  if (n > 1e6) return `${(n / 1e6).toFixed(1)} MB`
  if (n > 1e3) return `${Math.round(n / 1e3)} KB`
  return `${n} B`
}

/** Deterministic avatar colour per sender. */
export function avatarColor(seed: string): string {
  const colors = ['bg-cyan-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-indigo-600', 'bg-teal-600', 'bg-fuchsia-600', 'bg-sky-600']
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return colors[h % colors.length]
}

export function Avatar({ addr, size = 'h-9 w-9 text-sm' }: { addr: Addr | null; size?: string }) {
  const label = addrLabel(addr)
  const initials = label.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${size} ${avatarColor(addr?.address || label)}`}>
      {initials}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Message body: a sandboxed iframe. No scripts can run; links open in a new
// tab; the frame grows to its content so the pane scrolls as one.
// ---------------------------------------------------------------------------

const FRAME_BASE = `<meta charset="utf-8"><base target="_blank">
<style>
  html,body{margin:0;padding:0}
  body{padding:4px 2px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1e293b;word-wrap:break-word;overflow-wrap:anywhere}
  img{max-width:100%;height:auto}
  table{max-width:100%}
  pre{white-space:pre-wrap;font-family:inherit;margin:0}
  blockquote{margin:0 0 0 4px;padding-left:12px;border-left:3px solid #cbd5e1;color:#475569}
</style>`

export function MessageFrame({ html, text, title }: { html: string | null; text: string | null; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const doc = FRAME_BASE + (html ?? `<pre>${(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`)

  useEffect(() => {
    const frame = ref.current
    if (!frame) return
    let ro: ResizeObserver | null = null
    const fit = () => {
      const body = frame.contentDocument?.body
      if (body) frame.style.height = `${Math.max(120, body.scrollHeight + 8)}px`
    }
    const onLoad = () => {
      fit()
      const body = frame.contentDocument?.body
      if (body && 'ResizeObserver' in window) {
        ro = new ResizeObserver(fit)
        ro.observe(body)
      }
    }
    frame.addEventListener('load', onLoad)
    return () => {
      frame.removeEventListener('load', onLoad)
      ro?.disconnect()
    }
  }, [doc])

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={doc}
      // allow-same-origin only lets the parent measure the height; with no
      // allow-scripts nothing in the email can execute.
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className="block w-full border-0"
      style={{ height: 200 }}
    />
  )
}
