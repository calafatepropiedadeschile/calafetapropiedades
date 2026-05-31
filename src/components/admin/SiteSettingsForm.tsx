'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { ImagePlus, Loader2, RotateCcw } from 'lucide-react';
import type { SiteSettingsInput } from '@/features/site-content/site-settings.schemas';
import { updateSiteSettingsAction } from '@/app/admin/(dashboard)/ajustes/actions';

interface Props {
  initialValues: SiteSettingsInput;
}

async function uploadImage(file: File): Promise<string> {
  const payload = new FormData();
  payload.append('file', file);

  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: payload,
  });

  const result = await response.json() as { url?: string; error?: string };

  if (!response.ok || !result.url) {
    throw new Error(result.error ?? 'No se pudo subir la imagen.');
  }

  return result.url;
}

export default function SiteSettingsForm({ initialValues }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState(initialValues);
  const [uploadError, setUploadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof SiteSettingsInput>(key: K, value: SiteSettingsInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSaveMessage('');
    setSaveError('');
  }

  async function handleImageUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('El archivo debe ser una imagen.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const url = await uploadImage(file);
      updateField('discoverImageUrl', url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.set(key, value);
      }
    });

    startTransition(async () => {
      try {
        const result = await updateSiteSettingsAction(formData);
        if (result.success) {
          setSaveMessage('Ajustes guardados correctamente.');
        } else {
          setSaveError(result.error ?? 'Error desconocido');
        }
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'No se pudo guardar la configuracion.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-stack">
      {/* SECCION CONTACTO */}
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Información de Contacto</h2>
        <div className="form-grid form-grid-2">
          <div className="input-group">
            <label className="input-label">WhatsApp (Ventas)</label>
            <input
              className="input"
              type="text"
              placeholder="+56912345678"
              value={values.whatsappNumber ?? ''}
              onChange={(e) => updateField('whatsappNumber', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Teléfono Primario</label>
            <input
              className="input"
              type="text"
              placeholder="+56 9 1234 5678"
              value={values.primaryPhone ?? ''}
              onChange={(e) => updateField('primaryPhone', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Correo Electrónico (Ventas)</label>
            <input
              className="input"
              type="email"
              placeholder="contacto@calafatepropiedades.cl"
              value={values.primaryEmail ?? ''}
              onChange={(e) => updateField('primaryEmail', e.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Dirección visible (footer)</label>
            <input
              className="input"
              type="text"
              placeholder="Opcional. Si queda vacío, se arma con calle, comuna y región."
              value={values.officeAddress ?? ''}
              onChange={(e) => updateField('officeAddress', e.target.value)}
            />
          </div>
        </div>

        <div
          id="direccion-google"
          className="form-grid form-grid-2"
          style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border-light)' }}
        >
          <p className="text-muted" style={{ gridColumn: '1 / -1', margin: 0, fontSize: '0.9rem' }}>
            Dirección estructurada para Google (JSON-LD). También editable en{' '}
            <Link href="/admin/seo#organizacion-google">SEO avanzado</Link>.
          </p>
          <div className="input-group">
            <label className="input-label">Calle y número</label>
            <input
              className="input"
              type="text"
              placeholder="Antonio Varas Nro.140 A"
              value={values.officeStreetAddress ?? ''}
              onChange={(e) => updateField('officeStreetAddress', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Comuna / ciudad</label>
            <input
              className="input"
              type="text"
              placeholder="Los Muermos"
              value={values.officeLocality ?? ''}
              onChange={(e) => updateField('officeLocality', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Región</label>
            <input
              className="input"
              type="text"
              placeholder="Los Lagos"
              value={values.officeRegion ?? ''}
              onChange={(e) => updateField('officeRegion', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* SECCION REDES SOCIALES */}
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Redes Sociales</h2>
        <div className="form-grid form-grid-2">
          <div className="input-group">
            <label className="input-label">URL de Instagram</label>
            <input
              className="input"
              type="url"
              placeholder="https://instagram.com/..."
              value={values.instagramUrl ?? ''}
              onChange={(e) => updateField('instagramUrl', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">URL de Facebook</label>
            <input
              className="input"
              type="url"
              placeholder="https://facebook.com/..."
              value={values.facebookUrl ?? ''}
              onChange={(e) => updateField('facebookUrl', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">URL de LinkedIn</label>
            <input
              className="input"
              type="url"
              placeholder="https://linkedin.com/..."
              value={values.linkedinUrl ?? ''}
              onChange={(e) => updateField('linkedinUrl', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* SECCION INICIO - DESCUBRE */}
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Sección Inicio: Criterio Local</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
          Configura los textos y la imagen de la sección inferior de la página de inicio.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={isUploading || isPending}
          onChange={(event) => void handleImageUpload(event.target.files)}
        />

        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Imagen de la Sección</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="input"
                type="url"
                style={{ flex: 1 }}
                placeholder="/images/sur_chile_proyectos.png"
                value={values.discoverImageUrl ?? ''}
                onChange={(event) => updateField('discoverImageUrl', event.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
              </button>
            </div>
            {uploadError && <p className="form-error">{uploadError}</p>}
          </div>
        </div>
        
        {values.discoverImageUrl && (
          <div className="home-hero-admin-thumb" style={{ marginBottom: '1.5rem', height: '200px' }}>
            <Image
              src={values.discoverImageUrl}
              alt="Vista previa de imagen discover"
              fill
              sizes="320px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="form-grid form-grid-2">
          <div className="input-group">
            <label className="input-label">Subtítulo (Eyebrow)</label>
            <input
              className="input"
              placeholder="Criterio local"
              value={values.discoverEyebrow ?? ''}
              onChange={(e) => updateField('discoverEyebrow', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Título</label>
            <input
              className="input"
              placeholder="Proyectos claros para decisiones importantes"
              value={values.discoverTitle ?? ''}
              onChange={(e) => updateField('discoverTitle', e.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Párrafo 1</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Calafate Propiedades presenta loteos, parcelas y terrenos..."
              value={values.discoverParagraph1 ?? ''}
              onChange={(e) => updateField('discoverParagraph1', e.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Párrafo 2</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Te acompañamos desde la primera consulta..."
              value={values.discoverParagraph2 ?? ''}
              onChange={(e) => updateField('discoverParagraph2', e.target.value)}
            />
          </div>
        </div>

        <details className="admin-form-subsection" style={{ marginTop: 'var(--space-lg)' }}>
          <summary className="admin-form-section-title" style={{ cursor: 'pointer', marginBottom: 'var(--space-md)' }}>
            Textos en inglés (opcional)
          </summary>
          <div className="form-grid form-grid-2">
            <div className="input-group">
              <label className="input-label">Subtítulo EN (Eyebrow)</label>
              <input
                className="input"
                placeholder="Local criteria"
                value={values.discoverEyebrowEn ?? ''}
                onChange={(e) => updateField('discoverEyebrowEn', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Título EN</label>
              <input
                className="input"
                placeholder="Clear projects for important decisions"
                value={values.discoverTitleEn ?? ''}
                onChange={(e) => updateField('discoverTitleEn', e.target.value)}
              />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Párrafo 1 EN</label>
              <textarea
                className="textarea"
                rows={3}
                value={values.discoverParagraph1En ?? ''}
                onChange={(e) => updateField('discoverParagraph1En', e.target.value)}
              />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Párrafo 2 EN</label>
              <textarea
                className="textarea"
                rows={3}
                value={values.discoverParagraph2En ?? ''}
                onChange={(e) => updateField('discoverParagraph2En', e.target.value)}
              />
            </div>
          </div>
        </details>
      </section>

      {saveError && <p className="form-error">{saveError}</p>}
      {saveMessage && (
        <p style={{ color: 'var(--color-success, #15803d)', margin: 0, fontWeight: 600 }}>
          {saveMessage}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={isPending || isUploading}>
          {isPending ? 'Guardando...' : 'Guardar ajustes'}
        </button>
      </div>
    </form>
  );
}
