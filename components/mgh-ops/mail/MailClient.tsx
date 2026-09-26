'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FaInbox,
  FaPaperPlane,
  FaFileAlt,
  FaExclamationTriangle,
  FaTrash,
  FaArchive,
  FaFolder,
  FaPen,
  FaSearch,
  FaSyncAlt,
  FaCog,
  FaStar,
  FaRegStar,
  FaPaperclip,
  FaReply,
  FaReplyAll,
  FaShare,
  FaArrowLeft,
  FaEnvelope,
  FaEnvelopeOpen,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaDownload,
  FaTimes,
} from 'react-icons/fa'
import Composer, { type ComposeRequest } from './Composer'
import MailSettings from './MailSettings'
import {
  api,
  addrLabel,
  addrFull,
  shortDate,
  longDate,
  fileSize,
  Avatar,
  MessageFrame,
  type Folder,
  type FolderRole,
  type MessageSummary,
  type FullMessage,
  type Signature,
  type Template,
} from './shared'

const PAGE_SIZE = 50
const SYNC_MS = 30000

const FOLDER_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  inbox: FaInbox,
  sent: FaPaperPlane,
  drafts: FaFileAlt,
  junk: FaExclamationTriangle,
  trash: FaTrash,
  archive: FaArchive,
}

type Action = 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive' | 'spam' | 'notspam' | 'move'

