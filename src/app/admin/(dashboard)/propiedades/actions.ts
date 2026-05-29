'use server';

import { parsePropertyFormData, toPropertyPersistenceData } from '@/features/properties/property.form';
import { generateSlug } from '@/lib/utils/formatters';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { assertCuid } from '@/lib/db/ids';
import { withDatabaseRole, type RoleScopedPrismaClient } from '@/lib/db/rls';
import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

async function createUniquePropertySlug(db: RoleScopedPrismaClient, title: string) {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let suffix = 2;

  while (await db.property.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function revalidatePropertyViews() {
  updateTag('properties');
  revalidatePath('/');
  revalidatePath('/propiedades');
  revalidatePath('/propiedades/[slug]', 'page');
  revalidatePath('/admin');
  revalidatePath('/admin/propiedades');
}

export async function createProperty(formData: FormData) {
  await requireAdminSession();

  try {
    const property = parsePropertyFormData(formData);

    await withDatabaseRole('admin', async (db) => {
      const slug = await createUniquePropertySlug(db, property.titleEs);

      await db.property.create({
        data: {
          ...toPropertyPersistenceData(property),
          slug,
        },
        select: { id: true },
      });
    });
  } catch (error) {
    console.error('Admin property create failed.', error);
    throw error;
  }

  revalidatePropertyViews();
  redirect('/admin/propiedades');
}

export async function updateProperty(id: string, formData: FormData) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  try {
    const property = parsePropertyFormData(formData);
    const data = toPropertyPersistenceData(property);

    await withDatabaseRole('admin', async (db) => {
      await db.property.update({
        where: { id },
        data,
        select: { id: true },
      });
    });
  } catch (error) {
    console.error('Admin property update failed.', { id, error });
    throw error;
  }

  revalidatePropertyViews();
  redirect('/admin/propiedades');
}

export async function togglePropertyPublished(id: string, published: boolean) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  await withDatabaseRole('admin', async (db) => {
    const property = await db.property.findUnique({
      where: { id },
      select: {
        featured: true,
      },
    });

    if (!property) {
      return;
    }

    await db.property.update({
      where: { id },
      data: published
        ? {
            published: true,
          }
        : {
            published: false,
            featured: false,
          },
      select: { id: true },
    });
  });

  revalidatePropertyViews();
}

export async function deleteProperty(id: string) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  await withDatabaseRole('admin', async (db) => {
    await db.property.delete({ where: { id }, select: { id: true } });
  });

  revalidatePropertyViews();
}
