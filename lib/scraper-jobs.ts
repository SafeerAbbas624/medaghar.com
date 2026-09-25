/**
 * Background jobs for the competitor scraper (tools/compare).
 *
 * The app runs as a pm2 cluster, so no job state lives in memory: each job is
 * a folder under storage/scraper/<id>/ holding job.json (what was asked),
 * log.txt, progress.json (scrape.py), status.json (written by run_job.py when
 * the job ends) and the output CSVs. The python process is detached, so a
 * reload of the site does not kill a running scrape.
 */

import { spawn } from 'child_process'
import { promises as fs, createReadStream, existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export const SCRAPER_SITES = ['zameen', 'lamudi', 'graana', 'nobroker', 'propertyonline', 'olx'] as const
const TOOL_DIR = path.join(process.cwd(), 'tools', 'compare')
const JOBS_DIR = process.env.SCRAPER_JOBS_DIR || path.join(process.cwd(), 'storage', 'scraper')

export type JobKind = 'scrape' | 'compare'
export type JobStatus = 'running' | 'finished' | 'failed' | 'stopped'

export interface ScrapeParams {
  cities: string[]
  sites: string[]
  days: number
  delay: number
  photos: number
  photoDelay: number
  maxPages: number
  limit: number
  cityIds: string[] // "Sialkot=480"
  olxUrls: string[]
}

export interface CompareParams {
  scrapeJobs: string[]
  minSites: number
  photos: number
  countMirrors: boolean
  mineName: string
}

export interface JobInfo {
  id: string
  kind: JobKind
  label: string
  createdAt: number
  pid: number
  params: ScrapeParams | CompareParams
  resumedFrom?: string
}

export interface JobView extends JobInfo {
  status: JobStatus
  endedAt?: number
  counts?: Record<string, number>
  sites?: Record<string, string>
  files: { name: string; size: number }[]
  logTail: string
}

const ID_RE = /^[a-z0-9-]{8,64}$/
/** Files the page may download, per job kind. */
const DOWNLOADABLE = ['competitors.csv', 'mine.matched.csv', 'mine.skip-ids.csv', 'log.txt']

function jobDir(id: string): string {
  if (!ID_RE.test(id)) throw new Error('bad job id')
  return path.join(JOBS_DIR, id)
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'EPERM'
  }
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T
  } catch {
    return null
  }
}

async function tail(file: string, bytes = 6000): Promise<string> {
  try {
    const fh = await fs.open(file, 'r')
    try {
      const { size } = await fh.stat()
      const start = Math.max(0, size - bytes)
      const buf = Buffer.alloc(size - start)
      await fh.read(buf, 0, buf.length, start)
      const text = buf.toString('utf8')
      return start > 0 ? text.slice(text.indexOf('\n') + 1) : text
    } finally {
      await fh.close()
    }
  } catch {
    return ''
  }
}

export async function getJob(id: string): Promise<JobView | null> {
  const dir = jobDir(id)
  const info = await readJson<JobInfo>(path.join(dir, 'job.json'))
  if (!info) return null
  const ended = await readJson<{ status: JobStatus; endedAt: number }>(path.join(dir, 'status.json'))
  // No status file and no process means it died without the wrapper noticing
  // (e.g. the server rebooted).
  const status: JobStatus = ended?.status ?? (alive(info.pid) ? 'running' : 'failed')
  const progress = await readJson<{ counts: Record<string, number>; sites: Record<string, string> }>(
    path.join(dir, 'progress.json')
  )
  const files: { name: string; size: number }[] = []
  for (const name of DOWNLOADABLE) {
    try {
      const st = await fs.stat(path.join(dir, name))
      files.push({ name, size: st.size })
    } catch {
      /* not produced (yet) */
    }
  }
  return {
    ...info,
    status,
    endedAt: ended?.endedAt,
    counts: progress?.counts,
    sites: progress?.sites,
    files,
    logTail: await tail(path.join(dir, 'log.txt')),
  }
}

export async function listJobs(): Promise<JobView[]> {
  let ids: string[] = []
  try {
    ids = (await fs.readdir(JOBS_DIR)).filter((d) => ID_RE.test(d))
  } catch {
    return []
  }
  const jobs = (await Promise.all(ids.map(getJob))).filter((j): j is JobView => j !== null)
  return jobs.sort((a, b) => b.createdAt - a.createdAt)
}

