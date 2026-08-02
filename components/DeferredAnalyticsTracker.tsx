'use client'

import dynamic from 'next/dynamic'

// Load after initial paint — no visible content, so ssr: false is safe
const AnalyticsTracker = dynamic(() => import('./AnalyticsTracker'), { ssr: false })

export default function DeferredAnalyticsTracker() {
  return <AnalyticsTracker />
}
