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
  let slug = baseSlug || 'propiedad';
  let suffix = 2;

  while (await db.property.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug || 'propiedad'}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function assertSlugAvailable(db: RoleScopedPrismaClient, slug: string, excludeId?: string) {
  const existing = await db.property.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error('slug: Esa URL ya esta en uso por otra propiedad.');
  }
}

function optionalSlugFromForm(formData: FormData) {
  const raw = formData.get('slug');
  if (typeof raw !== 'string' || !raw.trim()) {
    return undefined;
  }

  const slug = generateSlug(raw.trim());
  if (!slug) {
    throw new Error('slug: La URL solo puede contener letras, numeros y guiones.');
  }

  return slug;
}

function shouldStayOnPage(formData: FormData) {
  return formData.get('redirectMode') === 'stay';
}

const PUBLIC_CATALOG_PATHS = [
  '/',
  '/propiedades',
  '/comprar',
  '/arriendos',
  '/proyectos',
  '/terrenos',
  '/vender',
  '/topografia',
] as const;

function revalidatePropertyViews() {
  updateTag('properties');
  updateTag('home-hero');
  updateTag('site-content');
  for (const path of PUBLIC_CATALOG_PATHS) {
    revalidatePath(path);
  }
  revalidatePath('/propiedades/[slug]', 'page');
  revalidatePath('/proyectos/[slug]', 'page');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin');
  revalidatePath('/admin/propiedades');
}

export async function createProperty(formData: FormData) {
  await requireAdminSession();

  let createdId = '';

  try {
    const property = parsePropertyFormData(formData);

    createdId = await withDatabaseRole('admin', async (db) => {
      const slug = await createUniquePropertySlug(db, property.titleEs);
      const created = await db.property.create({
        data: {
          ...toPropertyPersistenceData(property),
          slug,
        },
        select: { id: true },
      });

      return created.id;
    });
  } catch (error) {
    console.error('Admin property create failed.', error);
    throw error;
  }

  revalidatePropertyViews();

  if (shouldStayOnPage(formData)) {
    redirect(`/admin/propiedades/${createdId}/editar`);
  }

  redirect('/admin/propiedades');
}

export async function updateProperty(id: string, formData: FormData) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  try {
    const property = parsePropertyFormData(formData);
    const data = toPropertyPersistenceData(property);
    const slugOverride = optionalSlugFromForm(formData);

    await withDatabaseRole('admin', async (db) => {
      if (slugOverride) {
        await assertSlugAvailable(db, slugOverride, id);
      }

      await db.property.update({
        where: { id },
        data: slugOverride ? { ...data, slug: slugOverride } : data,
        select: { id: true },
      });
    });
  } catch (error) {
    console.error('Admin property update failed.', { id, error });
    throw error;
  }

  revalidatePropertyViews();

  if (shouldStayOnPage(formData)) {
    redirect(`/admin/propiedades/${id}/editar`);
  }

  redirect('/admin/propiedades');
}

export async function togglePropertyPublished(id: string, published: boolean) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  await withDatabaseRole('admin', async (db) => {
    const property = await db.property.findUnique({
      where: { id },
      select: { id: true, featured: true, featuredBeforeUnpublish: true },
    });

    if (!property) {
      return;
    }

    await db.property.update({
      where: { id },
      data: published
        ? {
            published: true,
            featured: property.featuredBeforeUnpublish || property.featured,
            featuredBeforeUnpublish: false,
          }
        : {
            published: false,
            featured: false,
            featuredBeforeUnpublish: property.featured,
          },
      select: { id: true },
    });
  });

  revalidatePropertyViews();
}

export async function togglePropertyFeatured(id: string, featured: boolean) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  await withDatabaseRole('admin', async (db) => {
    const property = await db.property.findUnique({
      where: { id },
      select: { published: true },
    });

    if (!property) {
      return;
    }

    await db.property.update({
      where: { id },
      data: featured
        ? { featured: true, published: true }
        : { featured: false },
      select: { id: true },
    });
  });

  revalidatePropertyViews();
}

