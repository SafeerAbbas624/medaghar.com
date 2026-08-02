'use client'

import { useMemo, useState } from 'react'
import { FaFileInvoiceDollar } from 'react-icons/fa'

function formatPkr(amount: number): string {
  if (!isFinite(amount)) return '—'
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Crore`
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lakh`
  return `PKR ${Math.round(amount).toLocaleString()}`
}

type Mode = 'buying' | 'selling'
type FilerStatus = 'filer' | 'late' | 'non'
type Province = 'punjab' | 'sindh' | 'kpk' | 'ict' | 'balochistan'

/** Indicative FY2025-26 advance tax u/s 236K (buyer), % of FBR/DC value */
const ADVANCE_236K: Record<FilerStatus, number> = { filer: 3, late: 6, non: 10.5 }
/** Indicative FY2025-26 advance tax u/s 236C (seller), % of FBR/DC value */
const ADVANCE_236C: Record<FilerStatus, number> = { filer: 3, late: 6, non: 10 }
/** Indicative stamp duty (buyer), % of value */
const STAMP_DUTY: Record<Province, number> = {
  punjab: 1,
  sindh: 1.5,
  kpk: 2,
  ict: 1,
  balochistan: 2,
}

const STATUS_LABELS: Record<FilerStatus, string> = {
  filer: 'Filer',
  late: 'Late Filer',
  non: 'Non-Filer',
}

const PROVINCE_LABELS: Record<Province, string> = {
  punjab: 'Punjab',
  sindh: 'Sindh',
  kpk: 'KPK',
  ict: 'Islamabad ICT',
  balochistan: 'Balochistan',
}

