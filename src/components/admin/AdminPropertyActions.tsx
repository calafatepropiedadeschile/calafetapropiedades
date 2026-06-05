'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Eye, EyeOff, Layers, Map, Pencil, Star, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { getPreferredProjectCanonicalPath } from '@/lib/seo/project-landings';

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
    <div className="row-actions">
      <Link href={`/admin/propiedades/${id}/editar`} className="row-action-link">
        Editar
      </Link>
      <span className="text-muted">|</span>
      <Link href={getPreferredProjectCanonicalPath(slug)} className="row-action-link" target="_blank" title="Vista previa">
        {published ? (isProject ? 'Ver proyecto' : 'Ver') : 'Previa'}
      </Link>
      <span className="text-muted">|</span>
      <button
        type="button"
        className="row-action-link"
        onClick={handleFeaturedToggle}
        disabled={isPending}
      >
        {featured ? 'Quitar destacada' : 'Destacar'}
      </button>
      <span className="text-muted">|</span>
      <button type="button" className="row-action-link" onClick={handlePublishToggle} disabled={isPending}>
        {published ? 'Ocultar' : 'Publicar'}
      </button>
      <span className="text-muted">|</span>
      <button type="button" className="row-action-link" onClick={handleDuplicate} disabled={isPending}>
        Duplicar
      </button>
      <span className="text-muted">|</span>
      <button type="button" className="row-action-link row-action-danger" onClick={handleDelete} disabled={isPending}>
        Eliminar
      </button>
    </div>
  );
}
