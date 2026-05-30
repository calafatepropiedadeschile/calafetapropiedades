import { notFound } from 'next/navigation';
import { updateStaticPage } from '../../actions';
import StaticPageForm from '@/components/admin/StaticPageForm';
import { getStaticPageById } from '@/features/site-content/static-page';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { isCuid } from '@/lib/db/ids';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarPaginaAdminPage({ params }: Props) {
  await requireAdminSession();

  const { id } = await params;
  if (!isCuid(id)) notFound();

  const page = await getStaticPageById(id);
  if (!page) notFound();

  const boundUpdate = updateStaticPage.bind(null, id);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Editar pagina</h1>
          <p className="text-muted text-sm">/{page.slug}</p>
        </div>
      </div>
      <StaticPageForm action={boundUpdate} defaultValues={page} pageId={page.id} />
    </div>
  );
}