export async function updatePropertyStatus(id: string, status: 'disponible' | 'vendido' | 'alquilado') {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  if (status !== 'disponible' && status !== 'vendido' && status !== 'alquilado') {
    throw new Error('Estado de propiedad invalido.');
  }

  await withDatabaseRole('admin', async (db) => {
    await db.property.update({
      where: { id },
      data: {
        status,
        ...(status === 'vendido' || status === 'alquilado' ? { featured: false } : {}),
      },
      select: { id: true },
    });
  });

  revalidatePropertyViews();
}

export async function duplicateProperty(id: string) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  let newId = '';

  await withDatabaseRole('admin', async (db) => {
    const source = await db.property.findUnique({ where: { id } });

    if (!source) {
      return;
    }

    const copyTitle = `${source.titleEs} (copia)`;
    const slug = await createUniquePropertySlug(db, copyTitle);

    const created = await db.property.create({
      data: {
        slug,
        titleEs: copyTitle,
        titleEn: source.titleEn,
        descriptionEs: source.descriptionEs,
        descriptionEn: source.descriptionEn,
        price: source.price,
        priceFrom: source.priceFrom,
        priceType: source.priceType,
        currency: source.currency,
        zoneEs: source.zoneEs,
        zoneEn: source.zoneEn,
        cityEs: source.cityEs,
        cityEn: source.cityEn,
        address: source.address,
        province: source.province,
        country: source.country,
        marketRegion: source.marketRegion,
        postalCode: source.postalCode,
        addressVisibility: source.addressVisibility,
        latitude: source.latitude,
        longitude: source.longitude,
        type: source.type,
        status: 'disponible',
        published: false,
        featured: false,
        featuredBeforeUnpublish: false,
        bedrooms: source.bedrooms,
        bathrooms: source.bathrooms,
        area: source.area,
        totalArea: source.totalArea,
        builtArea: source.builtArea,
        yearBuilt: source.yearBuilt,
        expenses: source.expenses,
        parking: source.parking,
        internalCode: source.internalCode,
        agentName: source.agentName,
        agentPhone: source.agentPhone,
        agentEmail: source.agentEmail,
        agentId: source.agentId,
        youtubeUrl: source.youtubeUrl,
        sortOrder: source.sortOrder,
        frontage: source.frontage,
        depth: source.depth,
        zoning: source.zoning,
        mapUrl: source.mapUrl,
        virtualTourUrl: source.virtualTourUrl,
        lotSurfaceM2: source.lotSurfaceM2,
        totalLots: source.totalLots,
        availableLots: source.availableLots,
        stageName: source.stageName,
        paymentTerms: source.paymentTerms,
        commissionPercent: source.commissionPercent,
        operationalExpenses: source.operationalExpenses,
        reservationAmount: source.reservationAmount,
        waterStatus: source.waterStatus,
        electricityStatus: source.electricityStatus,
        accessType: source.accessType,
        roadType: source.roadType,
        hasOwnRol: source.hasOwnRol,
        availabilityNotes: source.availabilityNotes,
        commercialNotes: source.commercialNotes,
        distanceHighlights: source.distanceHighlights,
        services: source.services,
        amenities: source.amenities,
        images: source.images,
        coverImage: source.coverImage,
        seoTitleEs: source.seoTitleEs,
        seoTitleEn: source.seoTitleEn,
        seoDescriptionEs: source.seoDescriptionEs,
        seoDescriptionEn: source.seoDescriptionEn,
        customCanonical: source.customCanonical,
        ogImage: source.ogImage,
      },
      select: { id: true },
    });

    newId = created.id;
  });

  revalidatePropertyViews();

  if (!newId) {
    redirect('/admin/propiedades');
  }

  redirect(`/admin/propiedades/${newId}/editar`);
}

export async function deleteProperty(id: string) {
  await requireAdminSession();
  assertCuid(id, 'ID de propiedad');

  await withDatabaseRole('admin', async (db) => {
    await db.property.delete({ where: { id }, select: { id: true } });
  });

  revalidatePropertyViews();
}
