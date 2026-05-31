'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { parseSiteSeoSettingsFormData } from '@/features/site-content/seo-settings.schemas';
import { saveSiteSeoSettings } from '@/features/site-content/seo-settings';
import { parseSiteOrganizationSeoFormData } from '@/features/site-content/site-organization.schemas';
import { saveSiteOrganizationSeoFields } from '@/features/site-content/site-settings';

function revalidateSeoViews() {
  updateTag('site-seo');
  updateTag('site-settings');
  updateTag('site-content');
  updateTag('properties');
  revalidatePath('/', 'layout');
  revalidatePath('/robots.txt');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/seo');
  revalidatePath('/admin/ajustes');
}

export async function updateSiteSeoSettingsAction(formData: FormData) {
  await requireAdminSession();
  const input = parseSiteSeoSettingsFormData(formData);
  await saveSiteSeoSettings(input);
  revalidateSeoViews();
}

export async function updateSiteOrganizationSeoAction(formData: FormData) {
  await requireAdminSession();
  const input = parseSiteOrganizationSeoFormData(formData);
  await saveSiteOrganizationSeoFields(input);
  revalidateSeoViews();
}
