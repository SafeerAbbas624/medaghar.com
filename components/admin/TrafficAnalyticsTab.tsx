'use client'

import { useState, useEffect } from 'react'
import { FaGlobe, FaEye, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type TimeFilter = '24h' | '7d' | '30d' | 'custom'

interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  avgDuration: number
  pageViews: Array<{ page: string; views: number; avgDuration: number }>
  geoData: Array<{ country: string; city: string; count: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function TrafficAnalyticsTab() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [timeFilter, customStartDate, customEndDate])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ filter: timeFilter })
      if (timeFilter === 'custom' && customStartDate && customEndDate) {
        params.append('startDate', customStartDate)
        params.append('endDate', customEndDate)
      }

      const response = await fetch(`/api/admin/analytics?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Traffic Analytics</h2>
        
        {/* Time Filter */}
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeFilter('24h')}
            className={`px-4 py-2 rounded-lg ${timeFilter === '24h' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Last 24 Hours
          </button>
          <button
            onClick={() => setTimeFilter('7d')}
            className={`px-4 py-2 rounded-lg ${timeFilter === '7d' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeFilter('30d')}
            className={`px-4 py-2 rounded-lg ${timeFilter === '30d' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeFilter('custom')}
            className={`px-4 py-2 rounded-lg ${timeFilter === 'custom' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      {timeFilter === 'custom' && (
        <div className="bg-white p-4 rounded-lg shadow flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Page Views</p>
              <p className="text-3xl font-bold text-gray-900">{data?.totalViews.toLocaleString() || 0}</p>
            </div>
            <FaEye className="text-4xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{data?.uniqueVisitors.toLocaleString() || 0}</p>
            </div>
            <FaGlobe className="text-4xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Session Duration</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(data?.avgDuration || 0)}s</p>
            </div>
            <FaClock className="text-4xl text-orange-600" />
          </div>
        </div>
      </div>

      {/* Page Views Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Page-by-Page Traffic</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.pageViews || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="page" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#3B82F6" name="Page Views" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Traffic Distribution</h3>
        {data?.geoData && data.geoData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.geoData.map((geo, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <FaMapMarkerAlt className="inline mr-2 text-red-500" />
                      {geo.city}, {geo.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{geo.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaMapMarkerAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No geographic data available yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Geographic data will appear once visitors access your site from different locations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

