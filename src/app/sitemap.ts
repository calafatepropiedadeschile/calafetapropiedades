import type { MetadataRoute } from 'next';
import { getPrismaClient } from '@/lib/db/prisma';
import { projectLandingSlugs, seoLandingPages } from '@/config/seo-pages';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { buildSitemapLanguageAlternates } from '@/lib/seo/metadata-alternates';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSiteSeoSettings().catch(() => null);
  const siteUrl = await resolveCanonicalBaseUrl();

  if (seo?.allowIndexing === false) {
    return [];
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  const staticRoutes = [
    '',
    '/propiedades',
    '/arriendos',
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
      alternates: buildSitemapLanguageAlternates(siteUrl, route || '/'),
    });
  }

  const projectUpdatedAt = new Map<string, Date>();
  try {
    const db = getPrismaClient();
    const projectProperties = await db.property.findMany({
      where: {
        published: true,
        slug: { in: [...projectLandingSlugs] },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    for (const property of projectProperties) {
      projectUpdatedAt.set(property.slug, property.updatedAt);
    }
  } catch (error) {
    console.error('Error fetching project landings for sitemap:', error);
  }

  for (const slug of projectLandingSlugs) {
    const path = `/proyectos/${slug}`;
    sitemapEntries.push({
      url: `${siteUrl}${path}`,
      lastModified: projectUpdatedAt.get(slug) ?? new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
      alternates: buildSitemapLanguageAlternates(siteUrl, path),
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
        alternates: buildSitemapLanguageAlternates(siteUrl, pageSlug),
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
        alternates: buildSitemapLanguageAlternates(siteUrl, `/propiedades/${property.slug}`),
      });

    }
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  return sitemapEntries;
}
