import { unstable_cache } from 'next/cache';
import type { SupportedCurrency } from '@/lib/i18n/config';
import type { ExchangeRates } from './types';

const MINDICADOR_API_URL = 'https://mindicador.cl/api';

/** Valores de respaldo si mindicador.cl no responde (aprox. mercado Chile). */
export const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
  usdToClp: 900,
  ufToClp: 39_000,
  updatedAt: '',
  source: 'fallback',
};

type MindicadorIndicator = { valor: number };
type MindicadorApiResponse = {
  uf: MindicadorIndicator;
  dolar: MindicadorIndicator;
};

async function fetchRatesFromMindicador(): Promise<ExchangeRates> {
  const response = await fetch(MINDICADOR_API_URL, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`mindicador.cl responded with ${response.status}`);
  }

  const data = (await response.json()) as MindicadorApiResponse;
  const usdToClp = data.dolar?.valor;
  const ufToClp = data.uf?.valor;

  if (!usdToClp || !ufToClp || usdToClp <= 0 || ufToClp <= 0) {
    throw new Error('mindicador.cl returned invalid exchange rates');
  }

  return {
    usdToClp,
    ufToClp,
    updatedAt: new Date().toISOString(),
    source: 'mindicador',
  };
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    return await fetchRatesFromMindicador();
  } catch (error) {
    console.warn('Using fallback exchange rates.', error);
    return {
      ...FALLBACK_EXCHANGE_RATES,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const getExchangeRates = unstable_cache(
  fetchExchangeRates,
  ['chile-exchange-rates'],
  { revalidate: 3600 },
);

/** Convierte un monto a pesos chilenos (unidad base). */
export function amountToClp(
  amount: number,
  currency: SupportedCurrency,
  rates: ExchangeRates,
): number {
  switch (currency) {
    case 'CLP':
      return amount;
    case 'USD':
      return amount * rates.usdToClp;
    case 'CLF':
      return amount * rates.ufToClp;
    default:
      return amount;
  }
}

/** Convierte pesos chilenos a la moneda destino. */
export function clpToAmount(
  clp: number,
  currency: SupportedCurrency,
  rates: ExchangeRates,
): number {
  switch (currency) {
    case 'CLP':
      return clp;
    case 'USD':
      return clp / rates.usdToClp;
    case 'CLF':
      return clp / rates.ufToClp;
    default:
      return clp;
  }
}

export function convertAmount(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  rates: ExchangeRates,
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const clp = amountToClp(amount, fromCurrency, rates);
  const converted = clpToAmount(clp, toCurrency, rates);
  return roundForCurrency(converted, toCurrency);
}

export function roundForCurrency(amount: number, currency: SupportedCurrency): number {
  switch (currency) {
    case 'CLP':
      return Math.round(amount);
    case 'USD':
      return Math.round(amount);
    case 'CLF':
      return Math.round(amount * 100) / 100;
    default:
      return amount;
  }
}

export function isValidExchangeRates(rates: unknown): rates is ExchangeRates {
  if (!rates || typeof rates !== 'object') return false;
  const candidate = rates as ExchangeRates;
  return (
    typeof candidate.usdToClp === 'number'
    && typeof candidate.ufToClp === 'number'
    && candidate.usdToClp > 0
    && candidate.ufToClp > 0
  );
}
