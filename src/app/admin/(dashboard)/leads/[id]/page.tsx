import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AdminLeadActions from '@/components/admin/AdminLeadActions';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { isCuid } from '@/lib/db/ids';
import { withDatabaseRole } from '@/lib/db/rls';
import { LEAD_STATUSES, type LeadStatus } from '@/features/leads/lead-status';
import { deleteLead, updateLeadStatus } from '../actions';

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
  params: Promise<{ id: string }>;
}

function normalizeStatus(status: string): LeadStatus {
  return LEAD_STATUSES.includes(status as LeadStatus) ? status as LeadStatus : 'pendiente';
}

export default async function AdminLeadDetailPage({ params }: Props) {
  await requireAdminSession();

  const { id } = await params;
  if (!isCuid(id)) notFound();

  const lead = await withDatabaseRole('admin', async (db) => (
    db.lead.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        createdAt: true,
        leadSource: true,
        landingPath: true,
        referrer: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        utmTerm: true,
        property: {
          select: {
            id: true,
            titleEs: true,
            slug: true,
          },
        },
      },
    })
  ));

  if (!lead) notFound();

  const leadStatus = normalizeStatus(lead.status);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/leads" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-sm)' }}>
            <ArrowLeft size={16} />
            Volver a consultas
          </Link>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>{lead.name}</h1>
          <p className="text-muted text-sm">
            Recibida el{' '}
            {new Date(lead.createdAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span className={`badge ${LEAD_STATUS_BADGES[leadStatus]}`} style={{ alignSelf: 'flex-start' }}>
          {LEAD_STATUS_LABELS[leadStatus]}
        </span>
      </div>

      <div className="admin-table-shell" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <div className="form-grid form-grid-2">
          <div>
            <p className="input-label">Email</p>
            <p style={{ color: 'var(--color-text)' }}>{lead.email}</p>
          </div>
          <div>
            <p className="input-label">Teléfono</p>
            <p style={{ color: 'var(--color-text)' }}>{lead.phone ?? 'No indicado'}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p className="input-label">Propiedad de interes</p>
            {lead.property ? (
              <Link href={`/propiedades/${lead.property.slug}`} target="_blank" className="text-gold" style={{ textDecoration: 'underline' }}>
                {lead.property.titleEs}
              </Link>
            ) : (
              <p className="text-muted">Consulta general del sitio</p>
            )}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p className="input-label">Mensaje</p>
            <p style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {lead.message || 'Sin mensaje adicional.'}
            </p>
          </div>
          {(lead.utmCampaign || lead.utmSource || lead.landingPath) && (
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-md)' }}>
              <p className="input-label">Atribución de campaña</p>
              <ul className="text-sm text-muted" style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.7 }}>
                {lead.utmCampaign && <li><strong>Campaña:</strong> {lead.utmCampaign}</li>}
                {lead.utmSource && <li><strong>Origen:</strong> {lead.utmSource}</li>}
                {lead.utmMedium && <li><strong>Medio:</strong> {lead.utmMedium}</li>}
                {lead.utmContent && <li><strong>Contenido:</strong> {lead.utmContent}</li>}
                {lead.utmTerm && <li><strong>Término:</strong> {lead.utmTerm}</li>}
                {lead.landingPath && <li><strong>Landing:</strong> {lead.landingPath}</li>}
                {lead.referrer && <li><strong>Referrer:</strong> {lead.referrer}</li>}
              </ul>
            </div>
          )}
        </div>
      </div>

      <AdminLeadActions
        id={lead.id}
        name={lead.name}
        email={lead.email}
        phone={lead.phone}
        status={leadStatus}
        updateStatusAction={updateLeadStatus}
        deleteLeadAction={deleteLead}
      />
    </div>
  );
}
