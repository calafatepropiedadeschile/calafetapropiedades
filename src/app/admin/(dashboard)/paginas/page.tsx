import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import AdminStaticPageActions from '@/components/admin/AdminStaticPageActions';
import { STATIC_PAGE_INTEGRATED_SLUGS } from '@/features/site-content/static-page.schemas';
import { getStaticPageAdminList } from '@/features/site-content/static-page';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { deleteStaticPage, toggleStaticPagePublished } from './actions';

export default async function AdminStaticPagesPage() {
  await requireAdminSession();

  const pages = await getStaticPageAdminList().catch(() => []);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Paginas del sitio</h1>
          <p className="text-muted text-sm">
            Gestiona contenido legal, informativo, landings regionales y textos de catalogo. El SEO de cada slug integrado sobreescribe la ruta publica.
          </p>
        </div>
        <Link href="/admin/paginas/nueva" className="btn btn-primary">
          <Plus size={18} />
          Nueva pagina
        </Link>
      </div>

      <div className="admin-table-shell" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
        <p className="text-sm text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
          Rutas integradas:{' '}
          {STATIC_PAGE_INTEGRATED_SLUGS.map((slug) => (
            <code key={slug} style={{ marginRight: '0.5rem' }}>/{slug}</code>
          ))}
          usan el layout del sitio y toman titulo y contenido desde aqui cuando estan publicadas (incluye landings regionales como <code>parcelas-en-valdivia</code>).
          Rutas de sistema fuera del CMS: <code>/sobre-calafate</code>, <code>/llms.txt</code>, fichas <code>/proyectos/[slug]</code> y <code>/propiedades/[slug]</code>.
          Otras paginas (ej. <code>privacidad</code>) se sirven en <code>/slug</code> sin layout integrado.
        </p>
      </div>

      <div className="admin-table-shell">
        {pages.length === 0 ? (
          <div className="admin-empty-state">
            <FileText size={42} />
            <p>No hay paginas creadas todavia.</p>
            <Link href="/admin/paginas/nueva" className="btn btn-primary">
              Crear la primera
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Titulo</th>
                <th>Tipo</th>
                <th>Publicada</th>
                <th>Actualizada</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const isIntegrated = STATIC_PAGE_INTEGRATED_SLUGS.includes(
                  page.slug as (typeof STATIC_PAGE_INTEGRATED_SLUGS)[number]
                );

                return (
                  <tr key={page.id}>
                    <td className="admin-title-cell">
                      <Link href={`/admin/paginas/${page.id}/editar`} style={{ color: 'var(--color-text)', fontWeight: 600, display: 'block' }}>
                        {page.titleEs}
                      </Link>
                      <code className="text-xs text-muted" style={{ display: 'block', marginTop: 2, background: 'none', padding: 0 }}>/{page.slug}</code>
                      <AdminStaticPageActions
                        id={page.id}
                        slug={page.slug}
                        title={page.titleEs}
                        published={page.published}
                        togglePublishedAction={toggleStaticPagePublished}
                        deletePageAction={deleteStaticPage}
                      />
                    </td>
                    <td>
                      <span className={`badge ${isIntegrated ? 'badge-gold' : 'badge-green'}`}>
                        {isIntegrated ? 'Integrada' : 'CMS'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${page.published ? 'badge-green' : 'badge-red'}`}>
                        {page.published ? 'Si' : 'No'}
                      </span>
                    </td>
                    <td className="text-sm text-muted">
                      {new Date(page.updatedAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
