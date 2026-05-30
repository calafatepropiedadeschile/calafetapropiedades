'use client';

import { createContext, useContext, useMemo } from 'react';
import type { SupportedCurrency } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  formatPropertyPrice,
  type FormatPropertyPriceOptions,
} from '@/lib/currency/format-money';
import type { ExchangeRates } from './types';

interface ExchangeRatesContextValue {
  rates: ExchangeRates;
  formatPropertyPriceForUser: (
    price: number,
    propertyCurrency: SupportedCurrency | string,
    options?: Omit<FormatPropertyPriceOptions, 'displayCurrency' | 'rates'>,
  ) => string;
}

const ExchangeRatesContext = createContext<ExchangeRatesContextValue | null>(null);

interface Props {
  children: React.ReactNode;
  initialRates: ExchangeRates;
}

export function ExchangeRatesProvider({ children, initialRates }: Props) {
  const { currency: displayCurrency, locale } = useI18n();

  const value = useMemo<ExchangeRatesContextValue>(() => ({
    rates: initialRates,
    formatPropertyPriceForUser(price, propertyCurrency, options) {
      return formatPropertyPrice(price, propertyCurrency, {
        ...options,
        locale: options?.locale ?? locale,
        displayCurrency,
        rates: initialRates,
      });
    },
  }), [displayCurrency, initialRates, locale]);

  return (
    <ExchangeRatesContext.Provider value={value}>
      {children}
    </ExchangeRatesContext.Provider>
  );
}

export function useExchangeRates() {
  const context = useContext(ExchangeRatesContext);
  if (!context) {
    throw new Error('useExchangeRates must be used inside ExchangeRatesProvider.');
  }
  return context;
}
