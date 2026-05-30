export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export const SUPPORTED_CURRENCIES = ['CLP', 'CLF', 'USD'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

export const DEFAULT_LOCALE: Locale = 'es';
export const DEFAULT_CURRENCY: SupportedCurrency = 'CLP';

export const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string; region: string }> = [
  { value: 'es', label: 'Español', region: 'Chile' },
  { value: 'en', label: 'English', region: 'International' },
];

export const CURRENCY_OPTIONS: Array<{ value: SupportedCurrency; label: string; symbol: string }> = [
  { value: 'CLP', label: 'Peso chileno', symbol: 'CLP' },
  { value: 'CLF', label: 'Unidad de fomento', symbol: 'UF' },
  { value: 'USD', label: 'Dolar estadounidense', symbol: 'US$' },
];

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function isSupportedCurrency(value: string | null | undefined): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}
