'use client'

import { useRef, useState } from 'react'
import { FaTimes, FaPlus, FaStar, FaTrash, FaEye } from 'react-icons/fa'
import RichEditor, { type RichEditorHandle } from './RichEditor'
import { api, MessageFrame, type Signature, type Template } from './shared'

type Tab = 'signatures' | 'templates'

/**
 * Manage signatures and canned replies. Templates are written with the same
 * building blocks as the site's system emails (heading, panel, button, note),
 * so a reply looks like the sign-up and password emails.
 */
export default function MailSettings({
  signatures,
  templates,
  onClose,
  onChanged,
}: {
  signatures: Signature[]
  templates: Template[]
  onClose: () => void
  onChanged: () => Promise<void>
}) {
  const [tab, setTab] = useState<Tab>('templates')
  const list = tab === 'signatures' ? signatures : templates
  const [selectedId, setSelectedId] = useState<string | 'new' | null>(list[0]?.id ?? null)
  const selected = list.find((x) => x.id === selectedId) as Signature | Template | undefined

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-slate-900/40 sm:items-center sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[88vh] sm:max-w-5xl sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
            {(['templates', 'signatures'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  const l = t === 'signatures' ? signatures : templates
                  setSelectedId(l[0]?.id ?? null)
                }}
                className={`rounded-md px-3 py-1.5 font-semibold capitalize ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t === 'templates' ? 'Reply templates' : 'Signatures'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Close settings">
            <FaTimes />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* List */}
          <div className="max-h-48 shrink-0 overflow-y-auto border-b border-slate-200 md:max-h-none md:w-64 md:border-b-0 md:border-r">
            <button
              onClick={() => setSelectedId('new')}
              className="flex w-full items-center gap-2 border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
            >
              <FaPlus /> New {tab === 'templates' ? 'template' : 'signature'}
            </button>
            {list.map((x) => (
              <button
                key={x.id}
                onClick={() => setSelectedId(x.id)}
                className={`block w-full border-b border-slate-100 px-4 py-2.5 text-left text-sm ${selectedId === x.id ? 'bg-cyan-50 text-cyan-900' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  {'isDefault' in x && x.isDefault && <FaStar className="text-amber-500" title="Default" />}
                  {x.name}
                </span>
                {'category' in x && <span className="text-xs text-slate-400">{x.category}</span>}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {selectedId ? (
              <ItemEditor
                key={`${tab}-${selectedId}`}
                kind={tab}
                item={selectedId === 'new' ? null : selected ?? null}
                onSaved={async (id) => {
                  await onChanged()
                  setSelectedId(id)
                }}
                onDeleted={async () => {
                  await onChanged()
                  setSelectedId(null)
                }}
              />
            ) : (
              <p className="text-sm text-slate-500">Pick an item on the left, or create a new one.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const BLOCKS: { label: string; html: string }[] = [
  { label: 'Heading', html: '<h2>Heading</h2>' },
  { label: 'Highlight box', html: '<div class="panel">Important details here</div>' },
  { label: 'Card', html: '<div class="card"><strong>Title</strong><br>Details</div>' },
  { label: 'Warning note', html: '<div class="warn">Please note …</div>' },
  { label: 'Button', html: '<p style="text-align:center;"><a class="cta" href="https://medaghar.com">Button text</a></p>' },
  { label: '{{name}}', html: '{{name}}' },
]

function ItemEditor({
  kind,
  item,
  onSaved,
  onDeleted,
}: {
  kind: Tab
  item: Signature | Template | null
  onSaved: (id: string) => Promise<void>
  onDeleted: () => Promise<void>
}) {
  const isTpl = kind === 'templates'
  const tpl = item as Template | null
  const sig = item as Signature | null
  const [name, setName] = useState(item?.name ?? '')
  const [category, setCategory] = useState(tpl?.category ?? 'General')
  const [subject, setSubject] = useState(tpl?.subject ?? '')
  const [isDefault, setIsDefault] = useState(sig?.isDefault ?? false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const editor = useRef<RichEditorHandle>(null)

  const save = async () => {
    const html = editor.current?.getHtml() ?? ''
    if (!name.trim() || !html.replace(/<[^>]+>/g, '').trim()) return setMsg({ text: 'Name and content are required', ok: false })
    setBusy(true)
    setMsg(null)
    try {
      const base = `/api/admin/mail/${kind}`
      const body = isTpl ? { name, category, subject, html } : { name, html, isDefault }
      const r = await api<{ signature?: Signature; template?: Template }>(item ? `${base}/${item.id}` : base, {
        method: item ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setMsg({ text: 'Saved', ok: true })
      await onSaved((r.signature ?? r.template)!.id)
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!item || !window.confirm(`Delete "${item.name}"?`)) return
    await api(`/api/admin/mail/${kind}/${item.id}`, { method: 'DELETE' })
    await onDeleted()
  }

  const showPreview = async () => {
    const html = editor.current?.getHtml() ?? ''
    const fd = new FormData()
    fd.set('subject', subject || name || 'Preview')
    fd.set(
      'body',
      isTpl
        ? html.replace(/\{\{\s*name\s*\}\}/gi, 'Ahmed')
        : `<p>Assalam o Alaikum Ahmed,</p><p>Your message goes here.</p><div style="margin-top:24px;">${html}</div>`
    )
    fd.set('branded', 'true')
    fd.set('mode', 'new')
    try {
      const r = await api<{ html: string }>('/api/admin/mail/preview', { method: 'POST', body: fd })
      setPreview(r.html)
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false })
    }
  }

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none'
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-slate-600">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className={`${input} mt-1`} />
        </label>
        {isTpl ? (
          <label className="block text-xs font-semibold text-slate-600">
            Category
            <input value={category} onChange={(e) => setCategory(e.target.value)} className={`${input} mt-1`} placeholder="General, Listings, Account…" />
          </label>
        ) : (
          <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Default signature for new messages
          </label>
        )}
      </div>
      {isTpl && (
        <label className="block text-xs font-semibold text-slate-600">
          Subject (optional, used when the message has none)
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={`${input} mt-1`} />
        </label>
      )}

      {isTpl && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500">Insert:</span>
          {BLOCKS.map((b) => (
            <button key={b.label} onClick={() => editor.current?.insertHtml(b.html)} className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100">
              {b.label}
            </button>
          ))}
        </div>
      )}

      <RichEditor ref={editor} initialHtml={item?.html ?? ''} minHeight={isTpl ? '280px' : '160px'} allowSource placeholder={isTpl ? 'Assalam o Alaikum {{name}}, …' : 'Your name, role, phone…'} />
      {isTpl && (
        <p className="text-xs text-slate-500">
          <code>{'{{name}}'}</code> becomes the recipient’s first name. Headings, highlight boxes, buttons and notes use the same
          styling as the site’s sign-up and password emails when “Branded layout” is on.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button onClick={() => void save()} disabled={busy} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button onClick={() => void showPreview()} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <FaEye /> Preview
        </button>
        {item && (
          <button onClick={() => void remove()} className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <FaTrash /> Delete
          </button>
        )}
        {msg && <span className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.text}</span>}
      </div>

      {preview !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-2 sm:p-6" onClick={() => setPreview(null)}>
          <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
              <span className="text-sm font-semibold text-slate-800">Preview</span>
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
