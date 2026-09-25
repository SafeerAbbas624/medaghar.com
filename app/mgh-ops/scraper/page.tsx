'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader, Panel } from '@/components/mgh-ops/ui'

type Status = 'running' | 'finished' | 'failed' | 'stopped'

interface Job {
  id: string
  kind: 'scrape' | 'compare'
  label: string
  createdAt: number
  endedAt?: number
  status: Status
  counts?: Record<string, number>
  sites?: Record<string, string>
  files: { name: string; size: number }[]
  logTail: string
  params: Record<string, unknown>
}

const ALL_SITES = ['zameen', 'lamudi', 'graana', 'nobroker', 'propertyonline', 'olx']
const SITE_NOTES: Record<string, string> = {
  zameen: 'Phones, pins, cover photo',
  lamudi: 'Mirror of Zameen; counted as one site when comparing',
  graana: 'Phones, pins, all photos',
  nobroker: 'Small inventory',
  propertyonline: 'No map pins',
  olx: 'Blocked by Cloudflare from this server; needs search URLs below',
}

const STATUS_STYLE: Record<Status, string> = {
  running: 'bg-cyan-100 text-cyan-800',
  finished: 'bg-emerald-100 text-emerald-800',
  stopped: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
}
const SITE_STATE_STYLE: Record<string, string> = {
  running: 'text-cyan-700',
  done: 'text-emerald-700',
  blocked: 'text-red-700',
  error: 'text-red-700',
}

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none'
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

function size(n: number) {
  return n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`
}

function duration(from: number, to?: number) {
  const s = Math.round(((to ? to * 1000 : Date.now()) - from) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m ${s % 60}s`
}

