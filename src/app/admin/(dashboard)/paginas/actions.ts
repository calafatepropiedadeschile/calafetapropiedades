'use server';

import { parseStaticPageFormData, STATIC_PAGE_INTEGRATED_SLUGS } from '@/features/site-content/static-page.schemas';
import {
  createStaticPageRecord,
  deleteStaticPageRecord,
  setStaticPagePublished,
  updateStaticPageRecord,
} from '@/features/site-content/static-page';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { assertCuid } from '@/lib/db/ids';
import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

const INTEGRATED_SEO_PATHS: Record<string, string[]> = Object.fromEntries(
  STATIC_PAGE_INTEGRATED_SLUGS.map((slug) => [slug, [`/${slug}`]]),
);

function revalidateStaticPageViews(slug: string) {
  updateTag('site-content');
  updateTag(`static-page-${slug}`);
  revalidatePath('/admin/paginas');
  revalidatePath(`/${slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/llms.txt');
  revalidatePath('/llms-full.txt');
  revalidatePath('/', 'layout');

  for (const path of INTEGRATED_SEO_PATHS[slug] ?? []) {
    revalidatePath(path);
  }
}

export async function createStaticPage(formData: FormData) {
  await requireAdminSession();

  let slug = '';

  try {
    const input = parseStaticPageFormData(formData);
    const created = await createStaticPageRecord(input);
    slug = input.slug;
    void created;
  } catch (error) {
    console.error('Admin static page create failed.', error);
    throw error;
  }

  revalidateStaticPageViews(slug);
  redirect('/admin/paginas');
}

export async function updateStaticPage(id: string, formData: FormData) {
  await requireAdminSession();
  assertCuid(id, 'ID de pagina');

  let slug = '';

  try {
    const input = parseStaticPageFormData(formData);
    const updated = await updateStaticPageRecord(id, input);
    slug = updated.slug;
  } catch (error) {
    console.error('Admin static page update failed.', { id, error });
    throw error;
  }

  revalidateStaticPageViews(slug);
  redirect('/admin/paginas');
}

export async function toggleStaticPagePublished(id: string, published: boolean) {
  await requireAdminSession();
  assertCuid(id, 'ID de pagina');

  const slug = await setStaticPagePublished(id, published);
  revalidateStaticPageViews(slug);
}

export async function deleteStaticPage(id: string) {
  await requireAdminSession();
  assertCuid(id, 'ID de pagina');

  const slug = await deleteStaticPageRecord(id);
  revalidateStaticPageViews(slug);
}
