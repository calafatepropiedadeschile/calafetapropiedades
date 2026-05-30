'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface Props {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  togglePublishedAction: (id: string, published: boolean) => Promise<void>;
  deletePageAction: (id: string) => Promise<void>;
}

export default function AdminStaticPageActions({
  id,
  slug,
  title,
  published,
  togglePublishedAction,
  deletePageAction,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const publicPath = `/${slug.replace(/^\//, '')}`;

  function handlePublishToggle() {
    startTransition(() => {
      void (async () => {
        await togglePublishedAction(id, !published);
        router.refresh();
      })();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(`Eliminar la pagina "${title}"? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    startTransition(() => {
      void (async () => {
        await deletePageAction(id);
        router.refresh();
      })();
    });
  }

  return (
    <div className="admin-actions-row">
      <Link href={publicPath} className="btn btn-outline btn-sm" target="_blank">
        <Eye size={15} />
        {published ? 'Ver' : 'Previa'}
      </Link>
      <Link href={`/admin/paginas/${id}/editar`} className="btn btn-outline btn-sm">
        <Pencil size={15} />
        Editar
      </Link>
      <button type="button" className="btn btn-outline btn-sm" onClick={handlePublishToggle} disabled={isPending}>
        {published ? <EyeOff size={15} /> : <Eye size={15} />}
        {published ? 'Ocultar' : 'Publicar'}
      </button>
      <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isPending}>
        <Trash2 size={15} />
        Eliminar
      </button>
    </div>
  );
}
