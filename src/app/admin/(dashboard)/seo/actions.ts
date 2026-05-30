'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { parseSiteSeoSettingsFormData } from '@/features/site-content/seo-settings.schemas';
import { saveSiteSeoSettings } from '@/features/site-content/seo-settings';

function revalidateSeoViews() {
  updateTag('site-seo');
  updateTag('site-content');
  updateTag('properties');
  revalidatePath('/', 'layout');
  revalidatePath('/robots.txt');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/seo');
}

export async function updateSiteSeoSettingsAction(formData: FormData) {
  await requireAdminSession();
  const input = parseSiteSeoSettingsFormData(formData);
  await saveSiteSeoSettings(input);
  revalidateSeoViews();
}
