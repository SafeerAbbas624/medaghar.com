'use client'

import { useMemo, useState } from 'react'
import { FaHardHat } from 'react-icons/fa'

function formatPkr(amount: number): string {
  if (!isFinite(amount)) return '—'
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Crore`
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lakh`
  return `PKR ${Math.round(amount).toLocaleString()}`
}

const MARLA_SQFT = 225

interface PlotOption {
  key: string
  label: string
  /** marlas on the modern 225 sq ft standard; null = custom covered area */
  marlas: number | null
}

const PLOT_OPTIONS: PlotOption[] = [
  { key: '3-marla', label: '3 Marla', marlas: 3 },
  { key: '5-marla', label: '5 Marla', marlas: 5 },
  { key: '7-marla', label: '7 Marla', marlas: 7 },
  { key: '10-marla', label: '10 Marla', marlas: 10 },
  { key: '1-kanal', label: '1 Kanal', marlas: 20 },
  { key: '2-kanal', label: '2 Kanal', marlas: 40 },
  { key: 'custom', label: 'Custom covered area (sq ft)', marlas: null },
]

type Storeys = 'single' | 'double'
type Quality = 'standard' | 'premium' | 'luxury'

const FINISHING_DEFAULTS: Record<Quality, number> = {
  standard: 2300,
  premium: 3500,
  luxury: 5500,
}

const QUALITY_LABELS: Record<Quality, string> = {
  standard: 'Standard',
  premium: 'Premium',
  luxury: 'Luxury',
}

const GREY_STAGES = [
  { label: 'Foundation & excavation', pct: 12 },
  { label: 'Structure & roof (RCC, steel, concrete)', pct: 38 },
  { label: 'Brickwork & walls', pct: 20 },
  { label: 'Plaster', pct: 10 },
  { label: 'Electrical & plumbing rough-in', pct: 12 },
  { label: 'Doors & window frames', pct: 8 },
]

