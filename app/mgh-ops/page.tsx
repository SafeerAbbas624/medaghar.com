'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { KpiTile, PageHeader, Panel } from '@/components/mgh-ops/ui'

type DashboardStats = {
  filter: string
  analytics: {
    totalViews: number
    uniqueVisitors: number
    avgDuration: number | null
    pageViews: { page: string; views: number; avgDuration: number | null }[]
  }
  counts: {
    propertiesTotal: number
    propertiesFeatured: number
    propertiesPending: number
    propertiesUnverified: number
    usersTotal: number
    agentsTotal: number
    contactsOpen: number
  }
  queues: {
    contacts: {
      id: string
      name: string
      email: string
      subject: string
      createdAt: string
    }[]
    moderation: {
      id: string
      title: string
      city: string
      status: string
      isVerified: boolean
      createdAt: string
    }[]
  }
}

function fmtDuration(sec: number | null | undefined) {
  if (sec == null || Number.isNaN(sec)) return '—'
  if (sec < 60) return `${Math.round(sec)}s`
  return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`
}

export default function OpsDashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [filter, setFilter] = useState('7d')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetch(`/api/admin/dashboard-stats?filter=${filter}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Failed to load')
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filter])

  const c = stats?.counts
  const a = stats?.analytics

  return (
    <div>
      <PageHeader
        title="Dashboard Home"
        subtitle="Marketplace health at a glance"
        actions={
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold">
            {(['24h', '7d', '30d'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? 'rounded-md bg-slate-800 px-2.5 py-1.5 text-white'
                    : 'rounded-md px-2.5 py-1.5 text-slate-500 hover:bg-slate-50'
                }
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <KpiTile
          label="Total views"
          value={loading ? '…' : (a?.totalViews ?? 0).toLocaleString()}
          hint={`Last ${filter}`}
        />
        <KpiTile
          label="Unique visitors"
          value={loading ? '…' : (a?.uniqueVisitors ?? 0).toLocaleString()}
          hint={`Last ${filter}`}
        />
        <KpiTile
          label="Avg duration"
          value={loading ? '…' : fmtDuration(a?.avgDuration)}
        />
        <KpiTile
          label="Properties"
          value={loading ? '…' : (c?.propertiesTotal ?? 0).toLocaleString()}
          href="/mgh-ops/listings/"
          hint={`${c?.propertiesFeatured ?? 0} featured`}
        />
        <KpiTile
          label="Featured"
          value={loading ? '…' : (c?.propertiesFeatured ?? 0).toLocaleString()}
          href="/mgh-ops/featured/"
        />
        <KpiTile
          label="Pending / unverified"
          value={
            loading
              ? '…'
              : `${c?.propertiesPending ?? 0} / ${c?.propertiesUnverified ?? 0}`
          }
          href="/mgh-ops/moderation/"
        />
        <KpiTile
          label="Users"
          value={loading ? '…' : (c?.usersTotal ?? 0).toLocaleString()}
          href="/mgh-ops/users/"
        />
        <KpiTile
          label="Agents"
          value={loading ? '…' : (c?.agentsTotal ?? 0).toLocaleString()}
          href="/mgh-ops/agents/"
        />
        <KpiTile
          label="Open contacts"
          value={loading ? '…' : (c?.contactsOpen ?? 0).toLocaleString()}
          href="/mgh-ops/contacts/"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Panel title="Top pages" className="lg:col-span-3" bodyClassName="pt-2">
          {loading || !a?.pageViews?.length ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {loading ? 'Loading chart…' : 'No page views in this range'}
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={a.pageViews.map((p) => ({
                    name: p.page.length > 28 ? `${p.page.slice(0, 26)}…` : p.page,
                    views: p.views,
                  }))}
                  margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel
          title="Pending queues"
          className="lg:col-span-2"
          actions={
            <Link href="/mgh-ops/moderation/" className="text-xs font-semibold text-blue-700 hover:underline">
              Moderation →
            </Link>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Listings needing review
              </p>
              {!stats?.queues.moderation?.length ? (
                <p className="text-sm text-slate-400">Queue is clear</p>
              ) : (
                <ul className="space-y-2">
                  {stats.queues.moderation.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <p className="truncate font-semibold text-slate-800">{p.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {p.city} · {p.status}
                        {!p.isVerified ? ' · unverified' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Unread contacts
                </p>
                <Link
                  href="/mgh-ops/contacts/"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Inbox →
                </Link>
              </div>
              {!stats?.queues.contacts?.length ? (
                <p className="text-sm text-slate-400">No open leads</p>
              ) : (
                <ul className="space-y-2">
                  {stats.queues.contacts.map((cItem) => (
                    <li
                      key={cItem.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <p className="truncate font-semibold text-slate-800">{cItem.subject}</p>
                      <p className="text-[11px] text-slate-500">
                        {cItem.name} · {cItem.email}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
