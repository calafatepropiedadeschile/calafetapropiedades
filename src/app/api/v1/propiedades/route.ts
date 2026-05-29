import { NextResponse, type NextRequest } from 'next/server';
import { PropertyFiltersSchema } from '@/features/properties/property.schemas';
import { getProperties } from '@/features/properties/property.service';
import { apiCorsHeaders } from '@/server/api/request';
import { apiBadRequest, apiOk, apiServerError } from '@/server/api/responses';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/i18n/config';
import type { ApiResponse, PaginatedResponse, PropertyCard } from '@/types/property';

export const runtime = 'nodejs';
export const maxDuration = 5;

export function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: apiCorsHeaders(request),
  });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<PropertyCard>>>> {
  const headers = apiCorsHeaders(request);

  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = PropertyFiltersSchema.safeParse(searchParams);
    const localeParam = request.nextUrl.searchParams.get('locale');
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    const locale = isSupportedLocale(localeParam)
      ? localeParam
      : isSupportedLocale(cookieLocale)
        ? cookieLocale
        : DEFAULT_LOCALE;

    if (!parsed.success) {
      return apiBadRequest('Parametros de filtro invalidos', headers);
    }

    const properties = await getProperties(parsed.data, locale);
    return apiOk(properties, {
      ...headers,
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    });
  } catch (error) {
    console.error('[GET /api/v1/propiedades]', error);
    return apiServerError('Error interno del servidor', headers);
  }
}
