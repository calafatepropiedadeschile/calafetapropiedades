import Link from 'next/link';
import { Home, Plus, Search } from 'lucide-react';
import AdminPropertyActions from '@/components/admin/AdminPropertyActions';
import AdminPropertyStatusToggle from '@/components/admin/AdminPropertyStatusToggle';
import {
  deleteProperty,
  duplicateProperty,
  togglePropertyFeatured,
  togglePropertyPublished,
  updatePropertyStatus,
} from './actions';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { withDatabaseRole } from '@/lib/db/rls';
import { formatArea, formatPropertyPrice, PRICE_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/utils/formatters';
import {
  ADMIN_PROPERTIES_PAGE_SIZE,
  adminPropertyListSelect,
  buildAdminPropertiesWhere,
  createAdminPropertiesQueryString,
  isAdminLandProject,
  parseAdminPropertiesPage,
  parseOperationFilter,
  parseProjectFilter,
  parsePublishedFilter,
  parseTypeFilter,
} from '@/features/admin/admin-properties';

interface Props {
  searchParams: Promise<{
    q?: string;
    published?: string;
    type?: string;
    project?: string;
    operation?: string;
    page?: string;
  }>;
}

export default async function AdminPropertiesPage({ searchParams }: Props) {
  await requireAdminSession();

  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const published = parsePublishedFilter(params.published);
  const type = parseTypeFilter(params.type);
  const project = parseProjectFilter(params.project);
  const operation = parseOperationFilter(params.operation);
  const page = parseAdminPropertiesPage(params.page);
  const where = buildAdminPropertiesWhere({ q, published, type, project, operation });

  const { properties, total, totalPages, safePage } = await withDatabaseRole('admin', async (db) => {
    const total = await db.property.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_PROPERTIES_PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const properties = await db.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * ADMIN_PROPERTIES_PAGE_SIZE,
      take: ADMIN_PROPERTIES_PAGE_SIZE,
      select: adminPropertyListSelect,
    });

    return { properties, total, totalPages, safePage };
  });

  const firstResult = total === 0 ? 0 : (safePage - 1) * ADMIN_PROPERTIES_PAGE_SIZE + 1;
  const lastResult = Math.min(safePage * ADMIN_PROPERTIES_PAGE_SIZE, total);
  const queryBase = { q, published, type, project, operation };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Propiedades</h1>
          <p className="text-muted text-sm">
            {total === 0
              ? 'No hay propiedades para los filtros seleccionados'
              : `Mostrando ${firstResult}-${lastResult} de ${total} propiedades`}
          </p>
        </div>
        <Link href="/admin/propiedades/nueva" className="btn btn-primary">
          <Plus size={18} />
          Nueva propiedad
        </Link>
      </div>

      <form className="admin-table-shell" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
        <div className="form-grid form-grid-3">
          <div className="input-group">
            <label className="input-label" htmlFor="property-search">Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="property-search"
                name="q"
                className="input"
                defaultValue={q}
                placeholder="Titulo, codigo, zona o slug"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="property-published">Publicacion</label>
            <select id="property-published" name="published" className="select" defaultValue={published}>
              <option value="todas">Todas</option>
              <option value="publicadas">Publicadas</option>
              <option value="borradores">Borradores</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="property-type">Tipo</label>
            <select id="property-type" name="type" className="select" defaultValue={type}>
              <option value="todos">Todos</option>
              <option value="terreno">Terreno</option>
              <option value="casa">Casa</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="property-project">Formato</label>
            <select id="property-project" name="project" className="select" defaultValue={project}>
              <option value="todos">Todos</option>
              <option value="proyectos">Proyectos / loteos</option>
              <option value="individuales">Individuales</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="property-operation">Operacion</label>
            <select id="property-operation" name="operation" className="select" defaultValue={operation}>
              <option value="todas">Todas</option>
              <option value="venta">Venta</option>
              <option value="arriendo">Arriendo</option>
            </select>
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <label className="input-label" aria-hidden="true">&nbsp;</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary">Aplicar filtros</button>
              <Link href="/admin/propiedades" className="btn btn-outline">Limpiar</Link>
            </div>
          </div>
        </div>
      </form>

      <div className="admin-table-shell">
        {properties.length === 0 ? (
          <div className="admin-empty-state">
            <Home size={42} />
            <p>No hay propiedades con estos filtros.</p>
            <Link href="/admin/propiedades/nueva" className="btn btn-primary">
              Crear la primera
            </Link>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Tipo</th>
                  <th>Operacion</th>
                  <th>Zona</th>
                  <th>Lotes</th>
                  <th>Superficie</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Publicado</th>
                  <th>Destacada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => {
                  const isProject = isAdminLandProject(property);

                  return (
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
                        <span className="text-xs text-muted" style={{ display: 'block', marginTop: 2 }}>
                          /{property.slug}
                        </span>
                      </td>
                      <td>{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</td>
                      <td>{PRICE_TYPE_LABELS[property.priceType] ?? property.priceType}</td>
                      <td>{property.zoneEs}, {property.cityEs}</td>
                      <td>
                        {property.availableLots != null
                          ? `${property.availableLots}${property.totalLots != null ? ` / ${property.totalLots}` : ''}`
                          : 'Por confirmar'}
                      </td>
                      <td>{property.lotSurfaceM2 ? formatArea(property.lotSurfaceM2) : '-'}</td>
                      <td style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                        {formatPropertyPrice(property.price, property.currency, { priceType: property.priceType })}
                      </td>
                      <td>
                        <AdminPropertyStatusToggle
                          id={property.id}
                          status={property.status}
                          priceType={property.priceType}
                          updateStatusAction={updatePropertyStatus}
                        />
                      </td>
                      <td>
                        <span className={`badge ${property.published ? 'badge-green' : 'badge-red'}`}>
                          {property.published ? 'Si' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${property.featured ? 'badge-gold' : 'badge-red'}`}>
                          {property.featured ? 'Si' : 'No'}
                        </span>
                      </td>
                      <td>
                        <AdminPropertyActions
                          id={property.id}
                          title={property.titleEs}
                          slug={property.slug}
                          published={property.published}
                          featured={property.featured}
                          isProject={isProject}
                          togglePublishedAction={togglePropertyPublished}
                          toggleFeaturedAction={togglePropertyFeatured}
                          duplicatePropertyAction={duplicateProperty}
                          deletePropertyAction={deleteProperty}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="admin-section-header">
              <span className="text-muted text-sm">Pagina {safePage} de {totalPages}</span>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Link
                  className="btn btn-outline btn-sm"
                  aria-disabled={safePage <= 1}
                  href={safePage <= 1 ? createAdminPropertiesQueryString({ ...queryBase, page: safePage }) : createAdminPropertiesQueryString({ ...queryBase, page: safePage - 1 })}
                  style={safePage <= 1 ? { pointerEvents: 'none', opacity: 0.45 } : undefined}
                >
                  Anterior
                </Link>
                <Link
                  className="btn btn-outline btn-sm"
                  aria-disabled={safePage >= totalPages}
                  href={safePage >= totalPages ? createAdminPropertiesQueryString({ ...queryBase, page: safePage }) : createAdminPropertiesQueryString({ ...queryBase, page: safePage + 1 })}
                  style={safePage >= totalPages ? { pointerEvents: 'none', opacity: 0.45 } : undefined}
                >
                  Siguiente
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
