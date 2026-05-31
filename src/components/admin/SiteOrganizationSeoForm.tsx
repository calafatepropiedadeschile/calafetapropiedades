'use client';

import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { updateSiteOrganizationSeoAction } from '@/app/admin/(dashboard)/seo/actions';
import type { SiteSettingsInput } from '@/features/site-content/site-settings.schemas';

interface Props {
  initialValues: Pick<
    SiteSettingsInput,
    'officeAddress' | 'officeStreetAddress' | 'officeLocality' | 'officeRegion'
  >;
}

export default function SiteOrganizationSeoForm({ initialValues }: Props) {
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
          await updateSiteOrganizationSeoAction(formData);
          setMessage('Datos de organizacion guardados. JSON-LD y footer actualizados.');
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : 'No se pudo guardar la organizacion.');
        }
      })();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-stack">
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error" style={{ fontWeight: 700 }}>{error}</p>}

      <section className="admin-form-section" id="organizacion-google">
        <h2 className="admin-form-section-title">Organizacion en Google (JSON-LD)</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Estos datos alimentan el schema <code>RealEstateAgent</code> del sitio (telefono, email y redes se editan en{' '}
          <a href="/admin/ajustes">Ajustes globales</a>).
        </p>

        <div className="form-grid form-grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="org-street">Calle y numero</label>
            <input
              id="org-street"
              name="officeStreetAddress"
              className="input"
              defaultValue={initialValues.officeStreetAddress ?? ''}
              placeholder="Antonio Varas Nro.140 A"
              maxLength={120}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="org-locality">Comuna / ciudad</label>
            <input
              id="org-locality"
              name="officeLocality"
              className="input"
              defaultValue={initialValues.officeLocality ?? ''}
              placeholder="Los Muermos"
              maxLength={80}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="org-region">Region</label>
            <input
              id="org-region"
              name="officeRegion"
              className="input"
              defaultValue={initialValues.officeRegion ?? ''}
              placeholder="Los Lagos"
              maxLength={80}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="org-display-address">Direccion visible (footer)</label>
            <input
              id="org-display-address"
              name="officeAddress"
              className="input"
              defaultValue={initialValues.officeAddress ?? ''}
              placeholder="Opcional. Si queda vacio, se arma con los campos de arriba."
              maxLength={240}
            />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          <Save size={18} />
          {isPending ? 'Guardando...' : 'Guardar organizacion'}
        </button>
      </div>
    </form>
  );
}
