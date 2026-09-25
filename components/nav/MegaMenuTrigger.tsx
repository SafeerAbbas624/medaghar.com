'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { FaChevronDown, FaArrowRight } from 'react-icons/fa'
import type { MegaMenu } from '@/lib/nav/menus'

interface Props {
  menu: MegaMenu
  /** Slug of the menu currently open, so only one panel shows at a time. */
  openMenu: string | null
  setOpenMenu: (label: string | null) => void
}

/**
 * One navbar item with a mega-menu panel.
 *
 * Opens on hover for mouse users and on click or keyboard focus for everyone
 * else — hover alone would leave the menu unreachable by keyboard and on
 * touch. Closing is deliberate: a short delay on mouse-leave so the pointer
 * can cross the gap between trigger and panel without the panel vanishing.
 */
export default function MegaMenuTrigger({ menu, openMenu, setOpenMenu }: Props) {
  const [pinned, setPinned] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const open = openMenu === menu.label

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  // A pinned menu (opened by click) stays until dismissed.
  useEffect(() => {
    if (!pinned) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setPinned(false)
        setOpenMenu(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPinned(false)
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [pinned, setOpenMenu])

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openNow = () => {
    cancelClose()
    setOpenMenu(menu.label)
  }

  const scheduleClose = () => {
    if (pinned) return
    cancelClose()
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }

  const dismiss = () => {
    cancelClose()
    setPinned(false)
    setOpenMenu(null)
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => {
          if (open && pinned) dismiss()
          else {
            setPinned(true)
            openNow()
          }
        }}
        onFocus={openNow}
        className={`flex items-center gap-1.5 font-medium text-[14px] xl:text-[15px] px-2 xl:px-3 py-2 rounded-lg transition whitespace-nowrap ${
          open ? 'text-cyan-700 bg-cyan-50' : 'text-gray-700 hover:text-cyan-700 hover:bg-cyan-50'
        }`}
      >
        {menu.label}
        <FaChevronDown
          className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {/* A simple menu is a plain list, so it hangs off its own trigger and
          stays narrow. The wide panels are anchored to the viewport instead:
          three columns are far wider than the button and would otherwise
          overflow the right edge on the last item. */}
      {open && menu.simple && (
        <div
          id={panelId}
          className="absolute right-0 mt-2 z-50 w-60 max-h-[calc(100vh-110px)] overflow-y-auto overscroll-contain"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
            {menu.columns[0]?.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={dismiss}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {open && !menu.simple && (
        <div
          id={panelId}
          className="fixed left-1/2 -translate-x-1/2 mt-2 z-50 w-[min(1120px,calc(100vw-2rem))] max-h-[calc(100vh-110px)] overflow-y-auto overscroll-contain"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div
              className={`grid gap-0 ${
                menu.feature ? 'lg:grid-cols-[1fr_1fr_1fr_320px]' : 'lg:grid-cols-3'
              }`}
            >
              {menu.columns.map((col) => (
                <div key={col.heading} className="p-[21px] border-r border-gray-100 last:border-r-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-[13px]">
                    {col.heading}
                  </p>
                  <ul className="space-y-0.5">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={dismiss}
                          className="block text-[14px] text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 rounded-md px-2 py-1.5 -mx-2 transition"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {col.footer && (
                    <Link
                      href={col.footer.href}
                      onClick={dismiss}
                      className="inline-flex items-center gap-1.5 mt-[13px] text-[13px] font-semibold text-cyan-700 hover:text-cyan-800 transition"
                    >
                      {col.footer.label} <FaArrowRight className="text-[10px]" />
                    </Link>
                  )}
                </div>
              ))}

              {menu.feature && (
                <div className="p-[21px] bg-gradient-to-br from-cyan-800 to-teal-700 text-white flex flex-col justify-center">
                  <p className="text-[16px] font-bold mb-[8px]">{menu.feature.title}</p>
                  <p className="text-[13px] text-cyan-50 leading-relaxed mb-[16px]">
                    {menu.feature.body}
                  </p>
                  <Link
                    href={menu.feature.cta.href}
                    onClick={dismiss}
                    className="inline-flex items-center justify-center gap-2 bg-white text-cyan-800 text-[14px] font-semibold px-[21px] py-[10px] rounded-lg hover:bg-cyan-50 transition"
                  >
                    {menu.feature.cta.label} <FaArrowRight className="text-[11px]" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
