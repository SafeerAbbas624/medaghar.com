import Redis from 'ioredis'

/**
 * Shared Redis client for caching.
 *
 * Separate from the rate limiter's client so a caching problem can never take
 * down login. Every helper here degrades to "cache miss" if Redis is down —
 * the site must work with Redis stopped.
 */

let client: Redis | null = null
let unavailable = false

export function getRedis(): Redis | null {
  if (unavailable) return null
  if (client) return client

  try {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
      keyPrefix: 'mg:',
    })
    client.on('error', (err) => {
      if (!unavailable) {
        console.error('Redis cache unavailable, serving uncached:', err.message)
        unavailable = true
      }
    })
    return client
  } catch (error) {
    console.error('Redis cache init failed:', error)
    unavailable = true
    return null
  }
}

/** Read a JSON value. Returns null on miss, parse failure, or Redis being down. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (!r) return null
  try {
    const raw = await r.get(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** Write a JSON value with a TTL in seconds. Silently no-ops if Redis is down. */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const r = getRedis()
  if (!r) return
  try {
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    /* caching is best-effort */
  }
}

/**
 * Bump the listings generation counter.
 *
 * Cache keys embed this number, so incrementing it makes every existing
 * listing-query key unreachable at once. That is far safer than pattern
 * deletion: no SCAN over the keyspace, no partially-invalidated state, and it
 * works identically across PM2 cluster workers because the counter lives in
 * Redis rather than in process memory.
 *
 * Call after any write that changes what a search would return.
 */
export async function bumpListingsVersion(): Promise<void> {
  const r = getRedis()
  if (!r) return
  try {
    await r.incr('listings:version')
  } catch {
    /* best-effort */
  }
}

/** Current listings generation, used as a cache-key prefix. */
export async function getListingsVersion(): Promise<number> {
  const r = getRedis()
  if (!r) return 0
  try {
    const v = await r.get('listings:version')
    return v ? parseInt(v, 10) || 0 : 0
  } catch {
    return 0
  }
}
