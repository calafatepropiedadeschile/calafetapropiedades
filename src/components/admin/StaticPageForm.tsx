'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { StaticPage } from '@prisma/client';

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<StaticPage>;
  pageId?: string;
}

export default function StaticPageForm({ action, defaultValues = {} }: Props) {
  const [activeLangTab, setActiveLangTab] = useState<'es' | 'en'>('es');
  const [formError, setFormError] = useState('');
  const [isPending, startTransition] = useTransition();

  const slug = defaultValues.slug ?? '';
  const previewPath = slug ? `/${slug.replace(/^\//, '')}` : '';

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      void (async () => {
        try {
          await action(formData);
        } catch (error) {
          setFormError(error instanceof Error ? error.message : 'No se pudo guardar la pagina.');
        }
      })();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {formError && (
        <p className="form-error" style={{ fontWeight: 700 }}>
          {formError}
        </p>
      )}

      <section className="admin-form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <h2 className="admin-form-section-title" style={{ margin: 0 }}>Contenido</h2>
          <div className="admin-lang-tabs" style={{ display: 'flex', gap: '4px', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '2px', backgroundColor: 'var(--color-surface-2)' }}>
            <button
              type="button"
              onClick={() => setActiveLangTab('es')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeLangTab === 'es' ? 'var(--color-primary)' : 'transparent',
                color: activeLangTab === 'es' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              Espanol
            </button>
            <button
              type="button"
              onClick={() => setActiveLangTab('en')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeLangTab === 'en' ? 'var(--color-primary)' : 'transparent',
                color: activeLangTab === 'en' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              Ingles
            </button>
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label" htmlFor="page-slug">Slug (URL) *</label>
            <input
              id="page-slug"
              name="slug"
              className="input"
              defaultValue={slug}
              placeholder="privacidad"
              required
            />
            <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
              La pagina se publicara en <strong>/{slug || 'tu-slug'}</strong>.
              Slugs integrados: <code>contacto</code>, <code>nosotros</code>, <code>comprar</code>, <code>arriendos</code>, <code>proyectos</code>, <code>terrenos</code>, <code>vender</code>, <code>topografia</code> actualizan el SEO de esas rutas existentes.
            </p>
          </div>

          <div style={{ display: activeLangTab === 'es' ? 'contents' : 'none' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" htmlFor="page-title-es">Titulo (Espanol) *</label>
              <input id="page-title-es" name="titleEs" className="input" defaultValue={defaultValues.titleEs ?? ''} required />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" htmlFor="page-content-es">Contenido (Espanol) *</label>
              <textarea
                id="page-content-es"
                name="contentEs"
                className="textarea"
                rows={14}
                defaultValue={defaultValues.contentEs ?? ''}
                placeholder="Escribe el contenido. Puedes usar HTML basico (p, h2, ul, li, strong, a) o texto con saltos de linea."
                required
              />
            </div>
          </div>

          <div style={{ display: activeLangTab === 'en' ? 'contents' : 'none' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" htmlFor="page-title-en">Titulo en ingles (opcional)</label>
              <input id="page-title-en" name="titleEn" className="input" defaultValue={defaultValues.titleEn ?? ''} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" htmlFor="page-content-en">Contenido en ingles (opcional)</label>
              <textarea
                id="page-content-en"
                name="contentEn"
                className="textarea"
                rows={14}
                defaultValue={defaultValues.contentEn ?? ''}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">SEO</h2>
        <div className="form-grid form-grid-2">
          <div style={{ display: activeLangTab === 'es' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Titulo SEO (Espanol)</label>
              <input name="seoTitleEs" className="input" maxLength={70} defaultValue={defaultValues.seoTitleEs ?? ''} />
            </div>
            <div className="input-group">
              <label className="input-label">Descripcion SEO (Espanol)</label>
              <textarea name="seoDescriptionEs" className="textarea" rows={3} maxLength={170} defaultValue={defaultValues.seoDescriptionEs ?? ''} />
            </div>
          </div>
          <div style={{ display: activeLangTab === 'en' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Titulo SEO en ingles</label>
              <input name="seoTitleEn" className="input" maxLength={70} defaultValue={defaultValues.seoTitleEn ?? ''} />
            </div>
            <div className="input-group">
              <label className="input-label">Descripcion SEO en ingles</label>
              <textarea name="seoDescriptionEn" className="textarea" rows={3} maxLength={170} defaultValue={defaultValues.seoDescriptionEn ?? ''} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Canonical personalizado</label>
            <input name="customCanonical" className="input" type="url" defaultValue={defaultValues.customCanonical ?? ''} />
          </div>
          <div className="input-group">
            <label className="input-label">Imagen OG</label>
            <input name="ogImage" className="input" type="url" defaultValue={defaultValues.ogImage ?? ''} />
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Publicacion</h2>
        <label className="form-check">
          <input type="checkbox" name="published" defaultChecked={defaultValues.published ?? false} />
          Publicar en el sitio
        </label>
      </section>

      <div className="form-actions">
        <Link href="/admin/paginas" className="btn btn-outline">
          Cancelar
        </Link>
        {previewPath && (
          <Link href={previewPath} className="btn btn-outline" target="_blank">
            Vista previa
          </Link>
        )}
        <button type="submit" className="btn btn-primary btn-lg" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar pagina'}
        </button>
      </div>
    </form>
  );
}
