import type { NextRequest } from 'next/server';

function toOrigin(value: string | undefined): string | null {
  if (!value) return null;

  const normalized = value.startsWith('http') ? value : `https://${value}`;

  try {
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: NextRequest): Set<string> {
  return new Set(
    [
      request.nextUrl.origin,
      toOrigin(process.env.AUTH_URL),
      toOrigin(process.env.NEXTAUTH_URL),
      toOrigin(process.env.APP_ORIGIN),
      toOrigin(process.env.VERCEL_URL),
      toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    ].filter((origin): origin is string => Boolean(origin))
  );
}

export function isAllowedOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  if (!origin) {
    return true;
  }

  return getAllowedOrigins(request).has(origin);
}

export function apiCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (origin && getAllowedOrigins(request).has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new Error('CONTENT_TYPE_NOT_JSON');
  }

  return request.json();
}
