import { describe, it, expect } from 'vitest'
import { getClientIp } from '@/lib/rate-limiter'

const req = (headers: Record<string, string>) => new Request('http://localhost/', { headers })

describe('getClientIp', () => {
  it('prefers X-Real-IP, which nginx overwrites', () => {
    expect(getClientIp(req({ 'x-real-ip': '203.0.113.9', 'x-forwarded-for': '1.1.1.1, 203.0.113.9' }))).toBe('203.0.113.9')
  })

  it('ignores a spoofed first X-Forwarded-For entry', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '6.6.6.6, 198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('falls back to unknown', () => {
    expect(getClientIp(req({}))).toBe('unknown')
  })
})
