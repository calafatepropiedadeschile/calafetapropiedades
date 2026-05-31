import { unstable_cache } from 'next/cache';
import type { SiteSettings } from '@prisma/client';
import { withDatabaseRole } from '@/lib/db/rls';
import { buildTelHref, buildWhatsAppHref } from '@/lib/contact/links';
import type { SiteSettingsInput } from './site-settings.schemas';
import { siteConfig } from '@/config/site';

export const SITE_SETTINGS_ID = 'main';

export type SiteSettingsPayload = {
  whatsappNumber: string;
  whatsappHref: string;
  primaryPhone: string;
  primaryPhoneHref: string;
  primaryEmail: string;
  officeAddress: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  discoverImageUrl: string;
  discoverEyebrow: string;
  discoverTitle: string;
  discoverParagraph1: string;
  discoverParagraph2: string;
  discoverEyebrowEn: string;
  discoverTitleEn: string;
  discoverParagraph1En: string;
  discoverParagraph2En: string;
};

function pickText(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function resolveSiteSettings(settings: SiteSettings | null): SiteSettingsPayload {
  const whatsappNumber = pickText(settings?.whatsappNumber, siteConfig.contact.whatsappNumber);
  const primaryPhone = pickText(settings?.primaryPhone, siteConfig.contact.primaryPhoneLabel);

  return {
    whatsappNumber,
    whatsappHref: buildWhatsAppHref(whatsappNumber),
    primaryPhone,
    primaryPhoneHref: buildTelHref(primaryPhone, siteConfig.contact.primaryPhoneHref),
    primaryEmail: pickText(settings?.primaryEmail, siteConfig.contact.primaryEmail),
    officeAddress: pickText(settings?.officeAddress, siteConfig.offices[0].addressLines.join(', ')),
    instagramUrl: pickText(settings?.instagramUrl, siteConfig.contact.social.instagram),
    facebookUrl: pickText(settings?.facebookUrl, siteConfig.contact.social.facebook),
    linkedinUrl: pickText(settings?.linkedinUrl, siteConfig.contact.social.linkedin),
    discoverImageUrl: pickText(settings?.discoverImageUrl, siteConfig.copy.discover.imageUrl),
    discoverEyebrow: pickText(settings?.discoverEyebrow, siteConfig.copy.discover.eyebrow),
    discoverTitle: pickText(settings?.discoverTitle, siteConfig.copy.discover.title),
    discoverParagraph1: pickText(settings?.discoverParagraph1, siteConfig.copy.discover.paragraphs[0]),
    discoverParagraph2: pickText(settings?.discoverParagraph2, siteConfig.copy.discover.paragraphs[1]),
    discoverEyebrowEn: pickText(settings?.discoverEyebrowEn, siteConfig.copy.discover.eyebrow),
    discoverTitleEn: pickText(settings?.discoverTitleEn, siteConfig.copy.discover.title),
    discoverParagraph1En: pickText(settings?.discoverParagraph1En, siteConfig.copy.discover.paragraphs[0]),
    discoverParagraph2En: pickText(settings?.discoverParagraph2En, siteConfig.copy.discover.paragraphs[1]),
  };
}

export function toSiteSettingsAdminValues(settings: SiteSettings | null): SiteSettingsInput {
  return {
    whatsappNumber: settings?.whatsappNumber?.trim() ?? '',
    primaryPhone: settings?.primaryPhone?.trim() ?? '',
    primaryEmail: settings?.primaryEmail?.trim() ?? '',
    officeAddress: settings?.officeAddress?.trim() ?? '',
    instagramUrl: settings?.instagramUrl?.trim() ?? '',
    facebookUrl: settings?.facebookUrl?.trim() ?? '',
    linkedinUrl: settings?.linkedinUrl?.trim() ?? '',
    discoverImageUrl: settings?.discoverImageUrl?.trim() ?? '',
    discoverEyebrow: settings?.discoverEyebrow?.trim() ?? '',
    discoverTitle: settings?.discoverTitle?.trim() ?? '',
    discoverParagraph1: settings?.discoverParagraph1?.trim() ?? '',
    discoverParagraph2: settings?.discoverParagraph2?.trim() ?? '',
    discoverEyebrowEn: settings?.discoverEyebrowEn?.trim() ?? '',
    discoverTitleEn: settings?.discoverTitleEn?.trim() ?? '',
    discoverParagraph1En: settings?.discoverParagraph1En?.trim() ?? '',
    discoverParagraph2En: settings?.discoverParagraph2En?.trim() ?? '',
  };
}

async function readSiteSettingsRecord() {
  try {
    return await withDatabaseRole('public', async (db) =>
      db.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } })
    );
  } catch (error) {
    console.warn('SiteSettings unavailable, using defaults.', error);
    return null;
  }
}

export async function getSiteSettingsRecord() {
  return unstable_cache(
    readSiteSettingsRecord,
    ['site-settings-v1'],
    { revalidate: 300, tags: ['site-content', 'site-settings'] }
  )();
}

export async function getSiteSettings(): Promise<SiteSettingsPayload> {
  const settings = await getSiteSettingsRecord();
  return resolveSiteSettings(settings);
}

export async function getSiteSettingsAdminValues(): Promise<SiteSettingsInput> {
  const settings = await getSiteSettingsRecord();
  return toSiteSettingsAdminValues(settings);
}

export async function saveSiteSettings(input: SiteSettingsInput) {
  const data = {
    whatsappNumber: emptyToNull(input.whatsappNumber),
    primaryPhone: emptyToNull(input.primaryPhone),
    primaryEmail: emptyToNull(input.primaryEmail),
    officeAddress: emptyToNull(input.officeAddress),
    instagramUrl: emptyToNull(input.instagramUrl),
    facebookUrl: emptyToNull(input.facebookUrl),
    linkedinUrl: emptyToNull(input.linkedinUrl),
    discoverImageUrl: emptyToNull(input.discoverImageUrl),
    discoverEyebrow: emptyToNull(input.discoverEyebrow),
    discoverTitle: emptyToNull(input.discoverTitle),
    discoverParagraph1: emptyToNull(input.discoverParagraph1),
    discoverParagraph2: emptyToNull(input.discoverParagraph2),
    discoverEyebrowEn: emptyToNull(input.discoverEyebrowEn),
    discoverTitleEn: emptyToNull(input.discoverTitleEn),
    discoverParagraph1En: emptyToNull(input.discoverParagraph1En),
    discoverParagraph2En: emptyToNull(input.discoverParagraph2En),
  };

  await withDatabaseRole('admin', async (db) => {
    await db.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: {
        id: SITE_SETTINGS_ID,
        ...data,
      },
      update: data,
    });
  });
}
