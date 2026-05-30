import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
} from '@/lib/i18n/config';
import WhatsAppWidget from '@/components/layout/WhatsAppWidget';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';
import { siteConfig } from '@/config/site';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.metadata.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.metadata.description,
  keywords: [...siteConfig.metadata.keywords],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: siteConfig.name,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>
        <I18nProvider initialLocale={DEFAULT_LOCALE} initialCurrency={DEFAULT_CURRENCY}>
          <GoogleAnalytics />
          {children}
          <WhatsAppWidget />
        </I18nProvider>
      </body>
    </html>
  );
}
