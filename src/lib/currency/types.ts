import type { SupportedCurrency } from '@/lib/i18n/config';

export type ExchangeRateSource = 'mindicador' | 'fallback';

export interface ExchangeRates {
  /** 1 USD en pesos chilenos */
  usdToClp: number;
  /** 1 UF (CLF) en pesos chilenos */
  ufToClp: number;
  updatedAt: string;
  source: ExchangeRateSource;
}

export type MoneyCurrency = SupportedCurrency;
