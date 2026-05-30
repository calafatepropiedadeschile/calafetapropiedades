'use client';

import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { updateSiteSeoSettingsAction } from '@/app/admin/(dashboard)/seo/actions';
import type { SiteSeoSettingsView } from '@/features/site-content/seo-settings';

interface Props {
  initialValues: SiteSeoSettingsView;
}

function listToTextarea(values: string[]) {
  return values.join('\n');
}

export default function SiteSeoSettingsForm({ initialValues }: Props) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      void (async () => {
        try {
          await updateSiteSeoSettingsAction(formData);
          setMessage('Configuracion SEO guardada. La web, robots y sitemap se revalidaron.');
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : 'No se pudo guardar la configuracion SEO.');
        }
      })();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-stack">
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error" style={{ fontWeight: 700 }}>{error}</p>}

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Identidad SEO</h2>
        <div className="form-grid form-grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="seo-site-name">Nombre del sitio</label>
            <input id="seo-site-name" name="siteName" className="input" defaultValue={initialValues.siteName} required maxLength={90} />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-title-template">Plantilla de titulo</label>
            <input id="seo-title-template" name="titleTemplate" className="input" defaultValue={initialValues.titleTemplate} required maxLength={120} />
            <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
              Usa <code>%s</code> para insertar el titulo de cada pagina. Ej: <code>%s | Calafate Propiedades</code>.
            </p>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-default-title-es">Titulo SEO por defecto</label>
            <input id="seo-default-title-es" name="defaultTitleEs" className="input" defaultValue={initialValues.defaultTitleEs} required maxLength={70} />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-default-title-en">Titulo SEO por defecto en ingles</label>
            <input id="seo-default-title-en" name="defaultTitleEn" className="input" defaultValue={initialValues.defaultTitleEn ?? ''} maxLength={70} />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-default-description-es">Descripcion SEO por defecto</label>
            <textarea id="seo-default-description-es" name="defaultDescriptionEs" className="textarea" rows={3} defaultValue={initialValues.defaultDescriptionEs} required maxLength={170} />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-default-description-en">Descripcion SEO por defecto en ingles</label>
            <textarea id="seo-default-description-en" name="defaultDescriptionEn" className="textarea" rows={3} defaultValue={initialValues.defaultDescriptionEn ?? ''} maxLength={170} />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label" htmlFor="seo-keywords">Keywords base</label>
            <textarea
              id="seo-keywords"
              name="keywords"
              className="textarea"
              rows={5}
              defaultValue={listToTextarea(initialValues.keywords)}
              placeholder="Una keyword por linea"
            />
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Indexacion y compartidos</h2>
        <div className="form-grid form-grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="seo-canonical-base-url">Dominio canonico</label>
            <input id="seo-canonical-base-url" name="canonicalBaseUrl" className="input" type="url" defaultValue={initialValues.canonicalBaseUrl} required />
            <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
              Debe ser el dominio final que se enviara a Google Search Console.
            </p>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-default-og-image">Imagen OG por defecto</label>
            <input id="seo-default-og-image" name="defaultOgImage" className="input" type="url" defaultValue={initialValues.defaultOgImage ?? ''} placeholder="https://..." />
          </div>

          <label className="form-check" style={{ alignSelf: 'end' }}>
            <input type="checkbox" name="allowIndexing" defaultChecked={initialValues.allowIndexing} />
            Permitir indexacion en Google
          </label>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label" htmlFor="seo-robots-disallow">Rutas bloqueadas en robots.txt</label>
            <textarea
              id="seo-robots-disallow"
              name="robotsDisallow"
              className="textarea"
              rows={5}
              defaultValue={listToTextarea(initialValues.robotsDisallow)}
              placeholder="/admin/&#10;/api/"
            />
            <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
              Una ruta por linea. Si desactivas indexacion, robots bloqueara todo el sitio.
            </p>
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Google y Meta</h2>
        <div className="form-grid form-grid-3">
          <div className="input-group">
            <label className="input-label" htmlFor="seo-google-verification">Google Search Console</label>
            <input
              id="seo-google-verification"
              name="googleSiteVerification"
              className="input"
              defaultValue={initialValues.googleSiteVerification ?? ''}
              placeholder="Codigo de verificacion"
              maxLength={160}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-google-analytics">Google Analytics 4</label>
            <input
              id="seo-google-analytics"
              name="googleAnalyticsId"
              className="input"
              defaultValue={initialValues.googleAnalyticsId ?? ''}
              placeholder="G-XXXXXXXXXX"
              maxLength={80}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="seo-meta-pixel">Meta Pixel</label>
            <input
              id="seo-meta-pixel"
              name="metaPixelId"
              className="input"
              defaultValue={initialValues.metaPixelId ?? ''}
              placeholder="1234567890"
              maxLength={30}
            />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <a className="btn btn-outline" href="/robots.txt" target="_blank" rel="noreferrer">
          Ver robots.txt
        </a>
        <a className="btn btn-outline" href="/sitemap.xml" target="_blank" rel="noreferrer">
          Ver sitemap
        </a>
        <button type="submit" className="btn btn-primary btn-lg" disabled={isPending}>
          <Save size={18} />
          {isPending ? 'Guardando...' : 'Guardar SEO global'}
        </button>
      </div>
    </form>
  );
}
