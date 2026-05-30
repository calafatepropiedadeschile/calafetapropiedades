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

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialCurrency = DEFAULT_CURRENCY,
}: I18nProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [currency, setCurrencyState] = useState<SupportedCurrency>(initialCurrency);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const storedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);

    if (isSupportedLocale(storedLocale) && storedLocale !== initialLocale) {
      window.setTimeout(() => setLocaleState(storedLocale), 0);
      writePreferenceCookie('NEXT_LOCALE', storedLocale);
      persistPreferences({ locale: storedLocale });
    } else {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, initialLocale);
      writePreferenceCookie('NEXT_LOCALE', initialLocale);
    }

    if (isSupportedCurrency(storedCurrency) && storedCurrency !== initialCurrency) {
      window.setTimeout(() => setCurrencyState(storedCurrency), 0);
      writePreferenceCookie('NEXT_CURRENCY', storedCurrency);
      persistPreferences({ currency: storedCurrency });
    } else {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, initialCurrency);
      writePreferenceCookie('NEXT_CURRENCY', initialCurrency);
    }
  }, [initialCurrency, initialLocale]);

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
