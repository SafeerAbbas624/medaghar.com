'use client'

import { useState } from 'react'
import { FaWhatsapp, FaFacebook, FaLink, FaCheck, FaShareAlt } from 'react-icons/fa'

interface Props {
  /** Absolute URL of the thing being shared. */
  url: string
  /** Used as the WhatsApp message and the native-share title. */
  title: string
}

/**
 * Share a listing.
 *
 * WhatsApp is first and given the most weight deliberately — in Pakistan a
 * property link is far more likely to be forwarded to family on WhatsApp than
 * posted publicly, and that forward is how most listings actually travel.
 *
 * Uses the native share sheet where the browser offers one (nearly every
 * phone), falling back to explicit buttons on desktop.
 */
export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false)

  const waText = `${title}\n${url}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(waText)}`
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the buttons above still work */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        /* the user dismissed the sheet */
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 mr-1">Share:</span>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-95 transition"
      >
        <FaWhatsapp className="text-[16px]" /> WhatsApp
      </a>

      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="inline-flex items-center gap-2 bg-[#1877F2] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-95 transition"
      >
        <FaFacebook className="text-[15px]" /> Facebook
      </a>

      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex items-center gap-2 bg-slate-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition"
      >
        {copied ? <FaCheck className="text-emerald-600 text-[14px]" /> : <FaLink className="text-[14px]" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>

      {/* Only useful where the browser has a share sheet, which is nearly
          every phone and almost no desktop. */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          type="button"
          onClick={nativeShare}
          aria-label="More sharing options"
          className="sm:hidden inline-flex items-center gap-2 bg-slate-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition"
        >
          <FaShareAlt className="text-[14px]" /> More
        </button>
      )}
    </div>
  )
}
