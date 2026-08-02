'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    
    setCode(newCode)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(c => !c)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const verificationCode = code.join('')

    if (verificationCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setSuccessMessage('Email verified successfully! Redirecting to sign in...')
      
      // Redirect to sign in page after 2 seconds
      setTimeout(() => {
        router.push('/signin?message=Email verified successfully. Please sign in.')
      }, 2000)
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setResending(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.cooldown && data.remainingSeconds) {
          setResendCooldown(data.remainingSeconds)
        }
        throw new Error(data.error || 'Failed to resend code')
      }

      setSuccessMessage('Verification code sent! Please check your email.')
      setResendCooldown(60) // Start 60-second cooldown
      setCode(['', '', '', '', '', '']) // Clear the input
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex flex-col items-center justify-center mb-4 md:mb-6">
            <Image
              src="/logo.png"
              alt="MedaGhar Logo"
              width={200}
              height={200}
              unoptimized
              className="h-[120px] w-[120px] md:h-[160px] md:w-[160px] object-contain"
            />
            <span className="text-2xl md:text-3xl font-bold text-cyan-700 -mt-6 md:-mt-8">MedaGhar</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-cyan-600 flex items-center justify-center gap-2 mt-1">
            <FaEnvelope className="text-cyan-500" />
            {email}
          </p>
          <p className="mt-3 text-xs text-gray-500 bg-copper-50 border border-copper-200 rounded-lg p-3">
            <span className="font-semibold text-copper-800">📧 Can't find the email?</span>
            <br />
            Please check your <span className="font-medium text-copper-900">spam or junk folder</span>.
            Sometimes verification emails can be filtered there.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-start gap-3">
            <FaCheckCircle className="text-cyan-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-cyan-700">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <FaTimesCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Verification Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-2 md:gap-3" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  disabled={loading || !!successMessage}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || !!successMessage || code.join('').length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </form>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending || resendCooldown > 0}
              className="font-medium text-cyan-600 hover:text-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </p>
        </div>

        {/* Back to Sign In */}
        <div className="text-center">
          <Link
            href="/signin"
            className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700"></div></div>}>
      <VerifyEmailPage />
    </Suspense>
  )
}
