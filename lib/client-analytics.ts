'use client'

import { v4 as uuidv4 } from 'uuid'

// Session management
const SESSION_KEY = 'analytics_session_id'
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''

  const stored = sessionStorage.getItem(SESSION_KEY)
  const lastActivity = localStorage.getItem('last_activity')
  
  const now = Date.now()
  
  // Check if session expired (30 minutes of inactivity)
  if (stored && lastActivity) {
    const timeSinceLastActivity = now - parseInt(lastActivity)
    if (timeSinceLastActivity < SESSION_DURATION) {
      localStorage.setItem('last_activity', now.toString())
      return stored
    }
  }
  
  // Create new session
  const sessionId = uuidv4()
  sessionStorage.setItem(SESSION_KEY, sessionId)
  localStorage.setItem('last_activity', now.toString())
  
  return sessionId
}

// Track page view
export async function trackPageView(path: string) {
  if (typeof window === 'undefined') return

  const sessionId = getOrCreateSessionId()

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: path,
        sessionId,
        referrer: document.referrer || null,
      }),
    })
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}

// Track custom event
export async function trackEvent(eventName: string, eventData?: any) {
  if (typeof window === 'undefined') return

  const sessionId = getOrCreateSessionId()
  
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventData,
        sessionId,
        path: window.location.pathname,
      }),
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

// Hook for tracking page views in Next.js
export function usePageTracking() {
  if (typeof window === 'undefined') return

  const path = window.location.pathname
  
  // Track on mount
  trackPageView(path)
  
  // Track page duration on unmount
  const startTime = Date.now()
  
  return () => {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    trackEvent('page_duration', { path, duration })
  }
}

