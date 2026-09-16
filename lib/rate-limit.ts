/**
 * Rate Limiter - Upstash Redis backed
 * 
 * Production-ready rate limiting using Upstash Redis.
 * Falls back to in-memory for development without Redis credentials.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

function getRatelimiter() {
  if (ratelimit) return ratelimit;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    // Development fallback - use in-memory (not for production)
    console.warn('[RateLimit] UPSTASH_REDIS_REST_URL/TOKEN not set. Using in-memory fallback (NOT for production).');
    return null;
  }

  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'), // default, overridden per call
    analytics: true,
    prefix: '@upstash/ratelimit',
  });

  return ratelimit;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  limit: number;
  window: string; // e.g., '60 s', '10 m', '1 h'
  prefix?: string;
}

/**
 * Check rate limit for an identifier
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; resetTime: number; remaining: number; limit: number }> {
  const rl = getRatelimiter();

  if (!rl) {
    // Development fallback - use simple in-memory (single process only)
    return devRateLimitFallback(identifier, config);
  }

  // Create a new ratelimiter with the specific config
  const customRl = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: config.prefix || '@upstash/ratelimit',
  });

  const result = await customRl.limit(identifier);

  return {
    allowed: result.success,
    resetTime: result.reset,
    remaining: result.remaining,
    limit: config.limit,
  };
}

/**
 * Development fallback - in-memory rate limiting
 * WARNING: Only works for single-process development. Not for production.
 */
const devRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function devRateLimitFallback(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime: number; remaining: number; limit: number } {
  const now = Date.now();
  const windowMs = parseWindow(config.window);
  const record = devRateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    devRateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, resetTime: now + windowMs, remaining: config.limit - 1, limit: config.limit };
  }

  if (record.count >= config.limit) {
    return { allowed: false, resetTime: record.resetTime, remaining: 0, limit: config.limit };
  }

  record.count++;
  return { allowed: true, resetTime: record.resetTime, remaining: config.limit - record.count, limit: config.limit };
}

function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*(s|m|h)$/);
  if (!match) return 60000; // default 1 minute
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return 60000;
  }
}

/**
 * Apply rate limit to a Next.js request
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const identifier = `api:${ip}`;

  const result = await checkRateLimit(identifier, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Rate limit headers for successful responses
 */
export function rateLimitHeaders(result: { limit: number; remaining: number; resetTime: number }): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };
}