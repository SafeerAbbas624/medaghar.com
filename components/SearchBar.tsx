'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaSearch } from 'react-icons/fa'

export default function SearchBar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [listingType, setListingType] = useState('FOR_SALE')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    params.set('listingType', listingType)
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Fibonacci padding: p-[13px] lg:p-[21px] */}
      <div className="bg-white rounded-xl shadow-lg p-[13px] lg:p-[21px]">
        {/* Fibonacci gap and margin: gap-[13px], mb-[13px] */}
        <div className="flex gap-[13px] mb-[13px]">
          <button
            onClick={() => setListingType('FOR_SALE')}
            className={`flex-1 lg:flex-none px-[21px] lg:px-[34px] py-[13px] rounded-xl font-medium transition text-[16px] ${
              listingType === 'FOR_SALE'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setListingType('FOR_RENT')}
            className={`flex-1 lg:flex-none px-[21px] lg:px-[34px] py-[13px] rounded-xl font-medium transition text-[16px] ${
              listingType === 'FOR_RENT'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rent
          </button>
        </div>
        {/* Fibonacci gap: gap-[13px] */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-[13px]">
          <div className="flex-1 relative">
            {/* Fibonacci positioning: left-[21px] */}
            <FaSearch className="absolute left-[21px] top-1/2 transform -translate-y-1/2 text-gray-400 text-[16px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter city, area (e.g., DHA, Bahria Town), or location"
              className="w-full pl-[55px] pr-[21px] py-[13px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-[16px]"
            />
          </div>
          <button
            type="submit"
            className="bg-cyan-700 text-white px-[34px] py-[13px] rounded-xl hover:bg-cyan-800 transition font-medium w-full sm:w-auto text-[16px]"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  )
}

