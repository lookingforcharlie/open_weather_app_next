import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Retrieve the Redis environment variables from the .env file
export const redis = Redis.fromEnv()

// Create a new ratelimiter, that allows 2 requests per 5 seconds
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, '5 s'),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: '@upstash/ratelimit',
})
