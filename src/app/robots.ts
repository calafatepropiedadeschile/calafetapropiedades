import type { MetadataRoute } from 'next';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSiteSeoSettings().catch(() => null);
  const siteUrl = seo?.canonicalBaseUrl ?? 'https://calafatepropiedades.vercel.app';

  if (seo?.allowIndexing === false) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: seo?.robotsDisallow.length ? seo.robotsDisallow : ['/admin/', '/api/', '/gracias'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
