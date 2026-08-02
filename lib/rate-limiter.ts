import { RateLimiterRedis } from 'rate-limiter-flexible'
import { createClient, RedisClientType } from 'redis'

// Redis client singleton
let redisClient: RedisClientType | null = null

async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient?.isOpen) return redisClient

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  return redisClient
}

// Lazy initialization of rate limiters
let loginRateLimiter: RateLimiterRedis | null = null
let apiRateLimiter: RateLimiterRedis | null = null
let emailRateLimiter: RateLimiterRedis | null = null

async function initRateLimiters() {
  const client = await getRedisClient()

  if (!loginRateLimiter) {
    loginRateLimiter = new RateLimiterRedis({
      storeClient: client,
      points: 5,
      duration: 15 * 60,
      blockDuration: 15 * 60,
      keyPrefix: 'rl:login',
    })
  }

  if (!apiRateLimiter) {
    apiRateLimiter = new RateLimiterRedis({
      storeClient: client,
      points: 100,
      duration: 60,
      keyPrefix: 'rl:api',
    })
  }

  if (!emailRateLimiter) {
    emailRateLimiter = new RateLimiterRedis({
      storeClient: client,
      points: 10,
      duration: 60 * 60,
      keyPrefix: 'rl:email',
    })
  }

  return { loginRateLimiter, apiRateLimiter, emailRateLimiter }
}

export async function getRateLimiters() {
  if (!loginRateLimiter || !apiRateLimiter || !emailRateLimiter) {
    await initRateLimiters()
  }
  return { loginRateLimiter: loginRateLimiter!, apiRateLimiter: apiRateLimiter!, emailRateLimiter: emailRateLimiter! }
}

export async function checkRateLimit(
  limiter: RateLimiterRedis,
  key: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await limiter.consume(key)
    return { allowed: true }
  } catch (error: any) {
    if (error.msBeforeNext) {
      return {
        allowed: false,
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      }
    }
    throw error
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return 'unknown'
}

// Export for backward compatibility (will work once initialized)
export { loginRateLimiter, apiRateLimiter, emailRateLimiter }