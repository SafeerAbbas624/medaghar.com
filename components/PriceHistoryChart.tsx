'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa'

interface PriceHistoryEntry {
  id: string
  price: number
  eventType: string
  eventDate: Date | string
}

interface PriceHistoryChartProps {
  priceHistory: PriceHistoryEntry[]
  currentPrice: number
  listingType: string
}

export default function PriceHistoryChart({ priceHistory, currentPrice, listingType }: PriceHistoryChartProps) {
  // Don't render if no price history
  if (!priceHistory || priceHistory.length === 0) {
    return null
  }

  // Format price for display
  const formatPrice = (price: number) => {
    if (listingType === 'FOR_RENT') {
      return `PKR ${price.toLocaleString()}/month`
    }
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(2)} Lakh`
    }
    return `PKR ${price.toLocaleString()}`
  }

  // Format price for chart (in millions for better readability)
  const formatChartPrice = (price: number) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(0)} L`
    }
    return `${(price / 1000).toFixed(0)}K`
  }

  // Prepare chart data
  const chartData = [
    ...priceHistory.map((entry) => ({
      date: new Date(entry.eventDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      price: entry.price,
      eventType: entry.eventType,
      fullDate: new Date(entry.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    })),
    {
      date: 'Current',
      price: currentPrice,
      eventType: 'Current',
      fullDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    },
  ].sort((a, b) => {
    if (a.date === 'Current') return 1
    if (b.date === 'Current') return -1
    return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
  })

  // Calculate price change
  const firstPrice = priceHistory[priceHistory.length - 1]?.price || currentPrice
  const priceChange = currentPrice - firstPrice
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(1)
  const isIncrease = priceChange > 0

  // Calculate min and max for Y-axis
  const prices = chartData.map(d => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.1
  const yAxisMin = Math.floor((minPrice - padding) / 1000000) * 1000000
  const yAxisMax = Math.ceil((maxPrice + padding) / 1000000) * 1000000

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-cyan-600" />
            Price History
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Track price changes over time</p>
        </div>

        {/* Price Change Summary */}
        {priceHistory.length > 0 && (
          <div className="text-left sm:text-right">
            <div className={`text-xl sm:text-2xl font-bold ${isIncrease ? 'text-cyan-600' : 'text-red-600'} flex items-center gap-2 sm:justify-end`}>
              {isIncrease ? <FaArrowUp /> : <FaArrowDown />}
              {isIncrease ? '+' : ''}{formatPrice(priceChange)}
            </div>
            <div className={`text-xs sm:text-sm ${isIncrease ? 'text-cyan-600' : 'text-red-600'}`}>
              {isIncrease ? '+' : ''}{priceChangePercent}% since listing
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-6 -mx-2 sm:mx-0">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              style={{ fontSize: '10px' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '10px' }}
              tickFormatter={formatChartPrice}
              domain={[yAxisMin, yAxisMax]}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [formatPrice(value), 'Price']}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.date === label)
                return item ? `${item.fullDate} - ${item.eventType}` : label
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#16A34A"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={{ fill: '#16A34A', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#16A34A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Price History Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Timeline</h3>
        <div className="space-y-3">
          {/* Current Price */}
          <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-600">
            <div className="flex-shrink-0 w-24 text-sm text-gray-600">
              Current
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{formatPrice(currentPrice)}</div>
              <div className="text-sm text-gray-600">Current listing price</div>
            </div>
            <div className="flex-shrink-0">
              <span className="px-3 py-1 bg-cyan-700 text-white text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>

          {/* Historical Prices */}
          {priceHistory.map((entry, index) => {
            const entryDate = new Date(entry.eventDate)
            const isFirst = index === priceHistory.length - 1
            const prevPrice = index < priceHistory.length - 1 ? priceHistory[index + 1].price : null
            const change = prevPrice ? entry.price - prevPrice : 0
            const changePercent = prevPrice ? ((change / prevPrice) * 100).toFixed(1) : null

            return (
              <div key={entry.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border-l-4 border-gray-300">
                <div className="flex-shrink-0 w-24 text-sm text-gray-600">
                  {entryDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{formatPrice(entry.price)}</div>
                  <div className="text-sm text-gray-600">{entry.eventType}</div>
                  {changePercent && (
                    <div className={`text-xs mt-1 ${change > 0 ? 'text-cyan-600' : 'text-red-600'}`}>
                      {change > 0 ? '+' : ''}{changePercent}% from previous
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    entry.eventType === 'Listed'
                      ? 'bg-cyan-100 text-cyan-700'
                      : entry.eventType === 'Price Change'
                      ? 'bg-copper-100 text-copper-700'
                      : 'bg-slate-100 text-gray-700'
                  }`}>
                    {entry.eventType}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights */}
      {priceHistory.length > 0 && (
        <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
          <h4 className="font-semibold text-cyan-800 mb-2">💡 Price Insights</h4>
          <ul className="text-sm text-cyan-700 space-y-1">
            <li>• This property has {priceHistory.length} price {priceHistory.length === 1 ? 'change' : 'changes'} on record</li>
            <li>• {isIncrease ? 'Price has increased' : 'Price has decreased'} by {Math.abs(parseFloat(priceChangePercent))}% since initial listing</li>
            {isIncrease && <li>• Property value is trending upward, indicating strong demand</li>}
            {!isIncrease && <li>• Price reduction may indicate motivated seller or market adjustment</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

