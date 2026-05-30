import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoCatalogLanding from '@/components/seo/SeoCatalogLanding';
import { seoLandingPages, siteUrl, type SeoLandingKey } from '@/config/seo-pages';
import { getStaticPropertyCatalog } from '@/features/properties/property.service';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

export const revalidate = 3600;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export function metadataForSeoLanding(key: SeoLandingKey): Metadata {
  const config = seoLandingPages[key];
  const canonical = `${siteUrl}${config.path}`;

  return {
    title: config.metadataTitle,
    description: config.metadataDescription,
    alternates: { canonical },
    openGraph: {
      title: config.metadataTitle,
      description: config.metadataDescription,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.metadataTitle,
      description: config.metadataDescription,
    },
  };
}

async function getSafePropertyCatalog() {
  if (!hasDatabaseUrl) return [];

  try {
    return await getStaticPropertyCatalog(DEFAULT_LOCALE);
  } catch (error) {
    console.warn('Skipping SEO landing catalog because the datasource is unavailable.', error);
    return [];
  }
}

export default async function SeoLandingPage({ pageKey }: { pageKey: SeoLandingKey }) {
  const properties = await getSafePropertyCatalog();
  const config = seoLandingPages[pageKey];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))' }}>
        <SeoCatalogLanding config={config} properties={properties} />
      </main>
      <Footer />
    </>
  );
}
