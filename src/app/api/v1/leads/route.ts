import { NextResponse, type NextRequest } from 'next/server';
import { LeadSchema } from '@/features/leads/lead.schemas';
import { getLeadService, InvalidLeadPropertyError } from '@/features/leads/lead.service';
import { apiCorsHeaders, isAllowedOriginRequest, readJsonBody } from '@/server/api/request';
import { apiBadRequest, apiCreated, apiForbidden, apiServerError, firstZodError } from '@/server/api/responses';
import { enforceRateLimit, RATE_LIMITS } from '@/server/security/rate-limit';
import type { ApiResponse } from '@/types/property';

export const runtime = 'nodejs';
export const maxDuration = 5;

export function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: apiCorsHeaders(request),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const headers = apiCorsHeaders(request);

  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: 'api:leads',
      ...RATE_LIMITS.leads,
      headers,
    });

    if (limited) {
      return limited as NextResponse<ApiResponse>;
    }

    if (!isAllowedOriginRequest(request)) {
      return apiForbidden('Origen no permitido', headers);
    }

    const body = await readJsonBody(request);
    const parsed = LeadSchema.safeParse(body);

    if (!parsed.success) {
      return apiBadRequest(firstZodError(parsed.error), headers);
    }

    await getLeadService().registerLead(parsed.data);
    return apiCreated('Consulta recibida. Nos pondremos en contacto pronto.', headers);
  } catch (error) {
    if (error instanceof Error && error.message === 'CONTENT_TYPE_NOT_JSON') {
      return apiBadRequest('Content-Type debe ser application/json', headers);
    }

    if (error instanceof InvalidLeadPropertyError) {
      return apiBadRequest(error.message, headers);
    }

    console.error('[POST /api/v1/leads]', error);
    return apiServerError('Error al procesar la consulta', headers);
  }
}
