import { notFound } from 'next/navigation';
import { updateProperty } from '../../actions';
import PropertyForm from '@/components/admin/PropertyForm';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { isCuid } from '@/lib/db/ids';
import { withDatabaseRole } from '@/lib/db/rls';

interface Props {
  params: Promise<{ id: string }>;
}

function parseJsonList(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export default async function EditarPropiedadPage({ params }: Props) {
  await requireAdminSession();

  const { id } = await params;
  if (!isCuid(id)) notFound();

  const property = await withDatabaseRole('admin', async (db) => (
    db.property.findUnique({
      where: { id },
      select: {
        id: true,
        titleEs: true,
        titleEn: true,
        descriptionEs: true,
        descriptionEn: true,
        price: true,
        priceType: true,
        currency: true,
        zoneEs: true,
        zoneEn: true,
        cityEs: true,
        cityEn: true,
        address: true,
        province: true,
        country: true,
        marketRegion: true,
        postalCode: true,
        addressVisibility: true,
        latitude: true,
        longitude: true,
        type: true,
        status: true,
        published: true,
        featured: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        totalArea: true,
        builtArea: true,
        yearBuilt: true,
        expenses: true,
        parking: true,
        internalCode: true,
        agentName: true,
        agentPhone: true,
        agentEmail: true,
        frontage: true,
        depth: true,
        zoning: true,
        services: true,
        amenities: true,
        images: true,
        coverImage: true,
        seoTitleEs: true,
        seoTitleEn: true,
        seoDescriptionEs: true,
        seoDescriptionEn: true,
        customCanonical: true,
        ogImage: true,
      },
    })
  ));
  if (!property) notFound();

  const boundUpdate = updateProperty.bind(null, id);

  const formProperty = {
    ...property,
    services: parseJsonList(property.services),
    amenities: parseJsonList(property.amenities),
    images: parseJsonList(property.images),
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Editar Propiedad</h1>
          <p className="text-muted text-sm">{property.titleEs}</p>
        </div>
      </div>
      <PropertyForm action={boundUpdate} defaultValues={formProperty} />
    </div>
  );
}
