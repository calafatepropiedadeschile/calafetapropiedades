import Link from 'next/link';
import { Home, Plus } from 'lucide-react';
import AdminPropertyActions from '@/components/admin/AdminPropertyActions';
import { deleteProperty, togglePropertyPublished } from './actions';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { withDatabaseRole } from '@/lib/db/rls';
import { formatPrice, PRICE_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/utils/formatters';
import { PROPERTY_MARKET_REGION_LABELS } from '@/features/properties/property-markets';

const ADMIN_PROPERTIES_LIMIT = 100;

export default async function AdminPropertiesPage() {
  await requireAdminSession();

  const properties = await withDatabaseRole('admin', async (db) => (
    db.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: ADMIN_PROPERTIES_LIMIT,
      select: {
        id: true,
        slug: true,
        titleEs: true,
        internalCode: true,
        type: true,
        zoneEs: true,
        cityEs: true,
        price: true,
        priceType: true,
        currency: true,
        country: true,
        marketRegion: true,
        published: true,
        status: true,
      },
    })
  ));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Propiedades</h1>
          <p className="text-muted text-sm">Gestiona borradores y publicaciones activas</p>
        </div>
        <Link href="/admin/propiedades/nueva" className="btn btn-primary">
          <Plus size={18} />
          Nueva propiedad
        </Link>
      </div>

      <div className="admin-table-shell">
        {properties.length === 0 ? (
          <div className="admin-empty-state">
            <Home size={42} />
            <p>No hay propiedades todavia.</p>
            <Link href="/admin/propiedades/nueva" className="btn btn-primary">
              Crear la primera
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Tipo</th>
                <th>Operacion</th>
                <th>Mercado</th>
                <th>Zona</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Publicado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id}>
                  <td style={{ color: 'var(--color-text)', fontWeight: 600, maxWidth: '260px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {property.titleEs}
                    </span>
                    {property.internalCode && (
                      <span className="text-xs text-muted" style={{ display: 'block', marginTop: 2 }}>
                        {property.internalCode}
                      </span>
                    )}
                  </td>
                  <td>{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</td>
                  <td>{PRICE_TYPE_LABELS[property.priceType] ?? property.priceType}</td>
                  <td>
                    <span style={{ display: 'block' }}>
                      {PROPERTY_MARKET_REGION_LABELS[property.marketRegion as keyof typeof PROPERTY_MARKET_REGION_LABELS] ?? property.marketRegion}
                    </span>
                    {property.country && (
                      <span className="text-xs text-muted">{property.country}</span>
                    )}
                  </td>
                  <td>{property.zoneEs}, {property.cityEs}</td>
                  <td style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                    {formatPrice(property.price, property.currency)}
                  </td>
                  <td>
                    <span className={`badge ${property.status === 'disponible' ? 'badge-green' : 'badge-red'}`}>
                      {PROPERTY_STATUS_LABELS[property.status] ?? property.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${property.published ? 'badge-green' : 'badge-red'}`}>
                      {property.published ? 'Si' : 'No'}
                    </span>
                  </td>
                  <td>
                    <AdminPropertyActions
                      id={property.id}
                      title={property.titleEs}
                      slug={property.slug}
                      published={property.published}
                      togglePublishedAction={togglePropertyPublished}
                      deletePropertyAction={deleteProperty}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
