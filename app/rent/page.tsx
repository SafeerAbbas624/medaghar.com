'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'

export default function RentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to properties page with rent filter
    router.push('/properties?listingType=FOR_RENT')
  }, [router])

  const handlePostForRent = () => {
    if (!session?.user) {
      router.push('/signin?callbackUrl=/post-rent')
    } else {
      router.push('/post-rent')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Properties for Rent</h1>
        <p className="text-gray-600 mb-6">Redirecting to rental listings...</p>

        {/* Post for Rent Button */}
        <button
          onClick={handlePostForRent}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition font-medium"
        >
          <FaPlus />
          Post for Rent
        </button>
      </div>
    </div>
  )
}

