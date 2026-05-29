import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { AlertCircle, Mail, Search } from 'lucide-react';
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
    const { total, leads, totalPages, safePage } = await withDatabaseRole('admin', async (db) => {
      const total = await db.lead.count({ where });
      const totalPages = Math.max(1, Math.ceil(total / ADMIN_LEADS_PAGE_SIZE));
      const safePage = Math.min(page, totalPages);
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
          createdAt: true,
          property: {
            select: {
              titleEs: true,
              slug: true,
            },
          },
        },
      });

      return { total, leads, totalPages, safePage };
    });

    return { ok: true as const, leads, total, totalPages, safePage };
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

  const { leads, safePage, total, totalPages } = result;
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
      </div>

      <form className="admin-table-shell" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
        <div className="form-grid form-grid-3">
          <div className="input-group">
            <label className="input-label" htmlFor="lead-search">Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="lead-search"
                name="q"
                className="input"
                defaultValue={q}
                placeholder="Nombre, email, telefono o propiedad"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="lead-status">Estado</label>
            <select id="lead-status" name="status" className="select" defaultValue={status}>
              <option value="todas">Todas</option>
              {LEAD_STATUSES.map((leadStatus) => (
                <option key={leadStatus} value={leadStatus}>
                  {LEAD_STATUS_LABELS[leadStatus]}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ justifyContent: 'flex-end' }}>
            <label className="input-label" aria-hidden="true">&nbsp;</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary">Aplicar filtros</button>
              <Link href="/admin/leads" className="btn btn-outline">Limpiar</Link>
            </div>
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
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Propiedad interesada</th>
                  <th>Mensaje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const leadStatus = normalizeStatus(lead.status);

                  return (
                    <tr key={lead.id}>
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
                        <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{lead.name}</div>
                      </td>
                      <td>
                        <div className="text-xs">{lead.email}</div>
                        {lead.phone && <div className="text-xs text-gold">{lead.phone}</div>}
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
                      <td style={{ maxWidth: '300px' }}>
                        <p className="text-xs admin-clamped-text">
                          {lead.message || '-'}
                        </p>
                      </td>
                      <td>
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
