import { RateLimiterRedis, RateLimiterMemory, type RateLimiterAbstract } from 'rate-limiter-flexible'
import Redis from 'ioredis'

/**
 * Rate limiting, Redis-backed so limits survive restarts and are shared
 * across PM2 cluster workers.
 *
 * Uses ioredis rather than the `redis` package: rate-limiter-flexible v9
 * drives the client through commands (`rlflxIncr`) that node-redis v6 does
 * not expose, which silently 500s every rate-limited route.
 *
 * If Redis is unreachable we fall back to in-memory limiting. That is weaker
 * (per-process, lost on restart) but it must never take down login entirely.
 */

let redis: Redis | null = null
let redisUnavailable = false

function getRedis(): Redis | null {
  if (redisUnavailable) return null
  if (redis) return redis

  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      lazyConnect: false,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    })
    redis.on('error', (err) => {
      // Log once, then stay quiet — a dead Redis should not flood the logs.
      if (!redisUnavailable) {
        console.error('Redis unavailable, falling back to in-memory rate limiting:', err.message)
        redisUnavailable = true
      }
    })
    return redis
  } catch (error) {
    console.error('Redis init failed, using in-memory rate limiting:', error)
    redisUnavailable = true
    return null
  }
}

interface LimiterConfig {
  points: number
  duration: number
  blockDuration?: number
  keyPrefix: string
}

const CONFIGS = {
  login: { points: 5, duration: 15 * 60, blockDuration: 15 * 60, keyPrefix: 'rl:login' },
  api: { points: 100, duration: 60, keyPrefix: 'rl:api' },
  email: { points: 10, duration: 60 * 60, keyPrefix: 'rl:email' },
} satisfies Record<string, LimiterConfig>

const cache = new Map<string, RateLimiterAbstract>()

function build(config: LimiterConfig): RateLimiterAbstract {
  const client = getRedis()
  if (client) {
    return new RateLimiterRedis({
      storeClient: client,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
      keyPrefix: config.keyPrefix,
      // If Redis errors mid-request, allow rather than 500 the caller.
      insuranceLimiter: new RateLimiterMemory({
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration,
      }),
    })
  }
  return new RateLimiterMemory({
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration,
  })
}

function limiter(name: keyof typeof CONFIGS): RateLimiterAbstract {
  const existing = cache.get(name)
  if (existing) return existing
  const created = build(CONFIGS[name])
  cache.set(name, created)
  return created
}

export function getRateLimiters() {
  return {
    loginRateLimiter: limiter('login'),
    apiRateLimiter: limiter('api'),
    emailRateLimiter: limiter('email'),
  }
}

export async function checkRateLimit(
  rateLimiter: RateLimiterAbstract,
  key: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await rateLimiter.consume(key)
    return { allowed: true }
  } catch (error: unknown) {
    const e = error as { msBeforeNext?: number }
    if (typeof e?.msBeforeNext === 'number') {
      return { allowed: false, retryAfter: Math.ceil(e.msBeforeNext / 1000) }
    }
    // An infrastructure failure must not lock users out of the site.
    console.error('Rate limiter error, allowing request:', error)
    return { allowed: true }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIp) return realIp
  return 'unknown'
}
