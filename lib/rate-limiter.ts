import { createClient, RedisClientType } from "redis";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  WALLET_CREATION: {
    MAX_REQUESTS: 20, // Maximum requests allowed
    WINDOW_SECONDS: 86400, // 24 hours in seconds
  },
};

/**
 * Redis client singleton
 */
let redisClient: RedisClientType | null = null;

/**
 * Get or create Redis client
 */
async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      console.error("[Redis] Connection error:", err);
    });

    await redisClient.connect();
    console.log("[Redis] Connected successfully");
  }

  return redisClient;
}

/**
 * Check if a request should be rate limited
 * @param ip - IP address of the requester
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const client = await getRedisClient();
    const key = `ratelimit:wallet:${ip}`;
    const limit = RATE_LIMIT.WALLET_CREATION.MAX_REQUESTS;
    const window = RATE_LIMIT.WALLET_CREATION.WINDOW_SECONDS;

    // Get current count
    const currentCountStr = await client.get(key);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

    // Get TTL to determine reset time
    const ttl = await client.ttl(key);
    const resetTime =
      ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + window * 1000;

    // Check if limit exceeded
    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    // Increment counter
    const newCount = await client.incr(key);

    // Set expiration on first request
    if (newCount === 1) {
      await client.expire(key, window);
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - newCount),
      resetTime: Date.now() + window * 1000,
    };
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    console.error("[Rate Limit] Error checking rate limit:", error);

    // Fail open - allow request if rate limiting service is unavailable
    return {
      allowed: true,
      remaining: RATE_LIMIT.WALLET_CREATION.MAX_REQUESTS,
      resetTime: Date.now() + RATE_LIMIT.WALLET_CREATION.WINDOW_SECONDS * 1000,
    };
  }
}

/**
 * Get formatted reset time for error messages
 * @param resetTime - Unix timestamp in milliseconds
 * @returns Human-readable time string
 */
export function getResetTimeString(resetTime: number): string {
  const resetDate = new Date(resetTime);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} and ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  }
  return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
}

/**
 * Close Redis connection (useful for cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("[Redis] Connection closed");
  }
}
