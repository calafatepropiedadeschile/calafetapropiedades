'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Eye, EyeOff, Layers, Map, Pencil, Star, Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface Props {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  isProject: boolean;
  togglePublishedAction: (id: string, published: boolean) => Promise<void>;
  toggleFeaturedAction: (id: string, featured: boolean) => Promise<void>;
  duplicatePropertyAction: (id: string) => Promise<void>;
  deletePropertyAction: (id: string) => Promise<void>;
}

export default function AdminPropertyActions({
  id,
  title,
  slug,
  published,
  featured,
  isProject,
  togglePublishedAction,
  toggleFeaturedAction,
  duplicatePropertyAction,
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

  function handleFeaturedToggle() {
    startTransition(() => {
      void (async () => {
        await toggleFeaturedAction(id, !featured);
        router.refresh();
      })();
    });
  }

  function handleDuplicate() {
    const confirmed = window.confirm(`Duplicar "${title}" como borrador?`);
    if (!confirmed) return;

    startTransition(() => {
      void duplicatePropertyAction(id);
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
      <Link href={`/propiedades/${slug}`} className="btn btn-outline btn-sm" target="_blank" title="Vista previa (incluye borradores si iniciaste sesion)">
        <Eye size={15} />
        {published ? 'Ver' : 'Previa'}
      </Link>
      {isProject && (
        <Link href={`/proyectos/${slug}`} className="btn btn-outline btn-sm" target="_blank" title="Landing de proyecto">
          <Layers size={15} />
          Proyecto
        </Link>
      )}
      <Link href={`/admin/propiedades/${id}/editar`} className="btn btn-outline btn-sm">
        <Pencil size={15} />
        Editar
      </Link>
      <button
        type="button"
        className={`btn btn-outline btn-sm ${featured ? 'is-active' : ''}`}
        onClick={handleFeaturedToggle}
        disabled={isPending}
        title={featured ? 'Quitar del home' : 'Destacar en home'}
      >
        <Star size={15} />
        {featured ? 'Destacada' : 'Destacar'}
      </button>
      <button type="button" className="btn btn-outline btn-sm" onClick={handlePublishToggle} disabled={isPending}>
        {published ? <EyeOff size={15} /> : <Map size={15} />}
        {published ? 'Ocultar' : 'Publicar'}
      </button>
      <button type="button" className="btn btn-outline btn-sm" onClick={handleDuplicate} disabled={isPending}>
        <Copy size={15} />
        Duplicar
      </button>
      <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isPending}>
        <Trash2 size={15} />
        Eliminar
      </button>
    </div>
  );
}
