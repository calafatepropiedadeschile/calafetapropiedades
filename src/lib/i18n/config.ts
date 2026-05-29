export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'MXN'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

export const DEFAULT_LOCALE: Locale = 'es';
export const DEFAULT_CURRENCY: SupportedCurrency = 'USD';

export const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string; region: string }> = [
  { value: 'es', label: 'Espanol', region: 'Espana / LatAm' },
  { value: 'en', label: 'English', region: 'International' },
];

export const CURRENCY_OPTIONS: Array<{ value: SupportedCurrency; label: string; symbol: string }> = [
  { value: 'USD', label: 'Dolar estadounidense', symbol: 'US$' },
  { value: 'EUR', label: 'Euro', symbol: 'EUR' },
  { value: 'MXN', label: 'Peso mexicano', symbol: 'MXN' },
];

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function isSupportedCurrency(value: string | null | undefined): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}
