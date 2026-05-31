import type { NextRequest } from 'next/server';
import { handlers } from '@/lib/auth/auth';
import { enforceRateLimit, RATE_LIMITS } from '@/server/security/rate-limit';

export const { GET } = handlers;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.endsWith('/callback/credentials')) {
    const limited = await enforceRateLimit(request, {
      keyPrefix: 'auth:credentials',
      ...RATE_LIMITS.auth,
      message: 'Demasiados intentos de inicio de sesion. Espera unos minutos y vuelve a intentar.',
    });

    if (limited) return limited;
  }

  return handlers.POST(request);
}
