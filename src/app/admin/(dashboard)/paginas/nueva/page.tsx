import { createStaticPage } from '../actions';
import StaticPageForm from '@/components/admin/StaticPageForm';
import { requireAdminSession } from '@/lib/auth/require-admin';

export default async function NuevaPaginaAdminPage() {
  await requireAdminSession();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Nueva pagina</h1>
          <p className="text-muted text-sm">Crea una pagina informativa o legal para el sitio.</p>
        </div>
      </div>
      <StaticPageForm action={createStaticPage} />
    </div>
  );
}
