'use client'

import { useCallback, useEffect, useState } from 'react'
import { FaSearch, FaStar, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa'

interface AdminProperty {
  id: string
  title: string | null
  address: string
  city: string
  price: number
  listingType: string
  status: string
  isFeatured: boolean
  isVerified: boolean
  createdAt: string
  owner: { firstName: string; lastName: string; email: string } | null
  agent: { user: { firstName: string; lastName: string } } | null
}

function formatPkr(price: number): string {
  if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `${(price / 100000).toFixed(2)} Lac`
  return price.toLocaleString()
}

export default function ListingsManagementTab() {
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/properties?page=${page}&search=${encodeURIComponent(search)}&filter=${filter}`
      )
      const data = await res.json()
      if (res.ok) {
        setProperties(data.properties)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, filter])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const toggleFlag = async (id: string, flag: 'isFeatured' | 'isVerified', value: boolean) => {
    setUpdating(id + flag)
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [flag]: value }),
      })
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [flag]: value } : p))
        )
      }
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Listings Management</h2>
        <p className="text-gray-600 text-sm">
          Feature paid listings and mark physically-verified properties. Featured listings appear
          first on the homepage, search and city pages.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by address, city or title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(1)
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Listings ({total})</option>
          <option value="featured">Featured Only</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Not Verified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading listings…</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No listings found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Property</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Lister</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Featured</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Verified</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/properties/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                    >
                      {p.address}
                      <FaExternalLinkAlt className="text-[10px] text-gray-400" />
                    </a>
                    <div className="text-xs text-gray-500">
                      {p.city} · {p.listingType === 'FOR_RENT' ? 'Rent' : 'Sale'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">PKR {formatPkr(p.price)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.agent
                      ? `${p.agent.user.firstName} ${p.agent.user.lastName} (Agent)`
                      : p.owner
                        ? `${p.owner.firstName} ${p.owner.lastName}`
                        : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleFlag(p.id, 'isFeatured', !p.isFeatured)}
                      disabled={updating === p.id + 'isFeatured'}
                      title={p.isFeatured ? 'Remove featured' : 'Make featured'}
                      className={`p-2 rounded-lg transition disabled:opacity-50 ${
                        p.isFeatured
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <FaStar />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleFlag(p.id, 'isVerified', !p.isVerified)}
                      disabled={updating === p.id + 'isVerified'}
                      title={p.isVerified ? 'Remove verified badge' : 'Mark verified'}
                      className={`p-2 rounded-lg transition disabled:opacity-50 ${
                        p.isVerified
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <FaCheckCircle />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
