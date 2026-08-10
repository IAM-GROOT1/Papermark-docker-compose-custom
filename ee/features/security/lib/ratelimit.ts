import { Ratelimit } from "@upstash/ratelimit";

import { redis } from "@/lib/redis";

/**
 * Simple rate limiters for core endpoints
 */
export const rateLimiters = {
  // 3 auth attempts per hour per IP
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "20 m"),
    prefix: "rl:auth",
    enableProtection: true,
    analytics: true,
  }),

  // 5 billing operations per hour per IP
  billing: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "20 m"),
    prefix: "rl:billing",
    enableProtection: true,
    analytics: true,
  }),

  // [self-host] lib/api/links/bulk-import.ts and the domain-verify route both
  // reach for limiters that were never defined here. checkRateLimit() fails
  // open on error, so upstream silently applies no limit at all on those two
  // endpoints rather than crashing. Defined so the intent actually holds.

  // Bulk link import, keyed by team.
  bulkLinkImport: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "rl:bulk-link-import",
    analytics: true,
  }),

  // Domain verification polling, keyed by user+team.
  domainVerification: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "10 m"),
    prefix: "rl:domain-verification",
    analytics: true,
  }),
};

/**
 * Apply rate limiting with error handling
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<{ success: boolean; remaining?: number; error?: string }> {
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow request if rate limiting fails
    return { success: true, error: "Rate limiting unavailable" };
  }
}
