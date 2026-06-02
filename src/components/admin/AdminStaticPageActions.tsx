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
    <div className="row-actions">
      <Link href={`/admin/paginas/${id}/editar`} className="row-action-link">
        Editar
      </Link>
      <span className="text-muted">|</span>
      <Link href={publicPath} className="row-action-link" target="_blank">
        {published ? 'Ver' : 'Previa'}
      </Link>
      <span className="text-muted">|</span>
      <button type="button" className="row-action-link" onClick={handlePublishToggle} disabled={isPending}>
        {published ? 'Ocultar' : 'Publicar'}
      </button>
      <span className="text-muted">|</span>
      <button type="button" className="row-action-link row-action-danger" onClick={handleDelete} disabled={isPending}>
        Eliminar
      </button>
    </div>
  );
}
