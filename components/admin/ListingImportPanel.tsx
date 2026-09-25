'use client'

import { useState } from 'react'
import Papa from 'papaparse'

interface ImportRow {
  row: number
  id: string
  outcome: string
  reasons: string
  warnings: string
  slug?: string
}

interface ImportResponse {
  error?: string
  dryRun?: boolean
  batch?: string
  counts?: Record<string, number>
  ignoredColumns?: string[]
  rows?: ImportRow[]
}

const OUTCOME_STYLE: Record<string, string> = {
  imported: 'bg-emerald-100 text-emerald-800',
  'would-import': 'bg-emerald-50 text-emerald-700',
  'imported-hidden': 'bg-amber-100 text-amber-800',
  duplicate: 'bg-slate-100 text-slate-700',
  rejected: 'bg-red-100 text-red-800',
}

/**
 * Upload a listings CSV through the import pipeline: check first, then
 * import. Large files are for scripts/import-listings.ts on the server.
 */
export default function ListingImportPanel() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ImportResponse | null>(null)

  async function run(commit: boolean) {
    if (!file) return
    setBusy(true)
    setResult(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('table', 'Property')
    fd.append('commit', String(commit))
    try {
      const res = await fetch('/api/admin/database/import', { method: 'POST', body: fd })
      setResult(await res.json())
    } catch {
      setResult({ error: 'Upload failed' })
    } finally {
      setBusy(false)
    }
  }

  function downloadReport() {
    if (!result?.rows) return
    const csv = Papa.unparse(result.rows)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `import-report-${result.batch ?? 'listings'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Up to 300 rows per upload. Rows must be posted within the last 15 days. Location can be latitude/longitude or
        a Google Maps link. Check first; nothing is written until you import.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setResult(null)
          }}
          className="text-sm"
        />
        <button
          onClick={() => run(false)}
          disabled={!file || busy}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Check file'}
        </button>
        <button
          onClick={() => {
            if (confirm('Import these listings to the live site?')) run(true)
          }}
          disabled={!file || busy || !result?.dryRun || !result.counts?.['would-import']}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          Import {result?.dryRun && result.counts?.['would-import'] ? `${result.counts['would-import']} listings` : ''}
        </button>
      </div>

      {result?.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{result.error}</p>}

      {result?.counts && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-slate-700">{result.dryRun ? 'Check result:' : 'Imported:'}</span>
            {Object.entries(result.counts).map(([k, v]) => (
              <span key={k} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${OUTCOME_STYLE[k] ?? ''}`}>
                {k} {v}
              </span>
            ))}
            {result.rows && (
              <button onClick={downloadReport} className="ml-auto text-sm font-semibold text-cyan-700 hover:underline">
                Download report
              </button>
            )}
          </div>
          {result.ignoredColumns && result.ignoredColumns.length > 0 && (
            <p className="text-xs text-slate-500">Ignored columns: {result.ignoredColumns.join(', ')}</p>
          )}
          {result.rows && (
            <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Outcome</th>
                    <th className="px-3 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows
                    .filter((r) => (r.outcome !== 'imported' && r.outcome !== 'would-import') || r.warnings)
                    .map((r) => (
                      <tr key={r.row} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-2 text-slate-500">
                          {r.row}
                          {r.id ? ` · ${r.id}` : ''}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 font-semibold ${OUTCOME_STYLE[r.outcome] ?? ''}`}>
                            {r.outcome}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {r.reasons && <div className="text-red-700">{r.reasons}</div>}
                          {r.warnings && <div className="text-slate-500">{r.warnings}</div>}
                          {r.slug && (
                            <a href={`/properties/${r.slug}`} target="_blank" className="text-cyan-700 hover:underline">
                              view
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
