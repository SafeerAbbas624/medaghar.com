'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'

const MIN_PASSWORD_LENGTH = 8

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Checked here as well as on the server so a typo does not burn one of
    // the five allowed code attempts.
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/signin'), 2500)
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Set a new password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the six-digit code we emailed you, then choose a new password.
          </p>
        </div>

        {done ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-600 text-xl mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Password changed</p>
                <p className="text-sm text-gray-600 mt-1">
                  You can now sign in with your new password. Taking you to the sign-in page…
                </p>
              </div>
            </div>
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

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Reset code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="text-gray-400" />
                </div>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The code expires 15 minutes after it was sent.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Type it again"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-700 text-white py-3 rounded-lg font-semibold hover:bg-cyan-800 transition disabled:opacity-60"
            >
              {loading ? 'Setting password…' : 'Set new password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm space-x-4">
          <Link href="/forgot-password" className="text-cyan-700 hover:underline">
            Send a new code
          </Link>
          <Link href="/signin" className="inline-flex items-center gap-2 text-cyan-700 hover:underline">
            <FaArrowLeft className="text-xs" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
