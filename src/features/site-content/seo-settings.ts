import { unstable_cache } from 'next/cache';
import type { SiteSeoSettings } from '@prisma/client';
import { getPrismaClient } from '@/lib/db/prisma';
import { withDatabaseRole } from '@/lib/db/rls';
import { siteConfig } from '@/config/site';
import type { SiteSeoSettingsInput } from './seo-settings.schemas';

export const SITE_SEO_SETTINGS_ID = 'main';

const DEFAULT_KEYWORDS = [
  'Calafate Propiedades',
  'parcelas',
  'terrenos',
  'loteos',
  'proyectos inmobiliarios',
  'parcelas en venta',
  'Los Lagos',
  'Los Rios',
  'Maule',
  'topografia',
];

const DEFAULT_ROBOTS_DISALLOW = ['/admin/', '/api/', '/gracias'];

export type SiteSeoSettingsView = {
  siteName: string;
  titleTemplate: string;
  defaultTitleEs: string;
  defaultDescriptionEs: string;
  defaultTitleEn: string | null;
  defaultDescriptionEn: string | null;
  keywords: string[];
  canonicalBaseUrl: string;
  defaultOgImage: string | null;
  googleSiteVerification: string | null;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
  allowIndexing: boolean;
  robotsDisallow: string[];
  updatedAt: Date | null;
};

function safeList(value: string | null | undefined, fallback: string[]) {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    return parsed
      .map((item) => typeof item === 'string' ? item.trim() : '')
      .filter(Boolean);
  } catch {
    return fallback;
  }
}

function getDefaultCanonicalBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL
    || process.env.APP_ORIGIN
    || 'https://calafetapropiedades.vercel.app'
  ).replace(/\/$/, '');
}

function trimOrNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getDefaultSiteSeoSettings(): SiteSeoSettingsView {
  return {
    siteName: siteConfig.name,
    titleTemplate: `%s | ${siteConfig.name}`,
    defaultTitleEs: siteConfig.metadata.title,
    defaultDescriptionEs: siteConfig.metadata.description,
    defaultTitleEn: null,
    defaultDescriptionEn: null,
    keywords: [...siteConfig.metadata.keywords],
    canonicalBaseUrl: getDefaultCanonicalBaseUrl(),
    defaultOgImage: null,
    googleSiteVerification: null,
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID ?? null,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
    allowIndexing: true,
    robotsDisallow: [...DEFAULT_ROBOTS_DISALLOW],
    updatedAt: null,
  };
}

export function mapSiteSeoSettings(row: SiteSeoSettings | null): SiteSeoSettingsView {
  const fallback = getDefaultSiteSeoSettings();
  if (!row) return fallback;

  return {
    siteName: row.siteName.trim() || fallback.siteName,
    titleTemplate: row.titleTemplate.trim() || fallback.titleTemplate,
    defaultTitleEs: row.defaultTitleEs.trim() || fallback.defaultTitleEs,
    defaultDescriptionEs: row.defaultDescriptionEs.trim() || fallback.defaultDescriptionEs,
    defaultTitleEn: trimOrNull(row.defaultTitleEn),
    defaultDescriptionEn: trimOrNull(row.defaultDescriptionEn),
    keywords: safeList(row.keywords, DEFAULT_KEYWORDS),
    canonicalBaseUrl: row.canonicalBaseUrl.trim().replace(/\/$/, '') || fallback.canonicalBaseUrl,
    defaultOgImage: trimOrNull(row.defaultOgImage),
    googleSiteVerification: trimOrNull(row.googleSiteVerification),
    googleAnalyticsId: trimOrNull(row.googleAnalyticsId) ?? fallback.googleAnalyticsId,
    metaPixelId: trimOrNull(row.metaPixelId) ?? fallback.metaPixelId,
    allowIndexing: row.allowIndexing,
    robotsDisallow: safeList(row.robotsDisallow, DEFAULT_ROBOTS_DISALLOW),
    updatedAt: row.updatedAt,
  };
}

