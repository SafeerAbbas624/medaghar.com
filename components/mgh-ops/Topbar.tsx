'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { findNavLink } from '@/lib/mgh-ops/nav'
import { cn } from '@/lib/utils'

export function OpsTopbar({
  name,
  email,
  role,
  contactsCount,
}: {
  name: string
  email: string
  role: string
  contactsCount: number
}) {
  const pathname = usePathname() ?? '/mgh-ops/'
  const link = findNavLink(pathname)
  const [menu, setMenu] = useState(false)
  const router = useRouter()

  const initials = (name || email)
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  const signOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    window.location.href = '/mgh-ops/login'
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 pl-14 lg:pl-6">
      <nav aria-label="Breadcrumb" className="min-w-0 truncate text-[13px] text-slate-500">
        <Link href="/mgh-ops/" className="hover:text-slate-800">
          Ops
        </Link>
        {link && link.href !== '/mgh-ops/' ? (
          <>
            <span className="px-1.5 opacity-40">/</span>
            <span className="font-semibold text-slate-800">{link.label}</span>
          </>
        ) : null}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="hidden rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-800 sm:block"
        >
          View site ↗
        </Link>
        <Link
          href="/mgh-ops/contacts/"
          title="Contacts"
          className="relative rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-300 hover:text-blue-800"
        >
          <span aria-hidden>🔔</span>
          <span className="sr-only">Contacts</span>
          {contactsCount > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
              {contactsCount > 99 ? '99+' : contactsCount}
            </span>
          ) : null}
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 py-1 pl-1 pr-2 hover:border-blue-300"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
              {initials || 'A'}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[12px] font-semibold text-slate-800">{name || email}</span>
              <span className="block text-[10px] capitalize text-slate-500">{role}</span>
            </span>
            <span aria-hidden className="text-[9px] text-slate-400">
              ▾
            </span>
          </button>

          {menu ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenu(false)}
                aria-hidden
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-200 px-3.5 py-2.5">
                  <p className="truncate text-[13px] font-semibold text-slate-800">{name || 'Admin'}</p>
                  <p className="truncate text-[11px] text-slate-500">{email}</p>
                </div>
                <Link
                  href="/mgh-ops/settings/"
                  onClick={() => setMenu(false)}
                  className={itemCls}
                >
                  Settings
                </Link>
                <Link
                  href="/mgh-ops/settings/audit/"
                  onClick={() => setMenu(false)}
                  className={itemCls}
                >
                  Audit trail
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className={cn(itemCls, 'w-full border-t border-slate-200 text-left text-red-600')}
                >
                  Sign out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}

const itemCls = 'block px-3.5 py-2 text-[13px] text-slate-700 hover:bg-slate-50'
