import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getServerCurrency, getServerLocale } from '@/lib/i18n/server';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { RentalsNavProvider } from '@/components/layout/RentalsNavProvider';
import WhatsAppWidget from '@/components/layout/WhatsAppWidget';
import { hasPublishedRentals, shouldShowRentalsNavigation } from '@/features/properties/rental-availability';
import AttributionCapture from '@/components/marketing/AttributionCapture';
import MetaPixel from '@/components/marketing/MetaPixel';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings().catch(() => null);
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const siteName = seo?.siteName ?? 'Calafate Propiedades';
  const baseUrl = seo?.canonicalBaseUrl ?? 'https://calafetapropiedades.vercel.app';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [seo, showRentalsLink, rentalsPublished, locale, currency] = await Promise.all([
    getSiteSeoSettings().catch(() => null),
    shouldShowRentalsNavigation(),
    hasPublishedRentals(),
    getServerLocale(),
    getServerCurrency(),
  ]);

  return (
    <html lang={locale}>
      <body>
        <I18nProvider initialLocale={locale} initialCurrency={currency}>
          <RentalsNavProvider showRentalsLink={showRentalsLink} hasPublishedRentals={rentalsPublished}>
            <AttributionCapture />
            <GoogleAnalytics measurementId={seo?.googleAnalyticsId} />
            <MetaPixel pixelId={seo?.metaPixelId} />
            {children}
            <WhatsAppWidget />
          </RentalsNavProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
