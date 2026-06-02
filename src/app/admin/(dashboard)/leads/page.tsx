import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { AlertCircle, Download, Mail, Search } from 'lucide-react';
import AdminLeadActions from '@/components/admin/AdminLeadActions';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { withDatabaseRole } from '@/lib/db/rls';
import { LEAD_STATUSES, type LeadStatus } from '@/features/leads/lead-status';
import { deleteLead, updateLeadStatus } from './actions';

const ADMIN_LEADS_PAGE_SIZE = 20;

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  pendiente: 'Pendiente',
  contactada: 'Contactada',
  cerrada: 'Cerrada',
};

const LEAD_STATUS_BADGES: Record<LeadStatus, string> = {
  pendiente: 'badge-gold',
  contactada: 'badge-green',
  cerrada: 'badge-red',
};

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

function parseLeadStatus(value: string | undefined): LeadStatus | 'todas' {
  return LEAD_STATUSES.includes(value as LeadStatus) ? value as LeadStatus : 'todas';
}

function parsePage(value: string | undefined) {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function createExportHref(params: { q: string; status: LeadStatus | 'todas' }) {
  const nextParams = new URLSearchParams();
  if (params.q) nextParams.set('q', params.q);
  if (params.status !== 'todas') nextParams.set('status', params.status);
  const queryString = nextParams.toString();
  return queryString ? `/admin/leads/export?${queryString}` : '/admin/leads/export';
}

function createQueryString(params: { q: string; status: LeadStatus | 'todas'; page?: number }) {
  const nextParams = new URLSearchParams();

  if (params.q) nextParams.set('q', params.q);
  if (params.status !== 'todas') nextParams.set('status', params.status);
  if (params.page && params.page > 1) nextParams.set('page', String(params.page));

  const queryString = nextParams.toString();
  return queryString ? `/admin/leads?${queryString}` : '/admin/leads';
}

function buildLeadWhere(q: string, status: LeadStatus | 'todas'): Prisma.LeadWhereInput {
  const filters: Prisma.LeadWhereInput[] = [];

  if (status !== 'todas') {
    filters.push({ status });
  }

  if (q) {
    const textMatch = {
      contains: q,
      mode: 'insensitive' as const,
    };

    filters.push({
      OR: [
        { name: textMatch },
        { email: textMatch },
        { phone: textMatch },
        { message: textMatch },
        { utmCampaign: textMatch },
        { utmSource: textMatch },
        { property: { is: { titleEs: textMatch } } },
      ],
    });
  }

  return filters.length > 0 ? { AND: filters } : {};
}

function normalizeStatus(status: string): LeadStatus {
  return LEAD_STATUSES.includes(status as LeadStatus) ? status as LeadStatus : 'pendiente';
}

async function getLeadsPageData(where: Prisma.LeadWhereInput, page: number) {
  try {
    const { total, leads, totalPages, safePage, counts } = await withDatabaseRole('admin', async (db) => {
      const total = await db.lead.count({ where });
      const totalPages = Math.max(1, Math.ceil(total / ADMIN_LEADS_PAGE_SIZE));
      const safePage = Math.min(page, totalPages);
      
      const allCount = await db.lead.count({ where: { ...where, status: undefined } });
      const pendingCount = await db.lead.count({ where: { ...where, status: 'pendiente' } });
      const contactedCount = await db.lead.count({ where: { ...where, status: 'contactada' } });
      const closedCount = await db.lead.count({ where: { ...where, status: 'cerrada' } });

      const leads = await db.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * ADMIN_LEADS_PAGE_SIZE,
        take: ADMIN_LEADS_PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          status: true,
          utmCampaign: true,
          createdAt: true,
          property: {
            select: {
              titleEs: true,
              slug: true,
            },
          },
        },
      });

      return { total, leads, totalPages, safePage, counts: { all: allCount, pending: pendingCount, contacted: contactedCount, closed: closedCount } };
    });

    return { ok: true as const, leads, total, totalPages, safePage, counts };
  } catch (error) {
    console.error('[AdminLeadsPage]', error);
    return { ok: false as const };
  }
}

