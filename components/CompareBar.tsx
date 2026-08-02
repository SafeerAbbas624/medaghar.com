'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaExchangeAlt, FaTimes } from 'react-icons/fa'

export default function CompareBar() {
  const router = useRouter()
  const [compareCount, setCompareCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    updateCompareCount()
    
    const handleCompareUpdate = () => {
      updateCompareCount()
    }
    
    window.addEventListener('compareUpdated', handleCompareUpdate)
    return () => window.removeEventListener('compareUpdated', handleCompareUpdate)
  }, [])

  const updateCompareCount = () => {
    const compareIds = JSON.parse(localStorage.getItem('compareProperties') || '[]')
    setCompareCount(compareIds.length)
    setIsVisible(compareIds.length > 0)
  }

  const handleCompare = () => {
    router.push('/compare')
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all properties from comparison?')) {
      localStorage.setItem('compareProperties', JSON.stringify([]))
      setCompareCount(0)
      setIsVisible(false)
      window.dispatchEvent(new Event('compareUpdated'))
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cyan-700 text-white shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaExchangeAlt className="text-2xl" />
            <div>
              <div className="font-semibold">
                {compareCount} {compareCount === 1 ? 'Property' : 'Properties'} Selected for Comparison
              </div>
              <div className="text-sm text-slate-300">
                {compareCount < 4 ? `Add up to ${4 - compareCount} more properties` : 'Maximum reached'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <FaTimes />
              Clear All
            </button>
            <button
              onClick={handleCompare}
              className="bg-white text-cyan-600 px-6 py-2 rounded-lg hover:bg-cyan-50 transition font-semibold"
            >
              Compare Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

