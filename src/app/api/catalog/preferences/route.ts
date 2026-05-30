import { NextResponse } from 'next/server';
import {
  catalogPreferenceCookieOptions,
  CATALOG_TYPE_COOKIE,
  CATALOG_ZONE_COOKIE,
} from '@/lib/catalog/catalog-preferences';

type PreferencePayload = Partial<{
  type: '' | 'terreno' | 'casa';
  zone: string;
}>;

export async function POST(request: Request) {
  let payload: PreferencePayload;

  try {
    payload = await request.json() as PreferencePayload;
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  const options = catalogPreferenceCookieOptions();

  if (payload.type !== undefined) {
    const type = payload.type === 'terreno' || payload.type === 'casa' ? payload.type : '';
    response.cookies.set(CATALOG_TYPE_COOKIE, type, options);
  }

  if (payload.zone !== undefined) {
    response.cookies.set(CATALOG_ZONE_COOKIE, payload.zone.trim(), options);
  }

  return response;
}
