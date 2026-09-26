'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaLink,
  FaRemoveFormat,
  FaCode,
  FaQuoteRight,
} from 'react-icons/fa'

export interface RichEditorHandle {
  getHtml: () => string
  setHtml: (html: string) => void
  insertHtml: (html: string) => void
  focus: () => void
}

/** Strip anything a paste could smuggle in: scripts, styles, event handlers, comments. */
function cleanPasted(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script,style,meta,link,title,iframe,object,embed,form').forEach((n) => n.remove())
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const a of Array.from(el.attributes)) {
      if (/^on/i.test(a.name) || a.name === 'class' || a.name === 'id') el.removeAttribute(a.name)
      if (a.name === 'href' && /^\s*javascript:/i.test(a.value)) el.removeAttribute('href')
    }
  })
  return doc.body.innerHTML.replace(/<!--[\s\S]*?-->/g, '')
}

/**
 * Small rich-text editor on contentEditable. Formatting is what email clients
 * reliably render: bold, italic, underline, lists, links, quotes. "HTML" mode
 * edits the source directly for signatures and templates.
 */
const RichEditor = forwardRef<
  RichEditorHandle,
  { initialHtml?: string; minHeight?: string; placeholder?: string; onChange?: () => void; allowSource?: boolean }
>(function RichEditor({ initialHtml = '', minHeight = '220px', placeholder, onChange, allowSource }, ref) {
  const el = useRef<HTMLDivElement>(null)
  const [source, setSource] = useState(false)
  const [sourceText, setSourceText] = useState('')

  useEffect(() => {
    if (el.current) el.current.innerHTML = initialHtml
    // Only on mount: afterwards the DOM is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    getHtml: () => (source ? sourceText : el.current?.innerHTML ?? ''),
    setHtml: (html: string) => {
      if (source) setSourceText(html)
      else if (el.current) el.current.innerHTML = html
    },
    insertHtml: (html: string) => {
      if (source) {
        setSourceText((t) => t + html)
        return
      }
      el.current?.focus()
      const sel = window.getSelection()
      const inside = sel && sel.rangeCount && el.current?.contains(sel.anchorNode)
      if (!inside && el.current) {
        // No caret in the editor: add at the top, where a reply is written.
        el.current.insertAdjacentHTML('afterbegin', html)
      } else {
        document.execCommand('insertHTML', false, html)
      }
      onChange?.()
    },
    focus: () => el.current?.focus(),
  }))

  const cmd = (name: string, value?: string) => {
    el.current?.focus()
    document.execCommand(name, false, value)
    onChange?.()
  }

  const toggleSource = () => {
    if (!source) {
      setSourceText(el.current?.innerHTML ?? '')
      setSource(true)
    } else {
      setSource(false)
      requestAnimationFrame(() => {
        if (el.current) el.current.innerHTML = sourceText
      })
    }
  }

  const btn = 'flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-200 disabled:opacity-40'

  return (
    <div className="rounded-lg border border-slate-300 bg-white focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1">
        <button type="button" className={btn} disabled={source} onClick={() => cmd('bold')} title="Bold (Ctrl+B)"><FaBold /></button>
        <button type="button" className={btn} disabled={source} onClick={() => cmd('italic')} title="Italic (Ctrl+I)"><FaItalic /></button>
        <button type="button" className={btn} disabled={source} onClick={() => cmd('underline')} title="Underline (Ctrl+U)"><FaUnderline /></button>
        <span className="mx-1 h-5 w-px bg-slate-300" />
        <button type="button" className={btn} disabled={source} onClick={() => cmd('insertUnorderedList')} title="Bulleted list"><FaListUl /></button>
        <button type="button" className={btn} disabled={source} onClick={() => cmd('insertOrderedList')} title="Numbered list"><FaListOl /></button>
        <button type="button" className={btn} disabled={source} onClick={() => cmd('formatBlock', 'blockquote')} title="Quote"><FaQuoteRight /></button>
        <button
          type="button"
          className={btn}
          disabled={source}
          onClick={() => {
            const url = window.prompt('Link address (https://…)')
            if (url && /^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) cmd('createLink', url.trim())
          }}
          title="Insert link"
        >
          <FaLink />
        </button>
        <button type="button" className={btn} disabled={source} onClick={() => cmd('removeFormat')} title="Clear formatting"><FaRemoveFormat /></button>
        {allowSource && (
          <button
            type="button"
            className={`${btn} ml-auto w-auto gap-1 px-2 text-xs font-semibold ${source ? 'bg-slate-200 text-slate-900' : ''}`}
            onClick={toggleSource}
            title="Edit the HTML source"
          >
            <FaCode /> HTML
          </button>
        )}
      </div>
      {source ? (
        <textarea
          value={sourceText}
          onChange={(e) => {
            setSourceText(e.target.value)
            onChange?.()
          }}
          className="block w-full resize-y rounded-b-lg p-3 font-mono text-xs text-slate-800 outline-none"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <div
          ref={el}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={() => onChange?.()}
          onPaste={(e) => {
            const html = e.clipboardData.getData('text/html')
            if (!html) return
            e.preventDefault()
            document.execCommand('insertHTML', false, cleanPasted(html))
            onChange?.()
          }}
          className="mail-editor max-w-none overflow-y-auto p-3 text-[14px] leading-relaxed text-slate-800 outline-none [&_a]:text-cyan-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-600 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
          style={{ minHeight }}
        />
      )}
    </div>
  )
})

export default RichEditor