function launch(dir: string, script: string, args: string[]): number {
  const child = spawn('python3', [path.join(TOOL_DIR, 'run_job.py'), dir, script, ...args], {
    cwd: TOOL_DIR,
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
  if (!child.pid) throw new Error('could not start python3')
  return child.pid
}

async function newJobDir(): Promise<{ id: string; dir: string }> {
  const id = `${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}-${randomUUID().slice(0, 8)}`
  const dir = jobDir(id)
  await fs.mkdir(dir, { recursive: true })
  return { id, dir }
}

function scrapeArgs(p: ScrapeParams, dir: string, resume: boolean): string[] {
  const args = [
    '--cities', p.cities.join(','),
    '--sites', p.sites.join(','),
    '--days', String(p.days),
    '--delay', String(p.delay),
    '--photos', String(p.photos),
    '--photo-delay', String(p.photoDelay),
    '--max-pages', String(p.maxPages),
    '--out', path.join(dir, 'competitors.csv'),
    '--progress-file', path.join(dir, 'progress.json'),
  ]
  if (p.limit) args.push('--limit', String(p.limit))
  for (const c of p.cityIds) args.push('--city-id', c)
  for (const u of p.olxUrls) args.push('--olx-url', u)
  if (resume) args.push('--resume')
  return args
}

async function assertNoScrapeRunning() {
  const running = (await listJobs()).find((j) => j.kind === 'scrape' && j.status === 'running')
  if (running) throw new Error(`Scrape ${running.id} is still running; stop it first`)
}

export async function startScrape(p: ScrapeParams): Promise<string> {
  await assertNoScrapeRunning()
  const { id, dir } = await newJobDir()
  const pid = launch(dir, 'scrape.py', scrapeArgs(p, dir, false))
  const info: JobInfo = {
    id,
    kind: 'scrape',
    label: `${p.cities.join(', ')} · ${p.sites.join(', ')}`,
    createdAt: Date.now(),
    pid,
    params: p,
  }
  await fs.writeFile(path.join(dir, 'job.json'), JSON.stringify(info, null, 2))
  return id
}

/** Continue a stopped or failed scrape in place, skipping listings already saved. */
export async function resumeScrape(id: string): Promise<void> {
  const job = await getJob(id)
  if (!job || job.kind !== 'scrape') throw new Error('No such scrape')
  if (job.status === 'running') throw new Error('Already running')
  await assertNoScrapeRunning()
  const dir = jobDir(id)
  await fs.rm(path.join(dir, 'status.json'), { force: true })
  const pid = launch(dir, 'scrape.py', scrapeArgs(job.params as ScrapeParams, dir, true))
  const { status: _s, endedAt: _e, counts: _c, sites: _si, files: _f, logTail: _l, ...info } = job
  void [_s, _e, _c, _si, _f, _l]
  await fs.writeFile(path.join(dir, 'job.json'), JSON.stringify({ ...info, pid }, null, 2))
}

export async function startCompare(p: CompareParams, mineCsv: Buffer): Promise<string> {
  const theirs: string[] = []
  for (const sid of p.scrapeJobs) {
    const f = path.join(jobDir(sid), 'competitors.csv')
    if (!existsSync(f)) throw new Error(`Scrape ${sid} has no results yet`)
    theirs.push(f)
  }
  if (!theirs.length) throw new Error('Pick at least one scrape')
  const { id, dir } = await newJobDir()
  await fs.writeFile(path.join(dir, 'mine.csv'), mineCsv)
  const args = ['--mine', path.join(dir, 'mine.csv'), '--min-sites', String(p.minSites), '--photos', String(p.photos)]
  for (const t of theirs) args.push('--theirs', t)
  if (p.countMirrors) args.push('--count-mirrors')
  const pid = launch(dir, 'compare.py', args)
  const info: JobInfo = {
    id,
    kind: 'compare',
    label: `${p.mineName} vs ${p.scrapeJobs.length} scrape(s)`,
    createdAt: Date.now(),
    pid,
    params: p,
  }
  await fs.writeFile(path.join(dir, 'job.json'), JSON.stringify(info, null, 2))
  return id
}

export async function stopJob(id: string): Promise<void> {
  const job = await getJob(id)
  if (!job) throw new Error('No such job')
  if (job.status !== 'running') return
  // run_job.py turns SIGTERM into SIGINT for the scraper, which saves and exits.
  process.kill(job.pid, 'SIGTERM')
}

export async function deleteJob(id: string): Promise<void> {
  const job = await getJob(id)
  if (!job) return
  if (job.status === 'running') throw new Error('Stop the job first')
  await fs.rm(jobDir(id), { recursive: true, force: true })
}

export function openJobFile(id: string, name: string) {
  if (!DOWNLOADABLE.includes(name)) throw new Error('bad file')
  const file = path.join(jobDir(id), name)
  if (!existsSync(file)) return null
  return createReadStream(file)
}
