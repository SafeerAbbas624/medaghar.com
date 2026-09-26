'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaPaperPlane, FaTimes, FaPaperclip, FaEye, FaSave, FaTrash, FaChevronDown } from 'react-icons/fa'
import RichEditor, { type RichEditorHandle } from './RichEditor'
import {
  api,
  addrFull,
  fileSize,
  MessageFrame,
  type ComposeMode,
  type FullMessage,
  type Signature,
  type Template,
} from './shared'

export interface ComposeRequest {
  mode: ComposeMode
  /** The message being replied to / forwarded, and where it lives. */
  source?: { folder: string; message: FullMessage }
  /** An existing draft being edited (in the Drafts folder). */
  draft?: { uid: number; message: FullMessage }
  /** Pre-filled recipient for a fresh message. */
  to?: string
}

const withPrefix = (prefix: string, subject: string) =>
  new RegExp(`^${prefix}:`, 'i').test(subject.trim()) ? subject : `${prefix}: ${subject}`

export default function Composer({
  request,
  mailbox,
  draftsFolder,
  signatures,
  templates,
  onClose,
  onSent,
  onDraftSaved,
}: {
  request: ComposeRequest
  mailbox: string
  draftsFolder: string
  signatures: Signature[]
  templates: Template[]
  onClose: () => void
  onSent: (message: string) => void
  onDraftSaved: () => void
}) {
  const { mode, source, draft } = request
  const orig = source?.message
  const meta = draft?.message.draftMeta

  // ---- initial values --------------------------------------------------------
  const initial = useMemo(() => {
    const me = mailbox.toLowerCase()
    const notMe = (a: { address: string }) => a.address && a.address.toLowerCase() !== me
    if (draft) {
      const m = draft.message
      return {
        to: m.to.map(addrFull).join(', '),
        cc: m.cc.map(addrFull).join(', '),
        bcc: m.bcc.map(addrFull).join(', '),
        subject: m.subject === '(no subject)' ? '' : m.subject,
        body: m.html ?? '',
      }
    }
    if (orig && (mode === 'reply' || mode === 'replyAll')) {
      const replyTo = orig.replyTo.length ? orig.replyTo : orig.from ? [orig.from] : []
      const others = mode === 'replyAll' ? [...orig.to, ...orig.cc].filter(notMe) : []
      const toList = [...replyTo, ...others.filter((o) => !replyTo.some((r) => r.address === o.address))]
      return {
        to: replyTo.filter(notMe).map(addrFull).join(', ') || replyTo.map(addrFull).join(', '),
        cc: mode === 'replyAll' ? toList.slice(replyTo.length).map(addrFull).join(', ') : '',
        bcc: '',
        subject: withPrefix('Re', orig.subject),
        body: '',
      }
    }
    if (orig && mode === 'forward') {
      return { to: '', cc: '', bcc: '', subject: withPrefix('Fwd', orig.subject), body: '' }
    }
    return { to: request.to ?? '', cc: '', bcc: '', subject: '', body: '' }
  }, [draft, orig, mode, mailbox, request.to])

  const [to, setTo] = useState(initial.to)
  const [cc, setCc] = useState(initial.cc)
  const [bcc, setBcc] = useState(initial.bcc)
  const [showCc, setShowCc] = useState(!!(initial.cc || initial.bcc))
  const [subject, setSubject] = useState(initial.subject)
  const defaultSig = signatures.find((s) => s.isDefault) ?? signatures[0]
  const [signatureId, setSignatureId] = useState(meta ? meta.signatureId : defaultSig?.id ?? '')
  const [branded, setBranded] = useState(meta ? meta.branded : true)
  const [includeQuote, setIncludeQuote] = useState(meta ? meta.includeQuote : true)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState<null | 'send' | 'draft' | 'preview'>(null)
  const [err, setErr] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [draftUid, setDraftUid] = useState<number | null>(draft?.uid ?? null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [tplOpen, setTplOpen] = useState(false)
  const editor = useRef<RichEditorHandle>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // Where the original lives, for quoting/threading (a reopened draft keeps it).
  const effMode: ComposeMode = meta?.mode ?? mode
  const srcFolder = meta?.sourceFolder || source?.folder || ''
  const srcUid = meta?.sourceUid || orig?.uid || 0

  const markDirty = useCallback(() => setDirty(true), [])

  const formData = useCallback(() => {
    const fd = new FormData()
    fd.set('to', to)
    fd.set('cc', cc)
    fd.set('bcc', bcc)
    fd.set('subject', subject)
    fd.set('body', editor.current?.getHtml() ?? '')
    fd.set('signatureId', signatureId)
    fd.set('branded', String(branded))
    fd.set('includeQuote', String(includeQuote))
    fd.set('mode', effMode)
    if (srcFolder && srcUid) {
      fd.set('sourceFolder', srcFolder)
      fd.set('sourceUid', String(srcUid))
    }
    if (draftUid) fd.set('draftUid', String(draftUid))
    for (const f of files) fd.append('files', f)
    return fd
  }, [to, cc, bcc, subject, signatureId, branded, includeQuote, effMode, srcFolder, srcUid, draftUid, files])

  const saveDraft = useCallback(
    async (quiet = false) => {
      setBusy((b) => b ?? 'draft')
      try {
        const fd = formData()
        fd.delete('files') // drafts keep text; attachments are added when sending
        const r = await api<{ uid: number | null; savedAt: string }>('/api/admin/mail/draft', { method: 'POST', body: fd })
        setDraftUid(r.uid)
        setSavedAt(r.savedAt)
        setDirty(false)
        onDraftSaved()
      } catch (e) {
        if (!quiet) setErr((e as Error).message)
      } finally {
        setBusy((b) => (b === 'draft' ? null : b))
      }
    },
    [formData, onDraftSaved]
  )

  // Autosave every 45s while there are unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const t = setTimeout(() => void saveDraft(true), 45000)
    return () => clearTimeout(t)
  }, [dirty, saveDraft])

  const send = async () => {
    setErr('')
    if (!to.trim() && !cc.trim() && !bcc.trim()) return setErr('Add at least one recipient')
    if (!subject.trim() && !window.confirm('Send without a subject?')) return
    setBusy('send')
    try {
      await api('/api/admin/mail/send', { method: 'POST', body: formData() })
      onSent('Message sent')
    } catch (e) {
      setErr((e as Error).message)
      setBusy(null)
    }
  }

  const showPreview = async () => {
    setBusy('preview')
    try {
      const fd = formData()
      fd.delete('files')
      const r = await api<{ html: string }>('/api/admin/mail/preview', { method: 'POST', body: fd })
      setPreview(r.html)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const discard = async () => {
    if ((dirty || draftUid) && !window.confirm(draftUid ? 'Discard this draft? The saved copy will be deleted.' : 'Discard this message?')) return
    if (draftUid) {
      await api('/api/admin/mail/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: draftsFolder, uids: [draftUid], action: 'delete' }),
      }).catch(() => {})
      onDraftSaved()
    }
    onClose()
  }

  const close = async () => {
    if (dirty && (editor.current?.getHtml().replace(/<[^>]+>/g, '').trim() || subject.trim())) await saveDraft(true)
    onClose()
  }

  const firstName = () => {
    const first = to.split(',')[0]?.trim() ?? ''
    const name = first.match(/^"?([^"<]+?)"?\s*</)?.[1] ?? (orig?.from && orig.from.address && first.includes(orig.from.address) ? orig.from.name : '')
    return (name || '').split(/\s+/)[0] || 'there'
  }

  const applyTemplate = (t: Template) => {
    const html = t.html.replace(/\{\{\s*name\s*\}\}/gi, firstName())
    const current = (editor.current?.getHtml() ?? '').replace(/<[^>]+>|&nbsp;/g, '').trim()
    if (!current) editor.current?.setHtml(html)
    else editor.current?.insertHtml(html)
    if (!subject.trim() && t.subject) setSubject(t.subject)
    setTplOpen(false)
    setDirty(true)
  }

  const byCategory = useMemo(() => {
    const m = new Map<string, Template[]>()
    for (const t of templates) m.set(t.category, [...(m.get(t.category) ?? []), t])
    return [...m.entries()]
  }, [templates])

  const title =
    draft ? 'Edit draft' : mode === 'reply' ? 'Reply' : mode === 'replyAll' ? 'Reply all' : mode === 'forward' ? 'Forward' : 'New message'
  const field = 'w-full border-0 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-slate-900/40 sm:items-center sm:p-4"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault()
          void send()
        }
        if (e.key === 'Escape' && !preview) void close()
      }}
    >
      <div className="flex h-full w-full flex-col bg-white shadow-2xl sm:h-[90vh] sm:max-w-3xl sm:rounded-xl">
        {/* Title bar */}
        <div className="flex items-center justify-between rounded-t-xl bg-slate-800 px-4 py-2.5 text-white">
          <span className="text-sm font-semibold">{title}</span>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            {savedAt && !dirty && <span>Draft saved {new Date(savedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button onClick={() => void close()} className="rounded p-1 hover:bg-slate-700" aria-label="Close (draft is kept)" title="Close — the draft is kept">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="border-b border-slate-200 px-4">
          <div className="flex items-center gap-2 border-b border-slate-100">
            <label className="w-12 shrink-0 text-xs font-medium text-slate-500">To</label>
            <input value={to} onChange={(e) => { setTo(e.target.value); setDirty(true) }} className={field} placeholder="name@example.com, …" autoFocus={!to} />
            {!showCc && (
              <button onClick={() => setShowCc(true)} className="shrink-0 text-xs font-semibold text-slate-500 hover:text-cyan-700">
                Cc/Bcc
              </button>
            )}
          </div>
          {showCc && (
            <>
              <div className="flex items-center gap-2 border-b border-slate-100">
                <label className="w-12 shrink-0 text-xs font-medium text-slate-500">Cc</label>
                <input value={cc} onChange={(e) => { setCc(e.target.value); setDirty(true) }} className={field} />
              </div>
              <div className="flex items-center gap-2 border-b border-slate-100">
                <label className="w-12 shrink-0 text-xs font-medium text-slate-500">Bcc</label>
                <input value={bcc} onChange={(e) => { setBcc(e.target.value); setDirty(true) }} className={field} />
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <label className="w-12 shrink-0 text-xs font-medium text-slate-500">Subject</label>
            <input value={subject} onChange={(e) => { setSubject(e.target.value); setDirty(true) }} className={`${field} font-medium`} />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs">
          <div className="relative">
            <button
              onClick={() => setTplOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Templates <FaChevronDown className="text-[10px]" />
            </button>
            {tplOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 max-h-80 w-72 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
                {byCategory.length === 0 && <p className="px-3 py-2 text-slate-500">No templates yet — add them in Settings.</p>}
                {byCategory.map(([cat, list]) => (
                  <div key={cat}>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{cat}</p>
                    {list.map((t) => (
                      <button key={t.id} onClick={() => applyTemplate(t)} className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-cyan-50">
                        {t.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center gap-1.5 text-slate-600">
            Signature
            <select
              value={signatureId}
              onChange={(e) => { setSignatureId(e.target.value); setDirty(true) }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="">None</option>
              {signatures.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-slate-600" title="Logo header and footer, like the site's own emails">
            <input type="checkbox" checked={branded} onChange={(e) => { setBranded(e.target.checked); setDirty(true) }} />
            Branded layout
          </label>
          {effMode !== 'new' && srcUid > 0 && (
            <label className="flex items-center gap-1.5 text-slate-600">
              <input type="checkbox" checked={includeQuote} onChange={(e) => { setIncludeQuote(e.target.checked); setDirty(true) }} />
              {effMode === 'forward' ? 'Include original message' : 'Quote original'}
            </label>
          )}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <RichEditor ref={editor} initialHtml={initial.body} minHeight="240px" placeholder="Write your message…" onChange={markDirty} />
          {effMode === 'forward' && orig && orig.attachments.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              The original’s {orig.attachments.length} attachment{orig.attachments.length > 1 ? 's are' : ' is'} forwarded too.
            </p>
          )}
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
                  <FaPaperclip className="text-slate-400" /> {f.name} <span className="text-slate-400">{fileSize(f.size)}</span>
                  <button onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600" aria-label="Remove attachment">
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
          )}
          {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-3">
          <button
            onClick={() => void send()}
            disabled={!!busy}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
            title="Send (Ctrl+Enter)"
          >
            <FaPaperPlane /> {busy === 'send' ? 'Sending…' : 'Send'}
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? [])
              setFiles((fs) => [...fs, ...picked])
              e.target.value = ''
            }}
          />
          <button onClick={() => fileInput.current?.click()} className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100" title="Attach files (20 MB total)" aria-label="Attach files">
            <FaPaperclip />
          </button>
          <button onClick={() => void showPreview()} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" title="See exactly what will be sent">
            <FaEye /> <span className="hidden sm:inline">{busy === 'preview' ? 'Loading…' : 'Preview'}</span>
          </button>
          <button onClick={() => void saveDraft()} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            <FaSave /> <span className="hidden sm:inline">{busy === 'draft' ? 'Saving…' : 'Save draft'}</span>
          </button>
          <button onClick={() => void discard()} className="ml-auto rounded-lg p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Discard" aria-label="Discard">
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-2 sm:p-6" onClick={() => setPreview(null)}>
          <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
              <span className="text-sm font-semibold text-slate-800">Preview: exactly what the recipient receives</span>
              <button onClick={() => setPreview(null)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close preview">
                <FaTimes />
              </button>
            </div>
            <div className="overflow-y-auto bg-slate-100 p-2 sm:p-4">
              <MessageFrame html={preview} text={null} title="Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
