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

  const { properties, total, totalPages, safePage, counts } = await withDatabaseRole('admin', async (db) => {
    const total = await db.property.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_PROPERTIES_PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    
    // Conteo para los filtros WP
    const allCount = await db.property.count({ where: { ...where, published: undefined } });
    const publishedCount = await db.property.count({ where: { ...where, published: true } });
    const draftCount = await db.property.count({ where: { ...where, published: false } });

    const properties = await db.property.findMany({
      where,
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
      skip: (safePage - 1) * ADMIN_PROPERTIES_PAGE_SIZE,
      take: ADMIN_PROPERTIES_PAGE_SIZE,
      select: adminPropertyListSelect,
    });

    return { properties, total, totalPages, safePage, counts: { all: allCount, published: publishedCount, drafts: draftCount } };
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

      <div className="admin-table-filters-row">
        <Link 
          href={createAdminPropertiesQueryString({ ...queryBase, published: 'todas', page: 1 })}
          className={published === 'todas' ? 'is-active' : ''}
        >
          Todas <span className="count">({counts.all})</span>
        </Link>
        <span className="text-muted">|</span>
        <Link 
          href={createAdminPropertiesQueryString({ ...queryBase, published: 'publicadas', page: 1 })}
          className={published === 'publicadas' ? 'is-active' : ''}
        >
          Publicadas <span className="count">({counts.published})</span>
        </Link>
        <span className="text-muted">|</span>
        <Link 
          href={createAdminPropertiesQueryString({ ...queryBase, published: 'borradores', page: 1 })}
          className={published === 'borradores' ? 'is-active' : ''}
        >
          Borradores <span className="count">({counts.drafts})</span>
        </Link>
      </div>

      <form className="admin-table-shell" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)' }}>
        <div className="admin-filter-bar">
          <div className="input-group" style={{ flex: '1 1 300px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="property-search"
                name="q"
                className="input"
                defaultValue={q}
                placeholder="Buscar titulo, codigo, zona o slug..."
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          {published !== 'todas' && <input type="hidden" name="published" value={published} />}

          <div className="input-group">
            <select id="property-type" name="type" className="select" defaultValue={type} aria-label="Tipo">
              <option value="todos">Cualquier tipo</option>
              <option value="terreno">Terreno</option>
              <option value="casa">Casa</option>
            </select>
          </div>

          <div className="input-group">
            <select id="property-project" name="project" className="select" defaultValue={project} aria-label="Formato">
              <option value="todos">Todos los formatos</option>
              <option value="proyectos">Proyectos / loteos</option>
              <option value="individuales">Individuales</option>
            </select>
          </div>

          <div className="input-group">
            <select id="property-operation" name="operation" className="select" defaultValue={operation} aria-label="Operacion">
              <option value="todas">Cualquier operacion</option>
              <option value="venta">Venta</option>
              <option value="arriendo">Arriendo</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary">Filtrar</button>
            {(q || type !== 'todos' || project !== 'todos' || operation !== 'todas') && (
              <Link href="/admin/propiedades" className="btn btn-outline" title="Limpiar filtros">X</Link>
            )}
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
                  <th style={{ width: '38%' }}>Propiedad</th>
                  <th>Tipo / Operacion</th>
                  <th>Zona</th>
                  <th>Lotes</th>
                  <th>Precio / Sup.</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => {
                  const isProject = isAdminLandProject(property);
                  let thumbUrl = property.coverImage;
                  if (!thumbUrl && property.images && property.images !== '[]') {
                    try {
                      const parsed = JSON.parse(property.images);
                      if (Array.isArray(parsed) && parsed.length > 0) thumbUrl = parsed[0];
                    } catch (e) {}
                  }

                  return (
                    <tr key={property.id}>
                      <td>
                        <div className="admin-thumbnail-wrapper">
                          <div className="admin-thumbnail">
                            {thumbUrl ? (
                              <img src={thumbUrl} alt="" loading="lazy" />
                            ) : (
                              <Home className="admin-thumbnail-placeholder" size={24} />
                            )}
                          </div>
                          <div className="admin-title-cell">
                            <span style={{ color: 'var(--color-text)', fontWeight: 600, display: 'block' }}>
                              {property.titleEs}
                            </span>
                            <span className="text-xs text-muted" style={{ display: 'block', marginTop: 2 }}>
                              {property.internalCode ? `${property.internalCode} / ` : ''}{property.slug}
                            </span>
                            <div className="admin-badge-group">
                               <span className={`badge ${property.published ? 'badge-green' : 'badge-outline'}`} style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                                 {property.published ? 'Publicada' : 'Borrador'}
                               </span>
                               {property.featured && (
                                 <span className="badge badge-gold" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Destacada</span>
                               )}
                            </div>
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
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'block', fontWeight: 500 }}>{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</span>
                        <span className="text-xs text-muted">{PRICE_TYPE_LABELS[property.priceType] ?? property.priceType}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block' }}>{property.zoneEs}</span>
                        <span className="text-xs text-muted">{property.cityEs}</span>
                      </td>
                      <td>
                        {property.availableLots != null
                          ? `${property.availableLots}${property.totalLots != null ? ` / ${property.totalLots}` : ''}`
                          : '-'}
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-gold)', fontWeight: 700, display: 'block' }}>
                          {formatPropertyPrice(property.price, property.currency, { priceType: property.priceType })}
                        </span>
                        {property.lotSurfaceM2 ? <span className="text-xs text-muted">{formatArea(property.lotSurfaceM2)}</span> : null}
                      </td>
                      <td>
                        <AdminPropertyStatusToggle
                          id={property.id}
                          status={property.status}
                          priceType={property.priceType}
                          updateStatusAction={updatePropertyStatus}
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
