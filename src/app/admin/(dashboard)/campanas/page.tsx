import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Megaphone,
  MessageCircle,
} from 'lucide-react';
import CampaignUrlsSection from '@/components/admin/CampaignUrlsSection';
import CopyTextButton from '@/components/admin/CopyTextButton';
import { requireAdminSession } from '@/lib/auth/require-admin';
import {
  getCampaignsGuideData,
  type CampaignChecklistItem,
  type ChecklistStatus,
} from '@/features/admin/campaigns-guide';

const STATUS_META: Record<ChecklistStatus, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  ok: { label: 'Listo', badge: 'badge-green', icon: CheckCircle2 },
  warning: { label: 'Revisar', badge: 'badge-gold', icon: AlertCircle },
  pending: { label: 'Opcional', badge: 'badge-red', icon: CircleDot },
};

function ChecklistRow({ item }: { item: CampaignChecklistItem }) {
  const meta = STATUS_META[item.status];
  const Icon = meta.icon;

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) 0',
        borderBottom: '1px solid var(--color-border-light)',
      }}
    >
      <Icon size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--color-text)' }}>{item.label}</strong>
          <span className={`badge ${meta.badge}`}>{meta.label}</span>
        </div>
        <p className="text-sm text-muted" style={{ margin: '4px 0 0', lineHeight: 1.55 }}>
          {item.description}
        </p>
        {item.href && (
          <Link href={item.href} className="text-gold text-sm" style={{ marginTop: 6, display: 'inline-block' }}>
            Ir a gestionar →
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function AdminCampaignsGuidePage() {
  await requireAdminSession();

  const data = await getCampaignsGuideData().catch(() => null);

  if (!data) {
    return (
      <div className="admin-empty-state">
        <AlertCircle size={42} />
        <p>No se pudo cargar la guia de campañas. Revisa la conexion con la base de datos.</p>
      </div>
    );
  }

  const publishedProjects = data.projectLinks.filter((p) => p.published);
  const draftProjects = data.projectLinks.filter((p) => !p.published);
  const publishedListings = data.listingLinks.filter((p) => p.published);
  const draftListings = data.listingLinks.filter((p) => !p.published);
  const publishedRentals = data.rentalLinks.filter((p) => p.published);
  const draftRentals = data.rentalLinks.filter((p) => !p.published);
  const totalPublishedForAds = publishedProjects.length + publishedListings.length;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Megaphone size={28} style={{ color: 'var(--color-primary)' }} />
            Campanas publicitarias
          </h1>
          <p className="text-muted text-sm" style={{ maxWidth: '720px', lineHeight: 1.6 }}>
            Guia para publicar en Meta, Google u otros canales. Los datos de abajo se actualizan según el estado actual
            del sitio, tus propiedades y las consultas recibidas.
          </p>
          <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
            Actualizado: {data.generatedAt.toLocaleString('es-CL')}
          </p>
        </div>
        <Link href="/admin/leads" className="btn btn-outline">
          Ver consultas
        </Link>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{totalPublishedForAds}</p>
          <p className="admin-stat-label">URLs publicadas para ads</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{publishedProjects.length}</p>
          <p className="admin-stat-label">Proyectos /proyectos</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{publishedListings.length}</p>
          <p className="admin-stat-label">Fichas /propiedades</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{data.stats.publishedRentals}</p>
          <p className="admin-stat-label">Arriendos /arriendos</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{data.stats.leadsWithCampaignLast30Days}</p>
          <p className="admin-stat-label">Consultas con UTM (30 d)</p>
        </div>
      </div>

      <div className="admin-table-shell" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
          Estado del sistema (sincronizado)
        </h2>
        {data.checklist.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-xl)' }}>
        <section className="admin-table-shell" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            Como armar una campaña
          </h2>
          <ol className="text-sm text-muted" style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.75 }}>
            <li>Busca la propiedad en las listas de abajo (proyecto o ficha individual).</li>
            <li>Copia la URL con UTMs y usala como destino del anuncio.</li>
            <li>Usa un mensaje claro: ubicación, precio desde, lotes disponibles.</li>
            <li>El visitante puede consultar por <strong>formulario</strong> o <strong>WhatsApp {data.whatsappDisplay}</strong>.</li>
            <li>Revisa en <Link href="/admin/leads" className="text-gold">Consultas</Link> la columna Campana para medir resultados.</li>
          </ol>

          <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
            <p className="input-label" style={{ marginBottom: 'var(--space-xs)' }}>Plantilla — proyecto de parcelas</p>
            <code className="text-xs" style={{ display: 'block', wordBreak: 'break-all', lineHeight: 1.5 }}>
              {data.utmTemplateProject}
            </code>
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <CopyTextButton value={data.utmTemplateProject} label="Copiar proyecto" />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
            <p className="input-label" style={{ marginBottom: 'var(--space-xs)' }}>Plantilla — terreno o casa individual</p>
            <code className="text-xs" style={{ display: 'block', wordBreak: 'break-all', lineHeight: 1.5 }}>
              {data.utmTemplateProperty}
            </code>
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <CopyTextButton value={data.utmTemplateProperty} label="Copiar ficha" />
            </div>
            <p className="text-xs text-muted" style={{ marginTop: 'var(--space-sm)' }}>
              Cambia <code>utm_campaign</code> por el nombre de tu campaña (sin espacios). Ej: <code>parcela_quillahua_mayo</code>
            </p>
          </div>

          <div style={{ marginTop: 'var(--space-md)' }}>
            <p className="input-label">Parametros UTM recomendados</p>
            <table className="admin-table" style={{ marginTop: 'var(--space-sm)' }}>
              <thead>
                <tr>
                  <th>Parametro</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>utm_source</td><td>meta, google</td></tr>
                <tr><td>utm_medium</td><td>paid</td></tr>
                <tr><td>utm_campaign</td><td>portal_muermos_q2</td></tr>
                <tr><td>utm_content</td><td>video_15s_a</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-table-shell" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            <MessageCircle size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            WhatsApp y formulario
          </h2>
          <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
            No envies el trafico solo a la página de inicio. Usa la landing del proyecto: incluye fotos, precio,
            formulario y boton de WhatsApp.
          </p>
          <ul className="text-sm text-muted" style={{ lineHeight: 1.7, paddingLeft: '1.1rem' }}>
            <li>WhatsApp del sitio: <strong>{data.whatsappDisplay}</strong></li>
            <li>Widget flotante en todas las páginas</li>
            <li>Boton WhatsApp junto al formulario en cada proyecto</li>
            <li>Tras el formulario, redireccion a <code>/gracias</code> para medir conversion</li>
          </ul>
          <p className="text-sm text-muted" style={{ marginTop: 'var(--space-md)' }}>
            <strong>Loteos / proyectos:</strong> <code>/proyectos/slug</code> (6 slugs canonicos de parcelas).
            <br />
            <strong>Terreno o casa suelta:</strong> <code>/propiedades/slug</code>.
            <br />
            <strong>Evita</strong> páginas genéricas como /comprar o /terrenos para anunciar una propiedad concreta.
          </p>
        </section>
      </div>

      <CampaignUrlsSection
        title={`Proyectos de parcelas (${publishedProjects.length} publicados)`}
        description="Los 6 proyectos de parcelas con landing canonica en /proyectos/slug (portal-los-muermos, praderas-del-maule, etc.)."
        published={publishedProjects}
        drafts={draftProjects}
        emptyMessage="No hay proyectos de parcelas publicados. Publica una ficha cuyo slug coincida con un proyecto canonico."
        emptyHref="/admin/propiedades?type=terreno&project=proyectos"
      />

      <CampaignUrlsSection
        title={`Terrenos y casas individuales (${publishedListings.length} publicados)`}
        description="Fichas de propiedad unica: casas y terrenos sueltos. La URL usa /propiedades/slug y se actualiza al crear o editar cada propiedad."
        published={publishedListings}
        drafts={draftListings}
        emptyMessage="No hay casas ni terrenos individuales publicados. Publica una ficha que no sea uno de los 6 slugs de proyecto."
        emptyHref="/admin/propiedades?published=publicadas"
      />

      <CampaignUrlsSection
        title={`Arriendos (${publishedRentals.length} publicados)`}
        description="Propiedades con operación Arriendo. Aparecen en /arriendos y en /propiedades/slug. Usa la misma URL de ficha para campañas de arriendo."
        published={publishedRentals}
        drafts={draftRentals}
        emptyMessage="No hay arriendos publicados. Crea una propiedad con operación Arriendo y publícala."
        emptyHref="/admin/propiedades?operation=arriendo"
      />

      {data.recentCampaignLeads.length > 0 && (
        <section className="admin-table-shell" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
            Últimas consultas con campaña detectada
          </h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Campaña</th>
                <th>Origen</th>
                <th>Propiedad</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCampaignLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="text-sm">
                    {new Date(lead.createdAt).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <Link href={`/admin/leads/${lead.id}`} style={{ fontWeight: 600, textDecoration: 'underline' }}>
                      {lead.name}
                    </Link>
                  </td>
                  <td>{lead.utmCampaign ?? '-'}</td>
                  <td>{lead.utmSource ?? '-'}</td>
                  <td className="text-sm text-muted">{lead.propertyTitle ?? 'General'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
