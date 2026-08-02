'use client'

import { useState, useEffect } from 'react'
import { FaTable, FaEdit, FaTrash, FaPlus, FaDownload, FaUpload, FaSearch } from 'react-icons/fa'

interface TableInfo {
  name: string
  count: number
}

export default function DatabaseManagementTab() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableData, setTableData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRow, setEditingRow] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchTables()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      fetchTableData()
    }
  }, [selectedTable, page, searchTerm])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/database/tables')
      const data = await response.json()
      setTables(data.tables)
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
  }

  const fetchTableData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        table: selectedTable,
        page: page.toString(),
        search: searchTerm,
      })
      const response = await fetch(`/api/admin/database/data?${params}`)
      const data = await response.json()
      setTableData(data.records)
      setColumns(data.columns)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching table data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const response = await fetch('/api/admin/database/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, id }),
      })

      if (response.ok) {
        fetchTableData()
      }
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/database/export?table=${selectedTable}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedTable}_export.csv`
      a.click()
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Database Management</h2>
        {selectedTable && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaPlus />
              <span>Add Record</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Tables List */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tables</h3>
          <div className="space-y-2">
            {tables.map((table) => (
              <button
                key={table.name}
                onClick={() => {
                  setSelectedTable(table.name)
                  setPage(1)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  selectedTable === table.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaTable />
                    <span className="font-medium">{table.name}</span>
                  </div>
                  <span className="text-sm">{table.count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Table Data */}
        <div className="col-span-9 bg-white rounded-lg shadow p-6">
          {selectedTable ? (
            <>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Data Table */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {columns.map((col) => (
                            <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {col}
                            </th>
                          ))}
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map((row, index) => (
                          <tr key={index}>
                            {columns.map((col) => (
                              <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {String(row[col] || '')}
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => setEditingRow(row)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(row.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a table to view its data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

