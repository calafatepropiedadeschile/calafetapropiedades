import { NextResponse, type NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
  identifier?: string | null;
  headers?: HeadersInit;
  message?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  appRateLimitStore?: Map<string, RateLimitEntry>;
  appRateLimitWarned?: boolean;
};

function getStore() {
  globalRateLimitStore.appRateLimitStore ??= new Map<string, RateLimitEntry>();
  return globalRateLimitStore.appRateLimitStore;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwardedFor
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || 'unknown'
  );
}

function getEnvNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const RATE_LIMITS = {
  auth: {
    limit: getEnvNumber('RATE_LIMIT_AUTH_ATTEMPTS', 20),
    windowSeconds: getEnvNumber('RATE_LIMIT_AUTH_WINDOW_SECONDS', 10 * 60),
  },
  leads: {
    limit: getEnvNumber('RATE_LIMIT_LEADS', 30),
    windowSeconds: getEnvNumber('RATE_LIMIT_LEADS_WINDOW_SECONDS', 10 * 60),
  },
  uploads: {
    limit: getEnvNumber('RATE_LIMIT_UPLOADS', 120),
    windowSeconds: getEnvNumber('RATE_LIMIT_UPLOADS_WINDOW_SECONDS', 10 * 60),
  },
} as const;

const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

const upstashRedis = upstashRedisUrl && upstashRedisToken
  ? new Redis({ url: upstashRedisUrl, token: upstashRedisToken })
  : null;

const upstashLimiters = new Map<string, Ratelimit>();

function warnInMemoryRateLimitOnce() {
  if (globalRateLimitStore.appRateLimitWarned) return;
  globalRateLimitStore.appRateLimitWarned = true;

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) return;

  console.warn(
    'Rate limiting uses in-memory storage. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for distributed limits on Vercel.',
  );
}

function getUpstashLimiter(options: RateLimitOptions) {
  if (!upstashRedis) return null;

  const cacheKey = `${options.keyPrefix}:${options.limit}:${options.windowSeconds}`;
  const existing = upstashLimiters.get(cacheKey);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis: upstashRedis,
    limiter: Ratelimit.slidingWindow(options.limit, `${options.windowSeconds} s`),
    prefix: `calafate:${options.keyPrefix}`,
    analytics: false,
  });

  upstashLimiters.set(cacheKey, limiter);
  return limiter;
}

function buildRateLimitResponse(options: RateLimitOptions, retryAfterSeconds: number) {
  const headers = new Headers(options.headers);
  headers.set('Retry-After', String(retryAfterSeconds));
  headers.set('X-RateLimit-Limit', String(options.limit));
  headers.set('X-RateLimit-Remaining', '0');
  headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + retryAfterSeconds));

  return NextResponse.json(
    {
      success: false,
      error: options.message ?? 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.',
    },
    {
      status: 429,
      headers,
    }
  );
}

function enforceInMemoryRateLimit(request: NextRequest, options: RateLimitOptions) {
  warnInMemoryRateLimitOnce();

  const now = Date.now();
  const store = getStore();
  const identifier = options.identifier || getClientIp(request);
  const key = `${options.keyPrefix}:${identifier}`;
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    });
    return null;
  }

  existing.count += 1;

  if (existing.count <= options.limit) {
    return null;
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return buildRateLimitResponse(options, retryAfterSeconds);
}

export async function enforceRateLimit(request: NextRequest, options: RateLimitOptions) {
  const identifier = options.identifier || getClientIp(request);
  const limiter = getUpstashLimiter(options);

  if (!limiter) {
    return enforceInMemoryRateLimit(request, options);
  }

  const result = await limiter.limit(`${options.keyPrefix}:${identifier}`);

  if (result.success) {
    return null;
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  return buildRateLimitResponse(options, retryAfterSeconds);
}
