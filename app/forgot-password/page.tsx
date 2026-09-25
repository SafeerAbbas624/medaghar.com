'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'

/**
 * Request a password reset code.
 *
 * The confirmation is deliberately vague about whether the address has an
 * account — the endpoint answers the same way either way, and the page must
 * not undo that by saying "no account found".
 */
export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Could not reach the server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="MedaGhar"
              width={160}
              height={160}
              unoptimized
              className="h-[120px] w-[120px] md:h-[160px] md:w-[160px] object-contain"
            />
            <span className="text-2xl md:text-3xl font-bold text-cyan-700 -mt-6 md:-mt-8">
              MedaGhar
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Forgot your password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the email address on your account and we will send you a code to set a new
            password.
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-600 text-xl mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Check your email</p>
                <p className="text-sm text-gray-600 mt-1">
                  If an account exists for <strong>{email}</strong>, a six-digit reset code is on
                  its way. It expires in 15 minutes.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="w-full bg-cyan-700 text-white py-3 rounded-lg font-semibold hover:bg-cyan-800 transition"
            >
              I have the code
            </button>
            <p className="text-xs text-gray-500 text-center">
              Nothing arrived? Check your spam folder, then{' '}
              <button
                onClick={() => setSent(false)}
                className="text-cyan-700 hover:underline font-medium"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <form className="bg-white rounded-xl shadow-sm p-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-700 text-white py-3 rounded-lg font-semibold hover:bg-cyan-800 transition disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link href="/signin" className="inline-flex items-center gap-2 text-cyan-700 hover:underline">
            <FaArrowLeft className="text-xs" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
