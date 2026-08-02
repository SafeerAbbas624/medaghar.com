'use client'

import { useMemo, useState } from 'react'
import { FaChartLine } from 'react-icons/fa'

function formatPkr(amount: number): string {
  if (!isFinite(amount)) return '—'
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Crore`
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lakh`
  return `PKR ${Math.round(amount).toLocaleString()}`
}

type Verdict = { label: string; className: string; note: string }

function getVerdict(grossYield: number): Verdict {
  if (!isFinite(grossYield) || grossYield <= 0) {
    return {
      label: '—',
      className: 'bg-slate-100 text-gray-600',
      note: 'Enter a property value and monthly rent to see how the yield compares.',
    }
  }
  if (grossYield < 3) {
    return {
      label: 'Low',
      className: 'bg-red-100 text-red-700',
      note: 'Below the typical 3–6% residential range — the price likely banks on capital gains rather than rent.',
    }
  }
  if (grossYield <= 6) {
    return {
      label: 'Typical',
      className: 'bg-copper-100 text-copper-700',
      note: 'Within the typical 3–6% gross range for Pakistani residential property.',
    }
  }
  return {
    label: 'Good',
    className: 'bg-cyan-100 text-cyan-700',
    note: 'Above the typical residential range — comparable to commercial yields of 6–9%.',
  }
}

export default function RentalYieldCalculator() {
  const [value, setValue] = useState(20000000) // 2 crore
  const [monthlyRent, setMonthlyRent] = useState(70000)
  const [maintenancePct, setMaintenancePct] = useState(1)
  const [vacancyMonths, setVacancyMonths] = useState(1)
  const [otherCosts, setOtherCosts] = useState(0)

  const result = useMemo(() => {
    const grossAnnualRent = monthlyRent * 12
    const grossYield = value > 0 ? (grossAnnualRent / value) * 100 : 0
    const collectedRent = monthlyRent * Math.max(0, 12 - vacancyMonths)
    const maintenanceCost = value * (maintenancePct / 100)
    const netAnnualIncome = collectedRent - maintenanceCost - otherCosts
    const netYield = value > 0 ? (netAnnualIncome / value) * 100 : 0
    return {
      grossAnnualRent,
      grossYield,
      collectedRent,
      maintenanceCost,
      netAnnualIncome,
      netYield,
      verdict: getVerdict(grossYield),
    }
  }, [value, monthlyRent, maintenancePct, vacancyMonths, otherCosts])

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
              Use the current market price (what you would pay today), not the price you bought at.
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Monthly Rent: <span className="text-cyan-700">PKR {Math.round(monthlyRent).toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={5000}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
            <input
              type="number"
              value={monthlyRent}
              min={0}
              onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
              className="mt-[8px] w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              aria-label="Monthly rent in PKR"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Maintenance &amp; Repairs: <span className="text-cyan-700">{maintenancePct}% of value / year</span>
            </label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.25}
              value={maintenancePct}
              onChange={(e) => setMaintenancePct(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
            <p className="text-[12px] text-gray-500 mt-[5px]">
              1% per year is a common rule of thumb; older houses cost more to maintain.
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Vacancy: <span className="text-cyan-700">{vacancyMonths} month{vacancyMonths === 1 ? '' : 's'} / year</span>
            </label>
            <input
              type="range"
              min={0}
              max={6}
              step={0.5}
              value={vacancyMonths}
              onChange={(e) => setVacancyMonths(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Months the property sits empty between tenants — 1 month/year is realistic.
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Annual Property Tax &amp; Other Costs (PKR)
            </label>
            <input
              type="number"
              value={otherCosts}
              min={0}
              onChange={(e) => setOtherCosts(Number(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              aria-label="Annual property tax and other costs in PKR"
            />
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Provincial property tax, society charges, agent commission — anything you pay yearly.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-cyan-50 rounded-2xl p-[21px] lg:p-[34px] flex flex-col justify-center">
          <div className="flex items-center gap-[8px] text-cyan-700 font-semibold text-[14px] mb-[13px]">
            <FaChartLine /> Your Rental Yield
          </div>
          <div className="flex items-baseline gap-[13px] mb-[3px]">
            <div className="text-[34px] font-bold text-gray-900">
              {result.grossYield.toFixed(2)}%
            </div>
            <span className={`text-[13px] font-semibold px-[13px] py-[3px] rounded-full ${result.verdict.className}`}>
              {result.verdict.label}
            </span>
          </div>
          <div className="text-[14px] text-gray-600 mb-[21px]">gross yield per year</div>

          <div className="space-y-[13px] text-[14px]">
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Gross Annual Rent</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.grossAnnualRent)}</span>
            </div>
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Rent Collected (after vacancy)</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.collectedRent)}</span>
            </div>
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Maintenance &amp; Other Costs</span>
              <span className="font-semibold text-gray-900">
                {formatPkr(result.maintenanceCost + otherCosts)}
              </span>
            </div>
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Net Annual Income</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.netAnnualIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Yield</span>
              <span className="font-semibold text-gray-900">{result.netYield.toFixed(2)}%</span>
            </div>
          </div>

          <p className="text-[13px] text-gray-700 mt-[21px]">{result.verdict.note}</p>
          <p className="text-[12px] text-gray-500 mt-[8px]">
            Context: Pakistani residential gross yields typically run 3–6%; commercial property
            runs 6–9%. Yield ignores capital gains — a low-yield plot can still outperform if
            prices rise.
          </p>
        </div>
      </div>
    </div>
  )
}