export default function MailClient() {
  // ---- mailbox state ----------------------------------------------------------
  const [folders, setFolders] = useState<Folder[]>([])
  const [address, setAddress] = useState('')
  const [folder, setFolder] = useState('INBOX')
  const [page, setPage] = useState(1)
  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [total, setTotal] = useState(0)
  const [loadingList, setLoadingList] = useState(true)
  const [listError, setListError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // ---- reader ------------------------------------------------------------------
  const [openUid, setOpenUid] = useState<number | null>(null)
  const [message, setMessage] = useState<FullMessage | null>(null)
  const [loadingMsg, setLoadingMsg] = useState(false)
  const [msgError, setMsgError] = useState('')
  const [showImages, setShowImages] = useState(false)

  // ---- compose & settings -----------------------------------------------------
  const [compose, setCompose] = useState<ComposeRequest | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [templates, setTemplates] = useState<Template[]>([])

  // ---- sync ---------------------------------------------------------------------
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inboxUidNext = useRef<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [, forceTick] = useState(0)

  const current = folders.find((f) => f.path === folder)
  const role: FolderRole = current?.role ?? null
  const byRole = useCallback((r: FolderRole) => folders.find((f) => f.role === r)?.path, [folders])
  const outgoingFolder = role === 'sent' || role === 'drafts'

  const flash = useCallback((text: string) => {
    setToast(text)
    setTimeout(() => setToast((t) => (t === text ? null : t)), 3500)
  }, [])

  // ---- loaders ------------------------------------------------------------------
  const loadFolders = useCallback(async () => {
    const r = await api<{ folders: Folder[]; address: string }>('/api/admin/mail/folders')
    setFolders(r.folders)
    setAddress(r.address)
    return r.folders
  }, [])

  const loadList = useCallback(
    async (opts: { quiet?: boolean } = {}) => {
      if (!opts.quiet) setLoadingList(true)
      setListError('')
      try {
        const qs = new URLSearchParams({ folder, page: String(page), pageSize: String(PAGE_SIZE) })
        if (query) qs.set('q', query)
        if (unreadOnly) qs.set('unread', '1')
        const r = await api<{ total: number; messages: MessageSummary[] }>(`/api/admin/mail/messages?${qs}`)
        setMessages(r.messages)
        setTotal(r.total)
        setSelected((sel) => new Set([...sel].filter((u) => r.messages.some((m) => m.uid === u))))
      } catch (e) {
        setListError((e as Error).message)
      } finally {
        setLoadingList(false)
      }
    },
    [folder, page, query, unreadOnly]
  )

  const loadCompose = useCallback(async () => {
    const [s, t] = await Promise.all([
      api<{ signatures: Signature[] }>('/api/admin/mail/signatures'),
      api<{ templates: Template[] }>('/api/admin/mail/templates'),
    ])
    setSignatures(s.signatures)
    setTemplates(t.templates)
  }, [])

  useEffect(() => {
    loadFolders().catch((e) => setListError((e as Error).message))
    loadCompose().catch(() => {})
  }, [loadFolders, loadCompose])

  useEffect(() => {
    void loadList()
  }, [loadList])

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setQuery(queryInput.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [queryInput])

  // ---- auto-sync ---------------------------------------------------------------------
  const sync = useCallback(
    async (manual = false) => {
      setSyncing(true)
      try {
        const s = await api<{ folders: Record<string, number>; inboxUidNext: number; inboxTotal: number }>('/api/admin/mail/sync')
        setFolders((fs) => fs.map((f) => (s.folders[f.path] !== undefined ? { ...f, unseen: s.folders[f.path] } : f)))
        const prev = inboxUidNext.current
        inboxUidNext.current = s.inboxUidNext
        const arrived = prev !== null && s.inboxUidNext > prev
        if (arrived) flash(`${s.inboxUidNext - prev} new message${s.inboxUidNext - prev > 1 ? 's' : ''}`)
        if (manual || (arrived && role === 'inbox' && page === 1 && !query)) {
          await Promise.all([loadList({ quiet: true }), manual ? loadFolders() : Promise.resolve()])
        }
        setLastSync(new Date())
      } catch {
        /* next tick retries */
      } finally {
        setSyncing(false)
      }
    },
    [flash, loadFolders, loadList, page, query, role]
  )

  useEffect(() => {
    void sync()
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') void sync()
    }, SYNC_MS)
    const onVisible = () => document.visibilityState === 'visible' && void sync()
    document.addEventListener('visibilitychange', onVisible)
    const tick = setInterval(() => forceTick((n) => n + 1), 10000) // refresh "synced Ns ago"
    return () => {
      clearInterval(t)
      clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [sync])

  // Unread count in the browser tab.
  const inboxUnseen = folders.find((f) => f.role === 'inbox')?.unseen ?? 0
  useEffect(() => {
    const base = 'Mail — MedaGhar Ops'
    document.title = inboxUnseen ? `(${inboxUnseen}) ${base}` : base
  }, [inboxUnseen])

  // ---- open a message -----------------------------------------------------------------
  const openMessage = useCallback(
    async (uid: number, images = false) => {
      setOpenUid(uid)
      setShowImages(images)
      setLoadingMsg(true)
      setMsgError('')
      if (!images) setMessage(null)
      try {
        const r = await api<{ message: FullMessage }>(
          `/api/admin/mail/message?${new URLSearchParams({ folder, uid: String(uid), ...(images ? { images: '1' } : {}) })}`
        )
        if (role === 'drafts') {
          setCompose({ mode: 'new', draft: { uid, message: r.message } })
          setOpenUid(null)
          return
        }
        setMessage(r.message)
        setMessages((ms) => ms.map((m) => (m.uid === uid ? { ...m, seen: true } : m)))
        setFolders((fs) =>
          fs.map((f) => (f.path === folder && messages.find((m) => m.uid === uid && !m.seen) ? { ...f, unseen: Math.max(0, f.unseen - 1) } : f))
        )
      } catch (e) {
        setMsgError((e as Error).message)
      } finally {
        setLoadingMsg(false)
      }
    },
    [folder, role, messages]
  )

  const closeMessage = () => {
    setOpenUid(null)
    setMessage(null)
  }

  const switchFolder = (path: string) => {
    setFolder(path)
    setPage(1)
    setSelected(new Set())
    closeMessage()
    setQueryInput('')
    setQuery('')
  }

  // ---- actions ------------------------------------------------------------------------
  const act = useCallback(
    async (action: Action, uids: number[], dest?: string) => {
      if (!uids.length) return
      const removes = ['delete', 'archive', 'spam', 'notspam', 'move'].includes(action)
      // Optimistic update so the list reacts instantly.
      if (removes) {
        setMessages((ms) => ms.filter((m) => !uids.includes(m.uid)))
        setTotal((t) => Math.max(0, t - uids.length))
        if (openUid && uids.includes(openUid)) closeMessage()
      } else {
        const patch: Partial<MessageSummary> =
          action === 'read' ? { seen: true } : action === 'unread' ? { seen: false } : { flagged: action === 'star' }
        setMessages((ms) => ms.map((m) => (uids.includes(m.uid) ? { ...m, ...patch } : m)))
        if (message && uids.includes(message.uid)) setMessage({ ...message, ...patch })
      }
      setSelected(new Set())
      try {
        await api('/api/admin/mail/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder, uids, action, dest }),
        })
        const labels: Partial<Record<Action, string>> = {
          delete: role === 'trash' || role === 'junk' ? 'Deleted for good' : 'Moved to Trash',
          archive: 'Archived',
          spam: 'Moved to Spam',
          notspam: 'Moved to Inbox',
          move: 'Moved',
        }
        if (labels[action]) flash(`${labels[action]}${uids.length > 1 ? ` (${uids.length})` : ''}`)
      } catch (e) {
        flash((e as Error).message)
      } finally {
        void loadFolders()
        if (removes) void loadList({ quiet: true })
      }
    },
    [folder, flash, loadFolders, loadList, message, openUid, role]
  )

  const startCompose = useCallback(
    (mode: ComposeRequest['mode']) => {
      if (mode === 'new') setCompose({ mode })
      else if (message) setCompose({ mode, source: { folder, message } })
    },
    [folder, message]
  )

  // ---- keyboard shortcuts --------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (compose || settingsOpen || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || e.ctrlKey || e.metaKey || e.altKey) return
      const idx = messages.findIndex((m) => m.uid === openUid)
      switch (e.key) {
        case 'c':
          startCompose('new')
          break
        case 'r':
          if (message) startCompose('reply')
          break
        case 'a':
          if (message) startCompose('replyAll')
          break
        case 'f':
          if (message) startCompose('forward')
          break
        case 'e':
          if (openUid) void act('archive', [openUid])
          break
        case '#':
        case 'Delete':
          if (openUid) void act('delete', [openUid])
          else if (selected.size) void act('delete', [...selected])
          break
        case 'u':
          if (openUid) {
            void act('unread', [openUid])
            closeMessage()
          }
          break
        case 's':
          if (message) void act(message.flagged ? 'unstar' : 'star', [message.uid])
          break
        case 'j':
          if (idx < messages.length - 1) void openMessage(messages[idx + 1].uid)
          break
        case 'k':
          if (idx > 0) void openMessage(messages[idx - 1].uid)
          break
        case '/':
          e.preventDefault()
          searchRef.current?.focus()
          break
        case 'Escape':
          closeMessage()
          break
        default:
          return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [act, compose, message, messages, openMessage, openUid, selected, settingsOpen, startCompose])

  // ---- derived ----------------------------------------------------------------------
  const allSelected = messages.length > 0 && messages.every((m) => selected.has(m.uid))
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, (page - 1) * PAGE_SIZE + messages.length)
  const moveTargets = useMemo(() => folders.filter((f) => f.path !== folder && f.role !== 'drafts'), [folders, folder])
  const syncedAgo = lastSync ? Math.round((Date.now() - lastSync.getTime()) / 1000) : null

  const iconBtn = 'flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40'

  return (
    <div className="relative flex h-[calc(100dvh-6.5rem)] min-h-[560px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* ================= Header ================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2.5">
        <button
          onClick={() => startCompose('new')}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700"
          title="Compose (C)"
        >
          <FaPen /> <span className="hidden sm:inline">Compose</span>
        </button>

        {/* Folder picker on phones */}
        <select value={folder} onChange={(e) => switchFolder(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-2 text-sm md:hidden">
          {folders.map((f) => (
            <option key={f.path} value={f.path}>
              {f.name}
              {f.unseen ? ` (${f.unseen})` : ''}
            </option>
          ))}
        </select>

        <div className="relative order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:max-w-md">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
          <input
            ref={searchRef}
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={`Search ${current?.name ?? 'mail'} (/)`}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-8 pr-8 text-sm focus:border-cyan-500 focus:bg-white focus:outline-none"
          />
          {queryInput && (
            <button onClick={() => setQueryInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700" aria-label="Clear search">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <span className="hidden text-xs text-slate-400 lg:inline" title={address}>
            {syncing ? 'Syncing…' : syncedAgo !== null ? `Synced ${syncedAgo < 10 ? 'just now' : `${syncedAgo}s ago`}` : ''}
          </span>
          <button onClick={() => void sync(true)} className={iconBtn} title="Check for new mail" aria-label="Check for new mail">
            <FaSyncAlt className={syncing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setSettingsOpen(true)} className={iconBtn} title="Signatures & templates" aria-label="Signatures and templates">
            <FaCog />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ================= Folders ================= */}
        <nav className="hidden w-52 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/60 py-2 md:block">
          {folders.map((f) => {
            const Icon = (f.role && FOLDER_ICON[f.role]) || FaFolder
            const active = f.path === folder
            return (
              <button
                key={f.path}
                onClick={() => switchFolder(f.path)}
                className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  active ? 'bg-cyan-100 font-semibold text-cyan-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={active ? 'text-cyan-700' : 'text-slate-400'} />
                <span className="flex-1 truncate text-left">{f.name}</span>
                {f.unseen > 0 && f.role !== 'sent' && f.role !== 'trash' && (
                  <span className={`rounded-full px-2 text-xs font-bold ${f.role === 'junk' ? 'bg-slate-200 text-slate-600' : 'bg-cyan-600 text-white'}`}>{f.unseen}</span>
                )}
              </button>
            )
          })}
          <p className="mt-4 truncate px-5 text-[11px] text-slate-400" title={address}>
            {address}
          </p>
        </nav>

        {/* ================= Message list ================= */}
        <section
          className={`flex min-w-0 flex-col border-r border-slate-200 md:w-[360px] lg:w-[400px] md:shrink-0 ${openUid ? 'hidden md:flex' : 'flex w-full'}`}
        >
          {/* List toolbar */}
          <div className="flex items-center gap-1 border-b border-slate-200 px-2 py-1.5">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(messages.map((m) => m.uid)))}
              className="mx-2 h-4 w-4"
              aria-label="Select all"
            />
            {selected.size > 0 ? (
              <>
                <span className="mr-1 text-xs font-semibold text-slate-600">{selected.size}</span>
                <button className={iconBtn} title="Mark read" onClick={() => void act('read', [...selected])}><FaEnvelopeOpen /></button>
                <button className={iconBtn} title="Mark unread" onClick={() => void act('unread', [...selected])}><FaEnvelope /></button>
                <button className={iconBtn} title="Star" onClick={() => void act('star', [...selected])}><FaStar /></button>
                {role !== 'archive' && <button className={iconBtn} title="Archive" onClick={() => void act('archive', [...selected])}><FaArchive /></button>}
                {role === 'junk' ? (
                  <button className={iconBtn} title="Not spam" onClick={() => void act('notspam', [...selected])}><FaInbox /></button>
                ) : (
                  !outgoingFolder && <button className={iconBtn} title="Spam" onClick={() => void act('spam', [...selected])}><FaExclamationTriangle /></button>
                )}
                <button className={`${iconBtn} hover:text-red-600`} title="Delete" onClick={() => void act('delete', [...selected])}><FaTrash /></button>
              </>
            ) : (
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => { setUnreadOnly(false); setPage(1) }}
                  className={`rounded-md px-2.5 py-1 font-semibold ${!unreadOnly ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  All
                </button>
                <button
                  onClick={() => { setUnreadOnly(true); setPage(1) }}
                  className={`rounded-md px-2.5 py-1 font-semibold ${unreadOnly ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Unread
                </button>
              </div>
            )}
            <div className="ml-auto flex items-center gap-0.5 text-xs text-slate-500">
              <span className="px-1 tabular-nums">{total ? `${from}–${to} of ${total}` : ''}</span>
              <button className={iconBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Newer"><FaChevronLeft /></button>
              <button className={iconBtn} disabled={to >= total} onClick={() => setPage((p) => p + 1)} aria-label="Older"><FaChevronRight /></button>
            </div>
          </div>

          {/* Rows */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingList && messages.length === 0 ? (
              <div className="space-y-px p-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-md bg-slate-100" />
                ))}
              </div>
            ) : listError ? (
              <div className="m-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Couldn’t load mail</p>
                <p className="mt-1">{listError}</p>
                <button onClick={() => void loadList()} className="mt-2 font-semibold underline">Try again</button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
                <FaInbox className="mb-3 text-4xl" />
                <p className="text-sm">{query ? `No results for “${query}”` : unreadOnly ? 'No unread mail' : `${current?.name ?? 'This folder'} is empty`}</p>
              </div>
            ) : (
              messages.map((m) => {
                const who = outgoingFolder ? (m.to.length ? `To: ${m.to.map(addrLabel).join(', ')}` : '(no recipient)') : addrLabel(m.from)
                const active = m.uid === openUid
                return (
                  <div
                    key={m.uid}
                    onClick={() => void openMessage(m.uid)}
                    className={`group flex cursor-pointer gap-2 border-b border-slate-100 px-2 py-2.5 ${
                      active ? 'bg-cyan-50' : selected.has(m.uid) ? 'bg-amber-50' : m.seen ? 'bg-white hover:bg-slate-50' : 'bg-white hover:bg-slate-50'
                    } ${!m.seen ? 'border-l-[3px] border-l-cyan-600 pl-[5px]' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(m.uid)}
                        onChange={() =>
                          setSelected((s) => {
                            const n = new Set(s)
                            if (n.has(m.uid)) n.delete(m.uid)
                            else n.add(m.uid)
                            return n
                          })
                        }
                        className="h-4 w-4"
                        aria-label="Select message"
                      />
                      <button onClick={() => void act(m.flagged ? 'unstar' : 'star', [m.uid])} aria-label={m.flagged ? 'Unstar' : 'Star'} className="text-sm">
                        {m.flagged ? <FaStar className="text-amber-400" /> : <FaRegStar className="text-slate-300 group-hover:text-slate-400" />}
                      </button>
                    </div>
                    <Avatar addr={outgoingFolder ? m.to[0] ?? null : m.from} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className={`truncate text-sm ${m.seen ? 'text-slate-700' : 'font-bold text-slate-900'}`}>{who}</span>
                        <span className={`ml-auto shrink-0 text-xs tabular-nums ${m.seen ? 'text-slate-400' : 'font-semibold text-cyan-700'}`}>{shortDate(m.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {m.answered && <FaReply className="shrink-0 text-[10px] text-slate-400" title="Replied" />}
                        <span className={`truncate text-[13px] ${m.seen ? 'text-slate-500' : 'font-semibold text-slate-800'}`}>{m.subject}</span>
                        {m.hasAttachments && <FaPaperclip className="ml-auto shrink-0 text-xs text-slate-400" />}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* ================= Reader ================= */}
        <section className={`min-w-0 flex-1 flex-col ${openUid ? 'flex' : 'hidden md:flex'}`}>
          {!openUid ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
              <FaEnvelopeOpen className="mb-3 text-5xl" />
              <p className="text-sm">Select a message to read it</p>
              <p className="mt-4 hidden text-xs lg:block">
                Shortcuts: <kbd className="rounded border px-1">c</kbd> compose · <kbd className="rounded border px-1">r</kbd> reply ·{' '}
                <kbd className="rounded border px-1">a</kbd> reply all · <kbd className="rounded border px-1">f</kbd> forward ·{' '}
                <kbd className="rounded border px-1">e</kbd> archive · <kbd className="rounded border px-1">#</kbd> delete ·{' '}
                <kbd className="rounded border px-1">j</kbd>/<kbd className="rounded border px-1">k</kbd> next/prev
              </p>
            </div>
          ) : (
            <>
              {/* Reader toolbar */}
              <div className="flex items-center gap-0.5 border-b border-slate-200 px-2 py-1.5">
                <button className={`${iconBtn} md:hidden`} onClick={closeMessage} aria-label="Back to list"><FaArrowLeft /></button>
                {role !== 'archive' && <button className={iconBtn} title="Archive (E)" onClick={() => openUid && void act('archive', [openUid])}><FaArchive /></button>}
                {role === 'junk' ? (
                  <button className={iconBtn} title="Not spam" onClick={() => openUid && void act('notspam', [openUid])}><FaInbox /></button>
                ) : (
                  !outgoingFolder && <button className={iconBtn} title="Report spam" onClick={() => openUid && void act('spam', [openUid])}><FaExclamationTriangle /></button>
                )}
                <button className={`${iconBtn} hover:text-red-600`} title="Delete (#)" onClick={() => openUid && void act('delete', [openUid])}><FaTrash /></button>
                <span className="mx-1 h-5 w-px bg-slate-200" />
                <button className={iconBtn} title="Mark unread (U)" onClick={() => { if (openUid) void act('unread', [openUid]); closeMessage() }}><FaEnvelope /></button>
                {message && (
                  <button className={iconBtn} title="Star (S)" onClick={() => void act(message.flagged ? 'unstar' : 'star', [message.uid])}>
                    {message.flagged ? <FaStar className="text-amber-400" /> : <FaRegStar />}
                  </button>
                )}
                <select
                  value=""
                  onChange={(e) => e.target.value && openUid && void act('move', [openUid], e.target.value)}
                  className="ml-1 max-w-[9rem] rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-600"
                  aria-label="Move to folder"
                >
                  <option value="">Move to…</option>
                  {moveTargets.map((f) => (
                    <option key={f.path} value={f.path}>{f.name}</option>
                  ))}
                </select>
                <div className="ml-auto hidden items-center gap-0.5 sm:flex">
                  <button className={iconBtn} title="Reply (R)" onClick={() => startCompose('reply')} disabled={!message}><FaReply /></button>
                  <button className={iconBtn} title="Reply all (A)" onClick={() => startCompose('replyAll')} disabled={!message}><FaReplyAll /></button>
                  <button className={iconBtn} title="Forward (F)" onClick={() => startCompose('forward')} disabled={!message}><FaShare /></button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loadingMsg && !message ? (
                  <div className="space-y-3 p-6">
                    <div className="h-7 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-10 w-1/2 animate-pulse rounded bg-slate-100" />
                    <div className="h-64 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : msgError ? (
                  <div className="m-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{msgError}</div>
                ) : message ? (
                  <article className="px-4 py-4 sm:px-6">
                    <h1 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{message.subject}</h1>
                    <div className="mt-4 flex items-start gap-3">
                      <Avatar addr={message.from} size="h-10 w-10 text-sm" />
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-semibold text-slate-900">{message.from?.name || message.from?.address}</span>
                          {message.from?.name && <span className="text-xs text-slate-500">&lt;{message.from.address}&gt;</span>}
                          <span className="ml-auto text-xs text-slate-500">{longDate(message.date)}</span>
                        </div>
                        <p className="truncate text-xs text-slate-500">to {message.to.map(addrFull).join(', ') || '(undisclosed)'}</p>
                        {message.cc.length > 0 && <p className="truncate text-xs text-slate-500">cc {message.cc.map(addrFull).join(', ')}</p>}
                      </div>
                    </div>

                    {message.blockedImages > 0 && !showImages && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        <FaImage />
                        <span>Remote images are hidden to protect privacy ({message.blockedImages}).</span>
                        <button onClick={() => void openMessage(message.uid, true)} className="font-semibold underline">Show images</button>
                      </div>
                    )}

                    <div className="mt-4">
                      <MessageFrame html={message.html} text={message.text} title={message.subject} />
                    </div>

                    {message.attachments.length > 0 && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.attachments.map((a) => (
                            <a
                              key={a.index}
                              href={`/api/admin/mail/attachment?${new URLSearchParams({ folder, uid: String(message.uid), i: String(a.index) })}`}
                              className="flex max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                            >
                              <FaPaperclip className="shrink-0 text-slate-400" />
                              <span className="truncate">{a.filename}</span>
                              <span className="shrink-0 text-slate-400">{fileSize(a.size)}</span>
                              <FaDownload className="shrink-0 text-cyan-700" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <button onClick={() => startCompose('reply')} className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <FaReply /> Reply
                      </button>
                      {message.to.length + message.cc.length > 1 && (
                        <button onClick={() => startCompose('replyAll')} className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          <FaReplyAll /> Reply all
                        </button>
                      )}
                      <button onClick={() => startCompose('forward')} className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <FaShare /> Forward
                      </button>
                    </div>
                  </article>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {compose && (
        <Composer
          request={compose}
          mailbox={address}
          draftsFolder={byRole('drafts') ?? 'INBOX.Drafts'}
          signatures={signatures}
          templates={templates}
          onClose={() => setCompose(null)}
          onSent={(text) => {
            setCompose(null)
            flash(text)
            void loadFolders()
            if (role === 'sent' || role === 'drafts' || message?.uid) void loadList({ quiet: true })
          }}
          onDraftSaved={() => {
            void loadFolders()
            if (role === 'drafts') void loadList({ quiet: true })
          }}
        />
      )}
      {settingsOpen && (
        <MailSettings
          signatures={signatures}
          templates={templates}
          onClose={() => setSettingsOpen(false)}
          onChanged={loadCompose}
        />
      )}
    </div>
  )
}
