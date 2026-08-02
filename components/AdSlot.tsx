'use client'

import { useEffect, useRef } from 'react'

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT // e.g. "ca-pub-1234567890123456"

interface AdSlotProps {
  /** AdSense ad unit slot id. Optional until real units are created. */
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  /** Renders an "in-article" styled native ad */
  layout?: 'in-article'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

/**
 * Site-wide ad placement. Behaviour:
 *  - NEXT_PUBLIC_ADSENSE_CLIENT unset (today): renders nothing in production,
 *    renders a labelled grey placeholder in development so placements are visible.
 *  - NEXT_PUBLIC_ADSENSE_CLIENT set: renders a responsive AdSense unit.
 *
 * To go live after AdSense approval: add NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXX
 * to .env, create ad units in the AdSense panel and pass their ids via `slot`
 * (slots are optional — Auto ads also work with just the client id).
 */
export default function AdSlot({ slot, format = 'auto', layout, className = '' }: AdSlotProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADSENSE_CLIENT || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // AdSense script blocked or not yet loaded — fail silently
    }
  }, [])

  if (!ADSENSE_CLIENT) {
    if (process.env.NODE_ENV === 'production') return null
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm min-h-[90px] ${className}`}
      >
        Ad placement{slot ? ` (${slot})` : ''} — shows when AdSense is configured
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  )
}
