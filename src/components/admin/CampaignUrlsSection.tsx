import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import CopyTextButton from '@/components/admin/CopyTextButton';
import type { CampaignPropertyLink } from '@/features/admin/campaigns-guide';

interface Props {
  title: string;
  description: string;
  published: CampaignPropertyLink[];
  drafts: CampaignPropertyLink[];
  emptyMessage: string;
  emptyHref?: string;
}

export default function CampaignUrlsSection({
  title,
  description,
  published,
  drafts,
  emptyMessage,
  emptyHref = '/admin/propiedades',
}: Props) {
  return (
    <section className="admin-table-shell" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-xl)' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 var(--space-xs)' }}>{title}</h2>
        <p className="text-sm text-muted" style={{ margin: 0, lineHeight: 1.6 }}>{description}</p>
      </div>

      {published.length === 0 ? (
        <div className="admin-empty-state compact">
          <p>{emptyMessage}</p>
          <Link href={emptyHref} className="btn btn-primary btn-sm">Ir a propiedades</Link>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Propiedad</th>
              <th>Tipo</th>
              <th>Landing</th>
              <th>Estado</th>
              <th>URL de campana</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {published.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600, color: 'var(--color-text)', maxWidth: 220 }}>
                  {item.titleEs}
                </td>
                <td className="text-sm text-muted">{item.subtypeLabel}</td>
                <td>
                  <code className="text-xs">{item.landingLabel}</code>
                </td>
                <td>
                  <span className="badge badge-green">Publicado</span>
                  {item.featured && (
                    <span className="badge badge-gold" style={{ marginLeft: 6 }}>Destacado</span>
                  )}
                </td>
                <td>
                  <code className="text-xs" style={{ wordBreak: 'break-all' }}>{item.campaignUrl}</code>
                </td>
                <td>
                  <div className="admin-actions-row">
                    <CopyTextButton value={item.campaignUrl} />
                    <Link href={item.campaignUrl.split('?')[0]} target="_blank" className="btn btn-outline btn-sm">
                      <ExternalLink size={14} />
                      Ver
                    </Link>
                    <Link href={`/admin/propiedades/${item.id}/editar`} className="btn btn-outline btn-sm">
                      Editar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {drafts.length > 0 && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
            Borradores (no usar en ads hasta publicar) — {drafts.length}
          </h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Landing</th>
                <th>URL previa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.titleEs}</td>
                  <td className="text-sm text-muted">{item.subtypeLabel}</td>
                  <td><code className="text-xs">{item.landingLabel}</code></td>
                  <td>
                    <code className="text-xs" style={{ wordBreak: 'break-all', opacity: 0.75 }}>{item.campaignUrl}</code>
                  </td>
                  <td>
                    <div className="admin-actions-row">
                      <CopyTextButton value={item.campaignUrl} label="Copiar" />
                      <Link href={`/admin/propiedades/${item.id}/editar`} className="btn btn-outline btn-sm">
                        Publicar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
