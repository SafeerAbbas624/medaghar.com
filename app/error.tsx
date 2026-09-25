'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[70vh] bg-slate-50 flex items-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px] text-center">
        <h1 className="text-[34px] sm:text-[55px] font-bold text-slate-900 mb-[21px]">
          Something went wrong
        </h1>
        <p className="text-[16px] lg:text-[21px] text-slate-600 mb-[34px]">
          We couldn&apos;t load this page. Please try again in a moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-[13px] justify-center">
          <button
            type="button"
            onClick={reset}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-[34px] py-[13px] rounded-lg transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold px-[34px] py-[13px] rounded-lg transition"
          >
            Go to homepage
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-[34px] text-[13px] text-slate-400">Reference: {error.digest}</p>
        ) : null}
      </div>
    </main>
  )
}
