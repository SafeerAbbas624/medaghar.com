'use client'

import { useMemo, useState } from 'react'
import { FaCalculator } from 'react-icons/fa'

function formatPkr(amount: number): string {
  if (!isFinite(amount)) return '—'
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Crore`
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lakh`
  return `PKR ${Math.round(amount).toLocaleString()}`
}

export default function MortgageCalculator() {
  const [price, setPrice] = useState(15000000) // 1.5 crore
  const [downPaymentPct, setDownPaymentPct] = useState(25)
  const [rate, setRate] = useState(14)
  const [years, setYears] = useState(20)

  const result = useMemo(() => {
    const loan = price * (1 - downPaymentPct / 100)
    const r = rate / 100 / 12
    const n = years * 12
    const monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPaid = monthly * n
    return {
      loan,
      downPayment: price - loan,
      monthly,
      totalPaid,
      totalMarkup: totalPaid - loan,
    }
  }, [price, downPaymentPct, rate, years])

  return (
    <div className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[34px]">
        {/* Inputs */}
        <div className="space-y-[21px]">
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Property Price: <span className="text-cyan-700">{formatPkr(price)}</span>
            </label>
            <input
              type="range"
              min={1000000}
              max={150000000}
              step={500000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
            <input
              type="number"
              value={price}
              min={0}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="mt-[8px] w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              aria-label="Property price in PKR"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Down Payment: <span className="text-cyan-700">{downPaymentPct}% ({formatPkr(result.downPayment)})</span>
            </label>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Pakistani banks typically require 15–30% down payment.
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Profit / Markup Rate: <span className="text-cyan-700">{rate}% per year</span>
            </label>
            <input
              type="range"
              min={5}
              max={30}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Rates track KIBOR / SBP policy rate — check current bank rates before deciding.
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Financing Tenure: <span className="text-cyan-700">{years} years</span>
            </label>
            <input
              type="range"
              min={3}
              max={25}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-cyan-700"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-cyan-50 rounded-2xl p-[21px] lg:p-[34px] flex flex-col justify-center">
          <div className="flex items-center gap-[8px] text-cyan-700 font-semibold text-[14px] mb-[13px]">
            <FaCalculator /> Your Estimated Installment
          </div>
          <div className="text-[34px] font-bold text-gray-900 mb-[3px]">
            PKR {Math.round(result.monthly).toLocaleString()}
          </div>
          <div className="text-[14px] text-gray-600 mb-[21px]">per month for {years} years</div>

          <div className="space-y-[13px] text-[14px]">
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Financing Amount</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.loan)}</span>
            </div>
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Down Payment</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.downPayment)}</span>
            </div>
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Total Markup / Profit</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.totalMarkup)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount Payable</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.totalPaid)}</span>
            </div>
          </div>

          <p className="text-[12px] text-gray-500 mt-[21px]">
            Estimate only, using standard amortization. Actual bank offers include processing
            fees, property takaful/insurance and life coverage, and Islamic products calculate
            rent/unit purchase differently. Always compare official bank quotations.
          </p>
        </div>
      </div>
    </div>
  )
}