export default function ScraperPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [openLog, setOpenLog] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null)
  const toast = {
    success: (text: string) => setNotice({ text, ok: true }),
    error: (text: string) => setNotice({ text, ok: false }),
  }

  const [form, setForm] = useState({
    cities: 'Lahore',
    sites: ALL_SITES.filter((s) => s !== 'olx'),
    days: 15,
    delay: 3,
    photos: 1,
    photoDelay: 0.5,
    maxPages: 2000,
    limit: 0,
    cityIds: '',
    olxUrls: '',
  })
  const [cmp, setCmp] = useState({ file: null as File | null, scrapeJobs: [] as string[], minSites: 3, photos: 2, countMirrors: false })

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/scraper', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setJobs(data.jobs)
      else setNotice({ text: data.error || 'Could not load jobs', ok: false })
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Poll while anything is running.
  const anyRunning = jobs.some((j) => j.status === 'running')
  useEffect(() => {
    if (!anyRunning) return
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [anyRunning, load])

  async function startScrape(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Scrape started')
      await load()
    } catch (err) {
      toast.error((err as Error).message || 'Could not start')
    } finally {
      setBusy(false)
    }
  }

  async function startCompare(e: React.FormEvent) {
    e.preventDefault()
    if (!cmp.file) return toast.error('Choose your listings CSV')
    if (!cmp.scrapeJobs.length) return toast.error('Tick at least one scrape to compare against')
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('mine', cmp.file)
      fd.append('scrapeJobs', cmp.scrapeJobs.join(','))
      fd.append('minSites', String(cmp.minSites))
      fd.append('photos', String(cmp.photos))
      fd.append('countMirrors', String(cmp.countMirrors))
      const res = await fetch('/api/admin/scraper', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Comparison started')
      await load()
    } catch (err) {
      toast.error((err as Error).message || 'Could not start')
    } finally {
      setBusy(false)
    }
  }

  async function act(id: string, action: 'stop' | 'resume' | 'delete') {
    if (action === 'delete' && !confirm('Delete this job and its files?')) return
    const res = await fetch(`/api/admin/scraper/${id}`, {
      method: action === 'delete' ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: action === 'delete' ? undefined : JSON.stringify({ action }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) toast.error(data.error || 'Failed')
    else if (action === 'stop') toast.success('Stopping; results so far are kept')
    setTimeout(load, 800)
  }

  const scrapesWithData = jobs.filter((j) => j.kind === 'scrape' && j.files.some((f) => f.name === 'competitors.csv'))
  const scrapeRunning = jobs.some((j) => j.kind === 'scrape' && j.status === 'running')

  return (
    <div>
      <PageHeader
        title="Competitor Scraper"
        subtitle="Collect recent listings from other portals, then find which of your listings are already on them"
      />

      {notice && (
        <div
          className={`mb-4 flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm ${
            notice.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="font-semibold">
            ×
          </button>
        </div>
      )}

      <Panel title="1 · New scrape">
        <form onSubmit={startScrape} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>Cities (comma separated)</label>
              <input className={input} value={form.cities} onChange={(e) => setForm({ ...form, cities: e.target.value })} />
              <p className="mt-1 text-xs text-slate-500">
                Built in for Zameen/Lamudi: Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Gujranwala,
                Hyderabad, Gujrat, Jhelum. Others need a city id (Advanced).
              </p>
            </div>
            <div>
              <label className={label}>Sites</label>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {ALL_SITES.map((s) => (
                  <label key={s} className="flex items-start gap-2 text-sm" title={SITE_NOTES[s]}>
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={form.sites.includes(s)}
                      onChange={(e) =>
                        setForm({ ...form, sites: e.target.checked ? [...form.sites, s] : form.sites.filter((x) => x !== s) })
                      }
                    />
                    <span>
                      <span className="font-medium text-slate-800">{s}</span>
                      <span className="block text-xs text-slate-500">{SITE_NOTES[s]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                ['days', 'Posted within (days)', 1],
                ['delay', 'Seconds between pages', 0.5],
                ['photos', 'Photos to fingerprint', 1],
                ['photoDelay', 'Seconds between photos', 0.1],
                ['maxPages', 'Max pages per category', 1],
                ['limit', 'Stop each site after (0 = no limit)', 1],
              ] as const
            ).map(([k, text, step]) => (
              <div key={k}>
                <label className={label}>{text}</label>
                <input
                  type="number"
                  min={0}
                  step={step}
                  className={input}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>

          <details className="rounded-lg border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">Advanced: city ids and OLX</summary>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className={label}>Zameen/Lamudi city ids, one per line</label>
                <textarea
                  rows={3}
                  className={input}
                  placeholder="Sialkot=480"
                  value={form.cityIds}
                  onChange={(e) => setForm({ ...form, cityIds: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Open the city on zameen.com: /Homes/Sialkot-<b>480</b>-1.html
                </p>
              </div>
              <div>
                <label className={label}>OLX search URLs, one per line</label>
                <textarea
                  rows={3}
                  className={input}
                  placeholder="https://www.olx.com.pk/…  (sorted by newest)"
                  value={form.olxUrls}
                  onChange={(e) => setForm({ ...form, olxUrls: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  OLX currently blocks this server with a Cloudflare challenge; the scrape skips it when that happens.
                </p>
              </div>
            </div>
          </details>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy || scrapeRunning}
              className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              Start scrape
            </button>
            {scrapeRunning && <span className="text-sm text-slate-500">A scrape is running; one at a time.</span>}
            <span className="text-xs text-slate-500">
              Public pages only, robots.txt obeyed, one request per site every few seconds. Lahore houses on Zameen alone take
              about 1 h plus photos.
            </span>
          </div>
        </form>
      </Panel>

      <Panel title="2 · Compare your listings">
        <form onSubmit={startCompare} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>Your listings CSV</label>
              <input
                type="file"
                accept=".csv,text/csv"
                className="text-sm"
                onChange={(e) => setCmp({ ...cmp, file: e.target.files?.[0] ?? null })}
              />
              <p className="mt-1 text-xs text-slate-500">
                Same columns as the import (id, city, area, price, bedrooms, marla, latitude/longitude or Google Maps link,
                contactPhone, images…). Keep an <b>id</b> column so the skip list works with the importer.
              </p>
            </div>
            <div>
              <label className={label}>Compare against</label>
              {scrapesWithData.length === 0 ? (
                <p className="text-sm text-slate-500">No scrape results yet.</p>
              ) : (
                <div className="max-h-36 space-y-1 overflow-auto">
                  {scrapesWithData.map((j) => (
                    <label key={j.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={cmp.scrapeJobs.includes(j.id)}
                        onChange={(e) =>
                          setCmp({
                            ...cmp,
                            scrapeJobs: e.target.checked ? [...cmp.scrapeJobs, j.id] : cmp.scrapeJobs.filter((x) => x !== j.id),
                          })
                        }
                      />
                      <span className="text-slate-800">{j.label}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(j.createdAt).toLocaleString()} ·{' '}
                        {Object.values(j.counts ?? {}).reduce((a, b) => a + b, 0).toLocaleString()} listings
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-40">
              <label className={label}>Skip if on at least</label>
              <select className={input} value={cmp.minSites} onChange={(e) => setCmp({ ...cmp, minSites: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} site{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className={label}>Your photos per row</label>
              <input
                type="number"
                min={0}
                max={5}
                className={input}
                value={cmp.photos}
                onChange={(e) => setCmp({ ...cmp, photos: Number(e.target.value) })}
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={cmp.countMirrors}
                onChange={(e) => setCmp({ ...cmp, countMirrors: e.target.checked })}
              />
              Count Lamudi separately from Zameen
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              Run comparison
            </button>
          </div>
        </form>
      </Panel>

      <Panel
        title="Jobs"
        actions={
          <button onClick={load} className="text-sm font-semibold text-cyan-700 hover:underline">
            Refresh
          </button>
        }
      >
        {!loaded ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-slate-500">No jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => {
              const total = Object.values(j.counts ?? {}).reduce((a, b) => a + b, 0)
              return (
                <div key={j.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
                      {j.kind}
                    </span>
                    <span className="font-semibold text-slate-800">{j.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[j.status]}`}>
                      {j.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(j.createdAt).toLocaleString()} · {duration(j.createdAt, j.endedAt)}
                    </span>
                    <div className="ml-auto flex flex-wrap gap-2">
                      {j.status === 'running' && (
                        <button
                          onClick={() => act(j.id, 'stop')}
                          className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Stop
                        </button>
                      )}
                      {j.kind === 'scrape' && (j.status === 'stopped' || j.status === 'failed') && (
                        <button
                          onClick={() => act(j.id, 'resume')}
                          disabled={scrapeRunning}
                          className="rounded-lg border border-cyan-300 px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"
                        >
                          Resume
                        </button>
                      )}
                      {j.status !== 'running' && (
                        <button
                          onClick={() => act(j.id, 'delete')}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {j.kind === 'scrape' && j.sites && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {Object.entries(j.sites).map(([site, st]) => (
                        <span key={site}>
                          <span className="font-medium text-slate-700">{site}</span>{' '}
                          <span className="text-slate-600">{(j.counts?.[site] ?? 0).toLocaleString()}</span>{' '}
                          <span className={`text-xs ${SITE_STATE_STYLE[st] ?? 'text-slate-500'}`}>{st}</span>
                        </span>
                      ))}
                      <span className="font-semibold text-slate-800">total {total.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    {j.files
                      .filter((f) => f.name !== 'log.txt')
                      .map((f) => (
                        <a
                          key={f.name}
                          href={`/api/admin/scraper/${j.id}/download?file=${f.name}`}
                          className="font-semibold text-cyan-700 hover:underline"
                        >
                          ⬇ {f.name} ({size(f.size)})
                        </a>
                      ))}
                    <button
                      onClick={() => setOpenLog(openLog === j.id ? null : j.id)}
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      {openLog === j.id ? 'Hide log' : 'Show log'}
                    </button>
                    {j.files.some((f) => f.name === 'log.txt') && (
                      <a href={`/api/admin/scraper/${j.id}/download?file=log.txt`} className="text-xs text-slate-500 hover:underline">
                        full log
                      </a>
                    )}
                  </div>

                  {openLog === j.id && (
                    <pre className="mt-2 max-h-72 overflow-auto rounded bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
                      {j.logTail || '(empty)'}
                    </pre>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
