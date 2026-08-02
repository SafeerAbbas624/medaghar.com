'use client'

import { useMemo, useState } from 'react'

type MarlaStandard = 225 | 272.25

interface Unit {
  key: string
  label: string
  /** square feet per unit (marla/kanal depend on the chosen standard) */
  toSqFt: (marlaSqFt: MarlaStandard) => number
}

const UNITS: Unit[] = [
  { key: 'marla', label: 'Marla', toSqFt: (m) => m },
  { key: 'kanal', label: 'Kanal', toSqFt: (m) => m * 20 },
  { key: 'sqft', label: 'Square Feet', toSqFt: () => 1 },
  { key: 'sqyd', label: 'Square Yards (Gaz)', toSqFt: () => 9 },
  { key: 'sqm', label: 'Square Metres', toSqFt: () => 10.7639 },
  { key: 'acre', label: 'Acres', toSqFt: () => 43560 },
  { key: 'murabba', label: 'Murabba (25 acres)', toSqFt: () => 43560 * 25 },
]

function formatNumber(n: number): string {
  if (!isFinite(n)) return '—'
  if (n === 0) return '0'
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return n.toLocaleString(undefined, { maximumSignificantDigits: 3 })
}

export default function AreaConverter() {
  const [value, setValue] = useState(5)
  const [fromUnit, setFromUnit] = useState('marla')
  const [standard, setStandard] = useState<MarlaStandard>(225)

  const results = useMemo(() => {
    const from = UNITS.find((u) => u.key === fromUnit)!
    const sqft = value * from.toSqFt(standard)
    return UNITS.map((u) => ({ ...u, amount: sqft / u.toSqFt(standard) }))
  }, [value, fromUnit, standard])

  return (
    <div className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[21px] mb-[21px]">
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">Value</label>
          <input
            type="number"
            value={value}
            min={0}
            step="any"
            onChange={(e) => setValue(Number(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-[13px] py-[10px] text-[16px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            aria-label="Area value"
          />
        </div>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">Unit</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-[13px] py-[10px] text-[16px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white"
          >
            {UNITS.map((u) => (
              <option key={u.key} value={u.key}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Marla standard toggle */}
      <div className="mb-[21px]">
        <span className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
          Marla Standard
        </span>
        <div className="flex flex-col sm:flex-row gap-[8px]">
          <button
            onClick={() => setStandard(225)}
            className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
              standard === 225
                ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Modern — 225 sq ft (DHA, Bahria, planned schemes)
          </button>
          <button
            onClick={() => setStandard(272.25)}
            className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
              standard === 272.25
                ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Traditional — 272.25 sq ft (old city areas, KPK, fard records)
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cyan-50">
              <th className="text-left px-[13px] py-[10px] text-cyan-800 font-semibold rounded-l-lg">Unit</th>
              <th className="text-right px-[13px] py-[10px] text-cyan-800 font-semibold rounded-r-lg">Equivalent</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.key} className={`border-b border-gray-100 ${r.key === fromUnit ? 'bg-cyan-50/50' : ''}`}>
                <td className="px-[13px] py-[10px] text-gray-700">{r.label}</td>
                <td className="px-[13px] py-[10px] text-right font-semibold text-gray-900">
                  {formatNumber(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
