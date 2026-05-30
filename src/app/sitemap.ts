import type { MetadataRoute } from 'next';
import { getPrismaClient } from '@/lib/db/prisma';
import { seoLandingPages } from '@/config/seo-pages';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

export const revalidate = 86400; // Caching ISR for 24 hours to avoid CPU load

const FALLBACK_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL
  || process.env.APP_ORIGIN
  || 'https://calafetapropiedades.vercel.app'
).replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSiteSeoSettings().catch(() => null);
  const siteUrl = seo?.canonicalBaseUrl ?? FALLBACK_SITE_URL;

  if (seo?.allowIndexing === false) {
    return [];
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  const staticRoutes = [
    '',
    '/nosotros',
    '/contacto',
    ...Object.values(seoLandingPages).map((page) => page.path),
  ];
  const staticRouteSet = new Set(staticRoutes.map((route) => route.replace(/^\//, '')));

  for (const route of staticRoutes) {
    sitemapEntries.push({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          es: `${siteUrl}${route}`,
          en: `${siteUrl}${route}${route.includes('?') ? '&' : '?'}lang=en`,
        },
      },
    });
  }

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
      if (staticRouteSet.has(page.slug.replace(/^\//, ''))) continue;

      const pageSlug = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
      sitemapEntries.push({
        url: `${siteUrl}${pageSlug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages: {
            es: `${siteUrl}${pageSlug}`,
            en: `${siteUrl}${pageSlug}?lang=en`,
          },
        },
      });
    }
  } catch (error) {
    console.error('Error fetching static pages for sitemap:', error);
  }

  try {
    const db = getPrismaClient();
    const properties = await db.property.findMany({
      where: {
        published: true,
        country: 'Chile',
        type: { in: ['terreno', 'casa'] },
        OR: [
          { coverImage: null },
          { coverImage: { not: { startsWith: 'https://images.unsplash.com' } } },
        ],
      },
      select: {
        slug: true,
        type: true,
        priceType: true,
        coverImage: true,
        images: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 2000,
    });

    for (const property of properties) {
      const extraImages = (() => {
        try {
          return JSON.parse(property.images) as unknown;
        } catch {
          return [];
        }
      })();
      const images = [
        property.coverImage,
        ...(Array.isArray(extraImages) ? extraImages : []),
      ]
        .filter((image): image is string => typeof image === 'string' && image.startsWith('http'))
        .slice(0, 6);

      sitemapEntries.push({
        url: `${siteUrl}/propiedades/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        images,
        alternates: {
          languages: {
            es: `${siteUrl}/propiedades/${property.slug}`,
            en: `${siteUrl}/propiedades/${property.slug}?lang=en`,
          },
        },
      });

      if (property.type === 'terreno' && property.priceType !== 'arriendo') {
        sitemapEntries.push({
          url: `${siteUrl}/proyectos/${property.slug}`,
          lastModified: property.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.75,
          images,
          alternates: {
            languages: {
              es: `${siteUrl}/proyectos/${property.slug}`,
              en: `${siteUrl}/proyectos/${property.slug}?lang=en`,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  return sitemapEntries;
}
