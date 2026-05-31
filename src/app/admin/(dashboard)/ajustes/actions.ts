'use server';

import { updateTag, revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { saveSiteSettings } from '@/features/site-content/site-settings';
import { SiteSettingsSchema } from '@/features/site-content/site-settings.schemas';
import type { SiteSettingsInput } from '@/features/site-content/site-settings.schemas';

export async function updateSiteSettingsAction(formData: FormData) {
  try {
    await requireAdminSession();

    const data: SiteSettingsInput = {
      whatsappNumber: formData.get('whatsappNumber')?.toString(),
      primaryPhone: formData.get('primaryPhone')?.toString(),
      primaryEmail: formData.get('primaryEmail')?.toString(),
      officeAddress: formData.get('officeAddress')?.toString(),
      officeStreetAddress: formData.get('officeStreetAddress')?.toString(),
      officeLocality: formData.get('officeLocality')?.toString(),
      officeRegion: formData.get('officeRegion')?.toString(),
      instagramUrl: formData.get('instagramUrl')?.toString(),
      facebookUrl: formData.get('facebookUrl')?.toString(),
      linkedinUrl: formData.get('linkedinUrl')?.toString(),
      discoverImageUrl: formData.get('discoverImageUrl')?.toString(),
      discoverEyebrow: formData.get('discoverEyebrow')?.toString(),
      discoverTitle: formData.get('discoverTitle')?.toString(),
      discoverParagraph1: formData.get('discoverParagraph1')?.toString(),
      discoverParagraph2: formData.get('discoverParagraph2')?.toString(),
      discoverEyebrowEn: formData.get('discoverEyebrowEn')?.toString(),
      discoverTitleEn: formData.get('discoverTitleEn')?.toString(),
      discoverParagraph1En: formData.get('discoverParagraph1En')?.toString(),
      discoverParagraph2En: formData.get('discoverParagraph2En')?.toString(),
    };

    const validated = SiteSettingsSchema.parse(data);

    await saveSiteSettings(validated);

    updateTag('site-settings');
    updateTag('site-seo');
    updateTag('site-content');
    revalidatePath('/', 'layout');
    revalidatePath('/robots.txt');
    revalidatePath('/sitemap.xml');
    revalidatePath('/admin/ajustes');

    return { success: true };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar los ajustes',
    };
  }
}
