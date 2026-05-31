import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { ExchangeRatesProvider } from '@/lib/currency/ExchangeRatesProvider';
import { getExchangeRates } from '@/lib/currency/exchange-rates';
import { getServerCurrency, getServerLocale } from '@/lib/i18n/server';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { RentalsNavProvider } from '@/components/layout/RentalsNavProvider';
import WhatsAppWidget from '@/components/layout/WhatsAppWidget';
import { hasPublishedRentals, shouldShowRentalsNavigation } from '@/features/properties/rental-availability';
import LenisProvider from '@/components/providers/LenisProvider';
import AttributionCapture from '@/components/marketing/AttributionCapture';
import MetaPixel from '@/components/marketing/MetaPixel';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';
import { getSiteSettings } from '@/features/site-content/site-settings';
import { SiteSettingsProvider } from '@/features/site-content/SiteSettingsProvider';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings().catch(() => null);
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const siteName = seo?.siteName ?? 'Calafate Propiedades';
  const baseUrl = seo?.canonicalBaseUrl ?? 'https://calafatepropiedades.vercel.app';
  const defaultTitle = locale === 'en'
    ? (seo?.defaultTitleEn ?? seo?.defaultTitleEs ?? 'Calafate Propiedades')
    : (seo?.defaultTitleEs ?? 'Calafate Propiedades');
  const defaultDescription = locale === 'en'
    ? (seo?.defaultDescriptionEn ?? seo?.defaultDescriptionEs ?? '')
    : (seo?.defaultDescriptionEs ?? '');
  const defaultOgImage = seo?.defaultOgImage ? [{ url: seo.defaultOgImage }] : [];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: seo?.titleTemplate ?? `%s | ${siteName}`,
    },
    description: defaultDescription,
    keywords: seo?.keywords ?? [],
    robots: seo?.allowIndexing === false ? { index: false, follow: false } : { index: true, follow: true },
    verification: seo?.googleSiteVerification
      ? { google: seo.googleSiteVerification }
      : undefined,
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'es_CL',
      siteName,
      title: defaultTitle,
      description: defaultDescription,
      url: baseUrl,
      images: defaultOgImage,
    },
    twitter: {
      card: defaultOgImage.length > 0 ? 'summary_large_image' : 'summary',
      title: defaultTitle,
      description: defaultDescription,
      images: seo?.defaultOgImage ? [seo.defaultOgImage] : [],
    },
  };
}

function AppProviders({
  children,
  locale,
  currency,
  exchangeRates,
  showRentalsLink,
  rentalsPublished,
  googleAnalyticsId,
  metaPixelId,
}: {
  children: React.ReactNode;
  locale: Awaited<ReturnType<typeof getServerLocale>>;
  currency: Awaited<ReturnType<typeof getServerCurrency>>;
  exchangeRates: Awaited<ReturnType<typeof getExchangeRates>>;
  showRentalsLink: boolean;
  rentalsPublished: boolean;
  googleAnalyticsId?: string | null;
  metaPixelId?: string | null;
}) {
  return (
    <I18nProvider initialLocale={locale} initialCurrency={currency}>
      <ExchangeRatesProvider initialRates={exchangeRates}>
        <RentalsNavProvider showRentalsLink={showRentalsLink} hasPublishedRentals={rentalsPublished}>
          <AttributionCapture />
          <GoogleAnalytics measurementId={googleAnalyticsId} />
          <MetaPixel pixelId={metaPixelId} />
          {children}
          <WhatsAppWidget />
        </RentalsNavProvider>
      </ExchangeRatesProvider>
    </I18nProvider>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [seo, siteSettings, showRentalsLink, rentalsPublished, locale, currency, exchangeRates] = await Promise.all([
    getSiteSeoSettings().catch(() => null),
    getSiteSettings(),
    shouldShowRentalsNavigation(),
    hasPublishedRentals(),
    getServerLocale(),
    getServerCurrency(),
    getExchangeRates(),
  ]);

  const providerProps = {
    locale,
    currency,
    exchangeRates,
    showRentalsLink,
    rentalsPublished,
    googleAnalyticsId: seo?.googleAnalyticsId,
    metaPixelId: seo?.metaPixelId,
  };

  return (
    <html lang={locale}>
      <body>
        <LenisProvider>
          <SiteSettingsProvider settings={siteSettings}>
            <AppProviders {...providerProps}>
              {children}
            </AppProviders>
          </SiteSettingsProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
