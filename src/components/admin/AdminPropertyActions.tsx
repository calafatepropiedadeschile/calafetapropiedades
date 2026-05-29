'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface Props {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  togglePublishedAction: (id: string, published: boolean) => Promise<void>;
  deletePropertyAction: (id: string) => Promise<void>;
}

export default function AdminPropertyActions({
  id,
  title,
  slug,
  published,
  togglePublishedAction,
  deletePropertyAction,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handlePublishToggle() {
    startTransition(() => {
      void (async () => {
        await togglePublishedAction(id, !published);
        router.refresh();
      })();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(`Eliminar "${title}"? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    startTransition(() => {
      void (async () => {
        await deletePropertyAction(id);
        router.refresh();
      })();
    });
  }

  return (
    <div className="admin-actions-row">
      {published && (
        <Link href={`/propiedades/${slug}`} className="btn btn-outline btn-sm" target="_blank">
          <Eye size={15} />
          Ver
        </Link>
      )}
      <Link href={`/admin/propiedades/${id}/editar`} className="btn btn-outline btn-sm">
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
