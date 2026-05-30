import { unstable_cache } from 'next/cache';
import type { HomeHeroSettings } from '@prisma/client';
import type { Locale } from '@/lib/i18n/config';
import { withDatabaseRole } from '@/lib/db/rls';
import {
  HOME_HERO_DEFAULT_IMAGE,
  HOME_HERO_DEFAULTS,
  HOME_HERO_ID,
} from './home-hero.defaults';
import type { HomeHeroSettingsInput } from './home-hero.schemas';

export type HomeHeroContent = {
  imageUrl: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
};

export type HomeHeroAdminValues = {
  imageUrl: string;
  titleLine1Es: string;
  titleLine2Es: string;
  subtitleEs: string;
  titleLine1En: string;
  titleLine2En: string;
  subtitleEn: string;
};

function pickText(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function resolveHomeHeroContent(
  settings: HomeHeroSettings | null,
  locale: Locale
): HomeHeroContent {
  const isEn = locale === 'en';

  return {
    imageUrl: settings?.imageUrl?.trim() || HOME_HERO_DEFAULT_IMAGE,
    titleLine1: pickText(
      isEn ? settings?.titleLine1En : settings?.titleLine1Es,
      isEn ? HOME_HERO_DEFAULTS.titleLine1En : HOME_HERO_DEFAULTS.titleLine1Es
    ),
    titleLine2: pickText(
      isEn ? settings?.titleLine2En : settings?.titleLine2Es,
      isEn ? HOME_HERO_DEFAULTS.titleLine2En : HOME_HERO_DEFAULTS.titleLine2Es
    ),
    subtitle: pickText(
      isEn ? settings?.subtitleEn : settings?.subtitleEs,
      isEn ? HOME_HERO_DEFAULTS.subtitleEn : HOME_HERO_DEFAULTS.subtitleEs
    ),
  };
}

export function toHomeHeroAdminValues(settings: HomeHeroSettings | null): HomeHeroAdminValues {
  return {
    imageUrl: settings?.imageUrl?.trim() ?? '',
    titleLine1Es: settings?.titleLine1Es?.trim() ?? '',
    titleLine2Es: settings?.titleLine2Es?.trim() ?? '',
    subtitleEs: settings?.subtitleEs?.trim() ?? '',
    titleLine1En: settings?.titleLine1En?.trim() ?? '',
    titleLine2En: settings?.titleLine2En?.trim() ?? '',
    subtitleEn: settings?.subtitleEn?.trim() ?? '',
  };
}

async function ensureHomeHeroRow() {
  return withDatabaseRole('admin', async (db) => {
    const existing = await db.homeHeroSettings.findUnique({ where: { id: HOME_HERO_ID } });
    if (existing) return existing;

    return db.homeHeroSettings.create({
      data: { id: HOME_HERO_ID },
    });
  });
}

export async function getHomeHeroSettingsRecord() {
  return unstable_cache(
    async () => withDatabaseRole('public', async (db) => {
      const row = await db.homeHeroSettings.findUnique({ where: { id: HOME_HERO_ID } });
      return row;
    }),
    ['home-hero-settings'],
    { revalidate: 300, tags: ['site-content', 'home-hero'] }
  )();
}

export async function getHomeHeroContent(locale: Locale): Promise<HomeHeroContent> {
  const settings = await getHomeHeroSettingsRecord();
  return resolveHomeHeroContent(settings, locale);
}

export async function getHomeHeroAdminValues(): Promise<HomeHeroAdminValues> {
  const settings = await ensureHomeHeroRow();
  return toHomeHeroAdminValues(settings);
}

export async function saveHomeHeroSettings(input: HomeHeroSettingsInput) {
  await withDatabaseRole('admin', async (db) => {
    await db.homeHeroSettings.upsert({
      where: { id: HOME_HERO_ID },
      create: {
        id: HOME_HERO_ID,
        imageUrl: input.imageUrl ?? null,
        titleLine1Es: input.titleLine1Es ?? null,
        titleLine2Es: input.titleLine2Es ?? null,
        subtitleEs: input.subtitleEs ?? null,
        titleLine1En: input.titleLine1En ?? null,
        titleLine2En: input.titleLine2En ?? null,
        subtitleEn: input.subtitleEn ?? null,
      },
      update: {
        imageUrl: input.imageUrl ?? null,
        titleLine1Es: input.titleLine1Es ?? null,
        titleLine2Es: input.titleLine2Es ?? null,
        subtitleEs: input.subtitleEs ?? null,
        titleLine1En: input.titleLine1En ?? null,
        titleLine2En: input.titleLine2En ?? null,
        subtitleEn: input.subtitleEn ?? null,
      },
    });
  });
}

export async function resetHomeHeroImage() {
  await withDatabaseRole('admin', async (db) => {
    await db.homeHeroSettings.upsert({
      where: { id: HOME_HERO_ID },
      create: { id: HOME_HERO_ID },
      update: { imageUrl: null },
    });
  });
}
