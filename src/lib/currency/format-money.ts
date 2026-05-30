import type { Locale, SupportedCurrency } from '@/lib/i18n/config';
import { isRentalPriceType } from '@/features/properties/price-type';
import { convertAmount } from './exchange-rates';
import type { ExchangeRates } from './types';

export function formatMoney(
  amount: number,
  currency: SupportedCurrency,
  locale: Locale = 'es',
): string {
  if (currency === 'CLF') {
    const formatted = amount.toLocaleString(locale === 'en' ? 'en-US' : 'es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return locale === 'en' ? `${formatted} UF` : `${formatted} UF`;
  }

  const intlLocale = locale === 'en' ? 'en-US' : 'es-CL';
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'CLP',
    maximumFractionDigits: currency === 'USD' ? 0 : 0,
  }).format(amount);
}

export interface FormatPropertyPriceOptions {
  priceFrom?: boolean;
  locale?: Locale;
  priceType?: string | null;
  /** Moneda elegida por el visitante; si difiere de la de la propiedad, se convierte. */
  displayCurrency?: SupportedCurrency;
  rates?: ExchangeRates;
}

export function formatPropertyPrice(
  price: number,
  propertyCurrency: SupportedCurrency | string,
  options?: FormatPropertyPriceOptions,
): string {
  const storedCurrency = propertyCurrency as SupportedCurrency;
  const displayCurrency = options?.displayCurrency ?? storedCurrency;
  const locale = options?.locale ?? 'es';

  let displayAmount = price;
  if (
    options?.rates
    && displayCurrency !== storedCurrency
  ) {
    displayAmount = convertAmount(price, storedCurrency, displayCurrency, options.rates);
  }

  const formatted = formatMoney(displayAmount, displayCurrency, locale);
  const rentalSuffix = isRentalPriceType(options?.priceType)
    ? (locale === 'en' ? '/mo' : '/mes')
    : '';

  if (!options?.priceFrom) {
    return `${formatted}${rentalSuffix}`;
  }

  const prefix = locale === 'en' ? 'From ' : 'Desde ';
  return `${prefix}${formatted}${rentalSuffix}`;
}

export function formatPrice(
  price: number,
  currency: SupportedCurrency | string = 'CLP',
  locale: Locale = 'es',
): string {
  return formatMoney(price, currency as SupportedCurrency, locale);
}
