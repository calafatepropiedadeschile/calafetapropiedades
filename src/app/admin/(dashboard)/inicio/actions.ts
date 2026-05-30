'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { HomeHeroSettingsSchema } from '@/features/site-content/home-hero.schemas';
import { resetHomeHeroImage, saveHomeHeroSettings } from '@/features/site-content/home-hero';

function revalidateHomeHeroViews() {
  updateTag('home-hero');
  updateTag('site-content');
  revalidatePath('/');
  revalidatePath('/admin/inicio');
}

export async function updateHomeHeroAction(formData: FormData) {
  await requireAdminSession();

  const parsed = HomeHeroSettingsSchema.safeParse({
    imageUrl: formData.get('imageUrl'),
    titleLine1Es: formData.get('titleLine1Es'),
    titleLine2Es: formData.get('titleLine2Es'),
    subtitleEs: formData.get('subtitleEs'),
    titleLine1En: formData.get('titleLine1En'),
    titleLine2En: formData.get('titleLine2En'),
    subtitleEn: formData.get('subtitleEn'),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Datos del hero invalidos';
    throw new Error(message);
  }

  await saveHomeHeroSettings(parsed.data);
  revalidateHomeHeroViews();
}

export async function resetHomeHeroImageAction() {
  await requireAdminSession();
  await resetHomeHeroImage();
  revalidateHomeHeroViews();
}
