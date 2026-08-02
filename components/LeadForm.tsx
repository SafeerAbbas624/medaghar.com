'use client'

import { useState } from 'react'
import { FaPhoneAlt, FaCheckCircle } from 'react-icons/fa'

interface LeadFormProps {
  propertyId: string
  /** e.g. "buying" | "renting" | "home-loan" */
  intent?: string
  title?: string
  subtitle?: string
}

export default function LeadForm({
  propertyId,
  intent = 'buying',
  title = 'Request a Callback',
  subtitle = 'Leave your number and we will connect you about this property — free of charge.',
}: LeadFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, name, phone, message, intent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-6 text-center">
        <FaCheckCircle className="text-4xl text-cyan-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Request Received!</h3>
        <p className="text-sm text-gray-600">
          We will call you back shortly about this property.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <FaPhoneAlt className="text-cyan-600 text-base" /> {title}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      <div className="space-y-3">
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
        <input
          type="tel"
          required
          placeholder="Phone / WhatsApp (03XX-XXXXXXX)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
        <textarea
          placeholder="Message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-cyan-700 text-white py-3 rounded-lg hover:bg-cyan-800 transition font-medium disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Get a Call Back'}
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          By submitting you agree to be contacted about this enquiry.
        </p>
      </div>
    </form>
  )
}
