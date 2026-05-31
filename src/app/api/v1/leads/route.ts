import { NextResponse, type NextRequest, after } from 'next/server';
import { LeadSchema } from '@/features/leads/lead.schemas';
import { getLeadService, InvalidLeadPropertyError } from '@/features/leads/lead.service';
import { resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { sendMetaConversionEvent } from '@/lib/marketing/meta-conversions-api';
import { randomUUID } from 'node:crypto';
import { apiCorsHeaders, isAllowedOriginRequest, readJsonBody } from '@/server/api/request';
import { apiBadRequest, apiCreated, apiForbidden, apiServerError, firstZodError } from '@/server/api/responses';
import { enforceRateLimit, RATE_LIMITS } from '@/server/security/rate-limit';
import { verifyRecaptchaToken } from '@/lib/security/recaptcha';
import type { ApiResponse } from '@/types/property';

function getRequestIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }
  return request.headers.get('x-real-ip');
}

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
    const limited = await enforceRateLimit(request, {
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

    const {
      recaptchaToken,
      metaEventId,
      metaFbp,
      metaFbc,
      fbclid,
      ...leadData
    } = parsed.data;
    const recaptchaAction = leadData.propertyId ? 'property_lead' : 'contact_submit';

    const captcha = await verifyRecaptchaToken(recaptchaToken, {
      expectedAction: recaptchaAction,
      remoteIp: getRequestIp(request),
    });

    if (!captcha.ok) {
      return apiBadRequest(captcha.error, headers);
    }

    await getLeadService().registerLead(leadData);

    const conversionEventId = metaEventId?.trim() || randomUUID();
    const clientIp = getRequestIp(request);
    const userAgent = request.headers.get('user-agent');

    after(async () => {
      try {
        const baseUrl = await resolveCanonicalBaseUrl();
        const landing = leadData.landingPath?.trim() || '/';
        const eventSourceUrl = landing.startsWith('http')
          ? landing
          : `${baseUrl}${landing.startsWith('/') ? landing : `/${landing}`}`;

        await sendMetaConversionEvent({
          eventName: leadData.propertyId ? 'Lead' : 'Contact',
          eventId: conversionEventId,
          eventSourceUrl,
          email: leadData.email,
          phone: leadData.phone,
          clientIpAddress: clientIp,
          clientUserAgent: userAgent,
          fbp: metaFbp,
          fbc: metaFbc,
          fbclid,
          customData: leadData.propertyId
            ? { content_type: 'product', lead_source: leadData.leadSource ?? 'web_form' }
            : { lead_source: leadData.leadSource ?? 'web_form' },
        });
      } catch (error) {
        console.warn('[Meta CAPI] lead conversion skipped', error);
      }
    });

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