export default async function AdminLeadsPage({ searchParams }: Props) {
  await requireAdminSession();

  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const status = parseLeadStatus(params.status);
  const page = parsePage(params.page);
  const where = buildLeadWhere(q, status);
  const result = await getLeadsPageData(where, page);

  if (!result.ok) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Consultas</h1>
            <p className="text-muted text-sm">No se pudieron cargar las consultas.</p>
          </div>
        </div>

        <div className="admin-empty-state admin-table-shell">
          <AlertCircle size={42} />
          <p>No se pudo conectar con la base de datos.</p>
          <p className="text-muted text-sm">Revisa la conexion de Supabase y vuelve a intentar.</p>
        </div>
      </div>
    );
  }

  const { leads, safePage, total, totalPages, counts } = result;
  const firstResult = total === 0 ? 0 : (safePage - 1) * ADMIN_LEADS_PAGE_SIZE + 1;
  const lastResult = Math.min(safePage * ADMIN_LEADS_PAGE_SIZE, total);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Consultas</h1>
          <p className="text-muted text-sm">
            {total === 0
              ? 'No hay consultas para los filtros seleccionados'
              : `Mostrando ${firstResult}-${lastResult} de ${total} consultas`}
          </p>
        </div>
        {total > 0 && (
          <a href={createExportHref({ q, status })} className="btn btn-outline">
            <Download size={18} />
            Exportar CSV
          </a>
        )}
      </div>

      <div className="admin-table-filters-row">
        <Link 
          href={createQueryString({ q, status: 'todas', page: 1 })}
          className={status === 'todas' ? 'is-active' : ''}
        >
          Todas <span className="count">({counts?.all ?? 0})</span>
        </Link>
        <span className="text-muted">|</span>
        <Link 
          href={createQueryString({ q, status: 'pendiente', page: 1 })}
          className={status === 'pendiente' ? 'is-active' : ''}
        >
          Pendientes <span className="count">({counts?.pending ?? 0})</span>
        </Link>
        <span className="text-muted">|</span>
        <Link 
          href={createQueryString({ q, status: 'contactada', page: 1 })}
          className={status === 'contactada' ? 'is-active' : ''}
        >
          Contactadas <span className="count">({counts?.contacted ?? 0})</span>
        </Link>
        <span className="text-muted">|</span>
        <Link 
          href={createQueryString({ q, status: 'cerrada', page: 1 })}
          className={status === 'cerrada' ? 'is-active' : ''}
        >
          Cerradas <span className="count">({counts?.closed ?? 0})</span>
        </Link>
      </div>

      <form className="admin-table-shell" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)' }}>
        <div className="admin-filter-bar">
          <div className="input-group" style={{ flex: '1 1 300px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="lead-search"
                name="q"
                className="input"
                defaultValue={q}
                placeholder="Buscar nombre, email, telefono o propiedad..."
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          {status !== 'todas' && <input type="hidden" name="status" value={status} />}

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary">Buscar</button>
            {q && (
              <Link href="/admin/leads" className="btn btn-outline" title="Limpiar busqueda">X</Link>
            )}
          </div>
        </div>
      </form>

      <div className="admin-table-shell">
        {leads.length === 0 ? (
          <div className="admin-empty-state">
            <Mail size={42} />
            <p>No hay consultas registradas con estos filtros.</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Cliente / Contacto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Propiedad interesada</th>
                  <th>Campaña</th>
                  <th>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const leadStatus = normalizeStatus(lead.status);

                  return (
                    <tr key={lead.id}>
                      <td className="admin-title-cell">
                        <Link href={`/admin/leads/${lead.id}`} style={{ fontWeight: 700, color: 'var(--color-text)', display: 'block' }}>
                          {lead.name}
                        </Link>
                        <div className="text-xs text-muted" style={{ marginTop: 2 }}>{lead.email}</div>
                        {lead.phone && <div className="text-xs text-gold">{lead.phone}</div>}
                        <AdminLeadActions
                          id={lead.id}
                          name={lead.name}
                          email={lead.email}
                          phone={lead.phone}
                          status={leadStatus}
                          updateStatusAction={updateLeadStatus}
                          deleteLeadAction={deleteLead}
                        />
                      </td>
                      <td className="text-sm">
                        {new Date(lead.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <span className={`badge ${LEAD_STATUS_BADGES[leadStatus]}`}>
                          {LEAD_STATUS_LABELS[leadStatus]}
                        </span>
                      </td>
                      <td>
                        {lead.property ? (
                          <Link href={`/propiedades/${lead.property.slug}`} target="_blank" className="text-gold" style={{ textDecoration: 'underline' }}>
                            {lead.property.titleEs}
                          </Link>
                        ) : (
                          <span className="text-muted">Consulta general</span>
                        )}
                      </td>
                      <td className="text-xs text-muted">
                        {lead.utmCampaign ?? '-'}
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <p className="text-xs admin-clamped-text" style={{ margin: 0 }}>
                          {lead.message || '-'}
                        </p>
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
                  href={safePage <= 1 ? createQueryString({ q, status, page: safePage }) : createQueryString({ q, status, page: safePage - 1 })}
                  style={safePage <= 1 ? { pointerEvents: 'none', opacity: 0.45 } : undefined}
                >
                  Anterior
                </Link>
                <Link
                  className="btn btn-outline btn-sm"
                  aria-disabled={safePage >= totalPages}
                  href={safePage >= totalPages ? createQueryString({ q, status, page: safePage }) : createQueryString({ q, status, page: safePage + 1 })}
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
