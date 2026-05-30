import { cookies } from 'next/headers';
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  isSupportedCurrency,
  isSupportedLocale,
  type Locale,
  type SupportedCurrency,
} from './config';

type SearchParamsLike = {
  lang?: string | string[];
  locale?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function getServerLocale(searchParams?: SearchParamsLike): Promise<Locale> {
  const param = firstParam(searchParams?.lang) ?? firstParam(searchParams?.locale);
  if (isSupportedLocale(param)) {
    return param;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  return DEFAULT_LOCALE;
}

export async function getServerCurrency(): Promise<SupportedCurrency> {
  const cookieStore = await cookies();
  const cookieCurrency = cookieStore.get('NEXT_CURRENCY')?.value;
  if (isSupportedCurrency(cookieCurrency)) {
    return cookieCurrency;
  }

  return DEFAULT_CURRENCY;
}

export function resolveLocaleFromParam(value: string | undefined, fallback: Locale = DEFAULT_LOCALE): Locale {
  return isSupportedLocale(value) ? value : fallback;
}

export async function getRequestLocale(searchParams?: SearchParamsLike): Promise<Locale> {
  return getServerLocale(searchParams);
}