async function ensureSiteSeoSettingsRow() {
  return withDatabaseRole('admin', async (db) => {
    const existing = await db.siteSeoSettings.findUnique({ where: { id: SITE_SEO_SETTINGS_ID } });
    if (existing) return existing;

    const fallback = getDefaultSiteSeoSettings();
    return db.siteSeoSettings.create({
      data: {
        id: SITE_SEO_SETTINGS_ID,
        siteName: fallback.siteName,
        titleTemplate: fallback.titleTemplate,
        defaultTitleEs: fallback.defaultTitleEs,
        defaultDescriptionEs: fallback.defaultDescriptionEs,
        defaultTitleEn: fallback.defaultTitleEn,
        defaultDescriptionEn: fallback.defaultDescriptionEn,
        keywords: JSON.stringify(fallback.keywords),
        canonicalBaseUrl: fallback.canonicalBaseUrl,
        defaultOgImage: fallback.defaultOgImage,
        googleSiteVerification: fallback.googleSiteVerification,
        googleAnalyticsId: fallback.googleAnalyticsId,
        metaPixelId: fallback.metaPixelId,
        allowIndexing: fallback.allowIndexing,
        robotsDisallow: JSON.stringify(fallback.robotsDisallow),
      },
    });
  });
}

export async function getSiteSeoSettings(): Promise<SiteSeoSettingsView> {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      const row = await db.siteSeoSettings.findUnique({ where: { id: SITE_SEO_SETTINGS_ID } });
      return mapSiteSeoSettings(row);
    },
    ['site-seo-settings-v1'],
    { revalidate: 300, tags: ['site-content', 'site-seo'] }
  )();
}

export async function getSiteSeoSettingsForAdmin(): Promise<SiteSeoSettingsView> {
  const row = await ensureSiteSeoSettingsRow();
  return mapSiteSeoSettings(row);
}

export async function saveSiteSeoSettings(input: SiteSeoSettingsInput) {
  await withDatabaseRole('admin', async (db) => {
    await db.siteSeoSettings.upsert({
      where: { id: SITE_SEO_SETTINGS_ID },
      create: {
        id: SITE_SEO_SETTINGS_ID,
        siteName: input.siteName,
        titleTemplate: input.titleTemplate,
        defaultTitleEs: input.defaultTitleEs,
        defaultDescriptionEs: input.defaultDescriptionEs,
        defaultTitleEn: input.defaultTitleEn,
        defaultDescriptionEn: input.defaultDescriptionEn,
        keywords: JSON.stringify(input.keywords),
        canonicalBaseUrl: input.canonicalBaseUrl.replace(/\/$/, ''),
        defaultOgImage: input.defaultOgImage,
        googleSiteVerification: input.googleSiteVerification,
        googleAnalyticsId: input.googleAnalyticsId,
        metaPixelId: input.metaPixelId,
        allowIndexing: input.allowIndexing,
        robotsDisallow: JSON.stringify(input.robotsDisallow),
      },
      update: {
        siteName: input.siteName,
        titleTemplate: input.titleTemplate,
        defaultTitleEs: input.defaultTitleEs,
        defaultDescriptionEs: input.defaultDescriptionEs,
        defaultTitleEn: input.defaultTitleEn,
        defaultDescriptionEn: input.defaultDescriptionEn,
        keywords: JSON.stringify(input.keywords),
        canonicalBaseUrl: input.canonicalBaseUrl.replace(/\/$/, ''),
        defaultOgImage: input.defaultOgImage,
        googleSiteVerification: input.googleSiteVerification,
        googleAnalyticsId: input.googleAnalyticsId,
        metaPixelId: input.metaPixelId,
        allowIndexing: input.allowIndexing,
        robotsDisallow: JSON.stringify(input.robotsDisallow),
      },
    });
  });
}
