'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView, getOrCreateSessionId } from '@/lib/client-analytics'

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip tracking for admin pages
    if (pathname?.startsWith('/admin')) {
      return
    }

    const sessionId = getOrCreateSessionId()
    const startTime = Date.now()

    // Track page view
    trackPageView(pathname || '/')

    // Track page duration on unmount
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      
      // Send duration data
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pathname || '/',
          sessionId,
          duration,
        }),
      }).catch(console.error)
    }
  }, [pathname])

  return null
}

