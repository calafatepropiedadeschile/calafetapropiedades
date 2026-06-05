import type { MetadataRoute } from 'next';
import { getPrismaClient } from '@/lib/db/prisma';
import { projectLandingSlugs, seoLandingPages } from '@/config/seo-pages';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';
import { buildSitemapLanguageAlternates } from '@/lib/seo/metadata-alternates';
import { isProjectLandingSlug } from '@/lib/seo/project-landings';
import {
  getPropertyVideoWatchPath,
  getPropertyVirtualTourWatchPath,
} from '@/lib/seo/property-media-pages';
import { resolveSitemapIncludeEnglish } from '@/lib/seo/sitemap-locale';

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
    '/sobre-calafate',
    ...Object.values(seoLandingPages).map((page) => page.path),
  ];
  const staticRouteSet = new Set(staticRoutes.map((route) => route.replace(/^\//, '')));

  for (const route of staticRoutes) {
    const includeEnglish = await resolveSitemapIncludeEnglish(route || '/', seo);
    sitemapEntries.push({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.8,
      alternates: buildSitemapLanguageAlternates(siteUrl, route || '/', { includeEnglish }),
    });
  }

  const projectMeta = new Map<string, { updatedAt: Date; seoTitleEn: string | null; seoDescriptionEn: string | null }>();
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
        seoTitleEn: true,
        seoDescriptionEn: true,
      },
    });

    for (const property of projectProperties) {
      projectMeta.set(property.slug, property);
    }
  } catch (error) {
    console.error('Error fetching project landings for sitemap:', error);
  }

  for (const slug of projectLandingSlugs) {
    const path = `/proyectos/${slug}`;
    const meta = projectMeta.get(slug);
    const includeEnglish = await resolveSitemapIncludeEnglish(path, seo, meta);
    sitemapEntries.push({
      url: `${siteUrl}${path}`,
      lastModified: meta?.updatedAt ?? new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
      alternates: buildSitemapLanguageAlternates(siteUrl, path, { includeEnglish }),
    });
  }

  try {
    const db = getPrismaClient();
    const staticPages = await db.staticPage.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        seoTitleEn: true,
        seoDescriptionEn: true,
      },
    });

    for (const page of staticPages) {
      if (staticRouteSet.has(page.slug.replace(/^\//, ''))) continue;

      const pageSlug = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
      const includeEnglish = await resolveSitemapIncludeEnglish(pageSlug, seo, page);
      sitemapEntries.push({
        url: `${siteUrl}${pageSlug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: buildSitemapLanguageAlternates(siteUrl, pageSlug, { includeEnglish }),
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
        seoTitleEn: true,
        seoDescriptionEn: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 2000,
    });

    for (const property of properties) {
      if (isProjectLandingSlug(property.slug)) {
        continue;
      }

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

      const path = `/propiedades/${property.slug}`;
      const includeEnglish = await resolveSitemapIncludeEnglish(path, seo, property);
      sitemapEntries.push({
        url: `${siteUrl}${path}`,
        lastModified: property.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        images,
        alternates: buildSitemapLanguageAlternates(siteUrl, path, { includeEnglish }),
      });
    }
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  try {
    const db = getPrismaClient();
    const mediaProperties = await db.property.findMany({
      where: {
        published: true,
        OR: [
          { youtubeUrl: { not: null } },
          { virtualTourUrl: { not: null } },
        ],
      },
      select: {
        slug: true,
        youtubeUrl: true,
        virtualTourUrl: true,
        updatedAt: true,
        seoTitleEn: true,
        seoDescriptionEn: true,
      },
    });

    for (const property of mediaProperties) {
      if (property.youtubeUrl?.trim()) {
        const path = getPropertyVideoWatchPath(property.slug);
        const includeEnglish = await resolveSitemapIncludeEnglish(path, seo, property);
        sitemapEntries.push({
          url: `${siteUrl}${path}`,
          lastModified: property.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.55,
          alternates: buildSitemapLanguageAlternates(siteUrl, path, { includeEnglish }),
        });
      }

      if (property.virtualTourUrl?.trim()) {
        const path = getPropertyVirtualTourWatchPath(property.slug);
        const includeEnglish = await resolveSitemapIncludeEnglish(path, seo, property);
        sitemapEntries.push({
          url: `${siteUrl}${path}`,
          lastModified: property.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.55,
          alternates: buildSitemapLanguageAlternates(siteUrl, path, { includeEnglish }),
        });
      }
    }
  } catch (error) {
    console.error('Error fetching property media pages for sitemap:', error);
  }

  return sitemapEntries;
}
