'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  FaTachometerAlt,
  FaHome,
  FaStar,
  FaClipboardCheck,
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaChartLine,
  FaGlobe,
  FaMousePointer,
  FaPen,
  FaChartBar,
  FaComments,
  FaCog,
  FaHistory,
  FaDatabase,
  FaEnvelope,
  FaSpider,
  FaBars,
  FaTimes,
} from 'react-icons/fa'
import { ADMIN_NAV, isNavGroup, type NavLink } from '@/lib/mgh-ops/nav'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FaSpider,
  FaTachometerAlt,
  FaHome,
  FaStar,
  FaClipboardCheck,
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaChartLine,
  FaRadar: FaGlobe,
  FaGlobe,
  FaMousePointer,
  FaPen,
  FaChartBar,
  FaComments,
  FaCog,
  FaHistory,
  FaDatabase,
  FaEnvelope,
}

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name]
  if (!Cmp) return <span className={className} />
  return <Cmp className={className} />
}

export function OpsSidebar({
  badges,
}: {
  badges: { contacts: number; moderation: number }
}) {
  const pathname = usePathname() ?? ''
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/mgh-ops/') return pathname === '/mgh-ops/' || pathname === '/mgh-ops'
    return pathname.startsWith(href.replace(/\/$/, '')) || pathname.startsWith(href)
  }

  const renderLink = (item: NavLink, child = false) => {
    const active = isActive(item.href)
    const badge = item.badge ? badges[item.badge] : 0
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          'flex items-center gap-2.5 border-l-[3px] py-2 pr-3 text-[13px] transition-colors',
          child ? 'pl-7' : 'pl-4',
          active
            ? 'border-amber-400 bg-slate-800 font-semibold text-white'
            : 'border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white',
        )}
      >
        <Icon
          name={item.icon}
          className={cn('h-4 w-4 shrink-0', active ? 'text-amber-400' : 'text-slate-400')}
        />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {badge > 0 ? (
          <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : item.isNew || item.stub ? (
          <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-slate-300">
            {item.isNew ? 'new' : 'soon'}
          </span>
        ) : null}
      </Link>
    )
  }

  const nav = (
    <nav className="pb-8">
      {ADMIN_NAV.map((entry, i) => {
        if (!isNavGroup(entry)) return renderLink(entry)
        return (
          <div key={entry.group + i}>
            <p className="px-4 pb-1.5 pt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {entry.group}
            </p>
            {entry.items.map((item) =>
              'subgroup' in item ? (
                <div key={item.subgroup}>
                  <p className="px-7 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                    {item.subgroup}
                  </p>
                  {item.items.map((s) => renderLink(s, true))}
                </div>
              ) : (
                renderLink(item)
              ),
            )}
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
        className="fixed left-3 top-3 z-50 rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
      >
        {open ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[248px] shrink-0 overflow-y-auto bg-slate-950 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Link href="/mgh-ops/" className="block border-b border-slate-800 px-4 py-4">
          <p className="text-[15px] font-bold leading-tight text-white">MedaGhar</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Ops Console</p>
        </Link>
        {nav}
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}
    </>
  )
}
