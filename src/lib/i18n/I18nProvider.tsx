'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  isSupportedCurrency,
  isSupportedLocale,
  type Locale,
  type SupportedCurrency,
} from './config';
import { translate, type TranslationKey } from './dictionaries';
import { siteConfig } from '@/config/site';

interface I18nContextValue {
  locale: Locale;
  currency: SupportedCurrency;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  t: (key: TranslationKey) => string;
}

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialCurrency?: SupportedCurrency;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = `${siteConfig.storageKeyPrefix}.locale`;
const CURRENCY_STORAGE_KEY = `${siteConfig.storageKeyPrefix}.currency`;

function writePreferenceCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function persistPreferences(preferences: Partial<{ locale: Locale; currency: SupportedCurrency }>) {
  void fetch('/api/i18n/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
    keepalive: true,
  }).catch(() => {
    // The client cookie above is enough for the current session if the request is interrupted.
  });
}

function readStoredLocale(fallback: Locale): Locale {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isSupportedLocale(stored) ? stored : fallback;
}

function readStoredCurrency(fallback: SupportedCurrency): SupportedCurrency {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return isSupportedCurrency(stored) ? stored : fallback;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialCurrency = DEFAULT_CURRENCY,
}: I18nProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale(initialLocale));
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => readStoredCurrency(initialCurrency));

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    writePreferenceCookie('NEXT_LOCALE', locale);
    if (locale !== initialLocale) {
      persistPreferences({ locale });
    }

    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    writePreferenceCookie('NEXT_CURRENCY', currency);
    if (currency !== initialCurrency) {
      persistPreferences({ currency });
    }
  }, [currency, initialCurrency, initialLocale, locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    currency,
    setLocale(nextLocale) {
      setLocaleState(nextLocale);
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      writePreferenceCookie('NEXT_LOCALE', nextLocale);
      persistPreferences({ locale: nextLocale });
      router.refresh();
    },
    setCurrency(nextCurrency) {
      setCurrencyState(nextCurrency);
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);
      writePreferenceCookie('NEXT_CURRENCY', nextCurrency);
      persistPreferences({ currency: nextCurrency });
      router.refresh();
    },
    t(key) {
      return translate(locale, key);
    },
  }), [currency, locale, router]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}
