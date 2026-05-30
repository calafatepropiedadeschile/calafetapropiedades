import type { MetadataRoute } from 'next';
import { getPrismaClient } from '@/lib/db/prisma';
import { seoLandingPages } from '@/config/seo-pages';

export const revalidate = 86400; // Caching ISR for 24 hours to avoid CPU load

const SITEMAP_LIMIT = 2000;
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL
  || process.env.APP_ORIGIN
  || 'https://calafatepropiedades.cl'
).replace(/\/$/, '');

export async function generateSitemaps() {
  try {
    const db = getPrismaClient();
    const count = await db.property.count({
      where: { published: true },
    });

    const numberOfSitemaps = Math.ceil(count / SITEMAP_LIMIT);
    const sitemaps = [];
    
    for (let i = 0; i < Math.max(1, numberOfSitemaps); i++) {
      sitemaps.push({ id: i });
    }

    return sitemaps;
  } catch (error) {
    console.error('Error generating sitemaps list:', error);
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = Number(await id);
  const sitemapId = Number.isFinite(resolvedId) ? resolvedId : 0;

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Add core static route definitions (only for sitemap chunk 0)
  if (sitemapId === 0) {
    const staticRoutes = [
      '',
      '/nosotros',
      '/contacto',
      ...Object.values(seoLandingPages).map((page) => page.path),
    ];
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: {
            es: `${SITE_URL}${route}`,
            en: `${SITE_URL}${route}${route.includes('?') ? '&' : '?'}lang=en`,
          },
        },
      });
    }

    // 2. Fetch and add Static Pages from DB
    try {
      const db = getPrismaClient();
      const staticPages = await db.staticPage.findMany({
        where: { published: true },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      for (const page of staticPages) {
        const pageSlug = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
        sitemapEntries.push({
          url: `${SITE_URL}${pageSlug}`,
          lastModified: page.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates: {
            languages: {
              es: `${SITE_URL}${pageSlug}`,
              en: `${SITE_URL}${pageSlug}?lang=en`,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error fetching static pages for sitemap:', error);
    }
  }

  // 3. Fetch and add dynamic properties for this sitemap chunk
  try {
    const skip = sitemapId * SITEMAP_LIMIT;
    const db = getPrismaClient();
    const properties = await db.property.findMany({
      where: { published: true },
      select: {
        slug: true,
        type: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: SITEMAP_LIMIT,
    });

    for (const property of properties) {
      sitemapEntries.push({
        url: `${SITE_URL}/propiedades/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            es: `${SITE_URL}/propiedades/${property.slug}`,
            en: `${SITE_URL}/propiedades/${property.slug}?lang=en`,
          },
        },
      });

      if (property.type === 'terreno') {
        sitemapEntries.push({
          url: `${SITE_URL}/proyectos/${property.slug}`,
          lastModified: property.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.75,
          alternates: {
            languages: {
              es: `${SITE_URL}/proyectos/${property.slug}`,
              en: `${SITE_URL}/proyectos/${property.slug}?lang=en`,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching properties for sitemap chunk ${sitemapId}:`, error);
  }

  return sitemapEntries;
}
