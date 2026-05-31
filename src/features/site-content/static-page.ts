import { unstable_cache } from 'next/cache';
import type { StaticPage } from '@prisma/client';
import type { Locale } from '@/lib/i18n/config';
import { getPrismaClient } from '@/lib/db/prisma';
import { withDatabaseRole } from '@/lib/db/rls';
import { sanitizeCmsHtml, sanitizeOptionalCmsHtml } from '@/lib/security/sanitize-html';
import { normalizeOptionalCanonicalUrl } from '@/config/seo-url';
import type { StaticPageInput } from './static-page.schemas';

export type StaticPageView = {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  customCanonical: string | null;
  ogImage: string | null;
  updatedAt: Date;
};

export type StaticPageAdminRecord = {
  id: string;
  slug: string;
  titleEs: string;
  published: boolean;
  updatedAt: Date;
};

function pickLocalizedText(
  locale: Locale,
  es: string,
  en: string | null | undefined,
) {
  if (locale === 'en') {
    const trimmed = en?.trim();
    return trimmed ? trimmed : es;
  }

  return es;
}

export function mapStaticPageView(page: StaticPage, locale: Locale): StaticPageView {
  return {
    id: page.id,
    slug: page.slug,
    title: pickLocalizedText(locale, page.titleEs, page.titleEn),
    content: sanitizeCmsHtml(pickLocalizedText(locale, page.contentEs, page.contentEn)),
    published: page.published,
    seoTitle: pickLocalizedText(locale, page.seoTitleEs ?? '', page.seoTitleEn) || null,
    seoDescription: pickLocalizedText(locale, page.seoDescriptionEs ?? '', page.seoDescriptionEn) || null,
    customCanonical: normalizeOptionalCanonicalUrl(page.customCanonical),
    ogImage: page.ogImage,
    updatedAt: page.updatedAt,
  };
}

export async function getStaticPageEnglishSeoAvailable(slug: string): Promise<boolean> {
  try {
    const db = getPrismaClient();
    const page = await db.staticPage.findFirst({
      where: { slug, published: true },
      select: {
        seoTitleEn: true,
        seoDescriptionEn: true,
      },
    });
    return Boolean(page?.seoTitleEn?.trim() || page?.seoDescriptionEn?.trim());
  } catch {
    return false;
  }
}

export async function getPublishedStaticPageBySlug(slug: string, locale: Locale) {
  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      const page = await db.staticPage.findFirst({
        where: { slug, published: true },
      });

      return page ? mapStaticPageView(page, locale) : null;
    },
    ['static-page-published-v2', slug, locale],
    { revalidate: 300, tags: ['site-content', `static-page-${slug}`] }
  )();
}

export async function getStaticPageBySlugForAdmin(slug: string, locale: Locale) {
  return withDatabaseRole('admin', async (db) => {
    const page = await db.staticPage.findUnique({ where: { slug } });
    return page ? mapStaticPageView(page, locale) : null;
  });
}

export async function getStaticPageAdminList() {
  return withDatabaseRole('admin', async (db) => (
    db.staticPage.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titleEs: true,
        published: true,
        updatedAt: true,
      },
    })
  ));
}

export async function getStaticPageById(id: string) {
  return withDatabaseRole('admin', async (db) => (
    db.staticPage.findUnique({ where: { id } })
  ));
}

export async function createStaticPageRecord(input: StaticPageInput) {
  return withDatabaseRole('admin', async (db) => {
    const existing = await db.staticPage.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });

    if (existing) {
      throw new Error('slug: Ya existe una pagina con esa URL.');
    }

    return db.staticPage.create({
      data: {
        slug: input.slug,
        titleEs: input.titleEs,
        titleEn: input.titleEn,
        contentEs: sanitizeCmsHtml(input.contentEs),
        contentEn: sanitizeOptionalCmsHtml(input.contentEn),
        published: input.published,
        seoTitleEs: input.seoTitleEs,
        seoTitleEn: input.seoTitleEn,
        seoDescriptionEs: input.seoDescriptionEs,
        seoDescriptionEn: input.seoDescriptionEn,
        customCanonical: input.customCanonical,
        ogImage: input.ogImage,
      },
      select: { id: true },
    });
  });
}

export async function updateStaticPageRecord(id: string, input: StaticPageInput) {
  return withDatabaseRole('admin', async (db) => {
    const conflict = await db.staticPage.findFirst({
      where: {
        slug: input.slug,
        NOT: { id },
      },
      select: { id: true },
    });

    if (conflict) {
      throw new Error('slug: Ya existe otra pagina con esa URL.');
    }

    return db.staticPage.update({
      where: { id },
      data: {
        slug: input.slug,
        titleEs: input.titleEs,
        titleEn: input.titleEn,
        contentEs: sanitizeCmsHtml(input.contentEs),
        contentEn: sanitizeOptionalCmsHtml(input.contentEn),
        published: input.published,
        seoTitleEs: input.seoTitleEs,
        seoTitleEn: input.seoTitleEn,
        seoDescriptionEs: input.seoDescriptionEs,
        seoDescriptionEn: input.seoDescriptionEn,
        customCanonical: input.customCanonical,
        ogImage: input.ogImage,
      },
      select: { id: true, slug: true },
    });
  });
}

export async function deleteStaticPageRecord(id: string) {
  return withDatabaseRole('admin', async (db) => {
    const deleted = await db.staticPage.delete({
      where: { id },
      select: { slug: true },
    });

    return deleted.slug;
  });
}

export async function setStaticPagePublished(id: string, published: boolean) {
  return withDatabaseRole('admin', async (db) => {
    const updated = await db.staticPage.update({
      where: { id },
      data: { published },
      select: { slug: true },
    });

    return updated.slug;
  });
}