export default function PropertyTaxCalculator() {
  const [value, setValue] = useState(15000000) // 1.5 crore
  const [mode, setMode] = useState<Mode>('buying')
  const [status, setStatus] = useState<FilerStatus>('filer')
  const [province, setProvince] = useState<Province>('punjab')
  const [advanceRate, setAdvanceRate] = useState(ADVANCE_236K.filer)
  const [stampRate, setStampRate] = useState(STAMP_DUTY.punjab)

  const selectMode = (m: Mode) => {
    setMode(m)
    setAdvanceRate(m === 'buying' ? ADVANCE_236K[status] : ADVANCE_236C[status])
  }

  const selectStatus = (s: FilerStatus) => {
    setStatus(s)
    setAdvanceRate(mode === 'buying' ? ADVANCE_236K[s] : ADVANCE_236C[s])
  }

  const selectProvince = (p: Province) => {
    setProvince(p)
    setStampRate(STAMP_DUTY[p])
  }

  const result = useMemo(() => {
    const items =
      mode === 'buying'
        ? [
            {
              label: `Advance tax u/s 236K — ${STATUS_LABELS[status]} (buyer)`,
              rate: advanceRate,
              amount: value * (advanceRate / 100),
            },
            {
              label: `Stamp duty — ${PROVINCE_LABELS[province]}`,
              rate: stampRate,
              amount: value * (stampRate / 100),
            },
          ]
        : [
            {
              label: `Advance tax u/s 236C — ${STATUS_LABELS[status]} (seller)`,
              rate: advanceRate,
              amount: value * (advanceRate / 100),
            },
          ]
    const total = items.reduce((sum, item) => sum + item.amount, 0)
    return {
      items,
      total,
      effectivePct: value > 0 ? (total / value) * 100 : 0,
    }
  }, [value, mode, status, province, advanceRate, stampRate])

  return (
    <div className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[34px]">
        {/* Inputs */}
        <div className="space-y-[21px]">
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Property Value: <span className="text-cyan-700">{formatPkr(value)}</span>
            </label>
            <input
              type="range"
              min={1000000}
              max={150000000}
              step={500000}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
            <input
              type="number"
              value={value}
              min={0}
              onChange={(e) => setValue(Number(e.target.value) || 0)}
              className="mt-[8px] w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              aria-label="Property value in PKR"
            />
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Use the FBR valuation table or DC value for your area — taxes are charged on
              whichever official value is higher, not the market price you negotiate.
            </p>
          </div>

          <div>
            <span className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              I am…
            </span>
            <div className="flex flex-col sm:flex-row gap-[8px]">
              <button
                onClick={() => selectMode('buying')}
                className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
                  mode === 'buying'
                    ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Buying
              </button>
              <button
                onClick={() => selectMode('selling')}
                className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
                  mode === 'selling'
                    ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Selling
              </button>
            </div>
          </div>

          <div>
            <span className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Tax Filer Status
            </span>
            <div className="flex flex-col sm:flex-row gap-[8px]">
              {(Object.keys(STATUS_LABELS) as FilerStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => selectStatus(s)}
                  className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
                    status === s
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Check your status on FBR&apos;s Active Taxpayer List (ATL). Late filers appear on
              the ATL but filed their return after the due date.
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Province / Territory
            </label>
            <select
              value={province}
              onChange={(e) => selectProvince(e.target.value as Province)}
              className="w-full border border-gray-300 rounded-lg px-[13px] py-[10px] text-[16px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white"
            >
              {(Object.keys(PROVINCE_LABELS) as Province[]).map((p) => (
                <option key={p} value={p}>{PROVINCE_LABELS[p]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[13px]">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
                Advance Tax Rate (%)
              </label>
              <input
                type="number"
                value={advanceRate}
                min={0}
                step={0.5}
                onChange={(e) => setAdvanceRate(Number(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                aria-label="Advance tax rate as percent of property value"
              />
            </div>
            {mode === 'buying' && (
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
                  Stamp Duty Rate (%)
                </label>
                <input
                  type="number"
                  value={stampRate}
                  min={0}
                  step={0.5}
                  onChange={(e) => setStampRate(Number(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  aria-label="Stamp duty rate as percent of property value"
                />
              </div>
            )}
          </div>
          <p className="text-[12px] text-gray-500">
            Pre-filled rates are indicative FY2025-26 figures — edit them if your transaction
            falls in a different tier or the rates have changed.
          </p>
        </div>

        {/* Results */}
        <div className="bg-cyan-50 rounded-2xl p-[21px] lg:p-[34px] flex flex-col justify-center">
          <div className="flex items-center gap-[8px] text-cyan-700 font-semibold text-[14px] mb-[13px]">
            <FaFileInvoiceDollar /> Estimated {mode === 'buying' ? 'Buyer' : 'Seller'} Taxes
          </div>
          <div className="text-[34px] font-bold text-gray-900 mb-[3px]">
            {formatPkr(result.total)}
          </div>
          <div className="text-[14px] text-gray-600 mb-[21px]">
            ≈ {result.effectivePct.toFixed(2)}% of property value
          </div>

          <div className="space-y-[13px] text-[14px]">
            {result.items.map((item) => (
              <div key={item.label} className="flex justify-between gap-[13px] border-b border-cyan-100 pb-[8px]">
                <span className="text-gray-600">{item.label} ({item.rate}%)</span>
                <span className="font-semibold text-gray-900 whitespace-nowrap">{formatPkr(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-gray-600">Total Estimated Tax</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.total)}</span>
            </div>
          </div>

          {mode === 'buying' && (
            <p className="text-[12px] text-gray-500 mt-[13px]">
              Provinces also charge a registration fee (commonly ~1%, often capped) plus mutation
              and transfer fees of the society or authority — budget extra for these.
            </p>
          )}

          <div className="bg-copper-50 border border-copper-200 rounded-lg p-[13px] mt-[21px]">
            <p className="text-[12px] text-copper-800 leading-relaxed">
              <strong>Important:</strong> these rates are indicative only. They change with every
              Finance Act, differ by property value tiers (non-filer rates on higher-value
              properties can be higher than shown), and provincial duties vary by location and
              property type. Always verify current rates with FBR, your provincial registrar or
              excise department, and a tax adviser before transacting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