export default function ConstructionCostCalculator() {
  const [plotKey, setPlotKey] = useState('5-marla')
  const [customArea, setCustomArea] = useState(2000)
  const [storeys, setStoreys] = useState<Storeys>('double')
  const [quality, setQuality] = useState<Quality>('standard')
  const [greyRate, setGreyRate] = useState(3200)
  const [finishingRate, setFinishingRate] = useState(FINISHING_DEFAULTS.standard)

  const selectQuality = (q: Quality) => {
    setQuality(q)
    setFinishingRate(FINISHING_DEFAULTS[q])
  }

  const isCustom = plotKey === 'custom'

  const result = useMemo(() => {
    const plot = PLOT_OPTIONS.find((p) => p.key === plotKey)!
    const coveredArea =
      plot.marlas === null
        ? customArea
        : plot.marlas * MARLA_SQFT * (storeys === 'single' ? 0.85 : 1.7)
    const greyCost = coveredArea * greyRate
    const finishingCost = coveredArea * finishingRate
    return {
      coveredArea,
      greyCost,
      finishingCost,
      total: greyCost + finishingCost,
    }
  }, [plotKey, customArea, storeys, greyRate, finishingRate])

  return (
    <div className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[34px]">
        {/* Inputs */}
        <div className="space-y-[21px]">
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Plot Size
            </label>
            <select
              value={plotKey}
              onChange={(e) => setPlotKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-[13px] py-[10px] text-[16px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white"
            >
              {PLOT_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Uses the modern 225 sq ft marla (DHA, Bahria, planned schemes).
            </p>
          </div>

          {isCustom && (
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
                Covered Area: <span className="text-cyan-700">{Math.round(customArea).toLocaleString()} sq ft</span>
              </label>
              <input
                type="number"
                value={customArea}
                min={0}
                onChange={(e) => setCustomArea(Number(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                aria-label="Custom covered area in square feet"
              />
            </div>
          )}

          {!isCustom && (
            <div>
              <span className="block text-[14px] font-semibold text-gray-700 mb-[8px]">Storeys</span>
              <div className="flex flex-col sm:flex-row gap-[8px]">
                <button
                  onClick={() => setStoreys('single')}
                  className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
                    storeys === 'single'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Single Storey (≈ 85% of plot)
                </button>
                <button
                  onClick={() => setStoreys('double')}
                  className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
                    storeys === 'double'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Double Storey (≈ 170% of plot)
                </button>
              </div>
            </div>
          )}

          <div>
            <span className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
              Finishing Quality
            </span>
            <div className="flex flex-col sm:flex-row gap-[8px]">
              {(Object.keys(FINISHING_DEFAULTS) as Quality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => selectQuality(q)}
                  className={`flex-1 px-[13px] py-[10px] rounded-lg text-[14px] font-medium border-2 transition ${
                    quality === q
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {QUALITY_LABELS[q]}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-gray-500 mt-[5px]">
              Standard ≈ local tiles & fittings · Premium ≈ imported tiles, branded fittings ·
              Luxury ≈ designer finishes, imported wood & sanitary.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[13px]">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
                Grey Structure Rate (PKR/sq ft)
              </label>
              <input
                type="number"
                value={greyRate}
                min={0}
                onChange={(e) => setGreyRate(Number(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                aria-label="Grey structure rate in PKR per square foot"
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[8px]">
                Finishing Rate (PKR/sq ft)
              </label>
              <input
                type="number"
                value={finishingRate}
                min={0}
                onChange={(e) => setFinishingRate(Number(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-[13px] py-[8px] text-[14px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                aria-label="Finishing rate in PKR per square foot"
              />
            </div>
          </div>
          <p className="text-[12px] text-gray-500">
            Defaults are indicative early-2026 with-material contractor rates — edit them to match
            quotes from your city.
          </p>
        </div>

        {/* Results */}
        <div className="bg-cyan-50 rounded-2xl p-[21px] lg:p-[34px] flex flex-col justify-center">
          <div className="flex items-center gap-[8px] text-cyan-700 font-semibold text-[14px] mb-[13px]">
            <FaHardHat /> Estimated Construction Cost
          </div>
          <div className="text-[34px] font-bold text-gray-900 mb-[3px]">
            {formatPkr(result.total)}
          </div>
          <div className="text-[14px] text-gray-600 mb-[21px]">
            for ~{Math.round(result.coveredArea).toLocaleString()} sq ft covered area
          </div>

          <div className="space-y-[13px] text-[14px]">
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Estimated Covered Area</span>
              <span className="font-semibold text-gray-900">
                {Math.round(result.coveredArea).toLocaleString()} sq ft
              </span>
            </div>
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Grey Structure Cost</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.greyCost)}</span>
            </div>
            <div className="flex justify-between border-b border-cyan-100 pb-[8px]">
              <span className="text-gray-600">Finishing Cost ({QUALITY_LABELS[quality]})</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.finishingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Estimated Cost</span>
              <span className="font-semibold text-gray-900">{formatPkr(result.total)}</span>
            </div>
          </div>

          <p className="text-[12px] text-gray-500 mt-[21px]">
            Estimate only. Rates vary by city, plot conditions, design and material choices, and
            move with steel, cement and labour prices. Boundary wall, basement, solar and
            landscaping are not included — get itemised contractor quotations before budgeting.
          </p>
        </div>
      </div>

      {/* Grey structure stage breakdown */}
      <div className="mt-[34px]">
        <h2 className="text-[16px] font-bold text-gray-900 mb-[13px]">
          Grey Structure Cost by Stage
        </h2>
        <div className="space-y-[8px]">
          {GREY_STAGES.map((stage) => (
            <div key={stage.label}>
              <div className="flex justify-between text-[13px] mb-[3px]">
                <span className="text-gray-600">{stage.label}</span>
                <span className="font-semibold text-gray-900">
                  {stage.pct}% · {formatPkr(result.greyCost * (stage.pct / 100))}
                </span>
              </div>
              <div className="h-[8px] bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-700 rounded-full"
                  style={{ width: `${stage.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-gray-500 mt-[13px]">
          Typical stage shares of grey structure cost — useful for planning stage-wise payments to
          your contractor.
        </p>
      </div>
    </div>
  )
}
