import { NextResponse } from 'next/server';
import {
  isSupportedCurrency,
  isSupportedLocale,
  type Locale,
  type SupportedCurrency,
} from '@/lib/i18n/config';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type PreferencePayload = Partial<{
  locale: Locale;
  currency: SupportedCurrency;
}>;

export async function POST(request: Request) {
  let payload: PreferencePayload;

  try {
    payload = await request.json() as PreferencePayload;
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  if (isSupportedLocale(payload.locale)) {
    response.cookies.set('NEXT_LOCALE', payload.locale, {
      maxAge: ONE_YEAR_SECONDS,
      path: '/',
      sameSite: 'lax',
    });
  }

  if (isSupportedCurrency(payload.currency)) {
    response.cookies.set('NEXT_CURRENCY', payload.currency, {
      maxAge: ONE_YEAR_SECONDS,
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}
