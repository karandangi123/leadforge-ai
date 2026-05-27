import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasCredentials = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

interface MockRateLimiter {
  limit: (identifier: string) => Promise<{ success: boolean }>;
}

function createRateLimiter(options: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limiter: any;
  prefix: string;
  analytics?: boolean;
}): MockRateLimiter {
  if (!hasCredentials) {
    return {
      limit: async () => ({ success: true }),
    };
  }

  try {
    return new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: options.limiter,
      analytics: options.analytics,
      prefix: options.prefix,
    });
  } catch (error) {
    console.warn(`[RateLimit] Failed to initialize Upstash Redis rate limiter for prefix ${options.prefix}:`, error);
    return {
      limit: async () => ({ success: true }),
    };
  }
}

/**
 * Production Rate Limiter using Upstash Redis (Serverless-optimized)
 */
export const globalRateLimiter = createRateLimiter({
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds per identifier
  analytics: true,
  prefix: "@leadforge/ratelimit",
});

/**
 * Specifically for expensive AI forensic audits
 */
export const forensicAuditLimiter = createRateLimiter({
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 audits per minute per user/IP
  analytics: true,
  prefix: "@leadforge/audit-limit",
});
