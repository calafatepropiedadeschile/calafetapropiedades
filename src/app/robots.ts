import type { MetadataRoute } from 'next';
import { AI_CRAWLER_USER_AGENTS } from '@/lib/seo/llms-content';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSiteSeoSettings().catch(() => null);
  const siteUrl = await resolveCanonicalBaseUrl();

  if (seo?.allowIndexing === false) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  const disallow = seo?.robotsDisallow.length
    ? seo.robotsDisallow
    : ['/admin/', '/api/', '/gracias'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ['/', '/llms.txt', '/llms-full.txt', '/sobre-calafate'],
        disallow,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
