'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FaPhone, FaLock, FaSpinner } from 'react-icons/fa'

interface Props {
  /** Property id — the number is fetched from the server, never passed in. */
  propertyId: string
  /** Which party's number to fetch. */
  party: 'agent' | 'owner'
  label?: string
}

/**
 * Phone numbers are fetched on demand from an authenticated endpoint.
 *
 * They are deliberately NOT passed in as a prop: props are serialised into the
 * RSC payload, so a number sent to this component would sit in the page source
 * for anonymous visitors and scrapers even if the UI hid it.
 */
export default function RevealPhone({ propertyId, party, label = 'Show Phone Number' }: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [phone, setPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function reveal() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/properties/${propertyId}/contact?party=${party}`)
      if (res.status === 401) {
        router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }
      const data = await res.json()
      if (!res.ok || !data.phone) {
        setError(data.error || 'No phone number on file')
        return
      }
      setPhone(data.phone)
    } catch {
      setError('Could not load the number — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-200 text-gray-400 text-sm font-medium"
      >
        <FaSpinner className="animate-spin" /> Loading…
      </button>
    )
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 transition text-sm font-semibold"
      >
        <FaLock className="text-xs" /> Sign in to see phone number
      </button>
    )
  }

  if (phone) {
    return (
      <a
        href={`tel:${phone.replace(/[\s-]/g, '')}`}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan-700 text-white hover:bg-cyan-800 transition text-base font-semibold tracking-wide"
      >
        <FaPhone className="text-sm" /> {phone}
      </a>
    )
  }

  return (
    <div>
      <button
        onClick={reveal}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 transition text-sm font-semibold disabled:opacity-60"
      >
        {loading ? <FaSpinner className="animate-spin text-xs" /> : <FaPhone className="text-xs" />}
        {loading ? 'Loading…' : label}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
