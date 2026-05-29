import { NextResponse, type NextRequest } from 'next/server';

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

export function enforceRateLimit(request: NextRequest, options: RateLimitOptions) {
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
  const headers = new Headers(options.headers);
  headers.set('Retry-After', String(retryAfterSeconds));
  headers.set('X-RateLimit-Limit', String(options.limit));
  headers.set('X-RateLimit-Remaining', '0');
  headers.set('X-RateLimit-Reset', String(Math.ceil(existing.resetAt / 1000)));

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
